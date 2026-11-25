// ---------- Meta > Pokémon > Natures (Sim approved the page 4:42 PM Nov 23, and the word "Nature" at 5:56 PM) ----------
// docs/mockups/sheet-pics-natures-nov23/HANDOFF.md section 3 (pictures r2-labelled/5-7). On the kit's plan line:
// 1 the 5 x 5 grid: rows = the stat raised, columns = the stat lowered; each square has its name, its share of tournament Pokémon and its
//   top user, filled with the raised stat's colour (darker = run more often, opacity sqrt(share / top share), at least .06); the five
//   neutral natures sit on the diagonal, striped, "changes nothing". Phones: no row-header column; each square gets a 3px left edge in its
//   raised stat's colour, name and share only.
// 2 the line-up: the 12 most-run natures, two columns on desktop, one on phones: rank, name, ▲/▼ chips, its top three users, share.
// Every square and line-up row opens its Nature sheet (V2.openNatureSheet via data-v2info="nt"). Data: META.info.nt / ntN (update.mjs),
// the same numbers as the sheet (V2.ntUse). The raise/lower table is the calc's (NAT_UP / NAT_DN via V2.ntBits); no copy of it here.
// Without nature data the grid still shows (names only: every square still opens its sheet) and the line-up says the numbers aren't in yet.
V2.NTP_ST = ['Atk', 'Def', 'SpA', 'SpD', 'Spe'];
V2.NTP_SHORT = {Atk: 'Atk', Def: 'Def', SpA: 'SpA', SpD: 'SpD', Spe: 'Spe'};
V2.ntpData = () => { const I = typeof META === 'object' && META.info; if (!I || !I.nt || !I.ntN) return null;
  const all = V2.ntAll().map(n => { const e = I.nt[n], m = e ? (e[3] || 0) : 0; return {n, m, pct: 100 * m / I.ntN, u: e ? e[1] : []}; });
  return {all, by: new Map(all.map(x => [x.n, x])), max: Math.max(0, ...all.map(x => x.pct)), N: I.N, M: I.ntN, period: I.period}; };
V2.ntpPct = p => p > 0 && p < 0.1 ? '<0.1%' : (p >= 0.1 ? (+p.toFixed(1)).toString() : '0') + '%';
// the share with its % sign in its own span (phones under 360 drop the sign; the key says the numbers are percentages)
V2.ntpPctH = p => V2.esc(V2.ntpPct(p)).replace(/%$/, '<span class="ntp-ps">%</span>');
V2.ntpChip = (dir, st, short) => `<span class="ntp-chip ntp-${dir}" style="--sc:var(--ntp-${st.toLowerCase()})"><span aria-hidden="true">${dir === 'up' ? '▲' : '▼'}</span>${short ? `<span class="ntp-lg"> ${V2.esc(V2.NT_SN[st])}</span><span class="ntp-sh"> ${V2.NTP_SHORT[st]}</span>` : ` ${V2.esc(V2.NT_SN[st])}`}</span>`;
// one square of the grid
V2.ntpSq = (n, up, dn, D) => { const E = V2.esc, S = V2.NT_SN, x = D && D.by.get(n), neu = up === dn, sc = `var(--ntp-${up.toLowerCase()})`;
  const attrs = `type="button" data-v2info="nt" data-v2infon="${E(n)}" aria-haspopup="dialog"`;
  const share = x ? (x.m === 0 ? 'not run on any tournament Pokémon' : `${V2.ntpPct(x.pct)} of tournament Pokémon`) : '';
  if (neu) return `<button ${attrs} class="ntp-sq ntp-neu" style="--rc:${sc}" aria-label="${E(n)}: raises and lowers ${E(S[up])}, so it changes nothing${share ? ', ' + E(share) : ''}. Open its sheet"><b>${E(n)}</b><em class="u">changes nothing</em><small>${x ? (x.pct < 0.1 ? 'almost never run' : E(V2.ntpPct(x.pct)) + ' of Pokémon') : '&nbsp;'}</small></button>`;
  /* fill: sqrt(share / top share), at least .06 (HANDOFF). Readable words on every square (measured, day and night): above .85 the square is
     filled solid with the light/dark word colour for it (--on-ntp); below, the scale is pressed into .06-.55 so the page's own ink stays 4.5:1+
     (the mock-up's white words on Timid and Jolly measured 3.1-3.4:1) */
  const a0 = !x || x.m <= 0 || !D.max ? 0 : Math.max(0.06, Math.sqrt(x.pct / D.max)), hot = a0 > 0.85, a = hot ? 1 : a0 && 0.06 + (a0 - 0.06) * 0.49 / 0.79, top = x && x.m >= 50 && x.u[0] ? V2.disp(x.u[0][0]) : '';
  const lab = `${n}: raises ${S[up]}, lowers ${S[dn]}${share ? ', ' + share : ''}${top ? ', most run by ' + top : ''}. Open its sheet`;
  return `<button ${attrs} class="ntp-sq${hot ? ' ntp-hot' : ''}" style="--sc:${sc};--rc:${sc};--a:${a.toFixed(2)}" aria-label="${E(lab)}"><span class="ntp-fill" aria-hidden="true"></span>`
    + `<b>${E(n)}</b><em class="u">${x ? V2.ntpPctH(x.pct) : '&nbsp;'}</em><small>${top ? 'Top: ' + E(top) : x && x.m < 20 ? 'rarely used' : '&nbsp;'}</small></button>`; };
