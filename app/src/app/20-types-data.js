// ---------- Types: the type maths, shared by today's page and the rebuild (moved out of renderTypes, Nov 12) ----------
// typeGroups: how every attacking type hits these defending types (with the Ability's effect), sorted 4x / 2x / normal / 1/2 / 1/4 / immune.
function typeGroups(sel, ab) {
  const groups = {q: [], d: [], n: [], h: [], qr: [], z: []};
  const abNotes = [];
  for (const atk of TYPES) {
    const raw = mult(atk, sel, null, false), x = mult(atk, sel, ab, true);
    if (ab && raw !== x) abNotes.push(`${ab} changes ${atk} from ${raw}× to ${x}×`);
    (x === 0 ? groups.z : x >= 4 ? groups.q : x >= 2 ? groups.d : x <= .25 ? groups.qr : x <= .5 ? groups.h : groups.n).push(atk);
  }
  return {groups, abNotes};
}
// typeOffence: for each of its own types, what it hits for 2x, for 1/2, and not at all
function typeOffence(sel) { return sel.map(atk => ({atk, se: TYPES.filter(d => EFF[atk][d] >= 2), nv: TYPES.filter(d => EFF[atk][d] > 0 && EFF[atk][d] < 1), no: TYPES.filter(d => EFF[atk][d] === 0)})); }
