// Stress test: Showdown paste import fuzz. Real top-cut teams from events.json plus thousands of mutated pastes
// (line endings, case, spacing, nicknames, emoji, HTML injection, 7+ PokÃ©mon, 5 moves, classic EVs, over-cap SP,
// gender/shiny/level/tera lines, giant pastes). Every paste is imported, rendered and exported; the export is
// re-imported and must give back the same team. Usage: node experiments/stress-paste.mjs [count]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'stress-paste.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const N = +process.argv[2] || 5000;
// deterministic random
let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }, pick = a => a[Math.floor(rnd() * a.length)];
const E = rd('events.json'), dict = E.dict, real = [];
for (const ev of E.events) for (const row of ev.top) if (Array.isArray(row[3])) real.push(row[3].map(([sp, it, ab, nat, mv]) => ({sp: dict[sp], it: dict[it], ab: dict[ab], nat: dict[nat], mv: (mv || []).map(i => dict[i])})));
const toPaste = (team, o = {}) => team.map((m, i) => {
  const nick = o.nick ? o.nick(m, i) : null, head = (nick ? `${nick} (${m.sp})` : m.sp) + (o.gender && rnd() < .5 ? ' (' + pick(['M', 'F']) + ')' : '') + (m.it ? ' @ ' + m.it : '');
  const lines = [head, 'Ability: ' + m.ab];
  if (o.level) lines.push('Level: ' + pick(['50', '100', '1']));
  if (o.shiny) lines.push('Shiny: Yes');
  if (o.tera) lines.push('Tera Type: ' + pick(['Fire', 'Stellar', 'Water']));
  if (o.ev) lines.push('EVs: ' + o.ev(m, i));
  if (m.nat) lines.push(m.nat + ' Nature');
  if (o.iv) lines.push('IVs: 0 Atk');
  for (const x of m.mv) lines.push('- ' + x);
  if (o.extraMove) lines.push('- Tackle', '- Hyper Beam');
  return lines.join('\n'); }).join('\n\n');
