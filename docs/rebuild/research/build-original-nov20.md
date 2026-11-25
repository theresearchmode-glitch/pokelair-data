# Build page: original concepts (Q81 C and D), Nov 20

Prototype only, by a helper. Nothing committed, no site code changed. Each concept replaced the Build page's draw (wrapping
`V2.pages.build.draw`, so redraws, tabs, theme change and every real hook keep working) inside a Preview build of t1rules with the
data from 0c992f69 (`--preview-data`), served over http, real data. The team in every picture is the first build with the
default settings (Whole Roster, 2 Megas): Sun · Tailwind, 93 Top tier, Proven team, 1 to catch (Mega Floette).
Pictures: docs/rebuild/pics/nov20/Q81/ (Q81-C-*, Q81-D-*). The other helper's Blueprint restyle is A/B.

Sim's four tests (his words, via the coordinator): "polish, creativity, fun, and daily usability".

## The 6 ideas (scores 1-5: polish / creativity / fun / daily usability; my judgement, not measured)
| # | Idea | Polish | Creative | Fun | Daily use |
|---|---|---|---|---|---|
| 1 | **The Scheme Board**: the six pinned on a villain's plot board, red strings to the threats they beat, score as "odds of success". | 3 | 4 | 5 | 2 (strings get messy; hard to read in seconds on a phone) |
| 2 | **The Line-Up** (built, C): your six stand in a villain line-up in front of a height chart whose lines are the Strength Score bands (60 Needs work, 70 Solid, 80 Tournament ready, 90 Top tier); a thick line in the band colour marks how tall the team measures. | 4 | 4 | 5 | 4 |
| 3 | **Team Preview** (built, D, RECOMMENDED): the in-game moment before a battle. Your six on Home's blue field, "the field" (the real top 30 threats) on Home's black plate, the Strength Score in a white VS plate on the seam. Threats your six beats fade to grey; the ones still in colour are the ones left to plan for. | 4 | 5 | 4 | 5 |
| 4 | **Booster packs**: each of the 4 options is a sealed pack; open one and six cards fan out. | 3 | 3 | 5 | 2 (an extra tap before you see the team, every day) |
| 5 | **The slot machine**: Build Me a Team is a lever, the six are reels, other options are earlier pulls. | 3 | 3 | 4 | 2 (a gimmick; spinning hides the result) |
| 6 | **+6 stages**: Nasty Plot's boost: the score drawn as stacked stat-stage arrows (base from Pokémon and sets, + matchups, + record). | 4 | 3 | 3 | 3 (good for the breakdown, weak as a whole page) |

Why these two: 2 and 3 are the only ones that turn a real number into the picture (the bands, the threats) instead of decorating
it, and both show the six, the score and Load Team without an extra tap.

## C. The Line-Up
- **Idea:** building a team = picking your crew. The six step up in a line-up; the height chart's lines are the score bands, and
  the team's Strength Score is a thick line across the board with a giant 93 + "Top tier" on it.
- **Handy:** in one look you see the score AND where it sits among the bands (how far from 90 or 80). Each placard: No., Mega,
  name, item, tier, "To catch". Load Team right under the board on every width. Options, Other line-ups (A-D with scores) and
  the 4 proof numbers ("The rap sheet") sit on Home-style white plates with the offset shade.
- **Fun:** villain line-up, "No.01" placards, "To catch" reads like a wanted tag, "The rap sheet".
- **Before Build:** the empty height chart with the options plate standing where the six will appear.

## D. Team Preview (RECOMMENDED)
- **Idea:** building a team = getting ready for who you will face. Your six vs the field, like the in-game Team Preview and
  Home's Battle VS tile; the Strength Score is what you bring to the VS.
- **Handy:** it shows the Matchups detail that today's page only gives as "24/30": which of the top 30 threats you Beat / Handle
  (greyed out, with a blue / grey bar) and which are still Shaky / No answer (full colour, amber / red bar, sorted first),
  each tappable for its info. Legend with counts (11 Beats it · 13 Handles it · 6 Shaky · 0 No answer). Load Team right under
  the stage. Options, Other teams and "Scouting report" on white plates below.
- **Fun:** the VS moment; the threats you beat literally fade out, the ones still in colour are your next scheme.
- **Before Build:** the options sit on the blue "Your six" side; the real top 30 threats wait in colour on the black side
  ("Who your six has to get past. Build one to see who it beats.").
- *Why recommended: the strongest idea about what building means, it adds useful real information instead of decoration, and it
  uses Home's own blue field / black plate / VS, so it reads as NastyPlot at once.*

## Heights at 390 (measured: scrollHeight after load / after Build, day; Playwright, deviceScaleFactor 2)
| | before Build | after Build | Load Team's top |
|---|---|---|---|
| Today (Blueprint) | 1412 | 4102 | 1490 px |
| C Line-Up | 1583 (+171) | 3642 (-460) | 1075 px |
| D Team Preview | 1918 (+506) | 3830 (-272) | 1263 px |
Night at 390: C 3616, D 3830. 1440 (day = night): C 1070 / 2442, D 1350 / 2407 (today 926 / 2160, from the S28 notes).
Other widths after Build: C 320 4115, 768 3019, 1024 2993, 1180 2473; D 320 4287, 768 3333, 1024 3422, 1180 2452.
Honest note: both are LONGER than today before a build (D by 0.6 screens: the 30 threats); both are shorter after.

## Checked / not checked
- Checked (screenshots I looked at + DOM measurement in the same runs): no sideways scroll at 320, 390, 768, 1024, 1180, 1440
  (scrollWidth vs innerWidth, day; 390 and 1440 also night); 0 page errors in every run; light and dark render.
