// ---------- battle log from a Showdown replay ----------
// Paste a replay's battle log (or drop the downloaded replay .html) and the game is logged for you: which four you
// brought, your two leads, their six and the result. Your side is the one whose team matches your current six.
// Everything runs in the page; nothing is fetched.
function parseReplay(text) {
  const lines = String(text || '').split(/\r?\n/).map(l => l.trim()).filter(l => l.startsWith('|'));
  if (!lines.length) return {error: 'No battle log found. Paste the log from the replay, or drop the downloaded replay file.'};
  const names = {}, team = {p1: [], p2: []}, sent = {p1: [], p2: []}; let win = null, turn = 0;
  const species = s => { const raw = s.split(',')[0].trim(); const p = speciesFromPaste(raw) || speciesFromPaste(raw.replace(/-Mega(-[XYZ])?$/, '')); return p ? (byName.get(p.b) || p).n : null; };
  for (const l of lines) { const f = l.split('|');
    if (f[1] === 'player' && f[3]) names[f[2]] = f[3];
    else if (f[1] === 'poke' && team[f[2]]) { const n = species(f[3]); if (n && !team[f[2]].includes(n)) team[f[2]].push(n); }
    else if ((f[1] === 'switch' || f[1] === 'drag') && f[2]) { const side = f[2].slice(0, 2), n = species(f[3] || ''); if (n && sent[side] && !sent[side].some(x => x.n === n)) sent[side].push({n, turn}); }
    else if (f[1] === 'turn') turn = +f[2] || turn + 1;
    else if (f[1] === 'win') win = f[2]; }
  if (!team.p1.length || !team.p2.length) return {error: 'This log has no team preview, so the teams are unknown.'};
  // my side: the one that shares the most species with the current team (by base form)
  const mine = members(), base = new Set(mine.map(m => m.p.b)), overlap = s => team[s].filter(n => base.has((byName.get(n) || {}).b || n)).length;
  const me = overlap('p1') >= overlap('p2') ? 'p1' : 'p2', them = me === 'p1' ? 'p2' : 'p1';
  if (overlap(me) < 4) return {error: 'Neither side matches your current team. Load the team you played with first.'};
  const toMine = n => { const m = mine.find(m => m.p.b === ((byName.get(n) || {}).b || n)); return m ? m.p.n : null; };
  const b = sent[me].map(x => toMine(x.n)).filter(Boolean).slice(0, 4);
  if (!win) return {error: 'The log has no result yet (the game may not have finished).'};
  return {r: win === names[me] ? 'W' : 'L', b, o: team[them].slice(0, 6), me: names[me] || me, them: names[them] || them};
}
function addReplay(text) { const x = parseReplay(text), out = $('replayOut');
  if (x.error) { if (out) out.textContent = x.error; return; }
  if (!Array.isArray(S.log)) S.log = [];
  S.log.push({t: Date.now(), r: x.r, b: x.b, tm: members().map(m => m.p.n), o: x.o}); if (S.log.length > 400) S.log = S.log.slice(-400);
  persist(); renderLog(); safe('verdict', () => render());
  if (out) out.textContent = `${x.r === 'W' ? 'Win' : 'Loss'} logged: ${x.me} vs ${x.them}, you brought ${x.b.map(n => (byName.get(n) || {}).d || n).join(', ')}.`;
  const ta = $('replayIn'); if (ta) ta.value = ''; toast(x.r === 'W' ? 'Win logged from replay' : 'Loss logged from replay'); }
function renderReplayBox() { const el = $('replayBox'); if (!el || el.dataset.ready) return; el.dataset.ready = '1';
  el.innerHTML = `<details class="replaybox"><summary>Log a game from a Showdown replay</summary>
    <p class="t2">On the replay page, open the log (or download the replay), then paste the log here or drop the file. Load the team you played with first.</p>
    <textarea class="field" id="replayIn" rows="4" placeholder="|player|p1|…"></textarea>
    <div class="row"><button class="btn primary" type="button" id="replayAdd">Log this game</button><label class="btn" for="replayFile">Choose replay file</label><input type="file" id="replayFile" accept=".html,.htm,.txt,.log" hidden></div>
    <p class="t2" id="replayOut" aria-live="polite"></p></details>`; }
document.addEventListener('click', e => { if (e.target && e.target.id === 'replayAdd') addReplay(($('replayIn') || {}).value); });
document.addEventListener('change', e => { const t = e.target; if (!t || t.id !== 'replayFile' || !t.files || !t.files[0]) return;
  const fr = new FileReader(); fr.onload = () => { const s = String(fr.result || ''); const m = s.match(/<script type="text\/plain" class="battle-log-data">([\s\S]*?)<\/script>/); addReplay(m ? m[1] : s); }; fr.readAsText(t.files[0]); t.value = ''; });
renderReplayBox();
