import test from 'node:test';
import assert from 'node:assert/strict';
import { mhRatio, simulate, mulberry32, PUBLIC_BOUNCE_PCT, buildPool } from '../src/simulate.js';
import { BLIND } from '../data/blind.js';

test('Mantel-Haenszel ratio of identical strata is the plain ratio', () => {
  assert.equal(mhRatio([{ a: 10, b: 20, n1: 1000, n0: 1000 }]), 0.5);
  assert.ok(Number.isNaN(mhRatio([{ a: 1, b: 0, n1: 10, n0: 10 }])));
});

test('seeded RNG is reproducible', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});

test('bounce share matches the public Table 1 numbers', () => {
  assert.ok(Math.abs(PUBLIC_BOUNCE_PCT - 7.776) < 0.01);
});

test('pool groups texts by gold label', () => {
  const pool = buildPool(BLIND);
  assert.ok(pool.bounce.any.length >= 3);
  assert.ok(pool.gateway_hold.gateway.length >= 2);
});

test('with no leak the what-if pipeline equals gold; a leak pulls Microsoft toward 1', () => {
  const base = simulate(BLIND, { runs: 30, seed: 3 });
  assert.equal(base.summary.leaky.microsoft.auto.median, base.summary.gold.microsoft.auto.median);
  assert.ok(base.summary.gold.microsoft.auto.median < 0.7);
  const leaky = simulate(BLIND, { runs: 30, seed: 3, leakPct: 10, extraMsRejectPct: 2 });
  assert.ok(leaky.summary.leaky.microsoft.auto.median > base.summary.gold.microsoft.auto.median + 0.2);
});

test('same seed gives the same summary', () => {
  const a = simulate(BLIND, { runs: 10, seed: 9 });
  const b = simulate(BLIND, { runs: 10, seed: 9 });
  assert.deepEqual(a.summary, b.summary);
});
