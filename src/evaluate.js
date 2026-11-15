// Scoring helpers shared by the eval script, the tests and the web page.
import { METHODS, signalOf } from './classify.js';

export const SIGNALS = ['human', 'auto_inbox', 'pre_inbox'];

export function evaluate(items, methodKey) {
  const fn = METHODS[methodKey].fn;
  const confusion = Object.fromEntries(SIGNALS.map((g) => [g, Object.fromEntries(SIGNALS.map((s) => [s, 0]))]));
  let labelOk = 0;
  let signalOk = 0;
  const errors = [];
  for (const it of items) {
    const out = fn(it.raw);
    const gold = signalOf(it.label);
    confusion[gold][out.signal] += 1;
    if (out.label === it.label) labelOk += 1;
    if (out.signal === gold) signalOk += 1;
    if (out.label !== it.label) errors.push({ id: it.id, gold: it.label, got: out.label, goldSignal: gold, gotSignal: out.signal });
  }
  const n = items.length;
  return {
    method: methodKey,
    n,
    signalCorrect: signalOk,
    labelCorrect: labelOk,
    // the two leaks that bias an auto reply based inbox estimate
    preCountedAsInbox: confusion.pre_inbox.human + confusion.pre_inbox.auto_inbox,
    humanCountedAsAuto: confusion.human.auto_inbox,
    autoCountedAsHuman: confusion.auto_inbox.human,
    confusion,
    errors,
  };
}

export function fmtPct(k, n) {
  return n ? `${k}/${n} (${((100 * k) / n).toFixed(0)}%)` : '0/0';
}
