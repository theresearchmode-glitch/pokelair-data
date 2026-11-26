// Same-output check for the Types logic split (Nov 12): draws Types for every 1- and 2-type set and 120 Pokémon (with Abilities) in two builds of today's page and compares the HTML. Pages need the test hook (window.__ev): see experiments/same-battle.mjs line 12. Usage: node experiments/same-types.cjs before.run.html after.run.html
const pw = require('playwright'), [A, B] = process.argv.slice(2);
const run = async (b, F) => { const p = await b.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; }); await p.goto('file://' + F); await p.waitForTimeout(3000);
  const out = await p.evaluate(() => window.__ev(`(() => { const res = [], el = document.getElementById('typesOut'); if (!el) return ['NO typesOut'];
    const draw = () => { renderTypes(); return el.innerHTML; };
    for (let i = 0; i < TYPES.length; i++) for (let j = i; j < TYPES.length; j++) { ui.typesMon = null; ui.typesCleared = true; ui.typesAuto = false; ui.typesSel = i === j ? [TYPES[i]] : [TYPES[i], TYPES[j]]; res.push(draw()); }
    for (const p of ROSTER.slice(0, 120)) { ui.typesMon = p.n; ui.typesSel = p.t.slice(); ui.typesAuto = false; res.push(draw()); }
    return res; })()`));
  await p.close(); return out; };
(async () => { const b = await pw.chromium.launch(); const a = await run(b, A), c = await run(b, B); let diff = 0, first = null;
  for (let i = 0; i < Math.max(a.length, c.length); i++) if (a[i] !== c[i]) { diff++; if (!first) first = i; }
  const abil = a.slice(171).filter(h => /changes/.test(h)).length;
  console.log(`${a.length} Types screens compared: ${a.length - diff} identical, ${diff} different${first != null ? ' (first at ' + first + ')' : ''}; ${abil} of them show an Ability note; total chars ${a.join('').length}`); await b.close(); })();
