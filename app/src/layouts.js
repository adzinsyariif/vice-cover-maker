export const LAYOUT_LIST = [
  { id: "hero-duo", name: "Hero Duo", panels: 3 },
  { id: "hero-trio", name: "Hero Trio", panels: 4 },
  { id: "diptych", name: "Diptych", panels: 3 }
];

function intersectLines(p1, p2, p3, p4) {
  const d = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0]);
  const t = ((p3[0] - p1[0]) * (p4[1] - p3[1]) - (p3[1] - p1[1]) * (p4[0] - p3[0])) / d;
  return [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
}

function heroDuoPoster() {
  const hA = [0, 0.6];
  const hB = [1, 0.54];
  const vA = [0.63, 0];
  const vB = [0.53, 1];
  const cross = intersectLines(hA, hB, vA, vB);
  return [
    [[0, 0], vA, cross, hA],
    [vA, [1, 0], hB, cross],
    [hA, cross, hB, [1, 1], [0, 1]]
  ];
}

function heroDuoWide() {
  const vA = [0.56, 0];
  const vB = [0.62, 1];
  const hA = [0.4, 0.5];
  const hB = [1, 0.47];
  const cross = intersectLines(vA, vB, hA, hB);
  return [
    [[0, 0], vA, vB, [0, 1]],
    [vA, [1, 0], hB, cross],
    [cross, hB, [1, 1], vB]
  ];
}

function heroTrioPoster() {
  const hA = [0, 0.62];
  const hB = [1, 0.56];
  const topA = [0.64, 0];
  const topB = [0.54, 1];
  const crossTop = intersectLines(hA, hB, topA, topB);
  const botA = [0.44, 0];
  const botB = [0.38, 1];
  const crossBot = intersectLines(hA, hB, botA, botB);
  return [
    [[0, 0], topA, crossTop, hA],
    [topA, [1, 0], hB, crossTop],
    [hA, crossBot, botB, [0, 1]],
    [crossBot, hB, [1, 1], botB]
  ];
}

function heroTrioWide() {
  const vA = [0.54, 0];
  const vB = [0.6, 1];
  const h1A = [0, 0.36];
  const h1B = [1, 0.31];
  const h2A = [0, 0.68];
  const h2B = [1, 0.63];
  const c1 = intersectLines(vA, vB, h1A, h1B);
  const c2 = intersectLines(vA, vB, h2A, h2B);
  return [
    [[0, 0], vA, vB, [0, 1]],
    [vA, [1, 0], h1B, c1],
    [c1, h1B, h2B, c2],
    [c2, h2B, [1, 1], vB]
  ];
}

function diptychPoster() {
  const hA = [0, 0.85];
  const hB = [1, 0.82];
  const dA = [0.62, 0];
  const dB = [0.38, 1];
  const cross = intersectLines(hA, hB, dA, dB);
  return [
    [[0, 0], dA, cross, hA],
    [dA, [1, 0], hB, cross],
    [hA, cross, hB, [1, 1], [0, 1]]
  ];
}

function diptychWide() {
  const dA = [0.44, 0];
  const dB = [0.3, 1];
  const aA = [0.87, 0];
  const aB = [0.9, 1];
  return [
    [[0, 0], dA, dB, [0, 1]],
    [dA, aA, aB, dB],
    [aA, [1, 0], [1, 1], aB]
  ];
}

export function getPanels(layoutId, wide) {
  if (layoutId === "hero-duo") return wide ? heroDuoWide() : heroDuoPoster();
  if (layoutId === "hero-trio") return wide ? heroTrioWide() : heroTrioPoster();
  return wide ? diptychWide() : diptychPoster();
}

export function polygonArea(poly) {
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(sum) / 2;
}

export function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

export function polygonBounds(poly) {
  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  for (const p of poly) {
    if (p[0] < minX) minX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] > maxY) maxY = p[1];
  }
  return { minX: minX, minY: minY, maxX: maxX, maxY: maxY, w: maxX - minX, h: maxY - minY };
}
