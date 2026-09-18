/** Original Nabigha v3 domain primitives. No renderer, network, assets or storage side effects.
 * This reviewable foundation is not wired into the published 2.2.3 page.
 * The complete playable 3.0 preview is supplied separately with its full source.
 */
export const VERSION = '3.0.0-preview.1';
const finite3 = p => Array.isArray(p) && p.length === 3 && p.every(n => Number.isFinite(n) && Math.abs(n) < 1e7);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

// Supports the ACTUAL attached schema [[position3, vector3], ...] and plain position3.
export function normaliseRoute(raw) {
  if (!Array.isArray(raw) || raw.length < 12 || raw.length > 10000) throw Error('ROUTE_POINTS');
  let pts = raw.map(p => Array.isArray(p?.[0]) ? p[0] : p);
  if (!pts.every(finite3)) throw Error('ROUTE_VECTOR');
  const step = Math.max(1, Math.ceil(pts.length / 512));
  pts = pts.filter((_, i) => i % step === 0);
  const bounds = [0, 1, 2].map(k => [Math.min(...pts.map(p => p[k])), Math.max(...pts.map(p => p[k]))]);
  const span = Math.max(bounds[0][1] - bounds[0][0], bounds[2][1] - bounds[2][0]);
  if (span < 1e-5) throw Error('DEGENERATE');
  const scale = 140 / span, heightScale = Math.min(scale, 6 / Math.max(1, bounds[1][1] - bounds[1][0]));
  pts = pts.map(p => [(p[0] - (bounds[0][0] + bounds[0][1]) / 2) * scale, (p[1] - bounds[1][0]) * heightScale, (p[2] - (bounds[2][0] + bounds[2][1]) / 2) * scale]);
  pts = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[2] - pts[i - 1][2]) > .035);
  if (pts.length < 12) throw Error('DEGENERATE');
  return pts;
}
export function routeInfo(pts) {
  if (!Array.isArray(pts) || pts.length < 2 || !pts.every(finite3)) throw Error('ROUTE_VECTOR');
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(...pts[i].map((n, k) => n - pts[i - 1][k])));
  const length = lens.at(-1);
  if (length < 10 || length > 1500) throw Error('ROUTE_LENGTH');
  let hash = 2166136261;
  for (const c of JSON.stringify(pts)) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
  return {pts: pts.map(p => [...p]), lens, length, id: 'r' + hash.toString(16)};
}
export function sampleRoute(r, distance) {
  if (!Number.isFinite(distance)) throw Error('DISTANCE');
  const d = clamp(distance, 0, r.length);
  let lo = 0, hi = r.lens.length - 1;
  while (lo < hi) { const m = (lo + hi) >> 1; if (r.lens[m] < d) lo = m + 1; else hi = m; }
  const i = clamp(lo, 1, r.pts.length - 1), a = r.pts[i - 1], b = r.pts[i];
  const f = (d - r.lens[i - 1]) / Math.max(.0001, r.lens[i] - r.lens[i - 1]);
  return a.map((n, k) => n + (b[k] - n) * f);
}
export function bridgeStep(pieces, length) {
  if (!Array.isArray(pieces) || !pieces.every(n => [2, 3, 4].includes(n)) || ![2, 3, 4].includes(length)) throw Error('BEAM');
  const total = pieces.reduce((a, b) => a + b, 0);
  if (total > 8) throw Error('BRIDGE');
  if (total === 8 || total + length > 8) return {accepted: false, pieces: [...pieces], complete: total === 8};
  const next = [...pieces, length];
  return {accepted: true, pieces: next, complete: total + length === 8};
}
// Two roles: the AI companion holds the pump; the player connects corner pipes.
// This does not implement real multiplayer or rate religious observance.
export function waterState(rotations, noorHolding) {
  if (!Array.isArray(rotations) || rotations.length !== 4 || !rotations.every(n => Number.isInteger(n) && n >= 0 && n < 4) || typeof noorHolding !== 'boolean') throw Error('PIPES');
  const nodes = [[26, 0], [29, 0], [29, -3], [32, -3], [32, 0]], dirs = [[0, -3], [3, 0], [0, 3], [-3, 0]];
  const edges = i => i === 0 ? [3, 1] : [rotations[i - 1], (rotations[i - 1] + 1) % 4];
  const wet = new Set(noorHolding ? [0] : []), queue = [...wet];
  while (queue.length) {
    const i = queue.shift();
    for (const e of edges(i)) {
      const j = nodes.findIndex(p => p[0] === nodes[i][0] + dirs[e][0] && p[1] === nodes[i][1] + dirs[e][1]);
      if (j >= 0 && !wet.has(j) && edges(j).includes((e + 2) % 4)) { wet.add(j); queue.push(j); }
    }
  }
  return {wet: [...wet], solved: wet.has(4) && edges(4).includes(1)};
}
export function replayKey(routeId, biome, assist) {
  if (!/^r[0-9a-f]+$/.test(routeId) || ![0, 1, 2].includes(biome) || typeof assist !== 'boolean') throw Error('REPLAY_CONTEXT');
  return `${routeId}-b${biome}-a${Number(assist)}`;
}