- Fixed while building: board margin collapse (C), VS plate covering the first threat column (D), placard text invisible at night
  (C used a night-light ink on white), names cut at 390/320.
- Not checked: polish-check / qcheck sweep, contrast numbers (the greyed threats are meant to be faint; the "Mega" light blue on
  the blue field in D needs a measure), tap sizes of the threat sprites at 390 (about 33 px: under 44, needs a fix or a bigger
  grid), keyboard order, 700-1099 beyond 768/1024 screenshots, a low score (e.g. 55) where C's score line would sit behind
  the sprites, a build with "No answer" threats, Revisions with the fresh-take row, the busy (re-building) state.
- Seen and not fixed: at 320 long names break mid-word in both (Basculegion); D's blue side has empty space under the options
  before a build at 1440; C's rap-sheet numbers don't line up in one column (each row sizes itself); C's line labels on phones
  show only 90 and 80; the "Mega" + name rows make the six's text uneven in D at 390.
- New copy needing Sim's OK: "Line-up 1 of 4", "Change the line-up", "Other line-ups", "The rap sheet" (C); "Preview 1 of 4",
  "Your six", "The field · top 30 threats", "Who your six has to get past. Build one to see who it beats.", "Change the build",
  "Other teams", "Scouting report" (D). The proven-team note and all numbers are today's words.

## How it was injected (for building later)
JS ran through `window.__ev(...)` after `__PL_TEST`; CSS through `addStyleTag`. Shared helpers, then one file per concept.

### common.js
```js
// Q81 shared pieces: the same data, words and hooks as build-sheet.js (data-bduse/save/copy, data-bdshow, data-bdgo, data-v2mon, data-bdwhy, slides)
V2.qActs = M => { const E = V2.esc, t = M.t, tips = (t.why || []).filter(w => /^(Best single catch|To reach 90\+)/.test(w) || /isn't in your box: /.test(w));
  return `<div class="row bd-acts q-acts"><button type="button" class="np-btn" data-bduse>Load Team</button><button type="button" class="np-btn2" data-bdsave${S.teams.length >= 10 ? ' disabled' : ''}><span>Save</span></button><button type="button" class="np-btn2" data-bdcopy><span>Copy for Showdown</span></button>
    <span class="bd-catch">${M.nCatch === 6 ? 'All six to catch: none is in your box yet' : M.nCatch ? `${M.nCatch} to catch` : 'All six are in your box'}</span></div>${tips.map(w => `<p class="bd-catch q-tip">${E(w)}</p>`).join('')}`; };
V2.qGrade = t => { let G = null, CK = null; try { CK = proChecks(t._ms, true); G = CH.gradeOf(t._rd, CK, t._ms); } catch (e) {} const rows = t._rd && t._rd.rows || [];
  return {G, s: G ? Math.round(G.s) : '–', ans: rows.filter(x => x.level >= 2).length, n: rows.length, bas: CK ? CK.items.filter(x => !x.skip && !x.note) : [], band: G ? V2.BAND_K[G.band] || 'solid' : 'solid'}; };
V2.qRevs = (M, cls, L) => { const E = V2.esc; L = L || 'ABCDEFGH';
  return `<div class="${cls}" role="list">${M.res.teams.map((t, i) => { const g = V2.qGrade(t), on = i === M.k;
    return `<div role="listitem"><button type="button" class="q-rev${on ? ' on' : ''}" data-bdshow="${i}"${on ? ' aria-current="true"' : ''} style="--band:var(--band-${g.band})" aria-label="Option ${i + 1}, ${E(t.label)}, Strength Score ${g.s}${on ? ', shown' : ': show this one'}">
      <span class="q-rl u" aria-hidden="true">${L[i] || i + 1}</span><span class="q-rn"><b>${V2.dotWrap(E(t.label))}</b><small>${g.ans}/${g.n} matchups · ${g.bas.filter(x => x.ok).length}/${g.bas.length} checks</small></span><span class="q-rs u" aria-hidden="true">${g.s}</span></button></div>`; }).join('')}</div>`; };
V2.qNotes = (M, cls) => { const E = V2.esc, pv = M.t.proven, li = (n, u, l, s) => `<li><span class="q-n u">${n}${u ? `<span class="unit">${u}</span>` : ''}</span><span class="q-nt"><b>${l}</b><small>${s}</small></span></li>`;
  return `<ol class="${cls}">${li(M.ans, '/' + M.rows.length, 'Matchups with an answer', `Top ${M.rows.length} threats: ${M.sh} Shaky, ${M.no} No answer`)}
    ${li(`${M.basics.filter(x => x.ok).length}`, '/' + M.basics.length, `Team checks: the ${M.basics.length} basics`, M.notes.length ? 'Notes met: ' + M.notes.map(E).join(', ') : 'No notes met')}
    ${pv ? li((pv.wr * 100).toFixed(1), '% wins', pv.swapped ? 'Their six at events, 1 swap' : 'This exact six at events', `${homeNum(pv.n)} players${pv.g ? `, ${homeNum(pv.g)} games at events` : ''}`) : li('New', '', 'Not yet run at events', 'Built from cores that win; no player has run this exact six')}
    ${M.core ? li(E(M.core[3]), '% wins', `Best trio, ${E(M.core[2])} teams`, E(M.core[1])) : ''}</ol>`; };
V2.qGo = (lab) => { const busy = !!(ui.ab && ui.ab.busy), lk = ui.abLock && byName.get(ui.abLock);
  return `<div class="bd-opt bd-go"><button type="button" class="${ui.ab ? 'np-btn2' : 'np-btn'}" data-bdgo${busy ? ' aria-busy="true" disabled' : ''}><span>${lk ? `Build Around ${V2.esc(V2.disp(lk.n))}` : 'Build Me a Team'}${ui.ab && !busy ? ' ↻' : ''}</span></button></div>`; };
V2.qFigName = n => { const d = V2.disp(n), mega = /^Mega /.test(d); return {mega, name: mega ? d.slice(5) : d}; };
V2.qLower = () => { const win = V2.buildWinners(), cor = V2.buildCores(), tab = V2.bdTab(false, !!win);
  return `${V2.buildJump(false, !!win, tab)}<div class="bd-lower" data-bdtab="${tab}"><div class="bd-lcol">${win}</div>${cor}</div>`; };
V2.qHead = () => V2.buildHead().split('<div class="bd-opts">')[0];
V2.qOpts = () => '<div class="bd-opts">' + V2.buildHead().split('<div class="bd-opts">')[1];
```

