// ---------- bridge: the hooks today's shared logic calls, answered by the rebuild (R4, Nov 11) ----------
// Today's logic (03-persistence.js and others) calls render() / scheduleRender() when the daily data or the saved team changes,
// and safe() to run a step without letting one failure stop the rest. In today's page these live in 08-render-all.js; here
// they redraw the rebuild's current page instead. Function declarations, so the shared logic finds them anywhere in the closure.
function safe(name, fn) { try { fn(); } catch (err) { try { console.error('NastyPlot: ' + name, err); } catch (e) {} } }
// like today's render(): every redraw after a change saves the team (persist), so Undo and Apply are kept on reload
function render() { persist(); fixMetaSrc(); clearCaches(); if (window.V2 && V2.draw) V2.redraw();
  // code review B9b: an open Edit Set follows the team (an Undo used to leave it showing the old set); if its Pokémon is gone, it closes
  if (window.V2 && V2.ed && V2.edRefresh && document.querySelector('.ed2')) { const s = S.slots[V2.ed.i], nowEmpty = !(s && byName.get(s.n)), shownEmpty = !!document.querySelector('.ed2.sx-addsh');
    if (!(shownEmpty && nowEmpty)) try { V2.edRefresh(); } catch (e) {} } } /* an Undo, Remove or Add redraws it (an emptied slot shows 'Add a Pokémon'); an empty slot's name box being typed in is left alone */
// like today's scheduleRender: wait a moment so the daily documents arriving together land in one redraw, and only then pick the
// usage source (fixMetaSrc), so it never settles on whichever document happened to arrive first
function scheduleRender() { clearTimeout(V2._rq); V2._rq = setTimeout(() => { fixMetaSrc(); clearCaches(); V2.redraw(); }, 700); }
// toasts from the shared logic (Undo, applied suggestions): the rebuild's toast; its Undo button uses today's Undo handler (#toastUndo, 06-helpers.js)
function toast(t, undo) { if (undo && ui.undo) try { ui.undoAfter = JSON.stringify(S.slots); } catch (e) {} /* the team as this Undo leaves it (code review A2-M7) */ V2.toast(V2.esc(t) + (undo && ui.undo ? ' <button type="button" id="toastUndo">Undo</button>' : '')); }
/* stress test (Nov 16, B3): a newer change (e.g. Apply, which shows its own Undo bar) replaced the Undo point but left the older
   "Removed X · Undo" toast up, whose Undo then reversed the newer change; when the Undo point changes, an older Undo toast goes */
(() => { let u = ui.undo; Object.defineProperty(ui, 'undo', {configurable: true, enumerable: true, get: () => u,
  set: v => { if (v !== u) document.querySelectorAll('.np-toast,.np-sheet-undo').forEach(x => { if (x.querySelector('#toastUndo') || x.classList.contains('np-sheet-undo')) x.remove(); }); u = v; }}); })();
// the rebuild redraws in place (V2.redraw keeps the reader's place), so keeping the scroll is just running the change
function keepScroll(fn) { fn(); }

// today's arena type palette, applied to the logic's TC as today's page does at load (74-arena.js): Dark slate violet, Normal cool grey
try { Object.assign(TC, AR.TC_FIX); } catch (e) {}
// box changes from the shared logic (applyBox, 45-team-links.js): the rebuild's toast with the box's own Undo (pages/box.js)
function toastBox(t) { V2.bxToast(t); }
/* Sim, Nov 16 (batch 10A; code review A2-I2 + A2-I3): the Strength Score's number, band word and band colour all come from the ONE
   number shown (rounded), with no "sticky" band. Before: 79.5 showed "80 · Solid", and a team could show "81 · Tournament ready" in the
   Solid colour because the colour kept its old band for 1.5 points. New site only; today's live site keeps its own rules. */
{ const grade0 = CH.grade, word0 = CH.wordOf;
  CH.grade = s => grade0(s == null ? s : Math.round(s));
  CH.wordOf = s => word0(s == null ? s : Math.round(s));
  CH.sticky = (ms, s) => CH.gradeFull(s); /* no buffer, and no np.gl write on every score */ }
