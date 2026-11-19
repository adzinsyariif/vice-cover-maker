import { drawCover } from "./cover.js";
import { getPanels, pointInPolygon } from "./layouts.js";

const SAMPLES = ["convertible", "yacht", "beach", "pier", "boulevard"];
const SIZES = {
  "1080x1080": [1080, 1080],
  "1080x1350": [1080, 1350],
  "1920x1080": [1920, 1080]
};

const canvas = document.getElementById("poster");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const trayEl = document.getElementById("tray");
const panelLabel = document.getElementById("panelLabel");
const zoomRange = document.getElementById("zoomRange");
const xRange = document.getElementById("xRange");
const yRange = document.getElementById("yRange");
const titleInput = document.getElementById("titleInput");
const subtitleInput = document.getElementById("subtitleInput");

const state = {
  layoutId: "hero-duo",
  gradeId: "sunset",
  sizeKey: "1920x1080",
  title: "SUNSET HEIST",
  subtitle: "PALM CITY STORIES",
  photos: [null, null, null, null],
  views: [
    { zoom: 1, ox: 0, oy: 0 },
    { zoom: 1, ox: 0, oy: 0 },
    { zoom: 1, ox: 0, oy: 0 },
    { zoom: 1, ox: 0, oy: 0 }
  ],
  selected: 0
};

const library = [];
let pickedTray = -1;
const sampleImages = {};

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function currentSize() {
  return SIZES[state.sizeKey] || SIZES["1920x1080"];
}

function render() {
  const size = currentSize();
  if (canvas.width !== size[0] || canvas.height !== size[1]) {
    canvas.width = size[0];
    canvas.height = size[1];
  }
  drawCover(ctx, size[0], size[1], {
    layoutId: state.layoutId,
    gradeId: state.gradeId,
    photos: state.photos,
    views: state.views,
    title: state.title,
    subtitle: state.subtitle,
    selected: state.selected,
    showSelection: !document.body.classList.contains("shot-cover")
  });
}

function renderOffscreen(w, h) {
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const octx = off.getContext("2d");
  drawCover(octx, w, h, {
    layoutId: state.layoutId,
    gradeId: state.gradeId,
    photos: state.photos,
    views: state.views,
    title: state.title,
    subtitle: state.subtitle,
    selected: -1,
    showSelection: false
  });
  return off;
}

function syncSliders() {
  const view = state.views[state.selected];
  zoomRange.value = String(view.zoom);
  xRange.value = String(view.ox);
  yRange.value = String(view.oy);
  panelLabel.textContent = "Panel " + (state.selected + 1);
}

function selectPanel(index) {
  state.selected = index;
  syncSliders();
  render();
}

function addToLibrary(img, name) {
  library.push({ img: img, name: name });
  const thumb = document.createElement("img");
  thumb.src = img.src;
  thumb.alt = name;
  thumb.title = name;
  const idx = library.length - 1;
  thumb.addEventListener("click", function () {
    pickedTray = idx;
    const thumbs = trayEl.querySelectorAll("img");
    thumbs.forEach(function (t, i) { t.classList.toggle("picked", i === idx); });
    setStatus("Photo picked. Now click a panel to place it.");
  });
  trayEl.appendChild(thumb);
  return idx;
}

function assignPhoto(panelIndex, libraryIndex) {
  if (libraryIndex < 0 || libraryIndex >= library.length) return;
  state.photos[panelIndex] = library[libraryIndex].img;
  state.views[panelIndex] = { zoom: 1, ox: 0, oy: 0 };
  selectPanel(panelIndex);
  setStatus("Placed photo in panel " + (panelIndex + 1) + ".");
}

function loadSample(name) {
  return new Promise(function (resolve) {
    if (sampleImages[name]) { resolve(sampleImages[name]); return; }
    const img = new Image();
    img.onload = function () { sampleImages[name] = img; resolve(img); };
    img.onerror = function () { resolve(null); };
    img.src = "samples/" + name + ".jpg";
  });
}

async function ensureSamplesInLibrary() {
  for (const name of SAMPLES) {
    const img = await loadSample(name);
    if (img && !library.some(function (entry) { return entry.name === name; })) addToLibrary(img, name);
  }
}

