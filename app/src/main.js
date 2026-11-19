/*
 * Vice Cover Studio: editor wiring and state.
 *
 * One screen: a photo rail on the left, the poster canvas in the
 * centre. Photos are read locally (object URLs for picked files,
 * bundled files for the samples) and never leave the machine. The
 * renderer lives in cover.js, the panel shapes in layouts.js and the
 * colour presets in grades.js.
 *
 * A query string can set up a fixed scene for screenshots:
 * ?shot=cover or ?shot=editor, with layout, grade, size (such as
 * 1920x1080), photos (comma list of sample names, in panel order),
 * title and subtitle. Cover mode hides the editor chrome.
 */

import { drawPoster, drawCover } from './cover.js';
import { panelsFor, panelCount, polygonBounds, pointInPolygon } from './layouts.js';
import { GRADES, gradeById } from './grades.js';

const SAMPLES = ['convertible', 'yacht', 'beach', 'pier', 'boulevard'];
const ACCENT = '#19e3d1';

const canvas = document.getElementById('poster');
const stage = document.getElementById('stage');
const statusEl = document.getElementById('status');
const trayEl = document.getElementById('tray');
const titleInput = document.getElementById('titleInput');
const subtitleInput = document.getElementById('subtitleInput');
const zoomInput = document.getElementById('zoom');
const nudgeXInput = document.getElementById('nudgeX');
const nudgeYInput = document.getElementById('nudgeY');
const zoomVal = document.getElementById('zoomVal');
const nudgeXVal = document.getElementById('nudgeXVal');
const nudgeYVal = document.getElementById('nudgeYVal');

function freshPanel() {
  return { img: null, zoom: 1, dx: 0, dy: 0 };
}

const state = {
  layoutId: 'hero-duo',
  gradeId: 'sunset',
  title: titleInput.value,
  subtitle: subtitleInput.value,
  panels: [freshPanel(), freshPanel(), freshPanel(), freshPanel()],
};

let selected = 0;
const library = [];
let lastPhoto = null;
const sampleCache = new Map();

function setStatus(message) {
  statusEl.textContent = message;
}

/* Loads an image from a local source, resolving once it can draw. */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image failed to load'));
    img.src = src;
  });
}

function clamp(value, lo, hi) {
  return Math.min(hi, Math.max(lo, value));
}

/* Scales the canvas element so the whole poster fits the stage. */
function fitCanvas() {
  if (document.body.classList.contains('shot-cover')) {
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    return;
  }
  const availW = Math.max(280, stage.clientWidth - 8);
  const availH = Math.max(280, window.innerHeight - 168);
  const scale = Math.min(availW / canvas.width, availH / canvas.height);
  canvas.style.width = `${Math.floor(canvas.width * scale)}px`;
  canvas.style.height = `${Math.floor(canvas.height * scale)}px`;
}

/* Accent outline over the selected panel, drawn after the poster. */
function drawSelection() {
  if (document.body.classList.contains('shot-cover')) return;
  const polys = panelsFor(state.layoutId, canvas.width, canvas.height);
  const poly = polys[selected];
  if (!poly) return;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.beginPath();
  poly.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.shadowColor = ACCENT;
  ctx.shadowBlur = canvas.width * 0.012;
  ctx.lineWidth = Math.max(2, canvas.width * 0.005);
  ctx.strokeStyle = ACCENT;
  ctx.stroke();
  ctx.restore();
}

function redraw() {
  drawCover(canvas, state);
  drawSelection();
}

/* Reflects the selected panel transform in the sliders. */
function syncSliders() {
  const panel = state.panels[selected];
  zoomInput.value = String(panel.zoom);
  nudgeXInput.value = String(clamp(panel.dx, -0.45, 0.45));
  nudgeYInput.value = String(clamp(panel.dy, -0.45, 0.45));
  zoomVal.textContent = `${panel.zoom.toFixed(2)}x`;
  nudgeXVal.textContent = panel.dx.toFixed(2);
  nudgeYVal.textContent = panel.dy.toFixed(2);
}

function syncPickButtons() {
  document.querySelectorAll('.layout-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.layout === state.layoutId);
  });
  document.querySelectorAll('.grade-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.grade === state.gradeId);
  });
  document.querySelectorAll('.size-btn').forEach((btn) => {
    const active = Number(btn.dataset.w) === canvas.width && Number(btn.dataset.h) === canvas.height;
    btn.classList.toggle('active', active);
  });
}

/* Puts a library photo into a panel, resetting its transform. */
function assignPhoto(entry, panelIndex) {
  const panel = state.panels[panelIndex];
  panel.img = entry.img;
  panel.zoom = 1;
  panel.dx = 0;
  panel.dy = 0;
  lastPhoto = entry;
  markLastThumb();
}

function markLastThumb() {
  trayEl.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('last', library[Number(btn.dataset.index)] === lastPhoto);
  });
}

