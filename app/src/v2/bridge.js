// ---------- bridge: the hooks today's shared logic calls, answered by the rebuild (R4, Nov 11) ----------
// Today's logic (03-persistence.js and others) calls render() / scheduleRender() when the daily data or the saved team changes,
// and safe() to run a step without letting one failure stop the rest. In today's page these live in 08-render-all.js; here
// they redraw the rebuild's current page instead. Function declarations, so the shared logic finds them anywhere in the closure.
function safe(name, fn) { try { fn(); } catch (err) { try { console.error('NastyPlot: ' + name, err); } catch (e) {} } }
function render() { fixMetaSrc(); if (window.V2 && V2.draw) V2.redraw(); }
function scheduleRender() { fixMetaSrc(); clearTimeout(V2._rq); V2._rq = setTimeout(() => V2.redraw(), 150); }
