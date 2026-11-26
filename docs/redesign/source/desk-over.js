{ // pairs: two panels leaning on each other, and the numbers as plain bars (no giant number)
  const P=D.pair,ca=M[P.a.n].a,cb=M[P.b.n].a;
  $('pairs').innerHTML=`<div class="lean" style="left:668px;background:linear-gradient(180deg,${rgb(cb,.6*K)},${rgb(cb,.1*K)});transform:skewX(-11deg)"></div><div class="lean" style="left:972px;background:linear-gradient(180deg,${rgb(ca,.6*K)},${rgb(ca,.1*K)});transform:skewX(11deg)"></div>`
    +`<div class="floor" style="left:600px;right:96px;top:590px"></div>`+stand(P.b,812,590,340,{flip:1,refl:1})+stand(P.a,1142,590,340,{refl:1})
    +`<div class="cap" style="left:812px;top:610px">${P.b.d}<i>${P.b.r}</i></div><div class="cap" style="left:1142px;top:610px">${P.a.d}<i>${P.a.r}</i></div>`
    +`<div class="txt" style="top:140px"><div class="eyebrow">Build · Winning cores</div><h2>Doubles is played <b>in pairs.</b></h2>
      <p class="lede">${P.a.d} and ${P.b.d} win more together than the average team does. NastyPlot knows every pairing like this one.</p>
      <div class="duo"><div><b>${P.w}%</b><span>of games won together, across ${N(P.n)} teams</span><i style="width:${P.w/60*100}%;background:var(--plot)"></i></div><div><b>${D.base}%</b><span>the average team</span><i style="width:${D.base/60*100}%;background:var(--ink3)"></i></div></div>
      <div class="acts" style="margin-top:22px"><span class="link">Find the best partner for my six</span></div></div>`;
}
{ // team preview: two calm lines, nothing stacked or cut off
  const cx=i=>668+124*i;let h=`<div class="role" style="left:978px;top:118px">THEIR SIX · THE META'S TOP SIX</div><div class="floor" style="left:600px;right:60px;top:262px"></div>`;
  D.them.forEach((m,i)=>{h+=stand(m,cx(i),262,100,{so:.7})+`<div class="cap" style="left:${cx(i)}px;top:276px;font-weight:500">${m.d}</div>`;});
  h+=`<div class="brk" style="left:${cx(0)-58}px;width:${124*3+116}px;top:384px"><span>The four NastyPlot brings</span></div><div class="floor" style="left:600px;right:60px;top:590px"></div>`;
  D.team.forEach((m,i)=>{const role=i<2?'Lead':i<4?'Back':'Bench',on=i<4;h+=stand(m,cx(i),590,on?150:112,{refl:on,so:on?1:.5,st:on?'':'filter:saturate(.3) opacity(.65);'})+`<div class="cap" style="left:${cx(i)}px;top:608px">${m.d}<small class="${role.toLowerCase()}">${role}</small></div>`;});
  const t=D.team;
  $('prev').innerHTML=h+`<div class="txt" style="top:190px"><div class="eyebrow">Battle · Team preview</div><h2>See their six.<br><b>Pick your four.</b></h2>
    <p class="lede">Against the meta's top six, NastyPlot brings four of the sample team: <b>${t[0].d} and ${t[1].d} lead</b>, ${t[2].d} and ${t[3].d} wait in the back, and two stay on the bench.</p>
    <div class="acts"><span class="link">Open Battle mode</span></div></div>`;
}
{ // speed: the track and the speed lines only
  const sx=v=>170+(v-45)/100*1100,SY=470;let sd=`<div class="floor" style="left:96px;right:96px;top:${SY}px"></div>`;
  for(const v of[50,75,100,125])sd+=`<i class="stem" style="left:${sx(v)}px;top:${SY}px;height:8px"></i><div class="tick" style="left:${sx(v)}px;top:${SY+62}px">${v}</div>`;
  sd+=`<div class="tick" style="left:${sx(145)}px;top:${SY+62}px">base Speed</div>`;
  D.speed.forEach(m=>{const cx=sx(m.sp),z=150,k=Math.max(0,(m.sp-70)/75),c=accent(M[m.n].a);
    if(k>0)sd+=`<svg style="position:absolute;z-index:2;left:${cx-70-170*k}px;top:${SY-118}px" width="${170*k}" height="80"><g stroke="${c}" stroke-width="2" stroke-linecap="round" opacity=".6"><path d="M0 12H${170*k}"/><path d="M${40*k} 40H${170*k}"/><path d="M${14*k} 68H${150*k}"/></g></svg>`;
    sd+=stand(m,cx,SY,z)+`<div class="sp" style="left:${cx}px;top:${SY-z-52}px">${m.sp}</div><div class="cap" style="left:${cx}px;top:${SY+18}px">${m.d}</div>`;});
  $('speed').innerHTML=sd+`<div class="txt"><div><div class="eyebrow">Battle · Speed tiers</div><h2 style="margin-top:22px">Who moves <b>first.</b></h2></div>
    <div style="text-align:right"><p class="lede" style="max-width:400px;margin-left:auto">Six of the meta, lined up by Speed. Switch the field and watch the order change.</p><div class="seg"><span class="on">No field</span><span>Tailwind</span><span>Trick Room</span></div></div></div>`;
}
{ // this week: stems and numbers, no colour pools
  const mv=[...D.up,...D.down],BX=620,BW=126,BY=390;let wk='';
  mv.forEach((m,i)=>{const cx=BX+BW*i+BW/2+(i>2?40:0),lift=m.v*17,z=122,cy=BY-lift,up=m.v>0;
    wk+=`<i class="stem" style="left:${cx}px;top:${Math.min(BY,cy)}px;height:${Math.abs(lift)}px"></i>`+img(m,cx-z/2,cy-z/2-(up?z*.5:-z*.5),z,'z-index:3')
      +`<div class="v" style="left:${cx}px;top:${up?cy-z-46:cy+z+12}px;color:${up?'var(--up)':'var(--down)'}">${up?'+':'−'}${Math.abs(m.v)}</div><div class="cap" style="left:${cx}px;top:${up?BY+14:BY-34}px">${m.d}</div>`;});
  const fd=s=>new Date(s+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
  $('week').style.setProperty('--up',DARK?'#5FD08F':'#16693B');$('week').style.setProperty('--down',DARK?'#A8B4FF':'#2F3FC8');
  $('week').innerHTML=wk+`<div class="floor" style="top:${BY}px;left:600px;right:96px"></div>
    <div class="txt"><div class="eyebrow">Meta · ${fd(D.wk.from)} to ${fd(D.wk.to)}</div><h2>What moved <b>this week.</b></h2>
    <p class="lede">Across ${N(D.wk.n)} teams, these six changed the most. The number is how many points of usage each one gained or lost.</p><div class="acts"><span class="link">See the whole meta</span></div></div>`;
}
