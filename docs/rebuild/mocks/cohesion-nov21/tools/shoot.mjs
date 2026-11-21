// Pictures + house-rule checks for mock-ups. node shoot.mjs team build ...   (ids as in PAGES.md; extra files like team-b use the same nn)
import { createRequire } from 'module'; import fs from 'fs';
const { chromium } = createRequire('C:/Users/simra/code/pl-mascot/package.json')('playwright');
const WT = 'C:/Users/simra/code/pl-cohesion', DIR = WT + '/docs/rebuild/mocks/cohesion-nov21/pages', PICS = WT + '/docs/rebuild/pics/nov21/cohesion/all';
fs.mkdirSync(PICS, { recursive: true });
const NN = { home: 1, build: 2, team: 3, 'team-empty': 4, sheet: 5, box: 6, compare: 7, battle: 8, calc: 9, speed: 10, types: 11, practice: 12, gauntlet: 13, meta: 14, usage: 15, sets: 16, archetypes: 17, tournaments: 18, events: 19, weekly: 20, news: 21, gifts: 22, track: 23, method: 24, about: 25, feedback: 26, pokemon: 27, notfound: 28, owner: 29 };
const BIG5 = ['home', 'build', 'team', 'calc', 'meta'];
const SCALE = [13, 15, 16, 17, 20, 22, 24, 26, 28, 34];
const CHECK = scale => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const leaves = [...document.querySelectorAll('main *')].filter(e => vis(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
  const off = [], smallU = [], cut = [];
  for (const e of leaves) { const s = getComputedStyle(e), px = Math.round(parseFloat(s.fontSize) * 100) / 100, t = e.textContent.trim().slice(0, 28);
    if (px <= 34 && !scale.includes(px)) off.push(`${px}px "${t}"`);
    if (/^U\b|Unbounded/.test(s.fontFamily) && px < 15) smallU.push(`${px}px "${t}"`);
    if (e.scrollWidth > e.clientWidth + 1 && s.overflow !== 'visible' || s.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth) cut.push(`"${t}"`);
    const r = e.getBoundingClientRect(); const box = e.closest(".rc,.row,.panel,.mv,.w,.go,.chk"); if (box && r.right > box.getBoundingClientRect().right + 4) cut.push(`spills "${t}"`); if (r.right > innerWidth + 1) cut.push(`off-screen "${t}"`); }
  const taps = [...document.querySelectorAll('main a,main button,main .w,main input,main select,main textarea,main .mv.tap')].filter(vis).filter(e => e.getBoundingClientRect().height < 43.5).map(e => `${Math.round(e.getBoundingClientRect().height)}px "${e.textContent.trim().slice(0, 24)}"`);
  const lone = []; for (const g of document.querySelectorAll('main *')) { const s = getComputedStyle(g); if (s.display !== "grid" || g.classList.contains("row") || g.classList.contains("chk") || g.classList.contains("stamp") || g.closest(".row")) continue; const cols = s.gridTemplateColumns.split(' ').length; const kids = [...g.children].filter(vis).filter(k => getComputedStyle(k).gridColumnEnd !== "-1"); if (cols > 1 && kids.length > cols && kids.length % cols === 1) lone.push(`${g.className || g.tagName} ${kids.length} in ${cols} cols`); }
  return { off: [...new Set(off)], smallU: [...new Set(smallU)], cut: [...new Set(cut)], taps: [...new Set(taps)], hscroll: document.documentElement.scrollWidth > innerWidth + 1, lone, h: document.documentElement.scrollHeight };
};
const b = await chromium.launch(); const report = {};
for (const file of process.argv.slice(2)) {
  const id = file.replace(/-b$/, ''), nn = String(NN[id]).padStart(2, '0'), suf = file === id ? '' : file.slice(id.length);
  const shots = [[1440, 1, ''], [390, 2, '']]; if (BIG5.includes(id)) shots.push([1040, 1, ''], [1440, 1, 'night'], [390, 2, 'night'], [1040, 1, 'night']);
  for (const [wd, dsf, th] of shots) {
    const p = await b.newPage({ viewport: { width: wd, height: wd === 390 ? 844 : 900 }, deviceScaleFactor: dsf, isMobile: wd === 390 });
        await p.goto('file:///' + DIR + '/' + file + '.html'); if (th) await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'night')); await p.waitForTimeout(500);
    if (!th && (wd === 390 || wd === 1440)) (report[file] ||= {})[wd] = await p.evaluate(CHECK, SCALE);
    report[file] ||= {}; report[file].broken = (report[file].broken || 0) + await p.evaluate(() => [...document.images].filter(i => !i.naturalWidth).length);
    await p.screenshot({ path: `${PICS}/${nn}-${id}${suf}-${wd}${th ? '-night' : ''}.png`, fullPage: true }); await p.close();
  }
}
await b.close();
fs.writeFileSync(new URL('./checks.json', import.meta.url), JSON.stringify(Object.assign(JSON.parse(fs.existsSync(new URL('./checks.json', import.meta.url)) ? fs.readFileSync(new URL('./checks.json', import.meta.url), 'utf8') : '{}'), report), null, 1));
for (const [f, r] of Object.entries(report)) { console.log(`== ${f} broken-img:${r.broken}`); for (const wd of [390, 1440]) { const c = r[wd]; console.log(` ${wd}: len ${(c.h / (wd === 390 ? 844 : 900)).toFixed(2)} | off-scale ${c.off.length} ${c.off.slice(0, 4).join('; ')} | Unb<15 ${c.smallU.length} ${c.smallU.slice(0, 3).join('; ')} | cut ${c.cut.length} ${c.cut.slice(0, 3).join('; ')} | taps<44 ${c.taps.length} ${c.taps.slice(0, 4).join('; ')} | hscroll ${c.hscroll} | lone ${c.lone.join('; ')}`); } }
