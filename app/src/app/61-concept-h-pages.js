// ---------- Concept H, the other pages (Oct 28) ----------
// Calm, not busy: each page leads with big sprites and one clear action; the dense tools sit in folds. The original
// renderers still build every number and control; these wrappers only rearrange and restyle what they draw, so nothing
// is lost and the logic stays in one place.
CH.wrap = (name, after) => { try { const old = eval(name); if (typeof old !== 'function') return; const fn = function () { const r = old.apply(this, arguments); safe('concept h ' + name, () => after.apply(this, arguments)); return r; }; eval(name + ' = fn'); } catch (e) {} };
// fold an existing node in place (keeps its id and handlers)
CH.foldNode = (node, key, title, sub, open) => { if (!node || node.closest('details.chsec')) return null; const w = document.createElement('div'); w.innerHTML = CH.fold(key, title, sub, '', open); const d = w.firstElementChild; node.before(d); d.querySelector('.chbody').append(node); return d; };
// one title per page: the small label above the heading never repeats the page's own name
CH.kick = (kicker, title) => { const tt = String(title).replace(/<[^>]+>/g, '').toLowerCase(), k = String(kicker).split(' · ');
  if (k.length > 1 && tt.includes(k[0].trim().toLowerCase())) k.shift(); const s = k.join(' · '); return s.charAt(0).toUpperCase() + s.slice(1); };
CH.head = (kicker, title, sub) => `<div class="chpghead"><div class="chk">${CH.kick(kicker, title)}</div><div class="chdisp chpgt" role="heading" aria-level="2">${title}</div>${sub ? `<p class="chpgs">${sub}</p>` : ''}</div>`;
// ---------- Build me a team ----------
function chBuildInit() { const sec = $('autobuild'); if (!sec || sec.dataset.ch) return; sec.dataset.ch = '1';
  const hero = sec.querySelector('.abhero'); if (hero) { hero.classList.add('chabhero'); const h = hero.querySelector('h2'), p = hero.querySelector('.hint');
    if (h) h.outerHTML = `<div class="chk">Build · real winning teams</div><div class="chdisp chpgt" role="heading" aria-level="2">Build me a team</div>`; if (p) p.className = 'chpgs';
    const go = $('abBtn'); if (go) { go.className = 'chprimary'; go.innerHTML = 'Build me a team <span aria-hidden="true">➜</span>'; } } }
CH.wrap('renderAutoBuild', () => { chBuildInit(); const el = $('abOut'); if (!el) return;
  // before building: the explainer folds away; recent winners show as big-sprite sheets
  const what = el.querySelector('.abwhat'); if (what) CH.foldNode(what, 'abhow', 'How it works', 'Six that work together, the why, and how ready they are', false);
  // a built team: the six as big sprites on a blue halftone card; the full sets and roles fold underneath
  el.querySelectorAll('.abcol').forEach(col => { const mons = col.querySelector('.abmons'); if (!mons || col.querySelector('.chabsix')) return;
    const names = [...mons.querySelectorAll('.abname')].map(n => n.firstChild ? n.firstChild.textContent.trim() : n.textContent.trim());
    const imgs = [...mons.querySelectorAll('.abmon img.spr')].map(i => i.getAttribute('src'));
    const head = col.querySelector('.abhead'), lab = head ? [...head.querySelectorAll('.archchips .tag, .archchips span')].map(x => x.textContent.trim()).filter(Boolean).slice(0, 2).join(' · ') : '';
    const six = document.createElement('div'); six.className = 'chabsix chhalf';
    six.innerHTML = `<div class="chk" style="color:#fff">${col.querySelector('.tag.box') ? esc(col.querySelector('.tag.box').textContent) : col.querySelector('.tag.offmeta') ? 'Fresh take' : 'Your build'}</div><div class="chabt">${esc(lab || 'Your six')}</div>
      <div class="chabg">${names.map((n, i) => `<div>${imgs[i] ? `<img class="spr" src="${esc(imgs[i])}" alt="">` : ''}<span>${esc(n)}</span></div>`).join('')}</div>`;
    (head || mons).before(six); CH.foldNode(mons, 'absets', 'Sets and roles', 'Items, abilities, roles and ratings for each of the six', false); }); });
// ---------- Battle mode: team preview ----------
function chOppName() { const opp = S.opp.filter(Boolean); if (opp.length < 6) return null; const E = META.events; if (!E || !Array.isArray(E.events)) return null;
  for (const e of E.events) for (const t of e.top || []) if (t && t.mons && t.mons.length === 6 && t.mons.every(m => opp.includes(m.n))) return {who: t.player, rec: t.record, place: t.place, ev: e}; return null; }
