// Saved-data contract (Game Plan step "Saved-data contract holds"; map: docs/rebuild/saved-data.md): when the live artifact is
// republished with the new site, a player's saved data must carry over, and what the new site writes must still open on the old
// page (a player who goes back, or an old tab still open). The browser copy and the account copy are both seeded with data in the
// EXACT keys and shapes today's page writes (cc2.state with the current team, saved teams, box with forms and its order, settings,
// log, leads; the per-device keys cc2.theme, cc2.boxSort, cc2.pool ... np.practice), then:
//   SV-1  the new page reads them: My Team shows the six with their own item and moves and the loaded team's name; Saved Teams lists
//         the saved teams; My Box (the PC) shows every box Pokémon, forms included, in the saved order (cc2.boxSort "old"); the theme
//         applies; the settings and the Practice score are taken; a returning player sees no welcome card
//   SV-2  a change made in the new page (a Pokémon added to the box with Add a Pokémon, then swapped into the team from the box card)
//         is written back to cc2.state in the same shape: only the box (added at the end) and that one slot change; saved teams,
//         log, settings, singles sub-keys and the migration markers (boxV, megaV) are kept as they were; no per-device key is lost
//   SV-3  the new page reopens with the change (reload)
//   SV-4  today's page (dist/page.html) opens what the new page wrote and shows the same team, box and saved teams
//   SV-5  the same with a signed-in account (a fake data store answering data/users/<id>/state, plus today's daily documents from out/):
//         the account copy wins over a stale browser copy, the change goes out as a field-level update of only the changed fields in
//         the account document's own field names, and today's page opens the account document the new page left
// Known gaps are printed as "  GAP " and do not fail the run (STRICT=1 makes them fail): settings the new page keeps under its own
// np2.* keys, so a choice made there doesn't reach today's page or isn't read from it.
// Can't detect: real claude.ai storage or the real db service (both are stand-ins here); two devices at once (experiments/sync-logic.mjs);
// team and box links (#team= / #box=); usage/ and feedback/ writes; whether the switch republishes the same artifact URL.
// Usage: node app/build.mjs && node app/build.mjs --v2 && node app/test/v2-saved.mjs     (PAGE=... for another new build, OLD=... for another old one)
import {chromium} from 'playwright'; import {perfDoc} from '../data-docs.mjs'; import path from 'node:path'; import fs from 'node:fs'; import {fileURLToPath} from 'node:url'; import http from 'node:http';
const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const PAGE = path.resolve(process.env.PAGE || path.join(ROOT, 'app/dist/v2.html')), OLD = path.resolve(process.env.OLD || path.join(ROOT, 'app/dist/page.html'));
const STRICT = !!process.env.STRICT;
const fails = [], gaps = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const gap = (c, msg) => { if (c) return console.log('  pass  ' + msg); console.log((STRICT ? '  FAIL  ' : '  GAP   ') + msg); (STRICT ? fails : gaps).push(msg); };
for (const [f, n] of [[PAGE, 'new page'], [OLD, "today's page (node app/build.mjs)"]]) if (!fs.existsSync(f)) { console.log(`  FAIL  ${n} not built: ${f}`); process.exit(1); }
const J = x => JSON.stringify(x), same = (a, b) => J(a) === J(b), clone = x => JSON.parse(J(x));

// ---------- the saved data, in today's keys and shapes (saved-data.md 1.2-1.5) ----------
const SIX = ['Incineroar', 'Rotom-Wash', 'Garchomp', 'Ninetales-Alola', 'Kingambit', 'Basculegion-F'];
const slots = [{n: 'Incineroar', a: 'Intimidate', lock: false},
  {n: 'Rotom-Wash', a: null, lock: true},
  {n: 'Garchomp', a: 'Rough Skin', lock: false, mv: {doubles: ['Earthquake', 'Dragon Claw', 'Protect', 'Rock Slide'], singles: ['Earthquake', 'Swords Dance', 'Stealth Rock', 'Dragon Claw']},
    it: {doubles: 'Sitrus Berry', singles: 'Choice Scarf'}, sp: {doubles: {nat: 'Jolly', v: [2, 32, 0, 0, 0, 32]}}},
  {n: 'Ninetales-Alola', a: null, lock: false},
  {n: 'Kingambit', a: null, lock: false, sp: {doubles: {nat: 'Adamant', assumed: true}}},
  {n: 'Basculegion-F', a: null, lock: false}];
