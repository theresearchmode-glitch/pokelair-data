// ---------- nastyplot.org's front page: two proposals (Job V, Nov 26; PROPOSAL ONLY, nothing ships without Sim's pick) ----------
// Who lands here: players from Google searching "Pokémon Champions team builder", "Strength Score" / "team rater",
// "Reg M-D tier list", "damage calc". The first screen says what NastyPlot is in those words and gives the one move.
// A, "The Receipt": your team checked out like a till receipt; the latest champion's six is the printed example (real data).
// B, "The Tier Wall": the live top 10 as slanted plot bars across the blue band; your six goes on the same scale.
// Chosen per build: node app/build.mjs ... --home=a|b sets window.NP_HOME; without it Home stays The Stampede (home.js).
// Report and pictures: docs/rebuild/test-runs/public-home-v1.md.
V2.phNum = n => Number(n || 0).toLocaleString('en-US');
// facts both share, from the site's own data (the same functions the Stampede uses)
V2.phFacts = () => { let top = [], all = 0; try { const rows = V2.ratedRows(); all = rows.length; top = rows.slice(0, 10); } catch (e) {}
  const teams = (typeof RES === 'object' && RES && RES.teams) || 0, now = Date.now();
  let reg = null; try { reg = typeof regInfo === 'function' ? regInfo() : null; } catch (e) {}
  const mdAt = Date.parse(V2.REG_START_MD || ''), beforeMD = isFinite(mdAt) && now < mdAt;
  const md = V2.mdCountdown(now) || V2.regDay(now) || '', mdShort = V2.mdCountdown(now, true) || V2.regDay(now) || '';
  return {top, all, teams, reg: reg && reg.id ? reg.id : '', beforeMD, md, mdShort, fresh: V2.freshAgo(now)}; };
// the latest champion's six, scored the way My Team scores yours (cached per data version: grading a team is the costly part)
V2.phChamp = () => { const key = typeof metaVersion !== 'undefined' ? metaVersion : 0; if (V2._phC && V2._phC.key === key) return V2._phC.v;
  let v = null; try { const C = homeChamp(); if (C) { const ms = C.six.map((m, i) => memberOf({n: m.p.n, a: m.ab, it: {[S.format]: m.it}}, i)).filter(Boolean);
    let G = null; try { const RD = prepOf(ms); G = RD ? CH.gradeOf(RD, proChecks(ms, true), ms) : null; } catch (e) {}
    v = {C, ms, G}; } } catch (e) { v = null; }
  V2._phC = {key, v}; return v; };
