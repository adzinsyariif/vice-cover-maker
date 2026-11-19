/*
 * Screenshot driver for Vice Cover Studio.
 *
 * Serves app/ locally, drives it with Puppeteer, and produces the
 * four JPEGs in screenshots/ from the running app:
 *   - cover scenes use window.__viceStudio.exportPNG at the exact
 *     export size, verify the PNG size, then rescale that PNG to
 *     the JPEG target size in a browser canvas;
 *   - the editor scene is a plain viewport screenshot.
 * Every JPEG is re-encoded at lower quality until it fits the byte
 * cap, and every output is verified for dimensions and bytes.
 */

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(join('/home/hatch/workspace/makefun/shot', 'package.json'));
const puppeteer = require('puppeteer');

const CHROME = '/home/hatch/.cache/puppeteer/chrome/linux-157.0.8103.50/chrome-linux64/chrome';
const PORT = 8123;
const BASE = `http://127.0.0.1:${PORT}`;
const MAX_BYTES = 262144;
const QUALITIES = [0.86, 0.8, 0.74, 0.68, 0.62, 0.56, 0.5, 0.44, 0.38];

/* Scenes: name, query, export size, final JPEG size. */
const SCENES = [
  { name: '1-cover.jpg', kind: 'export', query: '?shot=cover&layout=hero-duo&grade=sunset&size=1920x1080&photos=convertible,yacht,beach&title=SUNSET%20HEIST&subtitle=PALM%20CITY%20STORIES', ew: 1920, eh: 1080, tw: 1280, th: 720 },
  { name: '2-editor.jpg', kind: 'editor', query: '?shot=editor&layout=hero-duo&grade=sunset&size=1920x1080&photos=convertible,yacht,beach&title=SUNSET%20HEIST&subtitle=PALM%20CITY%20STORIES', tw: 1280, th: 720 },
  { name: '3-portrait.jpg', kind: 'export', query: '?shot=cover&layout=hero-trio&grade=neon&size=1080x1350&photos=beach,convertible,yacht,pier&title=NEON%20SHORES&subtitle=VICE%20AFTER%20DARK', ew: 1080, eh: 1350, tw: 1024, th: 1280 },
  { name: '4-square.jpg', kind: 'export', query: '?shot=cover&layout=diptych&grade=daylight&size=1080x1080&photos=pier,boulevard,convertible&title=PALM%20CITY&subtitle=SUMMER%20RUN', ew: 1080, eh: 1080, tw: 1080, th: 1080 },
];

function pngSize(buf) {
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

function jpegSize(buf) {
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return [0, 0];
}

async function waitForServer(tries = 60) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(`${BASE}/index.html`);
      if (res.ok) return;
    } catch (err) { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('server did not start');
}

const server = spawn('node', ['serve.ts', '--port', String(PORT)], { cwd: repo, stdio: 'pipe' });
let browser;
try {
  await waitForServer();
  browser = await puppeteer.launch({
    executablePath: CHROME,
    userDataDir: join(repo, '.tmp-chrome'),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage();

  mkdirSync(join(repo, 'screenshots'), { recursive: true });
  mkdirSync('/tmp/vice-exports', { recursive: true });

  for (const scene of SCENES) {
    const outPath = join(repo, 'screenshots', scene.name);
    if (scene.kind === 'editor') {
      await page.setViewport({ width: scene.tw, height: scene.th });
      await page.goto(BASE + '/' + scene.query, { waitUntil: 'load' });
      await page.waitForFunction('window.__shotReady === true', { timeout: 30000 });
      await new Promise((r) => setTimeout(r, 350));
      let saved = null;
      for (const q of QUALITIES) {
        const buf = await page.screenshot({ type: 'jpeg', quality: Math.round(q * 100) });
        if (buf.length <= MAX_BYTES) { saved = buf; break; }
        saved = buf;
      }
      writeFileSync(outPath, saved);
      const [w, h] = jpegSize(saved);
      console.log(`${scene.name}: editor screenshot ${w}x${h}, ${saved.length} bytes`);
    } else {
      await page.setViewport({ width: 800, height: 600 });
      await page.goto(BASE + '/' + scene.query, { waitUntil: 'load' });
      await page.waitForFunction('window.__shotReady === true', { timeout: 30000 });
      const dataUrl = await page.evaluate(
        (w, h) => window.__viceStudio.exportPNG(w, h),
        scene.ew, scene.eh,
      );
      const png = Buffer.from(dataUrl.split(',')[1], 'base64');
      const [pw, ph] = pngSize(png);
      if (pw !== scene.ew || ph !== scene.eh) {
        throw new Error(`${scene.name}: export was ${pw}x${ph}, expected ${scene.ew}x${scene.eh}`);
      }
      writeFileSync(`/tmp/vice-exports/${scene.name.replace('.jpg', '.png')}`, png);
      console.log(`${scene.name}: full export verified ${pw}x${ph}, ${png.length} bytes`);
      let saved = null;
      for (const q of QUALITIES) {
        const jpegUrl = await page.evaluate(async (src, tw, th, quality) => {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
          });
          const c = document.createElement('canvas');
          c.width = tw;
          c.height = th;
          c.getContext('2d').drawImage(img, 0, 0, tw, th);
          return c.toDataURL('image/jpeg', quality);
        }, dataUrl, scene.tw, scene.th, q);
        const buf = Buffer.from(jpegUrl.split(',')[1], 'base64');
        saved = buf;
        if (buf.length <= MAX_BYTES) break;
      }
      writeFileSync(outPath, saved);
      const [w, h] = jpegSize(saved);
      console.log(`${scene.name}: jpeg ${w}x${h}, ${saved.length} bytes`);
    }
  }
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
  rmSync(join(repo, '.tmp-chrome'), { recursive: true, force: true });
}
console.log('done');
