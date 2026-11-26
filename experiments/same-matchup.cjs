// Same-output check for the deeperThreats split: draws today's Deeper read (#mu) against the top 20 tournament teams, with ability
// handling on and off, in two builds, and compares the HTML. Usage: node same-matchup.cjs before.run.html after.run.html
const pw = require('playwright'), [A, B] = process.argv.slice(2);
const fs = require('fs'), OUT = require('path').join(__dirname, '../out/'), rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
const run = async (b, F) => { const p = await b.newPage(); await p.addInitScript(D => { window.__PL_TEST = 1; try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {}
    window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await p.goto('file://' + F); await p.waitForTimeout(4000);
  const out = await p.evaluate(() => window.__ev(`(() => { const res = [], el = document.getElementById('mu'), ab = document.getElementById('useAbil'); if (!el || !ab) return ['NO mu'];
    const T = (META.teams && META.teams.teams || []).slice(0, 20);
    for (const t of T) for (const a of [true, false]) { S.opp = t.mons.slice(0, 6); while (S.opp.length < 6) S.opp.push(''); ab.checked = a; renderMatchup(); res.push(el.innerHTML); }
    return res; })()`));
  await p.close(); return out; };
(async () => { const b = await pw.chromium.launch(); const a = await run(b, A), c = await run(b, B); let diff = 0;
  for (let i = 0; i < Math.max(a.length, c.length); i++) if (a[i] !== c[i]) diff++;
  const withThreats = a.filter(h => /Their threats/.test(h) && !/None of their Pokémon threatens/.test(h)).length;
  console.log(`${a.length} Deeper reads compared: ${a.length - diff} identical, ${diff} different; ${withThreats} list real threats; total chars ${a.join('').length}`); await b.close(); })();
