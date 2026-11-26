// ---------- nastyplot.org front page, The Receipt with WOW: three variants (Job X, Nov 26; PROPOSAL ONLY, Sim picks) ----------
// Sim (Nov 26): "i like the receipt but it has no wow factor". Each variant keeps A's copy (h1 + Score My Team on the first screen) and
// pushes ONE idea: a1 "It prints" (the receipt feeds out of a till slot line by line, the 87 lands, the Reg M-D stamp slams),
// a2 "Your turn" (tap today's top Pokémon onto your own receipt; it prints your live Strength Score with the real scoring code),
// a3 "The long receipt" (a giant thermal receipt down the whole first screen, the 87 enormous, the barcode IS the team code,
// the perforated stub is Score My Team). Built with --home=a1|a2|a3 (build.mjs); every other build is unchanged.
// Shared: V2.phFacts, V2.phChamp, V2.phBand, V2.phDate, V2.phRate, V2.phMon, V2.phTools (pubhome.js). Report: docs/rebuild/test-runs/public-home-v2.md.
V2.phCopy = (F, o = {}) => { const E = V2.esc, em = F.beforeMD ? 'before Reg M-D.' : F.reg ? `for Reg ${E(F.reg)}.` : 'today.';
  return `<div class="ph-a-copy"><p class="k-kicker">Team builder · Strength Score</p>
    <h1 class="k-h1 u ph-a-h1" id="ph-h1">Rate your Pokémon Champions team <em>${em}</em></h1>
    <p class="k-lead">${o.lead || `Add your six. NastyPlot scores it out of 100 against ${E(V2.phNum(F.teams))} real tournament teams, then shows its Matchups and exactly what to change.`}</p>
    <div class="ph-acts">${o.noGo === 'narrow' ? V2.kGo('Score My Team', {href: '#team', class: 'ph-copy-go'}) : o.noGo ? '' : V2.kGo('Score My Team', {href: '#team'})}${V2.kBtn('Build Me a Team', {href: '#build'})}</div>
    ${F.md ? `<p class="ph-a-md"><span class="ph-md-l">${E(F.md)}</span><span class="ph-md-s">${E(F.mdShort)}</span></p>` : ''}</div>`; };
// the champion's six as a team code (45-team-links.js format: {v:1, f, s:[[name]]}), the same code a "#team=" link carries
V2.phCode = ms => { try { return typeof tlB64 === 'function' ? tlB64(JSON.stringify({v: 1, f: 'doubles', s: ms.map(m => [m.p.n])})) : ''; } catch (e) { return ''; } };
V2.phScale = band => [['miss', 'under 60'], ['work', '60s'], ['solid', '70s'], ['ready', '80s'], ['top', '90+']].map(([k, w]) => `<li class="${k === band ? 'on' : ''}" style="--bd:var(--band-${k})"><i></i><span>${w}</span></li>`).join('');
V2.phLines = (ms, cls) => ms.map((m, i) => { const r = V2.phRate(m.p.n), E = V2.esc;
  return `<li style="--i:${i}">${V2.phMon(cls, m.p, `<span class="ph-rl-a" aria-hidden="true">${V2.mon(m.p.n, {bare: true, iw: 40})}</span><span class="ph-rl-n"><b>${E(V2.disp(m.p.n))}</b>${m.heldItem ? `<small>${V2.keepForm(E(m.heldItem))}</small>` : ''}</span><i class="ph-dots" aria-hidden="true"></i><span class="ph-rl-r u">${r != null ? r : '–'}</span>`, `${V2.disp(m.p.n)}${r != null ? ', rated ' + r : ''}: open its page`)}</li>`; }).join('');
V2.phEvent = C => { const E = V2.esc, when = V2.phDate(C.ev.date); return `Winning team · ${E(C.ev.name)}${when ? ` · ${E(when)}` : ''}${C.ev.players ? ` · ${E(V2.phNum(C.ev.players))} players` : ''}`; };

