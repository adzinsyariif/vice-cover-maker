/* Vice Cover Studio editor wiring.
   Owns the editor state, the photo tray, panel selection and
   pointer interaction, size switching, export and shot mode. */

import { renderCover, pointInPolygon } from "./cover.js";
import { panelsFor, LAYOUTS } from "./layouts.js";
import { GRADES } from "./grades.js";

const SAMPLES = [
  { name: "beach", label: "Beach", src: "samples/beach.jpg" },
  { name: "boulevard", label: "Boulevard", src: "samples/boulevard.jpg" },
  { name: "convertible", label: "Convertible", src: "samples/convertible.jpg" },
  { name: "pier", label: "Pier", src: "samples/pier.jpg" },
  { name: "yacht", label: "Yacht", src: "samples/yacht.jpg" },
];

const SIZES = [
  { id: "square", label: "1080 x 1080 Square", w: 1080, h: 1080 },
  { id: "portrait", label: "1080 x 1350 Portrait", w: 1080, h: 1350 },
  { id: "wide", label: "1920 x 1080 Wide", w: 1920, h: 1080 },
];

const state = {
  layoutId: "hero-duo",
  gradeId: "sunset",
  title: "SUNSET HEIST",
  subtitle: "PALM CITY STORIES",
  sizeId: "wide",
  panels: [],
  selected: 0,
};

let photos = [];
let lastPhoto = null;
let canvas;
let ctx;
let statusEl;
let trayEl;
let currentPolys = [];

function sizeOf() {
  for (const s of SIZES) if (s.id === state.sizeId) return s;
  return SIZES[0];
}

function ensurePanels() {
  const size = sizeOf();
  const count = panelsFor(state.layoutId, size.w, size.h).length;
  while (state.panels.length < count) {
    state.panels.push({ img: null, zoom: 1, dx: 0, dy: 0 });
  }
  state.panels.length = count;
  if (state.selected >= count) state.selected = 0;
}

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function draw() {
  ensurePanels();
  const size = sizeOf();
  if (canvas.width !== size.w) canvas.width = size.w;
  if (canvas.height !== size.h) canvas.height = size.h;
  currentPolys = renderCover(ctx, size.w, size.h, state);
  const poly = currentPolys[state.selected];
  if (poly && !document.body.classList.contains("shot-cover")) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(poly[0][0], poly[0][1]);
    for (let i = 1; i < poly.length; i += 1) ctx.lineTo(poly[i][0], poly[i][1]);
    ctx.closePath();
    ctx.strokeStyle = "#3ef2e0";
    ctx.lineWidth = Math.max(3, size.w * 0.004);
    ctx.setLineDash([size.w * 0.018, size.w * 0.012]);
    ctx.stroke();
    ctx.restore();
  }
  syncControls();
}

function syncControls() {
  const panel = state.panels[state.selected];
  const zoom = document.getElementById("zoom");
  const nx = document.getElementById("nudge-x");
  const ny = document.getElementById("nudge-y");
  const label = document.getElementById("selected-label");
  if (panel && zoom) {
    zoom.value = String(Math.round((panel.zoom || 1) * 100));
    nx.value = String(Math.round((panel.dx || 0) * 100));
    ny.value = String(Math.round((panel.dy || 0) * 100));
  }
  if (label) label.textContent = "Panel " + (state.selected + 1) + " selected";
  document.querySelectorAll("[data-layout]").forEach((el) => {
    el.classList.toggle("active", el.getAttribute("data-layout") === state.layoutId);
  });
  document.querySelectorAll("[data-grade]").forEach((el) => {
    el.classList.toggle("active", el.getAttribute("data-grade") === state.gradeId);
  });
  document.querySelectorAll("[data-size]").forEach((el) => {
    el.classList.toggle("active", el.getAttribute("data-size") === state.sizeId);
  });
}

function renderTray() {
  trayEl.innerHTML = "";
  photos.forEach((photo, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "thumb" + (photo === lastPhoto ? " recent" : "");
    const img = document.createElement("img");
    img.src = photo.url;
    img.alt = photo.name;
    btn.appendChild(img);
    const cap = document.createElement("span");
    cap.textContent = photo.name;
    btn.appendChild(cap);
    btn.addEventListener("click", () => {
      lastPhoto = photo;
      assignPhoto(state.selected, photo);
      renderTray();
    });
    trayEl.appendChild(btn);
    void idx;
  });
}