function buildSampleChips() {
  const row = document.getElementById("sampleRow");
  for (const name of SAMPLES) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "sample-chip";
    chip.textContent = name;
    chip.addEventListener("click", async function () {
      await ensureSamplesInLibrary();
      const idx = library.findIndex(function (entry) { return entry.name === name; });
      if (idx >= 0) {
        pickedTray = idx;
        const thumbs = trayEl.querySelectorAll("img");
        thumbs.forEach(function (t, i) { t.classList.toggle("picked", i === idx); });
        setStatus("Sample picked. Now click a panel to place it.");
      }
    });
    row.appendChild(chip);
  }
}

function wireControls() {
  document.getElementById("fileInput").addEventListener("change", function (event) {
    const files = Array.from(event.target.files || []);
    let firstNew = -1;
    for (const file of files) {
      const img = new Image();
      img.onload = function () {
        const idx = addToLibrary(img, file.name);
        if (firstNew < 0) firstNew = idx;
        render();
      };
      img.src = URL.createObjectURL(file);
    }
    if (files.length) setStatus("Loading " + files.length + " photo(s). Click one, then a panel.");
  });
  document.getElementById("fillBtn").addEventListener("click", function () {
    if (!library.length) { setStatus("Add a photo first, then fill the panels."); return; }
    const size = currentSize();
    const panels = getPanels(state.layoutId, size[0] > size[1]);
    for (let i = 0; i < panels.length; i++) {
      state.photos[i] = library[i % library.length].img;
      state.views[i] = { zoom: 1, ox: 0, oy: 0 };
    }
    render();
    setStatus("Filled every panel. Click a panel to fine-tune it.");
  });
  document.getElementById("sizeSeg").addEventListener("click", function (event) {
    const btn = event.target.closest("button[data-size]");
    if (!btn) return;
    state.sizeKey = btn.dataset.size;
    document.querySelectorAll("#sizeSeg button").forEach(function (b) { b.classList.toggle("active", b === btn); });
    render();
  });
  document.getElementById("layoutSeg").addEventListener("click", function (event) {
    const btn = event.target.closest("button[data-layout]");
    if (!btn) return;
    state.layoutId = btn.dataset.layout;
    document.querySelectorAll("#layoutSeg button").forEach(function (b) { b.classList.toggle("active", b === btn); });
    render();
  });
  document.getElementById("gradeSeg").addEventListener("click", function (event) {
    const btn = event.target.closest("button[data-grade]");
    if (!btn) return;
    state.gradeId = btn.dataset.grade;
    document.querySelectorAll("#gradeSeg button").forEach(function (b) { b.classList.toggle("active", b === btn); });
    render();
  });
  titleInput.addEventListener("input", function () { state.title = titleInput.value; render(); });
  subtitleInput.addEventListener("input", function () { state.subtitle = subtitleInput.value; render(); });
  zoomRange.addEventListener("input", function () { state.views[state.selected].zoom = Number(zoomRange.value); render(); });
  xRange.addEventListener("input", function () { state.views[state.selected].ox = Number(xRange.value); render(); });
  yRange.addEventListener("input", function () { state.views[state.selected].oy = Number(yRange.value); render(); });
  document.getElementById("centreBtn").addEventListener("click", function () {
    state.views[state.selected] = { zoom: 1, ox: 0, oy: 0 };
    syncSliders();
    render();
  });
  document.getElementById("exportBtn").addEventListener("click", function () {
    const size = currentSize();
    const off = renderOffscreen(size[0], size[1]);
    off.toBlob(function (blob) {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "vice-cover-" + size[0] + "x" + size[1] + ".png";
      link.click();
      setTimeout(function () { URL.revokeObjectURL(link.href); }, 4000);
      setStatus("Exported a " + size[0] + " x " + size[1] + " PNG.");
    }, "image/png");
  });
}

let drag = null;

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    nx: (event.clientX - rect.left) / rect.width,
    ny: (event.clientY - rect.top) / rect.height,
    px: event.clientX,
    py: event.clientY,
    rect: rect
  };
}