CH.wrap('renderBattle', () => { const el = $('bmOut'); if (!el) return; const sec = $('matchup'); if (sec) sec.classList.add('chbm');
  const mine = members(), on = chOppName(), title = mine.length ? teamTitleFor(mine) : 'Your team';
  // their side is named by what it runs (Rain · Tailwind, Trick Room…), not by the player
  const theirs = S.opp.map(n => byName.get(n)).filter(Boolean); let arch = ''; try { const a = theirs.length >= 3 ? teamArchetype(theirs.map(oppMember)) : null; arch = a && a.label ? a.label : ''; } catch (e) {}
  const ord = n => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : n + 'th';
  const head = document.createElement('div'); head.className = 'chbmhead';
  head.innerHTML = `<div class="chk">${on ? 'Their real open team sheet' : 'Team preview'}</div><div class="chdisp chbmt" role="heading" aria-level="2"><span>${esc(title)}</span> <small>vs</small> <em>${arch ? esc(arch) : 'their six'}</em></div>
    ${on ? `<p class="chpgs"><b>${esc(on.who)}</b>${on.rec ? ` went <b>${esc(on.rec)}</b>${on.place ? ` and finished ${ord(on.place)}` : ''}` : on.place ? ` finished ${ord(on.place)}` : ' played this team'} at ${esc(on.ev.name)}${on.ev.players ? ` (${on.ev.players} players)` : ''}.</p>` :'<p class="chpgs">Type their six as you see them at team preview.</p>'}`;
  const bar = el.querySelector('.bmbar'); if (bar) head.append(bar);
  // the heading first, then the opponent picker, then their six (the picker lives outside the redrawn area)
  const oq = $('oppQuick'); if (oq && sec) { sec.querySelectorAll(':scope > .chbmhead').forEach(x => x.remove()); oq.before(head); } else el.prepend(head);
  const opp = el.querySelector('.bmopp'); if (opp) { opp.classList.add('chhalf'); opp.insertAdjacentHTML('beforebegin', '<div class="chk chbmk">Their six</div>'); }
  // bring these four: the planner's pick, its two leads up front
  const bring = el.querySelector('.bmcard[data-t="plan"]'); if (bring && bring.querySelector('.bmpicks')) { bring.classList.add('chbring');
    const ph = bring.querySelector('.ph'); if (ph) ph.outerHTML = `<div class="chk">NastyPlot's pick · vs this six</div><div class="chdisp chbringt">Bring these four. <span>Lead the pair.</span></div>`;
    bring.querySelectorAll('p.t2').forEach(p => { if (/likely lead/i.test(p.textContent)) p.classList.add('chpen'); });
    // the reasons: the biggest things to watch on their side, as numbered lines (from the same watch list)
    const ws = [...el.querySelectorAll('.bmcard .bmw')].flatMap(w => { const n = w.querySelector('b'); return [...w.querySelectorAll('.bmwl')].map(l => ({n: n ? n.textContent : '', hi: !!l.querySelector('.sev.hi'), t: (l.querySelector('.sev') || {}).textContent || '', d: (l.querySelector('.t2') || {}).textContent || ''})); });
    const seen = new Set(), top = ws.sort((a, b) => b.hi - a.hi).filter(x => !seen.has(x.t) && seen.add(x.t)).slice(0, 2); if (top.length) bring.insertAdjacentHTML('beforeend', `<ol class="chreasons">${top.map(x => `<li><b>${esc(x.n)}: ${esc(x.t)}</b> ${esc(x.d)}</li>`).join('')}</ol>`); }
  // watch out folds (it's long); the turn-1 plan reads as a panel
  const watch = [...el.querySelectorAll('.bmcard[data-t="plan"]')].find(c => c.querySelector('.bmw') || /Nothing on their side/.test(c.textContent));
  if (watch) { const n = watch.querySelectorAll('.bmw').length, ph = watch.querySelector('.ph'); if (ph) ph.remove(); const wrap = document.createElement('div'); wrap.dataset.t = 'plan'; wrap.className = 'chbmfold'; watch.before(wrap); wrap.append(watch); watch.removeAttribute('data-t');
    CH.foldNode(watch, 'bmwatch', 'Watch out', n ? `${n} of their six can shut something down` : 'Nothing on their side shuts down your four', false); }
  const t1 = el.querySelector('.bmt1'); if (t1) t1.classList.add('chpanel');
  // desktop: turn 1 and watch out stack beside the pick, so neither column leaves a hole
  { const wf = el.querySelector('.chbmfold'), bc = el.querySelector('.chbring'); if (bc && (t1 || wf)) { const side = document.createElement('div'); side.className = 'chbmside'; side.dataset.t = 'plan'; bc.after(side); if (t1) side.append(t1); if (wf) side.append(wf); } }
  const sp = el.querySelector('.bmcard[data-t="speed"] .ph .pt'); if (sp) sp.textContent = 'Who moves first';
  const dm = el.querySelector('.bmcard[data-t="dmg"] .ph .pt'); if (dm) dm.textContent = 'Damage both ways';
  const bl = battlelog; if (bl && !bl.closest('details.chsec')) { const L = Array.isArray(S.log) ? S.log : [], w = L.filter(x => x.r === 'W').length; CH.foldNode(bl, 'bmlog', 'Battle log', L.length ? `– ·  logged · log this game` : 'Log this game after the match', false); } });
// ---------- Ratings: the hot list ----------
function chHotHtml() { const rows = lairRows(); if (rows.length < 8) return ''; const top = rows.slice(0, PHONE() ? 16 : 20);
  const tour = x => (x.r.src && x.r.src.tour) || null, line = x => { const t = tour(x); return t ? `${(+t[0]).toFixed(1)}% use · ${(+t[1]).toFixed(1)}% win` : `★ ${x.r.total}`; };
  const big = (x, c) => `<button type="button" class="chhot ${c} chhalf" data-lt="${esc(x.p.n)}" aria-label="${esc(x.p.d)}, rated ${x.r.total}"><span class="n">${x.r.total}</span><span class="nm">${esc(x.p.d)}</span><span class="st">${line(x).replace(' · ', '<br>')}</span>${sprite(x.p) || ''}</button>`;
  const T = lTier(top[0].r.total), nS = rows.filter(x => x.r.total >= T.min).length, tie = top[0].r.total === top[1].r.total;
  return `<div class="chhothead"><span class="chtier">${T.k}</span><span class="chk">${T.min}+ · ${nS} Pokémon</span>${tie ? '<span class="chpen" style="margin-left:auto">Tied for #1!</span>' : ''}</div>
    <div class="chhot2">${big(top[0], 'ink')}${big(top[1], 'blue')}</div>
    <div class="chhotrows">${top.slice(2).map((x, i) => `${(() => { const t = lTier(x.r.total), pv = lTier(top[i + 1].r.total); return t.k !== pv.k ? `<div class="chtierdiv"><span class="chtier sm">${t.k}</span><span class="chk">${t.min}+ · ${rows.filter(y => lTier(y.r.total).k === t.k).length} Pokémon</span></div>` : ''; })()}<button type="button" class="chhr" data-lt="${esc(x.p.n)}"><span class="rk">${i + 3}</span>${sprite(x.p) || ''}<span class="chbd"><b>${esc(x.p.d)}</b><span>${line(x)}</span></span><span class="sc">${x.r.total}</span></button>`).join('')}</div>`; }
