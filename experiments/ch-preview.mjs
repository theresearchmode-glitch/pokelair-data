// Standalone Concept H preview: the built page plus today's data snapshot and every sprite embedded, so it runs as its own
// private artifact without the live database. Database reads come from the snapshot; writes do nothing.
// Usage: node experiments/ch-preview.mjs [outFile]
import fs from 'node:fs';
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
for (const k in D) if (D[k] == null) delete D[k];
const SPR = {}; for (const f of fs.readdirSync(APP + 'sp')) if (f.endsWith('.webp')) SPR[f.replace('.webp', '')] = 'data:image/webp;base64,' + fs.readFileSync(APP + 'sp/' + f).toString('base64');
let html = fs.readFileSync(APP + 'dist/page.html', 'utf8');
const a = 'src="sp/${id}.webp"', b = "scImg('sp/' + id + '.webp')";
if (!html.includes(a) || !html.includes(b)) throw new Error('sprite hooks not found');
html = html.replace(a, 'src="${(window.__SPR && window.__SPR[id]) || \'sp/\' + id + \'.webp\'}"').replace(b, "scImg((window.__SPR && window.__SPR[id]) || 'sp/' + id + '.webp')");
const boot = `<script>window.__SPR=${JSON.stringify(SPR)};window.__CH_PREVIEW=1;(function(){var D=${JSON.stringify(D).replace(/</g, '\\u003c')};var doc=function(p){return{onSnapshot:function(cb){setTimeout(function(){cb({exists:!!D[p],data:function(){return D[p]}})},5);return function(){}},get:function(){return Promise.resolve({exists:!!D[p],data:function(){return D[p]}})},set:function(){return Promise.resolve()},update:function(){return Promise.resolve()},delete:function(){return Promise.resolve()}}};
var col=function(){return{doc:doc,get:function(){return Promise.resolve({docs:[],forEach:function(){}})},onSnapshot:function(){return function(){}},where:function(){return col()},orderBy:function(){return col()},limit:function(){return col()}}};
window.claude={use:function(n){return Promise.resolve(n==='db'?{doc:doc,collection:col}:null)}}})();</script>`;
html = html.replace('<script>window.__SPR=null;</script>', () => boot);
const note = `<div style="position:fixed;left:8px;top:8px;z-index:200;font:700 11px 'Space Mono',monospace;background:#FFE800;color:#1D2140;border:2px solid #1D2140;border-radius:6px;padding:2px 6px;pointer-events:none">PREVIEW · data snapshot ${L.updated.slice(0, 10)}</div>`;
html = html.replace('<div class="toast" id="toast" hidden></div>', () => '<div class="toast" id="toast" hidden></div>' + note);
const out = process.argv[2] || 'C:/Users/simra/OneDrive/Documents/NastyPlot/nastyplot-concept-h-preview.html';
fs.writeFileSync(out, html); console.log(`preview: ${out} (${(html.length / 1048576).toFixed(1)} MB, ${Object.keys(SPR).length} sprites, ${Object.keys(D).length} data docs)`);
