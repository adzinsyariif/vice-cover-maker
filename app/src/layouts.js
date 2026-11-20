/* Panel geometry for Vice Cover Studio.
   Every layout is built from shared boundary points so that
   neighbouring panels reuse the exact same coordinates and the
   polygons tile the poster with no gaps and no overlaps. */

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function pointOn(p, q, t) {
  return [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
}

function heroDuoPoster(W, H) {
  const topLeft = [0, 0];
  const topRight = [W, 0];
  const heroLowRight = [W, H * 0.52];
  const heroLowLeft = [0, H * 0.6];
  const mid = pointOn(heroLowLeft, heroLowRight, 0.5);
  const foot = [W * 0.46, H];
  const hero = [topLeft, topRight, heroLowRight, heroLowLeft];
  const lowerLeft = [heroLowLeft, mid, foot, [0, H]];
  const lowerRight = [mid, heroLowRight, [W, H], foot];
  return [hero, lowerLeft, lowerRight];
}

function heroDuoWide(W, H) {
  const topLeft = [0, 0];
  const heroTopRight = [W * 0.62, 0];
  const heroBotRight = [W * 0.54, H];
  const mid = pointOn(heroTopRight, heroBotRight, 0.5);
  const rightMid = [W, H * 0.46];
  const hero = [topLeft, heroTopRight, heroBotRight, [0, H]];
  const upperRight = [heroTopRight, [W, 0], rightMid, mid];
  const lowerRight = [mid, rightMid, [W, H], heroBotRight];
  return [hero, upperRight, lowerRight];
}

function heroTrioPoster(W, H) {
  const heroLowLeft = [0, H * 0.56];
  const heroLowRight = [W, H * 0.48];
  const cutA = pointOn(heroLowLeft, heroLowRight, 1 / 3);
  const cutB = pointOn(heroLowLeft, heroLowRight, 2 / 3);
  const footA = [W * 0.3, H];
  const footB = [W * 0.63, H];
  const hero = [[0, 0], [W, 0], heroLowRight, heroLowLeft];
  const first = [heroLowLeft, cutA, footA, [0, H]];
  const second = [cutA, cutB, footB, footA];
  const third = [cutB, heroLowRight, [W, H], footB];
  return [hero, first, second, third];
}

function heroTrioWide(W, H) {
  const heroTopRight = [W * 0.56, 0];
  const heroBotRight = [W * 0.48, H];
  const cutA = pointOn(heroTopRight, heroBotRight, 1 / 3);
  const cutB = pointOn(heroTopRight, heroBotRight, 2 / 3);
  const edgeA = [W, H * 0.3];
  const edgeB = [W, H * 0.63];
  const hero = [[0, 0], heroTopRight, heroBotRight, [0, H]];
  const first = [heroTopRight, [W, 0], edgeA, cutA];
  const second = [cutA, edgeA, edgeB, cutB];
  const third = [cutB, edgeB, [W, H], heroBotRight];
  return [hero, first, second, third];
}

function diptychPoster(W, H) {
  const stripLeft = [0, H * 0.82];
  const stripRight = [W, H * 0.78];
  const diagTop = [W * 0.3, 0];
  const diagFoot = pointOn(stripLeft, stripRight, 0.62);
  const leftPanel = [[0, 0], diagTop, diagFoot, stripLeft];
  const rightPanel = [diagTop, [W, 0], stripRight, diagFoot];
  const strip = [stripLeft, stripRight, [W, H], [0, H]];
  return [leftPanel, rightPanel, strip];
}

function diptychWide(W, H) {
  const stripTop = [W * 0.84, 0];
  const stripBot = [W * 0.8, H];
  const diagTop = [W * 0.38, 0];
  const diagFoot = pointOn(stripTop, stripBot, 0.68);
  const mainPanel = [[0, 0], diagTop, diagFoot, stripBot, [0, H]];
  const sidePanel = [diagTop, stripTop, diagFoot];
  const strip = [stripTop, [W, 0], [W, H], stripBot];
  return [mainPanel, sidePanel, strip];
}

export function panelsFor(layoutId, W, H) {
  const wide = W > H;
  if (layoutId === "hero-trio") {
    return wide ? heroTrioWide(W, H) : heroTrioPoster(W, H);
  }
  if (layoutId === "diptych") {
    return wide ? diptychWide(W, H) : diptychPoster(W, H);
  }
  return wide ? heroDuoWide(W, H) : heroDuoPoster(W, H);
}

export const LAYOUTS = [
  { id: "hero-duo", label: "Hero Duo" },
  { id: "hero-trio", label: "Hero Trio" },
  { id: "diptych", label: "Diptych" },
];
