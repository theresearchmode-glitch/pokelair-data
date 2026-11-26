// ---------- How We Calculate (Sim approved the draft's look, Nov 15, Q12 "recommended") ----------
// The ten parts as numbered tiles in four groups; a tile opens its working underneath. The working is today's, unchanged:
// NP_SECTIONS in src/app/63-method-data.js (shared with today's page), in the same order as the tiles. Tile names follow the
// word list (Matchups, Team Checks...). '#method=<key>' opens the page with that part unfolded (the "How Ratings Work" links).
// today's helper draws a coloured letter; the new site writes tier letters as words ("S tier"), so here it is the letter alone
// npLegend (shared) colours the Strength Score bands with CH.gcol, which only today's site has; here the bands use the new site's tokens (day + night)
if (typeof CH === 'object' && !CH.gcol) CH.gcol = L => `var(--band-${({A: 'top', B: 'ready', C: 'solid', D: 'work-text', F: 'miss'})[String(L || '')[0]] || 'solid'})`; /* D as text: the readable amber (a11y, Nov 16) */
const tierChip = T => `<b class="u">${T.k}</b>`;
V2.MTH = [['Your team', [['grade', 'Strength Score', 'How strong the team is altogether, out of 100'], ['ready', 'Matchups', 'Real damage calcs against the 30 Pokémon that make top cut most'], ['checks', 'Team Checks', 'What most winning tournament teams have: 4 basics and 3 notes']]],
  ['Pokémon', [['rating', 'Pokémon Ratings (0–100)', 'Proven results: top cuts, strong players, wins'], ['data', 'Usage, Sets and Sources', 'Where every number comes from']]],
  ['Tools', [['calc', 'Damage Calculator', "Level 50 doubles, the game's own rounding"], ['speed', 'Speed Tiers', 'Who moves first, with real spreads'], ['build', 'Build Me a Team and Suggestions', 'Ranked by the same Strength Score as My Team']]],
  ['The data', [['filter', 'What Gets Left Out', 'Themed cups, odd events and thin data'], ['fresh', 'Updates and Cross-checks', 'Every morning, each number with its date']]]];
/* word list (Nov 16 stress test): the team's number is the Strength Score, never 'the grade'; Matchups is about answers, not 'readiness'.
   The shared text (63-method-data.js, also today's live site) is left as it is; the new site swaps the exact phrases */
V2.MTH_WORDS = [["games the grade hadn't seen", "games the score hadn't seen"], ['is graded on its Pokémon', 'is scored on its Pokémon'], ['Ranked by the grade,', 'Ranked by the Strength Score,'],
  ['Ranked by the same grade as My Team', 'Ranked by the same Strength Score as My Team'], ['Picked by the grade:', 'Picked by the Strength Score:'], ['If that costs grade,', 'If that lowers the Strength Score,'],
  ["not from the grade: in our tests the grade couldn't", "not from the Strength Score: in our tests it couldn't"], ['No grade can pass', 'No score can pass'],
  ['How ready the six is for the top 30 threats', 'How well the six answers the top 30 threats'], ["can't leave you much less ready for the top threats", "can't leave you with many fewer answers to the top threats"]];
V2.mthWords = h => V2.MTH_WORDS.reduce((t, [a, b]) => t.split(a).join(b), String(h));
V2.mthBody = k => { try { const s = (typeof NP_SECTIONS === 'object' ? NP_SECTIONS : []).find(x => x[0] === k); return s ? V2.mthSprites(V2.mthWords(V2.wl(s[3]()))).replace(/<span aria-hidden="true">→<\/span>/g, '<span aria-hidden="true">›</span>') /* link rows end in › (design-system.md); today's shared text keeps → */.replace(/<button type="button" class="nplink" data-view="method" data-msec="(\w+)">([\s\S]*?)<\/button>/g, '<a class="np-link" href="#method=$1">$2</a>').replace(/<button type="button" class="([^"]*)" data-view="track">([\s\S]*?)<\/button>/g, '<a class="np-link" href="#track">$2</a>') : ''; } catch (e) { return ''; } }; /* today's page-switch buttons become links here */
/* audit Nov 16: the shared "Top 10 right now" row draws today's sprites (sp/<id>.webp), which the new site doesn't ship (10 broken images);
   here each one is the new site's own sprite, by the Pokémon's name (its title), falling back to the picture id */
V2.mthSprites = h => String(h).replace(/<div class="npspr">([\s\S]*?)<\/div><\/div>/, (all, inner) => {
  const byDisp = new Map(); try { for (const k of byName.keys()) byDisp.set(V2.disp(k), k); } catch (e) {}
  const cells = [...inner.matchAll(/<span title="([^"]*)">([\s\S]*?)<\/span>/g)].map(([, t, img]) => { const nm = byDisp.get(t.replace(/&amp;/g, '&')), id = (img.match(/sp\/(\d+)\.webp/) || [])[1];
    return `<span class="mth-spr" title="${t}">${nm ? V2.mon(nm, {iw: 48, bare: true}) : id ? `<img src="${V2.art(id)}" alt="" width="48" height="48" loading="lazy" decoding="async">` : t}<small>${t}</small></span>`; });
  return `<div class="npspr">${cells.join('')}</div></div>`; });
