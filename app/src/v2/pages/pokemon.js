/* word list (Nov 16 stress test): 'conversion' is not a player word; the shared label reads 'Converts to top cut' */
V2.bars = p => lairBars(p).map(([l, ...r]) => [l === 'Converts to top cut' ? 'Top cut beyond its use' : l, ...r]);
// ---------- The Pokémon page, "The file on <name>." (reskin onto the shared kit; Sim approved HH's mock-up Nov 21, 2:55 PM:
// docs/rebuild/mocks/pokemon-file/index.html, brief docs/rebuild/reskin/27-pokemon.md "UPDATE Nov 21") ----------
// One page per Pokémon at #pokemon=<name> (Sim, Nov 15). Order (Sim): the header (CASE FILE #<dex> · POKÉMON, "The file on <name>."),
// the hero (the kit card whose backdrop is its own top-cut share per week; trend line; Champions basics) beside the verdict line, four
// facts and How to build it; then 1 The rap sheet. 2 Known associates. 3 Hit list. And who's hunting it. No folds (Sim, Nov 20).
// Every number comes from the same shared helpers as before (rating, lairHead, rankTxt, SHT.*, lairBars, lairEvidence, bringLead,
// pilotFor, defSet, bestHitOn, metaThreats, META.events); nothing is written per Pokémon by hand.
V2.monSlug = n => encodeURIComponent(String(n).toLowerCase());
V2.monFromHash = () => { let k = ''; try { k = decodeURIComponent((location.hash.split('=')[1] || '')).toLowerCase(); } catch (e) {} return k && typeof ROSTER === 'object' ? ROSTER.find(q => q.n.toLowerCase() === k) || null : null; };
V2.STATS = [['HP', 'hp'], ['Attack', 'atk'], ['Defense', 'def'], ['Sp. Atk', 'spa'], ['Sp. Def', 'spd'], ['Speed', 'spe']];
V2.pkTry = (f, d) => { try { const v = f(); return v == null ? d : v; } catch (e) { return d; } };
V2.pkPct = v => { const x = +v; return !isFinite(x) ? '' : (x >= 10 || x === 0 ? Math.round(x) : Math.round(x * 10) / 10) + '%'; };
// the real National Pokédex number (4 digits): the base form's art id (forms and Megas use 10000+ ids for their own art)
V2.pkDex = p => { const S = typeof SPRITE_ID === 'object' ? SPRITE_ID : {}, id = [p.b, p.n].map(n => +S[n]).find(x => x > 0 && x < 10000); return id ? String(id).padStart(4, '0') : ''; };
// the card's backdrop (brief, checked Nov 21): its share of top-cut teams per week. Every event's top teams (META.events, cleanEvents),
// grouped by the Monday of the event's date; share = top teams with it / top teams that week; only weeks with 100+ top teams (fewer
// are too few to trust); the last 5 such weeks. A Mega counts when its base form holds its Mega Stone on the sheet. No data: [].
V2.pkWeeks = p => { const E = typeof META === 'object' && META.events && META.events.events; if (!Array.isArray(E) || !E.length) return [];
  const stone = p.m ? V2.pkTry(() => stoneFor(p), '') : '', base = p.m ? V2.pkTry(() => byName.get(p.b) && byName.get(p.b).n, '') : '';
  const has = t => t.mons.some(x => x.n === p.n || (stone && x.n === base && x.i === stone)), wk = new Map();
  for (const ev of E) { const d = new Date(String(ev.date) + 'T12:00:00Z'); if (isNaN(d)) continue; const mon = new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 864e5).toISOString().slice(0, 10);
    const w = wk.get(mon) || {n: 0, h: 0}; for (const t of ev.top || []) { w.n++; if (has(t)) w.h++; } wk.set(mon, w); }
  return [...wk].filter(([, w]) => w.n >= 100).sort((a, b) => a[0] < b[0] ? -1 : 1).slice(-5).map(([m, w]) => ({m, v: 100 * w.h / w.n, n: w.n})); };
// the verdict line, from data only: how common it is (its share of tournament teams), then its usual tools (top move, its Ability, the next two moves)
V2.pkVerdict = p => { const E = V2.esc, H = lairHead(p), u = H.hU, st = V2.pkTry(() => defSet(p), {}) || {}, mv = (st.mv || []).slice(0, 3).map(x => x[0]), ab = metaAbility(p) || bestAbility(p);
  const one = u == null ? null : u >= 45 ? 'On about every other tournament team.' : u >= 9 ? `On about one tournament team in ${Math.round(100 / u)}.` : u >= 1 ? `On ${V2.pkPct(u)} of tournament teams.` : 'A rare pick at tournaments.';
  const tools = [mv[0], ab, ...mv.slice(1)].filter(Boolean);
  return `<p class="pk-verdict u">${E(one || 'Not on tournament teams yet.')}${tools.length ? ` <em>${E(tools.join(', '))}.</em>` : ''}</p>`; };