const SEED = {slots, box: ['Tauros-Paldea-Aqua', 'Incineroar', 'Rotom-Wash', 'Garchomp', 'Lycanroc-Dusk', 'Ninetales-Alola', 'Kingambit', 'Basculegion-F', 'Whimsicott', 'Farigiraf', 'Sneasler'],
  teams: [{id: 'tRainCheck1', name: 'Rain Check', slots: clone(slots), format: 'doubles', saved: 1762790000000},
    {id: 'tTrick2', name: 'Trick Room Test', slots: [{n: 'Kingambit', a: null, lock: false}, {n: 'Incineroar', a: null, lock: false}, ...Array(4).fill(0).map(() => ({n: '', a: null, lock: false}))], format: 'doubles', saved: 1762800000000},
    {id: 'tOldSingles3', name: 'Old Singles', slots: [{n: 'Garchomp', a: null, lock: false}, ...Array(5).fill(0).map(() => ({n: '', a: null, lock: false}))], format: 'singles', saved: 1761000000000}],
  loadedId: 'tRainCheck1', format: 'doubles', maxMega: 2, megaGoal: 1, megaV: 1, boxV: 2,
  opp: ['Kingambit', 'Incineroar', '', '', '', ''], excl: ['Farigiraf'],
  log: [{t: 1762790000000, r: 'W', b: ['Incineroar', 'Garchomp', 'Rotom-Wash', 'Kingambit'], tm: SIX, o: ['Sneasler', 'Kingambit', 'Incineroar', 'Whimsicott']},
    {t: 1762793600000, r: 'L', b: ['Garchomp', 'Kingambit', 'Incineroar', 'Rotom-Wash'], tm: SIX, o: ['Garchomp', 'Whimsicott', 'Sneasler', 'Kingambit']}],
  leads: ['Incineroar', 'Garchomp'], recentOpp: [['Kingambit', 'Sneasler', 'Whimsicott', 'Incineroar', 'Garchomp', 'Farigiraf']]};
// per-device keys, raw as today's page stores them (JSON-encoded through LS.set)
const PREFS = {'cc2.theme': '"dark"', 'cc2.boxSort': '"old"', 'cc2.pool': '"all"', 'cc2.recsrc': '"all"', 'cc2.absrc': '"all"', 'cc2.setSrc': '"tour"', 'cc2.setMon': '"Kingambit"',
  'cc2.welcomed': '"1"', 'cc2.seenNew': '"2026-10-28b"', 'np.practice': J({streak: 3, best: 7, played: 12, matched: 9}),
  'cc2.tview': '"full"', 'cc2.sprv': '"list"', 'cc2.lstab': '"meta"', 'cc2.seg.thr': '"grid"', 'cc2.seg.types': '"def"', 'cc2.chf.rfix': '1', 'cc2.chf.trevents': '1'};
const ADD = 'Dragonite', SWAP_AT = 3; // the change: Dragonite added to the box, then swapped in for the 4th member (Alolan Ninetales)
const ACC = 'data/users/u-saved-test/state', STATE_FIELDS = ['slots', 'box', 'teams', 'loadedId', 'format', 'maxMega', 'megaGoal', 'opp', 'boxV', 'excl', 'megaV', 'log'];
const ACC_OK = new Set([...STATE_FIELDS, 'leads', 'recentOpp', '_dev']); // the account document's field names (snapshot() in 03-persistence.js, plus _dev)

// today's daily documents (as v2-sync.mjs maps out/), so the signed-in run waits on real data the way the live site does
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'out', f), 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {};
const DOCS = {'meta/results': L.results, 'meta/perf': perfDoc(L, rd('perf.json')), 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'),
  'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json'), 'meta/history': rd('history.json'), 'meta/track': rd('track.json'),
  'meta/weekly': rd('weekly.json'), 'meta/calendar': rd('calendar.json'), 'meta/practice': rd('practice.json'), 'meta/post': rd('post.json')};
for (const k of Object.keys(DOCS)) if (DOCS[k] == null) delete DOCS[k];

