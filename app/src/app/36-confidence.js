// ---------- confidence: how many real tournament teams back a pick ----------
function confFor(p){if(!p)return null;const r=RES&&RES.mons&&(RES.mons[p.n]||RES.mons[p.b]);const n=r?r[0]:0;
  return n>=500?{c:'hi',t:'Solid',n}:n>=60?{c:'mid',t:'Some data',n}:{c:'lo',t:'Educated guess',n}}
function confChip(p){const c=confFor(p);if(!c)return '';const n=c.n.toLocaleString('en-US');
  // says what the number is ("1,903 teams"), with the confidence word in the hover text
  return `<span class="conf ${c.c}" title="${c.n?`${c.t}: brought on ${n} tournament teams, so its numbers rest on real results`:'Educated guess: no tournament teams yet, so its numbers come from type matchups and stats only'}">${c.n?`${n} team${c.n===1?'':'s'}`:'No event data'}</span>`}
