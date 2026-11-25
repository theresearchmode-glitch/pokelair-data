// ---------- Gauntlet: your team against real top tournament teams ----------
let gauntCache={key:null,rows:null};
function gauntletTeams(){const d=META.teams;if(d&&d.teams&&d.teams.length)return d.teams.slice(0,20).map(t=>({who:teamWho(t),player:t.player,ev:t.event,mons:t.mons}));
  const pv=RES&&Array.isArray(RES.proven)?RES.proven:[];return pv.slice(0,20).map(x=>({who:`Won ${pctTxt(x[2]*100)} of games across ${x[1]} entr${x[1]===1?"y":"ies"}`,ev:'Proven team list',mons:x[0]}))}
function gauntletScore(mine,theirs,useA){const r=planMatchup(mine,theirs,useA);let s=0,n=0;for(const i of r.chosen)for(let j=0;j<theirs.length;j++){s+=r.h.M[i][j];n++}
  // their side: how many of their six your four can't handle
  const loose=theirs.map((o,j)=>j).filter(j=>!r.chosen.some(i=>r.h.M[i][j]>=.75));return {r,s:n?s/n:0,loose}}
// Matchup prep (Oct 28): no win percentages. Your six against their six with the threat-preparation engine both ways: how
// ready you are for each of their Pokémon, and how ready they are for each of yours. Their six are built exactly the way
// your own would be with default sets (same moves, abilities and team-aware items), so a mirror reads the same both ways.
// The Battle mode planner still suggests the four to bring and the two to lead.
function gauntletPrep(ms,names){const mine=ms.map(THR.fromMember);
  const theirMs=assignItems(names.map(n=>memberOf({n,a:null,lock:false},-1)).filter(Boolean)),theirs=theirMs.map(THR.fromMember);
  const mm=THR.teamModes(mine),tm=THR.teamModes(theirs);
  const you=theirs.map(t=>THR.vsThreat(mine,{...t,w:1},mm)),them=mine.map(t=>THR.vsThreat(theirs,{...t,w:1},tm));
  return {you,them,yN:you.filter(r=>r.level>=2).length,tN:them.filter(r=>r.level>=2).length,n:theirs.length}}