CH.wrap('renderLair', bodyOnly => { const sec = $('lair'); if (!sec) return; sec.classList.add('chlair');
  if (!sec.querySelector('.chpghead')) { const pf = activePerf(); sec.querySelector('.head').insertAdjacentHTML('afterend', CH.head(`Rated 0–100 from real results · Reg M-C doubles${pf && pf.updated ? ' · data from ' + esc(pf.updated) : ''}`, 'Pokémon', ''));
    const hero = $('lairHero'); const f = CH.foldNode(hero, 'lairabout', 'About the ratings', 'How they are made, sources and their track record', false);
    if (f) { const b = f.querySelector('.chbody'); sec.querySelectorAll('.head .hint, #ratingTrack').forEach(p => b.prepend(p)); }
    // search and filters first, then the top of the list
    const hot = document.createElement('div'); hot.id = 'chHot'; const cnt = $('lairCount'); (cnt || f || hero).after(hot); }
  // the date line is rebuilt on every render: the first render can run before today's data has loaded (Oct 29 fix)
  { const k = sec.querySelector(':scope > .chpghead .chk'), pf = activePerf(); if (k) { let d = pf && pf.updated ? String(pf.updated).slice(0, 10) : '';
      try { if (d) d = new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); } catch (e) {}
      k.textContent = `Rated 0–100 from real results · Reg M-C doubles${d ? ' · updated ' + d : ''}`; } }
  const hot = $('chHot'); const filtered = !!((ui.lq || '').trim() || (ui.lty || []).length || Object.values(ui.lf || {}).some(Boolean));
  if (hot) { hot.hidden = filtered; if (!filtered && !bodyOnly) hot.innerHTML = chHotHtml(); }
  // the full board under the hot list, folded until you search or filter
  const body = $('lairBody'); if (body && !body.closest('details.chsec')) { const d = CH.foldNode(body, 'lairboard', 'Every Pokémon, by tier', `${lairRows().length} rated, S to E`, false); if (d) d.id = 'chBoard'; }
  const d = $('chBoard'); if (d && filtered) d.open = true; });
document.addEventListener('input', e => { if (e.target && e.target.id === 'lairQ') { const d = $('chBoard'); if (d) d.open = true; } });
// ---------- the Pokémon sheet: big sprite hero, three numbers, moves, items, brought with ----------
CH.wrap('lairSheet', n => { const sh = $('lairSheet'), p = byName.get(n); if (!sh || !p || sh.hidden) return; const panel = sh.querySelector('.lspanel'); if (!panel || panel.querySelector('.chls')) return;
  const r = rating(p), T = lTier(r.total), src = r.src || {}, st = setFor(p) || {}, all = lairRows(), pos = all.findIndex(x => x.p.n === p.n) + 1;
  const bars = (arr, cls, k) => (arr || []).slice(0, k).map(([nm, v]) => `<div class="chbar"><span>${esc(nm)}</span><i class="${cls}"><em style="width:${Math.max(2, Math.min(100, +v || 0))}%"></em></i><b>${(+v).toFixed(1)}%</b></div>`).join('');
  const bw = RES && RES.tc && RES.tc.bw ? RES.tc.bw[brKeyOf(p)] : null, games = bw ? null : null;
  const head = panel.querySelector('.lshead'); if (head) { head.classList.add('chls', 'chhalf'); head.insertAdjacentHTML('beforeend', `<div class="chlsk">#${pos} of ${all.length} · ${T.k} tier</div>`); }
  const stats = `<div class="chlstats"><div><b>${r.total}</b><span>Rating · ${T.k}</span></div><div><b>${src.tour ? (+src.tour[0]).toFixed(1) + '%' : '–'}</b><span>of teams</span></div><div><b>${src.tour ? (+src.tour[1]).toFixed(1) + '%' : '–'}</b><span>win rate${src.tour ? ` · ${(+src.tour[2]).toLocaleString('en-US')} games` : ''}</span></div></div>`;
  const ab = st.ab && st.ab[0] ? `Ability: ${esc(st.ab[0][0])} ${(+st.ab[0][1]).toFixed(1)}%` : '';
  const mv = st.mv && st.mv.length ? `<div class="chk">Moves</div>${bars(st.mv, 'b', 5)}` : '', it = st.it && st.it.length ? `<div class="chk" style="margin-top:12px">Items${ab ? ' · ' + ab : ''}</div>${bars(st.it, 'r', 3)}` : '';
  const with_ = bw && bw.length ? `<div class="chk" style="margin-top:12px">Brought with · Showdown replays</div><div class="chbw">${bw.filter(x => byName.get(x[0])).slice(0, 4).map(x => `<button type="button" data-lt="${esc(x[0])}" title="When both are on the team, ${esc(p.d)} and ${esc(byName.get(x[0]).d)} are brought together ${x[1]}% of the time (${x[2]} games)">${sprite(byName.get(x[0])) || ''}<b>${x[1]}%</b><span>${(+x[2]).toLocaleString('en-US')} games</span></button>`).join('')}</div><p class="t2" style="margin:4px 0 0">% = brought together when both are on the team.</p>` : '';
  const body = panel.querySelector('.lsbody'); if (!body) return; body.insertAdjacentHTML('afterbegin', stats + `<div class="chlsdata">${mv}${it}${with_}</div>`);
  // the deeper sections fold (same content)
  body.querySelectorAll(':scope > .lsec').forEach((s, i) => { const h = s.querySelector('h4'); if (!h) return; const t = h.textContent; h.remove(); const w = document.createElement('div'); w.innerHTML = `<details class="chsec chfold"><summary>${CH.tog()}<div style="flex:1;min-width:0"><div class="cht">${esc(t)}</div></div></summary><div class="chbody"></div></details>`; const d = w.firstElementChild; s.before(d); d.querySelector('.chbody').append(s); });
  const act = body.querySelector('.lsact'); if (act) body.append(act); });
