// ---------- persistence: db (synced to your account) with browser fallback ----------
let db=null,uid=null,docRef=null,saveTimer=null;
// when the last data document arrived (load speed, Nov 1): background work waits until the pieces stop arriving
var META_AT=0;
let writing=null,pending=false,lastJson='';
// Multi-device safety (Nov 7, Sim): each part of your data (box, saved teams, current team, …) is saved on its own, and only
// when it changed, so a phone or tab that was open with older data can't overwrite what you did on another device. The page
// also listens for your other devices' changes and takes them in live, unless this device has its own unsaved change to
// that same part (then this device's newer change wins when it saves).
let saved={},docExists=false;
function snapObj(){return JSON.parse(snapshot())}
function snapshot(){return JSON.stringify({slots:S.slots,box:S.box,teams:S.teams,loadedId:S.loadedId||null,format:S.format,maxMega:S.maxMega===2?2:1,megaGoal:megaGoal(),opp:S.opp,boxV:S.boxV,excl:S.excl,megaV:S.megaV,log:S.log||[]})}
// the account document in the page's own shape (the same cleaning as when the page opens)
function fromDoc(v){return {slots:Array.isArray(v.slots)?v.slots:S.slots,box:Array.isArray(v.box)?v.box.filter(x=>typeof x==='string'):S.box,teams:Array.isArray(v.teams)?v.teams.filter(t=>t&&t.id&&Array.isArray(t.slots)).slice(0,10):[],loadedId:v.loadedId||null,format:'doubles',maxMega:v.maxMega===2?2:1,megaGoal:[0,1,2].includes(v.megaGoal)?v.megaGoal:undefined,opp:Array.isArray(v.opp)?v.opp:[],boxV:v.boxV,excl:Array.isArray(v.excl)?v.excl:[],megaV:v.megaV,log:Array.isArray(v.log)?v.log:[]}}
const fieldJ=o=>{const r={};for(const k in o)r[k]=JSON.stringify(o[k]===undefined?null:o[k]);return r};
async function flush(){if(!docRef)return;if(writing){pending=true;return}
  const o=snapObj(),J=fieldJ(o),patch={};for(const k in J)if(saved[k]!==J[k])patch[k]=o[k]===undefined?null:o[k];
  if(!Object.keys(patch).length)return;
  writing=docExists?docRef.update(patch):docRef.set(o);
  try{await writing;docExists=true;for(const k in patch)saved[k]=J[k];lastJson=snapshot();syncNote('saved')}
  catch(e){if(e&&e.code==='quota_exceeded')toast('Storage is full. Delete a saved team.');else if(e&&e.code==='invalid_argument'&&docExists){docExists=false;pending=true}else if(e&&e.code==='unavailable'){setTimeout(flush,1500+Math.random()*1000)}}
  finally{writing=null;if(pending){pending=false;flush()}}}
function persist(){LS.set('cc2.state',S);if(!docRef)return;clearTimeout(saveTimer);saveTimer=setTimeout(flush,700)}
// a change from your other device: take each part that changed there, unless this device changed that part and hasn't saved it yet
function takeRemote(v){const N=fromDoc(v),RJ=fieldJ(N),o=snapObj(),LJ=fieldJ(o),got=[];
  for(const k in RJ){if(!(k in v))continue;if(RJ[k]===LJ[k]){saved[k]=RJ[k];continue}if(saved[k]!==undefined&&LJ[k]!==saved[k])continue;S[k]=N[k];saved[k]=RJ[k];got.push(k)}
  if(!got.length)return;fixSlots();fixTeams();fixLog();LS.set('cc2.state',S);lastJson=snapshot();
  if(got.some(k=>k==='slots'||k==='loadedId')&&typeof ui==='object'){ui.undoStack=[];ui.undo=null}
  render();toast(got.includes('box')&&got.length===1?'Your box was updated from your other device':'Updated from your other device');syncNote('saved')}
