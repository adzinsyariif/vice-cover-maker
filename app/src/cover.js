/* Poster renderer for Vice Cover Studio.
   Draws panels, grade overlays, dividers and caption onto a 2D
   context at whatever size the caller asks for. */

import { panelsFor } from "./layouts.js";
import { gradeFor } from "./grades.js";

function tracePath(ctx, poly) {
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i += 1) {
    ctx.lineTo(poly[i][0], poly[i][1]);
  }
  ctx.closePath();
}

function boundsOf(poly) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const pt of poly) {
    if (pt[0] < minX) minX = pt[0];
    if (pt[1] < minY) minY = pt[1];
    if (pt[0] > maxX) maxX = pt[0];
    if (pt[1] > maxY) maxY = pt[1];
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

function drawEmptyPanel(ctx, poly, index, W) {
  const box = boundsOf(poly);
  const grad = ctx.createLinearGradient(box.minX, box.minY, box.maxX, box.maxY);
  grad.addColorStop(0, "#2a1450");
  grad.addColorStop(0.55, "#173a4d");
  grad.addColorStop(1, "#0d2438");
  ctx.fillStyle = grad;
  ctx.fillRect(box.minX, box.minY, box.w, box.h);
  const cx = box.minX + box.w * 0.5;
  const cy = box.minY + box.h * 0.62;
  const reach = Math.min(box.w, box.h) * 0.34;
  ctx.save();
  ctx.strokeStyle = "rgba(10, 24, 30, 0.55)";
  ctx.lineWidth = Math.max(2, W * 0.006);
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i += 1) {
    const ang = Math.PI * (0.95 + i * 0.28);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(
      cx + Math.cos(ang) * reach * 0.6,
      cy + Math.sin(ang) * reach * 0.55 - reach * 0.22,
      cx + Math.cos(ang) * reach,
      cy + Math.sin(ang) * reach * 0.5 + reach * 0.18
    );
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx, cy + reach * 0.75);
  ctx.quadraticCurveTo(cx + reach * 0.08, cy + reach * 0.25, cx, cy);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
  ctx.font = "700 " + Math.round(Math.min(box.w, box.h) * 0.72) + "px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(index + 1), cx, box.minY + box.h * 0.34);
  ctx.restore();
}

function drawPhotoPanel(ctx, poly, panel, grade) {
  const box = boundsOf(poly);
  const img = panel.img;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const zoom = panel.zoom || 1;
  const scale = Math.max(box.w / iw, box.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = box.minX + box.w / 2 + (panel.dx || 0) * box.w;
  const cy = box.minY + box.h / 2 + (panel.dy || 0) * box.h;
  ctx.save();
  ctx.filter = grade.filter;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

function drawOverlays(ctx, grade, W, H) {
  for (const layer of grade.overlays) {
    const grad = ctx.createLinearGradient(layer.x0 * W, layer.y0 * H, layer.x1 * W, layer.y1 * H);
    for (const stop of layer.stops) {
      grad.addColorStop(stop[0], stop[1]);
    }
    ctx.save();
    ctx.globalCompositeOperation = layer.composite || "soft-light";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

function drawVignette(ctx, W, H) {
  const radius = Math.max(W, H) * 0.72;
  const grad = ctx.createRadialGradient(W / 2, H / 2, radius * 0.42, W / 2, H / 2, radius);
  grad.addColorStop(0, "rgba(0, 0, 0, 0)");
  grad.addColorStop(1, "rgba(5, 2, 18, 0.42)");
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function fitFontSize(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = size + "px Anton, sans-serif";
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 4;
    ctx.font = size + "px Anton, sans-serif";
  }
  return size;
}

function drawCaption(ctx, state, grade, W, H) {
  const title = (state.title || "").trim().toUpperCase();
  const subtitle = (state.subtitle || "").trim().toUpperCase();
  const margin = W * 0.055;
  const maxWidth = W * 0.92;
  const base = H - margin * 0.9;
  if (title) {
    const size = fitFontSize(ctx, title, maxWidth, Math.round(H * 0.115));
    ctx.save();
    ctx.font = size + "px Anton, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(10, 0, 24, 0.65)";
    ctx.shadowBlur = size * 0.16;
    ctx.shadowOffsetY = size * 0.05;
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.strokeStyle = "#160a26";
    ctx.lineJoin = "round";
    ctx.strokeText(title, margin, base);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#fffaf2";
    ctx.fillText(title, margin, base);
    ctx.restore();
    if (subtitle) {
      const subSize = Math.round(size * 0.3);
      ctx.save();
      ctx.font = "600 " + subSize + "px sans-serif";
      try { ctx.letterSpacing = Math.round(subSize * 0.34) + "px"; } catch (err) { /* older engines */ }
      ctx.fillStyle = grade.accent;
      ctx.shadowColor = "rgba(10, 0, 24, 0.6)";
      ctx.shadowBlur = subSize * 0.4;
      const subY = base - size - subSize * 0.55;
      ctx.fillText(subtitle, margin + 2, subY);
      ctx.restore();
      ctx.save();
      ctx.fillStyle = grade.accent;
      ctx.fillRect(margin + 2, base - size - subSize * 0.28, W * 0.16, Math.max(2, H * 0.004));
      ctx.restore();
    }
  } else if (subtitle) {
    const subSize = Math.round(H * 0.032);
    ctx.save();
    ctx.font = "600 " + subSize + "px sans-serif";
    try { ctx.letterSpacing = Math.round(subSize * 0.34) + "px"; } catch (err) { /* older engines */ }
    ctx.fillStyle = grade.accent;
    ctx.fillText(subtitle, margin, base);
    ctx.restore();
  }
}

export function renderCover(ctx, W, H, state) {
  const grade = gradeFor(state.gradeId);
  const polys = panelsFor(state.layoutId, W, H);
  ctx.save();
  ctx.fillStyle = "#120826";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < polys.length; i += 1) {
    const panel = state.panels[i] || { img: null, zoom: 1, dx: 0, dy: 0 };
    ctx.save();
    tracePath(ctx, polys[i]);
    ctx.clip();
    if (panel.img) {
      drawPhotoPanel(ctx, polys[i], panel, grade);
    } else {
      drawEmptyPanel(ctx, polys[i], i, W);
    }
    ctx.restore();
  }
  drawOverlays(ctx, grade, W, H);
  const under = Math.max(2, W * 0.013);
  const over = Math.max(1.5, W * 0.008);
  for (const poly of polys) {
    ctx.save();
    tracePath(ctx, poly);
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0b0616";
    ctx.lineWidth = under;
    ctx.stroke();
    ctx.restore();
  }
  for (const poly of polys) {
    ctx.save();
    tracePath(ctx, poly);
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#fff6e8";
    ctx.lineWidth = over;
    ctx.stroke();
    ctx.restore();
  }
  drawCaption(ctx, state, grade, W, H);
  drawVignette(ctx, W, H);
  ctx.save();
  ctx.strokeStyle = "rgba(255, 246, 232, 0.5)";
  ctx.lineWidth = Math.max(1, W * 0.0022);
  const inset = W * 0.006;
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  ctx.restore();
  ctx.restore();
  return polys;
}

export function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const crosses = (yi > y) !== (yj > y);
    if (crosses) {
      const atX = ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (x < atX) inside = !inside;
    }
  }
  return inside;
}
