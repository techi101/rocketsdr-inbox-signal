// Monte Carlo: how reply labelling changes a "link vs no link" readout.
// Ground truth rates come from the PUBLIC table in RocketSDR's blog post
// "Do Links in Cold Emails Hurt Deliverability?" (7 Nov 2026, Table 3 and Table 1).
// Everything else (gateway hold rate, delay rate, extra rejections) is an
// assumption the visitor can change with a slider. No RocketSDR data is used.
import { METHODS, signalOf } from './classify.js';

// percent of delivered emails, from the post's Table 3 (human = any - automatic
// for the gateway row, where the post gives only "any" and "automatic").
export const PUBLIC_RATES = {
  microsoft: { link: { human: 0.39, auto: 0.19 }, nolink: { human: 0.84, auto: 0.46 } },
  google: { link: { human: 2.16, auto: 0.89 }, nolink: { human: 1.72, auto: 0.62 } },
  gateway: { link: { human: 0.75, auto: 1.13 }, nolink: { human: 0.85, auto: 0.69 } },
};
// Table 1: 138,530 sends, 127,757 delivered -> 7.78% bounced.
export const PUBLIC_BOUNCE_PCT = (100 * (138530 - 127757)) / 138530;

export const DEFAULTS = {
  campaigns: 40,
  sendsPerCell: 400, // per campaign, per provider, per arm
  bouncePct: PUBLIC_BOUNCE_PCT,
  extraMsRejectPct: 0, // extra policy rejections at Microsoft when the email has a link
  gatewayHoldPct: 0.5, // assumption: held/verification notices at gateway domains
  delayPct: 0.3, // assumption: delay warnings, all providers
  leakPct: 0, // what-if: share of bounce/delay/hold notices a pipeline files as automatic replies
  runs: 200,
  seed: 7,
};

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function poisson(lambda, rnd) {
  if (lambda <= 0) return 0;
  if (lambda > 30) {
    // normal approximation for speed
    const u = 1 - rnd();
    const v = rnd();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return Math.max(0, Math.round(lambda + z * Math.sqrt(lambda)));
  }
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do { k += 1; p *= rnd(); } while (p > L);
  return k - 1;
}

// Pre-compute what each method says about every labelled reply, grouped by gold label.
export function buildPool(items) {
  const pool = {};
  for (const it of items) {
    const preds = { gold: it.label };
    for (const [k, m] of Object.entries(METHODS)) preds[k] = m.fn(it.raw).label;
    (pool[it.label] ??= { any: [], microsoft: [], google: [], gateway: [] });
    pool[it.label].any.push(preds);
    pool[it.label][it.provider]?.push(preds);
  }
  return pool;
}

const AUTO_MIX = [['out_of_office', 0.7], ['left_company', 0.15], ['auto_ack', 0.15]];
const HUMAN_MIX = [['interested', 0.25], ['not_interested', 0.25], ['not_now', 0.15], ['referral', 0.1], ['unsubscribe', 0.15], ['other', 0.1]];

function pick(mix, rnd) {
  let r = rnd();
  for (const [l, w] of mix) { if ((r -= w) <= 0) return l; }
  return mix[mix.length - 1][0];
}

function sampleText(pool, label, provider, rnd) {
  const g = pool[label];
  if (!g) return null;
  const arr = g[provider]?.length ? g[provider] : g.any;
  return arr[Math.floor(rnd() * arr.length)];
}

// Mantel-Haenszel rate ratio across strata: sum(a*n0/N) / sum(b*n1/N)
export function mhRatio(strata) {
  let num = 0;
  let den = 0;
  for (const s of strata) {
    const N = s.n1 + s.n0;
    if (N <= 0) continue;
    num += (s.a * s.n0) / N;
    den += (s.b * s.n1) / N;
  }
  return den > 0 ? num / den : NaN;
}

