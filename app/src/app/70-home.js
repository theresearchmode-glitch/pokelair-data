/* ===== Home, one stage (Nov 3, Sim: "still busy and long") =====
   One clear stage and calm everything else, about 2.5 phone screens:
   (a) the headline and the data line; (b) ONE stage in the My team style: your team (plan colour, name, "93 / Grade A", the
   two leads in front, the back pair behind; tap it for My team), or with no team today's #1 rated Pokémon; under it the one
   yellow button and the other starting paths as a quiet row; (c) the latest champion's six as a soft card, red only as a
   small accent; (d) top of the meta as three small type stages; (e) the tools as a compact grid; (f) What's new and More on
   Home as one small line. Nothing is deleted: the old ratings list (with Hidden gems), the week teaser, pairs, trends,
   cores and your battles are inside More on Home; every button that was on the old cards is on the new ones.
   The old Home is drawn first (its wrappers keep working), then its pieces are moved into this layout. */
/* three small type stages: the top of the meta */
STG.homeMinis = () => { const rows = lairRows().slice(0, 3); return rows.map((x, i) => { const p = x.p, t = STG.sheetType(p), T = lTier(x.r.total);
  return `<button type="button" class="nhmini" data-lt="${esc(p.n)}" style="${STG.vars(t)}" aria-label="${esc(p.d)}, rated ${RS(x.r.total)}, ${rankTxt(p) || '#' + (i + 1)}: open its info"><span class="stg-pat ${STG.pat(t)}" aria-hidden="true"></span>${sprite(p) || ''}<b class="stgnum">${RS(x.r.total)}</b><span class="nhmn">${escName(p.d)}</span><span class="nhmt">${T.k} tier · ${rankTxt(p, 1) || '#' + (i + 1)}</span></button>`; }).join(''); };
/* Which phone hero: 'new' (compact headline, one yellow button, quiet links, soft champion card) or 'v79' (the stacked
   your-six and champion's-six cards, as on desktop). Sim may switch phones back to the v79 cards: change this one value.
   Desktop always keeps the v79 6v6 hero (your six | Plot your win | the champion's six). The team stage is on My team only. */