// ---- a1. It prints ----
// Plays once per visit (V2._phT0 = when it started). A redraw during the print keeps going from where it was (--el, the seconds already
// played, makes every delay negative by that much); after 3.2 s, or after Skip, every draw is the printed receipt. Animations only move
// (transform, clip-path, opacity), never size anything: the receipt's full height is there from the first frame, so nothing shifts.
// prefers-reduced-motion: the printed receipt, no animation (pubhome-x.css puts every animation under no-preference).
V2.PH_PRINT = 3.2;
V2.phA1 = () => { const E = V2.esc, F = V2.phFacts(), X = V2.phChamp();
  /* the print starts with the first draw that has the champion's receipt (the public site draws once with its built-in data first) */
  const now = performance.now(), has = !!(X && X.ms.length); if (V2._phT0 == null && has) V2._phT0 = now; const el = has ? (now - V2._phT0) / 1000 : 0, play = el < V2.PH_PRINT;
  let rc = `<figure class="ph-pr" aria-hidden="true"><div class="ph-slot"><span class="ph-slot-l u">NastyPlot</span><span class="ph-slot-t">Strength Score till</span><i class="ph-led"></i></div><div class="ph-roll"><div class="ph-pr-p"></div></div></figure>`; /* the till waits for today's receipt: same size, so nothing moves when it prints */
  if (has) { const {C, ms, G} = X, band = V2.phBand(G), s = G ? Math.round(G.s) : null;
    rc = `<figure class="ph-pr${play ? ' ph-play' : ''}" style="--el:${el.toFixed(2)}s" aria-labelledby="ph-rc-h">
    <div class="ph-slot" aria-hidden="true"><span class="ph-slot-l u">NastyPlot</span><span class="ph-slot-t">Strength Score till</span><i class="ph-led"></i></div>
    <div class="ph-roll"><div class="ph-pr-p">
      <p class="ph-rc-hd"><span>Receipt No. ${E(String(C.ev.players || 0).padStart(4, '0'))}</span><span>${E(V2.phDate(C.ev.date))}</span></p>
      <h2 class="ph-rc-h" id="ph-rc-h">${V2.phEvent(C)}</h2>
      <ol class="ph-rc-ls ph-pr-ls">${V2.phLines(ms, 'ph-rl')}</ol>
      ${G ? `<div class="ph-pr-fill" aria-hidden="true"><i style="--s:${s}%"></i><b style="--at:60%"></b><b style="--at:70%"></b><b style="--at:80%"></b><b style="--at:90%"></b></div>
      <p class="ph-pr-tot"><span class="u">Strength Score</span><b class="u ph-pr-n">${s}<small>/100</small></b></p>
      <p class="ph-rc-band"><i aria-hidden="true" style="--bd:var(--band-${band})"></i><span class="u">${E(CH.wordOf(G.s))}</span></p>` : ''}
      <p class="ph-rc-ft">Your receipt adds its Matchups, Suggestions and Team Checks.</p>
      ${F.beforeMD ? '<p class="ph-pr-stamp u" aria-hidden="true">Reg M-D · Dec 2</p>' : ''}
    </div></div>
    ${play ? '<button type="button" class="ph-skip" data-phskip>Skip the printout</button>' : ''}</figure>`; }
  return `<div class="ph ph-a ph-a1"><section class="ph-a-top" aria-labelledby="ph-h1">${V2.phCopy(F)}${rc}</section>${V2.phListA(F)}${V2.phTools('Every tool, <em>one site.</em>')}</div>`; };
V2.phSkip = () => { V2._phT0 = -1e9; document.querySelectorAll('.ph-pr.ph-play').forEach(f => f.classList.remove('ph-play')); document.querySelectorAll('[data-phskip]').forEach(b => b.remove()); };
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-phskip]')) { e.preventDefault(); V2.phSkip(); } });
V2.phA1After = () => { clearTimeout(V2._phSkT); if (V2._phT0 == null) return; const left = V2.PH_PRINT * 1000 - (performance.now() - V2._phT0);
  if (left > 0) V2._phSkT = setTimeout(() => document.querySelectorAll('[data-phskip]').forEach(b => b.remove()), left); /* the Skip button goes when the print ends (it sits on top of the paper: nothing moves) */ };
// A's tier list (pubhome.js draws it inline in V2.phA; the same block here)
V2.phListA = F => { const E = V2.esc;
  const list = F.top.map((x, i) => { const k = lairRank(x.p), rk = k ? k.rank : i + 1, r = RS(x.r.total);
    return `<li>${V2.phMon('ph-tr', x.p, `<b class="ph-tr-k u" aria-hidden="true">${rk}</b><span class="ph-tr-a" aria-hidden="true">${V2.mon(x.p.n, {bare: true, iw: 40})}</span><span class="ph-tr-n">${E(V2.disp(x.p.n))}</span><span class="ph-tr-bar" aria-hidden="true" style="--w:${Math.max(8, Math.min(100, (r - 40) * 100 / 60)).toFixed(0)}%"></span><b class="ph-tr-r u" aria-hidden="true">${r}</b>`, `Number ${rk}: ${V2.disp(x.p.n)}, rated ${r}: open its page`)}</li>`; }).join('');
  return `<section class="ph-a-list" aria-labelledby="ph-list-h"><div class="ph-a-lh"><h2 class="u ph-h2" id="ph-list-h">Pokémon Champions tier list, <em>right now.</em></h2>
    <p class="ph-note">The ten highest ratings${F.reg ? ` in Reg ${E(F.reg)}` : ''}, from tournament results${F.fresh ? ` (${E(F.fresh)})` : ''}. ${V2.kLink(`All ${F.all} Ratings`, {href: '#meta'})}</p></div>
    <ol class="ph-trs">${list}</ol></section>`; };

