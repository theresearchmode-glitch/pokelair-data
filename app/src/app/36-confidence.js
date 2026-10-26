// ---------- confidence: how many real tournament teams back a pick ----------
function confFor(p){if(!p)return null;const r=RES&&RES.mons&&(RES.mons[p.n]||RES.mons[p.b]);const n=r?r[0]:0;
  return n>=500?{c:'hi',t:'Solid',n}:n>=60?{c:'mid',t:'Some data',n}:{c:'lo',t:'Educated guess',n}}
function confChip(p){const c=confFor(p);if(!c)return '';const n=c.n.toLocaleString('en-US');
  return `<span class="conf ${c.c}" title="${c.n?`Backed by ${n} tournament teams`:'No tournament teams yet: this pick comes from type matchups and stats only'}">${c.t}${c.n?` · ${n}`:''}</span>`}