// ---------- Rankings: the first ten, the rest folded ----------
CH.wrap('renderMeta', () => { const el = $('metaList'); if (!el) return; const rows = [...el.querySelectorAll(':scope > .mrow')], sec = $('meta'); if (sec) sec.classList.add('chmeta');
  let b = $('chMetaMore'); if (rows.length <= 12) { if (b) b.remove(); return; }
  if (ui.chMetaAll == null) ui.chMetaAll = false; rows.forEach((r, i) => r.classList.toggle('chhid', i >= 10 && !ui.chMetaAll));
  if (!b) { b = document.createElement('button'); b.type = 'button'; b.id = 'chMetaMore'; b.className = 'chsec chmorebtn'; el.after(b); b.addEventListener('click', () => { ui.chMetaAll = !ui.chMetaAll; renderMeta(); }); }
  b.setAttribute('aria-expanded', ui.chMetaAll ? 'true' : 'false');
  b.innerHTML = `<span class="chtog${ui.chMetaAll ? ' open' : ''}" aria-hidden="true">${CH.tog().replace(/^<span class="chtog" aria-hidden="true">|<\/span>$/g, '')}</span><span style="flex:1;text-align:left"><span class="cht">${ui.chMetaAll ? 'Show the top 10' : `Ranks 11–${rows.length}`}</span><span class="chs">${ui.chMetaAll ? 'Fold the rest away' : 'The rest of the list'}</span></span>`;
  // the "also ranked" name list belongs to the rest of the list: it shows with ranks 11+, after them
  if (sec) [...sec.querySelectorAll('p, div.t2')].filter(p => /^Also ranked/.test(p.textContent.trim())).forEach(p => { p.hidden = !ui.chMetaAll; if (ui.chMetaAll) el.after(p); else b.after(p); }); });
CH.wrap('renderMeta', () => CH.pagehead($('meta'), 'Usage · how often each Pokémon is picked', 'Usage', ''));// ---------- Cores: the top three as big cards, the explainer folded ----------
CH.wrap('renderCores', () => { const el = $('coreOut'); if (!el) return; const sec = $('cores'); if (sec) sec.classList.add('chcores');
  const intro = el.querySelector('.coreintro'); if (intro) CH.foldNode(intro, 'coreabout', 'How cores are ranked', 'Win rate pulled toward the average, from real tournament teams', false);
  const rows = [...el.querySelectorAll('.corelist .corerow')]; rows.forEach((r, i) => { if (i < 3) r.classList.add('chcbig'); });
  if (rows.length > 4) { const rest = document.createElement('div'); rest.className = 'corelist'; rows.slice(3).forEach(r => rest.append(r)); const mb = el.querySelector(':scope > .morebar'); if (mb) rest.append(mb); const w = document.createElement('div'); w.innerHTML = CH.fold('coremore', `More cores`, `#4 to #${rows.length}${mb ? ' and Show more' : ''}`, '', false); const d = w.firstElementChild; d.querySelector('.chbody').append(rest); el.querySelector('.corelist').after(d); } });
// ---------- shared: show the first n of a long list, the rest one tap away (rows stay in place) ----------
CH.more = (box, sel, n, key, label) => { if (!box) return; const items = [...box.querySelectorAll(sel)]; let b = box.parentNode && box.parentNode.querySelector(`:scope > [data-chmore="${key}"]`);
  if (items.length <= n) { items.forEach(x => x.classList.remove('chhid')); if (b) b.remove(); return; }
  ui.chMore = ui.chMore || {}; const all = !!ui.chMore[key]; items.forEach((x, i) => x.classList.toggle('chhid', i >= n && !all));
  if (!b) { b = document.createElement('button'); b.type = 'button'; b.className = 'chsec chmorebtn'; b.dataset.chmore = key; box.after(b); b.addEventListener('click', () => { ui.chMore[key] = !ui.chMore[key]; CH.more(box, sel, n, key, label); }); }
  b.setAttribute('aria-expanded', all ? 'true' : 'false');
  b.innerHTML = `<span class="chtog${all ? ' open' : ''}" aria-hidden="true">${CH.tog().replace(/^<span class="chtog" aria-hidden="true">|<\/span>$/g, '')}</span><span style="flex:1;text-align:left"><span class="cht">${all ? 'Show fewer' : `${items.length - n} more ${label}`}</span><span class="chs">${all ? 'Fold the rest away' : `Showing ${n} of ${items.length}`}</span></span>`; };
CH.pagehead = (sec, kicker, title, sub) => { if (!sec || sec.querySelector(':scope > .chpghead')) return; const h = sec.querySelector(':scope > .head'); const w = document.createElement('div'); w.innerHTML = CH.head(kicker, title, sub); if (h) h.before(w.firstElementChild); else sec.prepend(w.firstElementChild); sec.classList.add('chpg'); };
// ---------- Damage calc: attacker vs defender as two cards, set details folded ----------
CH.wrap('renderCalc', () => { const el = $('dcOut'), sec = $('dmgcalc'); if (!el) return; CH.pagehead(sec, 'Damage calc · common sets, auto-filled', 'Damage calc', '');
  el.querySelectorAll('.dccol').forEach((col, i) => { if (col.querySelector('.chdcband')) return; const h = col.querySelector('h3'), sp = col.querySelector('.dcspr'), sel = col.querySelector('select'), name = sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : '';
    const nat = col.querySelector('#dcANat,#dcDNat'), ab = col.querySelector('#dcAAb,#dcDAb'), band = document.createElement('div'); band.className = 'chdcband chhalf ' + (i ? 'def' : 'atk');
    band.innerHTML = `<div class="nm">${esc(name)}</div><div class="sub">${esc([nat && nat.value, ab && ab.value].filter(Boolean).join(' · '))}</div>`;
    if (sp) band.prepend(sp); if (h) { h.classList.add('chk'); band.prepend(h); } col.prepend(band);
    const det = [...col.querySelectorAll(':scope > .dc2, :scope > label')].filter(x => !x.querySelector('#dcA,#dcD,#dcMv'));
    if (det.length) { const w = document.createElement('div'); det[0].before(w); det.forEach(x => w.append(x)); CH.foldNode(w, 'dcset' + i, 'Set details', 'Points, nature, item, ability, stat stage', false); } });
  const root = sec || el, hd = [...root.querySelectorAll('h2,h3,h4')].find(x => /best hit/i.test(x.textContent) && !x.closest('details.chsec'));
  if (hd) { let box = hd; while (box.parentElement && box.parentElement !== el && box.parentElement !== root) box = box.parentElement; if (box === hd) { const w = document.createElement('div'); hd.before(w); let n = hd; while (n) { const nx = n.nextElementSibling; w.append(n); n = nx; } box = w; } if (box && !box.closest('details.chsec')) { const t = hd.textContent; CH.foldNode(box, 'dctable', t, 'Max roll against the usual sets of the top threats', false); } } });
