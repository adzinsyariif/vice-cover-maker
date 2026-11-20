export const LAYOUTS = [
  { id: "hero-duo", label: "Hero Duo", panels: 3 },
  { id: "hero-trio", label: "Hero Trio", panels: 4 },
  { id: "diptych", label: "Diptych", panels: 3 }
];

export function panelCount(layoutId) {
  for (const layout of LAYOUTS) {
    if (layout.id === layoutId) return layout.panels;
  }
  return 3;
}

function heroDuoPoster(W, H) {
  const splitX = 0.54 * W;
  const splitY = 0.6 * H - 0.08 * H * 0.54;
  return [
    [[0, 0], [W, 0], [W, 0.52 * H], [0, 0.6 * H]],
    [[0, 0.6 * H], [splitX, splitY], [0.46 * W, H], [0, H]],
    [[splitX, splitY], [W, 0.52 * H], [W, H], [0.46 * W, H]]
  ];
}

function heroDuoWide(W, H) {
  const splitY = 0.5 * H;
  const splitX = 0.6 * W - 0.08 * W * 0.5;
  return [
    [[0, 0], [0.6 * W, 0], [0.52 * W, H], [0, H]],
    [[0.6 * W, 0], [W, 0], [W, 0.44 * H], [splitX, splitY]],
    [[splitX, splitY], [W, 0.44 * H], [W, H], [0.52 * W, H]]
  ];
}

function heroTrioPoster(W, H) {
  const x1 = 0.34 * W;
  const y1 = 0.58 * H - 0.08 * H * 0.34;
  const x2 = 0.67 * W;
  const y2 = 0.58 * H - 0.08 * H * 0.67;
  return [
    [[0, 0], [W, 0], [W, 0.5 * H], [0, 0.58 * H]],
    [[0, 0.58 * H], [x1, y1], [0.3 * W, H], [0, H]],
    [[x1, y1], [x2, y2], [0.63 * W, H], [0.3 * W, H]],
    [[x2, y2], [W, 0.5 * H], [W, H], [0.63 * W, H]]
  ];
}

function heroTrioWide(W, H) {
  const y1 = 0.34 * H;
  const x1 = 0.52 * W - 0.06 * W * 0.34;
  const y2 = 0.67 * H;
  const x2 = 0.52 * W - 0.06 * W * 0.67;
  return [
    [[0, 0], [0.52 * W, 0], [0.46 * W, H], [0, H]],
    [[0.52 * W, 0], [W, 0], [W, 0.3 * H], [x1, y1]],
    [[x1, y1], [W, 0.3 * H], [W, 0.63 * H], [x2, y2]],
    [[x2, y2], [W, 0.63 * H], [W, H], [0.46 * W, H]]
  ];
}

function diptychPoster(W, H) {
  const diagX = 0.42 * W;
  const diagY = 0.8 * H + 0.06 * H * 0.42;
  return [
    [[0, 0], [0.64 * W, 0], [diagX, diagY], [0, 0.8 * H]],
    [[0.64 * W, 0], [W, 0], [W, 0.86 * H], [diagX, diagY]],
    [[0, 0.8 * H], [diagX, diagY], [W, 0.86 * H], [W, H], [0, H]]
  ];
}

function diptychWide(W, H) {
  const meetX = 0.82 * W + 0.06 * W * 0.4;
  const meetY = 0.4 * H;
  return [
    [[0, 0], [0.82 * W, 0], [meetX, meetY], [0, 0.58 * H]],
    [[0, 0.58 * H], [meetX, meetY], [0.88 * W, H], [0, H]],
    [[0.82 * W, 0], [W, 0], [W, H], [0.88 * W, H], [meetX, meetY]]
  ];
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

export function polygonBounds(poly) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of poly) {
    if (point[0] < minX) minX = point[0];
    if (point[1] < minY) minY = point[1];
    if (point[0] > maxX) maxX = point[0];
    if (point[1] > maxY) maxY = point[1];
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const crosses = yi > y !== yj > y;
    if (crosses) {
      const xAtY = ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (x < xAtY) inside = !inside;
    }
  }
  return inside;
}