const INJ = ['<img src=x onerror="window.__pwned=1">', '"><svg onload=window.__pwned=1>', '</textarea><script>window.__pwned=1</script>', '${window.__pwned=1}', '{{constructor.constructor("window.__pwned=1")()}}', 'javascript:window.__pwned=1'];
const MUT = [
  ['real', t => toPaste(t)],
  ['crlf', t => toPaste(t).replace(/\n/g, '\r\n')],
  ['cr-only', t => toPaste(t).replace(/\n/g, '\r')],
  ['upper', t => toPaste(t).toUpperCase()],
  ['lower', t => toPaste(t).toLowerCase()],
  ['spaces', t => toPaste(t).split('\n').map(l => '   ' + l.replace(/ /g, '  ') + '\t ').join('\n')],
  ['nick-emoji', t => toPaste(t, {nick: () => pick(['ðŸ”¥SpicyðŸ”¥', 'ãƒ”ã‚«', 'Ã‘andÃº', 'â€‹zeroâ€‹width', 'a'.repeat(200)])})],
  ['nick-species', t => toPaste(t, {nick: (m, i) => t[(i + 1) % t.length].sp})],
  ['nick-inject', t => toPaste(t, {nick: () => pick(INJ)})],
  ['item-inject', t => toPaste(t.map(m => ({...m, it: pick(INJ)})))],
  ['move-inject', t => toPaste(t.map(m => ({...m, mv: [...m.mv.slice(0, 3), pick(INJ)]})))],
  ['ability-inject', t => toPaste(t.map(m => ({...m, ab: pick(INJ)})))],
  ['nature-inject', t => toPaste(t.map(m => ({...m, nat: '<b>x</b>'})))],
  ['seven', t => toPaste([...t, ...real[Math.floor(rnd() * real.length)].slice(0, 3)])],
  ['five-moves', t => toPaste(t, {extraMove: true})],
  ['classic-evs', t => toPaste(t, {ev: () => '252 HP / 252 Atk / 4 Spe'})],
  ['sp-overcap', t => toPaste(t, {ev: () => '32 HP / 32 Atk / 32 Def / 32 SpA / 32 SpD / 32 Spe'})],
  ['sp-garbage', t => toPaste(t, {ev: () => pick(['-5 HP / 999999999999 Atk', 'NaN Spe', '1e5 Atk', '32 HP / 32 HP / 32 HP', '0x20 Spe', '33 Spe'])})],
  ['extras', t => toPaste(t, {level: true, shiny: true, tera: true, gender: true, iv: true})],
  ['missing-lines', t => toPaste(t).split('\n').filter(() => rnd() > .25).join('\n')],
  ['no-blank-lines', t => toPaste(t).replace(/\n\n/g, '\n')],
  ['dup-species', t => toPaste([t[0], t[0], t[1], t[1], t[2], t[2]])],
  ['huge', t => (toPaste(t) + '\n\n').repeat(80) + 'x'.repeat(50000)],
  ['garbage', () => Array.from({length: 400}, () => String.fromCharCode(Math.floor(rnd() * 0xffff))).join('')],
  ['empty', () => pick(['', '   ', '\n\n\n', '@', ' @ ', '- ', 'Ability:', '()', '(M)', '@ Leftovers'])],
  ['link-in-paste', t => 'https://pokepast.es/abc123\n' + toPaste(t)],
];
const cases = []; for (let i = 0; cases.length < N; i++) { const t = real[i % real.length]; const [name, f] = i < real.length ? MUT[0] : pick(MUT); cases.push({name, text: f(t)}); }
const b = await chromium.launch(), ctx = await b.newContext({viewport: {width: 1366, height: 900}}), pg = await ctx.newPage();
const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('dialog', d => { errs.push('dialog: ' + d.message()); d.dismiss(); });
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}}), collection: () => ({doc: () => ({set: async () => {}, get: async () => ({exists: false}), onSnapshot: () => () => {}})})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(2500);
const fails = {}, add = (k, m) => { (fails[k] = fails[k] || []).push(m); }; const counts = {}, times = [];
const t0 = Date.now();
for (let i = 0; i < cases.length; i += 50) {
  const chunk = cases.slice(i, i + 50);
  const res = await pg.evaluate(chunk => window.__ev(`(()=>{const out=[];for(const c of ${JSON.stringify(chunk)}){const r={name:c.name};try{
      const t0=performance.now(),u=parsePaste(c.text);S.slots=normSlots(u.slots);fixSlots();S.loadedId=null;planCache={key:null,plans:[]};render();
      const views=['build','home','matchup','calc'];setView(views[out.length%4]);
      const t1=performance.now();r.ms=Math.round(t1-t0);
      const ex=exportPaste();const u2=parsePaste(ex);
      const key=s=>s.filter(x=>x&&x.n).map(x=>[x.n,x.a||'',(x.mv&&x.mv.doubles||[]).join(','),x.it&&x.it.doubles||'',x.sp&&x.sp.doubles?(e=>e?(x.sp.doubles.nat||'')+':'+[e.hp,e.atk,e.def,e.spa,e.spd,e.spe].join('/'):'')(slotSpread(x,byName.get(x.n))):''].join('|'));
      // (a team sheet's spread is assumed: compared by the stat points it is played with, Oct 28)
      const a=key(S.slots),b2=key(normSlots(u2.slots));
      // compare what the user set: species, ability chosen, moves, held item, nature+SP
      r.n=a.length;r.rt=a.length===b2.length&&a.every((x,i)=>{const [n,ab,mv,it,sp]=x.split('|'),[n2,ab2,mv2,it2,sp2]=b2[i].split('|');return n===n2&&(!ab||ab===ab2||byName.get(n).m)&&(!mv||mv===mv2)&&(!it||it===it2)&&(!sp||sp===sp2||(sp.startsWith(':')&&sp.split(':')[1]===sp2.split(':')[1]))});
      if(!r.rt)r.diff=[a,b2];
      const txt=document.body.innerText;r.bad=(txt.match(/\\bNaN\\b|\\bundefined\\b|\\[object |\\bInfinity\\b/)||[])[0]||null;
      r.inj=!!window.__pwned||!!document.querySelector('main img[src="x"], main svg[onload], main script:not([type])');
      r.sp=S.slots.filter(x=>x.sp&&x.sp.doubles).map(x=>(x.sp.doubles.v||[]).reduce((s,v)=>s+v,0));
    }catch(e){r.err=e.message+' @ '+(e.stack||'').split('\\n')[1]}out.push(r)}return out})()`), chunk);
  for (const r of res) { counts[r.name] = (counts[r.name] || 0) + 1; if (r.ms != null) times.push(r.ms);
    if (r.err) add('crash', `${r.name}: ${r.err}`);
    if (r.inj) add('injection', r.name);
    if (r.bad) add('bad-text', `${r.name}: ${r.bad}`);
    if (r.rt === false) add('roundtrip', `${r.name}: ${JSON.stringify(r.diff[0].map((x,i)=>x===r.diff[1][i]?null:[x,r.diff[1][i]]).filter(Boolean))}`);
    if (r.ms > 1500) add('slow', `${r.name}: ${r.ms} ms`);
    if (r.sp && r.sp.some(x => x > 66)) add('sp-over-66', `${r.name}: totals ${r.sp.join(',')}`); }
  if (errs.length) { add('pageerror', errs.splice(0).join(' | ').slice(0, 300)); }
}
await b.close(); fs.unlinkSync(page);
console.log(`${cases.length} pastes in ${Math.round((Date.now() - t0) / 1000)} s`, JSON.stringify(counts));
{ const s = times.slice().sort((a, b) => a - b), q = f => s[Math.min(s.length - 1, Math.floor(f * s.length))]; console.log(`import + render ms: median ${q(.5)}, p95 ${q(.95)}, max ${s[s.length - 1]}`); }
for (const [k, v] of Object.entries(fails)) { console.log(`\n${k}: ${v.length}`); for (const m of [...new Set(v)].slice(0, 8)) console.log('  ' + m); }
console.log(Object.keys(fails).length ? '\nPASTE FUZZ: ISSUES' : '\nPASTE FUZZ CLEAN');
process.exit(Object.keys(fails).length ? 1 : 0);