// ---------- Speed: who moves first ----------
CH.wrap('renderSpeed', () => { const el = $('spdOut'), sec = $('speedtiers'); if (!el) return; CH.pagehead(sec, 'Speed tiers · level 50', 'Who moves <span style="color:var(--chblueT)">first.</span>', '');
  const sums = el.querySelector('.spdsums'); if (sums && !sums.closest('details.chsec')) { const n = sums.querySelectorAll('.spdsum').length; CH.foldNode(sums, 'spdsum', 'Your six vs the field', `How many of the top 20 each of your ${n} moves first against`, false); }
  el.querySelectorAll('.spdrow .spdn .t2').forEach(t => { const r = t.closest('.spdrow'); if (r && !r.title) r.title = t.textContent;
    // the note under the list already says their spreads are the most common ones; each row stays one line
    if (/most common spread/.test(t.textContent)) t.innerHTML = t.innerHTML.replace(/ ?\(most common spread\)/g, ''); }); });
// ---------- Gauntlet ----------
CH.wrap('renderGauntlet', () => { const el = $('gauntOut'), sec = $('gauntlet'); if (!el) return; CH.pagehead(sec, 'Gauntlet · the latest top tournament teams', 'Run the gauntlet.', '');
  const intro = el.querySelector(':scope > p.t2'); if (intro && !intro.closest('details.chsec')) CH.foldNode(intro, 'gintro', 'How it works', 'Same calcs as your scouting report, both ways', false);
  CH.more(el.querySelector('.glist'), ':scope > .gitem', 3, 'gaunt', 'teams'); });
// ---------- Teams and Events: big-sprite team sheets, the first few shown ----------
CH.wrap('renderTeamSearch', () => { const sec = $('topteams'); CH.pagehead(sec, 'Tournaments · real top-cut team sheets', 'Winning teams', ''); chTeamsMore(); });
function chTeamsMore() { const L = $('ttList'); if (!L) return; const kids = [...L.children], cards = kids.filter(x => x.classList.contains('ttcard')); if (cards.length < 5) return; CH.more(L, ':scope > *', kids.indexOf(cards[2]) + 1, 'ttlist', 'teams and sections'); }
CH.wrap('renderTopTeams', () => safe('teams more', chTeamsMore));
CH.wrap('renderEvents', () => { const sec = $('events'); CH.pagehead(sec, 'Events · recent tournaments', 'Events', ''); });
// ---------- batch 4: Best additions, Types, Sets, Saved teams, Box, Archetypes ----------
// Swaps: one-Pokémon additions first, then the bigger fix plans (the checklist lives on the scouting report)
CH.wrap('renderRecs', () => { const sec = $('recs'); CH.pagehead(sec, 'Every swap and plan for your team', 'All suggestions', '');
  const pr = $('princ'); if (pr) pr.hidden = true; if (sec) sec.classList.add('chswaps');
  const g = sec && sec.querySelector('.recgrid'); if (g && !sec.querySelector('.chswk')) g.insertAdjacentHTML('beforebegin', '<h3 class="chswk">One Pokémon in, one out</h3>');
  CH.more($('recList'), ':scope > *', 3, 'recs', 'swaps'); chPlansDedup(); });
// a one-change plan that is already a swap card above is shown once (the swap card); the rest are renumbered
function chPlansDedup() { const el = $('sugs'); if (!el) return; const R = new Set((ui.recs || []).map(pl => { const x = pl.ch && pl.ch[0]; return x ? (x.out ? x.out.d : '') + '>' + x.c.p.d : ''; }));
  let j = 0; el.querySelectorAll(':scope > .plan').forEach(c => { const sw = c.querySelectorAll('.swap'); let dup = false;
    if (sw.length === 1) { const o = sw[0].querySelector('.out'), i = sw[0].querySelector('.in'); dup = R.has((o ? o.textContent : '') + '>' + (i ? i.textContent : '')); }
    c.classList.toggle('chdup', dup); if (dup) return; j++; const pt = c.querySelector('.pt'); if (pt) pt.textContent = pt.textContent.replace(/^(Plan|Idea|Side-grade) \d+/, `$1 ${j}`);
    const b = c.querySelector('[data-plan]'); if (b && /plan \d+/.test(b.textContent)) b.textContent = 'Apply plan ' + j; });
  const t = $('sugTitle'); if (t && t.textContent === 'Fix plans') t.textContent = 'Bigger plans';
  let n = $('chPlanNone'); if (!j && el.querySelector('.plan')) { if (!n) { n = document.createElement('p'); n.id = 'chPlanNone'; n.className = 't2'; el.prepend(n); } n.textContent = 'Every one-change plan is a swap above. Tap More ideas for plans with two or more changes.'; } else if (n) n.remove(); }
CH.wrap('renderPlans', () => safe('plans dedup', chPlansDedup));
// All suggestions: the bigger plans sit in a fold under the swaps (Oct 29), so the page fits in about three phone screens
CH.wrap('renderPlans', () => { const ps = $('planSec'), fc = ps && ps.querySelector(':scope > .fixcol'); if (!fc || fc.closest('details.chsec')) return;
  const d = CH.foldNode(fc, 'bigplans', 'Bigger plans', 'Two or more changes at once', false); if (d) { const h = fc.querySelector(':scope > .head'); if (h) h.hidden = true; } });
