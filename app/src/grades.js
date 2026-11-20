/* Colour grade presets.
   Each preset carries a CSS filter string that is applied to the
   photographs while they are drawn, plus a list of overlay
   gradients that the renderer paints across the whole poster.
   Overlay coordinates are fractions of the poster size. */

export const GRADES = [
  {
    id: "sunset",
    label: "Sunset",
    accent: "#ff5da2",
    filter: "saturate(1.35) contrast(1.07) brightness(1.04)",
    overlays: [
      {
        x0: 0, y0: 0, x1: 0, y1: 1,
        composite: "soft-light",
        stops: [
          [0, "rgba(124, 58, 180, 0.55)"],
          [0.45, "rgba(255, 120, 60, 0.12)"],
          [1, "rgba(255, 64, 120, 0.62)"],
        ],
      },
      {
        x0: 0, y0: 1, x1: 0, y1: 0.35,
        composite: "overlay",
        stops: [
          [0, "rgba(255, 150, 40, 0.38)"],
          [1, "rgba(255, 150, 40, 0)"],
        ],
      },
    ],
  },
  {
    id: "neon",
    label: "Neon",
    accent: "#3ef2e0",
    filter: "saturate(1.55) contrast(1.14) brightness(0.99) hue-rotate(-6deg)",
    overlays: [
      {
        x0: 0, y0: 0, x1: 1, y1: 1,
        composite: "soft-light",
        stops: [
          [0, "rgba(0, 220, 200, 0.55)"],
          [0.5, "rgba(20, 20, 80, 0.08)"],
          [1, "rgba(255, 0, 150, 0.58)"],
        ],
      },
      {
        x0: 1, y0: 1, x1: 0.3, y1: 0.2,
        composite: "overlay",
        stops: [
          [0, "rgba(255, 60, 170, 0.3)"],
          [1, "rgba(255, 60, 170, 0)"],
        ],
      },
    ],
  },
  {
    id: "daylight",
    label: "Daylight",
    accent: "#ffb03a",
    filter: "saturate(1.15) contrast(1.03) brightness(1.07)",
    overlays: [
      {
        x0: 0, y0: 0, x1: 0, y1: 0.7,
        composite: "soft-light",
        stops: [
          [0, "rgba(140, 210, 255, 0.42)"],
          [1, "rgba(140, 210, 255, 0)"],
        ],
      },
      {
        x0: 0, y0: 1, x1: 0, y1: 0.4,
        composite: "overlay",
        stops: [
          [0, "rgba(255, 220, 150, 0.22)"],
          [1, "rgba(255, 220, 150, 0)"],
        ],
      },
    ],
  },
  {
    id: "dusk",
    label: "Dusk",
    accent: "#b78cff",
    filter: "saturate(0.82) contrast(1.18) brightness(0.96)",
    overlays: [
      {
        x0: 0, y0: 0, x1: 0.4, y1: 1,
        composite: "soft-light",
        stops: [
          [0, "rgba(70, 50, 160, 0.6)"],
          [1, "rgba(30, 20, 70, 0.45)"],
        ],
      },
      {
        x0: 0, y0: 0, x1: 0, y1: 1,
        composite: "multiply",
        stops: [
          [0, "rgba(200, 190, 255, 0.16)"],
          [1, "rgba(40, 30, 90, 0.28)"],
        ],
      },
    ],
  },
];

export function gradeFor(id) {
  for (const grade of GRADES) {
    if (grade.id === id) return grade;
  }
  return GRADES[0];
}
