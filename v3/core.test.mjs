import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normaliseRoute, routeInfo, sampleRoute, bridgeStep, waterState, replayKey} from './core.mjs';
test('nested input is bounded, finite and sampled', () => {
 const raw = Array.from({length: 3000}, (_, i) => [[Math.sin(i / 2999 * Math.PI * 2) * 100, 1, Math.cos(i / 2999 * Math.PI * 2) * 100], [0, 0, 1]]);
 const pts = normaliseRoute(raw), r = routeInfo(pts);
 assert.equal(pts.length, 500); assert.ok(r.length > 400 && r.length < 500);
 assert.deepEqual(sampleRoute(r, 0), pts[0]); assert.deepEqual(sampleRoute(r, 1e5), pts.at(-1));
 assert.throws(() => sampleRoute(r, NaN));
});
test('reject malformed and degenerate routes', () => {
 assert.throws(() => normaliseRoute({0: [1, 2]}));
 assert.throws(() => normaliseRoute(Array(12).fill([0, 0, 0])));
 assert.throws(() => normaliseRoute(Array(12).fill([Infinity, 0, 1])));
});
test('several exact bridge solutions work', () => {
 for (const solution of [[4, 4], [3, 3, 2], [2, 2, 2, 2]]) {
  let p = [], result;
  for (const n of solution) { result = bridgeStep(p, n); assert.equal(result.accepted, true); p = result.pieces; }
  assert.equal(result.complete, true);
 }
});
test('overfill is rejected without consuming pieces', () => {
 const p = [3, 3]; assert.equal(bridgeStep(p, 3).accepted, false); assert.deepEqual(p, [3, 3]);
 assert.throws(() => bridgeStep([], 9));
});
test('both companion and pipe connections are needed', () => {
 assert.equal(waterState([3, 1, 2, 0], false).solved, false);
 assert.equal(waterState([0, 2, 0, 2], true).solved, false);
 assert.equal(waterState([3, 1, 2, 0], true).solved, true);
 assert.throws(() => waterState([3, 1, 9, 0], true));
});
test('replay records separate assist and biome', () => {
 assert.notEqual(replayKey('rabc', 0, true), replayKey('rabc', 0, false));
 assert.notEqual(replayKey('rabc', 0, true), replayKey('rabc', 1, true));
 assert.throws(() => replayKey('../bad', 0, true));
});
