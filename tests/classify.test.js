import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, splitQuoted, classify, classifyKeyword, classifyHeaders, signalOf, LABELS } from '../src/classify.js';
import { evaluate } from '../src/evaluate.js';
import { DEV } from '../data/dev.js';
import { BLIND } from '../data/blind.js';

test('parse reads headers and body', () => {
  const p = parse('From: A <a@x.example>\nSubject: Hi\nAuto-Submitted: auto-replied\n\nBody here');
  assert.equal(p.fromAddr, 'a@x.example');
  assert.equal(p.subject, 'Hi');
  assert.equal(p.headers['auto-submitted'], 'auto-replied');
  assert.equal(p.body, 'Body here');
});

test('text without headers is all body', () => {
  const p = parse('yes lets talk');
  assert.equal(p.body, 'yes lets talk');
  assert.deepEqual(p.headers, {});
});

test('quoted thread is cut at Gmail and Outlook markers', () => {
  assert.equal(splitQuoted('Sure.\n\nOn Tue, Nov 10, 2026 at 9:14 AM Bob <b@x> wrote:\n> unsubscribe').fresh, 'Sure.');
  assert.equal(splitQuoted('Not for us.\n\nFrom: Bob <b@x>\nSent: Monday\nSubject: x').fresh, 'Not for us.');
  assert.equal(splitQuoted('ok\nSent from my iPhone').fresh, 'ok');
});

test('the sender\'s own "unsubscribe" footer in the quote is ignored', () => {
  const r = classify('From: P <p@x.example>\nSubject: Re: hi\n\nYes, keen. Friday?\n\nOn Mon, Nov 9, 2026 at 10:00 AM A <a@s.example> wrote:\n> Reply unsubscribe to stop.');
  assert.equal(r.label, 'interested');
  assert.equal(classifyKeyword('From: P <p@x.example>\nSubject: Re: hi\n\nYes, keen. Friday?\n\nOn Mon, Nov 9, 2026 at 10:00 AM A <a@s.example> wrote:\n> Reply unsubscribe to stop.').label, 'unsubscribe');
});

test('a person who mentions being out of office is still a human reply', () => {
  const r = classify('From: S <s@x.example>\nSubject: RE: ops\n\nI\'m out of office this week but can you send two slots for Tuesday?');
  assert.equal(r.signal, 'human');
  assert.equal(r.label, 'interested');
});

test('Outlook automatic reply is an inbox signal', () => {
  const r = classify('From: M <m@x.example>\nSubject: Automatic reply: hi\nAuto-Submitted: auto-replied\n\nI am travelling and back on 2 December.');
  assert.equal(r.label, 'out_of_office');
  assert.equal(r.inboxSignal, true);
});

test('Gmail style OOO with no header is still caught from wording', () => {
  const r = classify('From: T <t@x.example>\nSubject: Re: idea\n\nThanks for your note! I\'m on leave until January with limited access to email.');
  assert.equal(r.label, 'out_of_office');
  assert.equal(classifyHeaders('From: T <t@x.example>\nSubject: Re: idea\n\nThanks for your note! I\'m on leave until January with limited access to email.').signal, 'human');
});

test('left company and auto acknowledgement', () => {
  assert.equal(classify('From: R <r@x.example>\nSubject: Automatic reply: x\nAuto-Submitted: auto-replied\n\nRohan is no longer with Pinecrest.').label, 'left_company');
  assert.equal(classify('From: S <s@x.example>\nSubject: [Ticket #1] x\nAuto-Submitted: auto-generated\n\nThis is an automated confirmation that we have received your request.').label, 'auto_ack');
});

test('bounce, delay and gateway hold are NOT inbox signals', () => {
  const bounce = classify('From: postmaster@x.example\nSubject: Undeliverable: hi\nContent-Type: multipart/report; report-type=delivery-status\n\n550 5.7.1 Message rejected');
  assert.equal(bounce.label, 'bounce');
  assert.equal(bounce.inboxSignal, false);
  const delay = classify('From: Mail Delivery Subsystem <mailer-daemon@g.example>\nSubject: Delivery Status Notification (Delay)\n\nDelivery has been delayed. Will be retried.');
  assert.equal(delay.label, 'delayed');
  const hold = classify('From: Mail Security <noreply@gw.example>\nSubject: Action required\n\nYour message has been held. Please confirm you are a real sender.');
  assert.equal(hold.label, 'gateway_hold');
  assert.equal(hold.inboxSignal, false);
});

test('keyword baseline files a gateway hold as a human reply (the leak this tool closes)', () => {
  const raw = 'From: Mail Security <noreply@gw.example>\nSubject: Action required\n\nYour message has been held. Please confirm you are a real sender.';
  assert.equal(classifyKeyword(raw).signal, 'human');
});

test('human intents', () => {
  const c = (t) => classify(`From: X <x@y.example>\nSubject: Re: z\n\n${t}`).label;
  assert.equal(c('take me off your list'), 'unsubscribe');
  assert.equal(c('STOP'), 'unsubscribe');
  assert.equal(c('Not me, try our head of growth.'), 'referral');
  assert.equal(c('Budget is frozen, ping me in April?'), 'not_now');
  assert.equal(c('No thanks, we built this in house.'), 'not_interested');
  assert.equal(c('How did you get my email?'), 'other');
});

test('every gold label in both sets is a known label', () => {
  const known = new Set(Object.values(LABELS).flat());
  for (const it of [...DEV, ...BLIND]) assert.ok(known.has(it.label), `${it.id} ${it.label}`);
  assert.equal(signalOf('gateway_hold'), 'pre_inbox');
});

test('ids are unique and blind set size is frozen at 40', () => {
  const ids = [...DEV, ...BLIND].map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(BLIND.length, 40);
});

test('all data uses reserved .example domains (no real people)', () => {
  for (const it of [...DEV, ...BLIND]) {
    const emails = (it.raw.match(/[\w.+-]+@[\w.-]+/g) ?? []).map((e) => e.replace(/\.+$/, ''));
    for (const e of emails) assert.match(e, /\.example$/, `${it.id}: ${e}`);
  }
});

test('evaluate counts the confusion matrix correctly', () => {
  const r = evaluate(BLIND, 'inboxSignal');
  const total = Object.values(r.confusion).reduce((s, row) => s + Object.values(row).reduce((a, b) => a + b, 0), 0);
  assert.equal(total, BLIND.length);
  assert.ok(r.signalCorrect <= r.n);
});
