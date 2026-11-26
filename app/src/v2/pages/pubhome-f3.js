// ---------- nastyplot.org Home: "Final 3, Plot Receipt on the night panel" (Sim picked it, Nov 26) ----------
// Source of truth: docs/rebuild/mockups/hh-receipt-nov26/index.html?v=11 (F3.png 1440 light, F3p.png iPhone) on alt/t3-pending.
// The public build only (window.__NP_PUBLIC): the Claude build keeps The Stampede until Sim says otherwise (home.js).
// Left: the kit's words (h1 "Rate your Pokémon Champions team before Reg M-D.", Score My Team, Build Me a Team, the Reg M-D line, the
// type legend). Right: the slanted night panel with thin blue/pink rays and halftone; on it the white zig-zag receipt of the latest
// winning six (today's data: homeChamp, the same team The Stampede shows), each row's Rating running out of the receipt as a slanted bar
// in its type's colour with the Pokémon riding the end (both glowing in that colour), the Strength Score (the same calls as My Team),
// its band word and the Reg M-D stamp. Phones (under 1280): the bars sit under each name inside the receipt (F3p).
// Every bar is a link to its Pokémon's page, labelled "<name>, Rating <n>". Colours: tokens.css --f3-*.
V2.F3_TYPES = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
V2.f3Ty = t => V2.F3_TYPES.includes(t) ? t : 'Normal';
V2.f3Rate = n => { try { const r = ratings().get(n); return r ? RS(r.total) : null; } catch (e) { return null; } };
V2.f3Date = d => { const t = Date.parse(String(d || '').slice(0, 10) + 'T12:00:00Z'); return isFinite(t) ? new Date(t).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'}) : ''; };
// the team on the receipt: the latest event's winner (homeChamp); if there is none yet (a new regulation's first day), the top Winning
// Teams entry; the label says which, and says when it is the previous regulation's team. Cached per data version: grading is the costly part.
V2.f3Data = () => { const key = typeof metaVersion !== 'undefined' ? metaVersion : 0; if (V2._f3 && V2._f3.key === key) return V2._f3.v;
  let v = null; try {
    let reg = ''; try { const r = typeof regInfo === 'function' ? regInfo() : null; reg = r && r.id ? r.id : ''; } catch (e) {}
    let six = null, ev = null; const C = typeof homeChamp === 'function' ? homeChamp() : null;
    if (C) { six = C.six.map(m => ({p: m.p, it: m.it, ab: m.ab})); ev = {name: C.ev.name, date: C.ev.date, players: C.ev.players}; }
    else { const T = (META.teams && Array.isArray(META.teams.teams) ? META.teams.teams : []).find(t => t && Array.isArray(t.mons) && t.mons.length === 6 && t.mons.every(n => byName.get(n)));
      if (T) { six = T.mons.map(n => ({p: byName.get(n), it: '', ab: ''})); ev = {name: String(T.event || '').replace(/\s*·\s*\d[\d,]* players$/, ''), date: '', players: +((String(T.event || '').match(/(\d[\d,]*) players$/) || [])[1] || '').replace(/,/g, '') || 0}; } }
    if (six) { let ms = six.map((m, i) => memberOf({n: m.p.n, a: m.ab || null, it: m.it ? {[S.format]: m.it} : null}, i)).filter(Boolean);
      let G = null; try { const RD = prepOf(ms); G = RD ? CH.gradeOf(RD, proChecks(ms, true), ms) : null; } catch (e) { G = null; }
      const evReg = (String(ev.name).match(/\(Reg ([A-Z]-[A-Z])\)/) || [])[1] || '';
      /* the regulation the site is in: the data's, or Reg M-D from Dec 2 even while the data still says M-C (its first day has no winner yet) */
      const mdAt = Date.parse(V2.REG_START_MD || ''), cur = isFinite(mdAt) && Date.now() >= mdAt && (!reg || reg === 'M-C') ? 'M-D' : reg;
      v = {reg: cur, ev, old: !!(evReg && cur && evReg !== cur), evReg, G, rows: ms.map(m => ({p: m.p, n: m.p.n, d: V2.disp(m.p.n), item: m.heldItem || m.item || '', t: V2.f3Ty(m.p.t[0]), r: V2.f3Rate(m.p.n)}))}; }
  } catch (e) { v = null; }
  V2._f3 = {key, v}; return v; };
V2.f3Band = G => G ? ({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[CH.grade(G.s)] || 'solid' : '';
V2.f3Link = n => { const s = typeof V2.pubSlug === 'function' ? V2.pubSlug(n) : ''; return s ? `/pokemon/${s}` : `#pokemon=${encodeURIComponent(n)}`; };
// the words (Sim, Nov 26: option A): ONE h1 with the slogan drawn like the brand lockup ("Sharply raise" ink, "your win rate." PLOT blue)
// and, smaller inside the same h1, the line Google reads for the regulation; that line changes with the calendar (before Dec 2: "before Reg M-D."; from Dec 2: "for Reg M-D."), and later names the regulation
V2.f3Words = D => { const E = V2.esc, now = Date.now(), mdAt = Date.parse(V2.REG_START_MD || ''), before = isFinite(mdAt) && now < mdAt;
  const reg = D && D.reg ? D.reg : '', em = before ? 'before Reg M-D.' : reg && reg !== 'M-C' ? `for Reg ${E(reg)}.` : 'for Reg M-D.';
  const teams = (typeof RES === 'object' && RES && RES.teams) || 0, md = V2.mdCountdown(now) || V2.regDay(now) || '', mdS = V2.mdCountdown(now, true) || V2.regDay(now) || '';
  const tys = D ? [...new Set(D.rows.map(x => x.t))] : [];
  return {before, html: `<div class="f3-words"><p class="k-kicker">Team builder · Strength Score</p>
    <h1 class="k-h1 u f3-h1" id="f3-h1"><span class="f3-sl">Sharply raise <em>your win rate.</em></span> <span class="f3-h1s">Rate your Pokémon Champions team ${em}</span></h1>
    <p class="k-lead f3-lead"><span class="f3-l0">Add your six. </span>NastyPlot rings it up out of 100 against ${E(Number(teams).toLocaleString('en-US'))} real tournament teams, then shows its Matchups and exactly what to change.</p>
    <div class="f3-acts">${V2.kGo('Score My Team', {href: '#team', 'data-sdgo': true})}${V2.kBtn('Build Me a Team', {href: '#build', 'data-sdgo': true})}</div>
    ${md ? `<p class="f3-md"><span class="f3-md-l">${E(md)}</span><span class="f3-md-s">${E(mdS)}</span></p>` : ''}
    ${tys.length ? `<p class="f3-leg"><span class="vh">The bar colours are the types of the winning six: </span>${tys.map(t => `<span class="f3-chip" style="--c:var(--f3-${t});--on:var(--f3-on-${t})">${E(t)}</span>`).join('')}</p>` : ''}</div>`}; };
V2.f3Page = () => { const E = V2.esc, D = V2.f3Data(), W = V2.f3Words(D);
  let pr = ''; if (D && D.rows.length) { const s = D.G ? Math.round(D.G.s) : null, when = V2.f3Date(D.ev.date);
    const lab = D.old ? `The last Reg ${E(D.evReg)} winning team` : 'Winning team';
    const rows = D.rows.map((x, i) => { const r = x.r != null ? x.r : 40, len = Math.max(0, Math.min(100, (r - 40) / 60 * 100));
      return `<li class="f3-pl" style="--c:var(--f3-${x.t});--num:var(--f3-num-${x.t});--on:var(--f3-on-${x.t});--r:${r};--len:${len.toFixed(1)};--d:${(i * .1).toFixed(1)}s">
        <div class="f3-lab"><span class="f3-sp" aria-hidden="true">${V2.mon(x.n, {bare: true, iw: 36})}</span><span class="f3-n"><b>${E(x.d)}</b>${x.item ? `<small>${V2.keepForm ? V2.keepForm(E(x.item)) : E(x.item)}</small>` : ''}</span><span class="f3-t">${E(x.t)}</span></div>
        <a class="f3-bar" href="${E(V2.f3Link(x.n))}" data-v2mon="${E(x.n)}" aria-label="${x.r != null ? `${x.r}, ${E(x.d)}'s Rating` : `${E(x.d)}, not rated`}"><b class="u f3-r" aria-hidden="true">${x.r != null ? x.r : '–'}</b><img class="f3-art" src="${V2.art(typeof SPRITE_ID === 'object' ? SPRITE_ID[x.n] : null, true)}" alt="" decoding="async"></a></li>`; }).join('');
    const stamp = W.before ? 'Reg M-D · Dec 2' : '';
    pr = `<figure class="f3-pr" aria-labelledby="f3-rc-h"><div class="f3-paper" aria-hidden="true"></div>
      <div class="f3-hd"><p class="f3-top"><span class="u">NastyPlot</span><span>Receipt</span></p><h2 class="f3-meta" id="f3-rc-h">${lab} · ${E(D.ev.name)}${when ? ` · ${E(when)}` : ''}${D.ev.players ? ` · ${E(Number(D.ev.players).toLocaleString('en-US'))} players` : ''}</h2></div>
      <ol class="f3-rows">${rows}</ol>
      <div class="f3-ft">${s != null ? `<p class="u f3-band">Strength Score<br><span>${E(CH.wordOf(D.G.s))}</span></p><p class="u f3-big" aria-label="Strength Score ${s} out of 100">${s}<small>/100</small></p>` : ''}
      ${stamp ? `<p class="u f3-stamp" aria-hidden="true">${stamp}</p>` : ''}</div>
      <p class="f3-scale" aria-hidden="true"><span>Rating 40</span><span>70</span><span>100</span></p></figure>`; }
  else pr = `<figure class="f3-pr f3-empty"><div class="f3-paper" aria-hidden="true"></div><div class="f3-hd"><p class="f3-top"><span class="u">NastyPlot</span><span>Receipt</span></p><p class="f3-meta">No winning team in today's data yet. The receipt prints after the next event.</p></div></figure>`;
  return `<div class="f3-home"><section class="f3-hero f3-anim" aria-labelledby="f3-h1"><div class="f3-panel" aria-hidden="true"><i class="f3-rays"></i><i class="f3-dots"></i></div>${W.html}${pr}</section></div>`; };
/* Home (Job DD, Nov 26; Sim: Final 3 is the FIRST SCREEN, nothing else removed, rule 18): F3's hero replaces only the Stampede's hero; the
   Top 10, your six, tools rack and post band stay below in today's order. nastyplot.org always; the Claude build when V2.F3_CLAUDE. */
V2.F3_CLAUDE = !window.__NP_SDHERO; /* Job DD: the Claude build (live artifact + Preview) too, one front page everywhere; waits for Sim's yes. The checks of
   the Stampede's own hero (kept, unused, until Sim's yes) set window.__NP_SDHERO before the page loads to draw it instead */
V2.f3On = () => !!(window.__NP_PUBLIC || V2.F3_CLAUDE);
V2.f3Home = () => `${V2.f3Page()}<div class="sd">${V2.sdTop()}${V2.sdSix()}${V2.sdTools()}${V2.sdPost()}</div>`;
/* the first screen (Job DD): the hero fills the window less everything above it (header, a data note such as the Preview's), as the
   Stampede's hero did (V2.sdhLayout --sdh-top); 76px (the header alone) until measured */
V2.f3After = () => { const S = document.querySelector('#main .f3-hero'); if (!S) return; V2.f3Watch(); const t = Math.round(S.getBoundingClientRect().top + scrollY);
  if (S.style.getPropertyValue('--f3-top') !== t + 'px') S.style.setProperty('--f3-top', t + 'px');
  const w = S.querySelector('.f3-words'), pr = S.querySelector('.f3-pr'); const need = Math.max(w ? w.offsetHeight : 0, pr ? pr.offsetHeight + 48 : 0) + 40; /* the taller column: the words, or the receipt with its 24px margins */
  const tight = !!w && innerWidth >= 1280 && need > innerHeight - t; /* a style property, not a class: a redraw's patch keeps it */
  if (S.style.getPropertyValue('--f3-pb') !== (tight ? 'var(--s4)' : '')) { if (tight) S.style.setProperty('--f3-pb', 'var(--s4)'); else S.style.removeProperty('--f3-pb'); } };
/* again whenever the words change size (fonts arriving, today's data drawn into the same element) and when the window changes size */
V2.f3Watch = () => { const w = document.querySelector('#main .f3-words'); if (!w || !window.ResizeObserver || V2._f3w === w) return; if (V2._f3ro) V2._f3ro.disconnect();
  V2._f3w = w; V2._f3ro = new ResizeObserver(() => requestAnimationFrame(V2.f3After)); V2._f3ro.observe(w); };
addEventListener('resize', () => { if (V2.f3After) requestAnimationFrame(V2.f3After); });
// the static words (Job W, alt/prerender-home): this Home's h1 and line, when that build step is there
V2.f3Seo = () => { const D = V2.f3Data(), W = V2.f3Words(D); return {h1: `Sharply raise your win rate. Rate your Pokémon Champions team ${W.before ? 'before' : 'for'} Reg M-D.`, intro: (document.querySelector('#main .f3-lead') || {}).textContent || ''}; };
