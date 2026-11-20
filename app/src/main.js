import { drawCover } from "./cover.js";
import { LAYOUTS, panelsFor, panelCount, pointInPolygon, polygonBounds } from "./layouts.js";
import { GRADES } from "./grades.js";

const SAMPLES = ["pier", "boulevard", "convertible", "yacht", "beach"];
const SAMPLE_LABELS = {
  pier: "Pier",
  boulevard: "Boulevard",
  convertible: "Convertible",
  yacht: "Yacht",
  beach: "Beach"
};

const canvas = document.getElementById("poster");
const ctx = canvas.getContext("2d");
const statusLine = document.getElementById("statusLine");
const trayEl = document.getElementById("tray");
const chipsEl = document.getElementById("sampleChips");
const zoomSlider = document.getElementById("zoomSlider");
const dxSlider = document.getElementById("dxSlider");
const dySlider = document.getElementById("dySlider");
const titleInput = document.getElementById("titleInput");
const subtitleInput = document.getElementById("subtitleInput");

const state = {
  layoutId: "hero-duo",
  gradeId: "sunset",
  title: "SUNSET HEIST",
  subtitle: "PALM CITY STORIES",
  width: 1080,
  height: 1080,
  panels: []
};

let selectedPanel = 0;
let library = [];
const sampleCache = new Map();
let lastPhoto = null;
let currentPolys = [];

function blankPanels() {
  const count = panelCount(state.layoutId);
  const panels = [];
  for (let i = 0; i < count; i++) {
    const old = state.panels[i];
    panels.push(old || { img: null, zoom: 1, dx: 0, dy: 0 });
  }
  return panels;
}

state.panels = blankPanels();

function setStatus(text) {
  if (statusLine) statusLine.textContent = text;
}

function syncSliders() {
  const panel = state.panels[selectedPanel];
  if (!panel) return;
  zoomSlider.value = String(panel.zoom);
  dxSlider.value = String(panel.dx);
  dySlider.value = String(panel.dy);
}

function redraw() {
  canvas.width = state.width;
  canvas.height = state.height;
  currentPolys = drawCover(ctx, state.width, state.height, state);
  const poly = currentPolys[selectedPanel];
  if (poly && !document.body.classList.contains("shot-cover")) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(poly[0][0], poly[0][1]);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
    ctx.closePath();
    ctx.strokeStyle = "#37f4e4";
    ctx.lineWidth = Math.max(4, state.width * 0.005);
    ctx.setLineDash([state.width * 0.02, state.width * 0.012]);
    ctx.stroke();
    ctx.restore();
  }
}

function renderTray() {
  trayEl.textContent = "";
  for (const photo of library) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "thumb";
    btn.title = photo.name;
    const img = document.createElement("img");
    img.src = photo.thumbSrc;
    img.alt = photo.name;
    btn.appendChild(img);
    btn.addEventListener("click", () => {
      assignPhoto(photo, selectedPanel);
    });
    trayEl.appendChild(btn);
  }
}

function assignPhoto(photo, panelIndex) {
  if (!state.panels[panelIndex]) return;
  state.panels[panelIndex].img = photo.img;
  lastPhoto = photo;
  setStatus(`Panel ${panelIndex + 1} filled with ${photo.name} - drag to reframe, or Export PNG.`);
  redraw();
}

function loadImageFromSrc(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image failed to load"));
    img.src = src;
  });
}

async function loadSample(name) {
  if (sampleCache.has(name)) return sampleCache.get(name);
  const src = `./samples/${name}.jpg`;
  const img = await loadImageFromSrc(src);
  const photo = { name: SAMPLE_LABELS[name] || name, sampleName: name, img, thumbSrc: src };
  sampleCache.set(name, photo);
  return photo;
}

function buildChips() {
  for (const name of SAMPLES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.title = SAMPLE_LABELS[name];
    const img = document.createElement("img");
    img.src = `./samples/${name}.jpg`;
    img.alt = SAMPLE_LABELS[name];
    btn.appendChild(img);
    btn.addEventListener("click", async () => {
      try {
        const photo = await loadSample(name);
        assignPhoto(photo, selectedPanel);
      } catch (err) {
        setStatus("That sample could not be loaded.");
      }
    });
    chipsEl.appendChild(btn);
  }
}

