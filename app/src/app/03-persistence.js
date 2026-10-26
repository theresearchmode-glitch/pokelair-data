// ---------- persistence: db (synced to your account) with browser fallback ----------
let db=null,uid=null,docRef=null,saveTimer=null;
let writing=null,pending=false,lastJson='';
function snapshot(){return JSON.stringify({slots:S.slots,box:S.box,teams:S.teams,loadedId:S.loadedId||null,format:S.format,maxMega:S.maxMega===2?2:1,megaGoal:megaGoal(),opp:S.opp,boxV:S.boxV,excl:S.excl,megaV:S.megaV,fun:!!S.fun,log:S.log||[]})}
async function flush(){if(!docRef)return;if(writing){pending=true;return}
  const j=snapshot();if(j===lastJson)return;writing=docRef.set(JSON.parse(j));
  try{await writing;lastJson=j}catch(e){if(e&&e.code==='quota_exceeded')toast('Storage is full. Delete a saved team.');else if(e&&e.code==='unavailable'){setTimeout(flush,1500+Math.random()*1000)}}
  finally{writing=null;if(pending){pending=false;flush()}}}
function persist(){LS.set('cc2.state',S);if(!docRef)return;clearTimeout(saveTimer);saveTimer=setTimeout(flush,700)}
(async()=>{try{
  const c=window.claude;if(!c||!c.use)return;
  const [d,u]=await Promise.all([c.use('db'),c.use('user')]);
  if(d){['doubles','doubles_ingame','doubles_tour','singles','status','teams','history','perf','results','model'].forEach(k=>{try{d.doc('meta/'+k).onSnapshot(s=>{const v=s.exists?s.data():null;noteDataDate(k,v);if(k==='model'){META.model=v&&typeof v==='object'&&v.mons?v:null;metaVersion++;scheduleRender();return}if(k==='results'){META.results=cleanResults(v);RES=META.results||(typeof RESULTS==='object'?RESULTS:null);planCache={key:null,plans:[]};recCache={key:null,val:null};metaVersion++;scheduleRender();return}META[k]=k==='status'?cleanStatus(v):k==='teams'?cleanTeams(v):k==='history'?cleanHistory(v):k==='perf'?cleanPerf(v):cleanMeta(v);usageCache={};metaVersion++;scheduleRender()},()=>{})}catch(e){}})}
  if(!d||!u)return;
  const id=await u.id();if(!id)return;db=d;uid=id;docRef=db.doc('data/users/'+uid+'/state');
  const snap=await docRef.get();
  if(snap.exists){const v=snap.data()||{};S={slots:Array.isArray(v.slots)?v.slots:S.slots,box:Array.isArray(v.box)?v.box.filter(x=>typeof x==='string'):S.box,teams:Array.isArray(v.teams)?v.teams.filter(t=>t&&t.id&&Array.isArray(t.slots)).slice(0,10):[],loadedId:v.loadedId||null,format:v.format==='singles'?'singles':'doubles',maxMega:v.maxMega===2?2:1,megaGoal:[0,1,2].includes(v.megaGoal)?v.megaGoal:undefined,opp:Array.isArray(v.opp)?v.opp:[],boxV:v.boxV,excl:Array.isArray(v.excl)?v.excl:[],megaV:v.megaV,fun:!!v.fun,log:Array.isArray(v.log)?v.log:[]};S.format='doubles';fixSlots();fixTeams();fixLog();LS.set('cc2.state',S);render()}
  else{await flush()}
  lastJson=snapshot();
  $('saveWhere').textContent='Up to 10 teams. Saved to your Claude account, so they follow you across devices.';
}catch(e){}})();