STG.HOME_PHONE = 'new';
STG.home = () => { const el = $('homeOut'); if (!el || el.querySelector(':scope > .nh')) return; const ms = members(), has = ms.length > 0, v79 = STG.HOME_PHONE === 'v79';
  const hero = el.querySelector('.chmhero'), them = el.querySelector('.chmcard.them'), you = el.querySelector('.chmcard.you');
  const nh = document.createElement('div'); nh.className = 'nh' + (v79 ? ' nh79' : '');
  const a = document.createElement('section'), b = document.createElement('section'), c = document.createElement('section');
  if (!v79) {
    /* (a) the headline */
    a.className = 'nhhead'; if (hero) [...hero.children].filter(x => !x.matches('.npaths,.chmacts,.npb')).forEach(x => a.append(x));
    /* (b) the one yellow button and the other starting paths as a quiet row */
    b.className = 'nhmain';
    const P = [['auto', 'Build me a team'], ['report', has ? 'Grade my team' : 'Grade a team'], ['matchup', 'Plan a matchup'], ['build', has ? 'Edit my six' : 'Start from scratch']];
    const main = has ? ['report', 'Open my team'] : ['auto', 'Build me a team'];
    b.innerHTML = `<button type="button" class="chprimary nhgo" data-view="${main[0]}">${main[1]} <span aria-hidden="true">➜</span></button>
      <nav class="nhpaths" aria-label="Other ways to start">${P.filter(x => x[0] !== main[0]).map(([v, t]) => `<button type="button" data-view="${v}">${t}</button>`).join('')}</nav>`;
    /* (c) the champion's six, compact: their event line and six, NastyPlot's pick vs them, and their buttons */
    c.className = 'nhchamp';
    if (them) { const k = them.querySelector('.chk'), who = them.querySelector('.chmwho'), grid = them.querySelector('.chmgrid'), row = them.querySelector('.chmrow');
      c.innerHTML = `<div class="nhch"><span class="nhdot" aria-hidden="true"></span><div><div class="nhct">The champion's six</div><div class="nhcs"></div></div></div>`;
      if (k) c.querySelector('.nhcs').textContent = k.textContent; if (who) c.append(who); if (grid) { grid.classList.add('nhsix'); c.append(grid); }
      const pick = has && you && [...you.querySelectorAll('.chmwho')].find(x => /pick vs/.test(x.textContent)), prep = you && you.querySelector('[data-evvs]');
      if (pick) { pick.classList.add('nhpick'); c.append(pick); }
      if (row) { if (prep) { prep.textContent = 'Prep vs them ›'; row.prepend(prep); } c.append(row); } } }
  /* (d) top of the meta */
  const d = document.createElement('section'); d.className = 'nhtop'; d.innerHTML = `<div class="nhsh"><h3>Top of the meta</h3><button type="button" class="linkbtn" data-view="ratings">All ratings ›</button></div><div class="nhminis">${STG.homeMinis()}</div>`;
  /* (e) the tools */
  const e = document.createElement('section'); e.className = 'nhtools'; const tools = el.querySelector('.chhtools');
  if (tools) { const tiles = tools.querySelector('.htiles'), more = tools.querySelector('.npmore'); e.innerHTML = '<div class="nhsh"><h3>Tools</h3></div>'; if (more) e.querySelector('.nhsh').append(more); if (tiles) e.append(tiles); tools.remove(); }
  /* (f) What's new and More on Home, one small line; the old long sections go inside More on Home */
  const f = document.createElement('section'); f.className = 'nhfoot';
  const wnew = el.querySelector('#wnewCard'), welcome = el.querySelector('.chpad'), folds = el.querySelector('.chfolds'), moreD = folds && folds.querySelector('details');
  if (moreD) { const body = moreD.querySelector('.chbody') || moreD; const top = el.querySelector('.chhtop'), wk = el.querySelector('.wkhome');
    if (wk) body.prepend(wk); if (top) body.prepend(top); }
  if (wnew) f.append(wnew); if (folds) f.append(folds);
  if (welcome) welcome.classList.add('nhwelcome');
  if (!v79) nh.append(a, b); if (welcome && welcome.textContent.trim()) nh.append(welcome); if (!v79 && them) nh.append(c); nh.append(d, e, f);
  /* phones: the stacked v79 cards go (unless v79); desktop's 6v6 hero (.chsplit) stays above */
  if (!v79) el.querySelectorAll(':scope > .chmh').forEach(x => x.remove());
  const split = el.querySelector(':scope > .chsplit'), stack = el.querySelector(':scope > .chmh'), at = split || stack;
  if (at) at.after(nh); else el.prepend(nh); };
CH.wrap('renderHome', () => STG.home());
/* ===== Shorter long pages (Nov 3, Sim: about 3 phone screens) =====
   Lower sections fold behind a tap (a details fold: keyboard and screen readers open it like any button; it remembers being
   open). Nothing is removed. My team: the open team sheet ("Your six") folds, since tapping a Pokémon on the stage shows
   its set and the sheet stays one tap away. This week: the first two cards stay open, the rest fold under their titles. */
CH.wrap('chTeamRender', () => { const b = document.querySelector('#chP4 > .chpartb'); if (!b || b.closest('details.chsec') || !members().length) return;
  CH.foldNode(b, 'rsix', 'Open team sheet', 'Every set in full · tap one to edit it', false); });
CH.wrap('renderWeekly', () => { const pane = document.querySelector('[data-pane="weekly"]'); if (!pane) return;
  [...pane.querySelectorAll('section.wkcard')].slice(2).forEach(c => { if (c.closest('details.chsec')) return; const h = c.querySelector('.wkt'), t = h ? h.textContent : 'More';
    const d = CH.foldNode(c, 'wk-' + t.toLowerCase().replace(/\W+/g, '-'), t, '', false); if (d && h) h.hidden = true; }); });
/* My team · Threats: the top 4 show, the other 6 of the top 10 wait behind "Show all 10" (phones only; desktop has room) */
CH.wrap('chTeamRender', () => { const L = document.querySelector('#chThrTop .chtl10'); if (!L || L.dataset.stgfold || !(typeof matchMedia === 'function' && matchMedia('(max-width:999px)').matches)) return;
  const rows = [...L.children]; if (rows.length <= 4) return; L.dataset.stgfold = '1'; rows.slice(4).forEach(r => { r.hidden = true; });
  const b = document.createElement('button'); b.type = 'button'; b.className = 'linkbtn stgmore'; b.setAttribute('aria-expanded', 'false'); b.textContent = `Show all ${rows.length}`;
  b.addEventListener('click', () => { rows.forEach(r => { r.hidden = false; }); b.remove(); }); L.after(b); });
