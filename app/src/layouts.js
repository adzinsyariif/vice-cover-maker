/*
 * Panel layouts for Vice Cover Studio.
 *
 * Each layout returns a list of polygons. A polygon is a list of [x, y]
 * points in poster coordinates. The polygons tile the whole poster with
 * no gaps and no overlaps: neighbouring panels are derived from the same
 * slanted boundary line, so the shared edge is identical on both sides.
 *
 * A layout has a poster variant (square and portrait posters) and a wide
 * variant (landscape posters). The variant is picked from the aspect.
 */

/* Y coordinate on the slanted line through (x0, y0) and (x1, y1), at x. */
function yOnLine(x, x0, y0, x1, y1) {
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/* X coordinate on the slanted line through (x0, y0) and (x1, y1), at y. */
function xOnLine(y, x0, y0, x1, y1) {
  return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
}

/*
 * Hero duo, poster: one big hero panel on top whose bottom edge slants,
 * two smaller panels below it split by a slanted upright divider.
 */
function heroDuoPoster(W, H) {
  const yL = 0.585 * H;
  const yR = 0.5 * H;
  const topX = 0.53 * W;
  const mid = [topX, yOnLine(topX, 0, yL, W, yR)];
  const botX = 0.465 * W;
  return [
    [[0, 0], [W, 0], [W, yR], [0, yL]],
    [[0, yL], mid, [botX, H], [0, H]],
    [mid, [W, yR], [W, H], [botX, H]],
  ];
}

/*
 * Hero duo, wide: one big hero panel on the left whose right edge
 * slants, two smaller panels stacked on the right, split by a slanted
 * cross divider.
 */
function heroDuoWide(W, H) {
  const xT = 0.585 * W;
  const xB = 0.5 * W;
  const midY = 0.53 * H;
  const mid = [xOnLine(midY, xT, 0, xB, H), midY];
  const rightY = 0.465 * H;
  return [
    [[0, 0], [xT, 0], [xB, H], [0, H]],
    [[xT, 0], [W, 0], [W, rightY], mid],
    [mid, [W, rightY], [W, H], [xB, H]],
  ];
}

/*
 * Hero trio, poster: hero on top, three panels across the bottom,
 * divided by two slanted uprights.
 */
function heroTrioPoster(W, H) {
  const yL = 0.52 * H;
  const yR = 0.435 * H;
  const t1 = 0.365 * W;
  const t2 = 0.685 * W;
  const m1 = [t1, yOnLine(t1, 0, yL, W, yR)];
  const m2 = [t2, yOnLine(t2, 0, yL, W, yR)];
  const b1 = 0.315 * W;
  const b2 = 0.645 * W;
  return [
    [[0, 0], [W, 0], [W, yR], [0, yL]],
    [[0, yL], m1, [b1, H], [0, H]],
    [m1, m2, [b2, H], [b1, H]],
    [m2, [W, yR], [W, H], [b2, H]],
  ];
}

/*
 * Hero trio, wide: hero on the left, three panels stacked on the
 * right, divided by two slanted cross dividers.
 */
function heroTrioWide(W, H) {
  const xT = 0.52 * W;
  const xB = 0.435 * W;
  const t1 = 0.365 * H;
  const t2 = 0.685 * H;
  const m1 = [xOnLine(t1, xT, 0, xB, H), t1];
  const m2 = [xOnLine(t2, xT, 0, xB, H), t2];
  const r1 = 0.315 * H;
  const r2 = 0.645 * H;
  return [
    [[0, 0], [xT, 0], [xB, H], [0, H]],
    [[xT, 0], [W, 0], [W, r1], m1],
    [m1, [W, r1], [W, r2], m2],
    [m2, [W, r2], [W, H], [xB, H]],
  ];
}

/*
 * Diptych, poster: two large panels split by a strong diagonal that
 * runs across the whole poster, plus a slim third panel wedged along
 * the lower right edge.
 */
function diptychPoster(W, H) {
  const yL = 0.56 * H;
  const yR = 0.27 * H;
  const topX = 0.79 * W;
  const mid = [topX, yOnLine(topX, 0, yL, W, yR)];
  const botX = 0.85 * W;
  return [
    [[0, 0], [W, 0], [W, yR], [0, yL]],
    [[0, yL], mid, [botX, H], [0, H]],
    [mid, [W, yR], [W, H], [botX, H]],
  ];
}

/*
 * Diptych, wide: two large panels split by a strong diagonal that
 * runs down the whole poster, plus a slim third panel wedged along
 * the upper right edge.
 */
function diptychWide(W, H) {
  const xT = 0.63 * W;
  const xB = 0.29 * W;
  const midY = 0.21 * H;
  const mid = [xOnLine(midY, xT, 0, xB, H), midY];
  const rightY = 0.27 * H;
  return [
    [[0, 0], [xT, 0], [xB, H], [0, H]],
    [[xT, 0], [W, 0], [W, rightY], mid],
    [mid, [W, rightY], [W, H], [xB, H]],
  ];
}

const BUILDERS = {
  'hero-duo': { poster: heroDuoPoster, wide: heroDuoWide },
  'hero-trio': { poster: heroTrioPoster, wide: heroTrioWide },
  'diptych': { poster: diptychPoster, wide: diptychWide },
};

export const LAYOUTS = [
  { id: 'hero-duo', label: 'Hero Duo', panels: 3 },
  { id: 'hero-trio', label: 'Hero Trio', panels: 4 },
  { id: 'diptych', label: 'Diptych', panels: 3 },
];

/* Number of panels a layout uses. */
export function panelCount(layoutId) {
  const found = LAYOUTS.find((item) => item.id === layoutId);
  return found ? found.panels : 3;
}

/*
 * Polygons for a layout at poster size W by H. Landscape posters
 * (W greater than H) use the wide variant, everything else the
 * poster variant.
 */
export function panelsFor(layoutId, W, H) {
  const builder = BUILDERS[layoutId] || BUILDERS['hero-duo'];
  return W > H ? builder.wide(W, H) : builder.poster(W, H);
}

/* Axis-aligned bounding box of a polygon: [x, y, width, height]. */
export function polygonBounds(poly) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of poly) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX - minX, maxY - minY];
}

/* True when point (px, py) sits inside a polygon (ray casting). */
export function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const crosses = yi > py !== yj > py;
    if (crosses && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}
