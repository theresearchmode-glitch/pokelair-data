// Mock-ups for the Moves / Abilities / Items info sheets, ROUND 2 (Nov 22). MOCK-UP ONLY: no site code changes.
// Sim on round 1: "not as huge ... seems like we're shouting at our playerbase", "dont get rid of the fun and creativity tho".
// So: same case-file voice and slants, at a talking volume: a slanted colour file tab (name + faint giant outline letters),
// a small stat strip, a red "CHANGES DEC 2" stamp, small slanted section heads in the site's crime-file voice, a narrower sheet.
// It opens the published Preview's own files (NastyPlot Full Redesign artifact, version 1795352573-bcff) and opens V2.sheet
// with mock HTML built with the site's own helpers (V2.mon, V2.typeChip, V2.kLink, V2.nameHtml) and tokens.
// Numbers: Online tournaments, last 28 days (Oct 21 - Nov 18, 7,870 teams), measured by tools/sample.mjs -> tools/sample-28.json.
// Text: Showdown (MIT) / our ABIL, plus hand-written doubles lines (each to be checked before build).
// Run: node tools/mock.cjs <out folder> [sheet]
const {chromium} = require('C:/Users/simra/code/pl-pcrun/node_modules/playwright');
const {open} = require('./pv-shot.cjs');
const S = require('./sample-28.json');
const NAME = {'Hisuian Arcanine': 'Arcanine-Hisui', 'Basculegion ♀': 'Basculegion-F', 'Lycanroc Dusk': 'Lycanroc-Dusk', 'Indeedee ♀': 'Indeedee-F'};
const users = (k, n = 6) => S[k].users.slice(0, n).map(([nm, c, pct, tot]) => [NAME[nm] || nm, pct, tot]);
const SRC = 'Online tournaments, last 28 days (Oct 21 – Nov 18) · 7,870 teams';

const SHEETS = {
  'rock-slide': {kind: 'Move', name: 'Rock Slide', type: 'Rock', c: 'var(--ty-Rock)', sub: 'Physical',
    share: ['46%', 'of tournament teams'],
    lead: 'Hits both foes. Each one hit has a 30% chance to flinch.',
    stamp: ['Changes Dec 2', 'accuracy 90% → 95% · flinch 30% → 20%'],
    stats: [['Power', '75'], ['Accuracy', '90%'], ['PP', '12'], ['Priority', '0'], ['Hits', 'Both foes'], ['Contact', 'No']],
    doubles: ['Hits both foes, each for 0.75× damage', 'Never hits your partner', 'Blocked by Protect and Wide Guard', 'Flinch only works if it moves first'],
    users: users('Rock Slide'), learnId: 'Rock Slide', links: [['Try It in the Calc', '#calc'], ['Winning Teams With It', '#winning']]},
  'intimidate': {kind: 'Ability', name: 'Intimidate', c: 'var(--logo-blue)', sub: 'Ability',
    share: ['54%', 'of tournament teams'],
    lead: 'When it comes in, lowers both foes’ Attack by 1 stage.',
    stats: [['Teams', '4,220'], ['Pokémon run it', '16'], ['Can have it', '25']],
    doubles: ['Hits both foes at once', 'Works again each time it switches back in', 'Defiant and Competitive foes get a boost instead', 'Inner Focus, Oblivious, Own Tempo and Scrappy ignore it'],
    users: users('Intimidate'), holdersOf: 'Intimidate', links: [['Winning Teams With It', '#winning']]},
  'focus-sash': {kind: 'Item', name: 'Focus Sash', c: '#C41E35', sub: 'Held item',
    share: ['69%', 'of tournament teams'],
    lead: 'At full HP, it survives a hit that would knock it out, with 1 HP left. Then it’s used up.',
    stats: [['Teams', '5,451'], ['Pokémon run it', '98'], ['Uses per battle', '1']],
    doubles: ['Fake Out or any chip damage first breaks it', 'Multi-hit moves can still finish it', 'Best on fast, frail Pokémon'],
    users: users('Focus Sash'), links: [['Winning Teams With It', '#winning']]},
};

