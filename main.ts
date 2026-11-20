import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const here = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(out, { recursive: true });

const appSrc = join(here, "app");
const shotsSrc = join(here, "screenshots");
if (existsSync(appSrc)) {
  cpSync(appSrc, join(out, "app"), { recursive: true });
}
if (existsSync(shotsSrc)) {
  cpSync(shotsSrc, join(out, "screenshots"), { recursive: true });
}

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000
};

writeFileSync(join(out, "dossier.json"), buildDossier(out, caps));
