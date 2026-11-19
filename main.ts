// Leonida Legend — a GTA VI trophy guide and tracker, handed in as a make.fun
// entry. The guide itself is the static web app in app/ (index.html, its CSS,
// its ES modules and data/trophies.json); it runs offline in a browser and
// loads nothing over the network. This program's whole job is the hand-in:
// copy app/ and screenshots/ from beside this file into the output directory
// and write dossier.json there with the kit's vendored buildDossier, byte for
// byte as the scorer builds it. vendor/makefun-frontend.ts stays untouched.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoDir, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The caps are the scorer's own (reference/gate.json): dossier text capped at
// 160 KiB, at most 4 screenshots of 256 KiB, app/ at most 993 entries / 48 MiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Leonida Legend handed in: app/ and screenshots/ copied to ${outputDir}, dossier.json written (${dossier.length} bytes).`);
