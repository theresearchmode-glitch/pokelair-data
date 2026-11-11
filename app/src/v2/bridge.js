// ---------- bridge: the hooks today's shared logic calls, answered by the rebuild (R4, Nov 11) ----------
// Today's logic (03-persistence.js and others) calls render() / scheduleRender() when the daily data or the saved team changes,
// and safe() to run a step without letting one failure stop the rest. In today's page these live in 08-render-all.js; here
// they redraw the rebuild's current page instead. Function declarations, so the shared logic finds them anywhere in the closure.
function safe(name, fn) { try { fn(); } catch (err) { try { console.error('NastyPlot: ' + name, err); } catch (e) {} } }
// like today's render(): every redraw after a change saves the team (persist), so Undo and Apply are kept on reload
function render() { persist(); fixMetaSrc(); clearCaches(); if (window.V2 && V2.draw) V2.redraw(); }
// like today's scheduleRender: wait a moment so the daily documents arriving together land in one redraw, and only then pick the
// usage source (fixMetaSrc), so it never settles on whichever document happened to arrive first
function scheduleRender() { clearTimeout(V2._rq); V2._rq = setTimeout(() => { fixMetaSrc(); clearCaches(); V2.redraw(); }, 700); }
// toasts from the shared logic (Undo, applied suggestions): the rebuild's toast; its Undo button uses today's Undo handler (#toastUndo, 06-helpers.js)
function toast(t, undo) { V2.toast(V2.esc(t) + (undo && ui.undo ? ' <button type="button" id="toastUndo">Undo</button>' : '')); }
// the rebuild redraws in place (V2.redraw keeps the reader's place), so keeping the scroll is just running the change
function keepScroll(fn) { fn(); }

// today's arena type palette, applied to the logic's TC as today's page does at load (74-arena.js): Dark slate violet, Normal cool grey
try { Object.assign(TC, AR.TC_FIX); } catch (e) {}
// box changes from the shared logic (applyBox, 45-team-links.js): the rebuild's toast with the box's own Undo (pages/box.js)
function toastBox(t) { V2.bxToast(t); }
