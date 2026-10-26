// In-game ranked doubles (op.gg): the official Ranked Battle usage order for the current season. The Double tab loads
// through a page action, so this opens the page in a headless browser, switches to Double and reads the ranking.
// Writes out/meta_ingame.json (same shape as the other meta files; ranks only, sets come from the other sources).
import fs from 'node:fs';
import {chromium} from 'playwright';
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const ROSTER = new Set(readJSON('roster.json', []));
const cap = s => s.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
// op.gg keys: "indeedee-female", "ninetales-alolan", "tauros-paldean-aqua", "rotom-frost", "typhlosion-hisui"
function mapKey(key, name) {
  const k = key.toLowerCase(); let m;
  const tries = [];
  if (/^floette-eternal/.test(k)) tries.push('Floette-Eternal');
  if ((m = k.match(/^tauros-paldean-(aqua|blaze|combat)/))) tries.push('Tauros-Paldea-' + cap(m[1]));
  if ((m = k.match(/^rotom-(wash|heat|frost|fan|mow)$/))) tries.push('Rotom-' + cap(m[1]));
  if ((m = k.match(/^(.*)-(alolan|galarian|hisuian|hisui|paldean)$/))) tries.push(cap(m[1].replace(/-/g, ' ')).replace(/ /g, '-') + '-' + {alolan: 'Alola', galarian: 'Galar', hisuian: 'Hisui', hisui: 'Hisui', paldean: 'Paldea'}[m[2]]);
  if ((m = k.match(/^(.*)-female$/))) tries.push(cap(m[1]) + '-F');
  if ((m = k.match(/^(.*)-male$/))) tries.push(cap(m[1]));
  if ((m = k.match(/^lycanroc-(dusk|midnight)/))) tries.push('Lycanroc-' + cap(m[1]));
  const plain = String(name || '').replace(/ \(.*\)$/, '').replace(/'/g, '’');
  tries.push(plain, cap(k.replace(/-/g, ' ')).replace(/ /g, '-'), plain.split(' ').pop());
  for (const t of tries) if (ROSTER.has(t)) return t;
  return null; }
const browser = await chromium.launch();
try {
  const pg = await browser.newPage({userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'});
  await pg.goto('https://op.gg/pokemon-champions/tier', {waitUntil: 'domcontentloaded', timeout: 60000});
  await pg.waitForTimeout(3000);
  const first = async () => pg.evaluate(() => { const a = document.querySelector('a[href*="/pokemon-champions/pokedex/"]'); return a ? a.getAttribute('href') : null; });
  const before = await first();
  await pg.getByRole('tab', {name: 'Double'}).first().click();
  for (let i = 0; i < 40; i++) { const f = await first(); if (f && f !== before) break; await pg.waitForTimeout(500); }
  await pg.waitForTimeout(1000);
  const rows = await pg.evaluate(() => [...document.querySelectorAll('a[href*="/pokemon-champions/pokedex/"]')].map(a => {
    const key = a.getAttribute('href').split('/').pop().split('?')[0], img = a.querySelector('img');
    const t = a.innerText.replace(/\s+/g, ' ').trim(), rk = +((t.match(/^#?(\d+)/) || [])[1] || 0);
    return {key, name: img ? img.getAttribute('alt') : t, rank: rk}; }));
  const season = await pg.evaluate(() => (document.body.innerText.match(/\bM-\d+\b/) || [''])[0]);
  const now = await first();
  if (!now || now === before || rows.length < 50) throw new Error('Double ranking did not load');
  const seen = new Set(), top = [], miss = [];
  rows.forEach((r, i) => { const n = mapKey(r.key, r.name); if (!n) { miss.push(r.key); return; } if (seen.has(n)) return; seen.add(n); top.push({r: top.length + 1, n, rank: r.rank || i + 1}); });
  const out = {format: 'doubles', kind: 'ingame', source: `op.gg · official in-game Ranked Doubles${season ? ', season ' + season : ''}`, period: season || '', updated: new Date().toISOString(),
    note: 'Usage order from in-game ranked battles. Moves, items and natures shown come from tournament and ladder data.', top: top.slice(0, 60), more: top.slice(60)};
  fs.writeFileSync('out/meta_ingame.json', JSON.stringify(out));
  console.log(`opgg: ${top.length} Pokémon ranked (${season})${miss.length ? ', not mapped: ' + miss.join(', ') : ''}`);
} finally { await browser.close(); }