V2.phBand = G => G ? ({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[CH.grade(G.s)] || 'solid' : '';
V2.phDate = d => { const t = Date.parse(d + 'T12:00:00Z'); return isFinite(t) ? new Date(t).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'}) : ''; };
V2.phRate = n => { try { const r = ratings().get(n); return r ? RS(r.total) : null; } catch (e) { return null; } };
// a Pokémon in a list: a real link to its own page on the public site (/pokemon/<name>), a button elsewhere
V2.phMon = (cls, p, inner, label) => { const s = window.__NP_PUBLIC && typeof V2.pubSlug === 'function' ? V2.pubSlug(p.n) : ''; /* the same rule as meta.js V2.monTagOpen (that file loads after this page draws) */
  return `${s ? `<a class="${cls}" href="/pokemon/${s}"` : `<button type="button" class="${cls}"`} data-v2mon="${V2.esc(p.n)}" aria-label="${V2.esc(label)}">${inner}${s ? '</a>' : '</button>'}`; };
// the tools every visitor looks for, in the words they search
V2.PH_TOOLS = [['Damage Calc', '#calc'], ['Speed Tiers', '#speed'], ['Usage Stats', '#usage'], ['Winning Teams', '#tournaments'], ['Test Run', '#gauntlet'], ['Mystery Gifts', '#gifts']];
V2.phTools = (h) => `<section class="ph-tools" aria-labelledby="ph-tools-h"><h2 class="u ph-h2" id="ph-tools-h">${h}</h2><ul class="ph-tl">${V2.PH_TOOLS.map(([w, href]) => `<li>${V2.kBtn(w, {href})}</li>`).join('')}</ul></section>`;

// ---- A. The Receipt ----
V2.phReceipt = (F) => { const E = V2.esc, X = V2.phChamp(); if (!X || !X.ms.length) return '';
  const {C, ms, G} = X, band = V2.phBand(G), when = V2.phDate(C.ev.date), rates = ms.map(m => V2.phRate(m.p.n));
  const lines = ms.map((m, i) => `<li>${V2.phMon('ph-rl', m.p, `<span class="ph-rl-a" aria-hidden="true">${V2.mon(m.p.n, {bare: true, iw: 40})}</span><span class="ph-rl-n"><b>${E(V2.disp(m.p.n))}</b>${m.heldItem ? `<small>${V2.keepForm(E(m.heldItem))}</small>` : ''}</span><span class="ph-rl-r u">${rates[i] != null ? rates[i] : '–'}</span>`, `${V2.disp(m.p.n)}${rates[i] != null ? ', rated ' + rates[i] : ''}: open its page`)}</li>`).join('');
  const scale = [['miss', 'under 60'], ['work', '60s'], ['solid', '70s'], ['ready', '80s'], ['top', '90+']].map(([k, w]) => `<li class="${k === band ? 'on' : ''}" style="--bd:var(--band-${k})"><i></i><span>${w}</span></li>`).join('');
  const total = G ? `<p class="ph-rc-tot"><span class="u">Strength Score</span><span class="ph-rc-num"><b class="u" style="--bd:var(--band-${band})">${Math.round(G.s)}</b><small class="u">/100</small></span></p>
      <p class="ph-rc-band"><i aria-hidden="true" style="--bd:var(--band-${band})"></i><span class="u">${E(CH.wordOf(G.s))}</span></p>` : '';
  return `<figure class="ph-rc" aria-labelledby="ph-rc-h"><div class="ph-rc-p">
    <p class="ph-rc-hd"><span class="u">NastyPlot</span><span>Strength Score receipt</span></p>
    <h2 class="ph-rc-h" id="ph-rc-h">Winning team · ${E(C.ev.name)}${when ? ` · ${E(when)}` : ''}${C.ev.players ? ` · ${E(V2.phNum(C.ev.players))} players` : ''}</h2>
    <ol class="ph-rc-ls">${lines}</ol>${total}
    ${G ? `<ol class="ph-rc-sc" aria-hidden="true">${scale}</ol>` : ''}
    <p class="ph-rc-ft">Your receipt adds its Matchups, Suggestions and Team Checks.</p></div>
    ${F.beforeMD ? '<p class="ph-rc-stamp u" aria-hidden="true">Reg M-D · Dec 2</p>' : ''}</figure>`; };
V2.phA = () => { const E = V2.esc, F = V2.phFacts();
  const em = F.beforeMD ? 'before Reg M-D.' : F.reg ? `for Reg ${E(F.reg)}.` : 'today.';
  const list = F.top.map((x, i) => { const k = lairRank(x.p), rk = k ? k.rank : i + 1, r = RS(x.r.total);
    return `<li>${V2.phMon('ph-tr', x.p, `<b class="ph-tr-k u" aria-hidden="true">${rk}</b><span class="ph-tr-a" aria-hidden="true">${V2.mon(x.p.n, {bare: true, iw: 40})}</span><span class="ph-tr-n">${E(V2.disp(x.p.n))}</span><span class="ph-tr-bar" aria-hidden="true" style="--w:${Math.max(8, Math.min(100, (r - 40) * 100 / 60)).toFixed(0)}%"></span><b class="ph-tr-r u" aria-hidden="true">${r}</b>`, `Number ${rk}: ${V2.disp(x.p.n)}, rated ${r}: open its page`)}</li>`; }).join('');
  return `<div class="ph ph-a">
  <section class="ph-a-top" aria-labelledby="ph-h1"><div class="ph-a-copy">
    <p class="k-kicker">Team builder · Strength Score</p>
    <h1 class="k-h1 u ph-a-h1" id="ph-h1">Rate your Pokémon Champions team <em>${em}</em></h1>
    <p class="k-lead">Add your six. NastyPlot scores it out of 100 against ${E(V2.phNum(F.teams))} real tournament teams, then shows its Matchups and exactly what to change.</p>
    <div class="ph-acts">${V2.kGo('Score My Team', {href: '#team'})}${V2.kBtn('Build Me a Team', {href: '#build'})}</div>
    ${F.md ? `<p class="ph-a-md"><span class="ph-md-l">${E(F.md)}</span><span class="ph-md-s">${E(F.mdShort)}</span></p>` : ''}
  </div>${V2.phReceipt(F)}</section>
  <section class="ph-a-list" aria-labelledby="ph-list-h"><div class="ph-a-lh"><h2 class="u ph-h2" id="ph-list-h">Pokémon Champions tier list, <em>right now.</em></h2>
    <p class="ph-note">The ten highest ratings${F.reg ? ` in Reg ${E(F.reg)}` : ''}, from tournament results${F.fresh ? ` (${E(F.fresh)})` : ''}. ${V2.kLink(`All ${F.all} Ratings`, {href: '#meta'})}</p></div>
    <ol class="ph-trs">${list}</ol></section>
  ${V2.phTools('Every tool, <em>one site.</em>')}</div>`; };

// ---- B. The Tier Wall ----
V2.phB = () => { const E = V2.esc, F = V2.phFacts(), X = V2.phChamp();
  const bars = F.top.map((x, i) => { const k = lairRank(x.p), rk = k ? k.rank : i + 1, r = RS(x.r.total), t = lTier(x.r.total);
    return `<li style="--w:${Math.max(24, Math.min(100, (r - 40) * 100 / 60)).toFixed(0)}%">${V2.phMon('ph-wb' + (i === 0 ? ' one' : ''), x.p, `<b class="ph-wb-k u" aria-hidden="true">${rk}</b><span class="ph-wb-bar"><span class="ph-wb-n u">${E(V2.disp(x.p.n))}</span><span class="ph-wb-a" aria-hidden="true">${V2.mon(x.p.n, {bare: true, iw: 56})}</span></span><b class="ph-wb-r u" aria-hidden="true">${r}</b>`, `Number ${rk}: ${V2.disp(x.p.n)}, rated ${r}, ${t.k} tier: open its page`)}</li>`; }).join('');
  const champ = X && X.G ? `<p class="ph-b-ch"><b class="u" style="--bd:var(--band-${V2.phBand(X.G)})">${Math.round(X.G.s)}</b><span>Strength Score of the six that won <strong>${E(X.C.ev.name)}</strong>${X.C.ev.date ? ` on ${E(V2.phDate(X.C.ev.date))}` : ''}: ${E(CH.wordOf(X.G.s))}.</span></p>` : '';
  return `<div class="ph ph-b">
  <section class="ph-b-band" aria-labelledby="ph-h1"><div class="ph-b-head">
    <p class="k-kicker">${F.reg ? `Reg ${E(F.reg)} · ` : ''}Live tier list${F.fresh ? ` · ${E(F.fresh)}` : ''}</p>
    <h1 class="u ph-b-h1" id="ph-h1">Pokémon Champions tier list, <em>rated by who wins.</em></h1>
    <p class="ph-b-lead">Every rating comes from ${E(V2.phNum(F.teams))} real tournament teams. Then put your own six on the same scale.</p>
    <div class="ph-acts">${V2.kGo('Score My Team', {href: '#team'})}<a class="ph-b-all" href="#meta">All ${F.all} Ratings&nbsp;›</a></div>
    ${F.mdShort ? `<p class="ph-b-md"><b class="u">${E(F.mdShort)}</b>${F.beforeMD ? ' This list switches to Reg M-D once 20 Reg M-D events are in.' : ''}</p>` : ''}
  </div><ol class="ph-b-bars" aria-label="The top 10 by rating">${bars}</ol></section>
  <section class="ph-b-how" aria-labelledby="ph-how-h"><div><h2 class="u ph-h2" id="ph-how-h">Your six, <em>on the same scale.</em></h2>
    <p class="ph-note">The Strength Score rates a whole team out of 100: 90+ Top tier, 80s Tournament ready, 70s Solid, 60s Needs work, under 60 Missing a basic. It checks your six against the teams that win right now.</p></div>
    <div class="ph-b-hr">${champ}${V2.kBtn('Build Me a Team', {href: '#build'})}</div></section>
  ${V2.phTools('Every tool, <em>one site.</em>')}</div>`; };