### c-lineup.js
```js
// Q81 C, The Line-Up: your six step up in front of a height chart whose lines are the Strength Score bands; the team "measures" its score.
V2.luBands = [[100, ''], [90, 'Top tier'], [80, 'Tournament ready'], [70, 'Solid'], [60, 'Needs work']];
V2.luChart = s => `<div class="lu-chart" aria-hidden="true">${V2.luBands.map(([v, w]) => `<i class="lu-ln${v === 100 ? ' top' : ''}" style="--v:${v}"><span>${v}${w ? ` <em>${w}</em>` : ''}</span></i>`).join('')}${s != null ? `<i class="lu-mark" style="--v:${Math.max(52, Math.min(100, s))}"></i>` : ''}</div>`;
V2.luFig = (m, i) => { const E = V2.esc, p = byName.get(m.n), R = monRating(p), f = V2.qFigName(m.n);
  return `<button type="button" class="lu-fig" data-v2mon="${E(m.n)}" aria-label="${E(V2.disp(m.n))}${m.it ? ', ' + E(m.it) : ''}${R ? `, ${E(R.tier)} tier ${R.n}` : ''}${!m.box ? ', to catch' : ''}: open its info">
    <span class="lu-art" aria-hidden="true">${V2.mon(m.n, {bare: true})}</span>
    <span class="lu-card"><span class="lu-no u" aria-hidden="true">No.${String(i + 1).padStart(2, '0')}</span>${f.mega ? '<span class="lu-mg u">Mega</span>' : ''}<b class="u">${E(f.name)}</b><small>${E(m.it || '')}</small><small class="r">${R ? `${E(R.tier)} tier ${R.n}` : ''}</small>${!m.box ? '<span class="lu-catch">To catch</span>' : ''}</span></button>`; };
V2.luPage = M => { const E = V2.esc, t = M.t, chips = t.gp || [], pct = M.G && CH.rkOf(M.G) != null ? CH.pctTxt(M.G) : '';
  const res = `<section class="q-lu" style="--band:var(--band-${M.band})">
    <div class="lu-hero"><div class="lu-id"><p class="lu-k"><span class="lu-plate u">Line-up ${M.k + 1} of ${M.n}</span><span>${E(M.kind)}${t.megas > 1 ? ` · ${t.megas} Mega options` : ''}</span></p>
      <h2 class="u">${E(t.label).replace(/ · /g, ' · ')}</h2>${chips.length ? `<div class="lu-chips">${chips.map(c => `<span class="np-chip">${E(c)}</span>`).join('')}</div>` : ''}</div>
      <div class="lu-sc"><p><b>Strength Score</b>${pct ? ` · ${E(pct)}` : ''}</p>${M.G ? V2.buildBrk(M.G) : ''}</div></div>
    <div class="lu-board">${V2.luChart(M.G ? M.G.s : null)}<p class="lu-tag" style="--v:${Math.max(52, Math.min(100, M.G ? M.G.s : 60))}"><b class="u">${M.s}</b><span class="u">${E(M.word)}</span></p>
      <div class="lu-six">${t.mons.map(V2.luFig).join('')}</div></div>
    <div class="lu-near">${V2.qActs(M)}</div>
    <div class="lu-low"><div class="lu-col"><div class="lu-plate2"><p class="lu-h u">Change the line-up</p>${V2.bpSpec()}${V2.qGo()}</div>
        ${M.n > 1 ? `<div class="lu-plate2"><p class="lu-h u">Other line-ups <small>tap one to see it</small></p>${V2.qRevs(M, 'lu-revs')}</div>` : ''}</div>
      <div class="lu-col"><div class="lu-plate2 lu-rap"><p class="lu-h u">The rap sheet</p>${V2.qNotes(M, 'lu-notes')}${t.proven && !t.proven.swapped && t.proven.wr >= .55 ? '<p class="bd-catch">This exact team has won at real events. Treat these as optional tweaks, not problems.</p>' : ''}</div></div></div></section>`;
  return `<div class="bd2 q-c">${V2.qHead()}<div class="bd-result" aria-live="polite">${res}</div>${V2.qLower()}</div>`; };
V2.luBefore = () => `<div class="bd2 q-c q-c0">${V2.qHead()}<div class="lu-board lu-empty">${V2.luChart(null)}<div class="lu-opts">${V2.qOpts()}</div></div><div class="bd-result" aria-live="polite">${V2.buildAnswer()}</div>${V2.qLower()}</div>`;
(() => { const before = V2.pages.build.draw0 || V2.pages.build.draw; V2.pages.build.draw0 = before;
  V2.pages.build.draw = () => { const M = V2.bpModel(); if (M) return V2.luPage(M); if (!ui.ab) return V2.luBefore(); return before(); }; })();
V2.redraw();
```

