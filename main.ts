// Vice Cover Studio: handover program for this entry.
//
// The app itself is the app/ folder beside this file: plain static
// files (an HTML page, ES modules, a stylesheet, a font and sample
// photos) that a desktop browser runs fully offline. Nothing is
// built and nothing is fetched; this program simply copies app/ and
// screenshots/ into the output directory and writes dossier.json
// there with the vendored make.fun library, under the scorer's caps.
//
// Try the app locally first:
//   node serve.ts
// then open the local page the server prints.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for
// the output directory:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

copyTree(join(here, 'app'), join(outDir, 'app'));

const shotsFrom = join(here, 'screenshots');
if (existsSync(shotsFrom)) {
  copyTree(shotsFrom, join(outDir, 'screenshots'));
} else {
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
