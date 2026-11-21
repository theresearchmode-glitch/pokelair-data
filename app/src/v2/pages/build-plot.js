// ---------- Build: The Plot (Sim locked the direction Nov 20, 7:51 PM; build before the switch, 7:52 PM) ----------
// Mock-ups and pictures: docs/rebuild/pics/nov20/Q93-Q98; spec: docs/rebuild/plot-spec.md; plan: docs/rebuild/plot-build-plan.md.
// Piece a (this file, first): the page before a build. The spec is one sentence you edit:
//   "My plot: build from [My Box] or [Whole Roster] with [0][1][2] Megas, around [Any Pokémon]. [Hatch it.]"
// The blue words are the same controls as before, so nothing else changes: the source and Megas plates are [data-v2slide] groups
// ('bdsrc', 'sgmega': shell.js V2.slidePick fires the same v2slide events build.js and sugs.js already listen to), the search is the same
// [data-bdfind] input with [data-bdhits] under it, a pick is [data-bdpick], its clear is [data-bdx], and Hatch it is [data-bdgo].
// A thin red "plot line" runs down the page with numbered steps; before a build, steps 2-4 wait, faint, and today's underdog keeps them
// company (V2.underdog, the empty-screen rule: never beside a team's data). After a build the Blueprint sheet still draws (pieces b-f next).
V2.plotPicks = () => { try { return ROSTER.filter(p => !p.m && !/-Mega/.test(p.n)).sort((a, b) => U(b) - U(a)).slice(0, 4).map(p => p.n); } catch (e) { return []; } };
V2.plotGrp = (key, items, on, label) => `<span class="pl-grp" role="group" aria-label="${V2.esc(label)}" data-v2slide="${V2.esc(key)}">${items.map(([v, t], k) =>
  (k && items.length === 2 ? '<span class="pl-or" aria-hidden="true">or</span>' : '') + `<button type="button" class="pl-pl" data-v="${V2.esc(v)}" aria-pressed="${v === on}"><span>${V2.esc(t)}</span></button>`).join('')}</span>`;
V2.plotSent = () => { const E = V2.esc, lk = ui.abLock && byName.get(ui.abLock), busy = !!(ui.ab && ui.ab.busy);
  const src = V2.plotGrp('bdsrc', [['box', 'My Box'], ['all', 'Whole Roster']], ui.abSrc === 'all' ? 'all' : 'box', 'Build from');
  const meg = V2.plotGrp('sgmega', [['0', '0'], ['1', '1'], ['2', '2']], String(megaGoal()), 'Megas on team');
  const around = lk ? `<span class="pl-pl pl-pick" aria-pressed="true">${SPRITE_ID[lk.n] ? `<img src="${V2.art(SPRITE_ID[lk.n])}" alt="">` : ''}<span>${E(V2.disp(lk.n))}</span><button type="button" class="pl-x" data-bdx aria-label="Stop building around ${E(V2.disp(lk.n))}"><span aria-hidden="true">×</span></button></span>`
    : `<label class="pl-pl pl-find">${V2.ICON.search}<input type="search" data-bdfind value="${E(V2.bdUi.find || '')}" placeholder="Any Pokémon" aria-label="Build around a Pokémon (optional): type its name" autocomplete="off"></label>`;
  return `<div class="pl-sw"><div class="pl-sent u" role="group" aria-label="Your plot"><span class="pl-ln"><span class="pl-w">My plot: build from</span></span> <span class="pl-ln">${src}</span> <span class="pl-ln"><span class="pl-w">with</span> ${meg} <span class="pl-w">Megas.</span></span> <span class="pl-ln"><span class="pl-w pl-opt">Optional: build around</span> <span class="pl-ar">${around}</span></span> <span class="pl-ln"><button type="button" class="pl-go" data-bdgo${busy ? ' aria-busy="true" disabled' : ''}><span>Hatch it.</span><span class="vh"> ${lk ? `Build Around ${E(V2.disp(lk.n))}` : 'Build Me a Team'}</span></button></span></div><div class="bd-hits pl-hits" data-bdhits>${V2.bdUi.find && !lk ? V2.buildHits(V2.bdUi.find) : ''}</div></div>`; };
V2.plotHelp = () => { const E = V2.esc, lk = ui.abLock && byName.get(ui.abLock), picks = V2.plotPicks().filter(n => byName.get(n));
  let tip = ''; try { const M = V2.bpMegaShare(); tip = M && M.wins != null ? `${Math.round(M.wins)}% of event winners carry 2 Mega options. ` : ''; } catch (e) {}
  const chip = n => `<button type="button" class="pl-chip" data-bdpick="${E(n)}"${lk && lk.n === n ? ' aria-pressed="true"' : ''}>${SPRITE_ID[n] ? `<img src="${V2.art(SPRITE_ID[n])}" alt="" loading="lazy" decoding="async">` : ''}<span>${E(V2.disp(n))}</span></button>`;
  return `<div class="pl-help"><div class="pl-hc pl-hb"><b>Build from</b><p>My Box: only the Pokémon you own. Whole Roster: any Pokémon.</p></div>
    <div class="pl-hc pl-hb"><b>Megas on team</b><p>${E(tip)}Only one can Mega Evolve per battle.</p></div>
    <div class="pl-hc pl-hb"><b>Build around a Pokémon <span>· optional</span></b><p class="pl-ht2">${lk ? `${E(V2.disp(lk.n))} will be on the team. Tap × to clear it.` : 'Type a name, or tap one:'}</p>${picks.length ? `<div class="pl-chips">${picks.map(chip).join('')}</div>` : ''}</div>
    <div class="pl-hc pl-hr"><b>${lk ? `Build Around ${E(V2.disp(lk.n))}` : 'Build Me a Team'}</b><p><span class="pl-ht">Six from real winning teams, in an instant. </span><button type="button" class="np-link" data-bdhow>How It Works ›</button></p></div></div>`; };
