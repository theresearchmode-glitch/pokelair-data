// Stress test: data integrity of every file the page reads (out/*.json = the db docs) and the sprites.
// Every Pokémon, move and item name must resolve; no duplicates; no dates in the future; no negative counts; no
// percentages outside 0-100; win rates 0-1 where stored as fractions; every roster Pokémon has a sprite file.
// Usage: node experiments/stress-data.mjs   (exit 1 on any problem)
import fs from 'node:fs'; import {openPage, baseDocs, rd, APP} from './stress-lib.mjs';
const D = baseDocs(); D['raw/events'] = rd('events.json'); D['raw/official'] = rd('official.json'); D['raw/tc'] = rd('limitless.json')?.results?.tc;
const {ev, errs, close} = await openPage();
const r = await ev(`(()=>{const D=__arg,P=[],bad=(f,m)=>P.push(f+': '+m);const today=new Date(Date.now()+864e5).toISOString().slice(0,10);
  const items=new Set(typeof REGMC_ITEMS==='object'?REGMC_ITEMS:[]),mon=n=>byName.has(n),move=n=>mvByName.has(n);
  const pct=(f,k,v)=>{if(v==null)return;if(typeof v!=='number'||!isFinite(v)||v<0||v>100)bad(f,k+' = '+v)};
  const cnt=(f,k,v)=>{if(typeof v!=='number'||!isFinite(v)||v<0)bad(f,k+' = '+v)};
  const date=(f,k,v)=>{if(!v)return;const s=String(v).slice(0,10);if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(s))bad(f,k+' bad date '+v);else if(s>today)bad(f,k+' in the future '+v)};
  // results (meta/results)
  {const R=D['meta/results'],f='results';if(!R)bad(f,'missing');else{if(!(R.base>.4&&R.base<.6))bad(f,'base '+R.base);
    for(const [n,v] of Object.entries(R.mons||{})){if(!mon(n))bad(f,'mons: unknown '+n);cnt(f,'mons '+n+' teams',+v[0]);if(!(v[1]>=0&&v[1]<=1))bad(f,'mons '+n+' wr '+v[1])}
    for(const [k,v] of Object.entries(R.pairs||{})){const ns=k.split('|');if(ns.length!==2||ns.some(n=>!mon(n)))bad(f,'pairs: unknown '+k);if(ns[0]===ns[1])bad(f,'pair with itself '+k);if([...ns].sort().join('|')!==k)bad(f,'pair key not sorted '+k);if(!(v[1]>=0&&v[1]<=1))bad(f,'pair wr '+k+' '+v[1])}
    const ck=new Set();for(const c of R.cores||[]){const ns=c.slice(0,3);if(ns.some(n=>!mon(n)))bad(f,'core unknown '+ns);if(new Set(ns).size<3)bad(f,'core repeats '+ns);const k=[...ns].sort().join('|');if(ck.has(k))bad(f,'duplicate core '+k);ck.add(k);cnt(f,'core teams',c[3]);if(!(c[4]>=0&&c[4]<=1))bad(f,'core wr '+c[4])}
    const pk=new Set();for(const e of R.proven||[]){const [ns,n,wr,g]=e;if(!Array.isArray(ns)||ns.length!==6)bad(f,'proven team of '+(ns&&ns.length));else{if(ns.some(x=>!mon(x)))bad(f,'proven unknown '+ns.filter(x=>!mon(x)));const bs=ns.map(x=>byName.get(x)).filter(Boolean).map(p=>p.b);if(new Set(bs).size!==bs.length)bad(f,'proven team breaks Species Clause '+ns);      const k=[...ns].sort().join('|');if(pk.has(k))bad(f,'duplicate proven team '+k);pk.add(k)}cnt(f,'proven n',n);if(!(wr>=0&&wr<=1))bad(f,'proven wr '+wr);if(g!=null)cnt(f,'proven games',g)}}}
  // top-cut evidence (results.tc)
  {const T=D['raw/tc'],f='results.tc';if(!T)bad(f,'missing');else{date(f,'asOf',T.asOf);if(!(T.base>.4&&T.base<.6))bad(f,'base '+T.base);
    for(const [n,x] of Object.entries(T.rows||{})){if(!mon(n))bad(f,'unknown '+n);pct(f,n+' field',x[0]);pct(f,n+' top',x[1]);if(!(x[2]>0&&x[2]<20))bad(f,n+' lift '+x[2]);pct(f,n+' wr',x[3]);cnt(f,n+' games',x[4]);pct(f,n+' rw',x[5]);if(x[6]!=null&&!(x[6]>=0&&x[6]<=1))bad(f,n+' gem stability '+x[6])}
    const sumF=Object.values(T.rows).reduce((a,x)=>a+x[0],0);if(sumF<550||sumF>620)bad(f,'field shares sum to '+sumF.toFixed(1)+'% (6 per team = 600)');
    for(const [k,x] of Object.entries(T.br||{})){if(!mon(k))bad(f,'bring/lead unknown '+k);cnt(f,'br games',x[0]);pct(f,'br brought',x[1]);pct(f,'br led',x[2]);if(x[2]>x[1])bad(f,k+' led more than brought')}}}
  // model
  {const M=D['meta/model'],f='model';if(!M)bad(f,'missing');else{date(f,'updated',M.updated);for(const [n,v] of Object.entries(M.mons||{})){if(!mon(n))bad(f,'mons unknown '+n);if(typeof v!=='number'||!isFinite(v))bad(f,'mons '+n+' = '+v)}
    for(const [k,v] of Object.entries(M.pairs||{})){if(k.split('|').some(n=>!mon(n)))bad(f,'pair unknown '+k);if(!isFinite(+v))bad(f,'pair '+k+' = '+v)}}}
  // events (Limitless top 8 + RK9 top 16)
  {const E=D['raw/events'],f='events';if(!E)bad(f,'missing');else{date(f,'updated',E.updated);const dn=E.dict.length,ids=new Set();
    for(const e of E.events){if(ids.has(e.id))bad(f,'duplicate event '+e.id);ids.add(e.id);date(f,e.id,e.date);cnt(f,e.id+' players',e.players);if((e.top||[]).length>e.players)bad(f,e.id+' more top teams than players');
      let last=0;for(const t of e.top||[]){const [pl,place,rec,ms]=t;if(place<last)bad(f,e.id+' places out of order');last=place;if(place>e.players)bad(f,e.id+' place '+place+' > players');
        if(rec&&!/^\\d+-\\d+(-\\d+)?$/.test(rec))bad(f,e.id+' record '+rec);
        const names=(ms||[]).map(m=>E.dict[m[0]]);if(names.length!==6)bad(f,e.id+' '+pl+' team of '+names.length);
        const bs=names.map(n=>byName.get(n)).filter(Boolean).map(p=>p.b);if(new Set(bs).size!==bs.length)bad(f,e.id+' '+pl+' Species Clause '+names);
        const its=(ms||[]).map(m=>canonItem(E.dict[m[1]])).filter(x=>x&&!/^(none|nothing|no item)$/i.test(x));if(new Set(its).size!==its.length)bad(f,e.id+' '+pl+' Item Clause '+its);
        for(const m of ms||[]){if(m.flat?m.flat(2).some(i=>typeof i==='number'&&(i<0||i>=dn)):0)bad(f,'dict index out of range');const n=E.dict[m[0]],it=canonItem(E.dict[m[1]]);
          if(!mon(n))bad(f,'unknown Pokémon '+n);if(it&&!items.has(it)&&!/^(none|nothing|no item)$/i.test(it))bad(f,'item not legal in Reg M-C: '+it+' ('+n+')');
          for(const k of m[4]||[]){const mv=canonMove(E.dict[k].replace(/[’‘]/g,"'"),byName.get(n));if(!move(mv))bad(f,'unknown move '+mv+' ('+n+')');else if(byName.get(n)&&!(LEARN[n]||[]).some(i=>MV[i]&&MV[i].name===mv))bad(f,n+' cannot learn '+mv)}}}}}}
  // teams (home page sheets), history, usage sources
  {const T=D['meta/teams'],f='teams';if(T){date(f,'updated',T.updated);for(const t of T.teams||[]){const ns=(t.mons||t.team||[]).map(m=>typeof m==='string'?m:m.n);if(ns.length!==6)bad(f,(t.player||'?')+' team of '+ns.length);for(const n of ns)if(!mon(n))bad(f,'unknown '+n)}}}
  {const H=D['meta/history'],f='history';if(H){const ds=new Set();for(const d of H.days||[]){date(f,'day',d.d);if(ds.has(d.d))bad(f,'duplicate day '+d.d);ds.add(d.d);for(const [src,o] of Object.entries(d)){if(src==='d'||!o||typeof o!=='object')continue;for(const [n,v] of Object.entries(o)){if(!mon(n))bad(f,'unknown '+n+' ('+src+')');if(!(v>=1&&Number.isInteger(v)))bad(f,'rank '+n+' '+v)}}}}}
  for(const k of ['meta/doubles_tour','meta/doubles','meta/doubles_ingame']){const M=D[k],f=k;if(!M){bad(f,'missing');continue}date(f,'updated',M.updated);const seen=new Set();
    for(const x of [...(M.top||[]),...(M.more||[])]){if(!mon(x.n))bad(f,'unknown '+x.n);if(seen.has(x.n))bad(f,'duplicate '+x.n);seen.add(x.n);pct(f,x.n+' usage',x.u);pct(f,x.n+' win',x.w);if(x.teams!=null)cnt(f,x.n+' teams',x.teams);
      for(const key of ['mv','it','ab','tm','nt']){for(const e of x[key]||[]){pct(f,x.n+' '+key+' '+e[0],e[1]);if(key==='mv'&&!move(canonMove(e[0],byName.get(x.n))))bad(f,x.n+' unknown move '+e[0]);if(key==='tm'&&!mon(e[0]))bad(f,x.n+' unknown teammate '+e[0]);if(key==='it'&&e[0]&&!items.has(canonItem(e[0]))&&!STONE_RE.test(canonItem(e[0]))&&!/^(nothing|other|none|no item)$/i.test(e[0]))bad(f,x.n+' item not legal: '+e[0])}}}}
  // RK9 official sheets
  {const O=D['raw/official'],f='official';if(O){for(const e of O.events||[]){date(f,e.name,e.date);for(const t of e.teams||[]){for(const m of t.team||t.mons||[]){const n=typeof m==='string'?m:m.n||m.name;if(n&&!mon(n))bad(f,'unknown '+n+' ('+e.name+')')}}}}}
  // sprites: every roster Pokémon has one
  const spr=ROSTER.map(p=>[p.n,SPRITE_ID[p.n]]);
  return {P,spr,nRoster:ROSTER.length}})()`, D);