function assignPhoto(panelIndex, photo) {
  ensurePanels();
  state.panels[panelIndex].img = photo.img;
  setStatus("Panel " + (panelIndex + 1) + " filled with " + photo.name);
  draw();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function addSample(sample) {
  const existing = photos.find((p) => p.name === sample.label);
  if (existing) {
    lastPhoto = existing;
    assignPhoto(state.selected, existing);
    renderTray();
    return existing;
  }
  const img = await loadImage(sample.src);
  const photo = { name: sample.label, img, url: sample.src };
  photos.push(photo);
  lastPhoto = photo;
  assignPhoto(state.selected, photo);
  renderTray();
  return photo;
}

async function handleFiles(fileList) {
  for (const file of fileList) {
    if (!file.type.startsWith("image")) continue;
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const photo = { name: file.name, img, url };
      photos.push(photo);
      lastPhoto = photo;
      assignPhoto(state.selected, photo);
    } catch (err) {
      setStatus("Could not read " + file.name);
    }
  }
  renderTray();
  draw();
}

function exportPNG(w, h) {
  return new Promise((resolve) => {
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d");
    const count = panelsFor(state.layoutId, w, h).length;
    const panels = [];
    for (let i = 0; i < count; i += 1) {
      panels.push(state.panels[i] || { img: null, zoom: 1, dx: 0, dy: 0 });
    }
    renderCover(octx, w, h, {
      layoutId: state.layoutId,
      gradeId: state.gradeId,
      title: state.title,
      subtitle: state.subtitle,
      panels,
    });
    resolve(off.toDataURL("image/png"));
  });
}

function downloadCurrent() {
  const size = sizeOf();
  exportPNG(size.w, size.h).then((url) => {
    const name = "vice-cover-" + size.w + "x" + size.h + ".png";
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus("Saved " + name);
  });
}

function canvasPoint(evt) {
  const rect = canvas.getBoundingClientRect();
  const size = sizeOf();
  return [
    ((evt.clientX - rect.left) / rect.width) * size.w,
    ((evt.clientY - rect.top) / rect.height) * size.h,
  ];
}

function buildControls() {
  const layoutBox = document.getElementById("layout-buttons");
  for (const layout of LAYOUTS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = layout.label;
    btn.setAttribute("data-layout", layout.id);
    btn.className = "preset";
    btn.addEventListener("click", () => {
      state.layoutId = layout.id;
      state.selected = 0;
      ensurePanels();
      setStatus(layout.label + " layout");
      draw();
    });
    layoutBox.appendChild(btn);
  }
  const gradeBox = document.getElementById("grade-buttons");
  for (const grade of GRADES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = grade.label;
    btn.setAttribute("data-grade", grade.id);
    btn.className = "preset";
    btn.addEventListener("click", () => {
      state.gradeId = grade.id;
      setStatus(grade.label + " grade");
      draw();
    });
    gradeBox.appendChild(btn);
  }
  const sizeBox = document.getElementById("size-buttons");
  for (const s of SIZES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = s.label;
    btn.setAttribute("data-size", s.id);
    btn.className = "seg";
    btn.addEventListener("click", () => {
      state.sizeId = s.id;
      ensurePanels();
      setStatus("Size " + s.w + " x " + s.h);
      draw();
    });
    sizeBox.appendChild(btn);
  }
  const chipBox = document.getElementById("sample-chips");
  for (const sample of SAMPLES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = sample.label;
    btn.addEventListener("click", () => { addSample(sample); });
    chipBox.appendChild(btn);
  }
}