V2.ntpGrid = D => { const ST = V2.NTP_ST, byUD = {};
  for (const n of V2.ntAll()) { const b = V2.ntBits(n); if (b) byUD[b.up + b.dn] = n; }
  let g = `<span class="ntp-hd ntp-corner" aria-hidden="true">▲ raises<br>▼ lowers</span>` + ST.map(s => `<span class="ntp-hd ntp-col" aria-hidden="true">${V2.ntpChip('dn', s, true)}</span>`).join('');
  for (const u of ST) { g += `<span class="ntp-hd ntp-row" aria-hidden="true">${V2.ntpChip('up', u, true)}</span>`; for (const d of ST) g += byUD[u + d] ? V2.ntpSq(byUD[u + d], u, d, D) : '<span></span>'; }
  return `<div class="ntp-grid" role="group" aria-label="The 25 natures, by the stat they raise (rows) and the stat they lower (columns)">${g}</div>`
    + `<p class="ntp-key"><span class="ntp-kph">Left edge = the stat raised; top = the stat lowered.${D ? ' Numbers = % of tournament Pokémon.' : ''}</span>${D ? '<span>Darker square = run more often.</span>' : ''}<span>Striped = raises and lowers the same stat, so it does nothing.</span></p>`; };
// one line-up row: the whole row opens the sheet (no buttons inside it)
V2.ntpRow = (x, i) => { const E = V2.esc, b = V2.ntBits(x.n), S = V2.NT_SN, who = x.u.slice(0, 3).map(([p, c, t]) => ({p, d: V2.disp(p), pc: Math.round(100 * c / t)}));
  const lab = `${i + 1}. ${x.n}: raises ${S[b.up]}, lowers ${S[b.dn]}, ${V2.ntpPct(x.pct)} of tournament Pokémon${who.length ? '. Run by ' + who.map(w => `${w.pc}% of ${w.d}`).join(', ') : ''}. Open its sheet`;
  return `<li><button type="button" class="ntp-ln" data-v2info="nt" data-v2infon="${E(x.n)}" aria-haspopup="dialog" aria-label="${E(lab)}"><span class="ntp-rk u" aria-hidden="true">${i + 1}</span>`
    + `<span class="ntp-nm" aria-hidden="true"><span class="ntp-nl"><b>${E(x.n)}</b>${V2.ntpChip('up', b.up, true)}${V2.ntpChip('dn', b.dn, true)}</span>`
    + `<span class="ntp-who">${who.map(w => `<span class="ntp-w">${V2.mon(w.p, {iw: 32, bare: true})}<span class="ntp-wn">${E(w.d)}</span> ${w.pc}%</span>`).join('')}</span></span>`
    + `<span class="ntp-pc" aria-hidden="true"><b class="u">${E(V2.ntpPct(x.pct))}</b><small>of Pokémon</small></span></button></li>`; };