CH.wrap('renderTypeChart', () => CH.pagehead($('types'), 'Type chart · what hits what', 'Type matchups', ''));
CH.wrap('renderSets', () => CH.pagehead($('sets'), 'Popular sets · what players run', 'Popular sets', ''));
CH.wrap('renderSaved', () => CH.pagehead($('saved'), 'Saved teams · in this browser', 'Saved teams', ''));
CH.wrap('renderBox', () => CH.pagehead($('box'), 'The Pokémon you own', 'My box', ''));
CH.wrap('renderGuides', () => CH.pagehead($('guides'), 'Archetypes · the team styles you will face', 'Archetypes', ''));
// ---------- round 5 ----------
// My box: the first 30, the rest one tap away
CH.wrap('renderBox', () => CH.more($('boxList'), ':scope > .boxchip', PHONE() ? 24 : 40, 'box', 'in your box'));
// Home: your six (columns) against the top 12 threats by top-cut share (rows, worst first)
CH.LVC = {win: ['var(--chok)', 'answers it'], trade: ['var(--chshaky)', 'partial answer'], lose: ['var(--chbad)', 'loses 1-on-1'], none: ['var(--line2)', 'no direct matchup']};
CH.cellOf = (r, m) => { const n = m.p.n, has = a => (a || []).some(x => x.m && x.m.n === n); return has(r.solid) ? 'win' : has(r.soft) ? 'trade' : has(r.losers) ? 'lose' : 'none'; };
CH.chart = (RD, ms, k = 12) => { if (!RD || !ms.length) return ''; const rows = RD.rows.slice().sort((a, b) => b.t.w - a.t.w).slice(0, k).sort((a, b) => a.level - b.level || b.t.w - a.t.w);
  return `<div class="chchart" role="table" aria-label="Your six against the top ${k} threats"><div class="chcr chch" role="row"><span role="columnheader"></span>${ms.map(m => `<span role="columnheader" title="${esc(m.d)}">${sprite(m.p) || esc(m.d.slice(0, 3))}</span>`).join('')}</div>
    ${rows.map(r => `<button type="button" class="chcr" role="row" data-chhthr="${esc(r.t.n)}" aria-label="${esc(r.t.d)}: ${CH.LV[r.level]}"><span class="th l${r.level}" role="rowheader">${sprite(byName.get(r.t.n)) || ''}<i>${esc(r.t.d)}</i></span>${ms.map(m => { const c = CH.cellOf(r, m); return `<span role="cell" class="cc ${c}" title="${esc(m.d)} vs ${esc(r.t.d)}: ${CH.LVC[c][1]}"></span>`; }).join('')}</button>`).join('')}</div>
    <div class="chleg">${Object.entries(CH.LVC).map(([, [c, t]]) => `<span><i style="background:${c}"></i>${t}</span>`).join('')}</div><p class="t2" style="margin:2px 0 0">Rows are the top ${k} threats by top-cut share, worst first. Tap one for the full matchup.</p>`; };