V2.pages.method = {place: 'meta', draw() { const E = V2.esc, want = ((location.hash || '').split('=')[1] || ''), teams = typeof RES !== 'undefined' && RES && RES.teams, g = META.model && META.model.games;
  let n = 0; if (want && V2._mthAt !== V2.drawN) V2._mthAt = V2.drawN, setTimeout(() => { const d = document.querySelector(`.inf-tile[data-mth="${CSS.escape(want)}"]`); if (d) d.scrollIntoView({block: 'start'}); }, 60); /* a part opened from a link scrolls into view, once per arrival (code review A1-I4) */
  const fr = typeof npFresh === 'function' ? npFresh() : '', T = META.track, trk = T && T.ev ? `Tracking since ${npDay(T.since)} · ${T.ev.length} event${T.ev.length === 1 ? '' : 's'} checked` : 'Every rating is saved daily and checked against later events';
  /* reskin (Nov 22, Sim approved direction B "one grid", 12:34 PM; mock docs/rebuild/mocks/reskin-nov22/method-mock.inject.js): the kit head; beside it
     ONE drawn key, the 0-100 rating scale as a slanted plot bar in the tier colours (decoration, aria-hidden: the words stay in the legend under it),
     the counts and freshness on top of it; the ten parts as today (their folds, data-mth, #method=<key> and the cc2.chf.np_<key> memory unchanged);
     the Track Record as the page's one pink move */
  const facts = `<ul class="k-facts mth-facts">${teams ? `<li><b class="u k-key">${homeNum(teams)}</b><span>tournament teams</span></li>` : ''}${g ? `<li><b class="u">${homeNum(g)}</b><span>games in the team model</span></li>` : ''}${fr ? `<li class="mth-upd"><span>${E(fr[0].toUpperCase() + fr.slice(1).replace(/ .*/, ''))}</span> <b class="u">${E(fr.replace(/^updated /i, ''))}</b></li>` : ''}</ul>`;
  const scale = `<div class="mth-scale" aria-hidden="true"><p class="mth-bar">${[['f', 50, 'F'], ['d', 10, 'D'], ['c', 10, 'C'], ['b', 10, 'B'], ['a', 10, 'A'], ['s', 10, 'S']].map(([k, w, L]) => `<i style="--c:var(--tier-${k});--w:${w}"><b class="u">${L}</b></i>`).join('')}</p><p class="mth-ax">${[0, 50, 60, 70, 80, 90, 100].map(v => `<span style="--x:${v}">${v}</span>`).join('')}</p></div>`;
  const legend = (() => { try { return typeof npLegend === 'function' ? `<div class="inf-legend mth-legend">${V2.wl(npLegend()).replace(/(<div class="chk">[\s\S]*?<\/div>)/, '$1' + scale)}</div>` : scale; } catch (e) { return ''; } })(); /* a failure here never takes the page down */
  const tiles = V2.MTH.map(([grp, L]) => L.map(([k, t, s]) => { n++; return `<details class="inf-tile" data-mth="${k}"${want === k || (!want && V2.LS.get('cc2.chf.np_' + k) === '1') ? ' open' : ''}><summary><i class="inf-no u" aria-hidden="true">${String(n).padStart(2, '0')}</i><small class="inf-gk">${grp}</small><b class="u">${E(t).replace(/\((\d+)–(\d+)\)/g, '<span class="nw">($1–$2)</span>')}</b><span>${E(V2.mthWords(s))}</span></summary><div class="inf-work">${V2.mthBody(k)}</div></details>`; }).join('')).join('');
  const go = `<a class="mth-go" href="#track"><span class="k-go u" aria-hidden="true">CHECK THE RECEIPTS.</span><span class="mth-gt"><b>Track Record</b> How right have our ratings been? <small>${E(trk)}</small></span></a>`;
  return `<div class="ra gsp infp mth"><div class="gs-top wt-top ev-top"><section class="ra-h"><p class="k-kicker np-eyebrow">META · SHOW OUR WORK</p><h1 class="k-h1 u">Every number, <em>and where it comes from.</em></h1><p class="k-lead ra-lede">How NastyPlot works out each score, rating and calc, in plain words.</p>${facts}</section>
    <div class="ra-spotw"><aside class="mth-key" aria-label="How to read our numbers">${legend}</aside></div></div>
    ${V2.kPlan(V2.kStep(1, 'Ten parts.', 'tap one for the working', `<div class="inf-tiles">${tiles}</div>`) + V2.kStep(2, 'Check the receipts.', 'every rating, checked later', go))}</div>`; }};
// Nov 15 (today's page remembers which parts are open: CH.fold, keys cc2.chf.np_<key>): the same memory, the same keys, so both sites agree
document.addEventListener('toggle', e => { const d = e.target; if (d && d.matches && d.matches('.inf-tile[data-mth]')) V2.LS.set('cc2.chf.np_' + d.dataset.mth, d.open ? '1' : '0'); }, true);
