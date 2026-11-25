// ---------- usage counts: the owner's tally, shared with the new build (moved unchanged from 51-usage.js, Nov 15) ----------
// people, visits, phone visits, and each page or button by how many people used it (then how many times)
function usageTally(docs) {
  const tot = new Map(), ppl = new Map(); let people = 0, visits = 0, phone = 0;
  for (const doc of docs) { const v = doc.data() || {}, mine = new Set(); people++;
    for (const s of Object.values(v.s || {})) { visits++; if (s.w === 'phone') phone++; for (const [k, n] of Object.entries(s.c || {})) { tot.set(k, (tot.get(k) || 0) + (+n || 0)); mine.add(k); } }
    for (const k of mine) ppl.set(k, (ppl.get(k) || 0) + 1); }
  const rows = [...tot].filter(([k]) => k !== 'visit').map(([k, n]) => ({k, n, p: ppl.get(k) || 0})).sort((a, b) => b.p - a.p || b.n - a.n);
  return {people, visits, phone, rows}; }
