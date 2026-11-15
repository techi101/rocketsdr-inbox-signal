// node scripts/eval.js dev|blind   -> prints the scorecard for every method
import { DEV } from '../data/dev.js';
import { BLIND } from '../data/blind.js';
import { METHODS } from '../src/classify.js';
import { evaluate, fmtPct } from '../src/evaluate.js';

const which = process.argv[2] ?? 'dev';
const items = which === 'blind' ? BLIND : DEV;
console.log(`Set: ${which} (${items.length} synthetic replies)  run at ${new Date().toISOString()}`);
for (const key of Object.keys(METHODS)) {
  const r = evaluate(items, key);
  console.log(`\n== ${METHODS[key].name}`);
  console.log(`signal correct (human / auto inbox / pre inbox): ${fmtPct(r.signalCorrect, r.n)}`);
  console.log(`label correct (12 labels): ${fmtPct(r.labelCorrect, r.n)}`);
  console.log(`pre-inbox notices counted as an inbox signal: ${r.preCountedAsInbox}`);
  console.log(`human replies counted as auto: ${r.humanCountedAsAuto} | auto replies counted as human: ${r.autoCountedAsHuman}`);
  console.log('confusion (rows = gold, cols = predicted):', JSON.stringify(r.confusion));
  if (key === 'inboxSignal') for (const e of r.errors) console.log(`  miss ${e.id}: gold ${e.gold} -> got ${e.got}`);
}
