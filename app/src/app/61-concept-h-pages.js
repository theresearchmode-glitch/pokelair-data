// ---------- Concept H, the other pages (Oct 28) ----------
// Calm, not busy: each page leads with big sprites and one clear action; the dense tools sit in folds. The original
// renderers still build every number and control; these wrappers only rearrange and restyle what they draw, so nothing
// is lost and the logic stays in one place.
CH.wrap = (name, after) => { try { const old = eval(name); if (typeof old !== 'function') return; const fn = function () { const r = old.apply(this, arguments); safe('concept h ' + name, () => after.apply(this, arguments)); return r; }; eval(name + ' = fn'); } catch (e) {} };
// fold an existing node in place (keeps its id and handlers)
CH.foldNode = (node, key, title, sub, open) => { if (!node || node.closest('details.chsec')) return null; const w = document.createElement('div'); w.innerHTML = CH.fold(key, title, sub, '', open); const d = w.firstElementChild; node.before(d); d.querySelector('.chbody').append(node); return d; };
CH.head = (kicker, title, sub) => `<div class="chpghead"><div class="chk">${kicker}</div><div class="chdisp chpgt" role="heading" aria-level="2">${title}</div>${sub ? `<p class="chpgs">${sub}</p>` : ''}</div>`;
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
  const head = document.createElement('div'); head.className = 'chbmhead';
  head.innerHTML = `<div class="chk">Matchup · team preview${on ? ' · their real open team sheet' : ''}</div><div class="chdisp chbmt" role="heading" aria-level="2"><span>${esc(title)}</span> <small>vs</small> <em>${on ? esc(on.who) : 'their six'}</em></div>
    ${on ? `<p class="chpgs">${esc(on.who)} went <b>${esc(on.rec || '')}</b>${on.place ? ` for ${on.place === 1 ? '1st' : on.place === 2 ? '2nd' : on.place === 3 ? '3rd' : on.place + 'th'}` : ''} at ${esc(on.ev.name)}${on.ev.players ? ` (${on.ev.players} players)` : ''}.</p>` : '<p class="chpgs">Type their six as you see them at team preview.</p>'}`;
  const bar = el.querySelector('.bmbar'); if (bar) head.append(bar); el.prepend(head);
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
  const sp = el.querySelector('.bmcard[data-t="speed"] .ph .pt'); if (sp) sp.textContent = 'Who moves first';
  const dm = el.querySelector('.bmcard[data-t="dmg"] .ph .pt'); if (dm) dm.textContent = 'Damage both ways';
  const bl = battlelog; if (bl && !bl.closest('details.chsec')) { const L = Array.isArray(S.log) ? S.log : [], w = L.filter(x => x.r === 'W').length; CH.foldNode(bl, 'bmlog', 'Battle log', L.length ? `– ·  logged · log this game` : 'Log this game after the match', false); } });
// ---------- Ratings: the hot list ----------
function chHotHtml() { const rows = lairRows(); if (rows.length < 8) return ''; const top = rows.slice(0, 8);
  const tour = x => (x.r.src && x.r.src.tour) || null, line = x => { const t = tour(x); return t ? `${(+t[0]).toFixed(1)}% use · ${(+t[1]).toFixed(1)}% win` : `★ ${x.r.total}`; };
  const big = (x, c) => `<button type="button" class="chhot ${c} chhalf" data-lt="${esc(x.p.n)}" aria-label="${esc(x.p.d)}, rated ${x.r.total}"><span class="n">${x.r.total}</span><span class="nm">${esc(x.p.d)}</span><span class="st">${line(x).replace(' · ', '<br>')}</span>${sprite(x.p) || ''}</button>`;
  const T = lTier(top[0].r.total), nS = rows.filter(x => x.r.total >= T.min).length, tie = top[0].r.total === top[1].r.total;
  return `<div class="chhothead"><span class="chtier">${T.k}</span><span class="chk">${T.min}+ · ${nS} Pokémon</span>${tie ? '<span class="chpen" style="margin-left:auto">Tied for #1!</span>' : ''}</div>
    <div class="chhot2">${big(top[0], 'red')}${big(top[1], 'blue')}</div>
    <div class="chhotrows">${top.slice(2).map((x, i) => `<button type="button" class="chhr" data-lt="${esc(x.p.n)}"><span class="rk">${i + 3}</span>${sprite(x.p) || ''}<span class="chbd"><b>${esc(x.p.d)}</b><span>${line(x)}</span></span><span class="sc">${x.r.total}</span></button>`).join('')}</div>`; }
CH.wrap('renderLair', bodyOnly => { const sec = $('lair'); if (!sec) return; sec.classList.add('chlair');
  if (!sec.querySelector('.chpghead')) { const pf = activePerf(); sec.querySelector('.head').insertAdjacentHTML('afterend', CH.head(`Ratings · Reg M-C doubles${pf && pf.updated ? ' · data from ' + esc(pf.updated) : ''}`, 'The hot list', ''));
    const hero = $('lairHero'); const f = CH.foldNode(hero, 'lairabout', 'About the ratings', 'How they are made, sources and their track record', false);
    if (f) { const b = f.querySelector('.chbody'); sec.querySelectorAll('.head .hint, #ratingTrack').forEach(p => b.prepend(p)); }
    const hot = document.createElement('div'); hot.id = 'chHot'; (f || hero).after(hot); }
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
  b.innerHTML = `<span class="chtog${ui.chMetaAll ? ' open' : ''}" aria-hidden="true">${CH.tog().replace(/^<span class="chtog" aria-hidden="true">|<\/span>$/g, '')}</span><span style="flex:1;text-align:left"><span class="cht">${ui.chMetaAll ? 'Show the top 10' : `Ranks 11–${rows.length}`}</span><span class="chs">${ui.chMetaAll ? 'Fold the rest away' : 'The rest of the list'}</span></span>`; });// ---------- Cores: the top three as big cards, the explainer folded ----------
CH.wrap('renderCores', () => { const el = $('coreOut'); if (!el) return; const sec = $('cores'); if (sec) sec.classList.add('chcores');
  const intro = el.querySelector('.coreintro'); if (intro) CH.foldNode(intro, 'coreabout', 'How cores are ranked', 'Win rate pulled toward the average, from real tournament teams', false);
  const rows = [...el.querySelectorAll('.corelist .corerow')]; rows.forEach((r, i) => { if (i < 3) r.classList.add('chcbig'); });
  if (rows.length > 4) { const rest = document.createElement('div'); rest.className = 'corelist'; rows.slice(3).forEach(r => rest.append(r)); const mb = el.querySelector(':scope > .morebar'); if (mb) rest.append(mb); const w = document.createElement('div'); w.innerHTML = CH.fold('coremore', `More cores`, `#4 to #${rows.length}${mb ? ' and Show more' : ''}`, '', false); const d = w.firstElementChild; d.querySelector('.chbody').append(rest); el.querySelector('.corelist').after(d); } });