const CSS = `<style>
.np-sheet:has(.is2){width:min(880px,calc(100% - 64px))}.np-sheet:has(.is2)>.x{float:none;display:block;margin-left:auto}.is2{margin-top:calc(-1 * var(--tap))}
.is2{padding:var(--s6) var(--s8) var(--s8);display:grid;gap:var(--s6)}
/* the file tab: a slanted colour card, name in the logo font, a faint giant outline of the name behind (as the Pokémon card) */
.is-tab{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:var(--s4);padding:var(--s5) var(--s6);margin-right:var(--s10);color:var(--on-type);background:var(--c);clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,22px 100%,0 calc(100% - 22px))}
.is-tab .gh{position:absolute;right:-8px;top:-14px;font:italic 900 104px/1 var(--u);font-synthesis:style;color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,.22);white-space:nowrap;pointer-events:none}
.is-tab .kk{display:inline-block;margin-bottom:var(--s2);padding:2px var(--s2);background:var(--plate);color:var(--on-plate);font:italic 800 var(--t13)/1.4 var(--u);font-synthesis:style;letter-spacing:.04em;transform:skewX(-8deg)}
.is-tab h2{margin:0;font:italic 800 var(--t34)/1.05 var(--u);font-synthesis:style;color:var(--on-type)}
.is-tab .sub{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s2);margin-top:var(--s2);font:600 var(--t15)/1.3 var(--b)}
.is-tab .np-type{box-shadow:0 0 0 2px rgba(255,255,255,.6)}
.is-tab .sh{position:relative;text-align:right}.is-tab .sh b{display:block;font:italic 800 var(--t34)/1 var(--u);font-synthesis:style}.is-tab .sh span{font:600 var(--t13)/1.3 var(--b)}

/* KIND (Sim, Nov 22: 'nothing clearly distincts an item from a move from an Ability ... be creative'): each kind is its own case-file object.
   MOVE = the case file: the slanted type-colour ticket (the move tickets' shape) with speed lines.
   ABILITY = an ID card: rounded dark card, a blue strip, a big fingerprint (it's who the Pokémon is), 'TRAIT ON FILE'.
   ITEM = an evidence tag: a manila tag with a punched hole and a string, an EVIDENCE stamp (it's what it's carrying). */
.is-tab.kd-move{background:repeating-linear-gradient(115deg,transparent 0 18px,rgba(255,255,255,.08) 18px 21px),var(--c)}
.is-tab.kd-ability{clip-path:none;border-radius:var(--r-l);background:var(--plate);color:var(--on-plate);padding-left:calc(var(--s6) + 12px);box-shadow:var(--shadow-lift)}
.is-tab.kd-ability::before{content:'';position:absolute;left:0;top:0;bottom:0;width:12px;background:var(--c)}
.is-tab.kd-ability h2,.is-tab.kd-ability .sh{color:var(--on-plate)}.is-tab.kd-ability .kk{background:var(--c);color:#fff}
.is-tab .fp{position:absolute;right:150px;top:50%;width:150px;height:180px;translate:0 -50%;color:rgba(255,255,255,.17);pointer-events:none}
.is-tab .tof{display:inline-block;margin-left:var(--s2);padding:1px var(--s2);border:2px solid rgba(255,255,255,.55);font:italic 800 var(--t13)/1.4 var(--u);font-synthesis:style;letter-spacing:.06em;transform:rotate(-3deg)}
.is-tagw{position:relative;padding-left:26px;margin-right:var(--s10)}
.is-tagw .str{position:absolute;left:0;top:-14px;width:70px;height:80px;color:var(--ink-3);pointer-events:none;z-index:1}
.is-tab.kd-item{margin-right:0;background:#E9D5A1;color:#17161A;clip-path:polygon(40px 0,100% 0,100% 100%,40px 100%,0 50%);padding-left:76px}
.is-tab.kd-item::before{content:'';position:absolute;left:22px;top:50%;width:18px;height:18px;margin-top:-9px;border-radius:50%;background:var(--surface);box-shadow:inset 0 0 0 3px #C9B27A}
.is-tab.kd-item::after{content:'';position:absolute;left:56px;top:10px;bottom:10px;border-left:2px dashed rgba(23,22,26,.25)}
.is-tab.kd-item h2,.is-tab.kd-item .sh{color:#17161A}.is-tab.kd-item .gh{-webkit-text-stroke-color:rgba(23,22,26,.10)}.is-tab.kd-item .kk{background:#17161A;color:#E9D5A1}
.is-tab .ev{position:absolute;right:210px;top:16px;padding:2px var(--s2);border:3px solid #C41E35;color:#C41E35;font:italic 900 var(--t20)/1.2 var(--u);font-synthesis:style;letter-spacing:.08em;transform:rotate(-8deg);opacity:.85}
.is2.kd-ability .is-h h3::before{width:12px;height:12px;top:6px;border-radius:50%;transform:none;background:none;box-shadow:inset 0 0 0 3px var(--c)}
.is2.kd-item .is-h h3::before{width:16px;height:11px;top:7px;transform:none;clip-path:polygon(5px 0,100% 0,100% 100%,5px 100%,0 50%)}
@media (max-width:699.98px){.is-tab .fp{right:-10px;width:120px;height:150px}.is-tab .ev{display:none}.is-tab .sh span{white-space:nowrap}.is-stats{column-gap:var(--s3)}.is-stats dd{font-size:var(--t17)}.is-tab.kd-item{padding-left:64px}.is-tagw{margin-right:var(--s10)}}
.is-lead{margin:0;font:500 var(--t17)/1.5 var(--b);color:var(--ink);max-width:640px}
.is-row{display:flex;flex-wrap:wrap;align-items:flex-start;gap:var(--s4) var(--s6)}
/* a case-file stamp for patch changes */
.is-stamp{display:inline-grid;gap:2px;padding:var(--s1) var(--s3);border:2px solid var(--pick-text);color:var(--pick-text);transform:rotate(-2deg);font:600 var(--t13)/1.4 var(--b)}
.is-stamp b{font:italic 800 var(--t13)/1.3 var(--u);font-synthesis:style;letter-spacing:.06em;text-transform:uppercase}
/* the stat strip: small, slanted dividers */
.is-stats{display:flex;flex-wrap:wrap;margin:0;padding:0}
.is-stats div{padding:var(--s1) var(--s5) var(--s1) 0;margin-right:var(--s5);border-right:1px solid var(--rule)}.is-stats div:last-child{border:0;margin:0}
.is-stats dt{font:600 var(--t13)/1.3 var(--b);color:var(--ink-3)}.is-stats dd{margin:0;font:italic 800 var(--t20)/1.2 var(--u);font-synthesis:style;color:var(--ink)}
/* section heads: the site's crime-file voice, at talking size, with a short slanted bar in the sheet's colour */
.is-h{display:flex;align-items:baseline;flex-wrap:wrap;gap:var(--s1) var(--s3);margin:0 0 var(--s3)}
.is-h h3{position:relative;margin:0;padding-left:22px;font:italic 800 var(--t20)/1.2 var(--u);font-synthesis:style;color:var(--ink)}
.is-h h3::before{content:'';position:absolute;left:0;top:6px;width:14px;height:12px;background:var(--c);transform:skewX(var(--slant))}
.is-h span{font:500 var(--t13)/1.3 var(--b);color:var(--ink-3)}
.is-sec{padding-top:var(--s5);border-top:1px solid var(--rule)}
.is-dbl{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--s2) var(--s6)}
.is-dbl li{position:relative;padding-left:var(--s4);font:500 var(--t15)/1.5 var(--b);color:var(--ink)}
.is-dbl li::before{content:'';position:absolute;left:0;top:9px;width:8px;height:4px;background:var(--plot);transform:skewX(var(--slant))}
.is-users{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s1) var(--s3)}
.is-u{display:grid;grid-template-columns:48px minmax(0,1fr) auto;column-gap:var(--s2);align-items:center;padding:var(--s1) var(--s2);text-align:left;color:inherit;background:none;border:0;border-radius:var(--r-m);cursor:pointer}
.is-u:hover{background:var(--wash)}.is-u .np-mon{grid-row:1/3}
.is-u b{font:700 var(--t15)/1.2 var(--b);min-width:0}.is-u small{grid-column:2/4;font:500 var(--t13)/1.3 var(--b);color:var(--ink-3)}
.is-u em{font:italic 800 var(--t17)/1 var(--u);font-synthesis:style;color:var(--plot-text)}
.is-learn{display:flex;flex-wrap:wrap;gap:2px}.is-learn button{background:none;border:0;padding:0;cursor:pointer}
.is-src{margin:var(--s2) 0 0;font:500 var(--t13)/1.5 var(--b);color:var(--ink-3)}
.is-links{display:flex;flex-wrap:wrap;gap:var(--s2) var(--s6)}
@media (max-width:699.98px){.np-sheet:has(.is2){width:100%}.is2{padding:var(--s4) var(--s4) var(--s6);gap:var(--s5)}
 .is-tab{margin-right:var(--s10);grid-template-columns:1fr;padding:var(--s4)}.is-tab h2{font-size:var(--t28)}.is-tab .sh{text-align:left;display:flex;align-items:baseline;gap:var(--s2)}.is-tab .sh b{font-size:var(--t26)}.is-tab .gh{font-size:80px}
 .is-dbl{grid-template-columns:1fr}.is-users{grid-template-columns:1fr}.is-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));row-gap:var(--s3)}.is-stats div{padding:0 var(--s2) 0 0;margin:0;border:0}.is-links{gap:var(--s2) var(--s5)}}
</style>`;

