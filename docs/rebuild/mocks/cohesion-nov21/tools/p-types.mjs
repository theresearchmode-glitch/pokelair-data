import { card, w, sentence, step, head, links, page, img, TD } from './lib.mjs';
// Real data: today's built Type Chart (#types), Mega Charizard Y (Drought) from your team; claude/design6 built Nov 21 with the repo's data files.
const SIX = [['Charizard-Mega-Y', 'Mega Charizard Y'], ['Whimsicott'], ['Basculegion'], ['Kingambit'], ['Garchomp'], ['Sneasler']];
const TYPES = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
// taking hits as Fire/Flying (today's numbers)
const TAKE = { Rock: '4×', Water: '2×', Electric: '2×', Fire: '½', Fighting: '½', Steel: '½', Fairy: '½', Grass: '¼', Bug: '¼', Ground: '0' };
const cls = v => ({ '4×': 'x4', '2×': 'x2', '½': 'h', '¼': 'q', '0': 'z' })[v] || 'n';
const chip = t => `<span class=ty style="--c:${TD[t]}">${t}</span>`;
const body = links(['Damage Calculator ›', 'Battle ›', 'Team Preview Practice ›', 'Test Run ›', 'Speed Tiers ›', '~Type Chart']) +
  head({ kicker: 'BATTLE · THE MATCHUPS', h1: 'What hits<br><em>Mega Charizard Y</em> hard.', lead: 'Showing Mega Charizard Y, Ability Drought (from your team).' }) +
  `<div class=six style="margin-top:20px;flex-wrap:wrap;align-items:center">${SIX.map(([n], i) => `<a href=# style="display:grid;place-items:center;width:56px;height:56px;${i ? '' : 'box-shadow:inset 0 -4px 0 var(--plot)'}">${img(n, 48)}</a>`).join('')}<a href=# class=link style="margin-left:12px">Look up a Pokémon ⌕</a></div>` +
  `<p class=status>Or pick one or two types</p><div class=tygrid>${['Clear', ...TYPES].map(t => `<a href=# class="tyb${t === 'Fire' || t === 'Flying' ? ' on' : ''}" style="--c:${TD[t] || '#737571'}">${t}</a>`).join('')}</div>` +
  step(1, 'Taking hits as Fire / Flying', 'every attacking type, hardest first', '', `<div class=chart>${TYPES.map(t => [t, TAKE[t] || '1×']).sort((a, b) => ['4×', '2×', '1×', '½', '¼', '0'].indexOf(a[1]) - ['4×', '2×', '1×', '½', '¼', '0'].indexOf(b[1])).map(([t, v]) => `<div class="cell ${cls(v)}">${chip(t)}<b class=u>${v}</b></div>`).join('')}</div>
   <div class=counts style="margin-top:20px"><div class=bad><b class=u>4×</b><span>weak: Rock</span></div><div class=bad><b class=u>2×</b><span>weak: Water, Electric</span></div><div class=good><b class=u>½</b><span>resists: Fire, Fighting, Steel, Fairy</span></div><div class=good><b class=u>¼</b><span>resists: Grass, Bug</span></div><div class=good><b class=u>0</b><span>immune: Ground</span></div></div>
   <p class=hint>Everything else hits it for normal damage.</p>`) +
  step(2, 'Attacking with its own types', 'everything not listed takes normal damage', '', `<div class=pair2><div class=panel><h3 class=u>Fire attacks</h3><p class=hint style="margin:0">2× hits hard</p><div class=types>${['Grass', 'Ice', 'Bug', 'Steel'].map(chip).join('')}</div><p class=hint>½ half damage</p><div class=types>${['Fire', 'Water', 'Rock', 'Dragon'].map(chip).join('')}</div></div>
   <div class=panel><h3 class=u>Flying attacks</h3><p class=hint style="margin:0">2× hits hard</p><div class=types>${['Grass', 'Fighting', 'Bug'].map(chip).join('')}</div><p class=hint>½ half damage</p><div class=types>${['Electric', 'Rock', 'Steel'].map(chip).join('')}</div></div></div>
   ${links(['Full type chart: every attacking type against every defending type ›'])}`);
page('types', 'Battle', body, `
.tygrid{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:6px;margin-top:8px}.tyb{display:grid;place-items:center;min-height:44px;padding:0 4px;border:3px solid var(--c);color:var(--ink);font:700 15px/1.1 I;text-decoration:none;transform:skewX(-8deg)}
.tyb.on{background:var(--c);color:#fff}
.chart{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.cell{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:52px;padding:4px 10px;background:var(--card);border-left:6px solid var(--rule)}
.cell b{font-size:24px}.cell.x4{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 18%,var(--card))}.cell.x4 b,.cell.x2 b{color:var(--bad)}.cell.x2{border-color:var(--bad)}.cell.h,.cell.q{border-color:var(--good)}.cell.h b,.cell.q b,.cell.z b{color:var(--good)}.cell.z{border-color:var(--good);background:color-mix(in srgb,var(--good) 14%,var(--card))}.cell.n b{color:var(--ink2);font-size:17px}
@media (max-width:999.98px){.tygrid{grid-template-columns:repeat(5,minmax(0,1fr))}.chart{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:699.98px){.tygrid{grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}.tyb{font-size:13px}.chart{gap:4px}.cell{min-height:44px;padding:2px 6px}.cell .ty{font-size:13px;padding:2px 6px}.cell b{font-size:20px}}`);
