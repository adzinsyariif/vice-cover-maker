import { panelsFor, polygonBounds } from "./layouts.js";
import { getGrade } from "./grades.js";

function tracePolygon(ctx, poly) {
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) {
    ctx.lineTo(poly[i][0], poly[i][1]);
  }
  ctx.closePath();
}

function drawEmptyPanel(ctx, poly, index, W, H) {
  const box = polygonBounds(poly);
  ctx.save();
  tracePolygon(ctx, poly);
  ctx.clip();
  const grad = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
  if (index % 2 === 0) {
    grad.addColorStop(0, "#2b1055");
    grad.addColorStop(0.55, "#173a5e");
    grad.addColorStop(1, "#0d7a78");
  } else {
    grad.addColorStop(0, "#3d1160");
    grad.addColorStop(0.55, "#7a1e5e");
    grad.addColorStop(1, "#c94f2e");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = Math.max(2, W * 0.0022);
  const cx = box.x + box.w * 0.72;
  const cy = box.y + box.h * 0.9;
  const reach = Math.min(box.w, box.h) * 0.52;
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI * (1.05 + i * 0.16);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(
      cx + Math.cos(angle) * reach * 0.6,
      cy + Math.sin(angle) * reach * 0.6 - reach * 0.12,
      cx + Math.cos(angle) * reach,
      cy + Math.sin(angle) * reach
    );
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + reach * 0.08, cy - reach * 0.75);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.font = `${Math.round(Math.min(box.w, box.h) * 0.62)}px Anton, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(index + 1), box.x + box.w * 0.32, box.y + box.h * 0.36);
  ctx.restore();
}

function drawPanelPhoto(ctx, poly, panel, grade) {
  const box = polygonBounds(poly);
  const img = panel.img;
  ctx.save();
  tracePolygon(ctx, poly);
  ctx.clip();
  const zoom = panel.zoom > 0 ? panel.zoom : 1;
  const scale = Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const cx = box.x + box.w / 2 + panel.dx * box.w;
  const cy = box.y + box.h / 2 + panel.dy * box.h;
  ctx.filter = grade.filter;
  try {
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  } finally {
    ctx.filter = "none";
  }
  ctx.restore();
}

function paintOverlays(ctx, W, H, grade) {
  for (const overlay of grade.overlays) {
    const grad = ctx.createLinearGradient(
      overlay.x0 * W, overlay.y0 * H, overlay.x1 * W, overlay.y1 * H
    );
    for (const stop of overlay.stops) {
      grad.addColorStop(stop[0], stop[1]);
    }
    ctx.save();
    ctx.globalCompositeOperation = overlay.composite || "source-over";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

function paintVignette(ctx, W, H) {
  const radius = Math.max(W, H) * 0.78;
  const grad = ctx.createRadialGradient(W / 2, H / 2, radius * 0.42, W / 2, H / 2, radius);
  grad.addColorStop(0, "rgba(8, 0, 18, 0)");
  grad.addColorStop(0.78, "rgba(8, 0, 18, 0.08)");
  grad.addColorStop(1, "rgba(8, 0, 18, 0.44)");
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function fitFontSize(ctx, text, maxWidth, startSize) {
  let size = startSize;
  while (size > 18) {
    ctx.font = `${Math.round(size)}px Anton, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size *= 0.94;
  }
  return size;
}

function paintCaption(ctx, W, H, state, grade) {
  const title = (state.title || "").trim().toUpperCase();
  const subtitle = (state.subtitle || "").trim().toUpperCase();
  if (!title && !subtitle) return;
  const margin = W * 0.045;
  const scrim = ctx.createLinearGradient(0, H * 0.5, 0, H);
  scrim.addColorStop(0, "rgba(6, 0, 14, 0)");
  scrim.addColorStop(0.5, "rgba(6, 0, 14, 0.52)");
  scrim.addColorStop(1, "rgba(6, 0, 14, 0.82)");
  ctx.save();
  ctx.fillStyle = scrim;
  ctx.fillRect(0, H * 0.5, W, H * 0.5);
  ctx.restore();
  const baseY = H - margin * 0.9;
  let titleSize = 0;
  ctx.save();
  if (title) {
    const start = Math.min(H * 0.13, W * 0.15);
    titleSize = fitFontSize(ctx, title, W * 0.92, start);
    ctx.font = `${Math.round(titleSize)}px Anton, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = titleSize * 0.22;
    ctx.shadowOffsetY = titleSize * 0.05;
    ctx.lineJoin = "round";
    ctx.lineWidth = titleSize * 0.14;
    ctx.strokeStyle = "#160a24";
    ctx.strokeText(title, margin, baseY);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(title, margin, baseY);
  }
  if (subtitle) {
    const subSize = Math.max(15, (titleSize || H * 0.07) * 0.3);
    const subY = baseY - (titleSize ? titleSize * 1.12 : subSize * 1.4);
    ctx.font = `${Math.round(subSize)}px Anton, sans-serif`;
    try {
      ctx.letterSpacing = `${Math.round(subSize * 0.42)}px`;
    } catch (err) {
      ctx.letterSpacing = "0px";
    }
    ctx.lineJoin = "round";
    ctx.lineWidth = subSize * 0.16;
    ctx.strokeStyle = "rgba(16, 6, 28, 0.9)";
    ctx.strokeText(subtitle, margin, subY);
    ctx.fillStyle = grade.accent;
    ctx.fillText(subtitle, margin, subY);
    try {
      ctx.letterSpacing = "0px";
    } catch (err) {
      ctx.letterSpacing = "0px";
    }
    if (title) {
      ctx.fillStyle = grade.accent;
      ctx.fillRect(margin, subY + subSize * 0.42, Math.min(W * 0.16, titleSize * 1.7), Math.max(3, subSize * 0.16));
    }
  }
  ctx.restore();
}

export function drawCover(ctx, W, H, state) {
  const grade = getGrade(state.gradeId);
  const polys = panelsFor(state.layoutId, W, H);
  ctx.save();
  ctx.fillStyle = "#170b2e";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < polys.length; i++) {
    const panel = state.panels[i] || { img: null, zoom: 1, dx: 0, dy: 0 };
    if (panel.img && panel.img.naturalWidth > 0) {
      drawPanelPhoto(ctx, polys[i], panel, grade);
    } else {
      drawEmptyPanel(ctx, polys[i], i, W, H);
    }
  }
  paintOverlays(ctx, W, H, grade);
  paintVignette(ctx, W, H);
  for (const poly of polys) {
    tracePolygon(ctx, poly);
    ctx.strokeStyle = "#12081f";
    ctx.lineWidth = Math.max(6, W * 0.015);
    ctx.lineJoin = "round";
    ctx.stroke();
    tracePolygon(ctx, poly);
    ctx.strokeStyle = "#fdf6ec";
    ctx.lineWidth = Math.max(3, W * 0.008);
    ctx.stroke();
  }
  paintCaption(ctx, W, H, state, grade);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = Math.max(2, W * 0.0022);
  ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, W - ctx.lineWidth * 2, H - ctx.lineWidth * 2);
  ctx.restore();
  return polys;
}
