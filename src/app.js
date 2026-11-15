import { classify, classifyKeyword, classifyHeaders, signalOf, METHODS } from './classify.js';
import { evaluate } from './evaluate.js';
import { simulate } from './simulate.js';
import { DEV } from '../data/dev.js';
import { BLIND } from '../data/blind.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SETS = { blind: BLIND, dev: DEV };
const SIG_NAME = { human: 'Human reply', auto_inbox: 'Mailbox auto reply', pre_inbox: 'Pre-inbox notice' };
const SIG_CLASS = { human: 'sig-human', auto_inbox: 'sig-auto', pre_inbox: 'sig-pre' };
const nice = (l) => l.replace(/_/g, ' ').replace('auto ack', 'auto acknowledgement').replace('gateway hold', 'gateway hold / verify');
const sigChip = (sig, text) => `<span class="sig ${SIG_CLASS[sig]}">${esc(text ?? SIG_NAME[sig])}</span>`;

// ---------- theme ----------
$('#themeBtn').addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = isDark ? 'light' : 'dark';
  try { localStorage.setItem('is-theme', root.dataset.theme); } catch (e) { /* storage blocked */ }
});

// ---------- tabs ----------
let simRan = false;
$$('.tab').forEach((t) => t.addEventListener('click', () => {
  $$('.tab').forEach((x) => x.classList.toggle('active', x === t));
  $$('.panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${t.dataset.tab}`));
  if (t.dataset.tab === 'readout' && !simRan) runSim();
}));

// ---------- precompute ----------
function enrich(items) {
  return items.map((it) => {
    const out = classify(it.raw);
    return { ...it, out, kw: classifyKeyword(it.raw), hd: classifyHeaders(it.raw) };
  });
}
const DATA = { blind: enrich(BLIND), dev: enrich(DEV) };

// ---------- hero ----------
(function hero() {
  const a = evaluate(BLIND, 'inboxSignal');
  const k = evaluate(BLIND, 'keyword');
  $('#heroStats').innerHTML = `
    <div class="stat"><div class="k">${a.signalCorrect}/${a.n}</div><div class="l">blind replies in the right bucket <span class="muted">(keyword rules: ${k.signalCorrect}/${k.n})</span></div></div>
    <div class="stat"><div class="k">${k.preCountedAsInbox + k.humanCountedAsAuto + k.autoCountedAsHuman} <small>vs ${a.preCountedAsInbox + a.humanCountedAsAuto + a.autoCountedAsHuman}</small></div><div class="l">bucket leaks on the blind set, keyword rules vs this tool</div></div>
    <div class="stat"><div class="k">7.8% <small>vs ≤1.13%</small></div><div class="l">sends that bounced vs auto reply rate, in RocketSDR's public links study</div></div>`;
})();

// ---------- inbox ----------
const state = { set: 'blind', filter: 'all', selected: null, paste: false };
const AV_COLORS = ['#2a78d6', '#0f9f6e', '#6250d6', '#e34948', '#c98500', '#1baf7a', '#d55181', '#475467'];
function avatar(name) {
  const clean = (name || '?').replace(/<.*>/, '').replace(/["']/g, '').trim();
  const parts = clean.split(/[\s@._-]+/).filter(Boolean);
  const ini = ((parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')).toUpperCase();
  let h = 0;
  for (const c of clean) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `<span class="avatar" style="background:${AV_COLORS[h % AV_COLORS.length]}">${esc(ini)}</span>`;
}
function displayName(from) {
  const m = from.match(/^"?([^"<]+?)"?\s*</);
  return (m ? m[1] : from).trim() || 'Unknown sender';
}

function renderChips() {
  const items = DATA[state.set];
  const count = (sig) => items.filter((x) => x.out.signal === sig).length;
  const disagree = items.filter((x) => x.kw.signal !== x.out.signal).length;
  const chips = [
    ['all', 'All', items.length], ['human', 'Human', count('human')], ['auto_inbox', 'Auto reply', count('auto_inbox')],
    ['pre_inbox', 'Not inbox', count('pre_inbox')], ['disagree', 'Keyword rules disagree', disagree],
  ];
  $('#filterChips').innerHTML = chips.map(([k, l, n]) => `<button class="chip ${state.filter === k ? 'active' : ''}" data-f="${k}">${l}<span class="n">${n}</span></button>`).join('');
  $$('#filterChips .chip').forEach((c) => c.addEventListener('click', () => { state.filter = c.dataset.f; renderChips(); renderList(); }));
}

function visible() {
  const items = DATA[state.set];
  if (state.filter === 'all') return items;
  if (state.filter === 'disagree') return items.filter((x) => x.kw.signal !== x.out.signal);
  return items.filter((x) => x.out.signal === state.filter);
}

function renderList() {
  const items = visible();
  $('#msgList').innerHTML = items.length ? items.map((it) => {
    const p = it.out.parsed;
    const snip = p.fresh.replace(/\s+/g, ' ').slice(0, 90);
    const dis = it.kw.signal !== it.out.signal ? '<span class="flag">keyword rules disagree</span>' : '';
    return `<li class="msg ${state.selected === it.id && !state.paste ? 'active' : ''}" data-id="${it.id}" tabindex="0">
      ${avatar(displayName(p.from))}
      <div style="min-width:0">
        <div class="msg-top"><span class="msg-from">${esc(displayName(p.from))}</span><span class="muted small">${esc(it.provider)}</span></div>
        <div class="msg-subj">${esc(p.subject)}</div>
        <div class="msg-snip">${esc(snip)}</div>
        <div class="msg-tags">${sigChip(it.out.signal, nice(it.out.label))}${dis}</div>
      </div></li>`;
  }).join('') : '<li class="empty">No replies in this filter.</li>';
  $$('#msgList .msg').forEach((li) => {
    const go = () => { state.selected = li.dataset.id; state.paste = false; renderList(); renderDetail(); if (innerWidth < 1020) $('#detail').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    li.addEventListener('click', go);
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  });
}

function highlight(text, evidence) {
  let html = esc(text);
  const seen = new Set();
  for (const e of evidence) {
    if (!e.match || e.match.length < 2 || seen.has(e.match)) continue;
    seen.add(e.match);
    const m = esc(e.match);
    const i = html.toLowerCase().indexOf(m.toLowerCase());
    if (i >= 0 && !html.slice(0, i).match(/<mark>[^<]*$/)) html = `${html.slice(0, i)}<mark>${html.slice(i, i + m.length)}</mark>${html.slice(i + m.length)}`;
  }
  return html;
}

function verdictHtml(raw, gold) {
  const out = classify(raw);
  const kw = classifyKeyword(raw);
  const hd = classifyHeaders(raw);
  const p = out.parsed;
  const hdrs = Object.entries(p.headers).filter(([k]) => !['from', 'subject'].includes(k));
  const mark = (lab) => (gold ? (lab === gold ? '<span class="ok">✓</span>' : '<span class="bad">✗</span>') : '');
  const row = (name, lab) => `<tr><td>${esc(name)}</td><td>${sigChip(signalOf(lab), nice(lab))}</td><td>${mark(lab)}</td></tr>`;
  return `
    <div class="mail-head">${avatar(displayName(p.from))}
      <div style="min-width:0">
        <div class="mail-subj">${esc(p.subject || '(no subject)')}</div>
        <div class="mail-from">${esc(p.from || 'No From header')}</div>
        ${hdrs.length ? `<div class="hdrs">${hdrs.map(([k, v]) => `<span class="hdr">${esc(k)}: ${esc(v)}</span>`).join('')}</div>` : ''}
      </div>
    </div>
    <div class="mail-body">${highlight(p.fresh, out.evidence)}${p.quoted ? `<span class="quoted"><span class="quoted-label">Quoted thread, ignored by the rules</span>${esc(p.quoted)}</span>` : ''}</div>
    <div class="verdict">
      <div class="card">
        <h3>Verdict</h3>
        <div class="verdict-main">${sigChip(out.signal)}${out.needsReview ? '<span class="flag flag-review">close call, review</span>' : ''}</div>
        <div class="verdict-label">${esc(nice(out.label))}</div>
        <div class="inbox-yn ${out.inboxSignal ? 'yn-yes' : 'yn-no'}">${out.inboxSignal ? '● Counts as proof the email reached an inbox' : '● Not an inbox signal: keep it out of placement metrics'}</div>
        <h3>Evidence</h3>
        <ul class="evid">${out.evidence.length ? out.evidence.map((e) => `<li><span class="side side-${e.side}">${e.side}</span><span>${esc(e.why)}${e.match ? ` <q>${esc(e.match)}</q>` : ''}</span></li>`).join('') : '<li><span class="side side-human">human</span><span>No machine or auto-reply evidence, so treated as a person.</span></li>'}</ul>
      </div>
      <div class="card">
        <h3>Same reply, three methods</h3>
        <table class="cmp">
          ${gold ? `<tr><td><b>True label</b></td><td>${sigChip(signalOf(gold), nice(gold))}</td><td></td></tr>` : ''}
          ${row('Inbox Signal', out.label)}${row('Keyword rules', kw.label)}${row('Headers only', hd.label)}
        </table>
        <p class="muted small" style="margin:10px 0 0">Keyword rules: daemon sender = bounce, any "out of office / auto reply / leave" word = OOO, no quote cutting. Headers only: RFC 3834 / RFC 3464 headers and nothing else.</p>
      </div>
    </div>`;
}

function renderDetail() {
  const el = $('#detail');
  if (state.paste) {
    el.innerHTML = `
      <h3 style="font-size:16px;margin-bottom:4px">Paste a reply</h3>
      <p class="muted" style="margin:0 0 10px">Headers are optional. Put them at the top (From:, Subject:, Auto-Submitted:), then a blank line, then the body. Runs in your browser; nothing is sent anywhere.</p>
      <textarea class="paste-area" id="pasteText" spellcheck="false">From: Jordan Lee <jordan@example.example>
Subject: RE: Your outbound

I'm out of office till Thursday but this is interesting. Can you send pricing?

From: You <you@sender.example>
Sent: Monday, 9 November 2026 10:00
Subject: Your outbound
Reply unsubscribe to opt out.</textarea>
      <div class="paste-actions">
        <button class="btn btn-primary" id="runPaste">Classify reply</button>
        <button class="btn btn-ghost" id="clearPaste">Clear</button>
      </div>
      <div id="pasteOut" style="margin-top:16px"></div>`;
    const run = () => { $('#pasteOut').innerHTML = verdictHtml($('#pasteText').value, null); };
    $('#runPaste').addEventListener('click', run);
    $('#clearPaste').addEventListener('click', () => { $('#pasteText').value = ''; $('#pasteOut').innerHTML = ''; $('#pasteText').focus(); });
    run();
    return;
  }
  const it = DATA[state.set].find((x) => x.id === state.selected);
  el.innerHTML = it ? verdictHtml(it.raw, it.label) : '<div class="empty">Pick a reply on the left.</div>';
}

$('#pasteBtn').addEventListener('click', () => { state.paste = true; renderList(); renderDetail(); if (innerWidth < 1020) $('#detail').scrollIntoView({ behavior: 'smooth' }); });
$$('#setSeg .seg-btn').forEach((b) => b.addEventListener('click', () => {
  state.set = b.dataset.set; state.filter = 'all';
  $$('#setSeg .seg-btn').forEach((x) => x.classList.toggle('active', x === b));
  state.selected = DATA[state.set].find((x) => x.kw.signal !== x.out.signal)?.id ?? DATA[state.set][0].id;
  state.paste = false; renderChips(); renderList(); renderDetail();
}));
state.selected = DATA.blind.find((x) => x.id === 'b03')?.id ?? DATA.blind[0].id;
renderChips(); renderList(); renderDetail();

// ---------- accuracy ----------
let accSet = 'blind';
function renderAccuracy() {
  const items = SETS[accSet];
  const rs = Object.keys(METHODS).map((k) => evaluate(items, k));
  const best = Math.max(...rs.map((r) => r.signalCorrect));
  $('#methodCards').innerHTML = rs.map((r) => `
    <div class="card mcard ${r.method === 'inboxSignal' ? 'best' : ''}">
      <div class="name">${esc(METHODS[r.method].name)}${r.signalCorrect === best ? '<span class="pill pill-muted">top</span>' : ''}</div>
      <div class="big">${r.signalCorrect}/${r.n} <small>right bucket</small></div>
      <div class="meter"><span style="width:${(100 * r.signalCorrect) / r.n}%"></span></div>
      <div class="kv">
        <span>Exact label (12 labels)</span><b>${r.labelCorrect}/${r.n}</b>
        <span>Notices counted as inbox signal</span><b class="${r.preCountedAsInbox ? 'warn' : ''}">${r.preCountedAsInbox}</b>
        <span>Auto replies counted as human</span><b class="${r.autoCountedAsHuman ? 'warn' : ''}">${r.autoCountedAsHuman}</b>
        <span>Human replies counted as auto</span><b class="${r.humanCountedAsAuto ? 'warn' : ''}">${r.humanCountedAsAuto}</b>
      </div>
    </div>`).join('');
  const sigs = ['human', 'auto_inbox', 'pre_inbox'];
  const short = { human: 'Human', auto_inbox: 'Auto', pre_inbox: 'Notice' };
  $('#confusions').innerHTML = rs.map((r) => `
    <div class="card"><h3>${esc(METHODS[r.method].name)}</h3>
      <table class="cm"><thead><tr><th></th>${sigs.map((s) => `<th>${short[s]}</th>`).join('')}</tr></thead>
      <tbody>${sigs.map((g) => `<tr><th class="row">${short[g]}</th>${sigs.map((s) => {
        const v = r.confusion[g][s];
        return `<td class="${g === s ? 'diag' : v ? 'off' : 'zero'}" title="true ${SIG_NAME[g]}, predicted ${SIG_NAME[s]}">${v}</td>`;
      }).join('')}</tr>`).join('')}</tbody></table>
      ${r.method !== 'inboxSignal' && r.errors.filter((e) => e.goldSignal !== e.gotSignal).length ? `<ul class="errlist">${r.errors.filter((e) => e.goldSignal !== e.gotSignal).slice(0, 4).map((e) => `<li>${e.id}: ${nice(e.gold)} → ${nice(e.got)}</li>`).join('')}</ul>` : ''}
    </div>`).join('');
}
$$('#accSeg .seg-btn').forEach((b) => b.addEventListener('click', () => {
  accSet = b.dataset.set; $$('#accSeg .seg-btn').forEach((x) => x.classList.toggle('active', x === b)); renderAccuracy();
}));
renderAccuracy();

// ---------- readout ----------
let metric = 'auto';
let lastSim = null;
const sliders = [['leak', 'leakOut', '%'], ['rej', 'rejOut', '%'], ['hold', 'holdOut', '%'], ['delay', 'delayOut', '%']];
for (const [id, out, unit] of sliders) {
  const upd = () => { $(`#${out}`).textContent = `${$(`#${id}`).value}${unit}`; };
  $(`#${id}`).addEventListener('input', upd); upd();
}
$$('#metricSeg .seg-btn').forEach((b) => b.addEventListener('click', () => {
  metric = b.dataset.metric; $$('#metricSeg .seg-btn').forEach((x) => x.classList.toggle('active', x === b));
  if (lastSim) drawChart(lastSim);
}));
$('#simForm').addEventListener('submit', (e) => { e.preventDefault(); runSim(); });
$('#tableToggle').addEventListener('click', () => {
  const t = $('#chartTable'); const hidden = t.classList.toggle('hidden');
  $('#chart').classList.toggle('hidden', !hidden);
  $('#tableToggle').textContent = hidden ? 'Show table' : 'Show chart';
});

function runSim() {
  simRan = true;
  const btn = $('#runBtn');
  btn.disabled = true; btn.textContent = 'Running…';
  setTimeout(() => {
    lastSim = simulate(BLIND, {
      leakPct: +$('#leak').value, extraMsRejectPct: +$('#rej').value,
      gatewayHoldPct: +$('#hold').value, delayPct: +$('#delay').value,
    });
    drawChart(lastSim);
    btn.disabled = false; btn.textContent = 'Run 200 simulations';
  }, 30);
}

const ROWS = [
  ['gold', 'True labels', 'var(--truth)'],
  ['inboxSignal', 'Inbox Signal', 'var(--brand)'],
  ['keyword', 'Keyword rules', 'var(--brand)'],
  ['headers', 'Headers only', 'var(--brand)'],
  ['leaky', 'What-if leak', 'var(--leak)'],
];
const PROVS = [['microsoft', 'Microsoft 365'], ['google', 'Google'], ['gateway', 'Security gateway']];
const f2 = (x) => (Number.isFinite(x) ? x.toFixed(2) : 'n/a');

function drawChart(sim) {
  const S = sim.summary;
  $('#chartTitle').textContent = `Link ÷ no link ratio, ${metric === 'auto' ? 'automatic replies' : 'human replies'}`;
  const ms = S.gold.microsoft[metric].median;
  const ml = S.leaky.microsoft[metric].median;
  const o = sim.opts;
  $('#insight').innerHTML = metric === 'auto'
    ? `With a <b>${o.leakPct}%</b> leak${o.extraMsRejectPct ? ` and <b>${o.extraMsRejectPct}%</b> extra link rejections at Microsoft` : ''}, the Microsoft auto reply ratio reads <b>${f2(ml)}</b> instead of the true <b>${f2(ms)}</b>${ml > ms + 0.15 ? ': the link penalty looks smaller than it is.' : '.'}`
    : `Human reply ratios: gateway holds filed as human replies (what the keyword rules do) nudge the gateway row; Microsoft true ${f2(ms)}, keyword ${f2(S.keyword.microsoft[metric].median)}.`;
  let maxX = 2;
  for (const [k] of ROWS) for (const [p] of PROVS) maxX = Math.max(maxX, S[k][p][metric].hi || 0);
  maxX = Math.ceil(maxX * 2) / 2;
  const W = 340; const L = 112; const R = 14; const top = 34; const rowH = 32; const H = top + ROWS.length * rowH + 26;
  const x = (v) => L + ((W - L - R) * Math.min(v, maxX)) / maxX;
  const ticks = []; for (let t = 0; t <= maxX + 1e-9; t += maxX > 3 ? 1 : 0.5) ticks.push(t);
  $('#chart').innerHTML = PROVS.map(([p, pname]) => {
    const truth = S.gold[p][metric].median;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${pname} ratios">
      <text class="panel-title" x="0" y="16">${pname}</text>
      ${ticks.map((t) => `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top - 4}" y2="${H - 22}"/><text x="${x(t)}" y="${H - 6}" text-anchor="middle">${t}</text>`).join('')}
      <line class="one" x1="${x(1)}" x2="${x(1)}" y1="${top - 6}" y2="${H - 22}"/>
      <line class="truthline" x1="${x(truth)}" x2="${x(truth)}" y1="${top - 4}" y2="${H - 22}"/>
      ${ROWS.map(([k, name, col], i) => {
        const v = S[k][p][metric]; const y = top + i * rowH + rowH / 2;
        const tip = `${pname} · ${name}: ${f2(v.median)} (5 to 95%: ${f2(v.lo)} to ${f2(v.hi)})`;
        return `<g class="row" data-tip="${esc(tip)}">
          <rect x="0" y="${y - rowH / 2}" width="${W}" height="${rowH}" fill="transparent"/>
          <text x="0" y="${y + 4}">${name}</text>
          <line x1="${x(v.lo)}" x2="${x(v.hi)}" y1="${y}" y2="${y}" stroke="${col}" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>
          <circle cx="${x(v.median)}" cy="${y}" r="5.5" fill="${col}" stroke="var(--surface)" stroke-width="2"/>
        </g>`;
      }).join('')}
    </svg>`;
  }).join('');
  const tt = $('#tooltip');
  $$('#chart .row').forEach((g) => {
    g.addEventListener('mousemove', (e) => { tt.textContent = g.dataset.tip; tt.style.opacity = 1; tt.style.left = `${e.clientX + 12}px`; tt.style.top = `${e.clientY + 12}px`; });
    g.addEventListener('mouseleave', () => { tt.style.opacity = 0; });
  });
  $('#chartTable').innerHTML = `<table class="dtable"><thead><tr><th>Method</th>${PROVS.map(([, n]) => `<th>${n}</th>`).join('')}</tr></thead><tbody>
    ${ROWS.map(([k, name]) => `<tr><td>${name}</td>${PROVS.map(([p]) => { const v = S[k][p][metric]; return `<td>${f2(v.median)} <span class="muted">(${f2(v.lo)} to ${f2(v.hi)})</span></td>`; }).join('')}</tr>`).join('')}
  </tbody></table>`;
}
