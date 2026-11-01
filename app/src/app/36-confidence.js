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
/* ---------- the basis behind a number (Nov trust pass) ----------
   Every share, win rate, rating and trend says how much real data it rests on, and a small sample says so plainly
   ("Early read · 14 teams") instead of looking as solid as the rest. One table of thresholds for the whole page, so the
   same count reads the same way everywhere (CH.basis / CH.thin point here). Kinds:
   teams   share of teams (usage %)              early read under 100 teams
   games   win rate                              early read under 200 games
   sets    move / item / ability % of a set      early read under 50 teams (or battles)
   battles a Showdown sample                     early read under 500 battles
   rating  a 0-100 rating                        early read under 200 games
   record  one team's or core's win record       early read under 100 games
   recteams  a core's record counted in teams    early read under 30 teams
   arch    share of top teams                    early read under 30 teams
   days    a trend arrow                         early read under 7 days of history
   Counts come only from the data documents, never estimated; with no count, no caption is shown. */
const THIN={teams:100,games:200,sets:50,battles:500,rating:200,record:100,recteams:30,arch:30,days:7};
function thinFor(n,kind){const t=THIN[kind||'teams'];n=+n;return t!=null&&Number.isFinite(n)&&n>=0&&n<t}
/* 1,203 / 12.4k / 1.6M (short keeps captions on one line on phones) */
function basisNum(n,short){n=Math.round(+n);if(!Number.isFinite(n))return '';if(!short||n<10000)return n.toLocaleString('en-US');
  return n<1e6?(n/1000).toFixed(n<1e5?1:0).replace(/\.0$/,'')+'k':(n/1e6).toFixed(1).replace(/\.0$/,'')+'M'}
const basisUnit=(n,unit)=>+n===1||/s$/.test(unit)?unit:unit+'s';
/* the caption: "1,203 teams", or "Early read · 14 teams" for a small sample. unit is singular ("team", "game").
   o.pre: words before the count ("from", "of"); o.short: 12.4k style; o.tip: hover text; o.cls: extra class */
function basis(n,unit,kind,o){o=o||{};if(n==null||n==='')return '';n=+n;if(!Number.isFinite(n)||n<0)return '';
  const thin=thinFor(n,kind),u=basisUnit(n,unit),num=basisNum(n,o.short);
  const tip=o.tip||(thin?`Based on ${num} ${u}: a small sample, so this number can still move a lot`:`Based on ${num} ${u}`);
  return `<span class="basis${thin?' thin':''}${o.cls?' '+o.cls:''}" title="${esc(tip)}">${thin?'<i>Early read</i>':''}${o.pre?esc(o.pre)+' ':''}${num} ${esc(u)}</span>`}
/* what a set's percentages (moves, items, abilities) are a share of, from the list that field came from (setFor's st.src):
   tournament rows carry the Pokémon's own team count, Showdown's Mega rows their own battle count; the ladder list only has
   its total battles and the in-game lists no count at all, so those say where the numbers come from without a count.
   Returns {n, unit, kind, src, html} or null. */
function setBasis(p,st,f){try{if(!p||!st||!st.src)return null;const s=st.src[f||'mv'];
  if(s==='tour'){const row=findIn(META.doubles_tour,p,true)||findIn(META.doubles_tour,p);const n=row&&+row.teams;if(n>0)return {n,unit:'tournament team',kind:'sets',src:'tour',html:basis(n,'team','sets',{pre:'of',tip:`Share of the ${basisNum(n)} tournament teams that brought it (${windowWords('tour')})`})}}
  if(s==='sd'&&st.sd&&+st.sd.raw>0){const n=+st.sd.raw;return {n,unit:'Showdown battle',kind:'sets',src:'sd',html:basis(n,'Showdown battle','sets',{pre:'of',short:true,tip:`Share of the ${basisNum(n)} Showdown 1630+ battles it was in`})}}
  if(s==='ladder'){const b=META.doubles&&+META.doubles.battles;return b>0?{n:null,src:'ladder',html:`<span class="basis" title="The ladder list gives each Pokémon's share, not its own count; ${basisNum(b)} battles in the whole list">Showdown ladder · ${basisNum(b,true)} battles in all</span>`}:null}
  if(s==='live'||s==='game')return {n:null,src:s,html:'<span class="basis" title="The official in-game stats give shares only, without counts">in-game ranked battles</span>'};
  return null}catch(e){return null}}
/* plain-text version for text-only places (titles, the report-a-mistake context) */
function basisText(n,unit,kind,o){o=o||{};if(n==null||n==='')return '';n=+n;if(!Number.isFinite(n)||n<0)return '';
  return `${thinFor(n,kind)?'Early read · ':''}${o.pre?o.pre+' ':''}${basisNum(n,o.short)} ${basisUnit(n,unit)}`}
