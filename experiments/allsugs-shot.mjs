// All Suggestions sheet picture + height (Nov 18, Q5 C): node experiments/allsugs-shot.mjs <page.html> <width> <light|dark> [out.png] [label]
// Opens My Team with the README's 68 team and 20-Pokémon box (docs/rebuild/pics/nov18/README-allsugs-options.md), opens the sheet,
// lays it out at full height and shoots it at 2x with the label on the picture. Prints the sheet's height in screens (844 / 900).
import {chromium} from 'playwright'; import path from 'node:path';
const [PAGE0, W0, theme = 'light', out, label] = process.argv.slice(2), PAGE = path.resolve(PAGE0), W = +W0, H0 = W < 700 ? 844 : 900, dark = theme === 'dark';
const BOX = ['Absol', 'Archaludon', 'Azumarill', 'Basculegion', 'Garchomp', 'Incineroar', 'Kingambit', 'Sneasler', 'Whimsicott', 'Rillaboom', 'Charizard', 'Gengar', 'Dragonite', 'Tyranitar', 'Hydreigon', 'Amoonguss', 'Talonflame', 'Pelipper', 'Torkoal', 'Farigiraf'];
const TEAM = ['Garchomp', 'Kingambit', 'Sneasler', 'Basculegion', 'Archaludon', 'Azumarill'];
const st = {slots: TEAM.map(n => ({n, a: null, lock: false})), box: BOX, teams: [], loadedId: null, format: 'doubles', maxMega: 1, opp: [], excl: [], log: []};
const b = await chromium.launch(); const c = await b.newContext({viewport: {width: W, height: H0}, deviceScaleFactor: out ? 2 : 1, colorScheme: dark ? 'dark' : 'light', hasTouch: W < 1100, isMobile: W < 700});
const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
await p.addInitScript(([st, th]) => { window.__PL_TEST = 1; if (!sessionStorage.getItem('as')) { sessionStorage.setItem('as', 1); localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2099-01-01"'); localStorage.setItem('cc2.state', JSON.stringify(st)); localStorage.setItem('np2.theme', JSON.stringify(th)); localStorage.setItem('cc2.theme', JSON.stringify(th)); } }, [st, theme]);
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
await p.waitForFunction(() => window.V2 && V2.plan && V2.plan.plans && !document.querySelector('#main .sg2-wait'), null, {timeout: 120000}).catch(() => errs.push('busy'));
await p.waitForTimeout(1500); await p.evaluate(() => window.__ev('V2.openAllSugs()')); await p.waitForTimeout(2000);
await p.waitForFunction(() => [...document.querySelectorAll('.np-sheet img')].every(i => i.complete && i.naturalWidth > 0), null, {timeout: 20000}).catch(() => errs.push('imgs'));
const m = await p.evaluate(() => { const s = document.querySelector('.np-sheet'); return {h: s.scrollHeight, cards: s.querySelectorAll('.tm-sug > li').length, dark: document.documentElement.dataset.theme || getComputedStyle(document.body).backgroundColor}; });
if (out) { await p.addStyleTag({content: '.np-sheet{position:absolute;bottom:auto;max-height:none;overflow:visible}'});
  if (label) await p.evaluate(t => { const s = document.querySelector('.np-sheet'), d = document.createElement('div'); d.textContent = t; d.style.cssText = 'position:absolute;left:0;right:0;bottom:calc(100% + 8px);padding:8px 16px;background:#17161A;color:#fff;font:700 15px/1.3 "Instrument Sans",sans-serif;letter-spacing:.02em;z-index:5;border-radius:6px'; s.appendChild(d); }, label);
  const top = await p.evaluate(() => { const s = document.querySelector('.np-sheet'), l = s.lastElementChild, h = l && l.style.position === 'absolute' ? l.getBoundingClientRect().height : 0, t = Math.round(h + 24); s.style.top = t + 'px'; return t; });
  await p.setViewportSize({width: W, height: top + m.h + 32}); await p.waitForTimeout(1500); await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({path: out}); }
console.log(JSON.stringify({W, theme, sheetH: m.h, screens: +(m.h / H0).toFixed(2), cards: m.cards, errs}));
await b.close();
