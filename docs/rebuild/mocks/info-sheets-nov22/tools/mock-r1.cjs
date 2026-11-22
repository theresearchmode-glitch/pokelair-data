// Mock-ups for the Moves / Abilities / Items info sheets (Nov 22). MOCK-UP ONLY: no site code changes.
// It opens the published Preview's own files (downloaded from the NastyPlot Full Redesign artifact, version 1795352573-bcff)
// and opens V2.sheet with mock HTML built from the site's own kit (kHead, kFacts, kPlan/kStep, kMove, mon art), in the
// Pokémon page's "case file" look (pages.css .pkf).
// Numbers: Online tournaments, last 28 days (Oct 21 - Nov 18, 7,870 teams), measured by tools/sample.mjs -> tools/sample-28.json.
// Text: Showdown (MIT) / our ABIL, plus hand-written doubles lines (to be checked before build).
// Run: node tools/mock.cjs <out folder>   (needs ../pv-shot.cjs beside the downloaded Preview, see RESEARCH.md)
const {chromium} = require('C:/Users/simra/code/pl-pcrun/node_modules/playwright');
const {open} = require('C:/Users/simra/AppData/Local/Temp/claude/469e588db1a22171/bb823294-4095-4fd5-ba18-59326258ebc4/scratchpad/info-sheets/pv-shot.cjs');
const S = require('./sample-28.json');
const NAME = {'Hisuian Arcanine': 'Arcanine-Hisui', 'Basculegion ♀': 'Basculegion-F', 'Lycanroc Dusk': 'Lycanroc-Dusk', 'Indeedee ♀': 'Indeedee-F'};
const users = (k, n = 6) => S[k].users.slice(0, n).map(([nm, c, pct, tot]) => [NAME[nm] || nm, pct, tot]);
const SRC = 'Online tournaments, last 28 days (Oct 21 – Nov 18) · 7,870 teams';

const SHEETS = {
  'rock-slide': {kind: 'MOVE', name: 'Rock Slide', type: 'Rock', c1: 'var(--ty-Rock)', c2: 'var(--plate)',
    lead: 'Hits both foes. Each one hit has a 30% chance to flinch.',
    change: 'Changes Dec 2: accuracy 90% → 95%, flinch 30% → 20%.',
    facts: [['46%', 'of tournament teams'], ['75', 'power · Physical'], ['90%', 'accuracy'], ['12', 'PP in battle']],
    doubles: ['Hits both foes, each for 0.75× damage', 'Never hits your partner', 'Blocked by Protect and Wide Guard', 'No contact', 'Flinch only works if it moves first', 'Priority 0: normal order'],
    users: users('Rock Slide'), learnId: 'Rock Slide', links: [['Try It in the Calc', '#calc'], ['Winning Teams With It', '#winning']]},
  'intimidate': {kind: 'ABILITY', name: 'Intimidate', c1: 'var(--plot)', c2: 'var(--plate)',
    lead: 'When it comes in, lowers both foes’ Attack by 1 stage.',
    facts: [['54%', 'of tournament teams'], ['4,220', 'teams run it'], ['16', 'Pokémon run it'], ['25', 'Pokémon can have it']],
    doubles: ['Hits both foes at once', 'Works again each time it switches back in', 'Defiant and Competitive foes get a boost instead', 'Inner Focus, Oblivious, Own Tempo and Scrappy ignore it'],
    users: users('Intimidate'), holdersOf: 'Intimidate', links: [['Winning Teams With It', '#winning']]},
  'focus-sash': {kind: 'ITEM', name: 'Focus Sash', c1: 'var(--pick)', c2: 'var(--plate)',
    lead: 'At full HP, it survives a hit that would knock it out, with 1 HP left. Then it’s used up.',
    facts: [['69%', 'of tournament teams'], ['5,451', 'teams run it'], ['98', 'Pokémon run it'], ['1', 'use per battle']],
    doubles: ['Fake Out or any chip damage first breaks it', 'Multi-hit moves can still finish it', 'Best on fast, frail Pokémon'],
    users: users('Focus Sash'), links: [['Winning Teams With It', '#winning']]},
};

const CSS = `<style>
.is-wrap{padding:var(--s8) var(--s10) var(--s10)}
.is-wrap .k-head{max-width:880px}
.is-tk{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s3) var(--s4);margin-top:var(--s4)}.is-tk .k-move{min-width:260px}
.is-chg{margin:0;padding:var(--s1) var(--s3);border-left:4px solid var(--pick);background:var(--wash);font:600 var(--t15)/1.5 var(--b);color:var(--ink)}
.is-dbl{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--s2) var(--s6)}
.is-dbl li{position:relative;padding-left:var(--s5);font:500 var(--t16)/1.5 var(--b);color:var(--ink)}
.is-dbl li::before{content:'';position:absolute;left:0;top:9px;width:12px;height:5px;background:var(--plot);transform:skewX(var(--slant))}
.is-users{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s2) var(--s4)}
.is-u{display:grid;grid-template-columns:64px minmax(0,1fr);column-gap:var(--s3);align-items:center;padding:var(--s2);text-align:left;color:inherit;background:none;border:0;border-radius:var(--r-m);cursor:pointer}
.is-u:hover{background:var(--wash)}.is-u .np-mon{grid-row:1/4}
.is-u b{font:700 var(--t16)/1.2 var(--b)}.is-u small{font:500 var(--t13)/1.4 var(--b);color:var(--ink-2)}
.is-u .bar{height:6px;background:var(--rule)}.is-u .bar i{display:block;height:100%;width:var(--v);background:var(--plot)}
.is-u em{font:italic 800 var(--t20)/1 var(--u);color:var(--plot-text);font-synthesis:style}
.is-learn{display:flex;flex-wrap:wrap;gap:var(--s1)}.is-learn button{background:none;border:0;padding:0;cursor:pointer}
.is-src{margin:var(--s3) 0 0;font:500 var(--t13)/1.5 var(--b);color:var(--ink-3)}
.is-wrap .k-step{margin-top:var(--s8)}.is-wrap .k-h1{font-size:clamp(40px,4.6vw,64px)}.is-wrap .pk-nm{white-space:nowrap}.is-links{display:flex;flex-wrap:wrap;gap:var(--s2) var(--s6);margin-top:var(--s8);padding-top:var(--s4);border-top:1px solid var(--rule)}.is-u small,.is-u .bar{display:block;grid-column:2}
@media (max-width:699.98px){.is-wrap{padding:var(--s5) var(--s4) var(--s8)}.is-dbl{grid-template-columns:1fr}.is-users{grid-template-columns:1fr}.is-tk .k-move{min-width:0;flex:1}}
</style>`;