// the hero: the kit card (score + tier in its name row, the rank line above the name, its types), its weekly bars behind the art, the
// trend under it and the Champions basics; beside it the verdict line, four facts and How to build it
V2.pkTop = p => { const E = V2.esc, n = p.n, r = rating(p), rs = RS(r.total), T = lTier(r.total), H = lairHead(p), k = V2.kName(n), t1 = p.t[0], t2 = p.t[1];
  const rk = rankTxt(p, 'cap') || '', /* Sim, Nov 19 (Q15 A): the rank says '#N of M with results' (the card's shorter 'rated' put back to the approved wording, Nov 21) */ W = V2.pkWeeks(p), ok = W.length >= 2;
  const top = ok ? Math.max(10, ...W.map(w => w.v)) * 1.08 : 0;
  const plot = ok ? `<span class="pk-plot" aria-hidden="true">${W.map(w => `<i style="--h:${(100 * w.v / top).toFixed(1)}"></i>`).join('')}</span>` : '';
  const card = V2.kCard(n, {size: 'hero', score: rs, tier: T.k + ' tier', form: [k.form, rk || 'No results yet'].filter(Boolean).join(' · ')})
    .replace('<span class="k-plate">', `<span class="k-plate">${plot}`).replace('<span class="k-sc">', '<span class="k-sc pk-rate">')
    .replace(/<small class="k-tier">([^<]*)<\/small>/, '<small class="k-tier"><span class="tier-tag">$1</span></small>')
    .replace(/(<b class="k-name u"[^>]*>[^<]*<\/b>)/, `$1<span class="pk-types">${(p.t || []).map(V2.typeChip).join('')}</span>`);
  const f = x => V2.pkPct(x), a = W[0], b = W[W.length - 1];
  const trend = ok ? (() => { const d = b.v - a.v, rel = a.v ? Math.abs(d) / a.v : 1, kind = Math.abs(d) >= 1 && rel >= .15 ? (d < 0 ? 'fall' : 'rise') : 'flat';
    return `<p class="pk-trend">${kind === 'fall' ? V2.kTag('bad', '▼ Falling') : kind === 'rise' ? V2.kTag('good', '▲ Rising') : V2.kTag('neutral', 'Steady')}<span>Top-cut teams ${f(a.v)} → ${f(b.v)} in ${W.length} weeks: the bars behind it.</span></p>`; })() : '';
  const megaF = ROSTER.some(q => q.b === p.b && q.m && q.n !== p.n);
  const basics = `<p class="pk-basics"><span>Legal in ${E(typeof REG_NAME === 'string' ? REG_NAME : 'Reg M-C')}</span><span>Level 50</span><span>Points 0–32</span><span>${p.m ? E('Holds ' + (V2.pkTry(() => stoneFor(p), '') || 'its Mega Stone')) : megaF ? 'Has a Mega' : 'No Mega'}</span></p>`;
  // four facts: share of tournament teams, win rate with games, brought from preview, leads the game (Showdown replays); without
  // replay numbers, its Speed as players run it and its base stat total
  const bl = V2.pkTry(() => bringLead(p), null), sp = V2.pkTry(() => SHT.speeds(p), []), run = sp.find(x => x.main) || sp.find(x => x.k === 'max');
  const facts = [H.hU != null ? [V2.shareTxt(H), 'of tournament teams', 1] : ['None yet', 'of tournament teams'],
    H.hW != null && H.hG >= 30 ? [pctFmt(H.hW), `win rate · ${Math.round(H.hG).toLocaleString('en-US')} games`] : ['Too few', H.hG ? `win rate · ${Math.round(H.hG)} games` : 'win rate · no games yet'],
    ...(bl ? [[pctFmt(bl.b), 'brought from preview'], [pctFmt(bl.l), 'leads the game']]
      : [run ? [String(run.v), `Speed at level 50${/Choice Scarf/.test(run.note || '') ? ', with Choice Scarf' : ''}`] : null, [String(p.st.reduce((x, y) => x + y, 0)), 'base stat total']].filter(Boolean))];
  return `<section class="pk-top" style="--pk-t1:var(--ty-${E(t1)})" aria-label="${E(V2.disp(n))} at a glance">${V2.kHero(`<div class="pk-card" style="--k1:var(--tyn-${E(t1)});--k2:var(--tyn-${E(t2 || t1)})${t2 ? '' : ';--k2mix:45%'}">${card}</div>${trend}${basics}`,
    `<div class="pk-is">${V2.pkVerdict(p)}${V2.kFacts(facts)}${V2.pkBuild(p)}</div>`)}</section>`; };

