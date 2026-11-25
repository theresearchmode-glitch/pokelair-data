// ---------- battle log from a Showdown replay ----------
// Paste a replay's battle log (or drop the downloaded replay .html) and the game is logged for you: which four you
// brought, your two leads, their six and the result. Your side is the one whose team matches your current six.
// Everything runs in the page; nothing is fetched.
// parseReplay moved to 41-replay-data.js (Nov 12, shared with the rebuild's Battle log)
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
