/*
 * Colour grades for Vice Cover Studio.
 *
 * Each grade is data, not code: a filter string applied to the photos
 * while they are drawn, an accent colour for the subtitle lettering,
 * and a list of overlay gradients the renderer paints across the whole
 * poster once the panels are in place.
 *
 * An overlay is { from: [x, y], to: [x, y], stops, composite } where
 * from and to are fractions of the poster size, stops are
 * [offset, colour] pairs, and composite is the canvas composite
 * operation used while that gradient is painted.
 */

export const GRADES = [
  {
    id: 'sunset',
    label: 'Sunset',
    filter: 'saturate(1.35) contrast(1.07) brightness(1.04)',
    accent: '#ff4d8d',
    swatch: 'linear-gradient(135deg, #ffb03a, #ff4d8d 60%, #5b2a86)',
    overlays: [
      {
        from: [0, 0],
        to: [0, 0.62],
        stops: [[0, 'rgba(74, 22, 132, 0.40)'], [1, 'rgba(74, 22, 132, 0)']],
        composite: 'multiply',
      },
      {
        from: [0, 0.3],
        to: [0, 1],
        stops: [
          [0, 'rgba(255, 112, 40, 0)'],
          [0.55, 'rgba(255, 84, 58, 0.26)'],
          [1, 'rgba(232, 30, 122, 0.50)'],
        ],
        composite: 'overlay',
      },
      {
        from: [0, 1],
        to: [1, 0],
        stops: [[0, 'rgba(255, 176, 58, 0.12)'], [1, 'rgba(255, 176, 58, 0)']],
        composite: 'source-over',
      },
    ],
  },
  {
    id: 'neon',
    label: 'Neon',
    filter: 'saturate(1.55) contrast(1.14) brightness(0.99) hue-rotate(-6deg)',
    accent: '#2ee6d6',
    swatch: 'linear-gradient(135deg, #2ee6d6, #274b9f 55%, #ff2e9a)',
    overlays: [
      {
        from: [0, 0],
        to: [0.75, 0.75],
        stops: [[0, 'rgba(0, 240, 214, 0.30)'], [1, 'rgba(0, 240, 214, 0)']],
        composite: 'overlay',
      },
      {
        from: [1, 1],
        to: [0.25, 0.25],
        stops: [[0, 'rgba(255, 20, 150, 0.34)'], [1, 'rgba(255, 20, 150, 0)']],
        composite: 'overlay',
      },
      {
        from: [0, 0.45],
        to: [0, 1],
        stops: [[0, 'rgba(12, 10, 64, 0)'], [1, 'rgba(16, 4, 54, 0.34)']],
        composite: 'source-over',
      },
    ],
  },
  {
    id: 'daylight',
    label: 'Daylight',
    filter: 'saturate(1.15) contrast(1.03) brightness(1.07)',
    accent: '#ff2e7e',
    swatch: 'linear-gradient(135deg, #8fd4ff, #ffe9a8 60%, #ff9d5c)',
    overlays: [
      {
        from: [0, 0],
        to: [0, 0.72],
        stops: [[0, 'rgba(140, 210, 255, 0.20)'], [1, 'rgba(140, 210, 255, 0)']],
        composite: 'source-over',
      },
      {
        from: [0, 0.55],
        to: [0, 1],
        stops: [[0, 'rgba(255, 220, 150, 0)'], [1, 'rgba(255, 186, 92, 0.16)']],
        composite: 'source-over',
      },
    ],
  },
  {
    id: 'dusk',
    label: 'Dusk',
    filter: 'saturate(0.82) contrast(1.18) brightness(0.96)',
    accent: '#7de8ff',
    swatch: 'linear-gradient(135deg, #7de8ff, #4a4a9e 55%, #1c1440)',
    overlays: [
      {
        from: [0, 0],
        to: [0, 1],
        stops: [[0, 'rgba(52, 42, 112, 0.26)'], [1, 'rgba(18, 14, 58, 0.40)']],
        composite: 'source-over',
      },
      {
        from: [0, 0],
        to: [0.8, 0.8],
        stops: [[0, 'rgba(80, 200, 220, 0.12)'], [1, 'rgba(80, 200, 220, 0)']],
        composite: 'soft-light',
      },
    ],
  },
];

/* The grade with the given id, falling back to the first grade. */
export function gradeById(id) {
  return GRADES.find((grade) => grade.id === id) || GRADES[0];
}