// How to build it (today's Usually, Typical set, Moves, Items; the same helpers and words as the sheet): the typical set, the four
// usual moves as kit move tickets with their share, the page's one pink move (USE THIS SET. adds it to My Team; a new slot takes the
// most common complete set), Build Around It, Copy for Showdown, Popular Sets, and every move and item (shown on desktop, one tap on phones)
V2.pkBuild = p => { const E = V2.esc, n = p.n, st = V2.pkTry(() => defSet(p), {}) || {}; /* option A (audit #1): the lists use the Typical set's source (tournament sets, Nov 8) */
  const ti = V2.pkTry(() => topItems(p), null), SB = lairSetBits(p), pm = V2.pkTry(() => (popularMoves(p) || []).slice(0, 4).map(m => m.name), []);
  const mvShare = new Map((st.mv || []).map(([nm, v]) => [nm, v]));
  const two = arr => arr && arr.length ? `<b>${E(arr[0])}</b>${arr.length > 1 ? `<small>or ${arr.slice(1).map(E).join(' or ')}</small>` : ''}` : '';
  const ab = metaAbility(p) || bestAbility(p), abv = V2.pkTry(() => ab && abilityPct(p, ab), null);
  const itPct = ti && ti.it && ti.it[0] && ti.it[0][1] != null ? pctFmt(+ti.it[0][1]) : '';
  const kv = `<dl class="pk-kv">${ti && ti.it && ti.it.length ? `<div><dt>Item</dt><dd><b>${E(ti.it[0][0])}</b>${itPct || ti.it.length > 1 ? `<small>${[itPct, ti.it.length > 1 ? 'or ' + ti.it.slice(1).map(x => E(x[0])).join(' or ') : ''].filter(Boolean).join(' · ')}</small>` : ''}</dd></div>` : p.m ? `<div><dt>Item</dt><dd><b>${E(V2.pkTry(() => stoneFor(p), '') || 'Its Mega Stone')}</b></dd></div>` : ''}
    <div><dt>Ability</dt><dd><b>${E(ab || '–')}</b>${abv != null ? `<small>${E(pctFmt(+abv))}</small>` : ''}</dd></div>${SB.na ? `<div><dt>Nature</dt><dd>${two(SB.na)}</dd></div>` : ''}${SB.w ? `<div><dt>Stat points</dt><dd><b>${E(SB.w)}</b></dd></div>` : ''}</dl>`;
  const slots = pm.length ? `<div class="pk-usual"><h3 class="vh">Usually</h3>${V2.kMoves(pm.map(m => { const v = mvShare.get(m); return [m, v != null ? pctFmt(+v) : null]; }))}</div>` : '';
  const bars = (arr, k) => (arr || []).slice(0, k).map(([nm, v]) => `<div class="ms-br"><span>${E(nm)}</span><i style="--v:${Math.max(2, Math.min(100, +v || 0))}" aria-hidden="true"></i><b>${v == null ? '' : E(pctFmt(+v))}</b></div>`).join('');
  const sbM = V2.pkTry(() => setBasis(p, st, 'mv'), null), stn = lairStones(p, st);
  /* player review 1d (Nov 17): the top 5 left out a move 'Usually' names (Volcarona's Overheat, 38%); the list keeps every Usually move */
  const mvList = (st.mv || []).filter((x, i) => i < 5 || pm.includes(x[0]));
  const mvs = st.mv && st.mv.length ? `<div class="pk-list"><h3 class="pk-k u">Moves</h3>${bars(mvList, mvList.length)}${sbM ? `<p class="fine">${E(V2.txt(sbM.html))}</p>` : ''}</div>` : '';
  const sbI = V2.pkTry(() => setBasis(p, st, 'it'), null); /* Nov 18 (audit #1): every share names its base, Items too */
  const items = stn.mg && stn.stn >= 50 ? `<div class="pk-list"><h3 class="pk-k u">Items</h3><p>${Math.round(stn.stn)}% hold ${stn.megas.length > 1 ? 'a Mega Stone' : E(stoneFor(stn.mg) || 'its Mega Stone')} to Mega Evolve${stn.megas.length > 1 && stn.top ? `, most often ${E(stn.top[0])}` : ''}.${stn.rest >= 5 && st.it && st.it[0] ? ' The rest mostly run ' + E(st.it[0][0]) + '.' : ''}</p>${V2.kLink('See ' + stn.mg.d, {href: '#pokemon=' + V2.monSlug(stn.mg.n)})}</div>`
    : p.m ? `<div class="pk-list"><h3 class="pk-k u">Items</h3><p>Always holds ${E(stoneFor(p) || 'its Mega Stone')}.</p></div>` : st.it && st.it.length ? `<div class="pk-list"><h3 class="pk-k u">Items</h3>${bars(st.it, 3)}${sbI ? `<p class="fine">${E(V2.txt(sbI.html))}</p>` : ''}</div>` : '';
  const noSets = !(st.mv && st.mv.length) && !(st.it && st.it.length), open = V2.pkOpen('pk-lists');
  const add = V2.addState ? V2.addState(n) : 'ok', addLine = add === 'have' ? '<p class="fine ms-add ms-on">On your team ✓</p>' : add === 'full' ? '<p class="fine ms-add">Your team is full: remove one on My Team to add it.</p>' : '';
  const acts = `<div class="pk-acts">${V2.kGo('USE THIS SET.', {'data-v2add': n, 'aria-label': `Use this set: add ${V2.disp(n)} to My Team`})}<button type="button" class="pk-ink u" data-hmaround="${E(n)}">Build Around It</button>
    <span class="pk-qlinks"><button type="button" class="k-link pk-q" data-sdcopy="core:${E(n)}" aria-label="Copy ${E(V2.disp(n))}'s set for Pokémon Showdown">Copy for Showdown</button><button type="button" class="k-link pk-q" data-mssets="${E(n)}">Popular Sets</button>${noSets ? '' : `<button type="button" class="k-link pk-q pk-lsum" data-pklists aria-expanded="${open}" aria-controls="pk-lists">${open ? 'Hide every move and item' : 'Every move and item ›'}</button>`}</span></div>${addLine}`;
  const sub = noSets ? `No tournament or ladder sets yet: nobody has brought ${E(V2.disp(n))} to the events and ladders we read.` : `Typical set: the one players run most${sbM ? ' · ' + E(V2.txt(sbM.html)) : ''}`;
  return `<div class="pk-setc"><h2 class="pk-sh u" id="pk-s0">How to build it</h2><p class="pk-sub">${sub}</p>${kv}${slots}${acts}</div>${noSets ? '' : `<div class="pk-lists${open ? ' open' : ''}" id="pk-lists">${mvs}${items}</div>`}`; }; /* the lists sit beside the set's card, under the hero card from 960 (no empty half under the card) */
