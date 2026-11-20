/* Handover entry point for Vice Cover Studio.
   Copies the app and its screenshots into the output directory
   and writes a dossier describing the bundle. */

import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const here = dirname(fileURLToPath(import.meta.url));
const target = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(target, { recursive: true });
cpSync(join(here, "app"), join(target, "app"), { recursive: true });
cpSync(join(here, "screenshots"), join(target, "screenshots"), { recursive: true });

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

const dossier = buildDossier(target, caps);
writeFileSync(join(target, "dossier.json"), JSON.stringify(dossier, null, 2) + "\n");
console.log("Wrote bundle to " + target);
