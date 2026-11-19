import { getPanels, polygonBounds } from "./layouts.js";
import { getGrade } from "./grades.js";

function tracePath(ctx, poly, W, H) {
  ctx.beginPath();
  for (let i = 0; i < poly.length; i++) {
    const x = poly[i][0] * W;
    const y = poly[i][1] * H;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawPalmFronds(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(2, size * 0.045);
  for (let k = 0; k < 7; k++) {
    const ang = Math.PI * (0.08 + 0.13 * k);
    const len = size * (0.75 + 0.25 * Math.sin(k * 2.1));
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(
      cx + Math.cos(ang) * len * 0.55,
      cy - Math.sin(ang) * len * 0.75,
      cx + Math.cos(ang) * len,
      cy - Math.sin(ang) * len * 0.42
    );
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy + size * 0.85);
  ctx.stroke();
  ctx.restore();
}

function drawEmptyPanel(ctx, poly, W, H, grade, index) {
  const b = polygonBounds(poly);
  const bx = b.minX * W;
  const by = b.minY * H;
  const bw = b.w * W;
  const bh = b.h * H;
  ctx.save();
  tracePath(ctx, poly, W, H);
  ctx.clip();
  const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  grad.addColorStop(0, grade.emptyB);
  grad.addColorStop(1, grade.emptyA);
  ctx.fillStyle = grad;
  ctx.fillRect(bx, by, bw, bh);
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  const size = Math.min(bw, bh) * 0.34;
  drawPalmFronds(ctx, cx, cy - size * 0.25, size, "rgba(255,255,255,0.30)");
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.font = "700 " + Math.round(size * 1.5) + "px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(index + 1), cx, cy + size * 0.62);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 " + Math.max(13, Math.round(W * 0.016)) + "px system-ui, sans-serif";
  const labelY = by + bh - Math.max(20, H * 0.035);
  ctx.fillText("ADD PHOTO", cx, labelY);
  ctx.restore();
}

function drawPhotoPanel(ctx, poly, W, H, grade, photo, view) {
  const b = polygonBounds(poly);
  const bx = b.minX * W;
  const by = b.minY * H;
  const bw = b.w * W;
  const bh = b.h * H;
  const iw = photo.naturalWidth || photo.width;
  const ih = photo.naturalHeight || photo.height;
  if (!iw || !ih) return;
  const zoom = view ? view.zoom : 1;
  const scale = Math.max(bw / iw, bh / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const ox = view ? view.ox : 0;
  const oy = view ? view.oy : 0;
  const dx = bx + (bw - dw) / 2 + ox * bw;
  const dy = by + (bh - dh) * 0.24 + oy * bh;
  ctx.save();
  tracePath(ctx, poly, W, H);
  ctx.clip();
  ctx.fillStyle = grade.emptyA;
  ctx.fillRect(bx, by, bw, bh);
  ctx.filter = grade.filter;
  ctx.drawImage(photo, dx, dy, dw, dh);
  ctx.filter = "none";
  ctx.restore();
}

function drawOverlays(ctx, W, H, grade) {
  for (const ov of grade.overlays) {
    const grad = ctx.createLinearGradient(ov.x0 * W, ov.y0 * H, ov.x1 * W, ov.y1 * H);
    for (const stop of ov.stops) grad.addColorStop(stop[0], stop[1]);
    ctx.save();
    ctx.globalCompositeOperation = ov.mode;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

function drawVignette(ctx, W, H) {
  const radius = Math.hypot(W, H) * 0.62;
  const grad = ctx.createRadialGradient(W / 2, H * 0.44, radius * 0.35, W / 2, H * 0.5, radius);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.78, "rgba(0,0,0,0.08)");
  grad.addColorStop(1, "rgba(4,0,18,0.46)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function fitTitleSize(ctx, title, maxWidth, startSize) {
  let size = startSize;
  while (size > 18) {
    ctx.font = size + "px Anton, system-ui, sans-serif";
    if (ctx.measureText(title).width <= maxWidth) break;
    size -= 4;
  }
  return size;
}

function drawCaption(ctx, W, H, grade, title, subtitle) {
  const scrim = ctx.createLinearGradient(0, H * 0.58, 0, H);
  scrim.addColorStop(0, "rgba(5,0,22,0)");
  scrim.addColorStop(0.55, "rgba(5,0,22,0.52)");
  scrim.addColorStop(1, "rgba(5,0,22,0.86)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, H * 0.58, W, H * 0.42);
  const cleanTitle = (title || "").trim().toUpperCase();
  const cleanSub = (subtitle || "").trim().toUpperCase();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  if (cleanTitle) {
    const start = Math.round(W * (W >= H ? 0.105 : 0.125));
    const size = fitTitleSize(ctx, cleanTitle, W * 0.92, start);
    ctx.font = size + "px Anton, system-ui, sans-serif";
    const ty = H - Math.max(26, H * 0.055);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.shadowBlur = Math.max(8, W * 0.012);
    ctx.shadowOffsetY = Math.max(3, H * 0.006);
    ctx.lineWidth = Math.max(4, size * 0.11);
    ctx.strokeStyle = "#160a26";
    ctx.lineJoin = "round";
    ctx.strokeText(cleanTitle, W / 2, ty);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(cleanTitle, W / 2, ty);
    ctx.restore();
    if (cleanSub) {
      const subSize = Math.max(15, Math.round(size * 0.21));
      ctx.font = "700 " + subSize + "px system-ui, sans-serif";
      try { ctx.letterSpacing = Math.round(subSize * 0.42) + "px"; } catch (err) { ctx.letterSpacing = "0px"; }
      ctx.fillStyle = grade.accent;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 6;
      ctx.fillText(cleanSub, W / 2, ty - size - subSize * 0.55);
      ctx.restore();
      try { ctx.letterSpacing = "0px"; } catch (err) { ctx.letterSpacing = "0px"; }
    }
  }
}

function drawFrameAndSeparators(ctx, panels, W, H) {
  const dark = Math.max(5, W * 0.011);
  const light = Math.max(3, W * 0.006);
  for (const poly of panels) {
    tracePath(ctx, poly, W, H);
    ctx.strokeStyle = "#12081f";
    ctx.lineWidth = dark;
    ctx.lineJoin = "round";
    ctx.stroke();
    tracePath(ctx, poly, W, H);
    ctx.strokeStyle = "#fff6ea";
    ctx.lineWidth = light;
    ctx.stroke();
  }
  ctx.strokeStyle = "#12081f";
  ctx.lineWidth = Math.max(8, W * 0.016);
  ctx.strokeRect(0, 0, W, H);
  ctx.strokeStyle = "#fff6ea";
  ctx.lineWidth = Math.max(3, W * 0.005);
  const inset = Math.max(5, W * 0.008);
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
}

function drawOuterFrame(ctx, W, H) {
  ctx.strokeStyle = "#12081f";
  ctx.lineWidth = Math.max(8, W * 0.016);
  ctx.strokeRect(0, 0, W, H);
  ctx.strokeStyle = "#fff6ea";
  ctx.lineWidth = Math.max(3, W * 0.005);
  const inset = Math.max(5, W * 0.008);
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
}

export function drawCover(ctx, W, H, state) {
  const grade = getGrade(state.gradeId);
  const wide = W > H;
  const panels = getPanels(state.layoutId, wide);
  ctx.fillStyle = "#160a26";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < panels.length; i++) {
    const photo = state.photos ? state.photos[i] : null;
    const view = state.views ? state.views[i] : null;
    if (photo) drawPhotoPanel(ctx, panels[i], W, H, grade, photo, view);
    else drawEmptyPanel(ctx, panels[i], W, H, grade, i);
  }
  drawFrameAndSeparators(ctx, panels, W, H);
  drawOverlays(ctx, W, H, grade);
  drawVignette(ctx, W, H);
  drawCaption(ctx, W, H, grade, state.title, state.subtitle);
  drawOuterFrame(ctx, W, H);
  if (state.showSelection && typeof state.selected === "number" && state.selected >= 0 && panels[state.selected]) {
    tracePath(ctx, panels[state.selected], W, H);
    ctx.strokeStyle = "#ffe93c";
    ctx.lineWidth = Math.max(4, W * 0.007);
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  return panels;
}