V2.pkOpen = id => { try { return localStorage.getItem('np2.pkopen.' + id) === '1'; } catch (e) { return false; } };

// 1. The rap sheet: base stats (a Mega shows its change from the base form), its Abilities, how fast it is (every build's Speed and how
// much of the top 30 it outspeeds), why it rates N (the four bars, the same players test, what the data says, other tier lists)
V2.pkStats = p => { const E = V2.esc, bf = SHT.baseForm(p), tot = p.st.reduce((a, b) => a + b, 0), btot = bf ? bf.st.reduce((a, b) => a + b, 0) : 0, top = Math.max(160, ...p.st);
  const dif = (a, b) => { const d = a - b; return d ? `<em class="${d < 0 ? 'dn' : 'up'}">${d > 0 ? '+' : '−'}${Math.abs(d)}</em>` : ''; };
  const rows = V2.STATS.map(([l, k], i) => `<div class="pk-bsr" style="--c:var(--st-${k});--w:${(100 * p.st[i] / top).toFixed(2)}%"><dt>${l}</dt><dd><span class="pk-bt" aria-hidden="true"><i></i></span><b class="u">${p.st[i]}</b>${bf ? dif(p.st[i], bf.st[i]) : ''}</dd></div>`).join('');
  return `<div class="pk-stats"><h3 class="pk-lbl u" id="pk-bs">Base stats · total ${tot}${bf ? ` ${dif(tot, btot)}` : ''}</h3><dl class="pk-bs${bf ? ' pk-bsd' : ''}">${rows}</dl>${bf ? `<p class="fine">Mega Evolved stats; the small numbers are the change from ${E(bf.d)}.</p>` : ''}</div>${V2.pkAbilities(p)}`; };
V2.pkAbilities = p => { const E = V2.esc, st = V2.pkTry(() => setFor(p), {}) || {}, bf = SHT.baseForm(p);
  const abSh = new Map((st.ab || []).map(([a, v]) => [a, v])), abTop = (st.ab || [])[0], list = [...new Set(p.a)].sort((x, y) => (+(abSh.get(y) ?? -1)) - (+(abSh.get(x) ?? -1)));
  const one = a => { const v = abSh.get(a), top = abTop && abTop[0] === a && p.a.length > 1; return `<b>${E(a)}</b>${top ? ` (most used${v != null ? ', ' + E(pctFmt(+v)) : ''})` : v != null && p.a.length > 1 ? ` (${E(pctFmt(+v))})` : ''}: ${E(SHT.abDesc(a))}`; };
  const note = p.m && bf ? ` Its Mega's Ability. Before Mega Evolving, ${E(bf.d)} has ${[...new Set(bf.a)].map(E).join(' or ')}.` : p.a.length === 1 ? ' Its only Ability.' : abTop ? " Shares are of players' sets." : '';
  /* phones: the Abilities after the first keep their name and share; their text is in the full file */
  return `<p class="pk-abil" id="pk-s5">${list.map((a, i) => i ? one(a).replace(/: (.*)$/, '<span class="pk-more">: $1</span>') : one(a)).join(' ')}${note}</p>`; };
V2.pkSpeed = p => { const E = V2.esc, sp = V2.pkTry(() => SHT.speeds(p), []), run = sp.find(x => x.main) || sp.find(x => x.k === 'max');
  const os = x => x.os ? (x.tr ? `before ${x.os.pct}% of them` : x.os.pct >= 100 ? 'all of the top 30' : `${x.os.pct}% of the top 30`) : '';
  const rows = sp.filter(x => x !== run).map(x => `<li><span>${E(x.l)} <b>${x.v}</b></span><em>${E(os(x))}</em></li>`).join(''); /* each build's label says its points and nature; the fine print under the list says how they add up */
  return `<div class="pk-spd" id="pk-s4"><h3 class="pk-lbl u">Speed at Level 50</h3>${run ? `<p class="pk-run"><b class="u">${run.v}</b><span>${E(run.l.toLowerCase())}${run.os ? `, outspeeds ${run.os.pct}% of the top 30` : ''}<small>${E(run.note)}</small></span></p>` : ''}<ul class="pk-sprows">${rows}</ul>
    <p class="fine pk-more">Base Speed ${p.st[5]}; Speed points 0–32 add 1 each, a Speed nature adds 10%. "Top 30" = the 30 biggest threats at their usual Speed.</p>${V2.kLink('Speed Tiers', {href: '#speed'})}</div>`; };
