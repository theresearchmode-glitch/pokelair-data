// ---------- Polish pass (Oct 29): Damage calc ----------
// The threat table's fold already carries the title, so the heading inside it goes. On phones each row of the table
// becomes a card of tiles: every cell gets its column's sprite, so a row reads on its own without scrolling sideways.
CH.wrap('renderCalc', () => { const el = $('dcOut'); if (!el) return;
  el.querySelectorAll('details.chsec h3.dsub').forEach(h => { if (/best hit/i.test(h.textContent)) h.remove(); });
  el.querySelectorAll('table.dctab').forEach(t => { if (t.dataset.tiles) return; t.dataset.tiles = '1'; const heads = [...t.querySelectorAll('thead th')];
    t.querySelectorAll('tbody tr').forEach(tr => [...tr.children].forEach((c, i) => { if (c.tagName !== 'TD' || !heads[i]) return; const img = heads[i].querySelector('img'), nm = heads[i].getAttribute('title') || '';
      const tag = document.createElement('i'); tag.className = 'dctile'; tag.setAttribute('aria-hidden', 'true'); if (img) tag.append(img.cloneNode()); c.prepend(tag); if (nm && !c.title.startsWith(nm)) c.title = nm + ' · ' + c.title; })); }); });
