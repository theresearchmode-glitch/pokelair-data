/* ===== The stage across the site (Nov 3, Sim: "do the whole site at once") =====
   Restyle only. Home's "Your team" card becomes a stage in the team's plan colour (the same STG.planType as My team) with its
   type pattern; the champion's card stays the opponent's red, as a stage; the top-rated cards (Home and Ratings) become small
   stages in each Pokémon's own type (Fighting uses its second, like the info sheet). Everything else is CSS (site.css). */
STG.site = root => { if (!root) return;
  /* Home's your-six side stays the brand blue (Sim, Nov 3: keep the blue | cream | red 6v6 hero) */
  const them = root.querySelector('.chmcard.them'); if (them && !them.querySelector(':scope > .stg-pat')) them.insertAdjacentHTML('afterbegin', '<div class="stg-pat npty-fighting" aria-hidden="true"></div>');
  root.querySelectorAll('.chhot[data-lt]').forEach(c => { const p = byName.get(c.dataset.lt); if (!p) return; const t = STG.sheetType(p); c.classList.add('stgmini'); c.style.cssText += ';' + STG.vars(t); }); };
CH.wrap('renderHome', () => STG.site($('homeOut')));
CH.wrap('renderLair', () => STG.site($('chHot')));
/* Popular sets: the Pokémon at the top is the page's hero, so it stands on its stage (its own type, like the info sheet) */
CH.wrap('renderSets', () => { const h = document.querySelector('[data-pane="sets"] .sethead'); if (!h) return; const nm = (h.querySelector('.sl-name') || {}).textContent || '';
  const p = byName.get(ui.setMon) && byName.get(ui.setMon).d === nm ? byName.get(ui.setMon) : ROSTER.find(q => q.d === nm); if (!p) return; const t = STG.sheetType(p);
  h.classList.add('stgset'); const box = h.parentElement; if (box) box.style.cssText += ';' + STG.vars(t);
  if (!h.querySelector(':scope > .stg-pat')) h.insertAdjacentHTML('afterbegin', `<div class="stg-pat ${STG.pat(t)}" aria-hidden="true"></div>`); });
/* The sweep: after each draw, the page being shown is checked once for the old look the stylesheet can't name ahead of time
   (dozens of card classes across 25 pages): a box with a heavy outline becomes a soft card (its own colour kept when it has
   one), an offset "sticker" shadow goes, and small upper-case labels become sentence case. Pills (secondary buttons), form
   fields, tables and the stages are left alone. Only classes are added, so nothing about the content or handlers changes. */
STG.rgb = c => { const m = String(c).match(/[\d.]+/g); return m ? m.map(Number) : null; };
STG.plain = c => { const v = STG.rgb(c); if (!v || (v[3] != null && v[3] < .3)) return true; const pg = STG.rgb(getComputedStyle(document.body).backgroundColor) || [0, 0, 0];
  const lum = x => .299 * x[0] + .587 * x[1] + .114 * x[2], sat = x => Math.max(...x.slice(0, 3)) - Math.min(...x.slice(0, 3)); return sat(v) < 40 && Math.abs(lum(v) - lum(pg)) < 40; };
STG.sweep = root => { if (!root) return; const t0 = performance.now();
  for (const e of root.querySelectorAll('*')) { if (e.closest('.stg,.stgsheet,.stgmini,.stgset,.stgcard,table,.tablewrap,svg,#chTeam .stgteam')) continue;
    const tag = e.tagName; if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'OPTION') continue;
    const cs = getComputedStyle(e); if (cs.display === 'none') continue;
    const bw = parseFloat(cs.borderTopWidth), r = parseFloat(cs.borderTopLeftRadius) || 0, h = e.offsetHeight;
    if (bw >= 1.5 && parseFloat(cs.borderLeftWidth) >= 1.5 && cs.borderTopStyle === 'solid' && !((r >= 18 || tag === 'BUTTON' || tag === 'A' || tag === 'LABEL') && h <= 58) && h > 30) { e.classList.add('sitecard'); if (STG.plain(cs.backgroundColor)) e.classList.add('sitebg'); }
    else if (/(^|,\s*)(rgba?\([^)]*\)\s*)?-?[1-9]\d*px -?[1-9]\d*px 0px/.test(cs.boxShadow)) e.classList.add('siteflat');
    if (cs.textTransform === 'uppercase' && parseFloat(cs.fontSize) < 17 && !/Anton/i.test(cs.fontFamily) && e.textContent.trim()) e.classList.add('sitelbl');
    if (/Anton/i.test(cs.fontFamily) && parseFloat(cs.fontSize) >= 22 && e.childElementCount <= 1 && /^[#+−–▲▼]?\s*[\d.,]+\s*(%|\/\s*\d+)?$/.test(e.textContent.trim())) e.classList.add('sitenum');
    if (performance.now() - t0 > 120) break; } };
STG.sweepNow = () => { const pane = [...document.querySelectorAll('.mainwrap [data-pane]')].find(p => !p.hidden && p.offsetParent !== null); if (pane) STG.sweep(pane); };
STG.sweepT = 0; STG.sweepSoon = () => { clearTimeout(STG.sweepT); STG.sweepT = setTimeout(() => safe('site sweep', STG.sweepNow), 30); };
{ const r0 = render; render = function () { const v = r0.apply(this, arguments); STG.sweepSoon(); return v; };
  const s0 = setView; setView = function () { const v = s0.apply(this, arguments); STG.sweepSoon(); return v; }; }
document.addEventListener('toggle', e => { if (e.target && e.target.tagName === 'DETAILS' && e.target.open) STG.sweep(e.target); }, true);
document.addEventListener('click', () => STG.sweepSoon(), true);