function buildPresets() {
  const layoutRow = document.getElementById("layoutRow");
  for (const layout of LAYOUTS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset" + (layout.id === state.layoutId ? " active" : "");
    btn.textContent = layout.label;
    btn.dataset.layoutId = layout.id;
    btn.addEventListener("click", () => {
      state.layoutId = layout.id;
      state.panels = blankPanels();
      if (selectedPanel >= state.panels.length) selectedPanel = 0;
      for (const other of layoutRow.children) other.classList.remove("active");
      btn.classList.add("active");
      syncSliders();
      setStatus(`Layout: ${layout.label}. Click a panel, then a photo.`);
      redraw();
    });
    layoutRow.appendChild(btn);
  }
  const gradeRow = document.getElementById("gradeRow");
  for (const grade of GRADES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset" + (grade.id === state.gradeId ? " active" : "");
    btn.textContent = grade.label;
    btn.dataset.gradeId = grade.id;
    btn.addEventListener("click", () => {
      state.gradeId = grade.id;
      for (const other of gradeRow.children) other.classList.remove("active");
      btn.classList.add("active");
      setStatus(`Grade: ${grade.label}.`);
      redraw();
    });
    gradeRow.appendChild(btn);
  }
}

function markPresetRows() {
  const layoutRow = document.getElementById("layoutRow");
  for (const btn of layoutRow.children) {
    btn.classList.toggle("active", btn.dataset.layoutId === state.layoutId);
  }
  const gradeRow = document.getElementById("gradeRow");
  for (const btn of gradeRow.children) {
    btn.classList.toggle("active", btn.dataset.gradeId === state.gradeId);
  }
}

function setSize(w, h) {
  state.width = w;
  state.height = h;
  const control = document.getElementById("sizeControl");
  for (const btn of control.children) {
    const active = Number(btn.dataset.w) === w && Number(btn.dataset.h) === h;
    btn.classList.toggle("active", active);
  }
  redraw();
}

function wireControls() {
  const control = document.getElementById("sizeControl");
  for (const btn of control.children) {
    btn.addEventListener("click", () => {
      setSize(Number(btn.dataset.w), Number(btn.dataset.h));
      setStatus(`Export size: ${state.width} x ${state.height}.`);
    });
  }
  document.getElementById("exportBtn").addEventListener("click", async () => {
    const dataUrl = await exportPNG(state.width, state.height);
    const link = document.createElement("a");
    const fileName = `vice-cover-${state.width}x${state.height}.png`;
    link.download = fileName;
    link.href = dataUrl;
    link.click();
    setStatus(`Saved ${fileName}`);
  });
  document.getElementById("fillAllBtn").addEventListener("click", () => {
    if (!lastPhoto) {
      setStatus("Pick a photo first, then Fill all panels.");
      return;
    }
    for (let i = 0; i < state.panels.length; i++) {
      state.panels[i].img = lastPhoto.img;
    }
    setStatus(`Every panel filled with ${lastPhoto.name}.`);
    redraw();
  });
  document.getElementById("centreBtn").addEventListener("click", () => {
    const panel = state.panels[selectedPanel];
    if (!panel) return;
    panel.dx = 0;
    panel.dy = 0;
    panel.zoom = 1;
    syncSliders();
    setStatus(`Panel ${selectedPanel + 1} photo centred.`);
    redraw();
  });
  zoomSlider.addEventListener("input", () => {
    const panel = state.panels[selectedPanel];
    if (!panel) return;
    panel.zoom = Number(zoomSlider.value);
    redraw();
  });
  dxSlider.addEventListener("input", () => {
    const panel = state.panels[selectedPanel];
    if (!panel) return;
    panel.dx = Number(dxSlider.value);
    redraw();
  });
  dySlider.addEventListener("input", () => {
    const panel = state.panels[selectedPanel];
    if (!panel) return;
    panel.dy = Number(dySlider.value);
    redraw();
  });
  titleInput.addEventListener("input", () => {
    state.title = titleInput.value;
    redraw();
  });
  subtitleInput.addEventListener("input", () => {
    state.subtitle = subtitleInput.value;
    redraw();
  });
  const fileInput = document.getElementById("fileInput");
  fileInput.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const img = await loadImageFromSrc(String(reader.result));
          const photo = { name: file.name, sampleName: "", img, thumbSrc: String(reader.result) };
          library.push(photo);
          renderTray();
          assignPhoto(photo, selectedPanel);
        } catch (err) {
          setStatus(`Could not read ${file.name}.`);
        }
      };
      reader.readAsDataURL(file);
    }
    if (files.length) setStatus("Reading your photos locally - nothing is uploaded.");
  });
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * state.width;
  const y = ((event.clientY - rect.top) / rect.height) * state.height;
  return [x, y];
}

