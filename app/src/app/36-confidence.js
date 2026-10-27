// ---------- confidence: how many real tournament teams back a pick ----------
// Counts come from the season results (RES: every Limitless Reg M-C event); a Mega counts only its own Mega teams (the
// base form's count was used before, so a Mega borrowed its base form's teams).
function confFor(p){if(!p)return null;const r=RES&&RES.mons&&RES.mons[p.n];const n=r?r[0]:0;
  return n>=500?{c:'hi',t:'Solid',n}:n>=60?{c:'mid',t:'Some data',n}:{c:'lo',t:'Educated guess',n}}
// which data window a number comes from, in words: the season results vs the recent tournament usage list (Oct 28 audit:
// the two windows differ, so every count says which one it is)
function windowWords(kind){try{if(kind==='res'){const m=String((RES&&RES.source)||'').match(/\(([^)]*)\)\s*$/);return m?m[1]:'Limitless season results'}
  const d=META.doubles_tour;return d?`${d.source||'tournament usage'}${d.period?' · '+d.period:''}`:''}catch(e){return ''}}
function confChip(p){const c=confFor(p);if(!c)return '';const n=c.n.toLocaleString('en-US'),tot=RES&&RES.teams?(+RES.teams).toLocaleString('en-US'):'';
  // says what the number is ("1,903 teams"), with the confidence word and the data window in the hover text
  return `<span class="conf ${c.c}" title="${c.n?`${c.t}: brought on ${n}${tot?' of '+tot:''} tournament teams (${esc(windowWords('res'))}), so its numbers rest on real results`:'Educated guess: no tournament teams yet, so its numbers come from type matchups and stats only'}">${c.n?`${n} team${c.n===1?'':'s'}`:'No event data'}</span>`}
