// ---------- My Team (R4, Nov 11) ----------
// Everything the page shows is worked out by today's shared logic; this file only gathers it (teamData) and draws it.
// Approved design: docs/rebuild/mocks/myteam.tpl.html (NastyPlot Full Redesign artifact). Word list: CLAUDE.md.

// the data, no HTML: one call per draw
V2.teamData = () => {
  const ms = members(); if (!ms.length) return {empty: true};
  const useA = true, CK = proChecks(ms, useA), RD = prepOf(ms), G = RD ? CH.gradeOf(RD, CK, ms) : null;
  // the lead pair against the meta's top six (Battle mode's planner, the same one today's My Team uses)
  const four = ms.length >= 4 ? CH.four(ms) : null;
  const role = n => !four ? '' : four.lead.includes(n) ? 'Lead' : four.back.includes(n) ? 'Back' : 'Bench';
  // matchups: the 30 top threats, each with the real-games verdict (if the model has one) and the damage-calc level
  const rows = RD ? RD.rows.map(r => ({t: r.t, w: r.t.w, level: r.level, real: CH.realVs(r.t.n, ms)})) : [];
  const top = rows.slice().sort((a, b) => b.w - a.w).slice(0, 10);
  const cnt = w => rows.filter(r => r.real && r.real.w === w).length;
  const calc = [0, 1, 2, 3].map(l => rows.filter(r => r.level === l).length);
  const basics = CK ? CK.items.filter(x => !x.note && !x.skip) : [], notes = CK ? CK.items.filter(x => x.note) : [];
  return {ms, G, RD, CK, four, role, rows, top, mu: {fav: cnt('Favoured'), even: cnt('Even match'), unf: cnt('Unfavoured'), any: rows.some(r => r.real)},
    calc: {beats: calc[3], handles: calc[2], shaky: calc[1], none: calc[0]}, basics, notes, full: ms.length === 6};
};