function wirePointer() {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener("pointerdown", (event) => {
    const point = canvasPoint(event);
    const polys = panelsFor(state.layoutId, state.width, state.height);
    for (let i = 0; i < polys.length; i++) {
      if (pointInPolygon(point[0], point[1], polys[i])) {
        selectedPanel = i;
        break;
      }
    }
    dragging = true;
    lastX = point[0];
    lastY = point[1];
    canvas.setPointerCapture(event.pointerId);
    syncSliders();
    setStatus(`Panel ${selectedPanel + 1} selected - pick a photo, or drag to reframe.`);
    redraw();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const point = canvasPoint(event);
    const panel = state.panels[selectedPanel];
    const poly = panelsFor(state.layoutId, state.width, state.height)[selectedPanel];
    if (panel && poly) {
      const box = polygonBounds(poly);
      panel.dx += (point[0] - lastX) / box.w;
      panel.dy += (point[1] - lastY) / box.h;
      panel.dx = Math.max(-0.6, Math.min(0.6, panel.dx));
      panel.dy = Math.max(-0.6, Math.min(0.6, panel.dy));
      syncSliders();
      redraw();
    }
    lastX = point[0];
    lastY = point[1];
  });
  canvas.addEventListener("pointerup", () => {
    dragging = false;
  });
  canvas.addEventListener("pointercancel", () => {
    dragging = false;
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const panel = state.panels[selectedPanel];
    if (!panel) return;
    const factor = event.deltaY < 0 ? 1.07 : 0.93;
    panel.zoom = Math.max(1, Math.min(3, panel.zoom * factor));
    syncSliders();
    redraw();
  }, { passive: false });
}

async function exportPNG(w, h) {
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const offCtx = off.getContext("2d");
  const snapshot = {
    layoutId: state.layoutId,
    gradeId: state.gradeId,
    title: state.title,
    subtitle: state.subtitle,
    panels: state.panels
  };
  drawCover(offCtx, w, h, snapshot);
  return off.toDataURL("image/png");
}

async function applyShotMode(params) {
  const shot = params.get("shot");
  if (!shot) return false;
  if (params.get("layout")) state.layoutId = params.get("layout");
  if (params.get("grade")) state.gradeId = params.get("grade");
  if (params.get("title") !== null) {
    state.title = params.get("title");
    titleInput.value = state.title;
  }
  if (params.get("subtitle") !== null) {
    state.subtitle = params.get("subtitle");
    subtitleInput.value = state.subtitle;
  }
  const size = params.get("size");
  if (size) {
    const parts = size.split("x");
    if (parts.length === 2) {
      state.width = Number(parts[0]) || state.width;
      state.height = Number(parts[1]) || state.height;
    }
  }
  state.panels = blankPanels();
  if (selectedPanel >= state.panels.length) selectedPanel = 0;
  const photos = params.get("photos");
  if (photos) {
    const names = photos.split(",").map((name) => name.trim()).filter(Boolean);
    for (let i = 0; i < names.length && i < state.panels.length; i++) {
      const photo = await loadSample(names[i]);
      state.panels[i].img = photo.img;
      lastPhoto = photo;
    }
  }
  markPresetRows();
  const control = document.getElementById("sizeControl");
  for (const btn of control.children) {
    const active = Number(btn.dataset.w) === state.width && Number(btn.dataset.h) === state.height;
    btn.classList.toggle("active", active);
  }
  if (shot === "cover") {
    document.body.classList.add("shot-cover");
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
  }
  return true;
}

async function init() {
  buildChips();
  buildPresets();
  wireControls();
  wirePointer();
  const params = new URLSearchParams(window.location.search);
  await applyShotMode(params);
  syncSliders();
  try {
    await document.fonts.load("80px Anton");
    await document.fonts.ready;
  } catch (err) {
    setStatus("Display font is still loading.");
  }
  redraw();
  window.__viceStudio = { ready: true, exportPNG };
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  redraw();
  window.__shotReady = true;
}

window.__viceStudio = { ready: false, exportPNG };
init();