V2.pkWhy = p => { const E = V2.esc, r = rating(p), rs = RS(r.total), B = V2.bars(p), of = (lairRank(p) || {of: lairRows().length}).of;
  const bars = B.map(([l, v, note]) => `<li><span>${E(l)}</span><b class="u">${v == null ? '–' : v}</b><i class="pk-wb" aria-hidden="true" style="--v:${v == null ? 0 : v}"></i><small>${v == null ? '' : `Top ${Math.max(1, 100 - v)}% of Pokémon`}${note ? (v == null ? '' : ' · ') + E(V2.txt(note)) : ''}</small></li>`).join('');
  const pt = V2.pkTry(() => pilotFor(p), null);
  const honest = pt ? `<p class="pk-honest"><b>The honest part:</b> the same ${pt.players.toLocaleString('en-US')} players won ${E(pctFmt(pt.w))} of games with it and ${E(pctFmt(pt.wo))} without. ${pt.d >= 3 ? 'A big gap: the Pokémon itself is winning games.' : pt.d >= 1 ? 'They win a little more than they usually do.' : pt.d > -1 ? 'About the same: these players win as often without it.' : 'These players do better without it.'}</p>` : '';
  const ev = V2.pkTry(() => lairEvidence(p), []), slips = ev.length ? `<ul class="pk-slips">${ev.filter(e => e[0] !== 'Same players test' || !pt).map(e => `<li><span>${E(e[0])}</span><b>${E(V2.txt(e[1]))}</b><small>${E(V2.txt(e[2]))}</small></li>`).join('')}</ul>` : '<p class="fine">No tournament or ladder games yet: this rating comes from stats, typing and tools.</p>';
  const O = V2.pkTry(() => { const pf = activePerf(); return pf && pf.outside && pf.outside.lists && pf.outside.lists.length ? pf.outside : null; }, null);
  const outs = O ? `<h4 class="pk-lbl u pk-oh">Other tier lists</h4><div class="ms-out pk-out">${O.lists.map(L => { const v = O.data[L.k] && O.data[L.k][p.n]; return `<a href="${E(L.url)}" target="_blank" rel="noopener"><b>${v ? E(L.tiers[v]) : '–'}</b><span>${E(L.name)}<small>${v ? E(L.how) : 'not listed · ' + E(L.note)} · ${E(perfDateText(L.date))}</small></span></a>`; }).join('')}</div><p class="fine">Shown for comparison, not counted in the score.</p>` : '';
  return `<div class="pk-why"><h3 class="pk-lbl u" id="pk-s6">Why it rates ${rs}</h3>${B.length ? `<ul class="pk-wbars">${bars}</ul><p class="fine">Each bar ranks it against the ${of} Pokémon with tournament results: 94 means better than 94% of them.${r.band >= 10 ? ' Few games so far, so treat it as an estimate.' : ''}</p>`
    : `<p class="fine">No tournament results yet, so this is a rough placeholder from its stats, typing and tools (never above ${RS(30)}). It moves up once it shows up at events.</p>`}${honest}</div>
    <div class="pk-data pk-more" id="pk-more"><h3 class="pk-lbl u">What the data says</h3>${slips}${outs}<p class="pk-links">${V2.kLink('Track Record', {href: '#track'})}${V2.FB && V2.FB.ok ? V2.kLink('Report a Mistake', {href: '#feedback', 'data-fbmistake': 'pokemon'}) : ''}</p></div>`; }; /* Report a Mistake: the feedback note records this Pokémon */
// Forms (Sim, Nov 15: A): a strip to jump between forms, and "Forms side by side" as a table
V2.pkForms = p => { const E = V2.esc, forms = ROSTER.filter(q => q.b === p.b); if (forms.length < 2) return {strip: '', table: ''};
  const fc = forms.length <= 3 ? forms.length : forms.length % 3 === 0 ? 3 : forms.length % 2 === 0 ? 2 : 3; /* audit #18 (Nov 17): 700-1099 even tiles, full rows (4 as 2 + 2, 6 as 3 + 3) */
  const strip = `<nav class="pk-forms" style="--n:${forms.length};--fc:${fc}" aria-label="Forms of ${E(V2.disp(p.b))}">${forms.map(q => { const rq = rating(q); return `<a href="#pokemon=${V2.monSlug(q.n)}"${q.n === p.n ? ' aria-current="page"' : ''}>${V2.mon(q.n, {iw: 56, bare: true})}<span><b>${V2.nameHtml(V2.disp(q.n))}</b><small>${RS(rq.total)} · ${E(lTier(rq.total).k)} tier</small></span></a>`; }).join('')}</nav>`;
  const D = forms.map(q => { const rq = rating(q), hq = lairHead(q); return {q, rs: RS(rq.total), tk: lTier(rq.total).k, u: hq.hU, w: hq.hW, tot: q.st.reduce((a, b) => a + b, 0)}; });
  const best = vals => { const ok = vals.filter(v => v != null); if (ok.length < 2) return () => false; const mx = Math.max(...ok); return ok.filter(x => x === mx).length === 1 ? v => v === mx : () => false; }; /* marked only when one form alone is best */
  const row = (lab, f, txt) => { const vs = D.map(f), b = best(vs); return `<tr><th scope="row" class="u">${lab}</th>${D.map((d, i) => `<td${b(vs[i]) ? ' class="best"' : ''}>${txt ? txt(d, vs[i]) : vs[i] == null ? '–' : vs[i]}</td>`).join('')}</tr>`; };
  const table = `<div class="pk-fts pk-more" id="pk-s7"><h3 class="pk-lbl u">Forms side by side</h3><p class="fine">When one form is best in a row, it is marked. Mega forms need their Mega Stone held; a team runs one Mega.</p>
    <div class="pk-ftw"><table class="pk-ft"><thead><tr><td></td>${D.map(d => `<th scope="col">${V2.mon(d.q.n, {iw: 72, bare: true})}<b class="u">${V2.nameHtml(V2.disp(d.q.n))}</b></th>`).join('')}</tr></thead><tbody>
    ${row('Rating', d => +d.rs, d => `${d.rs} · ${E(d.tk)} tier`)}${row('On teams', d => d.u, (d, v) => v == null ? '–' : E(pctFmt(v)))}${row('Win rate', d => d.w, (d, v) => v == null ? '–' : E(pctFmt(v)))}
    <tr><th scope="row" class="u">Type</th>${D.map(d => `<td>${E(d.q.t.join(' / '))}</td>`).join('')}</tr><tr><th scope="row" class="u">Ability</th>${D.map(d => `<td>${[...new Set(d.q.a)].map(E).join(' or ')}</td>`).join('')}</tr>
    ${['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'].map((l, j) => row(l, d => d.q.st[j])).join('')}${row('Total', d => d.tot)}</tbody></table></div>
    <p class="fine">On teams, win rate and rating: tournament teams. Base stats: game data.</p></div>`;
  return {strip, table}; };