async function build(p, key) {
  return p.evaluate(([D, CSS, SRC]) => {
    const E = V2.esc, h = (t, s) => `<div class="is-h"><h3>${E(t)}</h3>${s ? `<span>${E(s)}</span>` : ''}</div>`;
    const K = D.kind.toLowerCase(), KK = {move: 'CASE FILE · MOVE', ability: 'ID CARD · ABILITY', item: 'EVIDENCE · ITEM'}[K];
    const extra = K === 'ability' ? '<svg class="fp" viewBox="0 0 100 120" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><ellipse cx="50" cy="62" rx="6.0" ry="7.3" stroke-dasharray="18 5" transform="rotate(0 50 62)"/><ellipse cx="50" cy="62" rx="11.2" ry="13.7" stroke-dasharray="25 9" transform="rotate(13 50 62)"/><ellipse cx="50" cy="62" rx="16.4" ry="20.0" stroke-dasharray="32 13" transform="rotate(26 50 62)"/><ellipse cx="50" cy="62" rx="21.6" ry="26.4" stroke-dasharray="39 5" transform="rotate(39 50 62)"/><ellipse cx="50" cy="62" rx="26.8" ry="32.7" stroke-dasharray="46 9" transform="rotate(52 50 62)"/><ellipse cx="50" cy="62" rx="32.0" ry="39.0" stroke-dasharray="53 13" transform="rotate(65 50 62)"/><ellipse cx="50" cy="62" rx="37.2" ry="45.4" stroke-dasharray="60 5" transform="rotate(78 50 62)"/><ellipse cx="50" cy="62" rx="42.4" ry="51.7" stroke-dasharray="67 9" transform="rotate(91 50 62)"/><ellipse cx="50" cy="62" rx="47.6" ry="58.1" stroke-dasharray="74 13" transform="rotate(104 50 62)"/></svg>' : K === 'item' ? '<span class="ev" aria-hidden="true">EVIDENCE</span>' : '';
    const tab0 = `<div class="is-tab kd-${K}">${extra}<span class="gh" aria-hidden="true">${E(D.name.toUpperCase())}</span><div style="position:relative"><span class="kk">${KK}</span><h2>${E(D.name)}</h2>
      <div class="sub">${D.type ? V2.typeChip(D.type) : ''}<span>${E(D.sub)}</span>${K === 'ability' ? '<span class="tof">TRAIT ON FILE</span>' : ''}</div></div><div class="sh"><b>${E(D.share[0])}</b><span>${E(D.share[1])}</span></div></div>`;
    const tab = K === 'item' ? `<div class="is-tagw"><svg class="str" viewBox="0 0 70 80" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M57 54 C 40 40, 20 30, 4 2"/></svg>${tab0}</div>` : tab0;
    const top = `<div class="is-row"><p class="is-lead">${E(D.lead)}</p>${D.stamp ? `<p class="is-stamp"><b>${E(D.stamp[0])}</b>${E(D.stamp[1])}</p>` : ''}</div>
      <dl class="is-stats">${D.stats.map(([l, v]) => `<div><dt>${E(l)}</dt><dd>${E(v)}</dd></div>`).join('')}</dl>`;
    const dbl = `<section class="is-sec">${h('On the field.', 'what it means in doubles')}<ul class="is-dbl">${D.doubles.map(t => `<li>${E(t)}</li>`).join('')}</ul></section>`;
    const us = `<section class="is-sec">${h('Usual suspects.', 'who runs it, and how often · tap one to open it')}<div class="is-users">${D.users.map(([n, pct, tot]) => `<button type="button" class="is-u">${V2.mon(n, {iw: 48, bare: true})}<b>${V2.nameHtml(V2.disp(n))}</b><em>${pct}%</em><small>of ${tot.toLocaleString('en-US')} ${E(V2.disp(n))} run it</small></button>`).join('')}</div><p class="is-src">${E(SRC)}</p></section>`;
    let more = '';
    if (D.learnId || D.holdersOf) {
      let list;
      if (D.learnId) { const i = MOVES.findIndex(m => m[0] === D.learnId); list = ROSTER.filter(q => !q.m && (LEARN[q.n] || []).includes(i)); }
      else { list = ROSTER.filter(q => q.a.includes(D.holdersOf)); const seen = new Set(); list = list.filter(q => { const k = q.m ? q.b : q.n; if (seen.has(k)) return false; seen.add(k); return true; }); }
      const shown = new Set(D.users.map(u => u[0])), rest = list.filter(q => !shown.has(q.n));
      more = `<section class="is-sec">${h('Also capable.', `${D.learnId ? 'can learn it' : 'can have it'}: ${list.length} Pokémon in Reg M-C · tap one to open it`)}<div class="is-learn">${rest.slice(0, 20).map(q => `<button type="button" title="${E(V2.disp(q.n))}">${V2.mon(q.n, {iw: 40, bare: true})}</button>`).join('')}</div>${rest.length > 20 ? V2.kLink(`Show all ${rest.length}`, {href: '#'}) : ''}</section>`;
    }
    const links = `<div class="is-sec is-links">${D.links.map(([l, hr]) => V2.kLink(l, {href: hr})).join('')}</div>`;
    V2.sheet(CSS + `<div class="is2 kd-${D.kind.toLowerCase()}" style="--c:${D.c}">${tab}${top}${dbl}${us}${more}${links}</div>`, {label: D.name});
  }, [SHEETS[key], CSS, SRC]);
}

