export const GRADE_LIST = [
  {
    id: "sunset",
    name: "Sunset",
    filter: "saturate(1.35) contrast(1.08) brightness(1.03) hue-rotate(-8deg)",
    accent: "#ff4f9a",
    emptyA: "#3b1450",
    emptyB: "#c93a6b",
    overlays: [
      { x0: 0, y0: 0, x1: 1, y1: 1, mode: "overlay", stops: [[0, "rgba(255,47,150,0.34)"], [0.55, "rgba(255,47,150,0)"]] },
      { x0: 0, y0: 1, x1: 0, y1: 0.35, mode: "soft-light", stops: [[0, "rgba(255,138,42,0.55)"], [1, "rgba(255,138,42,0)"]] },
      { x0: 1, y0: 0, x1: 0, y1: 1, mode: "multiply", stops: [[0, "rgba(16,90,110,0.28)"], [0.6, "rgba(16,90,110,0)"]] }
    ]
  },
  {
    id: "neon",
    name: "Neon Nights",
    filter: "saturate(1.5) contrast(1.15) brightness(1.02) hue-rotate(10deg)",
    accent: "#2ee6ff",
    emptyA: "#0b1038",
    emptyB: "#5b1e7a",
    overlays: [
      { x0: 0, y0: 0, x1: 1, y1: 0, mode: "overlay", stops: [[0, "rgba(34,220,255,0.32)"], [1, "rgba(255,43,214,0.32)"]] },
      { x0: 0, y0: 1, x1: 1, y1: 0, mode: "soft-light", stops: [[0, "rgba(90,40,220,0.5)"], [1, "rgba(90,40,220,0)"]] }
    ]
  },
  {
    id: "daylight",
    name: "Daylight Vice",
    filter: "saturate(1.18) contrast(1.04) brightness(1.1)",
    accent: "#ff6b57",
    emptyA: "#7a2d1d",
    emptyB: "#e8a04c",
    overlays: [
      { x0: 0, y0: 0, x1: 0, y1: 1, mode: "soft-light", stops: [[0, "rgba(255,236,170,0.4)"], [1, "rgba(255,236,170,0)"]] },
      { x0: 0, y0: 1, x1: 1, y1: 0, mode: "overlay", stops: [[0, "rgba(255,107,87,0.22)"], [1, "rgba(64,190,220,0.18)"]] }
    ]
  },
  {
    id: "dusk",
    name: "Dusk",
    filter: "saturate(1.22) contrast(1.12) brightness(0.9) hue-rotate(-14deg)",
    accent: "#b78cff",
    emptyA: "#160f33",
    emptyB: "#274b5e",
    overlays: [
      { x0: 0, y0: 0, x1: 1, y1: 1, mode: "overlay", stops: [[0, "rgba(112,54,220,0.36)"], [1, "rgba(18,120,130,0.3)"]] },
      { x0: 0, y0: 1, x1: 0, y1: 0.3, mode: "multiply", stops: [[0, "rgba(10,6,36,0.42)"], [1, "rgba(10,6,36,0)"]] }
    ]
  }
];

export function getGrade(id) {
  for (const g of GRADE_LIST) if (g.id === id) return g;
  return GRADE_LIST[0];
}
