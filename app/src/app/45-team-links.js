// ---------- shareable team links ----------
// A team packs into a short code: format, optional name, and per Pokémon its name, chosen ability (if not the default)
// and moves (only when you changed them). Links look like <site>#team=<code>; Import also accepts a pasted link or code.
// Opening a link never replaces your team silently: a banner asks first.
const TL_ART = 'https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk';
function tlB64(str) { const b = new TextEncoder().encode(str); let s = ''; for (const x of b) s += String.fromCharCode(x); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function tlUnB64(code) { const s = atob(code.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((code.length + 3) % 4)); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return new TextDecoder().decode(b); }
function teamCode() {
  const f = S.format, s = S.slots.filter(x => x && byName.get(x.n)).map(x => { const p = byName.get(x.n), m = memberOf(x, 0), row = [p.n];
    const defA = metaAbility(p) || bestAbility(p); if (x.a && x.a !== defA) row[1] = x.a;
    const c = x.mv && x.mv[f]; if (Array.isArray(c) && c.some(Boolean)) { row[1] = row[1] || ''; row[2] = c.slice(0, 4); }
    return row; });
  if (!s.length) return '';
  const loaded = S.teams.find(t => t.id === S.loadedId), o = {v: 1, f, s}; if (loaded && loaded.name) o.n = String(loaded.name).slice(0, 60);
  return tlB64(JSON.stringify(o)); }
function teamLinkBase() { try { const h = location.hostname; if (/^https?:$/.test(location.protocol) && h && !/(^|\.)claude(usercontent)?\.(ai|com)$/.test(h) && h !== 'localhost' && h !== '127.0.0.1') return location.origin + location.pathname; } catch (e) {} return TL_ART; }
function teamLink() { const c = teamCode(); return c ? teamLinkBase() + '#team=' + c : ''; }
// accepts a full link, "team=<code>" or the bare code; returns {f, n, slots} or null
function decodeTeam(text) {
  const t = String(text || '').trim(); if (!t) return null;
  const m = t.match(/team=([A-Za-z0-9_-]{8,})/) || (/^[A-Za-z0-9_-]{12,}$/.test(t) ? [0, t] : null); if (!m) return null;
  let o; try { o = JSON.parse(tlUnB64(m[1])); } catch (e) { return null; }
  if (!o || o.v !== 1 || !Array.isArray(o.s)) return null;
  const f = o.f === 'singles' ? 'singles' : 'doubles';
  const slots = o.s.slice(0, 6).map(r => Array.isArray(r) && byName.get(String(r[0])) ? {n: String(r[0]), a: typeof r[1] === 'string' && r[1] ? r[1] : null, lock: false, ...(Array.isArray(r[2]) ? {mv: {[f]: r[2].slice(0, 4).map(x => String(x || ''))}} : {})} : null).filter(Boolean);
  if (!slots.length) return null;
  return {f, n: typeof o.n === 'string' ? o.n.slice(0, 60) : '', slots}; }
function applyShared(x) { S.format = x.f; S.slots = normSlots(x.slots); S.loadedId = null; ui.paste = null; render(); setView('build');
  toast(`Loaded ${x.n ? '“' + x.n + '”' : 'a shared team'} (${x.slots.length} Pokémon)`); }
async function copyTeamLink(btn) { const l = teamLink(); if (!l) { toast('Add some Pokémon first'); return; }
  let ok = false; try { await navigator.clipboard.writeText(l); ok = true; } catch (e) {}
  if (!ok) { try { const ta = document.createElement('textarea'); ta.value = l; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e) {} }
  if (ok) toast('Team link copied'); else { const msg = $('shareMsg'); if (msg) msg.textContent = l; toast('Copy the link shown below'); }
  if (btn) { const t = btn.textContent; btn.textContent = ok ? 'Copied' : t; setTimeout(() => { btn.textContent = t; }, 1600); } }
// a link opened directly: ask before replacing the current team
function checkSharedLink() { let raw = ''; try { raw = (location.hash || '') + ' ' + (location.search || ''); } catch (e) {}
  const x = decodeTeam(raw); if (!x) return;
  let bar = $('sharedBar'); if (!bar) { bar = document.createElement('div'); bar.id = 'sharedBar'; bar.className = 'sharedbar'; document.body.appendChild(bar); }
  bar.innerHTML = `<div class="sbin"><div><b>Shared team</b><span>${esc(x.n || x.slots.map(s => (byName.get(s.n) || {}).d || s.n).slice(0, 3).join(' · ') + (x.slots.length > 3 ? ' …' : ''))}</span></div><button type="button" class="btn go sm" data-sharedload="1">Load it</button><button type="button" class="btn ghost sm" data-sharedx="1">Not now</button></div>`;
  bar.onclick = e => { const t = e.target.closest('button'); if (!t) return; if (t.dataset.sharedload) applyShared(x); bar.remove(); try { history.replaceState(null, '', location.pathname); } catch (er) {} }; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('#shareLink,[data-copylink]'); if (b) copyTeamLink(b); });
