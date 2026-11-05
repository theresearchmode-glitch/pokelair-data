// ---------- Champions arena, group B: My team's sub-pages and the team overlays (theme/arena-team.css) ----------
// Saved teams, My box, Compare, All suggestions, the team editor, the threat sheet, the share card and My team's fold bodies.
// Arena markup only: every number, name and control comes from the app's own data and handlers.
const ARB = {};
if (window.__PL_TEST) window.__ARB = {setView: v => setView(v), edit: i => chEditOpen(i), scout: n => chScoutOpen(n), share: () => openShareCard(), members: () => members(), S: () => S, ARB};