function wireEditor() {
  document.getElementById("file-input").addEventListener("change", (evt) => {
    handleFiles(Array.from(evt.target.files || []));
  });
  document.getElementById("fill-all").addEventListener("click", () => {
    if (!lastPhoto) { setStatus("Pick a photo first, then fill all panels"); return; }
    ensurePanels();
    for (const panel of state.panels) panel.img = lastPhoto.img;
    setStatus("All panels filled with " + lastPhoto.name);
    draw();
  });
  document.getElementById("export-btn").addEventListener("click", downloadCurrent);
  document.getElementById("title-input").addEventListener("input", (evt) => {
    state.title = evt.target.value;
    draw();
  });
  document.getElementById("subtitle-input").addEventListener("input", (evt) => {
    state.subtitle = evt.target.value;
    draw();
  });
  document.getElementById("zoom").addEventListener("input", (evt) => {
    state.panels[state.selected].zoom = Number(evt.target.value) / 100;
    draw();
  });
  document.getElementById("nudge-x").addEventListener("input", (evt) => {
    state.panels[state.selected].dx = Number(evt.target.value) / 100;
    draw();
  });
  document.getElementById("nudge-y").addEventListener("input", (evt) => {
    state.panels[state.selected].dy = Number(evt.target.value) / 100;
    draw();
  });
  document.getElementById("centre-btn").addEventListener("click", () => {
    const panel = state.panels[state.selected];
    panel.dx = 0; panel.dy = 0; panel.zoom = 1;
    setStatus("Panel " + (state.selected + 1) + " centred");
    draw();
  });

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener("pointerdown", (evt) => {
    const pt = canvasPoint(evt);
    for (let i = 0; i < currentPolys.length; i += 1) {
      if (pointInPolygon(pt[0], pt[1], currentPolys[i])) {
        state.selected = i;
        setStatus("Panel " + (i + 1) + " selected - pick a photo");
        break;
      }
    }
    dragging = true;
    lastX = evt.clientX;
    lastY = evt.clientY;
    canvas.setPointerCapture(evt.pointerId);
    draw();
  });
  canvas.addEventListener("pointermove", (evt) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const panel = state.panels[state.selected];
    if (!panel || !panel.img) return;
    panel.dx += (evt.clientX - lastX) / rect.width;
    panel.dy += (evt.clientY - lastY) / rect.height;
    lastX = evt.clientX;
    lastY = evt.clientY;
    draw();
  });
  canvas.addEventListener("pointerup", () => { dragging = false; });
  canvas.addEventListener("pointercancel", () => { dragging = false; });
  canvas.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    const panel = state.panels[state.selected];
    if (!panel) return;
    const step = evt.deltaY < 0 ? 1.05 : 0.95;
    panel.zoom = Math.min(3, Math.max(1, (panel.zoom || 1) * step));
    draw();
  }, { passive: false });
}

async function applyShotMode(params) {
  const shot = params.get("shot");
  if (!shot) return false;
  if (params.get("layout")) state.layoutId = params.get("layout");
  if (params.get("grade")) state.gradeId = params.get("grade");
  if (params.get("title") !== null) state.title = params.get("title");
  if (params.get("subtitle") !== null) state.subtitle = params.get("subtitle");
  const sizeParam = params.get("size");
  if (sizeParam) {
    const parts = sizeParam.split("x").map(Number);
    if (parts.length === 2) {
      for (const s of SIZES) {
        if (s.w === parts[0] && s.h === parts[1]) state.sizeId = s.id;
      }
    }
  }
  const titleInput = document.getElementById("title-input");
  const subInput = document.getElementById("subtitle-input");
  if (titleInput) titleInput.value = state.title;
  if (subInput) subInput.value = state.subtitle;
  ensurePanels();
  const photoNames = (params.get("photos") || "").split(",").map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < photoNames.length; i += 1) {
    const sample = SAMPLES.find((s) => s.name === photoNames[i]);
    if (!sample) continue;
    const img = await loadImage(sample.src);
    if (i < state.panels.length) state.panels[i].img = img;
    photos.push({ name: sample.label, img, url: sample.src });
    lastPhoto = photos[photos.length - 1];
  }
  renderTray();
  if (shot === "cover") document.body.classList.add("shot-cover");
  draw();
  return true;
}

async function init() {
  canvas = document.getElementById("poster");
  ctx = canvas.getContext("2d");
  statusEl = document.getElementById("status");
  trayEl = document.getElementById("tray");
  buildControls();
  wireEditor();
  ensurePanels();
  const params = new URLSearchParams(window.location.search);
  const isShot = await applyShotMode(params);
  if (!isShot) draw();
  window.__viceStudio = { exportPNG, ready: true };
  try {
    await document.fonts.load("100px Anton");
    await document.fonts.ready;
  } catch (err) { /* font fallback is acceptable */ }
  draw();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}

init();
