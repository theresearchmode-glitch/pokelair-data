// ---------- Trial Redesign v2 (Riso Manga): tap-a-Pokémon set panel, "The read" bar, small text helpers ----------
// Part of the colour manga redesign (live from Nov 4). Uses the app's own data (members, rating, planMatchup, likelyLead, bmWatch); no new numbers.

/* My team: tap one of your six in the header and its set slides in under the header (item, ability, moves, rating) */
function rzSetHtml(m, i) {
  let r = null, tier = '';
  try { r = rating(m.p).total; tier = lTier(r).k; } catch (e) {}
  const mv = (m.moves || []).filter(Boolean).map(x => `<li>${esc(x.name)}</li>`).join('');
  return `<div class="rzseth">${sprite(m.p, 'rzsetspr') || ''}<div class="rzsetn"><b>${esc(m.d)}</b><span>${(m.p.t || []).map(esc).join(' and ')} type</span></div>
    ${r != null ? `<div class="rzsetr"><b>${RS(r)}</b><span>${tier ? esc(tier) + ' tier rating' : 'Rating'}</span></div>` : ''}</div>
    <dl class="rzsetd"><div><dt>Item</dt><dd>${esc(m.item || 'No item')}</dd></div><div><dt>Ability</dt><dd>${esc(m.ability || '–')}</dd></div></dl>
    ${mv ? `<ul class="rzsetm" aria-label="Moves">${mv}</ul>` : ''}
    <div class="rzseta"><button type="button" class="chghost" data-chedit="${i}">Edit set</button><button type="button" class="rzlink" data-lt="${esc(m.p.n)}">Info sheet ›</button></div>`;
}
document.addEventListener('click', e => {
  const b = e.target && e.target.closest && e.target.closest('[data-chset]'); if (!b) return;
  const i = +b.dataset.chset; ui.rzSet = ui.rzSet === i ? null : i;
  const box = $('rzSet'), ms = members(), m = ms.find(x => x.i === i);
  document.querySelectorAll('[data-chset]').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.chset === ui.rzSet)));
  if (!box) return;
  if (ui.rzSet == null || !m) { box.hidden = true; box.innerHTML = ''; return; }
  // type-colour edge for the shown Pokémon (theme/color.css .tyx)
  box.style.cssText = tyVars(m.p); box.classList.add('tyx');
  box.innerHTML = rzSetHtml(m, i); box.hidden = false; box.classList.remove('in'); void box.offsetWidth; box.classList.add('in');
});

/* Battle mode: "The read", one line that sums up the plan above everything else (lead pair, biggest threat, their Fake Outs) */
function rzReadHtml() {
  const mine = members(), theirs = oppTeam();
  if (mine.length < 4 || !theirs.length) return '';
  const r = planMatchup(mine, theirs, true), C = r.chosen.map(i => mine[i]);
  const mini = p => `<span class="rzmini">${sprite(p, 'rzminispr') || ''}<b>${esc(p.d || '')}</b></span>`;
  const lead = r.lead.map(i => mine[i]);
  const ll = r.B && theirs.length >= 2 ? likelyLead(theirs, r.B) : [];
  let threat = null;
  try { const W = bmWatch(C, theirs); const hi = W.find(w => w.out.some(o => o[0] === 'hi')) || W[0]; if (hi) threat = {o: hi.o, t: (hi.out.find(o => o[0] === 'hi') || hi.out[0])[1]}; } catch (e) {}
  const fo = theirs.filter(o => (o.moves || []).some(x => x && x.name === 'Fake Out')).length;
  const li = (k, v, cls) => `<li${cls ? ` class="${cls}"` : ''}><span class="k">${k}</span>${v}</li>`;
  return `<div class="rzread" role="region" aria-label="The read"><h2>The read</h2><ul>
    ${lead.length === 2 ? li('Lead', `${mini({...lead[0].p, d: lead[0].d})}<i>+</i>${mini({...lead[1].p, d: lead[1].d})}`, 'you') : ''}
    ${ll.length === 2 ? li('Their likely lead', `${mini({...ll[0].p, d: ll[0].d})}<i>+</i>${mini({...ll[1].p, d: ll[1].d})}`, 'them') : ''}
    ${threat ? li('Biggest threat', `${mini({...threat.o.p, d: threat.o.d})}<em>${threat.t}</em>`, 'them') : ''}
    ${li('Fake Out on their side', `<b class="rzn">${fo}</b>`, fo ? 'them' : '')}
  </ul><span class="rzlive">Updates as you type their six</span></div>`;
}
{ const rb = renderBattle; renderBattle = function () { const out = rb.apply(this, arguments);
  try { const el = $('bmOut'); if (el) { const old = el.querySelector('.rzread'); if (old) old.remove(); const h = rzReadHtml(); const opp = el.querySelector('.bmopp');
    if (h && opp) opp.insertAdjacentHTML('afterend', h);
    /* turn one gets the full width under "Bring" and "Watch out", so the strip reads left to right */
    const t1 = el.querySelector('.bmt1'), side = el.querySelector('.chbmside'), grid = el.querySelector('.bmgrid');
    if (t1 && side && grid && t1.querySelector('.rzt1')) { t1.classList.add('rzwide'); t1.dataset.t = 'plan'; side.after(t1); } } } catch (e) {}
  return out; }; }

