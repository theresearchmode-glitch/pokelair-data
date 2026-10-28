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
    const seen = new Set(), top = ws.sort((a, b) => b.hi - a.hi).filter(x => !seen.has(x.t) && seen.add(x.t)).slice(0, 3); if (top.length) bring.insertAdjacentHTML('beforeend', `<ol class="chreasons">${top.map(x => `<li><b>${esc(x.n)}: ${esc(x.t)}</b> ${esc(x.d)}</li>`).join('')}</ol>`); }
  // watch out folds (it's long); the turn-1 plan reads as a panel
  const watch = [...el.querySelectorAll('.bmcard[data-t="plan"]')].find(c => c.querySelector('.bmw') || /Nothing on their side/.test(c.textContent));
  if (watch) { const n = watch.querySelectorAll('.bmw').length, ph = watch.querySelector('.ph'); if (ph) ph.remove(); const wrap = document.createElement('div'); wrap.dataset.t = 'plan'; wrap.className = 'chbmfold'; watch.before(wrap); wrap.append(watch); watch.removeAttribute('data-t');
    CH.foldNode(watch, 'bmwatch', 'Watch out', n ? `${n} of their six can shut something down` : 'Nothing on their side shuts down your four', false); }
  const t1 = el.querySelector('.bmt1'); if (t1) t1.classList.add('chpanel');
  const sp = el.querySelector('.bmcard[data-t="speed"] .ph .pt'); if (sp) sp.textContent = 'Who moves first';
  const dm = el.querySelector('.bmcard[data-t="dmg"] .ph .pt'); if (dm) dm.textContent = 'Damage both ways';
  const bl = battlelog; if (bl && !bl.closest('details.chsec')) { const L = Array.isArray(S.log) ? S.log : [], w = L.filter(x => x.r === 'W').length; CH.foldNode(bl, 'bmlog', 'Battle log', L.length ? `– ·  logged · log this game` : 'Log this game after the match', false); } });
