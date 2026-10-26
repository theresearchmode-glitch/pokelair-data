// ---------- state ----------
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let S=LS.get('cc2.state',null);
if(S&&(!Array.isArray(S.teams)||!Array.isArray(S.box)||!Array.isArray(S.slots)))S=null;
if(!S){S={slots:DEFAULT_TEAM.slots.map(s=>({...s})),box:DEFAULT_BOX.slice(),teams:[{id:'t'+Date.now(),name:DEFAULT_TEAM.name,slots:DEFAULT_TEAM.slots,format:'doubles',saved:Date.now()}],loadedId:null,format:'doubles'};S.loadedId=S.teams[0].id}
S.format='doubles'; // doubles only for now: singles is hidden, saved singles teams stay stored
const META={doubles:null,doubles_ingame:null,doubles_tour:null,singles:null,status:null,teams:null,history:null,perf:null,results:null};
// meta/perf: raw outside performance tables from the daily refresh; anything malformed is dropped and the built-in snapshot is used
function cleanPerf(v){if(!v||typeof v!=='object')return null;const okRows=x=>Array.isArray(x)&&x.length<=600;const t=v.tour;if(!t||!okRows(t.rows)||t.rows.length<20)return null;return v}
const SRC={ingame:'doubles_ingame',tour:'doubles_tour',ladder:'doubles'};
// Meta documents are written by the daily refresh from scraped pages, so treat them as untrusted:
// keep only known fields, coerce numbers, cap list sizes. A bad row is dropped, never rendered.
const num=v=>{const n=typeof v==='number'?v:parseFloat(v);return Number.isFinite(n)?n:null};
const str=(v,max=200)=>typeof v==='string'?v.slice(0,max):'';
const pairs=(a,max=10)=>Array.isArray(a)?a.filter(x=>Array.isArray(x)&&typeof x[0]==='string').slice(0,max).map(x=>[x[0].slice(0,60),num(x[1])]):[];
function cleanMeta(d){if(!d||typeof d!=='object')return null;
  const row=t=>t&&typeof t.n==='string'?{r:Math.max(1,Math.round(num(t.r)||0)),n:t.n.slice(0,60),u:num(t.u),teams:num(t.teams),w:num(t.w),ab:pairs(t.ab),it:pairs(t.it),mv:pairs(t.mv,12),na:pairs(t.na),tm:pairs(t.tm),cc:pairs(t.cc,6),sp:pairs(t.sp,3).filter(([k])=>/^[A-Z][a-z]+:\d+(\/\d+){5}$/.test(k))}:null;
  const out={format:str(d.format,20),kind:str(d.kind,20),source:str(d.source),period:str(d.period),note:str(d.note,300),battles:num(d.battles),updated:str(d.updated,40),
    top:(Array.isArray(d.top)?d.top:[]).slice(0,60).map(row).filter(Boolean),more:(Array.isArray(d.more)?d.more:[]).slice(0,40).map(row).filter(Boolean)};
  if(d.smogon&&typeof d.smogon==='object')out.smogon={source:str(d.smogon.source),period:str(d.smogon.period),battles:num(d.smogon.battles),usage:pairs(d.smogon.usage,80)};
  return out}
function cleanStatus(d){if(!d||typeof d!=='object')return null;return {lastRun:str(d.lastRun,40),ok:d.ok!==false,note:str(d.note,300),schedule:str(d.schedule,80)}}
function liveUsage(fmt){const d=META[fmt];if(!d)return null;const m=new Map();
  if(fmt==='doubles')(d.top||[]).forEach(t=>{if(typeof t.u==='number')m.set(t.n,t.u)});
  else ((d.smogon&&d.smogon.usage)||[]).forEach(([n,u])=>m.set(n,u));
  return m.size?m:null}
let usageCache={};
function U(p){const f=S.format;if(!(f in usageCache))usageCache[f]=liveUsage(f);const m=usageCache[f];if(m)return m.get(p.n)||0;return (f==='singles'?p.us:p.u)||0}
function metaDoc(){return S.format==='singles'?META.singles:META[SRC[ui.metaSrc]]}