// the line under Saved teams and My box that says where your data lives
function syncNote(st){const t=st==='local'?'Saved in this browser only: this device isn’t connected to your Claude account.':'Saved to your Claude account and kept in step across your devices.';
  ['saveWhere','boxSync'].forEach(id=>{const el=$(id);if(el)el.textContent=id==='saveWhere'?'Up to 10 teams. '+t:t})}
(async()=>{try{
  const c=window.claude;if(!c||!c.use)return;
  const [d,u]=await Promise.all([c.use('db'),c.use('user')]);
  if(d){['doubles','doubles_ingame','doubles_tour','singles','status','teams','history','perf','results','model','events','track','practice','weekly','calendar'].forEach(k=>{try{d.doc('meta/'+k).onSnapshot(s=>{META_AT=performance.now();const v=s.exists?s.data():null;/* weekly digest and event calendar (Nov): their own cleaners, kept out of the data-date line (a fresh calendar must not hide stale results) */
    if(k==='weekly'||k==='calendar'){try{META[k]=k==='weekly'?cleanWeekly(v):cleanCalendar(v)}catch(e){META[k]=null}metaVersion++;scheduleRender();return}noteDataDate(k,v);if(k==='perf')META.reg=v&&typeof v==='object'&&v.reg&&typeof v.reg==='object'&&/^[A-Z]-[A-Z]$/.test(v.reg.id)?v.reg:null;if(k==='perf')setTimeout(()=>{if(typeof RESULTS==='object'&&RES===RESULTS&&!builtinOk()){RES=META.results||null;planCache={key:null,plans:[]};recCache={key:null,val:null};metaVersion++;scheduleRender()}},0);if(k==='practice'){META.practice=typeof cleanPractice==='function'?cleanPractice(v):null;/* only the practice page uses it: no full redraw (Nov) */if(typeof view!=='undefined'&&view==='practice'&&typeof renderPractice==='function'&&(!META.practice||pr.step==='start'))safe('practice',renderPractice);return}if(k==='model'){META.model=v&&typeof v==='object'&&v.mons?v:null;metaVersion++;scheduleRender();return}if(k==='track'){META.track=typeof cleanTrack==='function'?cleanTrack(v):null;if(typeof view!=='undefined'&&view==='track'&&typeof renderTrack==='function')safe('track record',renderTrack);if(typeof view!=='undefined'&&view==='home')scheduleRender();return}if(k==='results'){META.results=cleanResults(v);RES=META.results||(typeof RESULTS==='object'&&builtinOk()?RESULTS:null);planCache={key:null,plans:[]};recCache={key:null,val:null};metaVersion++;scheduleRender();return}META[k]=k==='status'?cleanStatus(v):k==='teams'?cleanTeams(v):k==='history'?cleanHistory(v):k==='perf'?cleanPerf(v):k==='events'?cleanEvents(v):cleanMeta(v);usageCache={};metaVersion++;scheduleRender()},()=>{})}catch(e){}})}
  if(!d||!u){syncNote('local');return}
  const id=await u.id();if(!id){syncNote('local');return}db=d;uid=id;
  // the account's copy is read first; only then can this device save (a change made in the first moment can't overwrite it)
  const ref=db.doc('data/users/'+uid+'/state'),snap=await ref.get();
  if(snap.exists){const v=snap.data()||{};S=fromDoc(v);fixSlots();fixTeams();fixLog();LS.set('cc2.state',S);saved=fieldJ(fromDoc(v));docExists=true;render()}
  docRef=ref;if(!snap.exists)await flush();
  lastJson=snapshot();syncNote('saved');
  try{ref.onSnapshot(s2=>{try{if(!s2||!s2.exists||(s2.metadata&&s2.metadata.hasPendingWrites))return;docExists=true;takeRemote(s2.data()||{})}catch(e){}},()=>{})}catch(e){}
}catch(e){}})();
