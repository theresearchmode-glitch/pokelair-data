// ---------- Types: learn what a typing is strong and weak to ----------
function renderTypes() {
  const el = $('typesOut'); if (!el) return;
  const sel = ui.typesSel || [];
  $('typePick').innerHTML = TYPES.map(t => `<button type="button" class="typebtn${sel.includes(t) ? ' on' : ''}" data-type="${t}" aria-pressed="${sel.includes(t)}" style="--tc:${TC[t]}">${t}</button>`).join('');
  const mon = ui.typesMon ? byName.get(ui.typesMon) : null;
  $('typeMon').innerHTML = mon ? `<span class="t2">Showing <b>${esc(mon.d)}</b> · ability ${esc(metaAbility(mon) || bestAbility(mon))}</span> <button class="btn sm" type="button" data-typesmonx="1">Clear</button>` : '';
  if (!sel.length) { el.innerHTML = '<div class="empty-note">Pick one or two types above, or look up a Pokémon.</div>'; return; }
  const ab = mon ? (metaAbility(mon) || bestAbility(mon)) : null;
  const groups = {q: [], d: [], n: [], h: [], qr: [], z: []};
  const abNotes = [];
  for (const atk of TYPES) {
    const raw = mult(atk, sel, null, false), x = mult(atk, sel, ab, true);
    if (ab && raw !== x) abNotes.push(`${ab} changes ${atk} from ${raw}× to ${x}×`);
    (x === 0 ? groups.z : x >= 4 ? groups.q : x >= 2 ? groups.d : x <= .25 ? groups.qr : x <= .5 ? groups.h : groups.n).push(atk);
  }
  const line = (label, arr, cls) => `<div class="prob-row"><span class="sev ${cls}">${label}</span><div class="chips">${arr.length ? arr.map(t => chip(t)).join('') : '<span class="none">None</span>'}</div></div>`;
  const off = sel.map(atk => { const se = TYPES.filter(d => EFF[atk][d] >= 2), nv = TYPES.filter(d => EFF[atk][d] > 0 && EFF[atk][d] < 1), no = TYPES.filter(d => EFF[atk][d] === 0);
    return `<div class="plan"><div class="ph"><span class="pt">${chip(atk)} attacks</span></div>
      <div class="prob-row"><span class="sev ok">2× on</span><div class="chips">${se.map(t => chip(t)).join('') || '<span class="none">Nothing</span>'}</div></div>
      <div class="prob-row"><span class="sev mid">½× on</span><div class="chips">${nv.map(t => chip(t)).join('') || '<span class="none">Nothing</span>'}</div></div>
      ${no.length ? `<div class="prob-row"><span class="sev hi">No effect</span><div class="chips">${no.map(t => chip(t)).join('')}</div></div>` : ''}</div>`; }).join('');
  el.innerHTML = `<div class="mucols">
    <div class="fixcol"><h3 class="lbl">Taking hits as ${sel.map(t => chip(t)).join(' ')}</h3>
      <div class="problems">${line('4× weak', groups.q, 'hi')}${line('2× weak', groups.d, 'mid')}${line('½ resist', groups.h, 'ok')}${line('¼ resist', groups.qr, 'ok')}${line('Immune', groups.z, 'lo')}</div>
      ${abNotes.length ? `<p class="t2">${esc(abNotes.join('. '))}.</p>` : ''}
      <p class="t2">Everything not listed hits it for normal damage.</p></div>
    <div class="fixcol"><h3 class="lbl">Attacking with its own types (STAB)</h3>${off}</div></div>`;
}
function renderTypeChart() {
  const el = $('typeChart'); if (!el || el.dataset.done) return; el.dataset.done = '1';
  const ab = t => t.slice(0, 3).toUpperCase();
  el.innerHTML = `<tr><th class="t">Atk ↓ Def →</th>${TYPES.map(t => `<th title="${t}" style="color:${TC[t]}">${ab(t)}</th>`).join('')}</tr>` +
    TYPES.map(a => `<tr><td class="t">${chip(a)}</td>${TYPES.map(d => { const x = EFF[a][d]; return `<td><span class="m ${x === 0 ? 'm0' : x >= 2 ? 'mq' : x < 1 ? 'm2' : ''}">${x === 0 ? '0' : x === .5 ? '½' : x === 2 ? '2' : ''}</span></td>`; }).join('')}</tr>`).join('');
}

