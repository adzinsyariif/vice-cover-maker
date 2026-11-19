/*
 * The poster renderer for Vice Cover Studio.
 *
 * drawPoster paints a complete cover onto a 2D context at an exact
 * size: photo panels clipped to slanted polygons, a colour grade over
 * the whole poster, bold off-white panel separators, the caption in a
 * heavy condensed face, and a vignette with a fine outer frame.
 */

import { panelsFor, polygonBounds } from './layouts.js';
import { gradeById } from './grades.js';

const INK = '#17102a';
const PAPER = '#fdf6ec';

/* Traces a polygon as the current path. */
function tracePath(ctx, poly) {
  ctx.beginPath();
  poly.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

/*
 * Placeholder art for an empty panel: a deep purple-to-teal wash, a
 * faint oversized panel number, and a simple palm frond drawn with a
 * few curved strokes.
 */
function drawPlaceholder(ctx, poly, index, W, H) {
  const [bx, by, bw, bh] = polygonBounds(poly);
  const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  grad.addColorStop(0, '#3b1660');
  grad.addColorStop(0.55, '#1d2f6e');
  grad.addColorStop(1, '#0d5a5e');
  ctx.fillStyle = grad;
  ctx.fillRect(bx, by, bw, bh);

  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.13)';
  ctx.font = `${Math.round(bh * 0.52)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(index + 1), cx, cy + bh * 0.02);
  ctx.textBaseline = 'alphabetic';

  /* A palm frond: one stem curve with tapering leaflets. */
  const baseX = cx - bw * 0.3;
  const baseY = by + bh * 0.92;
  const tipX = cx + bw * 0.26;
  const tipY = by + bh * 0.14;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2, W * 0.0035);
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.quadraticCurveTo(baseX + bw * 0.05, by + bh * 0.45, tipX, tipY);
  ctx.stroke();
  ctx.lineWidth = Math.max(1.5, W * 0.0022);
  for (let i = 1; i <= 6; i += 1) {
    const t = i / 7;
    const px = baseX + (tipX - baseX) * t + bw * 0.03 * Math.sin(t * 2.4);
    const py = baseY + (tipY - baseY) * t;
    const len = bw * 0.16 * (1 - t * 0.45);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + len * 0.6, py - len * 0.25, px + len, py + len * 0.28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px - len * 0.55, py - len * 0.3, px - len * 0.9, py + len * 0.18);
    ctx.stroke();
  }
}

/*
 * Draws one panel: the photo cover-fitted into the polygon bounding
 * box (scaled by the panel zoom, shifted by the panel offsets, both
 * in panel-size fractions), filtered by the grade, clipped to the
 * polygon. Empty panels get the placeholder art.
 */
function drawPanel(ctx, poly, panel, index, grade, W, H) {
  ctx.save();
  tracePath(ctx, poly);
  ctx.clip();
  const img = panel ? panel.img : null;
  if (img && img.naturalWidth > 0) {
    const [bx, by, bw, bh] = polygonBounds(poly);
    const zoom = panel.zoom || 1;
    const scale = Math.max(bw / img.naturalWidth, bh / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = bx + (bw - dw) / 2 + (panel.dx || 0) * bw;
    const dy = by + (bh - dh) / 2 + (panel.dy || 0) * bh;
    ctx.filter = grade.filter;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = 'none';
  } else {
    drawPlaceholder(ctx, poly, index, W, H);
  }
  ctx.restore();
}

/* Paints the grade overlay gradients across the whole poster. */
function drawOverlays(ctx, grade, W, H) {
  for (const overlay of grade.overlays) {
    const grad = ctx.createLinearGradient(
      overlay.from[0] * W,
      overlay.from[1] * H,
      overlay.to[0] * W,
      overlay.to[1] * H,
    );
    for (const [offset, colour] of overlay.stops) grad.addColorStop(offset, colour);
    ctx.save();
    ctx.globalCompositeOperation = overlay.composite;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

/* A soft radial vignette that darkens the poster edges. */
function drawVignette(ctx, W, H, strength) {
  const radius = Math.hypot(W, H) / 2;
  const grad = ctx.createRadialGradient(W / 2, H / 2, radius * 0.42, W / 2, H / 2, radius * 1.02);
  grad.addColorStop(0, 'rgba(10, 3, 22, 0)');
  grad.addColorStop(1, `rgba(10, 3, 22, ${strength})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

/*
 * The caption block, bottom-left: a short accent rule, the subtitle
 * in letter-spaced accent capitals, and the title in Anton, fitted
 * to at most 92 percent of the poster width, white with a dark
 * outline and a soft drop shadow. A gentle dark scrim behind the
 * block keeps the lettering readable over bright photos.
 */
function drawCaption(ctx, state, grade, W, H) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  if (!title && !subtitle) return;

  const margin = W * 0.048;
  const bottom = H - H * 0.052;

  let titleSize = 0;
  if (title) {
    titleSize = H * 0.115;
    ctx.font = `${titleSize}px Anton, sans-serif`;
    while (ctx.measureText(title).width > W * 0.92 && titleSize > 10) {
      titleSize *= 0.94;
      ctx.font = `${titleSize}px Anton, sans-serif`;
    }
  }
  const subSize = Math.max(11, (titleSize || H * 0.08) * 0.30);
  const titleBaseline = bottom;
  const subBaseline = title ? titleBaseline - titleSize * 1.22 : bottom;
  const blockTop = (subtitle ? subBaseline - subSize * 1.5 : titleBaseline - titleSize * 1.15);

  const scrim = ctx.createLinearGradient(0, blockTop - H * 0.06, 0, H);
  scrim.addColorStop(0, 'rgba(12, 4, 26, 0)');
  scrim.addColorStop(1, 'rgba(12, 4, 26, 0.52)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, blockTop - H * 0.06, W, H - blockTop + H * 0.06);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  if (subtitle) {
    ctx.fillStyle = grade.accent;
    ctx.fillRect(margin, subBaseline - subSize * 1.72, W * 0.085, Math.max(2, H * 0.007));
    ctx.font = `700 ${subSize}px system-ui, sans-serif`;
    try {
      ctx.letterSpacing = `${Math.round(subSize * 0.34)}px`;
    } catch (err) {
      ctx.letterSpacing = '0px';
    }
    ctx.shadowColor = 'rgba(8, 2, 18, 0.65)';
    ctx.shadowBlur = subSize * 0.35;
    ctx.shadowOffsetY = subSize * 0.06;
    ctx.lineWidth = subSize * 0.14;
    ctx.strokeStyle = 'rgba(10, 4, 22, 0.55)';
    ctx.lineJoin = 'round';
    ctx.strokeText(subtitle, margin, subBaseline);
    ctx.fillText(subtitle, margin, subBaseline);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    try {
      ctx.letterSpacing = '0px';
    } catch (err) {
      ctx.letterSpacing = '0px';
    }
  }

  if (title) {
    ctx.font = `${titleSize}px Anton, sans-serif`;
    ctx.shadowColor = 'rgba(8, 2, 18, 0.6)';
    ctx.shadowBlur = titleSize * 0.16;
    ctx.shadowOffsetY = titleSize * 0.05;
    ctx.lineWidth = titleSize * 0.15;
    ctx.strokeStyle = INK;
    ctx.lineJoin = 'round';
    ctx.strokeText(title, margin, titleBaseline);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = PAPER;
    ctx.fillText(title, margin, titleBaseline);
  }
}

