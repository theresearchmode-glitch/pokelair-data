// Where the first open of the scouting report (build view) spends its time: CPU profile, self time by function.
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'stress-prof.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const view = process.argv[2] || 'build';
const b = await chromium.launch(), pg = await b.newPage();
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(2500);
const cdp = await pg.context().newCDPSession(pg); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: 100}); await cdp.send('Profiler.start');
const ms = await pg.evaluate(v => { const t = performance.now(); window.__ev(`setView('${v}')`); return Math.round(performance.now() - t); }, view);
const {profile} = await cdp.send('Profiler.stop');
const self = new Map(), byId = new Map(profile.nodes.map(n => [n.id, n])), dt = profile.timeDeltas; const cnt = new Map();
profile.samples.forEach((id, i) => cnt.set(id, (cnt.get(id) || 0) + (dt[i] || 0)));
for (const [id, us] of cnt) { const n = byId.get(id), k = (n.callFrame.functionName || '(anon)') + ':' + n.callFrame.lineNumber; self.set(k, (self.get(k) || 0) + us); }
// inclusive time per function name
const incl = new Map(); const tot = id => { const n = byId.get(id); let s = cnt.get(id) || 0; for (const c of n.children || []) s += tot(c); n._t = s; return s; }; tot(profile.nodes[0].id);
for (const n of profile.nodes) { const k = n.callFrame.functionName || '(anon)'; incl.set(k, Math.max(incl.get(k) || 0, n._t)); }
console.log(view, 'open', ms, 'ms');
console.log('self:', [...self].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => `${k} ${(v / 1000).toFixed(0)}ms`).join(' | '));
console.log('incl:', [...incl].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `${k} ${(v / 1000).toFixed(0)}`).join(' | '));
await b.close(); fs.unlinkSync(page);