### c-lineup.css
```css
/* Q81 C, The Line-Up (prototype; tokens only) */
.q-c{--pad:104px;--ch:260px;--sp:140px}
.q-c .bd-result{margin-top:var(--s6)}
.q-lu{background:var(--sd-tools-bg);box-shadow:0 0 0 100vmax var(--sd-tools-bg);clip-path:inset(0 -100vmax);padding:var(--s8) 0 var(--s10)}
.lu-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,420px);gap:var(--s4) var(--s8);align-items:end;margin-bottom:var(--s6)}
.lu-k{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s2) var(--s3);margin:0;font:600 var(--t13)/1.4 var(--b);color:var(--ink-2)}
.lu-plate{display:inline-block;padding:var(--s1) var(--s4);background:var(--sd-feat);color:var(--sd-on-feat);font-size:var(--t15);clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.lu-id h2{font-size:clamp(34px,4.6vw,64px);line-height:1.05;margin:var(--s3) 0 0}
.lu-chips{display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s3)}
.lu-chips .np-chip{border:0;background:var(--sd-card);color:var(--sd-card-ink)}
.lu-sc p{margin:0;font:var(--t15)/1.5 var(--b);color:var(--ink-2)}.lu-sc p b{color:var(--ink)}
.lu-sc .bd-brk{margin-top:var(--s1);font-size:var(--t13)}
/* the board: Home's black feature plate, slanted top edge; the chart lines are the Strength Score bands */
.lu-board{display:flow-root;position:relative;background:var(--sd-feat);color:var(--sd-on-feat);box-shadow:inset 0 0 0 1px var(--sd-feat-rim);clip-path:polygon(0 var(--s6),100% 0,100% 100%,0 100%);padding-bottom:var(--s6)}
.lu-chart{position:absolute;inset:0;pointer-events:none}
.lu-ln{position:absolute;left:0;right:0;top:calc(var(--pad) + (100 - var(--v)) * var(--ch) / 50);border-top:2px solid var(--sd-speed)}
.lu-ln span{position:absolute;right:var(--s4);bottom:var(--s1);width:120px;text-align:right;font:700 var(--t15)/1 var(--u);font-style:italic;font-synthesis:style;color:var(--sd-feat-ink2)}
.lu-ln em{display:block;margin-top:var(--s1);font:600 var(--t13)/1.2 var(--b);font-style:normal}
.lu-ln.top span{display:none}
.lu-chart::after{content:"";position:absolute;left:0;right:0;top:calc(var(--pad) + var(--ch));border-top:4px solid var(--sd-speed)}
.lu-mark{position:absolute;left:0;right:0;height:8px;top:calc(var(--pad) + (100 - var(--v)) * var(--ch) / 50 - 4px);background:linear-gradient(90deg,var(--band) 0,var(--band) 60%,transparent)}
.lu-tag{position:absolute;left:var(--s6);top:calc(var(--pad) + (100 - var(--v)) * var(--ch) / 50 - 4px);transform:translateY(-100%);margin:0;display:flex;align-items:flex-end;gap:var(--s3);z-index:1}
.lu-tag b{font-size:var(--d120);line-height:.78;color:var(--sd-on-feat);letter-spacing:-.02em}
.lu-tag span{margin-bottom:var(--s2);padding:var(--s1) var(--s4);background:var(--band);color:var(--on-mark);font-size:var(--t17);clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.lu-six{position:relative;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--s5) var(--s4);padding:0 calc(var(--s6) + 120px) 0 var(--s6);margin-top:calc(var(--pad) + var(--ch) - var(--sp))}
.lu-fig{all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:stretch;min-width:0;border-radius:var(--r-s)}
.lu-fig:focus-visible{outline:3px solid var(--sd-ring);outline-offset:4px}
.lu-art{display:block;height:var(--sp)}
.lu-art .np-mon,.lu-art .st{width:100%;height:100%}
.lu-art img{width:100%;height:100%;object-fit:contain;object-position:50% 100%;transition:transform .2s}
.lu-fig:hover .lu-art img{transform:translateY(-6px)}
.lu-card{position:relative;display:grid;justify-items:center;text-align:center;margin-top:var(--s3);padding:var(--s2) var(--s3) var(--s3);background:var(--sd-plate);color:var(--sd-plate-ink);clip-path:polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%)}
.lu-no{font-size:var(--t13);color:var(--sd-plate-num)}
.lu-mg{font-size:var(--t13);color:var(--sd-plate-num);line-height:1.2}
.lu-card b{font-size:var(--t17);line-height:1.25;max-width:100%;overflow-wrap:anywhere}
.lu-card small{font:var(--t13)/1.4 var(--b);color:var(--sd-paper-ink2)}.lu-card small.r{color:var(--sd-plate-ink);font-weight:600}
.lu-catch{margin-top:var(--s1);padding:0 var(--s2);background:var(--logo-pink);color:var(--logo-white);font:700 var(--t13)/1.5 var(--b)}
.lu-mg + b{margin-top:0}
.lu-near .q-acts{margin-top:var(--s5)}
.q-tip{margin:var(--s2) 0 0}
.lu-low{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:var(--s6);margin-top:var(--s8);align-items:start}
.lu-col{display:grid;gap:var(--s6)}
.lu-plate2{background:var(--sd-card);color:var(--sd-card-ink);box-shadow:8px 8px 0 var(--sd-card-shade);padding:var(--s5) var(--s6) var(--s6)}
.lu-h{margin:0 0 var(--s4);font-size:var(--t20)}.lu-h small{font:500 var(--t13)/1 var(--b);font-style:normal;color:var(--sd-card-ink2);margin-left:var(--s2)}
.lu-plate2 .bd-opts{margin:0;padding:0;border:0;grid-template-columns:auto auto;justify-content:start}
.lu-plate2 .bd-around{grid-column:1/-1}
.lu-plate2 .bd-go{margin-top:var(--s5)}
.lu-plate2 .bd-mtip{margin:var(--s3) 0 0}
.lu-revs{display:grid;gap:var(--s2)}
.q-rev{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:var(--s4);padding:var(--s2) var(--s3);border-left:6px solid transparent}
.q-rev:hover{background:var(--wash)}.q-rev:focus-visible{outline:3px solid var(--plot);outline-offset:2px}
.q-rev.on{background:var(--sd-feat);color:var(--sd-on-feat);border-left-color:var(--band)}
.q-rl{display:grid;place-items:center;width:36px;height:36px;background:var(--sd-feat);color:var(--sd-on-feat);font-size:var(--t17);clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)}
.q-rev.on .q-rl{background:var(--band);color:var(--on-mark)}
.q-rn{display:grid;min-width:0}.q-rn b{font:700 var(--t16)/1.3 var(--b)}.q-rn small{font:var(--t13)/1.4 var(--b);opacity:.8}
.q-rs{font-size:var(--t28);color:var(--band)}
.q-rev.on .q-rs{color:var(--sd-on-feat)}
.lu-notes{list-style:none;margin:0;padding:0;display:grid;gap:var(--s4)}
.lu-notes li{display:grid;grid-template-columns:minmax(128px,max-content) minmax(0,1fr);gap:var(--s4);align-items:baseline;padding-top:var(--s3);border-top:1px solid var(--rule)}
.lu-notes li:first-child{border-top:0;padding-top:0}
.q-n{font-size:var(--t34);line-height:1;white-space:nowrap}.q-n .unit{font-size:var(--unit);opacity:.75}
.q-nt{display:grid}.q-nt b{font:700 var(--t16)/1.3 var(--b)}.q-nt small{font:var(--t13)/1.5 var(--b);color:var(--sd-card-ink2)}
.lu-rap .bd-catch{margin:var(--s4) 0 0}
/* before a build: the empty board, the options plate standing where the six will */
.q-c0{--pad:var(--s10);--ch:200px}
.q-c0 .lu-empty{margin-top:var(--s6);padding:calc(var(--pad) + var(--ch) * .35) var(--s6) var(--s6)}
.lu-opts{position:relative;background:var(--sd-plate);color:var(--sd-plate-ink);padding:var(--s5) var(--s6);box-shadow:8px 8px 0 var(--sd-speed)}
.lu-opts .bd-opts{margin:0;padding:0;border:0}
@media (max-width:1099.98px){.lu-hero{grid-template-columns:minmax(0,1fr)}.lu-low{grid-template-columns:minmax(0,1fr)}.lu-card b{font-size:var(--t15)}}
@media (max-width:699.98px){
  .q-c{--pad:76px;--ch:140px;--sp:88px}
  .q-lu{padding:var(--s6) 0 var(--s8)}
  .lu-board{clip-path:polygon(0 var(--s4),100% 0,100% 100%,0 100%);padding-bottom:var(--s4)}
  .lu-tag{left:var(--s4)}.lu-tag b{font-size:var(--d64)}.lu-tag span{font-size:var(--t15)}
  .lu-ln span{right:var(--s3);width:auto;font-size:var(--t13)}.lu-ln em{display:inline;margin-left:var(--s1)}
  .lu-six{grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s3) var(--s2);padding:0 var(--s3)}
  .lu-card{padding:var(--s1) var(--s2) var(--s2)}.lu-card b{font-size:var(--t15)}
  .lu-catch{position:static;margin-top:var(--s1)}
  .lu-low{margin-top:var(--s6);gap:var(--s4)}.lu-col{gap:var(--s4)}
  .lu-plate2{padding:var(--s4);box-shadow:6px 6px 0 var(--sd-card-shade)}
  .lu-plate2 .bd-opts{grid-template-columns:minmax(0,1fr)}
  .lu-notes li{grid-template-columns:minmax(0,1fr);gap:var(--s1)}.q-n{font-size:var(--t26)}
  .lu-card{clip-path:none;padding:var(--s1) 0 var(--s2)}
  .lu-card b{font-size:var(--t13);overflow-wrap:normal;letter-spacing:-.02em}
  .lu-ln[style*="--v:70"] span,.lu-ln[style*="--v:60"] span{display:none}
  .lu-opts .bd-around{grid-column:1/-1}
  .q-c0{--pad:var(--s6);--ch:120px}
  .q-c0 .lu-empty{padding:calc(var(--pad) + var(--ch) * .3) var(--s3) var(--s4)}
  .lu-opts{padding:var(--s4)}
}
@media (max-width:379.98px){.lu-card b{overflow-wrap:anywhere;letter-spacing:-.03em}}
```