function panelAt(nx, ny) {
  const size = currentSize();
  const panels = getPanels(state.layoutId, size[0] > size[1]);
  for (let i = 0; i < panels.length; i++) if (pointInPolygon(nx, ny, panels[i])) return i;
  return -1;
}

function wireCanvas() {
  canvas.addEventListener("pointerdown", function (event) {
    const pt = canvasPoint(event);
    const idx = panelAt(pt.nx, pt.ny);
    if (idx < 0) return;
    if (pickedTray >= 0) {
      assignPhoto(idx, pickedTray);
      pickedTray = -1;
      trayEl.querySelectorAll("img").forEach(function (t) { t.classList.remove("picked"); });
      return;
    }
    selectPanel(idx);
    const view = state.views[idx];
    drag = { startX: pt.px, startY: pt.py, ox: view.ox, oy: view.oy, rect: pt.rect };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", function (event) {
    if (!drag) return;
    const view = state.views[state.selected];
    view.ox = Math.max(-0.5, Math.min(0.5, drag.ox + (event.clientX - drag.startX) / drag.rect.width));
    view.oy = Math.max(-0.5, Math.min(0.5, drag.oy + (event.clientY - drag.startY) / drag.rect.height));
    syncSliders();
    render();
  });
  canvas.addEventListener("pointerup", function () { drag = null; });
  canvas.addEventListener("pointercancel", function () { drag = null; });
  canvas.addEventListener("wheel", function (event) {
    event.preventDefault();
    const pt = canvasPoint(event);
    const idx = panelAt(pt.nx, pt.ny);
    const target = idx >= 0 ? idx : state.selected;
    if (idx >= 0 && idx !== state.selected) selectPanel(idx);
    const view = state.views[target];
    view.zoom = Math.max(1, Math.min(3, view.zoom * Math.exp(-event.deltaY * 0.0012)));
    syncSliders();
    render();
  }, { passive: false });
}

function markActiveControls() {
  document.querySelectorAll("#sizeSeg button").forEach(function (b) { b.classList.toggle("active", b.dataset.size === state.sizeKey); });
  document.querySelectorAll("#layoutSeg button").forEach(function (b) { b.classList.toggle("active", b.dataset.layout === state.layoutId); });
  document.querySelectorAll("#gradeSeg button").forEach(function (b) { b.classList.toggle("active", b.dataset.grade === state.gradeId); });
}

async function applyShotParams(params) {
  const layout = params.get("layout");
  const grade = params.get("grade");
  const size = params.get("size");
  const title = params.get("title");
  const subtitle = params.get("subtitle");
  const photos = params.get("photos");
  if (layout) state.layoutId = layout;
  if (grade) state.gradeId = grade;
  if (size && SIZES[size.replace("x", "x")]) state.sizeKey = size;
  if (title !== null) { state.title = title; titleInput.value = title; }
  if (subtitle !== null) { state.subtitle = subtitle; subtitleInput.value = subtitle; }
  await ensureSamplesInLibrary();
  if (photos) {
    const names = photos.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    for (let i = 0; i < names.length && i < 4; i++) {
      const img = await loadSample(names[i]);
      if (img) {
        state.photos[i] = img;
        state.views[i] = { zoom: 1, ox: 0, oy: 0 };
      }
    }
  }
  markActiveControls();
}

async function init() {
  buildSampleChips();
  wireControls();
  wireCanvas();
  const params = new URLSearchParams(window.location.search);
  const shot = params.get("shot");
  if (shot === "cover") document.body.classList.add("shot-cover");
  if (shot) {
    await applyShotParams(params);
  } else {
    await ensureSamplesInLibrary();
    for (let i = 0; i < 3 && i < library.length; i++) state.photos[i] = library[i].img;
  }
  try {
    await document.fonts.load("80px Anton");
    await document.fonts.ready;
  } catch (err) { void err; }
  selectPanel(0);
  render();
  window.__viceStudio = {
    ready: true,
    exportPNG: function (w, h) {
      return renderOffscreen(w, h).toDataURL("image/png");
    }
  };
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      render();
      window.__shotReady = true;
    });
  });
}

init();
