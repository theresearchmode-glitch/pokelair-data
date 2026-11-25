// ---------- Battle mode: today's drawing and taps. The logic (bmUi, bmHit, bmSpeed, BM_IMMUNE, BM_WEATHER, bmWatch, battlePlan) is shared: 46-battle-data.js (moved Nov 12) ----------
function renderBattle() {
  const el = $('bmOut'); if (!el) return;
  const mine = members(), theirs = oppTeam(), dbl = S.format === 'doubles';
  // their six
  const slots = S.opp.map((n, i) => { const p = byName.get(n);
    return p ? `<div class="bmslot on tyx" style="${tyVars(p)}">${sprite(p, 'bmspr')}<span class="bmn">${esc(p.d)}</span><button class="x" type="button" data-bmx="${i}" aria-label="Remove ${esc(p.d)}">×</button></div>`
      : `<div class="bmslot"><div class="cb"><input class="field" id="bmOpp${i}" placeholder="${i + 1}" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Their Pokémon ${i + 1}"></div></div>`; }).join('');
  const top = `<div class="bmbar">${S.opp.some(Boolean) ? '<button type="button" class="btn sm ghost" id="bmClear">Clear their six</button>' : ''}</div>
    <div class="bmopp">${slots}</div>`;
  let body = ''; bmUi.four = null;
  if (mine.length < 4) body = '<div class="empty-note">Add at least 4 Pokémon on My team first.<div style="margin-top:12px"><button type="button" class="chghost" data-view="build">Go to My team</button></div></div>';
  else if (!theirs.length) body = '<div class="empty-note">Type their Pokémon as you see them at team preview. Everything below fills in as you go.</div>';
  else {
    const P = battlePlan(mine, theirs), r = P.r, C = P.chosen, F1 = P.field, wNow = P.weather;
    bmUi.four = P.four;
    const card = (i, tag) => `<div class="bmpick${tag === 'Lead' ? ' lead' : ''}">${sprite(mine[i].p, 'bmpspr')}<span class="bmpn">${escName(mine[i].d)}</span><span class="tag">${tag}</span></div>`;
    const ll = P.likelyLead;
    const bring = `<div class="plan bmcard" data-t="plan"><div class="ph"><span class="pt">Bring</span><span class="vsub">${dbl ? 'lead 2, back 2' : 'lead 1'}</span></div>
      <div class="bmpicks">${r.lead.map(i => card(i, 'Lead')).join('')}${r.back.map(i => card(i, 'Back')).join('')}</div>
      ${r.bench.length ? `<p class="t2" style="margin:0">Leave home: ${r.bench.map(i => esc(mine[i].d)).join(', ')}</p>` : ''}
      <p class="t2 bmback" style="margin:0">Tested on 13,000 ladder games: players who led with this pair won more than their rating predicted.</p>
      ${ll.length === 2 ? `<p class="t2" style="margin:0">Their likely lead: <b>${esc(ll[0].d)}</b> + <b>${esc(ll[1].d)}</b></p>` : ''}
      ${P.twoMegas ? '<p class="t2" style="margin:0">Only one Mega can Mega Evolve this battle.</p>' : ''}</div>`;
    const W = P.watch;
    const watch = `<div class="plan bmcard" data-t="plan"><div class="ph"><span class="pt">Watch out</span></div>${W.length ? W.map(w => `<div class="bmw">${sprite(w.o.p, 'bmwspr')}<div><b>${esc(w.o.d)}</b>${w.out.map(([c, t, d]) => `<div class="bmwl"><span class="sev ${c}">${esc(t)}</span><span class="t2">${esc(d)}</span></div>`).join('')}</div></div>`).join('')
      : '<p class="t2" style="margin:0">Nothing on their side shuts down your four.</p>'}</div>`;
    // speed
    const rows = P.speed, mx = P.speedMax, spDrop = P.spDrop;
    const tog = (k, t) => `<button type="button" data-bms="${k}" aria-pressed="${!!bmUi[k]}">${t}</button>`;
    const prioList = P.prio.map(q => `${esc(q.move)} ${q.prio > 0 ? '+' : '−'}${Math.abs(q.prio)}${q.grassy ? ' (Grassy Terrain)' : ''} (${esc(q.who)})`);
    const speed = `<div class="plan bmcard" data-t="speed"><div class="ph"><span class="pt">Speed</span><span class="vsub">${bmUi.tr ? 'slowest moves first' : 'fastest first'}</span></div>
      <div class="seg segwrap" role="group" aria-label="Speed conditions">${tog('tw', 'Your Tailwind')}${tog('twOpp', 'Their Tailwind')}${tog('icy', spDrop.length ? `Them −1 (after your ${esc(spDrop[0])})` : 'Them −1')}${tog('par', 'They\'re paralyzed')}${tog('tr', 'Trick Room')}</div>${wNow ? `<p class="t2" style="margin:0">Weather: ${esc(wNow)} (set it under Damage).</p>` : ''}
      <div class="bmspd">${rows.map(q => `<div class="bmsr${q.me ? ' me' : ''}"><span class="bmsn">${esc(q.x.d)}${q.tie ? ' <span class="tag spdtie">Tie</span>' : ''}</span><span class="bmsb"><i style="width:${Math.max(4, 100 * q.v / mx).toFixed(1)}%"></i></span><span class="bmsv">${q.v}${q.s.scarf ? '<em>Scarf</em>' : ''}${q.wxUp ? `<em> ${esc(q.ab)}</em>` : ''}${q.unb ? `<em> → ${q.unb} after item</em>` : ''}</span></div>`).join('')}</div>
      ${prioList.length ? `<p class="t2" style="margin:0">Moves that skip the Speed order (higher bracket goes first, Speed only breaks ties inside a bracket): ${prioList.join(', ')}.</p>` : ''}
      <p class="t2" style="margin:0">Your side: your items (and your spreads where you set them). Their side <span class="asm" title="Their real spreads and items are hidden until the battle shows them">assumed</span>: the most common spreads, natures and items. Ties are a coin flip.</p></div>`;
    // damage both ways
    const cls = (b) => { if (!b) return 'z'; const lo = b.r.min / b.r.hp, hi = b.r.max / b.r.hp; return lo >= 1 ? 'k1' : hi >= 1 ? 'k1m' : lo >= .5 ? 'k2' : hi >= .5 ? 'k2m' : 'k3'; };
    const pcs = b => b ? (b.r.max < b.r.hp ? dmgP(100 * b.r.max / b.r.hp) : String(Math.min(999, Math.round(100 * b.r.max / b.r.hp)))) + '%' : '–', ksA = b => b ? ` data-ko="${esc(koShort(b.r))}"` : '';
    const wseg = [['auto', `Leads${F1.weather || F1.terrain ? ': ' + fieldWords(F1) : ': none'}`], ['', 'No weather'], ['sun', 'Sun'], ['rain', 'Rain'], ['sand', 'Sand'], ['snow', 'Snow']].map(([k, t]) => `<button type="button" data-bmw="${k}" aria-pressed="${bmUi.weather === k}">${esc(t)}</button>`).join('');
    const grid = `<div class="tablewrap"><table class="bmdt"><thead><tr><th></th>${theirs.map(o => `<th title="${esc(o.d)}">${sprite(o.p, 'dcth')}<span>${esc(o.d.replace(/^Mega /, 'M-'))}</span></th>`).join('')}</tr></thead><tbody>
      ${C.map((m, mi) => `<tr><th>${sprite(m.p, 'dcth')}<span>${esc(m.d)}</span></th>${theirs.map((o, oi) => { const {a, d} = P.damage[mi][oi];
        return `<td title="${a ? `${esc(m.d)} ${esc(a.mv.name)}: ${dmgRange(a.r)}, ${esc(koText(a.r))}` : ''}${d ? ` · ${esc(o.d)} ${esc(d.mv.name)}: ${dmgRange(d.r)}, ${esc(koText(d.r))}` : ''}"><span class="bo ${cls(a)}"${ksA(a)}>${pcs(a)}<i>${a ? esc(a.mv.name) : ''}</i></span><span class="bd ${cls(d)}"${ksA(d)}>${pcs(d)}<i>${d ? esc(d.mv.name) : ''}</i></span></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
    const dmgCard = `<div class="plan bmcard bmdmg" data-t="dmg"><div class="ph"><span class="pt">Damage both ways</span></div>
      <div class="seg segwrap" role="group" aria-label="Weather">${wseg}</div>
      <div class="seg segwrap" role="group" aria-label="Intimidate"><button type="button" data-bmi="intMe" aria-pressed="${bmUi.intMe}">You're Intimidated</button><button type="button" data-bmi="intThem" aria-pressed="${bmUi.intThem}">They're Intimidated</button></div>
      ${grid}<p class="t2 bmleg" style="margin:0"><span class="bo k2">%</span> your best hit on them · <span class="bd k2">%</span> their best hit on you. Top roll as % of HP, each side's usual set, tagged with how many hits it takes: OHKO, 2HKO, 3HKO (a % = only that share of rolls do it); on their side, red and pink cells mean they can do the same to you.</p></div>`;
    let real = ''; try { const R = P.real; if (R) { const nm = n => esc((byName.get(n) || {}).d || n);
      real = `<div class="plan bmcard bmreal" data-t="plan"><div class="ph"><span class="pt">From real games</span><span class="vsub">${(R.games || 0).toLocaleString('en-US')} tournament games</span></div>
        <p class="bmrv"><b>${R.word}</b>${R.full ? '' : ' so far'}</p>
        ${R.key.length ? `<ul class="bmrk">${R.key.map(k => `<li><span class="${k.v > 0 ? 'up' : 'dn'}">${k.v > 0 ? 'Helps you' : 'Hurts you'}</span> Your ${nm(k.a)} vs their ${nm(k.b)}</li>`).join('')}</ul>` : '<p class="t2" style="margin:0">No Pokémon pairing here stands out in real results.</p>'}</div>`; } } catch (e) {}
    let t1 = ''; if (dbl) { try { t1 = drawTurnOne(P.turnOne); } catch (e) {} }
    body = `<div class="seg bmtabs" role="group" aria-label="Show">${[['plan', 'Plan'], ['speed', 'Speed'], ['dmg', 'Damage']].map(([k, t]) => `<button type="button" data-bmt="${k}" aria-pressed="${bmUi.tab === k}">${t}</button>`).join('')}</div><div class="bmgrid" data-tab="${bmUi.tab}">${bring}${real}${watch}${speed}${t1 ? `<div class="bmt1" data-t="plan">${t1}</div>` : ''}${dmgCard}</div>`; }
  el.innerHTML = top + body;
  safe('log', () => renderLog());
  S.opp.forEach((n, i) => { const inp = $('bmOpp' + i); if (inp) bindMonInput(inp, p => { S.opp[i] = p.n; persist(); renderMatchup(); const nx = S.opp.findIndex(x => !byName.get(x)); const f = nx >= 0 && $('bmOpp' + nx); if (f) f.focus(); }, p => !S.opp.includes(p.n)); });
  }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bms],[data-bmw],[data-bmi],[data-bmx],[data-bmt],#bmClear,[data-battle]'); if (!b) return;
  const d = b.dataset;
  if (d.battle != null) { setView('matchup'); return; }
  if (d.bms) bmUi[d.bms] = !bmUi[d.bms]; else if (d.bmw != null) bmUi.weather = d.bmw; else if (d.bmi) bmUi[d.bmi] = !bmUi[d.bmi];
  else if (d.bmt) bmUi.tab = d.bmt;
  else if (d.bmx != null) { S.opp[+d.bmx] = ''; persist(); keepScroll(() => renderMatchup()); const f = $('bmOpp' + d.bmx); if (f) f.focus(); return; }
  else if (b.id === 'bmClear') { S.opp = ['', '', '', '', '', '']; persist(); renderMatchup(); return; }
  keepScroll(() => renderBattle());
  if (d.bmx != null) { const f = $('bmOpp' + d.bmx); if (f) f.focus(); } });