async function build(p, key) {
  return p.evaluate(([D, CSS, SRC]) => {
    const E = V2.esc;
    const head = V2.kHead({kicker: `CASE FILE · ${D.kind}`, h1Html: `The file on <em class="pk-nm">${E(D.name)}.</em>`, lead: D.lead});
    const tk = D.type || D.change ? `<div class="is-tk">${D.type ? V2.kMove(D.name) : ''}${D.change ? `<p class="is-chg">${E(D.change)}</p>` : ''}</div>` : '';
    const facts = V2.kFacts(D.facts).replace('class="k-facts"', 'class="k-facts pk-hfx"');
    const dbl = V2.kStep(1, 'In doubles.', 'what it means on the field', `<ul class="is-dbl">${D.doubles.map(t => `<li>${E(t)}</li>`).join('')}</ul>`);
    const us = V2.kStep(2, 'Who runs it.', 'tap one to open it', `<div class="is-users">${D.users.map(([n, pct, tot]) => `<button type="button" class="is-u">${V2.mon(n, {iw: 64, bare: true})}<b>${V2.nameHtml(V2.disp(n))}</b><small><em>${pct}%</em> of ${E(V2.disp(n))} run it</small><small>${tot.toLocaleString('en-US')} ${E(V2.disp(n))} on teams</small><span class="bar"><i style="--v:${pct}%"></i></span></button>`).join('')}</div><p class="is-src">${E(SRC)}</p>`);
    let more = '';
    if (D.learnId || D.holdersOf) {
      let list;
      if (D.learnId) { const i = MOVES.findIndex(m => m[0] === D.learnId); list = ROSTER.filter(q => !q.m && (LEARN[q.n] || []).includes(i)); }
      else list = ROSTER.filter(q => q.a.includes(D.holdersOf)); const seen = new Set(); list = list.filter(q => { const k = q.m ? q.b : q.n; if (seen.has(k)) return false; seen.add(k); return true; });
      const shown = new Set(D.users.map(u => u[0])), rest = list.filter(q => !shown.has(q.n));
      more = V2.kStep(3, D.learnId ? 'Who else can learn it.' : 'Who else has it.', `${list.length} Pokémon in Reg M-C · tap one to open it`,
        `<div class="is-learn">${rest.slice(0, 24).map(q => `<button type="button" title="${E(V2.disp(q.n))}">${V2.mon(q.n, {iw: 48, bare: true})}</button>`).join('')}</div>${rest.length > 24 ? V2.kLink(`Show all ${rest.length}`, {href: '#'}) : ''}`);
    }
    const links = `<div class="is-links">${D.links.map(([l, h]) => V2.kLink(l, {href: h})).join('')}</div>`;
    const html = CSS + `<div class="pkf is-wrap" style="--pk-c1:${D.c1};--pk-c2:${D.c2}">${head}${tk}${facts}${V2.kPlan(dbl + us + more)}${links}</div>`;
    V2.sheet(html, {label: D.name});
  }, [SHEETS[key], CSS, SRC]);
}

(async () => {
  const [out, only] = process.argv.slice(2);
  const b = await chromium.launch();
  for (const key of Object.keys(SHEETS).filter(k => !only || k === only)) for (const [w, h, th] of [[1440, 900, 'day'], [1440, 900, 'night'], [390, 844, 'day']]) {
    const {c, p} = await open(b, w, h, '#pokemon=garchomp');
    if (th === 'night') { await p.evaluate(() => V2.setTheme ? V2.setTheme('night') : document.documentElement.setAttribute('data-theme', 'night')); await p.waitForTimeout(300); }
    await build(p, key); await p.waitForTimeout(1200);
    const f = `${out}/${key}-${w}${th === 'night' ? '-night' : ''}.png`;
    if (w < 700) { // phone: the whole sheet unrolled, so every part can be judged; its real height is reported
      const hgt = await p.evaluate(() => { const s = document.querySelector('.np-sheet'); const hh = s.scrollHeight; s.style.maxHeight = 'none'; s.style.position = 'absolute'; s.style.top = '0'; s.style.bottom = 'auto'; return hh; });
      await p.setViewportSize({width: w, height: Math.max(h, hgt + 20)}); await p.waitForTimeout(400);
      await p.screenshot({path: f}); console.log(f, 'sheet', hgt, 'px =', (hgt / h).toFixed(2), 'phone screens');
    } else {
      const hgt = await p.evaluate(() => document.querySelector('.np-sheet').scrollHeight);
      await p.screenshot({path: f}); console.log(f, 'sheet content', hgt, 'px');
    }
    await c.close();
  }
  await b.close();
})();