V2.plotWait = () => { const n = V2.underdog ? V2.underdog() : 'Flapple', d = V2.esc(V2.disp(n));
  const st = (k, h) => `<div class="pl-step pl-wait"><span class="pl-node" aria-hidden="true">${k}</span><h2 class="u pl-h">${h}</h2><span class="pl-w8">waiting for your plot</span></div>`;
  return `<div class="pl-waits"><div class="pl-wl">${st(2, 'The accomplices')}<div class="pl-places" aria-hidden="true"><i></i><i></i><i></i></div>${st(3, 'Why it works')}${st(4, 'Got a Plan B?')}</div>
    <aside class="pl-dog" aria-label="Today's underdog"><p><b>${d} is waiting to see what you hatch.</b> Today's underdog. Somebody's favourite.</p><button type="button" class="pl-dogst" data-v2mon="${V2.esc(n)}" aria-label="${d}: open its info">${V2.mon(n, {bare: true})}</button></aside></div>`; };
V2.plotPage0 = () => { V2.bdSrcDefault(); /* a new visitor's untouched sample box starts on Whole Roster (S17), as buildHead did */ const win = V2.buildWinners(true), cor = V2.buildCores(true), tab = V2.bdTab(false, !!win), busy = !!(ui.ab && ui.ab.busy), none = !busy && ui.ab ? V2.buildAnswer0() : '';
  return `<div class="bd2 pl2${busy ? ' bd-rebuild' : ''}"><h1 class="vh">Build</h1><div class="bd-result" aria-live="polite"${busy ? ' aria-busy="true"' : ''}>${busy ? '<p class="bd-busy" role="status">Building from real winning teams…</p>' : ''}${none}
    <section class="pl pl0"><div class="pl-step pl-s1"><span class="pl-node" aria-hidden="true">1</span><div class="pl-top"><div><p class="np-eyebrow"><span>Build ·<span class="bd-rw"> real winning teams ·</span> ${V2.esc(typeof REG_NAME === 'string' ? REG_NAME : 'Reg M-C')} doubles</span></p><p class="pl-intro">Winning tournament teams you can field from your box or the whole roster.</p></div><p class="pl-hint">Blue words are buttons. Tap one to change your plot.</p></div>${V2.plotSent()}${V2.plotHelp()}</div>${V2.plotWait()}</section></div>
    ${V2.buildJump(false, !!win, tab)}<div class="bd-lower bp-lower" data-bdtab="${tab}"><div class="bd-lcol">${win}</div>${cor}</div></div>`; };
(() => { const draw = V2.pages.build.draw; V2.pages.build.draw = () => { const M = V2.bpModel(); if (M || (ui.ab && ui.ab.busy && V2.bpLastM)) return draw(); return V2.plotPage0(); }; })();
/* The sentence fills the page width (Q95 fit rule): each line is laid out on one row at the base size; if the widest is wider than the
   page, the size steps down so it fits (never below 20 px); only then may a line wrap (very narrow phones). Runs after each draw, on
   resize and once the logo font has loaded (the width depends on it). */
V2.plotInput = s => { const i = s.querySelector('[data-bdfind]'); if (!i) return; const cs = getComputedStyle(i), c = V2.plotInput.c || (V2.plotInput.c = document.createElement('canvas').getContext('2d'));
  c.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; const t = String(i.value || i.placeholder || '').toUpperCase();
  i.style.width = Math.ceil(c.measureText(t).width + parseFloat(cs.fontSize) * 0.9) + 'px'; };
V2.plotFit = () => document.querySelectorAll('.pl-sent').forEach(s => { s.style.removeProperty('--d-plot'); s.classList.remove('pl-wrap'); V2.plotInput(s);
  const W = s.clientWidth; if (W < 2) return; const fs = parseFloat(getComputedStyle(s).fontSize) || 24;
  const wide = Math.max(...[...s.querySelectorAll('.pl-ln')].map(l => l.scrollWidth)); if (wide <= W + 1) return;
  const px = Math.floor(fs * W / wide * 0.99); if (px >= 20) s.style.setProperty('--d-plot', px + 'px'); else { s.style.setProperty('--d-plot', '20px'); s.classList.add('pl-wrap'); } V2.plotInput(s); });
(() => { const after = V2.pages.build.after; V2.pages.build.after = () => { try { if (after) after(); } finally { V2.plotFit(); } }; })();
addEventListener('resize', () => requestAnimationFrame(() => { if (document.querySelector('.pl-sent')) V2.plotFit(); }));
try { document.fonts.ready.then(() => V2.plotFit()); document.fonts.addEventListener('loadingdone', () => requestAnimationFrame(V2.plotFit)); } catch (e) {}
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('.pl-sent [data-bdfind]'); if (i) V2.plotInput(i.closest('.pl-sent')); });
