// Writes NOTES.md (all page notes in PAGES.md order) and index.html (gallery of every page's 1440 and 390 pictures).
import fs from 'fs';
const WT = 'C:/Users/simra/code/pl-cohesion', DIR = WT + '/docs/rebuild/mocks/cohesion-nov21', PICS = WT + '/docs/rebuild/pics/nov21/cohesion/all';
const rows = fs.readFileSync(DIR + '/PAGES.md', 'utf8').split('\n').filter(l => /^\| \d+ \|/.test(l)).map(l => l.split('|').map(s => s.trim())).map(c => ({ nn: c[1].padStart(2, '0'), id: c[2], name: c[3], plan: c[4] }));
const notesDir = new URL('./notes/', import.meta.url);
const pics = fs.readdirSync(PICS);
let md = `# Cohesion mock-ups: notes per page (Nov 21, 2026)\n\nEvery page in PAGES.md, in its order. Each page: today's features and where they went, the data source, changes from the PAGES.md idea, and any house rule not met.\nPictures: docs/rebuild/pics/nov21/cohesion/all/<nn>-<id>-<width>[-night].png. Gallery: index.html. Checks: a Playwright script measured each page at 390 and 1440 wide (sizes off the type scale, Unbounded under 15px, cut or spilling text, taps under 44px, sideways scroll, lone tiles, length in screens).\n\nShared kit: all new parts were added to kit2.css (marked "ADDED Nov 21"), never copied per page. Generator scripts that wrote the pages: tools/.\n\n`;
const H = fs.existsSync(new URL('_heights.json', notesDir)) ? JSON.parse(fs.readFileSync(new URL('_heights.json', notesDir), 'utf8')) : {};
md += '## Phone height at 390 wide (THEME.md section 4: no longer than today; no show/hide folds or tabs)\n\n| # | page | mock-up | today | |\n|---|---|---|---|---|\n' +
  rows.flatMap(r => [r.id, r.id + '-b']).filter(k => H[k]).map(k => { const v = H[k], r = rows.find(x => x.id === k.replace(/-b$/, '')); return `| ${r.nn} | ${k} | ${v.mock}px (${(v.mock / 844).toFixed(2)} screens) | ${v.today}px (${(v.today / 844).toFixed(2)} screens) | ${v.mock <= v.today ? 'shorter or same' : 'LONGER by ' + (v.mock - v.today) + 'px'} |`; }).join('\n') + '\n\n';
const done = [];
for (const r of rows) { const f = new URL(r.id + '.md', notesDir);
  if (fs.existsSync(f)) { md += fs.readFileSync(f, 'utf8').trim() + '\n\n'; done.push(r.id); }
  else if (/DONE/.test(r.plan)) md += `## ${r.nn} ${r.id} · ${r.plan}\nAlready made before this pass (see ${r.id === 'meta' ? 'ratings2' : r.id + '2'}.html).\n\n`;
  else md += `## ${r.nn} ${r.id} · ${r.plan}\nNot made yet.\n\n`; }
fs.writeFileSync(DIR + '/NOTES.md', md);
const ref = { meta: ['../../pics/nov21/cohesion/v2-1-ratings-1440.png', '../../pics/nov21/cohesion/v2-1-ratings-390.png'], track: ['../../pics/nov21/cohesion/v2-2-track-1440.png'], events: ['../../pics/nov21/cohesion/v2-3-events-1440.png'] };
const cards = rows.map(r => { const mine = pics.filter(p => p.startsWith(`${r.nn}-${r.id}-`) || p.startsWith(`${r.nn}-${r.id}-b-`)).filter(p => /-(1440|390)\.png$/.test(p)).sort().map(p => '../../pics/nov21/cohesion/all/' + p);
  const imgs = mine.length ? mine : ref[r.id] || [];
  return `<section><h2><span>${r.nn}</span> ${r.name} <small>${r.plan.replace(/\s*DONE.*$/, '')}</small></h2>${imgs.length ? `<div class=g>${imgs.map(s => `<a href="${s}"><img loading=lazy src="${s}" alt="${r.id}"><i>${s.split('/').pop()}</i></a>`).join('')}</div>` : '<p>Not made yet.</p>'}${fs.existsSync(`${DIR}/pages/${r.id}.html`) ? `<p><a href="pages/${r.id}.html">Open the mock-up</a>${fs.existsSync(`${DIR}/pages/${r.id}-b.html`) ? ` · <a href="pages/${r.id}-b.html">version B</a>` : ''}</p>` : ''}</section>`; }).join('\n');
fs.writeFileSync(DIR + '/index.html', `<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Cohesion mock-ups · every page</title><link rel=stylesheet href=kit2.css>
<style>main{max-width:1400px;margin:0 auto;padding:24px}section{margin:48px 0;border-top:1px solid var(--rule);padding-top:16px}h2{font:800 28px/1.2 U;font-style:italic}h2 span{color:var(--nasty)}h2 small{font:600 15px I;color:var(--ink2);margin-left:8px}
.g{display:flex;gap:16px;align-items:flex-start;overflow-x:auto}.g a{flex:none;color:var(--ink2);font:400 13px I;text-decoration:none}.g img{display:block;height:560px;width:auto;border:1px solid var(--rule)}.g i{display:block;font-style:normal}</style></head>
<body><main><div class=kicker>COHESION · EVERY PAGE</div><h1 class=u>Every page, <em>one plan.</em></h1><p class=lead>Mock-ups of all ${rows.length} pages in PAGES.md order, desktop (1440) and phone (390). Done: ${done.length + 3} of ${rows.length}. Notes: NOTES.md.</p>
${cards}</main></body></html>\n`);
console.log('notes for', done.join(', '));
