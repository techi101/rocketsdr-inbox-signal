// Inbox Signal: sort replies to cold email into three signals.
//   human       a person read it and wrote back (inbox signal, depends on copy too)
//   auto_inbox  fired by the recipient's own mailbox (OOO, left company, auto ack):
//               an inbox signal that does not depend on the copy
//   pre_inbox   machine notice from a server or gateway BEFORE the inbox
//               (bounce, delay, quarantine / sender verification): NOT an inbox signal
// Pure functions, no dependencies, same file runs in the browser and in Node.

export const LABELS = {
  human: ['interested', 'referral', 'not_now', 'not_interested', 'unsubscribe', 'other'],
  auto_inbox: ['out_of_office', 'left_company', 'auto_ack'],
  pre_inbox: ['bounce', 'delayed', 'gateway_hold'],
};

export const SIGNAL_OF = Object.fromEntries(
  Object.entries(LABELS).flatMap(([sig, labs]) => labs.map((l) => [l, sig]))
);

export function signalOf(label) {
  return SIGNAL_OF[label] ?? 'human';
}

// ---------- parsing ----------
export function parse(raw) {
  const text = String(raw ?? '').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  const headers = {};
  let i = 0;
  // header block only if the first line looks like a header
  if (/^[A-Za-z][\w-]*:\s/.test(lines[0] ?? '')) {
    for (; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') { i++; break; }
      const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
      if (m) headers[m[1].toLowerCase()] = m[2];
      else break;
    }
  }
  const body = lines.slice(i).join('\n').trim();
  const { fresh, quoted } = splitQuoted(body);
  const from = headers['from'] ?? '';
  const fromAddr = (from.match(/<([^>]+)>/)?.[1] ?? from).trim().toLowerCase();
  return { headers, subject: headers['subject'] ?? '', from, fromAddr, body, fresh, quoted };
}

// Cut the reply at the first quoted-thread marker. Text below it was written by
// the SENDER (often containing "unsubscribe" or "out of office"), so rules must
// never read it as the prospect's words.
const QUOTE_MARKERS = [
  /^On .{4,200}wrote:\s*$/m,
  /^-{2,}\s*Original Message\s*-{2,}/im,
  /^From: .+\n(Sent|Date): /m,
  /^>/m,
];
export function splitQuoted(body) {
  let cut = body.length;
  for (const re of QUOTE_MARKERS) {
    const m = re.exec(body);
    if (m && m.index < cut) cut = m.index;
  }
  let fresh = body.slice(0, cut);
  fresh = fresh.replace(/^\s*Sent from my (iPhone|iPad|Android|phone).*$/gim, '').trim();
  return { fresh, quoted: body.slice(cut).trim() };
}

// ---------- rule tables ----------
const SYSTEM_SENDER = /(mailer-daemon|postmaster|mail delivery|quarantine|no-?reply|verify@|mail security|secure gateway|email protection)/i;
const SMTP_CODE = /\b[245]\.\d{1,3}\.\d{1,3}\b/;

