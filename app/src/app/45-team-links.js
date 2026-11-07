// ---------- shareable team links ----------
// A team packs into a short code: format (always "doubles"; older links may say "singles" and open as doubles), optional name, and per Pokémon its name, chosen ability (if not the default)
// and moves (only when you changed them). Links look like <site>#team=<code>; Import also accepts a pasted link or code.
// Opening a link never replaces your team silently: a banner asks first.
const TL_ART = 'https://claude.ai/artifact/5VBfLTR5sM4JU5NswJYyGk';
function tlB64(str) { const b = new TextEncoder().encode(str); let s = ''; for (const x of b) s += String.fromCharCode(x); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function tlUnB64(code) { const s = atob(code.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((code.length + 3) % 4)); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return new TextDecoder().decode(b); }
function teamCode() {
  const f = 'doubles', s = S.slots.filter(x => x && byName.get(x.n)).map(x => { const p = byName.get(x.n), m = memberOf(x, 0), row = [p.n];
    const defA = metaAbility(p) || bestAbility(p); if (x.a && x.a !== defA) row[1] = x.a;
    const c = x.mv && x.mv[f]; if (Array.isArray(c) && c.some(Boolean)) { row[1] = row[1] || ''; row[2] = c.slice(0, 4); }
    // your held item (row[3]) and nature + stat points (row[4], "Jolly:2/32/0/0/0/32"), only when you set them (Oct 28)
    const it = x.it && x.it[f], sp = x.sp && x.sp[f];
    if (it || sp) { row[1] = row[1] || ''; row[2] = row[2] || 0; row[3] = it || ''; if (sp) row[4] = (sp.nat || '') + ':' + (sp.assumed || !Array.isArray(sp.v) ? 'a' : sp.v.join('/')); }
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
  const f = 'doubles';  // the format field is ignored: every link opens as a doubles team
  const spOf = v => { const a = typeof v === 'string' && v.match(/^(\w*):a$/); if (a) return {nat: a[1] || null, assumed: true};
    const m = typeof v === 'string' && v.match(/^(\w*):(\d+)\/(\d+)\/(\d+)\/(\d+)\/(\d+)\/(\d+)$/); return m ? {nat: m[1] || null, v: m.slice(2).map(Number)} : null; };
  // the same rules as a pasted team (stress test, Oct 28): one of each species, only abilities the Pokémon can have,
  // and only held items that exist in Champions (no Choice Band, no Mega Stone on a Pokémon it doesn't fit)
  const seen = new Set(), itemOf = v => { if (typeof v !== 'string' || !v || v.length > 40) return null; const it = typeof canonItem === 'function' ? canonItem(v) : v;
    return !STONE_RE.test(it) && pasteItemOK(it) ? it : null; };
  const slots = o.s.slice(0, 6).map(r => { const p = Array.isArray(r) && byName.get(String(r[0])); if (!p || seen.has(p.b)) return null; seen.add(p.b);
    const it = p.m ? null : itemOf(r[3]);
    return {n: p.n, a: typeof r[1] === 'string' && p.a.includes(r[1]) ? r[1] : null, lock: false, ...(Array.isArray(r[2]) ? {mv: {[f]: r[2].slice(0, 4).map(x => String(x || ''))}} : {}),
      ...(it ? {it: {[f]: it}} : {}), ...(spOf(r[4]) ? {sp: {[f]: spOf(r[4])}} : {})}; }).filter(Boolean);
  if (!slots.length) return null;
  return {f, n: typeof o.n === 'string' ? o.n.slice(0, 60) : '', slots}; }
function applyShared(x) { keepUndo(); S.slots = normSlots(x.slots); S.loadedId = null; ui.paste = null; render(); setView('build');
  toast(`Loaded ${x.n ? '“' + x.n + '”' : 'a shared team'} (${x.slots.length} Pokémon)`, true); }
async function copyTeamLink(btn) { const l = teamLink(); if (!l) { toast('Add some Pokémon first'); return; }
  let ok = false; try { await navigator.clipboard.writeText(l); ok = true; } catch (e) {}
  if (!ok) { try { const ta = document.createElement('textarea'); ta.value = l; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e) {} }
  if (ok) toast('Team link copied'); else { const msg = $('shareMsg'); if (msg) msg.textContent = l; toast('Copy the link shown below'); }
  if (btn) { const t = btn.textContent; btn.textContent = ok ? 'Copied' : t; setTimeout(() => { btn.textContent = t; }, 1600); } }
// a link opened directly: ask before replacing the current team
function checkSharedLink() { let raw = ''; try { raw = (location.hash || '') + ' ' + (location.search || ''); } catch (e) {}
  const x = decodeTeam(raw); if (!x) return;
  let bar = $('sharedBar'); if (!bar) { bar = document.createElement('div'); bar.id = 'sharedBar'; bar.className = 'sharedbar'; document.body.appendChild(bar); }
  bar.innerHTML = `<div class="sbin"><div><b>Shared team</b><span>${esc(x.n || x.slots.map(s => (byName.get(s.n) || {}).d || s.n).slice(0, 3).join(', ') + (x.slots.length > 3 ? ' …' : ''))}</span></div><button type="button" class="btn go sm" data-sharedload="1">Load it</button><button type="button" class="btn ghost sm" data-sharedx="1">Not now</button></div>`;
  bar.onclick = e => { const t = e.target.closest('button'); if (!t) return; if (t.dataset.sharedload) applyShared(x); bar.remove(); try { history.replaceState(history.state, '', location.pathname); } catch (er) {} }; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('#shareLink,[data-copylink]'); if (b) copyTeamLink(b); });

// ---------- box links (Nov 7, Sim) ----------
// Your whole box in one link or code, to move it to another device or Claude account, share it, or keep a backup.
// Looks like <site>#box=<code>; opening one never changes your box until you choose Add or Replace (both can be undone).
function boxCode() { const b = (S.box || []).filter(n => byName.get(n)); return b.length ? tlB64(JSON.stringify({v: 1, b})) : ''; }
function boxLink() { const c = boxCode(); return c ? teamLinkBase() + '#box=' + c : ''; }
// accepts a full link, "box=<code>" or the bare code; returns the Pokémon names (base forms you can own), or null
function decodeBox(text) { const t = String(text || '').trim(); if (!t) return null;
  const m = t.match(/box=([A-Za-z0-9_-]{8,})/) || (/^[A-Za-z0-9_-]{12,}$/.test(t) ? [0, t] : null); if (!m) return null;
  let o; try { o = JSON.parse(tlUnB64(m[1])); } catch (e) { return null; } if (!o || o.v !== 1 || !Array.isArray(o.b)) return null;
  const seen = new Set(), out = []; for (const n of o.b.slice(0, 400)) { const p = typeof n === 'string' && byName.get(n); if (!p || p.m || seen.has(p.n)) continue; seen.add(p.n); out.push(p.n); }
  return {names: out, skipped: o.b.length - out.length}; }
async function copyText(t) { let ok = false; try { await navigator.clipboard.writeText(t); ok = true; } catch (e) {}
  if (!ok) { try { const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e) {} }
  return ok; }
function applyBox(x, mode) { ui.boxUndo = S.box.slice(); const before = S.box.length;
  if (mode === 'replace') S.box = x.names.slice(); else { const have = new Set(S.box); for (const n of x.names) if (!have.has(n)) S.box.push(n); }
  render(); const added = mode === 'replace' ? S.box.length : S.box.length - before;
  toastBox(mode === 'replace' ? `Your box is now the ${S.box.length} Pokémon from the link` : added ? `Added ${added} Pokémon to your box` : 'Everything in that link is already in your box'); }
document.addEventListener('click', async e => { const b = e.target && e.target.closest && e.target.closest('#boxLinkCopy,#boxLinkOpen,#boxLinkAdd,#boxLinkReplace'); if (!b) return;
  const msg = $('boxLinkMsg');
  if (b.id === 'boxLinkCopy') { const l = boxLink(); if (!l) { toast('Add some Pokémon to your box first'); return; }
    const ok = await copyText(l); if (ok) toast(`Box link copied (${S.box.length} Pokémon)`); else { const p = $('boxLinkIn'); if (p) p.hidden = false; const f = $('boxLinkField'); if (f) { f.value = l; f.select(); } if (msg) msg.textContent = 'Copy the link above.'; } return; }
  if (b.id === 'boxLinkOpen') { const p = $('boxLinkIn'); if (!p) return; p.hidden = !p.hidden; b.setAttribute('aria-expanded', String(!p.hidden)); if (!p.hidden) { const f = $('boxLinkField'); if (f) f.focus(); } return; }
  const f = $('boxLinkField'), x = decodeBox(f && f.value);
  if (!x || !x.names.length) { if (msg) msg.textContent = 'That doesn’t look like a box link. Copy it again with Copy box link, then paste the whole thing.'; return; }
  applyBox(x, b.id === 'boxLinkReplace' ? 'replace' : 'add'); if (f) f.value = ''; if (msg) msg.textContent = x.skipped ? `${x.skipped} Pokémon in that link aren’t in ${typeof REG_NAME === 'string' ? REG_NAME : 'Reg M-C'}, so they were left out.` : '';
  const p = $('boxLinkIn'); if (p && !x.skipped) p.hidden = true; const o = $('boxLinkOpen'); if (o && !x.skipped) o.setAttribute('aria-expanded', 'false'); });
// a box link opened directly (outside Claude): offer it in the paste box, never applied silently
function checkBoxLink() { let raw = ''; try { raw = location.hash || ''; } catch (e) {} if (!/box=/.test(raw)) return; const x = decodeBox(raw); if (!x || !x.names.length) return;
  const p = $('boxLinkIn'), f = $('boxLinkField'), m = $('boxLinkMsg'); if (p) p.hidden = false; if (f) f.value = raw.replace(/^#/, ''); if (m) m.textContent = `A box link with ${x.names.length} Pokémon. Add them to your box, or replace your box with them.`;
  try { setView('box'); } catch (e) {} }
setTimeout(() => { try { checkBoxLink(); } catch (e) {} }, 0);