// today's page has no test hook of its own: add it at the point the behaviour harness uses (as v2-sync.mjs does)
const tmp = path.join(ROOT, `app/dist/_saved-old-${process.pid}.html`);
{ const h = fs.readFileSync(OLD, 'utf8'); if (!h.includes('render();setView(view,false);')) { console.log("  FAIL  today's page has no hook point (render();setView(view,false);)"); process.exit(1); }
  fs.writeFileSync(tmp, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + h.replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);')); }
process.on('exit', () => { try { fs.unlinkSync(tmp); } catch (e) {} });

const b = await chromium.launch();
/* the pages are served over http, as players get them: opened as file://, Chromium lost the page's storage on about 1 reload in 4
   (checked Nov 25: the failing runs came back re-seeded, or with the starting box of 36), which failed SV-3 at random */
const srv = http.createServer((q, r) => { const f = path.resolve(decodeURIComponent(q.url.split('?')[0].split('#')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); r.end(); return; }
  const ext = path.extname(f), type = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2'}[ext] || 'application/octet-stream';
  r.writeHead(200, {'content-type': type}); fs.createReadStream(f).pipe(r); });
await new Promise(res => srv.listen(0, '127.0.0.1', res)); srv.unref(); const SRV = `http://127.0.0.1:${srv.address().port}`;
// a page with storage seeded ONCE per tab (a reload keeps what the page wrote) and, if `acc` is given, a fake account store in the page
async function open(file, {ls = {}, acc = null, scheme = 'light', hash = 'team'} = {}) {
  const c = await b.newContext({viewport: {width: 1280, height: 900}, colorScheme: scheme}), p = await c.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  await p.addInitScript(([ls, acc, accPath, docs]) => { window.__PL_TEST = 1;
    if (!sessionStorage.getItem('sv-seeded')) { sessionStorage.setItem('sv-seeded', '1'); localStorage.clear(); for (const k in ls) localStorage.setItem(k, ls[k]); }
    if (!acc) return;
    const store = window.__store = Object.assign({[accPath]: acc}, docs), writes = window.__writes = [], subs = {};
    const snap = v => ({exists: v != null, data: () => (v == null ? v : JSON.parse(JSON.stringify(v))), metadata: {hasPendingWrites: false}});
    const doc = k => ({get: async () => snap(store[k]),
      onSnapshot: cb => { (subs[k] = subs[k] || []).push(cb); setTimeout(() => cb(snap(store[k])), 5); return () => {}; },
      set: async d => { writes.push({op: 'set', path: k, keys: Object.keys(d)}); store[k] = JSON.parse(JSON.stringify(d)); },
      update: async d => { writes.push({op: 'update', path: k, keys: Object.keys(d)}); if (!store[k]) throw Object.assign(new Error('missing'), {code: 'invalid_argument'}); store[k] = Object.assign({}, store[k], JSON.parse(JSON.stringify(d))); }});
    const claude = {use: async n => n === 'db' ? {doc} : n === 'user' ? {id: async () => 'u-saved-test', isOwner: () => false, can: () => true} : null};
    Object.defineProperty(window, '__NP_CLAUDE', {configurable: true, get: () => claude, set: () => {}}); window.claude = claude; }, [ls, acc, ACC, acc ? DOCS : {}]);
  await p.goto(SRV + file + '#' + hash);
  await p.waitForFunction(() => typeof window.__ev === 'function', null, {timeout: 15000}).catch(() => {});
  return {c, p, errs, ev: s => p.evaluate(s => { try { return window.__ev(s); } catch (e) { return 'ERR ' + String(e.message || e).slice(0, 120); } }, s)}; }
const txt = (p, sel) => p.evaluate(s => { const n = document.querySelector(s); return n ? n.innerText.replace(/\s+/g, ' ') : ''; }, sel);
const v2Ready = p => p.waitForFunction(() => { const m = document.querySelector('#main'); return m && m.children.length && !m.querySelector('.np-loading'); }, null, {timeout: 20000}).then(() => true, () => false);
const go = async (P, h) => { await P.p.evaluate(h => { location.hash = h; }, h); await P.p.waitForTimeout(600); await v2Ready(P.p); };
const lsAll = p => p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
const stateOf = S => ({slots: S.slots, box: S.box, teams: S.teams, loadedId: S.loadedId, log: S.log, opp: S.opp, excl: S.excl, boxV: S.boxV, megaV: S.megaV, maxMega: S.maxMega, megaGoal: S.megaGoal, leads: S.leads, recentOpp: S.recentOpp});

// ---------- REF: today's page's own reading of the seed (its cleaners), the yardstick for everything below ----------
const O0 = await open(tmp, {ls: {...PREFS, 'cc2.state': J(SEED)}}); await O0.p.waitForTimeout(1500);
const REF = JSON.parse(await O0.ev('JSON.stringify(S)')); await O0.c.close();
ok(REF && same(REF.box, SEED.box) && same(REF.slots.map(s => s.n), SIX) && REF.teams.length === 3 && REF.log.length === 2,
  `the seed is valid for today's roster: today's page keeps every box Pokémon (${REF.box.length}/${SEED.box.length}), the six, the 3 saved teams and 2 logged games`);
ok(same(REF.slots[2].mv.singles, SEED.slots[2].mv.singles) && REF.slots[2].it.singles === 'Choice Scarf' && REF.teams[2].format === 'singles',
  "the seed carries the retired singles sub-keys and a singles saved team today's page keeps (so keeping them is testable)");
const SDISP = {}; // display names, from the new page itself (Rotom-Wash shows as "Wash Rotom")

// ---------- browser only (signed out, Viewer, or not connected): cc2.state is the player's only copy ----------
console.log('-- browser copy (no account) --');
const A = await open(PAGE, {ls: {...PREFS, 'cc2.state': J(SEED)}, scheme: 'light'});
ok(await v2Ready(A.p), 'the new page opens My Team');
const S1 = JSON.parse(await A.ev('JSON.stringify(S)'));
ok(same(stateOf(S1), stateOf(REF)), `SV-1 the new page reads cc2.state as today's page does (team, box order, saved teams, log, settings, leads${same(stateOf(S1), stateOf(REF)) ? '' : '; differs in: ' + Object.keys(stateOf(REF)).filter(k => !same(stateOf(S1)[k], stateOf(REF)[k])).join(', ')})`);
Object.assign(SDISP, JSON.parse(await A.ev(`JSON.stringify(Object.fromEntries(${J([...SEED.box, ADD])}.map(n => [n, V2.disp(n)])))`)));
// My Team writes a "-F" form as "Female" over the species name (Basculegion-F: "Female Basculegion"); the box and lists use "Basculegion (F)"
const shows = (t, n) => t.includes(SDISP[n]) || (/-F$/.test(n) && t.includes('Female ' + n.slice(0, -2)));
{ const t = await txt(A.p, '#main'), miss = SIX.filter(n => !shows(t, n));
  ok(!miss.length, `SV-1 My Team shows the six (${SIX.map(n => SDISP[n]).join(', ')}; missing: ${miss.map(n => SDISP[n]).join(', ') || 'none'})`);
  ok(t.includes('Rain Check'), `SV-1 My Team shows the loaded saved team's name ("Rain Check": ${t.includes('Rain Check')})`);
  ok(/Sitrus Berry/.test(t) && /Dragon Claw/.test(t) && /Rough Skin/.test(t), `SV-1 Garchomp shows its own saved set (Sitrus Berry ${/Sitrus Berry/.test(t)}, Rough Skin ${/Rough Skin/.test(t)}, Dragon Claw ${/Dragon Claw/.test(t)})`); }
{ await A.ev('V2.openSavedTeams()'); await A.p.waitForTimeout(500); const t = await txt(A.p, '.np-sheet');
  ok(t.includes('Rain Check') && t.includes('Trick Room Test'), `SV-1 Saved Teams lists the saved doubles teams (Rain Check ${t.includes('Rain Check')}, Trick Room Test ${t.includes('Trick Room Test')})`);
  await A.ev('V2.closeSheet(true)'); await A.p.waitForTimeout(300); }
{ const th = await A.p.evaluate(() => document.documentElement.dataset.theme);
  ok(th === 'night', `SV-1 the saved theme applies (cc2.theme "dark" on a light device -> data-theme ${th}, want night)`); }
{ const u = JSON.parse(await A.ev('JSON.stringify({pool: ui.pool, recSrc: ui.recSrc, abSrc: ui.abSrc, setMon: ui.setMon, boxSort: boxSortNow(), practice: prScore()})'));
  ok(u.pool === 'all' && u.recSrc === 'all' && u.abSrc === 'all' && u.setMon === 'Kingambit' && u.boxSort === 'old', `SV-1 the settings are read (pool ${u.pool}, recsrc ${u.recSrc}, absrc ${u.abSrc}, setMon ${u.setMon}, boxSort ${u.boxSort})`);
  ok(same(u.practice, JSON.parse(PREFS['np.practice'])), `SV-1 the Practice score is read (np.practice ${J(u.practice)})`); }
await go(A, 'home');
ok(!(await A.p.evaluate(() => !!document.querySelector('#main .sds-wl'))), 'SV-1 a returning player (cc2.welcomed) sees no welcome card on Home');
await go(A, 'box');
{ const tiles = await A.p.evaluate(() => [...document.querySelectorAll('.bx-grid [data-bxsel]')].map(x => x.dataset.bxsel));
  ok(same(tiles, REF.box), `SV-1 My Box shows every box Pokémon, forms included, in the saved order (cc2.boxSort "old"): ${tiles.length} of ${REF.box.length}${same(tiles, REF.box) ? '' : '; shown ' + tiles.join(', ')}`); }

// the change, made with the page's own controls: Add a Pokémon -> Dragonite; then Swap into My Team -> the 4th member
let added = false, swapped = false;
try { await A.p.click('.mb-tools [data-bxadd]'); await A.p.fill('[data-bxq]', ADD); await A.p.waitForTimeout(300);
  await A.p.click(`.np-sheet [data-bxaddn="${ADD}"]`); await A.p.waitForTimeout(500); added = true;
  await A.p.click(`[data-bxteam="${ADD}"]`); await A.p.waitForTimeout(400); await A.p.click(`[data-bxswap="${SWAP_AT}"]`); await A.p.waitForTimeout(600); swapped = true; } catch (e) { console.log('    (the change could not be made: ' + String(e.message || e).split('\n')[0].slice(0, 140) + ')'); }
ok(added && swapped, `SV-2 the change is made in the new page (box add ${added}, swap into the team ${swapped})`);
const LS1 = await lsAll(A.p); let W1 = null; try { W1 = JSON.parse(LS1['cc2.state']); } catch (e) {}
const wantBox = [...REF.box, ADD], wantSlots = REF.slots.map((s, i) => i === SWAP_AT ? null : s);
const checkWritten = (W, where) => {
  ok(W && same(W.box, wantBox), `SV-2 ${where}: the box is written with ${ADD} added at the end, order kept (${W ? W.box.length : 0} Pokémon${W && !same(W.box, wantBox) ? '; got ' + W.box.join(', ') : ''})`);
  ok(W && Array.isArray(W.slots) && W.slots.length === 6 && W.slots[SWAP_AT] && W.slots[SWAP_AT].n === ADD && W.slots.every((s, i) => i === SWAP_AT || same(s, wantSlots[i])),
    `SV-2 ${where}: the team is written with ${ADD} in slot ${SWAP_AT + 1} and the other five slots exactly as before (Garchomp's set, singles sub-keys, lock, assumed nature)${W && W.slots ? '; slots ' + W.slots.map(s => s.n).join(', ') : ''}`);
  const keep = ['teams', 'log', 'opp', 'excl', 'boxV', 'megaV', 'maxMega', 'megaGoal', 'format', 'leads', 'recentOpp'], diff = W ? keep.filter(k => !same(W[k], REF[k])) : keep;
  ok(!diff.length, `SV-2 ${where}: saved teams (singles team included), log, opponents, exclusions, migration markers and Mega settings are kept as they were (changed: ${diff.join(', ') || 'none'})`);
  ok(W && W.teams.every(t => same(Object.keys(t).sort(), ['format', 'id', 'name', 'saved', 'slots'])) && W.log.every(g => same(Object.keys(g).sort(), ['b', 'o', 'r', 't', 'tm'])),
    `SV-2 ${where}: saved teams and logged games keep exactly today's fields ({id,name,slots,format,saved}, {t,r,b,tm,o})`); };
checkWritten(W1, 'cc2.state');
// cc2.seenNew is rewritten by design when What's new shows on Home (as today's page does, 53-feedback.js); it must stay a JSON string
{ const lost = Object.keys(PREFS).filter(k => k !== 'cc2.seenNew' && LS1[k] !== PREFS[k]);
  ok(!lost.length, `SV-2 no per-device key is lost or rewritten (${Object.keys(PREFS).length - 1} checked; changed: ${lost.map(k => k + '=' + LS1[k]).join(', ') || 'none'})`);
  ok(/^"[^"]+"$/.test(LS1['cc2.seenNew'] || ''), `SV-2 cc2.seenNew stays in today's shape, a JSON string (${LS1['cc2.seenNew']})`); }
// SV-3: reload: the same tab (no re-seeding) opens with the change
await A.p.reload(); await v2Ready(A.p);
{ const r = JSON.parse(await A.ev('JSON.stringify({box: S.box, six: S.slots.map(s => s.n)})')), t = await txt(A.p, '#main');
  ok(same(r.box, wantBox) && r.six[SWAP_AT] === ADD && t.includes(SDISP[ADD]), `SV-3 after a reload the new page shows the change (box ${r.box.length}, slot ${SWAP_AT + 1} ${r.six[SWAP_AT]}, shown on the page ${t.includes(SDISP[ADD])})`); }
// gaps (settings): a Day choice made on the new page, and two views today's page remembers
await A.ev("V2.setTheme('day')"); await A.p.waitForTimeout(200);
{ const l = await lsAll(A.p); ok(l['cc2.theme'] === '"light"', `theme: Day picked on the new page reaches today's page's key (cc2.theme ${l['cc2.theme'] || 'unset'}; the new page saved np2.theme ${l['np2.theme'] || 'unset'})`); }
{ const mu = await A.ev('V2.muView()'), ty = await A.ev('V2.ty.mode');
  ok(mu === 'grid', `Matchups view: today's saved cc2.seg.thr "grid" is read by the new page (it opens on "${mu}")`);
  ok(ty === 'def', `Types view: today's saved cc2.seg.types "def" is read by the new page (it opens on "${ty}")`); }
ok(!A.errs.length, `no page errors on the new page (${A.errs.join(' | ') || 'none'})`);
await A.c.close();
// SV-4: today's page opens what the new page wrote
{ const O = await open(tmp, {ls: LS1}); await O.p.waitForTimeout(1500);
  const S2 = JSON.parse(await O.ev('JSON.stringify(S)')), want = Object.assign(clone(REF), {box: wantBox}); want.slots[SWAP_AT] = W1 && W1.slots[SWAP_AT];
  ok(same(stateOf(S2), stateOf(want)), `SV-4 today's page opens the new page's cc2.state unchanged (box ${S2.box.length}, slot ${SWAP_AT + 1} ${S2.slots[SWAP_AT] && S2.slots[SWAP_AT].n}, ${S2.teams.length} saved teams${same(stateOf(S2), stateOf(want)) ? '' : '; differs in: ' + Object.keys(stateOf(want)).filter(k => !same(stateOf(S2)[k], stateOf(want)[k])).join(', ')})`);
  ok(!O.errs.length, `no page errors on today's page (${O.errs.join(' | ') || 'none'})`); await O.c.close(); }

// ---------- signed in: the account document data/users/<id>/state ----------
console.log('-- account copy (signed in) --');
ok(Object.keys(DOCS).length >= 8, `today's daily documents found in out/ (${Object.keys(DOCS).length})`);
const STALE = {slots: SIX.slice(0, 2).map(n => ({n, a: null, lock: false})).concat(Array(4).fill(0).map(() => ({n: '', a: null, lock: false}))), box: ['Whimsicott'], teams: [], loadedId: null, format: 'doubles', opp: []};
const B = await open(PAGE, {ls: {...PREFS, 'cc2.theme': '"light"', 'cc2.state': J(STALE)}, acc: Object.assign(clone(SEED), {_dev: 'olddevice1'}), scheme: 'dark'});
await v2Ready(B.p); await B.p.waitForTimeout(2500);
{ const s = JSON.parse(await B.ev('JSON.stringify({S, sync: ui.syncSt})')), t = await txt(B.p, '#main');
  ok(same(stateOf(s.S), stateOf(REF)), `SV-5 the account copy wins over a stale browser copy (box ${s.S.box.length}, six ${s.S.slots.map(x => x.n).filter(Boolean).length}; sync "${s.sync}")`);
  ok(SIX.every(n => shows(t, n)) && t.includes('Rain Check'), 'SV-5 My Team shows the account\'s six and its loaded team');
  const th = await B.p.evaluate(() => document.documentElement.dataset.theme);
  ok(th === 'day', `SV-5 the saved theme applies (cc2.theme "light" on a dark device -> data-theme ${th}, want day)`); }
const w0 = await B.p.evaluate(() => window.__writes.length);
await go(B, 'box');
let bAdded = false, bSwapped = false;
try { await B.p.click('.mb-tools [data-bxadd]'); await B.p.fill('[data-bxq]', ADD); await B.p.waitForTimeout(300); await B.p.click(`.np-sheet [data-bxaddn="${ADD}"]`); await B.p.waitForTimeout(500); bAdded = true;
  await B.p.click(`[data-bxteam="${ADD}"]`); await B.p.waitForTimeout(400); await B.p.click(`[data-bxswap="${SWAP_AT}"]`); bSwapped = true; } catch (e) { console.log('    (the change could not be made: ' + String(e.message || e).split('\n')[0].slice(0, 140) + ')'); }
await B.p.waitForTimeout(2000); // saves wait 700 ms (persist debounce)
ok(bAdded && bSwapped, `SV-5 the change is made in the new page (box add ${bAdded}, swap ${bSwapped})`);
{ const r = await B.p.evaluate(p => ({writes: window.__writes, doc: window.__store[p]}), ACC), nw = r.writes.slice(w0).filter(x => x.path === ACC), keys = [...new Set(nw.flatMap(x => x.keys))], w0a = r.writes.slice(0, w0).filter(x => x.path === ACC);
  ok(w0a.every(x => x.op === 'update'), `SV-5 opening the page never replaces the account document (writes to it before the change: ${w0a.map(x => x.op + ' ' + x.keys.join('+')).join('; ') || 'none'})`);
  ok(nw.length > 0 && nw.every(x => x.op === 'update') && keys.every(k => ACC_OK.has(k)), `SV-5 the change goes out as field-level updates in the account document's own field names (${nw.map(x => x.op + ' ' + x.keys.join('+')).join('; ') || 'no write'})`);
  ok(keys.includes('box') && keys.includes('slots') && !keys.some(k => ['teams', 'log'].includes(k)), `SV-5 only the changed fields are sent (box and slots; not teams or log)`);
  checkWritten(r.doc, ACC);
  ok(r.doc && typeof r.doc._dev === 'string' && r.doc._dev !== 'olddevice1', `SV-5 the update carries the page's own _dev stamp (${r.doc && r.doc._dev})`);
  const l = await lsAll(B.p); let lw = null; try { lw = JSON.parse(l['cc2.state']); } catch (e) {}
  ok(lw && same(lw.box, wantBox) && lw.slots[SWAP_AT].n === ADD, 'SV-5 the browser copy (cc2.state) follows the account');
  ok(!B.errs.length, `no page errors on the new page (${B.errs.join(' | ') || 'none'})`);
  await B.c.close();
  // today's page, signed in to the same account, opens the document the new page left
  const O = await open(tmp, {ls: {'cc2.welcomed': '"1"'}, acc: r.doc}); await O.p.waitForTimeout(2500);
  const S3 = JSON.parse(await O.ev('JSON.stringify(S)'));
  ok(S3 && same(S3.box, wantBox) && S3.slots[SWAP_AT].n === ADD && same(S3.teams, REF.teams) && same(S3.log, REF.log), `SV-5 today's page opens the account document the new page wrote (box ${S3.box.length}, slot ${SWAP_AT + 1} ${S3.slots[SWAP_AT].n}, ${S3.teams.length} saved teams, ${S3.log.length} games)`);
  await O.c.close(); }
await b.close();
console.log(`v2-saved: ${fails.length ? fails.length + ' failed' : 'all passed'}${gaps.length ? ` (${gaps.length} known gaps, see GAP lines)` : ''}`); process.exit(fails.length ? 1 : 0);