export function simulateOnce(pool, opts, rnd) {
  const methods = ['gold', ...Object.keys(METHODS), 'leaky'];
  // strata[method][provider][metric] = [{a,b,n1,n0}]
  const strata = Object.fromEntries(methods.map((m) => [m, { microsoft: { human: [], auto: [] }, google: { human: [], auto: [] }, gateway: { human: [], auto: [] } }]));
  for (let c = 0; c < opts.campaigns; c++) {
    const campaignLift = Math.exp((rnd() - 0.5) * 0.8); // campaigns differ in audience quality
    for (const prov of ['microsoft', 'google', 'gateway']) {
      const cell = {};
      for (const arm of ['link', 'nolink']) {
        const sends = opts.sendsPerCell;
        let bouncePct = opts.bouncePct;
        if (prov === 'microsoft' && arm === 'link') bouncePct += opts.extraMsRejectPct;
        const nBounce = poisson((sends * bouncePct) / 100, rnd);
        const delivered = Math.max(0, sends - nBounce);
        const r = PUBLIC_RATES[prov][arm];
        const events = [];
        for (let i = 0; i < nBounce; i++) events.push('bounce');
        const nHuman = poisson((delivered * r.human * campaignLift) / 100, rnd);
        for (let i = 0; i < nHuman; i++) events.push(pick(HUMAN_MIX, rnd));
        const nAuto = poisson((delivered * r.auto) / 100, rnd); // auto replies ignore copy and audience mood
        for (let i = 0; i < nAuto; i++) events.push(pick(AUTO_MIX, rnd));
        const nDelay = poisson((sends * opts.delayPct) / 100, rnd);
        for (let i = 0; i < nDelay; i++) events.push('delayed');
        if (prov === 'gateway') {
          const nHold = poisson((sends * opts.gatewayHoldPct) / 100, rnd);
          for (let i = 0; i < nHold; i++) events.push('gateway_hold');
        }
        const counts = Object.fromEntries(methods.map((m) => [m, { human: 0, auto: 0, bounce: 0 }]));
        for (const goldLabel of events) {
          const t = sampleText(pool, goldLabel, prov, rnd);
          if (!t) continue;
          const leaks = signalOf(t.gold) === 'pre_inbox' && rnd() * 100 < opts.leakPct;
          for (const m of methods) {
            const lab = m === 'leaky' ? (leaks ? 'out_of_office' : t.gold) : t[m];
            const sig = signalOf(lab);
            if (lab === 'bounce') counts[m].bounce += 1;
            if (sig === 'human') counts[m].human += 1;
            else if (sig === 'auto_inbox') counts[m].auto += 1;
          }
        }
        cell[arm] = { sends, counts };
      }
      for (const m of methods) {
        // each method also decides its own "delivered" denominator from what it called a bounce
        const n1 = cell.link.sends - cell.link.counts[m].bounce;
        const n0 = cell.nolink.sends - cell.nolink.counts[m].bounce;
        for (const metric of ['human', 'auto']) {
          strata[m][prov][metric].push({ a: cell.link.counts[m][metric], b: cell.nolink.counts[m][metric], n1, n0 });
        }
      }
    }
  }
  const out = {};
  for (const m of methods) {
    out[m] = {};
    for (const prov of ['microsoft', 'google', 'gateway']) {
      out[m][prov] = { human: mhRatio(strata[m][prov].human), auto: mhRatio(strata[m][prov].auto) };
    }
  }
  return out;
}

function quantile(sorted, q) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function simulate(items, userOpts = {}) {
  const opts = { ...DEFAULTS, ...userOpts };
  const pool = buildPool(items);
  const rnd = mulberry32(opts.seed);
  const runs = [];
  for (let i = 0; i < opts.runs; i++) runs.push(simulateOnce(pool, opts, rnd));
  const methods = Object.keys(runs[0]);
  const summary = {};
  for (const m of methods) {
    summary[m] = {};
    for (const prov of ['microsoft', 'google', 'gateway']) {
      summary[m][prov] = {};
      for (const metric of ['human', 'auto']) {
        const vals = runs.map((r) => r[m][prov][metric]).filter(Number.isFinite).sort((a, b) => a - b);
        summary[m][prov][metric] = { median: quantile(vals, 0.5), lo: quantile(vals, 0.05), hi: quantile(vals, 0.95) };
      }
    }
  }
  return { opts, summary };
}
