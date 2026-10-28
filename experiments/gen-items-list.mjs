// Writes app/src/data/items-list.js (REGMC_ITEMS) from data/regmc-items.txt, so the page can match hand-typed item names on
// tournament sheets ("Chopple Berry", "Grassy Seeds", "expertbelt", "salamencite") to the real item.
// Usage: node experiments/gen-items-list.mjs
import fs from 'node:fs'; import {fileURLToPath} from 'node:url';
const R = fileURLToPath(new URL('../', import.meta.url));
const items = fs.readFileSync(R + 'data/regmc-items.txt', 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
fs.writeFileSync(R + 'app/src/data/items-list.js', `// Every item legal in Reg M-C (${items.length}), from data/regmc-items.txt (experiments/gen-items-list.mjs).\nconst REGMC_ITEMS=${JSON.stringify(items)};\n`);
console.log('wrote', items.length, 'items');