V2.pkStep = (n, id, title, note, body, link) => V2.kStep(n, title, note, body, link ? {link} : {}).replace('<h2 class="k-h2 u">', `<h2 class="k-h2 u" id="${id}">`);
// phones (to stay no longer than today's page): the evidence behind the rating (what the data says, other tier lists, each bar's note,
// the Speed fine print, Forms side by side) sits behind one "The full file ›" tap, as the full move and item lists do; desktop shows it all
V2.pkRap = p => { const open = V2.pkOpen('pk-more'); return V2.pkStep(1, 'pk-s1', 'The rap sheet.', `stats, speed, and why it rates ${RS(rating(p).total)}`,
  `<div class="pk-rap${open ? ' open' : ''}">${V2.pkStats(p)}${V2.pkSpeed(p)}${V2.pkWhy(p)}${V2.pkForms(p).table}<button type="button" class="k-link pk-morebtn" data-pkmore aria-expanded="${open}" aria-controls="pk-more">${open ? 'Hide the full file' : 'The full file ›'}</button></div>`, {label: 'How Ratings Work', attrs: {href: '#method=rating'}}); };

// 2. Known associates: the four partners it is brought with most (Showdown replays; kit cards, the share in the score's place) and the
// crews that won with it (META.events: first place, newest first; record, event, the six, its exact set from the open team sheet)
V2.pkWins = p => { const E = typeof META === 'object' && META.events && META.events.events; if (!Array.isArray(E)) return [];
  const stone = p.m ? V2.pkTry(() => stoneFor(p), '') : '', base = p.m ? V2.pkTry(() => byName.get(p.b) && byName.get(p.b).n, '') : '';
  const me = t => t.mons.find(x => x.n === p.n || (stone && x.n === base && x.i === stone)), out = [];
  for (const ev of E) (ev.top || []).forEach((t, k) => { const m = t.place === 1 && me(t); if (m) out.push({ev, t, m, key: ev.id + '#' + k}); });
  return out.sort((a, b) => (b.ev.date > a.ev.date) - (b.ev.date < a.ev.date) || b.ev.players - a.ev.players).slice(0, 3); };
V2.pkPartners = p => { const E = V2.esc, bw = RES && RES.tc && RES.tc.bw ? (RES.tc.bw[brKeyOf(p)] || []).filter(x => byName.get(x[0])).slice(0, 4) : [], W = V2.pkWins(p);
  if (!bw.length && !W.length) return '';
  const cards = bw.map(x => { const q = byName.get(x[0]); return `<li><a class="pk-pc" href="#pokemon=${V2.monSlug(q.n)}" aria-label="${E(V2.disp(q.n))}: brought together ${E(pctFmt(x[1]))}, ${(+x[2]).toLocaleString('en-US')} games">${V2.kCard(q.n, {size: 'small', score: pctFmt(x[1]), fact: (+x[2]).toLocaleString('en-US') + ' games'})}</a></li>`; }).join('');
  const left = bw.length ? `<div><h3 class="pk-lbl u">Brought with it most</h3><ul class="k-roster pk-fan" data-n="${bw.length}">${cards}</ul><p class="fine">% = brought together when both are on the team, from Showdown replays.</p></div>` : '';
  const win = x => { const {ev, t, m} = x, d = V2.pkTry(() => evDate(ev.date), ev.date);
    return `<li class="pk-win"><span class="pk-rec u">${E(t.record || '1st')}</span><div class="pk-wt"><h4 class="u">${E(V2.pkTry(() => V2.evTitle(ev.name), ev.name))}</h4><p class="pk-wm">1st of ${(+ev.players || 0).toLocaleString('en-US')} players · ${E(d)}</p>
      <p class="pk-wset">Its set: <b>${E([m.i, m.nt].filter(Boolean).join(' · ') || 'not published')}</b>${m.mv && m.mv.length ? ` <span>${E(m.mv.join(' · '))}</span>` : ''}</p></div>
      <span class="pk-six">${t.mons.map(q => `<span class="${q === m ? 'me' : ''}">${V2.mon(q.n, {iw: 36, bare: true})}</span>`).join('')}</span></li>`; };
  const right = W.length ? `<div><h3 class="pk-lbl u">Teams that won with it</h3><ul class="pk-wins">${W.map(win).join('')}</ul></div>` : '';
  return V2.pkStep(2, 'pk-s2', 'Known associates.', "who it's brought with, and the crews that won with it", `<div class="pk-duo${left && right ? '' : ' one'}">${left}${right}</div>`,
    W.length ? {label: 'Every winning team', attrs: {href: '#tournaments'}} : null); };