/* Adds a photo to the tray; returns its library entry. */
function addToLibrary(img, name, thumbSrc) {
  const entry = { img, name, thumbSrc };
  library.push(entry);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.dataset.index = String(library.length - 1);
  btn.title = name;
  const thumb = document.createElement('img');
  thumb.src = thumbSrc;
  thumb.alt = name;
  btn.appendChild(thumb);
  btn.addEventListener('click', () => {
    assignPhoto(entry, selected);
    syncSliders();
    redraw();
    setStatus(`${name} placed in panel ${selected + 1}.`);
  });
  trayEl.appendChild(btn);
  return entry;
}

/* Loads a bundled sample once, then hands back its library entry. */
async function sampleEntry(name) {
  if (sampleCache.has(name)) return sampleCache.get(name);
  const src = `samples/${name}.jpg`;
  const img = await loadImage(src);
  const entry = addToLibrary(img, name, src);
  sampleCache.set(name, entry);
  return entry;
}

function selectPanel(index, announce) {
  selected = index;
  syncSliders();
  redraw();
  if (announce) setStatus(`Panel ${index + 1} selected — pick a photo, or drag the one it has.`);
}

/* Canvas coordinates of a pointer event. */
function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return [
    (event.clientX - rect.left) * (canvas.width / rect.width),
    (event.clientY - rect.top) * (canvas.height / rect.height),
  ];
}

function panelAt(px, py) {
  const polys = panelsFor(state.layoutId, canvas.width, canvas.height);
  for (let i = polys.length - 1; i >= 0; i -= 1) {
    if (pointInPolygon(px, py, polys[i])) return i;
  }
  return -1;
}

let drag = null;

canvas.addEventListener('pointerdown', (event) => {
  const [px, py] = canvasPoint(event);
  const index = panelAt(px, py);
  if (index < 0) return;
  if (index !== selected) selectPanel(index, true);
  else redraw();
  const polys = panelsFor(state.layoutId, canvas.width, canvas.height);
  const [, , bw, bh] = polygonBounds(polys[index]);
  drag = {
    startX: px,
    startY: py,
    origDx: state.panels[index].dx,
    origDy: state.panels[index].dy,
    bw,
    bh,
  };
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const [px, py] = canvasPoint(event);
  const panel = state.panels[selected];
  panel.dx = clamp(drag.origDx + (px - drag.startX) / drag.bw, -0.6, 0.6);
  panel.dy = clamp(drag.origDy + (py - drag.startY) / drag.bh, -0.6, 0.6);
  syncSliders();
  redraw();
});

function endDrag() {
  drag = null;
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const [px, py] = canvasPoint(event);
  const index = panelAt(px, py);
  if (index < 0) return;
  if (index !== selected) selected = index;
  const panel = state.panels[selected];
  const factor = event.deltaY < 0 ? 1.07 : 1 / 1.07;
  panel.zoom = clamp(panel.zoom * factor, 1, 3);
  syncSliders();
  redraw();
}, { passive: false });

zoomInput.addEventListener('input', () => {
  state.panels[selected].zoom = Number(zoomInput.value);
  syncSliders();
  redraw();
});
nudgeXInput.addEventListener('input', () => {
  state.panels[selected].dx = Number(nudgeXInput.value);
  syncSliders();
  redraw();
});
nudgeYInput.addEventListener('input', () => {
  state.panels[selected].dy = Number(nudgeYInput.value);
  syncSliders();
  redraw();
});

document.getElementById('centre').addEventListener('click', () => {
  const panel = state.panels[selected];
  panel.zoom = 1;
  panel.dx = 0;
  panel.dy = 0;
  syncSliders();
  redraw();
  setStatus(`Panel ${selected + 1} photo centred.`);
});

document.getElementById('photoInput').addEventListener('change', async (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  let placed = false;
  for (const file of files) {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const entry = addToLibrary(img, file.name, url);
      if (!placed) {
        assignPhoto(entry, selected);
        placed = true;
      } else {
        lastPhoto = entry;
        markLastThumb();
      }
    } catch (err) {
      setStatus(`Could not read ${file.name}.`);
    }
  }
  syncSliders();
  redraw();
  setStatus(files.length === 1 ? `${files[0].name} placed in panel ${selected + 1}.` : `${files.length} photos added to the tray.`);
  event.target.value = '';
});

document.querySelectorAll('.sample-chip').forEach((chip) => {
  chip.addEventListener('click', async () => {
    const entry = await sampleEntry(chip.dataset.sample);
    assignPhoto(entry, selected);
    syncSliders();
    redraw();
    setStatus(`${entry.name} placed in panel ${selected + 1}.`);
  });
});