const HOLD = /(quarantin|held (by|for)|has been held|pending (approval|review|until)|awaiting (sender )?verification|sender verification|verify your (email|address)|confirm (that )?you(?:'re| are) (a )?(real|human)|to release it|requires moderator approval)/i;
const DELAY = /(delivery (status notification \(delay\)|delayed|is delayed)|has been delayed|warning message only|message delayed|will (continue|keep) (trying|to be attempted)|continue to be attempted|will be retried|retry for|has not been delivered for)/i;
const FAIL = /(undeliverable|delivery has failed|couldn't be delivered|could not be delivered|wasn't delivered|returned to sender|permanent error|failed permanently|address not found|delivery status notification \(failure\)|mail delivery failed|message blocked|\b5\.\d{1,3}\.\d{1,3}\b)/i;

const AUTO_SUBJECT = /^(automatic reply|auto(matic)?[- ]?(reply|response)|automatische antwort|réponse automatique|respuesta automática|risposta automatica|out of (the )?office|absence du bureau|fuera de la oficina|fuori sede|abwesenheit|no longer at)\b/i;

const LEFT = /(no longer (with|at|work(ing)? (at|for))|is no longer|(has|have) left\b|\bi left\b|moved on from|my last day (was|at)|this address will be closed|employee is no longer)/i;
const ACK = /(we(?:'ve| have) received your (request|message|email|enquiry|inquiry)|request received|\bticket #?\d+|automated (confirmation|response|reply)|this is an automat(ed|ic) (reply|response|confirmation|message)|automatic reply to confirm|confirm we got it|will be (routed|assigned)|inbox is checked|thank(s| you) for contacting|cannot respond to all|may not be able to reply)/i;
const OOO = /(out of (the )?office|on (annual |parental |maternity |paternity |sick )?leave|on vacation|on holiday|public holiday|\baway (at|on|until|till|from)|travell?ing|out sick|limited access to (my )?e-?mail|no access to (my )?e-?mail|delayed response|responses will be delayed|will (be back|return|reply|respond|get back)[^.]{0,40}(back|return|monday|tomorrow|when|once|on \d|asap|as soon)|nicht im büro|wieder erreichbar|absente?\b|absent du bureau|fuori ufficio|fuera de la oficina|de vacaciones|ausente)/i;
const TEMPLATE = /(thank(s| you) for (your|getting in touch)|not checking (my )?e-?mail|for (anything )?urgent|please (contact|reach|direct|write to)|this mailbox|not (being )?monitored|in case of emergency|en cas d'urgence|vielen dank für ihre nachricht|merci de contacter|gracias por su mensaje|para asuntos urgentes)/i;

// Cues that a person typed this in response to the pitch.
const HUMAN_CUES = [
  [/\b(can|could) you\b/i, 'asks the sender to do something'],
  [/\b(send (me|over)|share (a few|some)|book(ed)?|slots?|calendar)\b/i, 'asks for times or material'],
  [/\b(let'?s (talk|chat|speak)|happy to (chat|talk|take a look)|keen|interested|sounds (useful|good|great))\b/i, 'shows interest'],
  [/\b(demo|pricing|call|case study|deck)\b/i, 'mentions a next step'],
  [/(^|\n)\s*(yes|yep|sure|haan)\b/i, 'opens with yes'],
  [/\b(saw this|this is timely|on my phone)\b/i, 'reacts to this email'],
  [/\b(follow up in|check back|reach (back )?out in|ping me|circle back|maybe (later|next)|next quarter)\b/i, 'asks for a later follow up'],
  [/\b(not interested|no thanks|not for us|not looking|remove me|take me off|unsubscribe|stop emailing|don'?t contact)\b/i, 'answers the pitch'],
  [/\b(not the right person|wrong person|looping in|adding \w+ (from|who)|not me\b)/i, 'points to a colleague'],
];

// ---------- intent for human replies ----------
const INTENT_RULES = [
  ['unsubscribe', /(\bunsubscribe\b|remove me|take me off|stop emailing|stop contacting|don'?t (contact|email) me|opt (me )?out|^\s*stop\s*\.?\s*$)/im],
  ['referral', /(not the right person|wrong person|looping in|adding \w+ (from|who)|\bcc'?ing\b|forward(ing)? (this )?to|reach out to|\btry (him|her|them)\b|talk to|\bnot me\b|she'?s the right person|he'?s the right person)/i],
  ['not_now', /(not (right now|a priority|now)|bad timing|follow up in|check back|reach (back )?out in|ping me|circle back|next (quarter|year|month)|\bin q[1-4]\b|budget'?s? (is )?frozen|maybe later|locked into|just renewed|couple of months)/i],
  ['not_interested', /(not interested|no thanks|no thank you|not for us|not looking|not relevant|isn'?t relevant|happy with (it|our)|already (use|have|signed)|signed with|in house|do not follow up|no need to follow up|don'?t need)/i],
  ['interested', /(interested|keen|happy to (chat|talk|take a look)|let'?s (talk|chat|speak)|sounds (useful|good|great)|send (me|over)|pricing|demo|\bcall\b|slots?|\bbook|calendar|(^|\n)\s*(yes|yep|sure|haan)\b|does .{1,30} work|\bworks\b)/i],
];

export function humanIntent(fresh) {
  for (const [label, re] of INTENT_RULES) {
    const m = re.exec(fresh);
    if (m) return { label, match: m[0].trim() };
  }
  return { label: 'other', match: null };
}

// ---------- main classifier ----------
export function classify(raw) {
  const p = parse(raw);
  const evidence = [];
  const ev = (side, why, match) => evidence.push({ side, why, match: match ?? null });
  const all = `${p.subject}\n${p.fresh}`;

  // 1. Machine notices that come from a server or gateway, not the recipient's mailbox.
  const ct = p.headers['content-type'] ?? '';
  const isDsn = /report-type=delivery-status/i.test(ct);
  const sysSender = SYSTEM_SENDER.test(p.from);
  const code = SMTP_CODE.exec(p.fresh);
  const machine = isDsn || sysSender || !!code;
  if (isDsn) ev('pre', 'delivery status report header (RFC 3464)', ct);
  if (sysSender) ev('pre', 'sent by a mail server or gateway, not a person', p.fromAddr);
  if (code) ev('pre', 'SMTP status code in the text', code[0]);

  if (machine) {
    const hold = HOLD.exec(all);
    const delay = DELAY.exec(all);
    const fail = FAIL.exec(all);
    let label = null;
    if (hold) { label = 'gateway_hold'; ev('pre', 'message held or waiting for verification', hold[0]); }
    else if (delay && !/permanent/i.test(all)) { label = 'delayed'; ev('pre', 'delivery delayed, still retrying', delay[0]); }
    else if (fail) { label = 'bounce'; ev('pre', 'delivery failed', fail[0]); }
    if (label) return finish(p, label, evidence, false);
  }

  // 2. Recipient-mailbox automatic reply vs a person typing.
  let auto = 0;
  let human = 0;
  const as = p.headers['auto-submitted'];
  if (as && !/^no$/i.test(as.trim())) { auto += 3; ev('auto', 'Auto-Submitted header (RFC 3834)', `Auto-Submitted: ${as}`); }
  if (p.headers['x-autoreply'] || p.headers['x-autorespond']) { auto += 3; ev('auto', 'auto-reply header', 'X-Autoreply'); }
  const subj = AUTO_SUBJECT.exec(p.subject.trim());
  if (subj) { auto += 3; ev('auto', 'auto-reply subject line', subj[0]); }
  const left = LEFT.exec(p.fresh);
  if (left) { auto += 3; ev('auto', 'says the person has left', left[0]); }
  const ack = ACK.exec(p.fresh);
  if (ack) { auto += 2; ev('auto', 'automated acknowledgement wording', ack[0]); }
  const ooo = OOO.exec(p.fresh);
  if (ooo) { auto += 1; ev('auto', 'away or out of office wording', ooo[0]); }
  const tpl = TEMPLATE.exec(p.fresh);
  if (tpl) { auto += 1; ev('auto', 'template phrasing', tpl[0]); }

  for (const [re, why] of HUMAN_CUES) {
    const m = re.exec(p.fresh);
    if (m) { human += 2; ev('human', why, m[0].trim()); }
  }

  if ((auto > human && auto >= 2) || (ooo && human === 0)) {
    let label = 'out_of_office';
    if (left) label = 'left_company';
    else if (ooo) label = 'out_of_office';
    else if (ack) label = 'auto_ack';
    const review = human > 0 && auto - human <= 1;
    return finish(p, label, evidence, review);
  }

  const intent = humanIntent(p.fresh);
  if (intent.match) ev('human', `intent: ${intent.label.replace('_', ' ')}`, intent.match);
  const review = auto > 0 && human - auto <= 1;
  return finish(p, intent.label, evidence, review);
}

function finish(p, label, evidence, needsReview) {
  const signal = signalOf(label);
  return {
    label,
    signal,
    inboxSignal: signal !== 'pre_inbox',
    needsReview,
    evidence,
    parsed: p,
  };
}

// ---------- baselines ----------
// Keyword rules of the kind many teams start with: daemon sender = bounce,
// any "auto / out of office / leave" word anywhere = OOO, else a human reply.
// No quote stripping, no gateway class.
export function classifyKeyword(raw) {
  const p = parse(raw);
  const text = `${p.subject}\n${p.body}`;
  let label;
  if (/(mailer-daemon|postmaster)/i.test(p.from)) label = 'bounce';
  else if (p.headers['auto-submitted'] || /(out of (the )?office|automatic reply|auto-?reply|on leave|vacation|away until)/i.test(text)) label = 'out_of_office';
  else if (/(unsubscribe|remove me|take me off|\bstop\b)/i.test(text)) label = 'unsubscribe';
  else if (/(not interested|no thanks)/i.test(text)) label = 'not_interested';
  else if (/(interested|yes|call|demo)/i.test(text)) label = 'interested';
  else label = 'other';
  return { label, signal: signalOf(label) };
}

// Headers only: RFC 3834 Auto-Submitted for auto replies, RFC 3464 delivery
// reports or daemon senders for bounces. Everything else counted as human.
export function classifyHeaders(raw) {
  const p = parse(raw);
  let label = 'other';
  if (/report-type=delivery-status/i.test(p.headers['content-type'] ?? '') || /(mailer-daemon|postmaster)/i.test(p.from)) label = 'bounce';
  else if (p.headers['auto-submitted'] && !/^no$/i.test(p.headers['auto-submitted'])) label = 'out_of_office';
  return { label, signal: signalOf(label) };
}

export const METHODS = {
  inboxSignal: { name: 'Inbox Signal (this tool)', fn: classify },
  keyword: { name: 'Keyword rules', fn: classifyKeyword },
  headers: { name: 'Headers only', fn: classifyHeaders },
};