await close();
const have = new Set(fs.readdirSync(APP + 'sp').map(f => f.replace(/\.webp$/, '')));
const noId = r.spr.filter(([, id]) => !id).map(([n]) => n), noFile = r.spr.filter(([, id]) => id && !have.has(String(id))).map(([n, id]) => `${n} (${id})`);
if (noId.length) r.P.push(`sprites: no sprite id for ${noId.join(', ')}`); if (noFile.length) r.P.push(`sprites: missing file for ${noFile.join(', ')}`);
// what a player registered on a real sheet (two Life Orbs, a move the dex says it can't learn) is shown as registered:
// a warning about the source, not a page bug
const isWarn = p => /^events: .*(Item Clause|cannot learn)/.test(p); const W = r.P.filter(isWarn); r.P = r.P.filter(p => !isWarn(p));
for (const w of W) console.log('  warning (source sheet):', w);
const agg = {}; for (const p of r.P) { const k = p.replace(/\d+(\.\d+)?/g, '#').slice(0, 100); (agg[k] = agg[k] || []).push(p); }
for (const [k, v] of Object.entries(agg).sort((a, b) => b[1].length - a[1].length)) console.log(`  ${v.length}× ${v[0]}`);
console.log(`checked ${r.nRoster} Pokémon sprites; page errors: ${errs.length} ${errs.slice(0, 3).join(' | ')}`);
console.log(r.P.length || errs.length ? `STRESS DATA: ${r.P.length} problems` : 'STRESS DATA CLEAN'); process.exit(r.P.length || errs.length ? 1 : 0);