/* Fewer walls of text: a paragraph over ~170 characters shows its first sentence; the rest sits behind "More" (nothing deleted).
   Runs after every redraw; a paragraph the app rewrites is tidied again. */
function rzTidy() {
  document.querySelectorAll('[data-pane] p, .lsheet p, footer.legal p:not(.lglinks)').forEach(p => {
    if (p.closest('#rzSet, table, button, label, summary, .rzread, .rzt1, .bmspd') || p.querySelector('button')) return; // never hide a button behind More
    const txt = p.textContent.replace(/\s+/g, ' ').trim(), L = txt.length;
    if (p.dataset.rz && +p.dataset.rz === L) return;
    if (p.querySelector('.rzmorebtn')) return;
    p.dataset.rz = String(L);
    if (L < 150) return;
    // first sentence end between 40 and 170 characters ("e.g." and "vs." are not sentence ends)
    const re = /[.!?](?=\s+[A-Z0-9"“(])/g; let m, cut = -1;
    while ((m = re.exec(p.textContent))) { const before = p.textContent.slice(Math.max(0, m.index - 4), m.index + 1); if (/\b(e\.g|i\.e|vs|etc)\.$/i.test(before)) continue; if (m.index >= 40) { cut = m.index + 1; break; } }
    if (cut < 0 || cut > 190 || p.textContent.length - cut < 30) return;
    // split at that character offset, keeping any links and bold text intact
    const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); let n, pos = 0, node = null, off = 0;
    while ((n = w.nextNode())) { if (pos + n.length >= cut) { node = n; off = cut - pos; break; } pos += n.length; }
    if (!node) return;
    const r = document.createRange(); r.setStart(node, off); r.setEndAfter(p.lastChild);
    const rest = document.createElement('span'); rest.className = 'rzrest'; rest.hidden = true; rest.appendChild(r.extractContents());
    const b = document.createElement('button'); b.type = 'button'; b.className = 'rzmorebtn'; b.textContent = 'More'; b.setAttribute('aria-expanded', 'false');
    p.append(' ', b, rest); p.dataset.rz = String(p.textContent.replace(/\s+/g, ' ').trim().length);
  });
}
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('.rzmorebtn'); if (!b) return;
  const rest = b.nextElementSibling; if (!rest) return; const open = rest.hidden; rest.hidden = !open; b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Less' : 'More'; });
{ let q = false; const run = () => { q = false; try { rzTidy(); } catch (e) {} };
  new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(run); } }).observe(document.body, {childList: true, subtree: true}); }

/* plain phrases, not dot strings: " · " in visible text becomes a comma (footer link row keeps its separators) */
function rzDots() { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {acceptNode: n => n.nodeValue.indexOf('·') < 0 ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
  const L = []; let n; while ((n = w.nextNode())) L.push(n);
  for (const t of L) { const p = t.parentElement; if (!p || p.closest('script,style,textarea,input,.lglinks,svg')) continue;
    /* a label in front of a list ("Build · real winning teams") takes a colon; a missing value ("— · 61%") is said in words */
    const lead = p.matches('h2,h3,h4,.chk,.eyebrow,.sgl,.ltd,.npk,.rzbwho,.thk') && !/:/.test(p.textContent.split('·')[0]) ? ': ' : ', ';
    (window.__RZdots = window.__RZdots || new Set()).add(p.textContent.trim().slice(0, 80) + '  @' + String(p.className || p.tagName).slice(0, 30));
    let v = t.nodeValue.replace(/—\s*·\s*/g, 'no power, ');
    /* "Whimsicott · Tailwind; Basculegion · Aqua Jet": who with what */
    if (/;/.test(p.textContent) || p.closest('.gpwho')) v = v.replace(/([A-Za-zé'’-]+(?: [A-Z][A-Za-zé'’-]+)*) · ([A-Z][A-Za-z'’ -]+?)(?=;|,|$| ·)/g, '$1 with $2'); if (/^\s*·\s*$/.test(v)) { t.nodeValue = lead; continue; }
    let first = true; v = v.replace(/\s*·\s*/g, () => { const r = first ? lead : ', '; first = false; return r; }).replace(/^,\s*/, ', ').replace(/,\s*,/g, ',').replace(/:\s*,/g, ':'); t.nodeValue = v; } }
{ let q = false; const run = () => { q = false; try { rzDots(); } catch (e) {} }; run();
  new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(run); } }).observe(document.body, {childList: true, subtree: true}); }
