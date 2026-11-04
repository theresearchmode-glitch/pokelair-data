// Builds the separate "NastyPlot Redesign" page (Sim, Nov 4): the same app with the Light touch Character Select layer.
// node app/build-redesign.mjs → app/dist/redesign.html. The live page (dist/page.html) is not touched.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const dir = fileURLToPath(new URL('.', import.meta.url));
execFileSync(process.execPath, [dir + 'build.mjs', '--parts=parts-redesign.json', '--out=dist/redesign.html', ...process.argv.slice(2)], {stdio: 'inherit'});
let s = fs.readFileSync(dir + 'dist/redesign.html', 'utf8');
// Fonts: Saira Extra Condensed (italic display), Onest (body), JetBrains Mono (labels and numbers).
s = s.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=Unbounded[^>]*>\s*/, '')
  .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=Instrument\+Sans[^>]*>/,
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Extra+Condensed:ital,wght@1,700;1,800;1,900&family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">');
// Type icons: the 18 Pictogram glyphs (24px grid, 45°/90° construction) replace the old set everywhere ticon() is used.
const G = {
  Normal: '<path d="M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16zm0 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8z" fill-rule="evenodd"/>',
  Fire: '<path d="M12 2l6 9v5a6 6 0 0 1-12 0v-5l3 3z"/>',
  Water: '<path d="M12 2l6 11a6 6 0 1 1-12 0z"/>',
  Electric: '<path d="M14 2L5 13h6l-2 9 10-12h-6z"/>',
  Grass: '<path d="M4 20v-7a8 8 0 0 1 8-8h8v7a8 8 0 0 1-8 8z"/>',
  Ice: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" fill="none" stroke="currentColor" stroke-width="2.6"/>',
  Fighting: '<path d="M4 8h4v8H4zM9 6h3v10H9zM13 6h3v10h-3zM17 8h3v8h-3zM4 17h16v3H4z"/>',
  Poison: '<path d="M8 6a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM17 4a3 3 0 1 0 0 6a3 3 0 1 0 0-6zM16 14a3 3 0 1 0 0 6a3 3 0 1 0 0-6z"/>',
  Ground: '<path d="M9 4h6v3H9zM6 9h12v3H6zM3 14h18v3H3zM3 19h18v2H3z"/>',
  Flying: '<path d="M4 16l8-8 8 8" fill="none" stroke="currentColor" stroke-width="2.8"/>',
  Psychic: '<path d="M12 6L22 12 12 18 2 12zM12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5z" fill-rule="evenodd"/>',
  Bug: '<path d="M9 7h6v12H9zM3 9h5v2H3zM16 9h5v2h-5zM3 14h5v2H3zM16 14h5v2h-5zM8 3l2 3H8zM16 3l-2 3h2z"/>',
  Rock: '<path d="M8 3h8l5 9-5 9H8l-5-9z"/>',
  Ghost: '<path d="M5 21V11a7 7 0 0 1 14 0v10l-2.3-2.3L14.3 21 12 18.7 9.7 21l-2.4-2.3z"/>',
  Dragon: '<path d="M3 4l9 17 9-17-9 7z"/>',
  Dark: '<path d="M15 3a9 9 0 1 0 6 13a7 7 0 1 1-6-13z"/>',
  Steel: '<path d="M8 3h8l5 9-5 9H8l-5-9zM12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z" fill-rule="evenodd"/>',
  Fairy: '<path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>'};
let n = 0;
s = s.replace(/<symbol id="ti-([A-Za-z]+)" viewBox="0 0 24 24">[\s\S]*?<\/symbol>/g, (m, t) => G[t] ? (n++, `<symbol id="ti-${t}" viewBox="0 0 24 24" fill="currentColor">${G[t]}</symbol>`) : m);
s = s.replace(/<title>[^<]*<\/title>/, '<title>NastyPlot Redesign</title>');
fs.writeFileSync(dir + 'dist/redesign.html', s);
console.log(`redesign: ${n} type glyphs swapped, fonts and title set`);