### d-preview.js
```js
// Q81 D, Team Preview: the moment before a battle. Your six on the blue side, the field (the top 30 threats) on the black side, the
// Strength Score in the VS plate between. Threats your six beats fade to grey; the ones still in colour are the ones left to plan for.
V2.TP_L = ['No answer', 'Shaky', 'Handles it', 'Beats it'];
V2.tpThreat = (n, lv) => { const E = V2.esc, d = V2.disp(n);
  return `<button type="button" class="tp-th${lv == null ? '' : ' l' + lv}" data-v2mon="${E(n)}" aria-label="${E(d)}${lv == null ? '' : ': ' + V2.TP_L[lv]}" title="${E(d)}${lv == null ? '' : ' · ' + V2.TP_L[lv]}">${V2.mon(n, {bare: true})}</button>`; };
V2.tpField = M => { const E = V2.esc, rows = M ? M.rows.map((r, i) => ({n: r.t.p.n, lv: r.level, i})).sort((a, b) => a.lv - b.lv || a.i - b.i) : THR.threatList().map(x => ({n: x.n, lv: null}));
  const c = [0, 0, 0, 0]; if (M) M.rows.forEach(r => c[r.level]++);
  return `<div class="tp-field"><p class="tp-sh u">The field <small>top ${rows.length} threats</small></p>${M ? `<p class="tp-leg">${[3, 2, 1, 0].map(l => `<span class="l${l}"><i aria-hidden="true"></i><b>${c[l]}</b> ${V2.TP_L[l]}</span>`).join('')}</p>` : '<p class="tp-leg tp-leg0">Who your six has to get past. Build one to see who it beats.</p>'}
    <div class="tp-ths">${rows.map(r => V2.tpThreat(r.n, r.lv)).join('')}</div></div>`; };
V2.tpFig = m => { const E = V2.esc, p = byName.get(m.n), R = monRating(p), f = V2.qFigName(m.n);
  return `<button type="button" class="tp-fig" data-v2mon="${E(m.n)}" aria-label="${E(V2.disp(m.n))}${m.it ? ', ' + E(m.it) : ''}${R ? `, ${E(R.tier)} tier ${R.n}` : ''}${!m.box ? ', to catch' : ''}: open its info">
    <span class="tp-art" aria-hidden="true">${V2.mon(m.n, {bare: true})}</span>${f.mega ? '<span class="tp-mg u">Mega</span>' : ''}<b class="u">${E(f.name)}</b><small>${E(m.it || '')}</small><small class="r">${R ? `${E(R.tier)} tier ${R.n}` : ''}${!m.box ? ' <span class="tp-catch">To catch</span>' : ''}</small></button>`; };
V2.tpPage = M => { const E = V2.esc, t = M.t, chips = t.gp || [], pct = M.G && CH.rkOf(M.G) != null ? CH.pctTxt(M.G) : '';
  const res = `<section class="q-tp" style="--band:var(--band-${M.band})">
    <div class="tp-hero"><div><p class="tp-k"><span class="tp-plate u">Preview ${M.k + 1} of ${M.n}</span><span>${E(M.kind)}${t.megas > 1 ? ` · ${t.megas} Mega options` : ''}</span></p>
      <h2 class="u">${E(t.label).replace(/ · /g, ' · ')}</h2>${chips.length ? `<div class="tp-chips">${chips.map(c => `<span class="np-chip">${E(c)}</span>`).join('')}</div>` : ''}</div>
      <div class="tp-sc"><p><b>Strength Score</b>${pct ? ` · ${E(pct)}` : ''}</p>${M.G ? V2.buildBrk(M.G) : ''}</div></div>
    <div class="tp-stage"><div class="tp-you"><p class="tp-sh u">Your six</p><div class="tp-six">${t.mons.map(V2.tpFig).join('')}</div></div>
      <div class="tp-vs"><span class="tp-vsw u" aria-hidden="true">VS</span><b class="u">${M.s}</b><span class="tp-w u">${E(M.word)}</span></div>${V2.tpField(M)}</div>
    ${V2.qActs(M)}
    <div class="tp-low"><div class="tp-col"><div class="tp-plate2"><p class="tp-h u">Change the build</p>${V2.bpSpec()}${V2.qGo()}</div>
        ${M.n > 1 ? `<div class="tp-plate2"><p class="tp-h u">Other teams <small>tap one to preview it</small></p>${V2.qRevs(M, 'tp-revs')}</div>` : ''}</div>
      <div class="tp-col"><div class="tp-plate2"><p class="tp-h u">Scouting report</p>${V2.qNotes(M, 'tp-notes')}${t.proven && !t.proven.swapped && t.proven.wr >= .55 ? '<p class="bd-catch">This exact team has won at real events. Treat these as optional tweaks, not problems.</p>' : ''}</div></div></div></section>`;
  return `<div class="bd2 q-d">${V2.qHead()}<div class="bd-result" aria-live="polite">${res}</div>${V2.qLower()}</div>`; };
V2.tpBefore = () => `<div class="bd2 q-d q-d0">${V2.qHead()}<div class="tp-stage tp-empty"><div class="tp-you"><p class="tp-sh u">Your six</p><div class="tp-opts">${V2.qOpts()}</div></div>
  <div class="tp-vs"><span class="tp-vsw u">VS</span></div>${V2.tpField(null)}</div><div class="bd-result" aria-live="polite">${V2.buildAnswer()}</div>${V2.qLower()}</div>`;
(() => { const before = V2.pages.build.draw0 || V2.pages.build.draw; V2.pages.build.draw0 = before;
  V2.pages.build.draw = () => { const M = V2.bpModel(); if (M) return V2.tpPage(M); if (!ui.ab) return V2.tpBefore(); return before(); }; })();
V2.redraw();
```

