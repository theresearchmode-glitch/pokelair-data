// NastyPlot V2: the built page with every sprite embedded (a new artifact has no sp/ files) and the real database
// (no snapshot stub). Also writes one JSON file per meta doc so the new artifact's database can be seeded.
// Usage: node experiments/ch-v2.mjs <outFile> <seedDir>
import fs from 'node:fs';
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const [outFile, seedDir] = process.argv.slice(2);
const SPR = {}; for (const f of fs.readdirSync(APP + 'sp')) if (f.endsWith('.webp')) SPR[f.replace('.webp', '')] = 'data:image/webp;base64,' + fs.readFileSync(APP + 'sp/' + f).toString('base64');
let html = fs.readFileSync(APP + 'dist/page.html', 'utf8');
const a = 'src="sp/${id}.webp"', b = "scImg('sp/' + id + '.webp')";
if (!html.includes(a) || !html.includes(b) || !html.includes('<script>window.__SPR=null;</script>')) throw new Error('sprite hooks not found');
html = html.replace(a, 'src="${(window.__SPR && window.__SPR[id]) || \'sp/\' + id + \'.webp\'}"').replace(b, "scImg((window.__SPR && window.__SPR[id]) || 'sp/' + id + '.webp')");
html = html.replace('<script>window.__SPR=null;</script>', () => `<script>window.__SPR=${JSON.stringify(SPR)};</script>`);
html = html.replace(/<title>[^<]*<\/title>/, '<title>NastyPlot V2</title>');
fs.writeFileSync(outFile, html);
const L = rd('limitless.json'), D = {results: L.results, perf: {adj: L.adj, updated: L.updated.slice(0, 10)}, doubles_tour: rd('meta_tour.json'), teams: rd('teams.json'), history: rd('history.json'), model: rd('model.json'), doubles: rd('meta_ladder.json'), doubles_ingame: rd('meta_ingame.json'), events: rd('events.json')};
fs.mkdirSync(seedDir, {recursive: true}); for (const [k, v] of Object.entries(D)) if (v != null) fs.writeFileSync(`${seedDir}/${k}.json`, JSON.stringify(v));
console.log(`v2: ${outFile} (${(html.length / 1048576).toFixed(1)} MB, ${Object.keys(SPR).length} sprites, title ok: ${/<title>NastyPlot V2<\/title>/.test(html)})`);
for (const f of fs.readdirSync(seedDir)) console.log(`seed ${f}: ${(fs.statSync(seedDir + '/' + f).size / 1024).toFixed(0)} KB`);