// 3. Hit list. And who's hunting it.: real damage both ways against the top 30 (the KO Board's maths: bestHitOn with the usual sets and
// each side's own weather), the five biggest hits each way; each row a slanted bar in the MOVE's type colour, a black tick at 100% (the KO
// line). Tag: KO = every roll knocks it out; Likely = most rolls do; Maybe = only the top rolls do. Then its type matchups.
V2.pkKO = p => { const key = p.n + '|' + (typeof metaVersion !== 'undefined' ? metaVersion : 0); if (V2._pkKO && V2._pkKO.key === key) return V2._pkKO.v;
  let v = {mine: [], theirs: []};
  try { const m0 = memberOf({n: p.n, a: null, lock: false}, 0), ms = typeof assignItems === 'function' ? assignItems([m0]) : [m0], m = ms[0];
    const thr = metaThreats(30).map(x => x.p || x).filter(t => t && t.st && t.n !== p.n);
    const myF = typeof sideField === 'function' ? sideField(ms) : {}, thF = t => typeof sideField === 'function' ? sideField([{p: t, ability: abilityOf({p: t})}]) : {};
    const one = (h, n) => h && h.r && h.r.hp ? {n, lo: h.r.min / h.r.hp, hi: h.r.max / h.r.hp, mv: h.mv.name, type: h.mv.type} : null;
    v.mine = thr.map(t => one(bestHitOn(m.p, m.moves, t, m, null, myF), t.n)).filter(Boolean).sort((a, b) => b.lo - a.lo || b.hi - a.hi);
    v.theirs = thr.map(t => one(bestHitOn(t, popularMoves(t), m.p, null, m, thF(t)), t.n)).filter(Boolean).sort((a, b) => b.lo - a.lo || b.hi - a.hi); } catch (e) {}
  V2._pkKO = {key, v}; return v; };
V2.pkHits = p => { const E = V2.esc, K = V2.pkKO(p), pc = x => Math.round(100 * x);
  const row = (b, hunt) => { const ko = b.lo >= 1, likely = !ko && (b.lo + b.hi) / 2 >= 1, maybe = !ko && !likely && b.hi >= 1;
    const tag = ko ? V2.kTag(hunt ? 'bad' : 'good', 'KO') : likely ? V2.kTag(hunt ? 'bad' : 'good', 'Likely') : maybe ? V2.kTag('neutral', 'Maybe') : '';
    const T = V2.TYPES.includes(b.type) ? b.type : '', lo = Math.min(150, 100 * b.lo), hi = Math.min(150, 100 * b.hi), d = V2.disp(b.n);
    return `<li><a href="#pokemon=${V2.monSlug(b.n)}" class="pk-hr" aria-label="${E(hunt ? `${d}'s ${b.mv} into ${V2.disp(p.n)}` : `${V2.disp(p.n)}'s ${b.mv} into ${d}`)}: ${pc(b.lo)}–${pc(b.hi)}%${ko ? ', a KO' : likely ? ', likely a KO' : maybe ? ', maybe a KO' : ''}">
      <span class="pk-hm" aria-hidden="true">${V2.mon(b.n, {iw: 36, bare: true})}</span><b class="pk-hn">${E(d)}</b><b class="pk-hp u">${pc(b.lo)}–${pc(b.hi)}%</b><small class="pk-hv">${E(b.mv)}</small>${tag ? `<span class="pk-ht">${tag}</span>` : ''}
      <span class="pk-dmg" aria-hidden="true" style="--lo:${lo.toFixed(1)};--hi:${hi.toFixed(1)}${T ? `;--tc:var(--tyn-${T})` : ''}"><i></i></span></a></li>`; };
  const list = (L, hunt, h) => L.length ? `<div><h3 class="pk-lbl u">${h}</h3><ul class="pk-ko">${L.slice(0, 5).map(b => row(b, hunt)).join('')}</ul></div>` : '';
  const M = V2.pkTry(() => SHT.matchups(p), null), chips = a => a.map(V2.typeChip).join('');
  const walls = K.theirs.slice().sort((a, b) => a.hi - b.hi).slice(0, 2), wl = walls.length ? ` · walls ${walls.map(b => `<b>${E(V2.disp(b.n))}</b> (${b.hi > 0 ? `its ${E(b.mv)} does ${pc(b.lo)}–${pc(b.hi)}%` : `immune to its ${E(b.mv)}`})`).join(' and ')}` : '';
  const types = M ? `<p class="pk-typeline">${M.g.q.length ? `<span>4× weak</span>${chips(M.g.q)}` : ''}${M.g.d.length ? `<span>2× weak</span>${chips(M.g.d)}` : M.g.q.length ? '' : '<span>No weaknesses</span>'}${M.g.h.length || M.g.qr.length ? `<span>Resists</span>${chips(M.g.h)}${M.g.qr.length ? `<span>¼</span>${chips(M.g.qr)}` : ''}` : ''}${M.g.z.length ? `<span>Immune</span>${chips(M.g.z)}` : ''}</p>
    <p class="fine">${M.ab.map(o => `With ${E(o.a)}${M.only ? ' (its only Ability, already counted)' : ''}: ${o.ch.map(c => `${E(c.t)} ${E(SHT.word(c.raw))} → ${E(SHT.word(c.x))}`).join(', ')}. `).join('')}${M.only ? `Its typing${p.t.length > 1 ? ` (${p.t.join(' / ')})` : ''} with ${E(M.only)}` : `For its typing${p.t.length > 1 ? ` (${p.t.join(' / ')})` : ''} alone`}; every other type hits it for normal damage${wl}.</p>` : '';
  const body = K.mine.length || K.theirs.length ? `<div class="pk-fights">${list(K.mine, false, 'It takes down')}${list(K.theirs, true, 'It goes down to')}</div>` : '<p class="fine">No damage numbers: the top threats could not be read.</p>';
  return V2.pkStep(3, 'pk-s3', "Hit list. And who's hunting it.", 'matchups: real damage against the top 30, each with its usual set', body + types, {label: 'Damage Calc', attrs: {href: '#calc'}}); };