// ---------- drawing ----------
V2.ui = V2.ui || {sel: 0, mu: 'top'};
V2.LV = ['No answer', 'Shaky', 'Handles it', 'Beats it']; // the four calc levels (word list)
V2.pages.team = {place: 'team', draw() {
  const D = V2.teamData();
  if (D.empty) return `<section class="tm-empty"><div class="np-eyebrow">My Team</div><h1 class="u">Six spots, all yours.</h1><p>Add a Pokémon to start, or let us build one around a favourite.</p><div class="row"><a class="np-btn" href="#build">Build me a team</a><button type="button" class="np-btn2" data-v2search><span>Add a Pokémon</span></button></div></section>`;
  const {ms, G} = D, sel = ms[Math.min(V2.ui.sel, ms.length - 1)], s = G ? Math.round(G.s) : null;
  const word = G ? CH.wordOf(G.s) + (G.partial ? ' so far' : '') : '';
  const rank = G && !G.partial && G.rk != null ? CH.rankShort(G.rk) + ' of tournament teams' : G && G.partial ? `${ms.length} of 6 picked` : '';
  const sure = G && G.su ? `How sure: ${G.su.w}` : '';
  const mon = (m, i) => `<button type="button" class="tm-pick" data-tmsel="${i}" aria-pressed="${m === sel}" aria-label="${V2.esc(m.d)}${D.role(m.p.n) ? ', ' + D.role(m.p.n) : ''}">${V2.mon(m.p.n, {sel: m === sel, sub: D.role(m.p.n)})}</button>`;
  const lockup = `<div class="tm-lock"><div class="np-eyebrow">My Team</div>${s == null ? `<p class="tm-wait">${ms.length} of 6 picked. The Strength Score shows once the team can be rated.</p>`
    : `<div class="np-score" data-band="${G.band}"><b>${s}</b><div class="w"><span>${V2.esc(word)}</span><small>Strength Score</small></div></div><p class="tm-rank">${V2.esc([rank, sure].filter(Boolean).join(' · '))}</p>`}</div>`;
  const acts = `<div class="tm-acts"><a class="np-btn" href="#team">Save Team</a><a class="np-btn2" href="#team"><span>Share</span></a><a class="np-btn2" href="#team"><span>Copy for Showdown</span></a></div>`;
  const nm = D.mu.fav + D.mu.even + D.mu.unf;
  const jump = `<nav class="np-tabs tm-jump" aria-label="On this page"><a href="#team" data-tmjump="tm-set" aria-selected="true">Set</a><a href="#team" data-tmjump="tm-mu">Matchups${nm ? ` <small>${nm}</small>` : ''}</a><a href="#team" data-tmjump="tm-ck">Team Checks <small>${D.basics.filter(x => x.ok).length}/${D.basics.length}</small></a></nav>`;
  // 1. Set: the selected Pokémon on its tilted panel, with its whole set
  const P = sel.p, r = typeof RS === 'function' && typeof rating === 'function' ? Math.round(RS(rating(P).total)) : null;
  const spr = sel.spread && sel.spread.nat ? sel.spread : null;
  const setSec = `<section class="tm-sec tm-set" id="tm-set"><h2 class="u">Set</h2><div class="tm-setgrid"><div class="tm-art">${V2.mon(P.n, {sel: true, iw: 240})}</div><div>
    <h3 class="u">${V2.esc(sel.d)}</h3><div class="tm-types">${(P.t || []).map(V2.typeChip).join('')}${r != null ? `<span class="np-chip">Rated ${r}</span>` : ''}</div>
    <dl class="tm-kv"><div><dt>Item</dt><dd>${V2.esc(sel.heldItem || sel.item || 'None')}</dd></div><div><dt>Ability</dt><dd>${V2.esc(sel.ability || '')}</dd></div>${spr ? `<div><dt>Nature</dt><dd>${V2.esc(spr.nat)}</dd></div>` : ''}</dl>
    <div class="tm-moves">${sel.moves.filter(Boolean).map(v => `<span class="np-type" style="--tc:var(--ty-${V2.TYPES.includes(v.type) ? v.type : 'Normal'})">${V2.esc(v.name)}</span>`).join('')}</div></div></div></section>`;
  // 2. Matchups: real-game verdicts lead, the calc reading underneath (Sim, Nov 10)
  const vcls = {'Favoured': 'f', 'Even match': 'e', 'Unfavoured': 'u'};
  const muSec = !D.rows.length ? '' : `<section class="tm-sec" id="tm-mu"><h2 class="u">Matchups</h2><p class="tm-sub">Against the top ${D.rows.length} threats.${D.mu.any ? ' Verdicts come from real tournament games; the damage calc reading is underneath.' : ''}</p>
    ${D.mu.any ? `<div class="tm-legend"><span class="f"><b>${D.mu.fav}</b> Favoured</span><span class="e"><b>${D.mu.even}</b> Even match</span><span class="u"><b>${D.mu.unf}</b> Unfavoured</span></div>` : ''}
    <p class="fine">Damage calc: Beats it ${D.calc.beats} · Handles it ${D.calc.handles} · Shaky ${D.calc.shaky} · No answer ${D.calc.none}</p>
    <ol class="tm-rows">${D.top.map(x => `<li><img src="${V2.art(SPRITE_ID[x.t.n])}" alt="" loading="lazy"><span class="nm">${V2.esc(x.t.d)}<small>Calc: ${V2.LV[x.level]}</small></span>${x.real ? `<span class="tm-v ${vcls[x.real.w]}">${x.real.w}</span>` : ''}</li>`).join('')}</ol></section>`;
  // 3. Team checks: the 4 basics count, the 3 notes don't (Sim, Nov 9)
  const ck = x => `<li class="${x.ok ? 'ok' : ''}"><b aria-hidden="true">${x.ok ? '✓' : '–'}</b><span>${V2.esc(x.label)}${!x.ok && x.miss ? `<small>${V2.esc(x.miss)}</small>` : ''}</span></li>`;
  const ckSec = `<section class="tm-sec" id="tm-ck"><h2 class="u">Team Checks</h2><p class="tm-sub">The 4 basics count toward the score; the notes are advice.</p><ul class="tm-ck">${D.basics.map(ck).join('')}</ul>${D.notes.length ? `<h3 class="tm-h3">Notes</h3><ul class="tm-ck">${D.notes.map(ck).join('')}</ul>` : ''}</section>`;
  return `<section class="tm-hero">${lockup}<div class="tm-six">${ms.map(mon).join('')}</div>${acts}</section>${jump}<div class="tm-work">${setSec}${muSec}${ckSec}</div>`;
},
after() {
  document.querySelectorAll('[data-tmsel]').forEach(b => b.addEventListener('click', () => { V2.ui.sel = +b.dataset.tmsel; V2.redraw(); }));
  document.querySelectorAll('[data-tmjump]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = document.getElementById(a.dataset.tmjump); if (t) t.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }));
}};