### d-preview.css
```css
/* Q81 D, Team Preview (prototype; tokens only) */
.q-d .bd-result{margin-top:var(--s6)}
.q-tp{background:var(--sd-tools-bg);box-shadow:0 0 0 100vmax var(--sd-tools-bg);clip-path:inset(0 -100vmax);padding:var(--s8) 0 var(--s10)}
.tp-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,420px);gap:var(--s4) var(--s8);align-items:end;margin-bottom:var(--s6)}
.tp-k{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s2) var(--s3);margin:0;font:600 var(--t13)/1.4 var(--b);color:var(--ink-2)}
.tp-plate{display:inline-block;padding:var(--s1) var(--s4);background:var(--sd-hero);color:var(--sd-on-band);font-size:var(--t15);clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.tp-hero h2{font-size:clamp(34px,4.6vw,64px);line-height:1.05;margin:var(--s3) 0 0}
.tp-chips{display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s3)}.tp-chips .np-chip{border:0;background:var(--sd-card);color:var(--sd-card-ink)}
.tp-sc p{margin:0;font:var(--t15)/1.5 var(--b);color:var(--ink-2)}.tp-sc p b{color:var(--ink)}.tp-sc .bd-brk{margin-top:var(--s1);font-size:var(--t13)}
/* the stage: Home's blue hero field and black feature plate meeting on a slant, the VS plate on the seam */
.tp-stage{position:relative;display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)}
.tp-you{background:var(--sd-hero);color:var(--sd-on-band);padding:var(--s6) 152px var(--s6) var(--s6);clip-path:polygon(0 var(--s6),100% 0,calc(100% - 56px) 100%,0 100%)}
.tp-field{background:var(--sd-feat);color:var(--sd-on-feat);box-shadow:inset 0 0 0 1px var(--sd-feat-rim);margin-left:-56px;padding:var(--s8) var(--s6) var(--s6) calc(56px + 120px);clip-path:polygon(56px 0,100% 0,100% 100%,0 100%)}
.tp-sh{margin:var(--s2) 0 var(--s3);font-size:var(--t20)}.tp-sh small{font:600 var(--t13)/1 var(--b);font-style:normal;margin-left:var(--s2);opacity:.85}
.tp-six{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s4) var(--s4)}
.tp-fig{all:unset;cursor:pointer;display:grid;justify-items:center;text-align:center;min-width:0}
.tp-fig:focus-visible,.tp-th:focus-visible{outline:3px solid var(--sd-ring);outline-offset:2px}
.tp-art{display:block;width:100%;height:120px}.tp-art .np-mon,.tp-art .st{width:100%;height:100%}
.tp-art img{width:100%;height:100%;object-fit:contain;object-position:50% 100%;transition:transform .2s}.tp-fig:hover .tp-art img{transform:translateY(-6px) scale(1.04)}
.tp-mg{margin-top:var(--s2);font-size:var(--t13);color:var(--sd-tag-num);line-height:1.2}
.tp-fig b{font-size:var(--t17);line-height:1.25;margin-top:var(--s1)}.tp-mg + b{margin-top:0}
.tp-fig small{font:500 var(--t13)/1.4 var(--b)}.tp-fig small.r{font-weight:600}
.tp-catch{display:inline-block;padding:0 var(--s1);background:var(--logo-ink);color:var(--logo-white);font-weight:700}
.tp-vs{position:absolute;left:58.33%;top:50%;transform:translate(-50%,-50%);z-index:2;display:grid;justify-items:center;padding:var(--s3) var(--s6) var(--s4);background:var(--sd-plate);color:var(--sd-plate-ink);box-shadow:8px 8px 0 var(--sd-shade);clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%)}
.tp-vs b{font-size:var(--d96);line-height:.9;color:var(--sd-plate-num);letter-spacing:-.02em}
.tp-vsw{font-size:var(--t17);line-height:1;color:var(--logo-pink)}
.tp-w{margin-top:var(--s2);padding:var(--s1) var(--s3);background:var(--band);color:var(--on-mark);font-size:var(--t15);clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)}
.tp-leg{display:flex;flex-wrap:wrap;gap:var(--s1) var(--s4);margin:0 0 var(--s4);font:500 var(--t13)/1.5 var(--b);color:var(--sd-feat-ink2)}
.tp-leg b{color:var(--sd-on-feat);font-weight:700}
.tp-leg i{display:inline-block;width:12px;height:4px;margin-right:var(--s1);vertical-align:middle;background:currentColor}
.tp-leg .l3 i{background:var(--sd-you)}.tp-leg .l2 i{background:var(--sd-feat-ink2)}.tp-leg .l1 i{background:var(--mid)}.tp-leg .l0 i{background:var(--sd-hp-roll)}
.tp-ths{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--s2) var(--s1)}
.tp-th{all:unset;cursor:pointer;display:block;position:relative;aspect-ratio:1;padding-bottom:var(--s2)}
.tp-th .np-mon,.tp-th .st{width:100%;height:100%}.tp-th img{width:100%;height:100%;object-fit:contain}
.tp-th::after{content:"";position:absolute;left:15%;right:15%;bottom:0;height:4px}
.tp-th.l3 img{filter:grayscale(1);opacity:.32}.tp-th.l2 img{filter:grayscale(1);opacity:.6}
.tp-th.l3::after{background:var(--sd-you)}.tp-th.l2::after{background:var(--sd-feat-ink2)}.tp-th.l1::after{background:var(--mid)}.tp-th.l0::after{background:var(--sd-hp-roll)}
.tp-th .pool{display:none}
.q-tp .q-acts{margin-top:var(--s5)}.q-tip{margin:var(--s2) 0 0}
.tp-low{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:var(--s6);margin-top:var(--s8);align-items:start}
.tp-col{display:grid;gap:var(--s6)}
.tp-plate2{background:var(--sd-card);color:var(--sd-card-ink);box-shadow:8px 8px 0 var(--sd-card-shade);padding:var(--s5) var(--s6) var(--s6)}
.tp-h{margin:0 0 var(--s4);font-size:var(--t20)}.tp-h small{font:500 var(--t13)/1 var(--b);font-style:normal;color:var(--sd-card-ink2);margin-left:var(--s2)}
.tp-plate2 .bd-opts{margin:0;padding:0;border:0;grid-template-columns:auto auto;justify-content:start}.tp-plate2 .bd-around{grid-column:1/-1}
.tp-plate2 .bd-go{margin-top:var(--s5)}.tp-plate2 .bd-mtip{margin:var(--s3) 0 0}.tp-plate2 .bd-catch{margin:var(--s4) 0 0}
.tp-revs{display:grid;gap:var(--s2)}
.q-rev{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:var(--s4);padding:var(--s2) var(--s3);border-left:6px solid transparent}
.q-rev:hover{background:var(--wash)}.q-rev:focus-visible{outline:3px solid var(--plot);outline-offset:2px}
.q-rev.on{background:var(--sd-hero);color:var(--sd-on-band);border-left-color:var(--sd-feat)}
.q-rl{display:grid;place-items:center;width:36px;height:36px;background:var(--sd-feat);color:var(--sd-on-feat);font-size:var(--t17);clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)}
.q-rn{display:grid;min-width:0}.q-rn b{font:700 var(--t16)/1.3 var(--b)}.q-rn small{font:var(--t13)/1.4 var(--b);opacity:.85}
.q-rs{font-size:var(--t28);color:var(--band)}.q-rev.on .q-rs{color:var(--sd-on-band)}
.tp-notes{list-style:none;margin:0;padding:0;display:grid;gap:var(--s4)}
.tp-notes li{display:grid;grid-template-columns:minmax(128px,max-content) minmax(0,1fr);gap:var(--s4);align-items:baseline;padding-top:var(--s3);border-top:1px solid var(--rule)}
.tp-notes li:first-child{border-top:0;padding-top:0}
.q-n{font-size:var(--t34);line-height:1;white-space:nowrap}.q-n .unit{font-size:var(--unit);opacity:.75}
.q-nt{display:grid}.q-nt b{font:700 var(--t16)/1.3 var(--b)}.q-nt small{font:var(--t13)/1.5 var(--b);color:var(--sd-card-ink2)}
/* before a build: the options stand on the blue side, the real field waits on the black side */
.q-d0 .tp-empty{margin-top:var(--s6)}
.tp-opts{background:var(--sd-plate);color:var(--sd-plate-ink);padding:var(--s5);box-shadow:8px 8px 0 var(--sd-shade)}
.tp-opts .bd-opts{margin:0;padding:0;border:0;grid-template-columns:auto minmax(0,1fr)}.tp-opts .bd-around,.tp-opts .bd-go{grid-column:1/-1}
.q-d0 .tp-vs{padding:var(--s4) var(--s5)}.q-d0 .tp-vsw{font-size:var(--t34)}
.tp-leg0{font-size:var(--t15)}
@media (max-width:1099.98px){.tp-hero,.tp-low{grid-template-columns:minmax(0,1fr)}
  .tp-stage{grid-template-columns:minmax(0,1fr)}
  .tp-you{padding:var(--s6) var(--s6) var(--s12);clip-path:polygon(0 var(--s6),100% 0,100% calc(100% - var(--s8)),0 100%)}
  .tp-field{margin:calc(-1 * var(--s8)) 0 0;padding:calc(var(--s16) + var(--s6)) var(--s6) var(--s6);clip-path:polygon(0 var(--s8),100% 0,100% 100%,0 100%)}
  .tp-vs{position:relative;left:auto;top:auto;transform:none;justify-self:center;grid-row:2;margin:calc(-1 * var(--s12)) 0 calc(-1 * var(--s12));display:flex;align-items:center;gap:var(--s3)}
  .tp-field{grid-row:3}
  .tp-vs b{font-size:var(--d64)}.tp-vs .tp-w{margin:0}
  .tp-ths{grid-template-columns:repeat(10,minmax(0,1fr))}
}
@media (max-width:699.98px){
  .q-tp{padding:var(--s6) 0 var(--s8)}
  .tp-you{padding:var(--s5) var(--s3) var(--s12)}
  .tp-six{gap:var(--s3) var(--s2)}.tp-art{height:84px}
  .tp-fig b{font-size:var(--t13)}
  .tp-field{padding:calc(var(--s16) + var(--s6)) var(--s3) var(--s4)}
  .tp-ths{gap:var(--s1) 0}
  .tp-low{margin-top:var(--s6);gap:var(--s4)}.tp-col{gap:var(--s4)}
  .tp-plate2{padding:var(--s4);box-shadow:6px 6px 0 var(--sd-card-shade)}
  .tp-notes li{grid-template-columns:minmax(0,1fr);gap:var(--s1)}.q-n{font-size:var(--t26)}
  .tp-opts{padding:var(--s4)}
}
.tp-fig b{max-width:100%}.tp-w{white-space:nowrap}
@media (max-width:379.98px){.tp-fig b{overflow-wrap:anywhere;letter-spacing:-.03em}}
```