document.getElementById('fillAll').addEventListener('click', () => {
  if (!lastPhoto) {
    setStatus('Pick a photo first, then fill every panel with it.');
    return;
  }
  const count = panelCount(state.layoutId);
  for (let i = 0; i < count; i += 1) assignPhoto(lastPhoto, i);
  syncSliders();
  redraw();
  setStatus(`Every panel now shows ${lastPhoto.name}.`);
});

document.querySelectorAll('.layout-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.layoutId = btn.dataset.layout;
    if (selected >= panelCount(state.layoutId)) selected = 0;
    syncPickButtons();
    syncSliders();
    redraw();
    setStatus(`Layout: ${btn.textContent.trim()}.`);
  });
});

document.querySelectorAll('.grade-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.gradeId = btn.dataset.grade;
    syncPickButtons();
    redraw();
    setStatus(`Grade: ${gradeById(state.gradeId).label}.`);
  });
});

document.querySelectorAll('.size-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    canvas.width = Number(btn.dataset.w);
    canvas.height = Number(btn.dataset.h);
    fitCanvas();
    syncPickButtons();
    redraw();
    setStatus(`Export size ${canvas.width} x ${canvas.height}.`);
  });
});

titleInput.addEventListener('input', () => {
  state.title = titleInput.value;
  redraw();
});
subtitleInput.addEventListener('input', () => {
  state.subtitle = subtitleInput.value;
  redraw();
});

function downloadCurrent() {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const name = `vice-cover-${canvas.width}x${canvas.height}.png`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    setStatus(`Saved ${name}`);
  }, 'image/png');
}
document.getElementById('exportBtn').addEventListener('click', downloadCurrent);

/*
 * Renders the current state at an exact size and resolves with a
 * PNG data URL. Used by the screenshot scenes and available to any
 * page that embeds the studio.
 */
async function exportPNG(w, h) {
  try {
    await document.fonts.load('80px Anton');
    await document.fonts.ready;
  } catch (err) {
    /* The fallback face still draws; the export must not fail. */
  }
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawPoster(off.getContext('2d'), w, h, state);
  return off.toDataURL('image/png');
}

window.__viceStudio = { ready: false, exportPNG };

window.addEventListener('resize', () => {
  fitCanvas();
  redraw();
});

/* Grade swatches come from the grade data itself. */
document.querySelectorAll('.grade-btn').forEach((btn) => {
  const grade = GRADES.find((item) => item.id === btn.dataset.grade);
  const swatch = btn.querySelector('.swatch');
  if (grade && swatch) swatch.style.background = grade.swatch;
});

function markShotReady() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
      window.__viceStudio.ready = true;
    });
  });
}

/* Applies the ?shot= scene parameters, when present. */
async function applyShot(query) {
  const layout = query.get('layout');
  if (layout && GRADES.length) state.layoutId = layout;
  const grade = query.get('grade');
  if (grade) state.gradeId = grade;
  const size = query.get('size');
  if (size) {
    const parts = size.split('x').map(Number);
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
      canvas.width = parts[0];
      canvas.height = parts[1];
    }
  }
  const title = query.get('title');
  if (title !== null) {
    state.title = title;
    titleInput.value = title;
  }
  const subtitle = query.get('subtitle');
  if (subtitle !== null) {
    state.subtitle = subtitle;
    subtitleInput.value = subtitle;
  }
  const photos = query.get('photos');
  if (photos) {
    const names = photos.split(',').map((name) => name.trim()).filter(Boolean);
    for (let i = 0; i < names.length && i < state.panels.length; i += 1) {
      const entry = await sampleEntry(names[i]);
      state.panels[i].img = entry.img;
      lastPhoto = entry;
    }
    markLastThumb();
  }
}

async function init() {
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  syncPickButtons();
  syncSliders();
  fitCanvas();
  redraw();

  if (shot) {
    if (shot === 'cover') document.body.classList.add('shot-cover');
    await applyShot(query);
    try {
      await document.fonts.load('80px Anton');
      await document.fonts.ready;
    } catch (err) {
      /* Continue with the fallback face. */
    }
    fitCanvas();
    syncPickButtons();
    syncSliders();
    redraw();
    setStatus(`Editing "${state.title}" — ${gradeById(state.gradeId).label} grade, ${canvas.width} x ${canvas.height} export.`);
    markShotReady();
    return;
  }

  /* Open with a finished cover built from three bundled samples. */
  const defaults = ['convertible', 'yacht', 'beach'];
  for (let i = 0; i < defaults.length; i += 1) {
    const entry = await sampleEntry(defaults[i]);
    state.panels[i].img = entry.img;
    lastPhoto = entry;
  }
  markLastThumb();
  try {
    await document.fonts.load('80px Anton');
    await document.fonts.ready;
  } catch (err) {
    /* Continue with the fallback face. */
  }
  fitCanvas();
  redraw();
  window.__viceStudio.ready = true;
  setStatus('Samples are in — click a panel, swap a photo, make it yours.');
}

init();