V2.ntpLine = D => { const top = D.all.filter(x => x.m > 0 && !V2.NT_SAME[x.n]).sort((a, b) => b.m - a.m).slice(0, 12);
  return `<ol class="ntp-list">${top.map(V2.ntpRow).join('')}</ol><p class="ntp-src fine">Online tournaments, last 28 days${D.period ? ` (${V2.esc(D.period)})` : ''} · ${V2.isFmt(D.N)} teams, ${V2.isFmt(D.M)} Pokémon with a nature on their team sheet.</p>`; };
// "Four natures cover 76% of tournament Pokémon": the fewest natures that reach three quarters (said only when it is a few)
V2.ntpLead = D => { if (!D) return ''; const s = D.all.map(x => x.pct).sort((a, b) => b - a); let k = 0, t = 0; while (k < s.length && t < 75) t += s[k++];
  const W = ['', 'One nature covers', 'Two natures cover', 'Three natures cover', 'Four natures cover', 'Five natures cover', 'Six natures cover'];
  return W[k] ? ` <b>${W[k]} ${Math.round(t)}% of tournament Pokémon.</b>` : ''; };
// beside the headline on desktop (1100+): "the big four" as one plot bar: the natures that cover three quarters of tournament Pokémon,
// each a slice in its raised stat's colour (sized by its share), the rest one grey slice. Each named slice opens its sheet. Phones and
// tablets leave it out (the lead line says the same in words, and the page stays short).
V2.ntpBig = D => { if (!D) return ''; const E = V2.esc, s = D.all.filter(x => x.m > 0).sort((a, b) => b.m - a.m); let k = 0, t = 0; while (k < s.length && t < 75) t += s[k++].pct;
  if (k < 2 || k > 6) return ''; const rest = s.slice(k), rp = rest.reduce((a, x) => a + x.pct, 0);
  const sl = s.slice(0, k).map(x => { const b = V2.ntBits(x.n); return `<button type="button" class="ntp-bs" style="flex:${x.pct.toFixed(2)} 1 0;--sc:var(--ntp-${b.up.toLowerCase()})" data-v2info="nt" data-v2infon="${E(x.n)}" aria-haspopup="dialog" aria-label="${E(x.n)}: ${E(V2.ntpPct(x.pct))} of tournament Pokémon. Open its sheet"><i aria-hidden="true"></i><b>${E(x.n)}</b><em class="u">${V2.ntpPctH(x.pct)}</em></button>`; }).join('');
  return `<div class="ra-spotw ntp-big"><p class="ntp-bh"><b class="u">The big ${['', '', 'two', 'three', 'four', 'five', 'six'][k]}</b><span>${Math.round(t)}% of tournament Pokémon run one of these</span></p>
    <div class="ntp-bar">${sl}<span class="ntp-bs ntp-br" style="flex:${rp.toFixed(2)} 1 0"><i aria-hidden="true"></i><b>The other ${rest.length}</b><em class="u">${V2.ntpPctH(rp)}</em></span></div></div>`; };
V2.pages.natures = {place: 'meta', draw() { const D = V2.ntpData(), tabs = V2.pkTabs('natures');
  const head = `<section class="ra-h ntp-h"><p class="k-kicker np-eyebrow">META · NATURES</p><h1 class="k-h1 u">Natures.</h1>
    <p class="k-lead ra-lede">Every nature raises one stat by 10% and lowers another by 10%.${V2.ntpLead(D)} Tap any square to see who runs it.</p>${tabs}</section>`;
  const line = D ? V2.ntpLine(D) : V2.kNone('Nature numbers appear after the next data refresh.');
  const body = V2.kPlan(V2.kStep(1, 'Every nature', 'Each row raises a stat, each column lowers one', V2.ntpGrid(D))
    + V2.kStep(2, 'The line-up', 'The 12 natures players actually run, and who runs them', line));
  return `<div class="ra gsp ntp"><div class="gs-top">${head}${V2.ntpBig(D)}${tabs}</div><div class="gs-body">${body}</div></div>`; }};
