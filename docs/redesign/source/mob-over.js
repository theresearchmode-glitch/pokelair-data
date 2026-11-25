for(const[id,c]of[['hero','#E8364F'],['grade','#0078BF'],['pairs','#E9A800'],['prev','#F05A28'],['speed','#F05A28'],['week','#7B4BD6']])$(id).style.setProperty('--sec',c);
{ // pairs
  const P=D.pair,ca=M[P.a.n].a,cb=M[P.b.n].a;
  $('pairs').innerHTML=`<div class="lean" style="left:36px;top:462px;width:170px;height:250px;background:linear-gradient(180deg,${rgb(cb,.6*K)},${rgb(cb,.1*K)});transform:skewX(-10deg)"></div><div class="lean" style="left:184px;top:462px;width:170px;height:250px;background:linear-gradient(180deg,${rgb(ca,.6*K)},${rgb(ca,.1*K)});transform:skewX(10deg)"></div>`
    +`<div class="floor" style="top:712px"></div>`+stand(P.b,106,712,186,{flip:1,refl:1})+stand(P.a,284,712,186,{refl:1})
    +`<div class="cap" style="left:106px;top:726px">${P.b.d}<i>${P.b.r}</i></div><div class="cap" style="left:284px;top:726px">${P.a.d}<i>${P.a.r}</i></div>`
    +`<div class="txt" style="top:64px"><div class="eyebrow">Build · Winning cores</div><h2>Doubles is played <b>in pairs.</b></h2>
      <p class="lede">${P.a.d} and ${P.b.d} win more together than the average team does.</p>
      <div class="duo"><div><b>${P.w}%</b><span>won together, ${N(P.n)} teams</span><i style="width:${P.w/60*100}%;background:var(--plot)"></i></div><div><b>${D.base}%</b><span>the average team</span><i style="width:${D.base/60*100}%;background:var(--ink3)"></i></div></div>
      <div class="acts"><span class="link">Find my best partners</span></div></div>`;
}
{ // team preview: their six, then the four, then the bench
  const t=D.team;let h=`<div class="role" style="top:330px">THEIR SIX · THE META'S TOP SIX</div><div class="floor" style="top:420px"></div>`;
  D.them.forEach((m,i)=>{h+=stand(m,42+61.2*i,420,62,{so:.7});});
  h+=`<div class="brk" style="left:24px;right:24px;top:494px"><span>The four NastyPlot brings</span></div><div class="floor" style="top:626px"></div>`;
  t.slice(0,4).forEach((m,i)=>{const cx=64+87.5*i,role=i<2?'Lead':'Back';h+=stand(m,cx,626,104,{refl:1})+`<div class="cap" style="left:${cx}px;top:638px">${m.d}<small class="${role.toLowerCase()}">${role}</small></div>`;});
  h+=`<div class="floor" style="top:776px"></div>`;
  t.slice(4).forEach((m,i)=>{const cx=64+87.5*i;h+=stand(m,cx,776,72,{so:.5,st:'filter:saturate(.3) opacity(.7);'})+`<div class="cap" style="left:${cx}px;top:786px">${m.d}<small>Bench</small></div>`;});
  $('prev').innerHTML=h+`<div class="txt" style="top:64px"><div class="eyebrow">Battle · Team preview</div><h2>See their six.<br><b>Pick your four.</b></h2>
    <p class="lede">Against the meta's top six, NastyPlot brings four of the sample team: <b>${t[0].d} and ${t[1].d} lead</b>, ${t[2].d} and ${t[3].d} wait in the back.</p></div>
    <div style="position:absolute;z-index:5;left:24px;top:846px"><span class="link">Open Battle mode</span></div>`;
}
{ // speed list, no colour pools
  const sp=[...D.speed].sort((x,y)=>y.sp-x.sp);let sd='';
  sp.forEach((m,i)=>{const y=250+76*i;sd+=`<div class="srow" style="top:${y}px">${img(m,0,0,72)}<div class="nm">${m.d}</div><i class="bar" style="width:${Math.round(m.sp/142*190)}px;background:${accent(M[m.n].a)}"></i><div class="sp">${m.sp}</div></div>`;});
  $('speed').innerHTML=sd+`<div class="txt" style="top:64px"><div class="eyebrow">Battle · Speed tiers</div><h2>Who moves <b>first.</b></h2><div class="seg"><span class="on">No field</span><span>Tailwind</span><span>Trick Room</span></div></div>
    <div style="position:absolute;left:24px;top:716px;font-size:14px;color:var(--ink2)">Base Speed. Switch the field and the order changes.</div>`;
}
{ // this week, no colour pools
  let wk='';const up=DARK?'#5FD08F':'#16693B',dn=DARK?'#A8B4FF':'#2F3FC8';
  const row=(arr,by)=>arr.forEach((m,i)=>{const cx=75+120*i,lift=m.v*11,z=96,cy=by-lift,u=m.v>0;wk+=`<i class="stem" style="left:${cx}px;top:${Math.min(by,cy)}px;height:${Math.abs(lift)}px"></i>`+img(m,cx-z/2,cy-z/2-(u?z*.5:-z*.5),z,'z-index:3')
    +`<div class="v" style="left:${cx}px;top:${u?cy-z-34:cy+z+8}px;color:${u?up:dn}">${u?'+':'−'}${Math.abs(m.v)}</div><div class="cap" style="left:${cx}px;top:${u?by+10:by-28}px">${m.d}</div>`;});
  row(D.up,460);row(D.down,540);
  const fd=s=>new Date(s+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
  $('week').innerHTML=wk+`<div class="floor" style="top:460px"></div><div class="floor" style="top:540px"></div>
    <div class="txt" style="top:64px"><div class="eyebrow">Meta · ${fd(D.wk.from)} to ${fd(D.wk.to)}</div><h2>What moved <b>this week.</b></h2><p class="lede">Points of usage gained or lost across ${N(D.wk.n)} teams.</p></div>
    <div style="position:absolute;z-index:5;left:24px;top:756px"><span class="link">See the whole meta</span></div>`;
}
