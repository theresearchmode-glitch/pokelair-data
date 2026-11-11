// ---------- saved teams: the data steps (R4, Nov 11; shared with the new build, which draws its own sheet) ----------
// Each changes S only and returns the team (or null when it can't); the caller draws, persists and toasts.
function saveTeamAs(name,over){name=(name||'').trim()||'Untitled team';const slots=JSON.parse(JSON.stringify(S.slots));
  if(over){const t=S.teams.find(t=>t.id===S.loadedId);if(!t)return null;t.name=name;t.slots=slots;t.format=S.format;t.saved=Date.now();return t}
  if(S.teams.length>=10)return null;const id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);const t={id,name,slots,format:S.format,saved:Date.now()};S.teams.push(t);S.loadedId=id;return t}
function openSaved(id){const t=S.teams.find(t=>t.id===id);if(!t)return null;keepUndo();S.slots=JSON.parse(JSON.stringify(t.slots));fixSlots();S.loadedId=t.id;S.format='doubles';return t}
function renameSaved(id,v){const t=S.teams.find(t=>t.id===id);v=(v||'').trim();if(t&&v)t.name=v;return t||null}
function deleteSaved(id){const t=S.teams.find(t=>t.id===id);if(!t)return null;S.teams=S.teams.filter(x=>x.id!==id);if(S.loadedId===id)S.loadedId=null;return t}
// One row per saved doubles team (singles teams from the retired mode stay stored but hidden), each full six with the same
// Strength Score as My Team (Nov 2), sorted: 'name', 'rating' (readiness) or newest first. Today's Saved Teams draws these rows.
function savedRows(sort){const order=S.teams.filter(t=>t.format!=='singles').map(t=>{const r=teamRating(t.slots);let ts=null,ck=null,G=null,RD=null;try{if(r.ms.length===6){ck=proChecks(r.ms,true);RD=prepOf(r.ms);ts=tsInfo(r.ms);G=RD?Object.assign(CH.gradeOf(RD,ck,r.ms),{r:RD.score}):null}}catch(e){}return {t,r,ts,ck,G,RD}});
  if(sort==='name')order.sort((x,y)=>x.t.name.localeCompare(y.t.name));
  else if(sort==='rating')order.sort((x,y)=>((y.ts?y.ts.score:-1)-(x.ts?x.ts.score:-1))||x.r.a.excess-y.r.a.excess);
  else order.sort((x,y)=>y.t.saved-x.t.saved);
  return order}
