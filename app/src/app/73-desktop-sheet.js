/* ===== Info sheet, desktop layout (Sim, Nov 4: "why is this how the info page looks on PC ... lazy work") =====
   On a screen 1024px or wider the sheet is no longer the phone bottom sheet centred in empty space. It becomes a large
   panel (up to 1320px wide, nearly the full height) over a dimmed page, in two columns:
   - left (sticky): the manga hero (art, type wash, speed lines, the rating with its misprint, tier caption), the name and
     types, the three numbers, Add to team and the other actions, Report a mistake;
   - right: the Info / Meta / Rating tabs, each laid out in columns for the width (styles in theme/desktop-sheet.css; swap both files for the chosen direction).
   The phone keeps exactly the DOM it had: this only runs when the desktop media query matches, after every other builder
   (61 hero numbers, 67 tabs, 71 manga hero). It only moves existing nodes into two wrappers and groups the Meta lists, so no
   control, text or handler is lost. On desktop the panel fits the window and never scrolls: the right column (.lsbody) scrolls
   inside it, under its sticky tab bar, while the hero column and the close button stay put.
   If the window crosses 1024px while the sheet is open, the sheet is rebuilt for the new size. */
const DSK = {mq: (() => { try { return matchMedia('(min-width:1024px)'); } catch (e) { return null; } })()};
DSK.on = () => !!(DSK.mq && DSK.mq.matches);
DSK.layout = () => { const sh = $('lairSheet'); if (!sh) return; sh.classList.toggle('lsdesk', DSK.on()); if (sh.hidden || !DSK.on()) return; const panel = sh.querySelector('.lspanel'), head = panel && panel.querySelector('.lshead'), body = panel && panel.querySelector('.lsbody');
  if (!panel || !head || !body || panel.querySelector('.lsside')) return;
  const side = document.createElement('div'); side.className = 'lsside';
  /* close: its own sticky corner of the panel, so it stays put while the right column scrolls */
  const x = head.querySelector('.lsx'); if (x) { x.classList.add('lsxd'); panel.prepend(x); }
  panel.insertBefore(side, body); side.append(head);
  for (const sel of [':scope > .chlstats', ':scope > .mgadd', ':scope > .lsact', ':scope > .lsmis']) { const e = body.querySelector(sel); if (e) side.append(e); }
  /* Meta: the moves / items / brought-with lists are one flat run of label + rows; group each label with its rows so they can sit in columns */
  const data = body.querySelector('.lstp-meta .chlsdata');
  if (data && !data.querySelector('.lsgrp')) { let g = null; for (const k of [...data.children]) {
      if (k.classList.contains('chk')) { g = document.createElement('div'); g.className = 'lsgrp'; k.before(g);
        const t = k.textContent; g.classList.add(/^Moves/.test(t) ? 'lsg-mv' : /^Items/.test(t) ? 'lsg-it' : /^Brought/.test(t) ? 'lsg-bw' : 'lsg-x'); }
      if (g) g.append(k); }
    /* "Items: Ability: Unburden 88%" -> "Items" and, under it, "Most used ability: Unburden 88%" */
    const ih = data.querySelector('.lsg-it>.chk'); if (ih && !ih.querySelector('.lsabn')) { const m = /^Items\s*(?:·|:)\s*Ability: (.+)$/.exec(ih.textContent.trim());
      if (m) { ih.textContent = 'Items'; /* Nov 7: the ability share moved to the Typical set */ } } }
  /* Info: stats and abilities side by side, matchups and Speed under them */
  const info = body.querySelector('.lstp-info'); if (info) info.classList.add('lsgrid2');
  const rate = body.querySelector('.lstp-rating'); if (rate) rate.classList.add('lsgrid2');
  const meta = body.querySelector('.lstp-meta'); if (meta) meta.classList.add('lsgrid2'); };
CH.wrap('lairSheet', () => DSK.layout());
if (DSK.mq) { const re = () => { const sh = $('lairSheet'); if (!sh || sh.hidden || !ui.lsheet) return; if (DSK.on() !== sh.classList.contains('lsdesk')) { const st = (sh.querySelector('.lspanel') || {}).scrollTop || 0; lairSheet(ui.lsheet); const p = sh.querySelector('.lspanel'); if (p) p.scrollTop = st; } };
  try { DSK.mq.addEventListener('change', re); } catch (e) { try { DSK.mq.addListener(re); } catch (x) {} } }