// ---- a2. Your turn ----
// Your six, picked on the front page: tap one of today's top 12 to put it on your receipt (tap it on the receipt to take it off). The
// receipt prints the Strength Score My Team would give these six (prepOf + proChecks + CH.gradeOf, the same calls as My Team; most
// common tournament sets, as every team starts), "so far" under six. "Finish on My Team" opens #team=<code>: My Team's own shared-team
// banner asks before it replaces anything. Kept for this visit only (nothing saved).
V2._phMine = V2._phMine || [];
V2.phMineG = () => { const key = V2._phMine.join('|'); if (V2._phMG && V2._phMG.key === key) return V2._phMG.G;
  let G = null; try { let ms = V2._phMine.map((n, i) => memberOf({n}, i)).filter(Boolean); if (typeof assignItems === 'function') ms = assignItems(ms);
    const RD = ms.length ? prepOf(ms) : null; G = RD ? CH.gradeOf(RD, proChecks(ms, true), ms) : null; } catch (e) { G = null; }
  V2._phMG = {key, G}; return G; };
V2.phA2 = () => { const E = V2.esc, F = V2.phFacts(), X = V2.phChamp(), mine = V2._phMine, G = mine.length ? V2.phMineG() : null, band = V2.phBand(G);
  let pool = []; try { pool = V2.ratedRows().slice(0, 12).map(x => x.p); } catch (e) {}
  const champ = X && X.ms.length ? `<figure class="ph-yt-c" aria-labelledby="ph-ytc-h"><p class="ph-rc-hd"><span class="u">The champion's</span><span>${E(V2.phDate(X.C.ev.date))}</span></p>
    <h2 class="ph-rc-h" id="ph-ytc-h">${E(X.C.ev.name)}</h2><ol class="ph-rc-ls">${V2.phLines(X.ms, 'ph-rl')}</ol>
    ${X.G ? `<p class="ph-yt-tot"><span class="u">Strength Score</span><b class="u">${Math.round(X.G.s)}</b></p>` : ''}</figure>` : '';
  const slots = Array.from({length: 6}, (_, i) => { const n = mine[i]; if (!n) return `<li class="off"><span class="ph-yt-k u" aria-hidden="true">${i + 1}</span><span class="ph-yt-e">Tap a Pokémon below</span></li>`;
    const p = byName.get(n), r = V2.phRate(n);
    return `<li><button type="button" class="ph-rl ph-yt-on" data-phrm="${E(n)}" aria-label="Take ${E(V2.disp(n))} off your receipt"><span class="ph-rl-a" aria-hidden="true">${V2.mon(n, {bare: true, iw: 40})}</span><span class="ph-rl-n"><b>${E(V2.disp(n))}</b><small>Tap to take off</small></span><i class="ph-dots" aria-hidden="true"></i><span class="ph-rl-r u">${r != null ? r : '–'}</span></button></li>`; }).join('');
  const code = mine.length ? V2.phCode(mine.map(n => ({p: byName.get(n)})).filter(m => m.p)) : '';
  const tot = G ? `<p class="ph-yt-tot ph-yt-me"><span class="u">Your Strength Score${G.partial || mine.length < 6 ? ' <small>so far</small>' : ''}</span><b class="u" style="--bd:var(--band-${band})">${Math.round(G.s)}</b></p>
      <p class="ph-rc-band"><i aria-hidden="true" style="--bd:var(--band-${band})"></i><span class="u">${E(CH.wordOf(G.s))}</span></p>`
    : `<p class="ph-yt-tot ph-yt-me"><span class="u">Your Strength Score</span><b class="u ph-yt-q" aria-label="No score yet">?</b></p>`;
  const yours = `<figure class="ph-yt-y" aria-labelledby="ph-yty-h"><p class="ph-rc-hd"><span class="u">Yours</span><span>${mine.length} of 6</span></p>
    <h2 class="ph-rc-h" id="ph-yty-h">Your six, scored as you pick</h2><ol class="ph-rc-ls ph-yt-ls" aria-live="polite">${slots}</ol>${tot}
    ${code ? V2.kLink('Finish on My Team', {href: '#team=' + code}) : ''}</figure>`;
  const pick = `<div class="ph-yt-p"><p class="ph-yt-pl u">Today's top 12. Tap to add.</p><ul class="ph-yt-row">${pool.map(p => { const on = mine.includes(p.n), full = mine.length >= 6;
    return `<li><button type="button" class="ph-yt-b"${on || full ? ' disabled' : ''} data-phadd="${E(p.n)}" aria-label="Add ${E(V2.disp(p.n))} to your receipt${on ? ' (on it)' : ''}">${V2.mon(p.n, {bare: true, iw: 56})}${(k => `${k.form ? `<small>${E(k.form)}</small>` : ''}<span>${E(k.name)}</span>`)(V2.kName(p.n))}</button></li>`; }).join('')}</ul></div>`;
  return `<div class="ph ph-a ph-a2"><section class="ph-a-top ph-yt" aria-labelledby="ph-h1">${V2.phCopy(F, {lead: `Try it right here: tap six of today's top Pokémon and your receipt prints their Strength Score out of 100, from ${E(V2.phNum(F.teams))} real tournament teams.`})}
    <div class="ph-yt-play"><div class="ph-yt-two">${champ}${yours}</div>${pick}</div></section>${V2.phListA(F)}${V2.phTools('Every tool, <em>one site.</em>')}</div>`; };
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('[data-phadd],[data-phrm]'); if (!a) return; e.preventDefault();
  const add = a.dataset.phadd, rm = a.dataset.phrm, M = V2._phMine;
  if (add && !M.includes(add) && M.length < 6) M.push(add); if (rm) { const i = M.indexOf(rm); if (i >= 0) M.splice(i, 1); }
  V2.redraw(); setTimeout(() => { const nx = document.querySelector('.ph-yt-b:not([disabled])') || document.querySelector('[data-phrm]'); if (nx) nx.focus({preventScroll: true}); }, 0); });

// ---- a3. The long receipt ----
// One thermal receipt from the top of the first screen past its bottom edge, where it curls away (3D turn, shading). The 87 is printed as
// big as the paper allows. The barcode is drawn from the champion's team code (each character a bar of its own width) and is a link:
// #team=<code> loads that six on My Team (after its banner asks). The perforated stub at the foot is the page's Score My Team.
V2.phBars = code => { let x = 0; const bars = []; for (let i = 0; i < code.length; i++) { const c = code.charCodeAt(i), w = 1 + (c % 3), g = 1 + ((c >> 2) % 2);
    bars.push(`<rect x="${x}" y="0" width="${w}" height="40"/>`); x += w + g; } return {svg: bars.join(''), w: x}; };
V2.phA3 = () => { const E = V2.esc, F = V2.phFacts(), X = V2.phChamp();
  let rc = `<figure class="ph-lr" aria-hidden="true"><div class="ph-lr-p"><p class="ph-lr-top"><span class="u">NastyPlot</span><span>Customer copy · Strength Score</span></p></div><div class="ph-lr-curl"></div></figure>`; /* before today's data: the same blank paper, so nothing moves */
  if (X && X.ms.length) { const {C, ms, G} = X, band = V2.phBand(G), code = V2.phCode(ms), bc = code ? V2.phBars(code) : null;
    rc = `<figure class="ph-lr" aria-labelledby="ph-rc-h"><div class="ph-lr-p">
      <p class="ph-lr-top"><span class="u">NastyPlot</span><span>Customer copy · Strength Score</span></p>
      <h2 class="ph-rc-h" id="ph-rc-h">${V2.phEvent(C)}</h2>
      <ol class="ph-rc-ls ph-lr-ls">${V2.phLines(ms, 'ph-rl')}</ol>
      ${G ? `<p class="ph-lr-k u">Strength Score</p><p class="ph-lr-n u" aria-label="Strength Score ${Math.round(G.s)} out of 100">${Math.round(G.s)}</p>
      <ol class="ph-rc-sc ph-lr-sc" aria-hidden="true">${V2.phScale(band)}</ol><p class="ph-lr-w u">${E(CH.wordOf(G.s))} · /100</p>` : ''}
      ${bc ? `<a class="ph-bc" href="#team=${E(code)}" aria-label="Load the champion's six on My Team"><svg viewBox="0 0 ${bc.w} 40" preserveAspectRatio="none" aria-hidden="true">${bc.svg}</svg><span>Scan me: load this six · ${E(code.slice(0, 18))}…</span></a>` : ''}
      <div class="ph-lr-stub"><p class="ph-lr-tear" aria-hidden="true">Tear here</p>${V2.kGo('Score My Team', {href: '#team'})}${V2.kLink('Score My Team', {href: '#team', class: 'ph-stub-lk'})}<p class="ph-lr-sm">Yours next: same receipt, your six.</p></div>
    </div><div class="ph-lr-curl" aria-hidden="true"></div>
    ${F.beforeMD ? '<p class="ph-rc-stamp u ph-lr-stamp" aria-hidden="true">Reg M-D · Dec 2</p>' : ''}</figure>`; }
  return `<div class="ph ph-a ph-a3"><section class="ph-a-top ph-lrs" aria-labelledby="ph-h1">${V2.phCopy(F, {noGo: 'narrow'})}${rc}</section>${V2.phListA(F)}${V2.phTools('Every tool, <em>one site.</em>')}</div>`; };
