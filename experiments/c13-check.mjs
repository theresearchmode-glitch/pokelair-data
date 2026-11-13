// C13 check (Sim's fix plan, Part C, rule C13): the automated part of "done" for every built page of the new site.
// Runs on the BUILT page (app/dist), with the daily data fed in the way the live page gets it (as the proof scripts do), and
// reports per page and width: page height against the limit table (C1), sideways scroll, broken images, tap targets under 44px
// on touch widths (C8), focusable-but-hidden controls (C7, by the browser's own visibility test, not by size: a closed <details>
// reports a would-be size), lines of text repeated on the page (C3, partly), more than one main button on one screen (C4),
// and console errors.
// NOT covered (stay manual, say so in every report): C2 (claims need result lines), C3 beyond repeated lines (contradictions,
// counts that don't match their lists, buttons louder than what they do), C5 (no redraw after first paint: see the A5 test),
// C6 (one message per action), C9 (text legible behind the bars: needs eyes or a pixel test), C10 (links to unbuilt pages),
// C11 (symmetry), C12 (the use test: click, tab, sheets, change-and-undo, reload).
// Usage: node app/build.mjs --v2 --art=../src/v2/art/ && node experiments/c13-check.mjs [page.html] [views] [state]
//   C13_ENGINES=chromium  Chromium only (no WebKit on the machine); the report line says which engines ran
//   page   default app/dist/v2.html (build it with --art=../src/v2/art/ so pictures load from disk; then rebuild without)
//   views  comma list of hash views, default team,team-empty,box,compare
//   state  default | open (every <details> opened) | five (a 5-of-6 team) | apply (after Suggestion 1's Apply) | long (six longest names)
import {fileURLToPath, pathToFileURL} from 'node:url'; import path from 'node:path'; import fs from 'node:fs'; import {createRequire} from 'node:module';
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url))), require = createRequire(import.meta.url);
let pw; try { pw = require(path.join(ROOT, 'node_modules/playwright')); } catch (e) { pw = require('playwright'); }
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/history': rd('history.json'), 'meta/weekly': rd('weekly.json'), 'meta/track': rd('track.json'), 'meta/practice': rd('practice.json'), 'meta/calendar': rd('calendar.json')} /* same 13 docs as the behaviour harness (outside sweep, Nov 12) */;
const [file = path.join(ROOT, 'app/dist/v2.html'), viewArg = 'team,team-empty,box,compare', state = 'default'] = process.argv.slice(2);
// limits (docs/rebuild/page-heights.md, tool pages). 320 uses the 390 limit (Sim, Nov 12). Phone 3,700 (Sim, Nov 12; was 3,400); 320 3,900 (Sim chose options B+C+D, which reach 3,870).
const WIDTHS = [[320, 3900, ''], [390, 3700, ''], [820, 3500, ''], [1440, 1800, '']];
// Home has its own agreed limits (docs/rebuild/page-heights.md: phone 4,400 (Sim, Nov 12, was 4,200), iPad 3,500, desktop 2,700); 320 has none agreed,
// so it takes the phone limit + 200 like the tool pages do, and says the limit is assumed (Nov 12)
const HOME = {320: [4600, "assumed"], 390: [4400, ""], 820: [3500, ""], 1440: [2950, "first visit: welcome card allowed over 2,700 (Sim, Nov 12; 2,950 from 8:17 PM: the Meta grows with the daily data)"]};
// Battle (Sim, Nov 12, 10:15 PM, Q5 = A): the Battle log stays always shown, so Battle's limits rise a little
const BATTLE = {320: [4250, 'Battle log always shown (Sim, Nov 12)'], 390: [3750, 'Battle log always shown (Sim, Nov 12)'], 1440: [1850, 'Battle log always shown (Sim, Nov 12)']};
const touch = w => w < 1100;
const out = [], t0 = Date.now();
// C13_ENGINES=chromium runs Chromium only (for a PC without WebKit, e.g. the outside check); default: both engines
const ENGINES = (process.env.C13_ENGINES || 'chromium,webkit').split(',').map(x => x.trim()).filter(x => x === 'chromium' || x === 'webkit');
for (const eng of ENGINES) for (const view of viewArg.split(',')) for (let [w, limit, note] of WIDTHS) {
  if (view === "home" && HOME[w]) [limit, note] = HOME[w];
  if (view === 'battle' && BATTLE[w]) [limit, note] = BATTLE[w];
  if (eng === 'webkit' && w > 820) continue; // WebKit (iPhone/iPad Safari's engine) for phone and tablet widths
  const b = await pw[eng].launch(), ctx = await b.newContext({viewport: {width: w, height: w < 700 ? 844 : 900}, hasTouch: touch(w), isMobile: eng === 'chromium' ? false : w < 700});
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  await p.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  // C13_NO_CV=1 (testing the check itself): act like a browser without checkVisibility (as WebKit on Windows may be)
  if (process.env.C13_NO_CV) await p.addInitScript(() => { try { delete Element.prototype.checkVisibility; } catch (e) {} });
  await p.goto(pathToFileURL(path.resolve(file)).href + '#' + view); await p.waitForTimeout(2500);
  await p.waitForFunction(() => !document.querySelector('.sg2-wait,.cx2-busy'), null, {timeout: 90000}).catch(() => errs.push('still working after 90 s'));
  if (state === 'open') { await p.evaluate(() => document.querySelectorAll('#main details').forEach(d => { d.open = true; })); }
  // C1's worst states, set up through the page's own controls as a player would (the team lives in the page's private scope)
  const settle = async () => { await p.waitForTimeout(1500); await p.waitForFunction(() => !document.querySelector('.sg2-wait'), null, {timeout: 90000}).catch(() => errs.push('still working after 90 s')); await p.waitForTimeout(800); };
  if (view === 'battle' && state !== 'empty') { const b = p.locator('[data-btopp]').first(); if (await b.count()) { await b.click(); await p.waitForTimeout(500); await p.locator('[data-btteam="0"]').first().click(); await settle(); } else errs.push('no Enter Their Six to press'); } /* Battle (Nov 12): checked filled in, as a player sees it; state 'empty' checks the empty page */
  if (state === 'five' && view === 'team') { await p.locator('[data-tmsel="5"]').first().click(); await p.waitForTimeout(500); await p.locator('[data-v2rm]').first().click(); await settle(); }
  if (state === 'apply' && view === 'team') { const a = p.locator('[data-v2plan="0"]').first(); if (await a.count()) { await a.click(); await settle(); } else errs.push('no Apply to press'); }
  if (state === 'long' && view === 'team') { await p.locator('[data-v2more]').first().click(); await p.waitForTimeout(400); await p.locator('[data-v2import]').first().click(); await p.waitForTimeout(400);
    await p.fill('[data-impin]', ['Tauros-Paldea-Combat', 'Squawkabilly-Yellow', 'Toxtricity-Low-Key', 'Crabominable-Mega', 'Lycanroc-Midnight', 'Typhlosion-Hisui'].join('\n\n'));
    await p.locator('[data-impgo]').click(); await settle(); errs.push(...await p.evaluate(() => { const n = document.querySelector('[data-impnote]'); return n && n.textContent ? ['import: ' + n.textContent] : []; })); }
  await p.waitForTimeout(1200);
  // C13_PLANT=1 (testing the check itself): plant one fault of each kind; every count below must then go up
  if (process.env.C13_PLANT) await p.evaluate(() => document.querySelector('#main').insertAdjacentHTML('afterbegin', '<button style="opacity:0">Ghost</button><img src="art/nope.webp" alt="" width="40" height="40"><div style="width:3000px;height:4px"></div><button class="np-btn">Second main</button><button class="np-btn">Third main</button><button style="width:20px;height:20px">x</button><p>This exact sentence is planted twice on purpose.</p><p>This exact sentence is planted twice on purpose.</p>'));
  if (process.env.C13_PLANT) { await p.evaluate(() => console.error('planted console error')); await p.waitForTimeout(800); }
  const r = await p.evaluate(({touchW}) => {
    // shown = the same answer in every engine (Sim, Nov 12: WebKit on Windows counted 5 controls in a closed fold as 0x0 taps):
    // the browser says visible where it can, the box has a size, and it isn't inside a closed fold (its summary excepted) or hidden
    const vis = e => { if (e.checkVisibility && !e.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) return false;
      const q = e.getBoundingClientRect(); if (!(q.width > 0 && q.height > 0)) return false;
      if (e.closest('[hidden],[inert]')) return false; const d = e.closest('details:not([open])'); if (d && !(e.closest('summary') && e.closest('summary').parentElement === d)) return false;
      for (let a = e; a && a !== document.documentElement; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.contentVisibility === 'hidden' || +cs.opacity === 0) return false; }
      return true; };
    const H = document.documentElement.scrollHeight, sideways = document.documentElement.scrollWidth - innerWidth;
    // cut off at the edge: the page clips sideways overflow (overflow-x: clip), so look for visible boxes that run past the screen
    // edge, outside any box that scrolls sideways on purpose
    const scrollsX = e => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true; } return false; };
    const cut = [...document.querySelectorAll('#main *, .np-head *, .np-foot *')].filter(e => { const q = e.getBoundingClientRect(); return q.width && q.height && (q.right > innerWidth + 1 || q.left < -1) && vis(e) && !scrollsX(e); }).length;
    const imgs = [...document.querySelectorAll('img')].filter(i => vis(i) && i.complete && !i.naturalWidth).map(i => i.getAttribute('src'));
    const ctl = 'a[href],button,summary,input,select,textarea,[role=button],[tabindex]:not([tabindex="-1"])';
    const all = [...document.querySelectorAll(ctl)];
    // inline links inside a sentence are exempt from the 44px rule (decisions.md, review item 7)
    const inSentence = e => e.tagName === 'A' && getComputedStyle(e).display === 'inline' && [...e.parentNode.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    // a control smaller than 44 still passes when its tap area reaches 44x44: tap 21px out from its centre each way (an invisible
    // ::before area counts, as it does for a finger); scrolled to the middle of the screen first so no fixed bar covers it
    const reaches = e => { e.scrollIntoView({block: 'center', inline: 'center'}); const q = e.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
      return [[cx - 21, cy], [cx + 21, cy], [cx, cy - 21], [cx, cy + 21]].every(([x, y]) => { const h = document.elementFromPoint(x, y); return h && (h === e || e.contains(h)); }); };
    const small = touchW ? all.filter(e => vis(e) && !inSentence(e) && !e.closest('.vh')).map(e => [e, e.getBoundingClientRect()]).filter(([e, q]) => (q.width < 43.5 || q.height < 43.5) && !reaches(e))
      .map(([e, q]) => `${(e.getAttribute('aria-label') || e.textContent || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 30)} ${Math.round(q.width)}x${Math.round(q.height)}`) : [];
    // focusable but hidden: can take focus (not disabled, no tabindex -1, not inert) while the browser says it isn't visible
    // (tested by really focusing it: display:none and closed-<details> content can't take focus, whatever their tabindex says)
    // Nov 12: controls inside a closed fold are skipped: Windows WebKit lets a SCRIPT focus them, but real Tab presses never land
    // there (Sim's PC, experiments/hidden-why.cjs: 6 reached by script, 0 by keys, at 390 and 820), so they were false reports
    const was = document.activeElement, hidden = all.filter(e => { if (e.disabled || e.tabIndex < 0 || e.closest('.vh') || vis(e)) return false; { const d = e.closest('details:not([open])'); if (d && !(e.closest('summary') && e.closest('summary').parentElement === d)) return false; } try { e.focus({preventScroll: true}); } catch (x) { return false; } return document.activeElement === e; })
      .map(e => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 30)); try { was && was.focus && was.focus({preventScroll: true}); } catch (x) {}
    // repeated lines: the same visible line of 24+ characters more than once in the page's main area
    scrollTo(0, 0);
    const lines = (document.querySelector('#main') || document.body).innerText.split('\n').map(s => s.trim()).filter(s => s.length >= 24);
    const cnt = {}; lines.forEach(s => { cnt[s] = (cnt[s] || 0) + 1; }); const rep = Object.entries(cnt).filter(([, n]) => n > 1).map(([s, n]) => `${n}x "${s.slice(0, 50)}"`);
    // main buttons on one screen: slide a window of one screen down the page and count visible .np-btn inside it
    const mains = [...document.querySelectorAll('.np-btn')].filter(vis).map(e => e.getBoundingClientRect().top + scrollY);
    let most = 0, at = 0; for (let y = 0; y < H; y += innerHeight / 4) { const n = mains.filter(t => t >= y && t < y + innerHeight).length; if (n > most) { most = n; at = y; } }
    return {H, sideways, cut, imgs, small, hidden, rep, most, at: Math.round(at), sample: !!document.querySelector('.tm-sample')};
  }, {touchW: touch(w)});
  // Sim, Nov 12 (option A): the first-visit sample team, which shows the sample-team note, may be 50px taller on phones
  if (r.sample && w === 390) limit += 50;
  const pics = r.imgs.length ? `broken images ${r.imgs.length}` : 'images ok';
  out.push(`${eng.padEnd(8)} ${view.padEnd(10)} ${String(w).padStart(4)}  height ${r.H}${r.H > limit ? ` OVER ${limit}` : ` ok (${limit})`}${note ? ' [limit ' + (note === 'assumed' ? 'assumed' : note) + ']' : ''}; sideways ${r.sideways > 0 ? r.sideways + 'px' : 0}; cut off ${r.cut}; ${pics}; tap<44 ${r.small.length}${r.small.length ? ' [' + r.small.slice(0, 4).join('; ') + (r.small.length > 4 ? '; …' : '') + ']' : ''}; hidden-focusable ${r.hidden.length}${r.hidden.length ? ' [' + r.hidden.slice(0, 3).join('; ') + ']' : ''}; repeated ${r.rep.length}${r.rep.length ? ' [' + r.rep.slice(0, 2).join('; ') + ']' : ''}; main buttons/screen ${r.most}${r.most > 1 ? ' (at y ' + r.at + ')' : ''}; errors ${errs.length}${errs.length ? ' [' + [...new Set(errs)].slice(0, 2).join(' | ') + ']' : ''}`);
  await b.close(); }
console.log(out.join('\n'));
console.log(`c13 check (${state}; ${ENGINES.join(' + ')}): ${out.length} page/width runs; ${out.filter(l => / OVER /.test(l)).length} over height; ${Math.round((Date.now() - t0) / 1000)}s. Not covered: C2, C3 (beyond repeated lines), C5, C6, C9, C10, C11, C12.`);
