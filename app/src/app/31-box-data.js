// ---------- My Box: the data steps (R4, Nov 11; shared by today's page and the new build, moved from 31-box.js and 34-events.js) ----------
// sort (Oct 30, Sim): A–Z, by type, newest or oldest added (S.box keeps the order they were added), or by rating; remembered
function boxSortNow() { return ui.boxSort || (ui.boxSort = LS.get('cc2.boxSort', 'az')); }
function setBoxSort(s) { ui.boxSort = s; LS.set('cc2.boxSort', ui.boxSort); }
// the box in the chosen order: [name, display name, order added]
function boxRows(so) { const TO = Object.keys(TC);
  const rt = b => { try { const p = byName.get(b); return p ? rating(p).total : 0; } catch (e) { return 0; } }, ty = b => { const p = byName.get(b); return p ? TO.indexOf(p.t[0]) * 20 + (p.t[1] ? TO.indexOf(p.t[1]) + 1 : 0) : 999; };
  const cmp = {az: (x, y) => x[1].localeCompare(y[1]), za: (x, y) => y[1].localeCompare(x[1]), type: (x, y) => ty(x[0]) - ty(y[0]) || x[1].localeCompare(y[1]), new: (x, y) => y[2] - x[2], old: (x, y) => x[2] - y[2], rating: (x, y) => rt(y[0]) - rt(x[0]) || x[1].localeCompare(y[1])}[so] || ((x, y) => x[1].localeCompare(y[1]));
  return S.box.map((b, i) => [b, (byName.get(b) || {}).d || b, i]).sort(cmp); }
function boxAdd(p) { if (inBox(p)) return false; S.box.push(p.n); return true; }
// box changes can be undone too (Oct 30 audit: Reset and × had no way back)
function boxRemove(n) { ui.boxUndo = S.box.slice(); S.box = S.box.filter(x => x !== n); }
function boxReset() { const was = S.box.slice(); S.box = DEFAULT_BOX.slice(); ui.boxUndo = was; }
function boxRestore() { if (!ui.boxUndo) return false; S.box = ui.boxUndo; ui.boxUndo = null; return true; }