V2.pkFocusName = () => { if (!V2.pkFocus) return; V2.pkFocus = 0; const h = document.querySelector('#pk-name'); if (h) { h.setAttribute('tabindex', '-1'); h.setAttribute('data-pgfocus', ''); h.focus({preventScroll: true}); h.addEventListener('blur', () => { h.removeAttribute('tabindex'); h.removeAttribute('data-pgfocus'); }, {once: true}); } }; /* tabindex only while focused (a lasting one reads as a control) */
V2.pages.pokemon = {place: 'meta', after() { V2.pkFocusName(); }, draw() { const p = V2.monFromHash(), E = V2.esc;
  if (!p) { try { document.title = 'No Pokémon here · NastyPlot'; } catch (e) {} } /* design review #20: the tab kept the previous Pokémon's title */
  if (!p) return `<div class="ra gsp nf-pg"><section class="ra-h"><p class="np-eyebrow"><span>Pokémon</span></p><h1 class="u">No Pokémon here.</h1><p class="ra-lede">This address doesn't match a Pokémon in Reg M-C.</p><a class="np-btn2 pk-404" href="#meta"><span>Every Pokémon, by tier ›</span></a></section>${V2.lostDog()}</div>`; /* scan S33: today's underdog; scan S3 A (Sim, Nov 20): the way out is the slanted outline button on its own line, so it never breaks inside its name */
  try { document.title = `${V2.disp(p.n)}: rating, sets and partners · NastyPlot`; } catch (e) {} /* a real page title per Pokémon (brief section 10: being found from a search) */
  const H = lairHead(p), dex = V2.pkDex(p);
  const lead = `Pokémon Champions · VGC doubles, ${(typeof REG_NAME === 'string' ? REG_NAME : 'Reg M-C').replace(/ /g, '\u00a0').replace(/-/g, '\u2011')}. ${H.tot ? `Rated from ${basisNum(H.tot, true)} real tournament teams.` : 'No tournament teams yet: rated from its stats, typing and tools.'}${H.thinR ? ' Early read: few games so far.' : ''}`;
  const ty = V2.byName && V2.byName.get(p.n) && V2.byName.get(p.n).t || p.t || [], c1 = V2.TYPES.includes(ty[0]) ? ty[0] : 'Normal', c2 = V2.TYPES.includes(ty[1]) ? ty[1] : c1;
  let top = V2.pkTop(p); top = top.replace('<ul class="k-facts">', '<ul class="k-facts pk-hfx">'); /* Sim, Nov 21 (6:46 PM): the facts as bold type-coloured tiles, under the "On about one tournament team in 3" line */
  return `<div class="ra pk pkf" style="--pk-c1:var(--ty-${c1});--pk-c2:var(--ty-${c2})"><nav class="pk-trail" aria-label="You are here"><a href="#meta">Meta</a><span aria-hidden="true">›</span><a href="#meta">Ratings</a><span aria-hidden="true">›</span><span aria-current="page">${E(V2.disp(p.n))}</span></nav>
    <div class="pk-hd">${V2.kHead({kicker: `CASE FILE${dex ? ' #' + dex : ''} · POKÉMON`, h1Html: `The file on <em class="pk-nm">${V2.nameHtml(V2.disp(p.n))}.</em>`, lead}).replace('<h1 class="k-h1 u">', '<h1 class="k-h1 u" id="pk-name">')}</div>
    ${top}${V2.pkForms(p).strip}${V2.kPlan(V2.pkRap(p) + V2.pkPartners(p) + V2.pkHits(p))}</div>`; }};
// (code review A1-I1, Nov 17: a hashchange listener here reset every other page's title to 'NastyPlot' after V2.setTitle had set it; V2.setTitle handles every route, so it is gone)

// phones: the full Moves and Items lists sit behind "Every move and item ›" (the typical set and the four moves already sum them up); desktop shows them
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-pklists]'); if (!b) return; const l = document.getElementById('pk-lists'); if (!l) return; const open = !l.classList.contains('open');
  l.classList.toggle('open', open); b.setAttribute('aria-expanded', open); b.textContent = open ? 'Hide every move and item' : 'Every move and item ›'; try { localStorage.setItem('np2.pkopen.pk-lists', open ? '1' : '0'); } catch (x) {} });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-pkmore]'); if (!b) return; const r = b.closest('.pk-rap'); if (!r) return; const open = !r.classList.contains('open');
  r.classList.toggle('open', open); b.setAttribute('aria-expanded', open); b.textContent = open ? 'Hide the full file' : 'The full file ›'; try { localStorage.setItem('np2.pkopen.pk-more', open ? '1' : '0'); } catch (x) {} });