// Share card in Concept H (light and Warm charcoal)
CH.shareMode = null;
buildShareCard = async function () { const ms = members(); if (!ms.length) return null;
  const dark = (CH.shareMode || document.documentElement.dataset.look) === 'dark';
  const P = dark ? {paper: '#232120', ink: '#F3EBDC', mute: '#E6DDCD', blue: '#1E8FE8', red: '#FF3F5F', card: '#2C2A28', pen: '#7CC4FF', tile: '#171615', shadow: '#1E8FE8'} : {paper: '#F1E9DA', ink: '#1D2140', mute: '#4E5068', blue: '#0078BF', red: '#E8364F', card: '#FBF6EC', pen: '#005A90', tile: '#1D2140', shadow: '#0078BF'};
  try { await Promise.all(['400 80px Anton', '800 30px Archivo', '700 16px "Space Mono"', '400 40px "Permanent Marker"'].map(f => document.fonts.load(f, 'NASTYPLOT 0123%'))); } catch (e) {}
  const W = 1200, H = 675, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = P.paper; x.fillRect(0, 0, W, H);
  if (dark) { const g = x.createRadialGradient(600, -120, 0, 600, -120, 760); g.addColorStop(0, 'rgba(255,232,0,.10)'); g.addColorStop(1, 'rgba(255,232,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
  // logo tile + wordmark
  const logo = new Image(); logo.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(NP_SVG[dark ? 'hdrD' : 'hdrL']);
  await new Promise(r => { logo.onload = r; logo.onerror = r; }); try { x.drawImage(logo, 44, 34, 290, 290 * 196 / 761.34); } catch (e) {}
  x.textBaseline = 'alphabetic';
  // readiness, top right
  const RD = prepOf(ms); x.textAlign = 'right';
  if (RD) { x.font = '400 112px Anton, Impact, sans-serif'; const pw = x.measureText(RD.score + '%').width; x.fillStyle = P.shadow; x.fillText(RD.score + '%', 1150, 154); x.fillStyle = P.ink; x.fillText(RD.score + '%', 1144, 148);
    x.font = '700 20px "Space Mono", monospace'; x.fillStyle = P.mute; x.fillText('READY FOR THE TOP 30 THREATS', 1144, 184);
    x.save(); x.translate(1144 - pw - 70, 100); x.rotate(-.14); x.strokeStyle = P.pen; x.lineWidth = 5; x.beginPath(); x.arc(0, 0, 48, 0, Math.PI * 2); x.stroke(); x.font = '400 54px "Permanent Marker", cursive'; x.fillStyle = P.pen; x.textAlign = 'center'; x.fillText(CH.grade(RD.score), 0, 20); x.restore(); }
  x.textAlign = 'left';
  // team name with a riso offset
  const title = ((typeof teamTitleFor === 'function' ? teamTitleFor(ms) : '') || 'My team').toUpperCase(); let fz = 92;
  do { x.font = `400 ${fz}px Anton, Impact, sans-serif`; } while (x.measureText(title).width > 700 && --fz > 40); // stays clear of the readiness label on the right
  x.fillStyle = P.shadow; x.fillText(title, 62, 238); x.fillStyle = P.ink; x.fillText(title, 56, 232); // your team: ink with a blue offset (red is for opponents)
  x.font = '700 20px "Space Mono", monospace'; x.fillStyle = P.mute; x.fillText('POKÉMON CHAMPIONS · VGC DOUBLES · REG M-C · BRING 6 PICK 4', 58, 274);
  // the six on a blue halftone band
  const by = 296, bh = 316; x.fillStyle = P.blue; x.fillRect(0, by, W, bh); x.fillStyle = 'rgba(255,255,255,.22)'; for (let yy = by + 4; yy < by + bh; yy += 9) for (let xx = (yy / 9 % 2) * 4.5; xx < W; xx += 9) { x.beginPath(); x.arc(xx, yy, 1.4, 0, 7); x.fill(); }
  const src = id => (window.__SPR && window.__SPR[id]) || 'sp/' + id + '.webp';
  const imgs = await Promise.all(ms.slice(0, 6).map(m => { const id = typeof SPRITE_ID === 'object' && SPRITE_ID ? SPRITE_ID[m.p.n] : null; return id ? scImg(src(id)) : Promise.resolve(null); }));
  const cw = W / 6; ms.slice(0, 6).forEach((m, i) => { const cx = i * cw + cw / 2, im = imgs[i];
    x.fillStyle = 'rgba(0,0,0,.18)'; x.beginPath(); x.ellipse(cx, by + 238, 70, 12, 0, 0, 7); x.fill();
    if (im) { const s = Math.min(176 / im.width, 176 / im.height); x.save(); x.shadowColor = 'rgba(0,0,0,.3)'; x.shadowOffsetX = 3; x.shadowOffsetY = 4; x.drawImage(im, cx - im.width * s / 2, by + 246 - im.height * s, im.width * s, im.height * s); x.restore(); }
    x.textAlign = 'center'; x.save(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowOffsetY = 2; x.shadowBlur = 4; x.fillStyle = '#fff'; let f2 = 24; const nm = (m.d || m.p.d).toUpperCase(); do { x.font = `800 ${f2}px Archivo, sans-serif`; } while (x.measureText(nm).width > cw - 16 && --f2 > 13); x.fillText(nm, cx, by + 280);
    if (m.item) { let f3 = 18; do { x.font = `700 ${f3}px "Space Mono", monospace`; } while (x.measureText(m.item).width > cw - 12 && --f3 > 12); x.fillStyle = '#fff'; x.fillText(m.item, cx, by + 305); } x.restore(); x.textAlign = 'left'; });
  x.font = '400 32px "Permanent Marker", cursive'; x.fillStyle = P.pen; x.fillText('Plot your win.', 58, 656);
  x.textAlign = 'right'; x.font = '700 19px "Space Mono", monospace'; x.fillStyle = P.mute; x.fillText('NASTYPLOT · UNOFFICIAL FAN TOOL', 1144, 652); x.textAlign = 'left';
  return c; };
CH.wrap('openShareCard', () => { const box = $('shareBox'); if (!box || box.hidden || box.querySelector('.chshmode')) return; const hd = box.querySelector('.sharehd'); if (!hd) return;
  const cur = CH.shareMode || document.documentElement.dataset.look || 'light';
  hd.insertAdjacentHTML('afterend', `<div class="seg chshmode" role="group" aria-label="Card style">${[['light', 'Light'], ['dark', 'Dark']].map(([k, t]) => `<button type="button" data-chshm="${k}" aria-pressed="${cur === k}">${t}</button>`).join('')}</div>`); });
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-chshm]'); if (!b) return; CH.shareMode = b.dataset.chshm; const box = $('shareBox'); if (box) { box.hidden = true; box.innerHTML = ''; } openShareCard(); });

// ---------- one fold style everywhere: older collapsible sections take the Concept H fold look (ids and live text kept) ----------
CH.restyle = (d, key, title, sub) => { if (!d || d.classList.contains('chsec')) return; const s = d.querySelector(':scope > summary'); if (!s) return;
  const keep = [...s.querySelectorAll('[id]')]; d.classList.add('chsec', 'chfold'); d.classList.remove('repfold', 'foot'); d.dataset.chf = key;
  const body = document.createElement('div'); body.className = 'chbody'; [...d.children].filter(x => x !== s).forEach(x => body.append(x)); d.append(body);
  s.className = ''; s.innerHTML = `${CH.tog()}<div style="flex:1;min-width:0"><div class="cht">${title}</div><div class="chs">${sub}</div></div>`; const cs = s.querySelector('.chs'); keep.forEach(k => { cs.append(' ', k); }); };
safe('restyle folds', () => { CH.restyle($('muFold'), 'mufold', 'Deeper read', 'Archetypes, their threats, the full matchup grid');
  CH.restyle($('plset'), 'plset', 'Plan settings', '');
  CH.restyle(document.querySelector('#types details.foot'), 'typechart', 'Full type chart', 'Every attacking type against every defending type'); });

// ---------- one page per job: Build holds the cores; Battle links its tools ----------
safe('one page per job', () => {
  const ap = document.querySelector('[data-pane="auto"]'), cs = $('cores'); if (ap && cs && !ap.contains(cs)) ap.append(cs);
  const mu = $('matchup'); if (mu && !$('chTools')) { const d = document.createElement('div'); d.id = 'chTools'; d.className = 'chtools';
    d.innerHTML = `<h3 class="chsub3">More ways to prep</h3><div class="chtoolsg">${[['calc', 'Damage calc', 'Any attacker into any defender'], ['gauntlet', 'Gauntlet', 'Your team against the latest top teams'], ['speed', 'Speed tiers', 'Who moves first across the meta'], ['types', 'Type chart', 'What hits what']].map(([v, t, s]) => `<button type="button" data-view="${v}"><b>${t}</b><span>${s}</span></button>`).join('')}</div>`;
    const bl = $('battlelog'); (bl ? bl.closest('details') || bl : mu).before(d); } });
CH.wrap('renderAutoBuild', () => { const ap = document.querySelector('[data-pane="auto"]'); if (ap && !ap.hidden) safe('cores', renderCores); });
CH.wrap('renderCores', () => CH.pagehead($('cores'), 'Pick a pair or trio that wins, then fill the rest', 'Build around a core', ''));
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-view="cores"]'); if (!b) return; setTimeout(() => { safe('cores', renderCores); const c = $('cores'); if (c) try { c.scrollIntoView({behavior: 'smooth', block: 'start'}); } catch (er) {} }, 60); });// the type tables on My team: closed folds in the same style ("Full tables")
safe('type table folds', () => { document.querySelectorAll('#offense details.phonefold, #defSec details.phonefold').forEach((d, i) => { d.open = false; d.classList.remove('phonefold'); CH.restyle(d, i ? 'deftables' : 'offtables', 'Full tables', i ? 'Every attacking type against each of your six' : 'Every defending type, and your best hit on each top threat'); }); });
// Build shows its cores every time it opens
CH.wrap('setView', () => { if (view === 'auto') safe('cores', renderCores); });
// ---------- Build page order: Build me a team · How it works · Build around a core · Recent winners (folded) ----------
{ const prev = renderAutoBuild;
  renderAutoBuild = function () { const ap = document.querySelector('[data-pane="auto"]'), cs = $('cores');
    // keep the cores section safe while the builder redraws its own area
    if (ap && cs && cs.parentElement !== ap) ap.append(cs);
    const r = prev.apply(this, arguments);
    safe('build order', () => { const out = $('abOut'), st = out && out.querySelector('.abstart'); if (!st) return;
      const how = st.querySelector(':scope > details.chsec'), head = st.querySelector(':scope > .abwinhead'), cards = [...st.querySelectorAll(':scope > .evteam')];
      if (head && cards.length && !st.querySelector('[data-chf="abwin"]')) { const w = document.createElement('div'); w.innerHTML = CH.fold('abwin', 'Start from a recent winner', `${cards.length} winning teams, full sets, ready to load`, '', false); const d = w.firstElementChild;
        head.before(d); const b = d.querySelector('.chbody'); const h = head.querySelector('h2,h3'); if (h) h.remove(); b.append(head, ...cards); }
      if (cs) (how || st.firstElementChild || st).after(cs); });
    return r; }; }
// ⋯ menus open toward whichever side has room, so they never land off-screen
document.addEventListener('toggle', e => { const d = e.target; if (!d || !d.matches || !d.matches('details.moremenu') || !d.open) return; const p = d.querySelector('.mmpop'); if (!p) return;
  p.style.left = '0'; p.style.right = 'auto'; const r = p.getBoundingClientRect(); if (r.right > innerWidth - 8) { p.style.left = 'auto'; p.style.right = '0'; } }, true);
// ---------- Usage: a search box above the list (filters every rank, not just the top 10) ----------
function chMetaFilter() { const el = $('metaList'); if (!el) return; const q = (ui.metaQ || '').trim().toLowerCase(), rows = [...el.querySelectorAll(':scope > .mrow')], more = $('chMetaMore'), sec = $('meta');
  let n = 0; rows.forEach((r, i) => { const nm = r.querySelector(':scope > summary .nm'), hit = !q || (nm ? nm.firstChild && nm.firstChild.textContent || nm.textContent : r.textContent).toLowerCase().includes(q); r.hidden = !hit; if (q) { r.classList.remove('chhid'); if (hit) n++; } else r.classList.toggle('chhid', i >= 10 && !ui.chMetaAll); });
  if (more) more.hidden = !!q; if (sec) sec.querySelectorAll('p, div.t2').forEach(p => { if (/^Also ranked/.test(p.textContent.trim())) p.hidden = !!q || !ui.chMetaAll; });
  const c = $('chMetaCount'); if (c) c.textContent = q ? (n ? `${n} match${n === 1 ? '' : 'es'}` : 'No Pokémon in this list matches that') : ''; }
CH.wrap('renderMeta', () => { const sec = $('meta'), list = $('metaList'); if (!sec || !list) return;
  if (!$('chMetaQ')) { const w = document.createElement('div'); w.className = 'lsearch chmetaq'; w.innerHTML = '<input class="field" id="chMetaQ" type="search" placeholder="Find a Pokémon" autocomplete="off" aria-label="Find a Pokémon in usage"><div class="t2" id="chMetaCount" aria-live="polite"></div>'; list.before(w);
    w.querySelector('input').addEventListener('input', e => { ui.metaQ = e.target.value; chMetaFilter(); }); }
  chMetaFilter(); });
// My box: a live count next to the heading
CH.wrap('renderBox', () => { const h = document.querySelector('#box > .chpghead .chpgt'); if (!h) return; let c = $('chBoxN'); if (!c) { c = document.createElement('span'); c.id = 'chBoxN'; c.className = 'chboxn'; h.append(c); }
  c.textContent = `${S.box.length} Pokémon`; });
// ---------- Battle: the damage calc up top (one tap from any of your six into their Pokémon) ----------
function chCalcCard() { const ms = members(), opp = S.opp.map(n => byName.get(n)).filter(Boolean);
  const top = (() => { try { const r = lairRows(); return r[0] ? r[0].p : null; } catch (e) { return null; } })();
  const def = opp[0] || top || byName.get('Incineroar'); if (!def) return '';
  const atk = ms.length ? ms.slice(0, 6).map(m => m.p) : [byName.get('Garchomp')].filter(Boolean);
  return `<section class="chcalc" aria-label="Damage calc"><div class="chcalch"><div><div class="chk">Real level-50 doubles damage</div><div class="chdisp chcalct">Damage calc</div></div><button type="button" class="chprimary chcalcgo" data-dcgo="${esc((atk[0] || {}).n || '')}|${esc(def.n)}">Open damage calc <span aria-hidden="true">➜</span></button></div>
    <p class="t2">Spreads, items, abilities, weather, terrain, screens, Intimidate and spread moves. Pick an attacker to hit ${opp[0] ? 'their' : 'the most-used'} <b>${esc(def.d)}</b>:</p>
    <div class="chcalcrow"><div class="chcalcatk">${atk.map(p => `<button type="button" data-dcgo="${esc(p.n)}|${esc(def.n)}" aria-label="${esc(p.d)} into ${esc(def.d)}">${sprite(p) || ''}<span>${esc(p.d)}</span></button>`).join('')}</div>
      <span class="chcalcvs" aria-hidden="true">→</span><div class="chcalcdef">${sprite(def) || ''}<span>${esc(def.d)}</span></div></div></section>`; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-dcgo]'); if (!b) return; const [a, d] = b.dataset.dcgo.split('|');
  if (byName.get(a)) dc.a = a; if (byName.get(d)) dc.d = d; dc.dir = 'mine'; dc.mv = null; dc.spread = null; dc.wSet = dc.tSet = false; setView('calc'); safe('calc', renderCalc); window.scrollTo(0, 0); });
CH.wrap('renderBattle', () => { const head = document.querySelector('#matchup > .chbmhead'); if (!head) return; let c = $('chCalcCard'); if (!c) { c = document.createElement('div'); c.id = 'chCalcCard'; } head.after(c); c.innerHTML = chCalcCard(); });
// a ⋯ menu closes once one of its actions is tapped (after Clear team it stayed open showing only Import, which looked like a pop-up)
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('details.moremenu .mmpop button'); if (!b) return; const d = b.closest('details.moremenu'); if (d) setTimeout(() => { d.open = false; }, 0); });
