// Pasting a team says what it changed, never silently (code review A2-M1..M4, Nov 16):
//   M1 a move listed twice: kept once, and said
//   M2 a Mega form holding another form's stone: kept as named, and said
//   M3 "EVs: 33 HP" (one stat over 32, total within stat points): not read as classic EVs; skipped, and said
//   M4 three Megas: imported, and the message says only one can Mega per game
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-paste.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
const paste = `Charizard-Mega-Y @ Charizardite X
Ability: Drought
EVs: 33 HP
Modest Nature
- Heat Wave
- Protect
- Protect
- Solar Beam

Venusaur-Mega @ Venusaurite
Ability: Thick Fat
- Sludge Bomb
- Protect

Gengar-Mega @ Gengarite
Ability: Shadow Tag
- Shadow Ball
- Protect`;
const r = await p.evaluate(t => window.__ev(`(() => { const t = ${JSON.stringify(t)}; const P = parsePaste(t), keep = JSON.stringify(S.slots), I = importPaste(t); S.slots = JSON.parse(keep);
  const z = P.slots.find(s => /Charizard/.test(s.n)) || {}; return {msg: I.msg || I.error || '', notes: P.notes, mv: ((z.mv || {}).doubles || []).filter(Boolean), n: z.n, sp: z.sp || null, megas: P.slots.length}; })()`), paste);
ok(r.mv.filter(m => m === 'Protect').length === 1 && /a second "Protect"/.test(r.msg), `M1: Protect kept once and the message says so (${r.mv.join(', ')})`);
ok(r.n === 'Charizard-Mega-Y' && /kept as named/.test(r.msg), `M2: kept as Mega Charizard Y and the message names the other stone (${r.n})`);
ok(!r.sp && /one stat over 32/.test(r.msg), `M3: "EVs: 33 HP" is not read as classic EVs; skipped and said (${JSON.stringify(r.sp)})`);
ok(/3 Megas: you can only Mega one per game/.test(r.msg), `M4: the message says only one can Mega per game (${r.megas} Pokémon)`);
console.log('  message: ' + r.msg);
await b.close();
console.log(`v2-paste: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
