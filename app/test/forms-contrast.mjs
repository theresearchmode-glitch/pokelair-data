// Pre-launch check 5c (Nov 17): every forms-strip label on Pokémon pages reads at 4.5:1 or more against its tile, day and night
// (the current form's label at 85% opacity read 4.14:1). Exit 1 on failure.   PAGE=app/dist/v2.html node app/test/forms-contrast.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const b = await chromium.launch(); const page = path.resolve(process.env.PAGE || process.argv[2] || 'app/dist/v2.html'), out = [];
const mons = ['garchomp','charizard','raichu','floette','salamence','gardevoir','lucario','tyranitar','gengar','kangaskhan','metagross','aerodactyl'];
for (const sch of ['light', 'dark']) { const p = await b.newPage({viewport: {width: 1280, height: 900}, colorScheme: sch});
  for (const m of mons) { await p.goto('file://' + page + '#pokemon=' + m); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => { const rgb = c => { const n = c.match(/[\d.]+/g).map(Number); return /^color\(srgb/.test(c) ? n.slice(0, 3).map(v => v * 255).concat(n.length > 3 ? [n[3]] : []) : n; }, lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
      const bgOf = e => { while (e) { const c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return rgb(c); e = e.parentElement; } return [255, 255, 255]; };
      const opOf = e => { let o = 1; while (e && !e.matches('.pk-forms a')) { o *= +getComputedStyle(e).opacity; e = e.parentElement; } return o; };
      return [...document.querySelectorAll('.pk-forms a small')].map(e => { const bg = bgOf(e), fg = rgb(getComputedStyle(e).color), o = opOf(e) * (fg[3] == null ? 1 : fg[3]);
        const mix = fg.slice(0, 3).map((v, i) => v * o + bg[i] * (1 - o)), a = lum(mix), c = lum(bg); return {cur: !!e.closest('[aria-current]'), r: +((Math.max(a, c) + .05) / (Math.min(a, c) + .05)).toFixed(2)}; }); });
    r.forEach(x => out.push({sch, m, ...x})); }
  await p.close(); }
await b.close(); const low = out.filter(x => x.r < 4.5);
console.log(`labels measured ${out.length}; under 4.5:1: ${low.length}`); low.slice(0, 12).forEach(x => console.log(`  FAIL ${x.sch} ${x.m} ${x.cur ? 'current' : 'other'} ${x.r}`));
console.log(`forms-contrast: ${low.length ? low.length + ' failed' : 'all passed'}`); process.exit(low.length || !out.length ? 1 : 0);
