// Preview-only Shady Paw (Sim, Nov 9): "hold off on putting Shady Paw on the live website; put him on the Preview so I can see
// everything as we work." The live build (dist/page.html) never contains him. This script copies the built page and adds one
// small <script> that sets window.NP_PAW to the cut-out drawing (docs/mascot/shady-paw-cutout.webp, from the integration
// mock-up Sim chose). The app shows him only where window.NP_PAW is set, so the same code is safe on live.
// Usage: node app/preview-mascot.mjs <out.html>
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const dir = fileURLToPath(new URL('.', import.meta.url));
const out = process.argv[2]; if (!out) { console.error('usage: node app/preview-mascot.mjs <out.html>'); process.exit(1); }
const page = fs.readFileSync(dir + 'dist/page.html', 'utf8');
const img = fs.readFileSync(dir + '../docs/mascot/shady-paw-cutout.webp').toString('base64');
const tag = `<script>window.NP_PAW='data:image/webp;base64,${img}';</script>`;
const at = page.indexOf('<script'); if (at < 0) throw new Error('no <script> in page');
fs.writeFileSync(out, page.slice(0, at) + tag + page.slice(at));
console.log(`preview with Shady Paw -> ${out} (+${(tag.length / 1024).toFixed(0)} KB)`);
