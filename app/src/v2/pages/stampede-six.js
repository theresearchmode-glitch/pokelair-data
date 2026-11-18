// ---------- Home, The Stampede: the six band (see stampede.js and docs/rebuild/stampede/BRIEF.md) ----------
// V2.sdSix = () => html; V2.sdSixAfter = () => {} runs after the page is drawn (arrows on the plan board, names that don't fit).
// Band 2, "Call six out of the herd." (ink): three parts, left to right on desktop and top to bottom on phones:
//   1. the line-up: six rings. Your six (open rings for empty slots, each opens the Add box for its slot: HOME-10b); with no team at
//      all, the three most-used Pokémon by TOURNAMENT share stand in three rings and the other three are open (the mock-up's view).
//      Kept from today's Home: the eyebrow "Your six · <team name> · <weather word>" (HOME-10/16), the sample-team note (HOME-11),
//      the game plan line (lead / back / bench, HOME-10), Build Me a Team and "Paste it from Showdown" (opens Import, HOME-07).
//   2. the receipt: "?" with no team; your real Strength Score and its band word (word list) with a team; the five bands as one strip.
//   3. the plan board: your two leads against the latest winner's likely two (with no team: a sample team's, said so), the arrows
//      are the real turn 1 plan (turnOneData, as Battle's), and Battle sets the winner's six as Battle's opponent (HOME-10).
// Same data hooks as today's Home (home.js V2.homeFight): members, homeChamp, planMatchup, userLeads, prepOf, CH.gradeOf, CH.wordOf,
// wxKeyOf, teamTitleFor. Every number and name comes from live data. Classes sds-*; colours from --sd-* tokens (tokens.css).
V2.sdsCache = {key: null, v: null};
// the plan, worked out once per team + winner: your lead / back / bench, their likely two leads, and your leads' turn 1 targets
V2.sdsPlan = (ms, C) => { const key = (C ? C.ev.id + '#' + C.ev.top.indexOf(C.t) : '-') + '|' + ms.map(m => m.p.n + '@' + (m.item || '') + ':' + m.moves.map(x => x.name).join(',')).join('|') + '|' + (S.leads || []).join() + '|' + (typeof metaVersion !== 'undefined' ? metaVersion : '');
  if (V2.sdsCache.key === key) return V2.sdsCache.v; let v = null;
  try { if (ms.length >= 4) { let theirs = null, r = null, vs = '';
      if (C) { theirs = withSheet(C.six.map(x => oppMember(x.p)), {t: C.t, ev: C.ev}); r = planMatchup(ms, theirs, true); vs = "vs the Champion's six"; }
      else { const F = CH.four(ms); if (F) r = {lead: F.lead.map(n => ms.findIndex(m => m.p.n === n)), back: F.back.map(n => ms.findIndex(m => m.p.n === n))}; vs = "vs the meta's top six"; }
      if (r && r.lead && r.lead.length >= 2) { let lead = r.lead.map(i => ms[i]).filter(Boolean), back = (r.back || []).map(i => ms[i]).filter(Boolean);
        const UL = userLeads(ms); if (UL) { back = lead.concat(back).filter(m => !UL.includes(m)).slice(0, 2); lead = UL; vs += ', your leads'; } /* your own lead pick wins (today's Home) */
        back = back.filter(m => !lead.includes(m)).slice(0, 2); const bench = ms.filter(m => !lead.includes(m) && !back.includes(m));
        let their = [], aim = [];
        if (theirs && r.B) { const LL = likelyLead(theirs, r.B); their = LL.map(o => o.p.n);
          try { const T = turnOneData(ms, theirs, {...r, lead: lead.map(m => ms.indexOf(m))}); /* the real turn 1 plan, as Battle's (40-turn-one-data.js) */
            if (T && T.beats) aim = lead.map(m => { const L = T.beats.find(x => x.me && x.x === m); if (!L) return null; const t = String(L.act); const o = LL.find(x => new RegExp('(?:into |^Fake Out )' + x.d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$').test(t));
              return {move: t.replace(/ into .*$/, '').replace(/^Fake Out .*$/, 'Fake Out').replace(/ \(hits both\)$/, ''), at: /\(hits both\)$/.test(t) ? their.slice() : o ? [o.p.n] : []}; }); } catch (e) { aim = []; } }
        v = {lead, back, bench, vs, their, aim}; } } } catch (e) { v = null; }
  V2.sdsCache = {key, v}; return v; };
// the three most-used Pokémon by tournament share (V2.raNums, the Ratings and Usage pages' numbers), highest first, written as Ratings writes it
V2.sdsTop3 = () => { let rows = []; try { rows = lairRows().map(x => ({p: x.p, u: V2.raNums(x.p).u})).filter(x => x.u != null && lairHead(x.p).tOK); } catch (e) {} /* V2.raNums: the Ratings page's own numbers */
  return rows.sort((a, b) => b.u - a.u).slice(0, 3).map(x => ({n: x.p.n, d: x.p.d, u: V2.raPct(x.u)})); };
// the site's sample team (DEFAULT_TEAM), as members: the plan board's lower half for a player with no team (labelled as a sample)
V2.sdsSample = () => { try { const ms = DEFAULT_TEAM.slots.map(memberOf).filter(Boolean); return typeof assignItems === 'function' ? assignItems(ms) : ms; } catch (e) { return []; } };
V2.sdSix = () => { const E = V2.esc, ms = members(), has = ms.length > 0, C = homeChamp();
  const P = has ? V2.sdsPlan(ms, C) : null, title = has ? teamTitleFor(ms) : '', sample = has && /\(sample\)\s*$/i.test(title);
  let wx = ''; try { const k = has ? wxKeyOf(ms) : null; if (k) wx = wxName(k); } catch (e) {} // today's weather word (HOME-16)
  let G = null; try { const RD = has ? prepOf(ms) : null; G = RD ? CH.gradeOf(RD, proChecks(ms, true), ms) : null; } catch (e) { G = null; }
  // ---- 1. the line-up: six rings, one per slot ----
  const full = has && ms.length === 6 && P, ord = full ? [...P.lead, ...P.back, ...P.bench] : null; /* all six in: in the plan's order, as today's Home */
  const ring = `<i class="sds-ring" aria-hidden="true"></i>`, beam = `<i class="sds-beam" aria-hidden="true"></i>`;
  const filled = (n, sub, extra) => `<li class="sds-slot on${extra || ''}"><div class="sds-st">${beam}${ring}<div class="sds-mon" data-v2mon="${E(n)}" aria-hidden="true">${V2.mon(n, {bare: true})}</div></div>
    <div class="sds-cap"><button type="button" class="sds-nm" data-v2mon="${E(n)}" aria-label="${E(V2.disp(n))}${sub.label ? ', ' + E(sub.label) : ''}: open its page">${V2.disp(n).startsWith('Mega ') ? '<span class="sds-mg">Mega </span>' : ''}${V2.tileName(V2.disp(n))}</button>${sub.html}</div></li>`;
  const open = i => `<li class="sds-slot off"><div class="sds-st"><button type="button" class="sds-add" data-v2addto="${i}" aria-label="Add a Pokémon to slot ${i + 1}"><i class="sds-ring" aria-hidden="true"></i><span class="sds-plus" aria-hidden="true">+</span></button></div>
    <div class="sds-cap"><span class="sds-nm sds-addw" aria-hidden="true">Add</span><small class="sds-sub">Spot ${i + 1}</small></div></li>`;
  let slots = '', named = 0, top3 = [];
  if (!has) { top3 = V2.sdsTop3(); const at = [1, 3, 5]; /* the three most used stand in spots 2, 4 and 6 (#2, #1, #3: the most used in the middle), so each open ring is the slot it fills: 1, 3, 5 */
    const put = [top3[1], top3[0], top3[2]]; named = put.filter(Boolean).length;
    slots = Array.from({length: 6}, (_, i) => { const k = at.indexOf(i), x = k >= 0 ? put[k] : null;
      return x ? filled(x.n, {label: x.u + ' of tournament teams', html: `<small class="sds-sub sds-u"><b>${E(x.u)}</b><span class="sds-of"> of tournament teams</span></small>`}, ' show') : open(i); }).join(''); }
  else { const at = i => ms.find(m => m.i === i), item = m => m.heldItem || m.item || '';
    const one = m => { const ld = full && P.lead.includes(m), it = item(m); named++; return filled(m.p.n, {label: [it, ld ? 'lead' : ''].filter(Boolean).join(', '), html: `<small class="sds-sub">${it ? V2.keepForm(E(it)) : ''}${ld ? '<em class="sds-ld">Lead</em>' : ''}</small>`}, ld ? ' lead' : ''); };
    slots = ord ? ord.map(one).join('') : Array.from({length: 6}, (_, i) => at(i) ? one(at(i)) : open(i)).join(''); }
  const eye = has ? `<p class="sds-k">Your six · ${E(title)}${wx ? ` · <span class="sds-wx">${E(wx)}</span>` : ''}</p>` : `<p class="sds-k">Your six goes here.</p>`;
  const note = sample ? `<p class="sds-note">A sample team, here to show how NastyPlot works.</p>` : '';
  const pair = g => g.map(m => E(m.d)).join(' + ');
  const say = !has ? `<p class="sds-say">Let us build one from real winning teams, copy a top team, or type your own six.</p>` : '';
  const gp = !has ? '' : P ? `<p class="sds-gp sds-plan"><strong class="u">Game Plan</strong> ${E(P.vs)}: lead <b>${pair(P.lead)}</b>${P.back.length ? `, back ${pair(P.back)}` : ''}${P.bench.length ? `, bench ${pair(P.bench)}` : ''}.</p>`
    : `<p class="sds-gp sds-plan"><strong class="u">Game Plan</strong> Add at least four Pokémon and NastyPlot plans your four and two leads.</p>`;
  const line = `<div class="sds-part sds-line">${eye}<h2 class="u sds-h" id="sds-h">Call six <span>out of the herd.</span></h2>${note}
    <ol class="sds-rings" data-named="${named}" aria-label="${has ? 'Your six' : 'Your six: empty. The three most used in tournaments stand in three rings'}">${slots}</ol>
    ${!has && top3.length ? '<p class="sds-cap1">Share of tournament teams using each</p>' : ''}${say}
    <div class="sds-acts"><a class="np-btn sds-btn" href="#build">Build Me a Team</a><button type="button" class="np-link sds-lk" data-v2homeimport>Import a Team ›</button></div></div>`;
  // ---- 2. the receipt ----
  const band = G ? ({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[CH.grade(G.s)] || 'solid' : '';
  const bands = [['miss', 'Missing a basic'], ['work', 'Needs work'], ['solid', 'Solid'], ['ready', 'Tournament ready'], ['top', 'Top tier']];
  const strip = `<ol class="sds-bands" aria-label="Strength Score bands, low to high">${bands.map(([k, w]) => `<li class="sds-b${k === band ? ' on' : ''}" style="--bd:var(--band-${k})"${k === band ? ' aria-current="true"' : ''}><i aria-hidden="true"></i><span>${w}</span></li>`).join('')}</ol>`;
  const rk = G && !G.partial && G.rk != null ? CH.rankShort(G.rk) + ' of tournament teams' : '';
  const num = G ? `<p class="sds-sc"><b class="u sds-n" style="--bd:var(--band-${band})">${Math.round(G.s)}</b><span class="u sds-of100">/100</span></p>
      <p class="sds-w"><i aria-hidden="true" style="--bd:var(--band-${band})"></i><span class="u">${E(CH.wordOf(G.s))}</span>${G.partial ? ' <small>so far</small>' : ''}</p>${rk ? `<p class="sds-rk">${E(rk)}</p>` : ''}`
    : `<p class="sds-sc"><b class="u sds-n sds-q" aria-label="No score yet">?</b><span class="u sds-of100" aria-hidden="true">/100</span></p>${has ? '' : '<p class="sds-rk">No score yet: add your six to get one.</p>'}`;
  const rc = `<div class="sds-part sds-rcw"><div class="sds-rc"><p class="sds-rh"><span>Strength Score report</span>${sample ? '<span class="sds-smp">Sample team</span>' : '<span>Your six</span>'}</p>
    <h3 class="u sds-rt">${G ? 'Your Strength Score' : "What's your Strength Score?"}</h3>${num}${strip}
    <dl class="sds-rl"><div><dt class="u">Matchups</dt><dd>against the top threats</dd></div><div><dt class="u">Suggestions</dt><dd>what to change</dd></div><div><dt class="u">Team Checks</dt><dd>the basics covered</dd></div></dl>
    <p class="sds-rl2"><b>In the report:</b> Matchups, Suggestions, Team Checks</p>
    <a class="np-btn sds-rb" href="#team"${G ? '' : ` aria-label="Score My Team${has ? '' : ': add your six on My Team first'}"`}>${G ? 'Open My Team' : 'Score My Team'}</a></div></div>`;
  // ---- 3. the plan board ----
  let mine = P ? P.lead : null, aim = P ? P.aim : [], their = P ? P.their : [], who = 'Your leads', alt = '';
  if (!has && C) { const sm = V2.sdsSample(), SP = sm.length >= 4 ? V2.sdsPlan(sm, C) : null; /* no team: a sample team's leads, said so */
    if (SP) { mine = SP.lead; aim = SP.aim; their = SP.their; who = 'Sample leads'; alt = `Lower half: the leads of NastyPlot's sample team, ${E(DEFAULT_TEAM.name.replace(/\s*\(sample\)\s*$/i, ''))}.`; } }
  const tok = (n, side, k) => { const a = side === 'you' && aim[k] ? aim[k] : null;
    return `<button type="button" class="sds-tk ${side} k${k}" data-v2mon="${E(n)}" data-sdsk="${side}${k}"${a && a.at.length ? ` data-sdsat="${E(a.at.map(x => 'them' + their.indexOf(x)).join(' '))}"` : ''} aria-label="${E(V2.disp(n))}, ${side === 'you' ? (who === 'Your leads' ? 'your lead' : 'sample lead') + (a ? ', turn 1: ' + E(a.move) + (a.at.length ? ' into ' + E(a.at.map(V2.disp).join(' and ')) : '') : '') : 'their likely lead'}: open its page">
      <span class="sds-dot2">${V2.mon(n, {bare: true})}</span><span class="sds-tg u">${V2.esc(V2.disp(n))}</span>${a ? `<small class="sds-mv">${E(a.move)}</small>` : ''}</button>`; };
  const board = C && mine && mine.length >= 2 && their.length >= 2
    ? `<div class="sds-board"><svg class="sds-arw" aria-hidden="true"></svg><p class="sds-bl u them">Their likely leads</p>${their.map((n, k) => tok(n, 'them', k)).join('')}<i class="sds-mid" aria-hidden="true"></i>${mine.map((m, k) => tok(m.p.n, 'you', k)).join('')}<p class="sds-bl u you">${E(who)}</p></div>`
    : '';
  const champ = C ? `<p class="sds-who">Their side: the latest winner's six, ${E(V2.evTitle(C.ev.name))}, ${E(evDate(C.ev.date))}. Battle sets it as your opponent.${alt ? ' ' + alt : ''}</p>` : '';
  const bt = C ? `<button type="button" class="np-btn sds-bt" data-hmprep="${E(C.ev.id + '#' + C.ev.top.indexOf(C.t))}" data-sdgo aria-label="Battle: Set as Opponent, the latest winner's six">Battle</button>` : `<a class="np-btn sds-bt" href="#battle" data-sdgo>Battle</a>`;
  const plan = `<div class="sds-part sds-pl"><h3 class="u sds-ph">Walk in with <span>a turn 1 plan.</span></h3>${board}${champ}${gp}${has ? '' : '<p class="sds-pt">Scout their six, see who moves first, run the damage.</p>'}${bt}</div>`;
  const chev = `<i class="sds-chev" aria-hidden="true"><svg viewBox="0 0 32 40"><path d="M4 4l12 16-12 16M16 4l12 16-12 16"/></svg></i>`;
  return `<section class="sd-band sd-six sds" aria-labelledby="sds-h"><div class="sds-in">${line}${chev}${rc}${chev}${plan}</div></section>`; };
// after drawing: the board's arrows from each of your leads to its turn 1 target(s), measured from the drawn rings (any width);
// names that don't fit their spot step down the type scale (as Home's fitUsed did)
V2.sdsArrows = () => { document.querySelectorAll('.sds-board').forEach(b => { const svg = b.querySelector('.sds-arw'); if (!svg) return; const R = b.getBoundingClientRect(); if (!R.width) return;
  const c = el => { const r = el.querySelector('.sds-dot2').getBoundingClientRect(); return {x: r.left + r.width / 2 - R.left, y: r.top + r.height / 2 - R.top, r: r.width / 2}; };
  let d = ''; b.querySelectorAll('.sds-tk.you[data-sdsat]').forEach(y => { const a = c(y); for (const k of y.dataset.sdsat.split(' ')) { const t = b.querySelector(`.sds-tk.them.k${k.slice(4)}`); if (!t) continue; const z = c(t);
    const dx = z.x - a.x, dy = z.y - a.y, L = Math.hypot(dx, dy); if (L < a.r + z.r + 8) continue; const ux = dx / L, uy = dy / L, x1 = a.x + ux * (a.r + 4), y1 = a.y + uy * (a.r + 4), x2 = z.x - ux * (z.r + 6), y2 = z.y - uy * (z.r + 6);
    const h = 10, w = 6, bx = x2 - ux * h, by = y2 - uy * h; d += `<path class="ln" d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}"/><path class="hd" d="M${x2.toFixed(1)} ${y2.toFixed(1)}L${(bx - uy * w).toFixed(1)} ${(by + ux * w).toFixed(1)}L${(bx + uy * w).toFixed(1)} ${(by - ux * w).toFixed(1)}Z"/>`; } });
  svg.setAttribute('viewBox', `0 0 ${R.width.toFixed(1)} ${R.height.toFixed(1)}`); svg.innerHTML = d; }); };
V2.sdsFit = () => { const steps = [['--t13', ''], ['--t13', '88%'], ['--t13', '75%']]; /* never under 13px (the type scale); narrower letters, then a hyphen */
  /* a board tag: its whole slanted shape (not only its words) keeps 4px clear of the board's edges, and of the folded top-right corner
     (24px, cut at 45 degrees), which clipped "Mega Charizard Y" (polish Nov 18 night); last, a tag may wrap to two lines */
  const tagOver = (b, B) => { const r = b.getBoundingClientRect(), fold = Math.max(0, 24 - (r.top - B.top)); return r.left < B.left + 4 - 0.5 || r.right > B.right - 4 - fold + 0.5; };
  document.querySelectorAll('.sds-rings .sds-nm, .sds-rings .sds-sub, .sds-tg').forEach(b => { b.style.fontSize = ''; b.style.fontStretch = ''; b.style.hyphens = ''; b.style.whiteSpace = ''; b.classList.remove('nar');
    const tg = b.classList.contains('sds-tg'), box = tg ? b.closest('.sds-board') : b.closest('.sds-cap'), over = () => { const br = box.getBoundingClientRect(); if (tg) return tagOver(b, br); const rg = document.createRange(); rg.selectNodeContents(b); return [...rg.getClientRects()].some(r => r.width && (r.left < br.left - 0.5 || r.right > br.right + 0.5)); };
    if (!box || !over()) return; if (tg) { b.classList.add('nar'); if (!over()) return; } /* a board tag: the body font is narrower than Unbounded */ for (const [fs, st] of steps) { b.style.fontSize = `var(${fs})`; b.style.fontStretch = st; if (!over()) return; }
    if (tg) { b.style.fontStretch = ''; b.style.whiteSpace = 'normal'; if (!over()) return; b.style.fontStretch = '75%'; if (!over()) return; } b.style.hyphens = 'auto'; }); };
V2.sdSixAfter = () => { V2.sdsFit(); V2.sdsArrows(); };
addEventListener('resize', () => { if (V2.route && V2.route() === 'home' && document.querySelector('.sds')) requestAnimationFrame(V2.sdSixAfter); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (V2.route && V2.route() === 'home' && document.querySelector('.sds')) V2.sdSixAfter(); });
/* fit again once a web font arrives: the ready promise above can settle before Unbounded starts loading, and the names were then fitted
   in the narrower fallback font (the board's "Mega Charizard Y" ran past the edge, qcheck triage Nov 18) */
if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { if (V2.route && V2.route() === 'home' && document.querySelector('.sds')) requestAnimationFrame(V2.sdSixAfter); });