(async () => {
  const [out, only] = process.argv.slice(2);
  const b = await chromium.launch();
  for (const key of Object.keys(SHEETS).filter(k => !only || k === only)) for (const [w, hh, th] of [[1440, 900, 'day'], [1440, 900, 'night'], [390, 844, 'day']]) {
    const {c, p} = await open(b, w, hh, '#pokemon=garchomp');
    if (th === 'night') { await p.evaluate(() => V2.setTheme ? V2.setTheme('night') : document.documentElement.setAttribute('data-theme', 'night')); await p.waitForTimeout(300); }
    await build(p, key); await p.waitForTimeout(1200);
    const f = `${out}/${key}-${w}${th === 'night' ? '-night' : ''}.png`;
    if (w < 700) { // phone: the whole sheet unrolled, so every part can be judged; its real height is reported
      const hgt = await p.evaluate(() => { const s = document.querySelector('.np-sheet'); const x = s.scrollHeight; s.style.maxHeight = 'none'; s.style.position = 'absolute'; s.style.top = '0'; s.style.bottom = 'auto'; return x; });
      await p.setViewportSize({width: w, height: Math.max(hh, hgt + 20)}); await p.waitForTimeout(400);
      await p.screenshot({path: f}); console.log(f, 'sheet', hgt, 'px =', (hgt / hh).toFixed(2), 'phone screens');
    } else { const hgt = await p.evaluate(() => document.querySelector('.np-sheet').scrollHeight); await p.screenshot({path: f}); console.log(f, 'sheet content', hgt, 'px'); }
    await c.close();
  }
  await b.close();
})();