/*
 * Draws the whole poster onto ctx at W by H from state:
 * { layoutId, gradeId, title, subtitle, panels } where each panel is
 * { img, zoom, dx, dy } and img may be null.
 */
export function drawPoster(ctx, W, H, state) {
  const grade = gradeById(state.gradeId);
  const polys = panelsFor(state.layoutId, W, H);

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  polys.forEach((poly, index) => {
    drawPanel(ctx, poly, state.panels[index], index, grade, W, H);
  });

  drawOverlays(ctx, grade, W, H);
  drawVignette(ctx, W, H, 0.26);

  /* Separators: a near-black under-stroke, then the off-white line. */
  for (const poly of polys) {
    tracePath(ctx, poly);
    ctx.lineWidth = W * 0.017;
    ctx.strokeStyle = INK;
    ctx.lineJoin = 'round';
    ctx.stroke();
    tracePath(ctx, poly);
    ctx.lineWidth = W * 0.008;
    ctx.strokeStyle = PAPER;
    ctx.stroke();
  }

  drawCaption(ctx, state, grade, W, H);

  /* Finish: a fine outer frame and a last whisper of vignette. */
  ctx.strokeStyle = 'rgba(253, 246, 236, 0.85)';
  ctx.lineWidth = Math.max(2, W * 0.0035);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
  drawVignette(ctx, W, H, 0.14);
}

/* Convenience wrapper: draws state onto a canvas at its own size. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  drawPoster(ctx, canvas.width, canvas.height, state);
}
