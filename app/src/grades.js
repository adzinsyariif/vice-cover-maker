export const GRADES = [
  {
    id: "sunset",
    label: "Sunset",
    filter: "saturate(1.35) contrast(1.07) brightness(1.04)",
    accent: "#ff5da2",
    accentAlt: "#ffb347",
    overlays: [
      {
        x0: 0, y0: 1, x1: 0, y1: 0.25,
        composite: "soft-light",
        stops: [
          [0, "rgba(255, 94, 58, 0.85)"],
          [0.45, "rgba(255, 47, 150, 0.55)"],
          [1, "rgba(255, 47, 150, 0)"]
        ]
      },
      {
        x0: 0, y0: 0, x1: 0, y1: 0.55,
        composite: "soft-light",
        stops: [
          [0, "rgba(88, 28, 135, 0.75)"],
          [1, "rgba(88, 28, 135, 0)"]
        ]
      },
      {
        x0: 0, y0: 1, x1: 1, y1: 0,
        composite: "overlay",
        stops: [
          [0, "rgba(255, 140, 40, 0.35)"],
          [1, "rgba(30, 10, 70, 0)"]
        ]
      }
    ]
  },
  {
    id: "neon",
    label: "Neon",
    filter: "saturate(1.55) contrast(1.14) brightness(0.99) hue-rotate(-6deg)",
    accent: "#37f4e4",
    accentAlt: "#ff4fd8",
    overlays: [
      {
        x0: 0, y0: 0, x1: 0.7, y1: 0.7,
        composite: "overlay",
        stops: [
          [0, "rgba(20, 230, 210, 0.95)"],
          [1, "rgba(20, 230, 210, 0)"]
        ]
      },
      {
        x0: 1, y0: 1, x1: 0.3, y1: 0.3,
        composite: "overlay",
        stops: [
          [0, "rgba(255, 40, 190, 0.95)"],
          [1, "rgba(255, 40, 190, 0)"]
        ]
      },
      {
        x0: 0, y0: 0, x1: 0, y1: 1,
        composite: "overlay",
        stops: [
          [0, "rgba(10, 10, 60, 0.35)"],
          [0.5, "rgba(10, 10, 60, 0)"],
          [1, "rgba(40, 0, 60, 0.35)"]
        ]
      }
    ]
  },
  {
    id: "daylight",
    label: "Daylight",
    filter: "saturate(1.15) contrast(1.03) brightness(1.07)",
    accent: "#ffd23e",
    accentAlt: "#37b6f4",
    overlays: [
      {
        x0: 0, y0: 0, x1: 0, y1: 0.6,
        composite: "soft-light",
        stops: [
          [0, "rgba(140, 210, 255, 0.7)"],
          [1, "rgba(140, 210, 255, 0)"]
        ]
      },
      {
        x0: 0, y0: 1, x1: 0, y1: 0.4,
        composite: "soft-light",
        stops: [
          [0, "rgba(255, 220, 150, 0.45)"],
          [1, "rgba(255, 220, 150, 0)"]
        ]
      }
    ]
  },
  {
    id: "dusk",
    label: "Dusk",
    filter: "saturate(0.82) contrast(1.18) brightness(0.96)",
    accent: "#b78cff",
    accentAlt: "#5d7bff",
    overlays: [
      {
        x0: 0, y0: 0, x1: 0, y1: 1,
        composite: "soft-light",
        stops: [
          [0, "rgba(50, 30, 110, 0.85)"],
          [0.6, "rgba(50, 30, 110, 0.25)"],
          [1, "rgba(16, 10, 44, 0.7)"]
        ]
      },
      {
        x0: 1, y0: 0, x1: 0, y1: 1,
        composite: "overlay",
        stops: [
          [0, "rgba(70, 90, 200, 0.3)"],
          [1, "rgba(90, 30, 120, 0.3)"]
        ]
      }
    ]
  }
];

export function getGrade(id) {
  for (const grade of GRADES) {
    if (grade.id === id) return grade;
  }
  return GRADES[0];
}
