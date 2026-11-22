// ---------- Battle a team, once their six is in (Nov 22): Sim's pick "The target" (docs/rebuild/reskin/battle-target-brief.md) ----------
// Their biggest threat (The Read's own pick, V2.btOnce) is THE TARGET. The hero is its HP as a plot bar on the war-room night panel:
// your hits on it stacked in real damage (low rolls solid, the extra high rolls lighter, each in its move's type colour), past 100% into
// overkill, with the KO point a hard pink line. When it is one of their likely leads the hits are turn one's own (turnOneData's hits,
// numbered by move order like the list under the bar); when it waits in the back they are your two leads' best hits on it, the same
// numbers as Damage Both Ways (battlePlan's damage). No new maths. Honest when the hits fall short: no KO stamp, the bar stops short,
// the line says so. Turn one stays whole under the bar, in move order. Everything under the hero is battle.js's own sections.
// Falls back to the page before it (battle-pbp.js) with no turn one (fewer than two of theirs, singles) or no biggest threat.
V2.btgSame = (x, tg) => !!(x && tg && ((x._orig || x) === tg || (x.p && tg.p && x.p.n === tg.p.n)));
V2.btgPct = v => (typeof dmgP === 'function' ? dmgP(v) : String(Math.round(v)));
// the plan for the hero, as plain data: the target, where its hits come from, the hits and what they add up to
V2.btgData = (mine, theirs, P) => { const T = P && P.turnOne, O = P ? V2.btOnce(P) : null, thr = O && O.thr; if (!T || !thr || !T.beats || !T.beats.length || !P.r || P.r.lead.length < 2) return null;
  const tg = thr.o, leads = P.r.lead.map(i => mine[i]), inLead = T.opp.some(o => V2.btgSame(o, tg));
  let hits = [];
  if (inLead) T.beats.forEach((b, i) => { const h = b.me && (b.hits || []).find(x => V2.btgSame(x.o, tg)); if (!h || h.charge) return;
    const note = b.flinch === 'likely' || b.koRisk ? String(b.why || '').slice(String(b.main || '').length).replace(/^[.\s]+/, '').split('. ')[0] : '';
    hits.push({n: i + 1, who: b.x, mv: h.mv, type: h.type, lo: 100 * h.min / h.hp, hi: 100 * h.max / h.hp, sash: h.sash, acc: h.acc, risk: note}); });
  else { const tj = theirs.indexOf(tg); leads.forEach(m => { const ci = P.chosen.indexOf(m), a = ci >= 0 && tj >= 0 && P.damage[ci] && P.damage[ci][tj] ? P.damage[ci][tj].a : null;
    if (a && a.r && a.r.hp && !a.charge) hits.push({n: 0, who: m, mv: a.mv.name, type: a.r.type || a.mv.type, lo: 100 * a.r.min / a.r.hp, hi: 100 * a.r.max / a.r.hp, sash: !!a.r.sash, acc: a.acc, risk: ''}); }); }
  const lo = hits.reduce((s, h) => s + h.lo, 0), hi = hits.reduce((s, h) => s + h.hi, 0), held = hits.length === 1 && hits[0].sash; /* one hit into a Focus Sash / Sturdy: it holds at 1 HP; two hits break it */
  const sure = !held && lo >= 100, maybe = !held && hi >= 100, acc = Math.min(100, ...hits.map(h => h.acc || 100)), risk = hits.some(h => h.risk);
  return {T, thr, tg, leads, inLead, hits, lo, hi, held, sure, maybe, acc, risk}; };
V2.btgHead = (D, P, theirs) => { const E = V2.esc, nm = V2.keepForm(E(V2.disp(D.tg.p.n))), who = V2.btOppWho(), ev = who && ui.oppFrom && ui.oppFrom.ev ? ui.oppFrom.ev : '', sheet = V2.btSheet();
  const h1 = !D.hits.length ? `Keep an eye on <em>${nm}.</em>` : D.inLead ? (D.sure ? `Take out <em>${nm}</em> first.` : `Hit <em>${nm}</em> first.`) : D.sure ? `Save a KO for <em>${nm}.</em>` : `Keep an answer for <em>${nm}.</em>`;
  const lead = D.inLead ? `Their biggest threat is a likely lead.` : `Their biggest threat likely waits in the back.`; /* your leads: Bring These Four, under the hero */
  const vs = who || sheet || theirs.length < 6 ? `<p class="btg-vs">Vs ${who ? `<b>${E(who)}</b>${ev ? ` at ${E(ev)}` : ''}` : 'their six'}${theirs.length < 6 ? `, ${theirs.length} of 6 entered` : ''}.${sheet ? ' Their real open team sheet.' : ''}</p>` : ''; /* running text: commas and full stops, no ' · ' (X-08) */
  return `<section class="btg-top">${V2.kHead({kicker: 'BATTLE · THE TARGET', h1Html: h1, leadHtml: lead})}${vs}</section>`; };
// the real-games verdict (today's words and test hooks, battle.js battleHead), beside who to bring
V2.btgVerdict = P => { const E = V2.esc, R = P.real; if (!R) return ''; const vcls = {Favoured: 'vf', 'Even match': 've', Unfavoured: 'vu'}[R.word] || 've';
  return `<div class="bt-verdict"><p class="k">From real games</p><b class="u ${vcls}">${E(R.word)}${R.full ? '' : ' so far'}</b><small>learned from ${homeNum(R.games)} tournament games</small>${V2.btT1Risk(P) ? `<small class="bt-vrisk">How six-vs-six matchups like this went. It doesn't see turn one: yours has a risk (see Watch).</small>` : ''}</div>`; };
// the plot bar: the track runs to the bigger of 100% and the hits' high rolls (at most 200%: more is all overkill); the frame is 100%
V2.btgBar = D => { const E = V2.esc, nm = V2.disp(D.tg.p.n), S = Math.max(100, Math.min(200, Math.ceil(D.hi / 10) * 10)), w = v => (100 * v / S).toFixed(2) + '%';
  let at = 0; const seg = [];
  for (const h of D.hits) { const v = Math.min(h.lo, S - at); if (v > 0) seg.push(`<i class="btg-seg" style="left:${w(at)};width:${w(v)};--tc:var(--tyn-${V2.TYPES.includes(h.type) ? h.type : 'Normal'})">${h.n ? `<b class="btg-pin u">${h.n}</b>` : ''}</i>`); at += Math.max(0, v); }
  for (const h of D.hits) { const v = Math.min(h.hi - h.lo, S - at); if (v > 0) seg.push(`<i class="btg-seg lt" style="left:${w(at)};width:${w(v)};--tc:var(--tyn-${V2.TYPES.includes(h.type) ? h.type : 'Normal'})"></i>`); at += Math.max(0, v); }
  const say = D.hits.length ? `${nm}'s HP: ${D.hits.map(h => `${h.who.d}'s ${h.mv} ${V2.btgPct(h.lo)} to ${V2.btgPct(h.hi)}%`).join(', then ')}${D.sure ? ': a KO even on low rolls' : D.maybe ? ': a KO only on high rolls' : ': not a KO'}` : `${nm}'s HP: no hit on it`;
  const left = D.hi <= 70 ? `<span class="btg-left u" style="left:${w(D.hi)};width:${w(100 - D.hi)}">${100 - Math.round(D.hi)}% left</span>` : ''; /* only where the words fit; the line under the bar always says it */
  const over = D.hi > 100 ? `<span class="btg-over" style="left:${w(100)};width:${w(Math.min(S, D.hi) - 100)}">overkill</span>` : '';
  return `<div class="btg-track" style="--fw:${w(100)}" role="img" aria-label="${E(say)}"><span class="btg-frame" style="width:${w(100)}"></span>${seg.join('')}${left}<span class="btg-ko${D.sure ? ' on' : ''}" style="left:${w(100)}">${D.sure ? '<b class="u">KO</b>' : '<b class="u">100%</b>'}</span>${over}</div>`; };
// the line under the bar: what the hits add up to, in plain words
V2.btgSum = D => { const nm = V2.keepForm(V2.esc(V2.disp(D.tg.p.n))), n = D.hits.length, p = V2.btgPct, acc = D.acc < 100 ? ` (${D.acc}% to hit)` : '';
  if (!n) return D.inLead ? `<p class="btg-sum"><b class="u">Turn one doesn't touch ${nm}.</b><span>Your leads aim elsewhere: the move order below says where.</span></p>`
    : `<p class="btg-sum"><b class="u">Your leads can't dent ${nm}.</b><span>Bring an answer from the back.</span></p>`;
  const both = n > 1 ? (D.risk ? 'If both land' : 'Both land') : (D.risk ? 'If it lands' : 'It lands');
  if (D.held) return `<p class="btg-sum"><b class="u">Focus Sash holds it at 1 HP.</b><span>Up to ${p(D.hi)}% from one hit: it needs a second.</span></p>`;
  const solo = D.hits.filter(h => h.lo >= 100 && !h.sash).length, iff = D.risk ? 'If they land: ' : ''; /* a hit that KOs on its own, even on its low roll */
  if (D.sure && n > 1 && solo) return `<p class="btg-sum ok"><b class="u">${iff}${solo === n ? `${iff ? 'either' : 'Either'} hit KOs ${nm}.` : `${iff ? 'one' : 'One'} hit is enough: ${nm} is gone.`}</b><span>Even the low rolls add up to ${p(D.lo)}%${acc}.</span></p>`;
  if (D.sure) return `<p class="btg-sum ok"><b class="u">${both}: ${nm} is gone.</b><span>${n > 1 ? `Even the low rolls add up to ${p(D.lo)}%` : `Even its low roll does ${p(D.lo)}%`}${acc}.</span></p>`;
  if (D.maybe) return `<p class="btg-sum"><b class="u">A KO only on good rolls.</b><span>${n > 1 ? 'Together' : 'On its own'} ${p(D.lo)} to ${p(D.hi)}%${acc}.</span></p>`;
  return `<p class="btg-sum"><b class="u">${D.inLead ? 'No KO on turn one.' : 'No KO from your leads alone.'}</b><span>${n > 1 ? 'Together' : 'On its own'} up to ${p(D.hi)}%: it keeps at least ${Math.max(1, 100 - Math.round(D.hi))}% of its HP.</span></p>`; };
// a move in a line of text: its type word on its type colour with the type's symbol (never the symbol alone), then its name
V2.btgMt = t => V2.TYPES.includes(t) ? `<span class="btg-mt" style="--mc:var(--ty-${t})">${V2.kTy(t)}<span>${t}</span></span>` : '';
// one move of turn one (today's act and why lines; the same KO stamp rule as battle-pbp.js pbpBeat): a hit on the target carries its numbers
V2.btgBeat = (b, i, T, D) => { const E = V2.esc, all = [...T.leads, ...T.opp], m = String(b.act).match(/^(.+?) into (.+)$/) || String(b.act).match(/^(Fake Out) (.+)$/) || String(b.act).match(/^(.+?) \(hits both\)$/);
  const tgt = m && m[2] ? all.find(x => x.d === m[2]) : null, move = m ? m[1] : b.act, why = String(b.why || ''), atk = !!(m && !/^Fake Out$/.test(move));
  const ko = tgt && atk && (b.koSure != null ? !!b.koSure : /^KOs/.test(b.main != null ? String(b.main) : why.split(/; /)[0]));
  const h = D.inLead ? D.hits.find(x => x.n === i + 1) : null, f = V2.kMoveFacts(move), ty = (h && h.type) || (b.hits && b.hits[0] && b.hits[0].type) || f.type; /* the type the hit really has (Weather Ball in sun is Fire) */
  const say = `Move ${i + 1}, ${b.me ? 'you' : 'them'}: ${b.x.d}, ${b.speed} Speed${b.prio ? `, ${b.prio > 0 ? '+' : '−'}${Math.abs(b.prio)} priority` : ''}, ${b.act}, ${why}${ko ? ', a knockout' : ''}.`;
  const dmg = h ? `<p class="btg-dmg" style="--tc:var(--tyn-${V2.TYPES.includes(h.type) ? h.type : 'Normal'})"><b class="u">${V2.btgPct(h.lo)}–${V2.btgPct(h.hi)}%</b>${ko ? '<em class="btg-ko1 u">KO</em>' : ''}</p>` : ko ? '<p class="btg-dmg"><em class="btg-ko1 u">KO</em></p>' : '';
  /* a sure KO on the target: its stamp and numbers say 'KOs', so the line keeps only what comes after (a note), if anything */
  const rest = why.slice(String(b.main || '').length).replace(/^[.\s]+/, ''), main = String(b.main || why);
  /* a hit on the target: a sure KO's stamp and numbers already say 'KOs'; a risk already in the hero's Risk line isn't said twice */
  const shown = !h ? why : [ko && /^KOs\b/.test(main) ? '' : main.replace(/^Up to [\d.]+% of (?:its|their .+?'s) HP, (\w)/, (x, c) => c.toUpperCase()) /* the numbers above say 'up to N%' */, h.risk && rest.startsWith(h.risk) ? rest.slice(h.risk.length).replace(/^[.\s]+/, '') : rest].filter(Boolean).join('. ');
  const into = tgt ? ` <span class="btg-into">into ${b.me ? 'their' : 'your'} ${E(tgt.d)}</span>` : /\(hits both\)$/.test(b.act) ? ' <span class="btg-into">hits both foes</span>' : '';
  return `<li class="btg-b ${b.me ? 'you' : 'them'}${h ? ' hit' : ''}" aria-label="${E(say)}"><i class="btg-n u" aria-hidden="true">${i + 1}</i>${V2.mon(b.x.p.n, {iw: 48, bare: true})}
    <div class="btg-tx" aria-hidden="true"><p class="btg-who"><span class="btg-sd">${b.me ? 'Your' : 'Their'}</span> ${E(b.x.d)} <small>${b.speed} Speed${b.prio ? ` · ${b.prio > 0 ? '+' : '−'}${Math.abs(b.prio)} priority` : ''}</small></p>
      <p class="btg-mv">${f.type ? V2.btgMt(ty) : ''}<b class="btg-mvn">${E(move)}</b>${into}</p>${dmg}${shown ? `<p class="btg-why">${E(shown)}</p>` : ''}</div></li>`; };
// the hits when the target waits in the back: your two leads' best hits on it (Damage Both Ways' numbers)
V2.btgHits = D => `<ul class="btg-hits">${D.hits.map(h => `<li><span class="btg-mv">${V2.btgMt(h.type)}<b class="btg-mvn">${V2.esc(h.mv)}</b></span> from your ${V2.keepForm(V2.esc(h.who.d))}: <b class="btg-hn u" style="--tc:var(--tyn-${V2.TYPES.includes(h.type) ? h.type : 'Normal'})">${V2.btgPct(h.lo)}–${V2.btgPct(h.hi)}%</b></li>`).join('')}</ul><p class="btg-src">Each lead's best hit on it, the same numbers as Damage Both Ways.</p>`; /* one line per hit (phones: about two) */
V2.btgHero = (D, P) => { const E = V2.esc, T = D.T, tg = D.tg, nm = V2.disp(tg.p.n), id = typeof SPRITE_ID === 'object' ? SPRITE_ID[tg.p.n] : null;
  const mark = `<div class="btg-mark"><span class="btg-tg u">Target</span><button type="button" class="btg-art" data-v2mon="${E(tg.p.n)}" aria-label="${E(nm)}, their biggest threat: open its page">${id ? `<img src="${V2.art(id, true)}" alt="" decoding="async">` : ''}</button>
    <div class="btg-id"><small>Biggest threat</small><b class="u" data-kmax="3">${V2.keepForm(E(nm))}</b><p>${E(D.thr.t)}${D.thr.d ? ': ' + V2.keepForm(E(D.thr.d)) : ''}</p></div></div>`; /* The Read's own words (V2.btOnce); The Read below then leaves its card out */
  const risk = D.hits.filter(h => h.risk).map(h => `Your ${E(h.who.d)}: ${E(h.risk.charAt(0).toLowerCase() + h.risk.slice(1))}.`).join(' ');
  const F0 = T.field || {}, fld = F0.weather || T.terrain ? `${fieldWords(F0)}${F0.wBy ? ` (${F0.wBy.d})` : ''}${F0.negated && F0.weather ? ", cancelled by Cloud Nine / Air Lock while it's out" : ''}${F0.traced ? '. A Trace user may copy it' : ''}` : ''; // today's words (battle.js battleTurn)
  const steps = `<div class="btg-t1"><h2 class="btg-h3 u">Turn One, in Move Order</h2><p class="btg-sub">Your ${E(T.leads.map(x => x.d).join(' + '))} vs their likely ${E(T.opp.map(x => x.d).join(' + '))}</p>
    <ol class="btg-steps">${T.beats.map((b, i) => V2.btgBeat(b, i, T, D)).join('')}</ol></div>`;
  const watch = `${T.warn && T.warn.length ? `<p class="bt-warn btg-warn"><i class="u">Watch</i> ${V2.keepForm(T.warn.map(E).join('; '))}. Consider Protect.</p>` : ''}${fld ? `<p class="bt-field btg-field">Field on turn 1: <b>${E(fld)}</b></p>` : ''}`;
  return `<section class="btg-hero" aria-label="The target: ${E(nm)}">${mark}<div class="btg-plan">${risk ? `<p class="btg-risk"><span class="u">Risk</span>${risk}</p>` : ''}
    <p class="btg-bk u"><span class="btg-bkn">${V2.keepForm(E(nm))}'s</span><span class="btg-bki">Its</span> HP, ${D.inLead ? 'turn one' : 'when it comes in'}</p>${V2.btgBar(D)}${V2.btgSum(D)}${D.inLead ? '' : V2.btgHits(D)}${watch}</div>${steps}</section>`; };
// who to bring and their six: the same groups and words as the poster (Lead / Back / Leave home; Likely lead / The other four), the target marked
V2.btgMon = (n, sub, cls, tag) => `<button type="button" class="btg-pk${cls ? ' ' + cls : ''}" data-v2mon="${V2.esc(n)}" aria-label="${V2.esc(V2.disp(n))}${sub ? ', ' + V2.esc(sub) : ''}${tag ? ', ' + V2.esc(tag) : ''}: open its page">${V2.mon(n, {iw: 72, bare: true})}<b>${V2.esc(V2.disp(n)).replace(/ (\S{1,2})$/, ' $1')}</b>${sub ? `<small>${V2.esc(sub).replace(/ (\S{1,2})$/, '\u00a0$1')}</small>` : ''}${tag ? `<em class="u">${V2.esc(tag)}</em>` : ''}</button>`;
V2.btgCast = (mine, theirs, P, D) => { const r = P.r, ll = P.likelyLead || [], rest = theirs.filter(o => !ll.includes(o)), E = V2.esc;
  const g = (lab, cls, list) => list.length ? `<div class="btg-g ${cls}"><p class="btg-gl u">${lab}</p><div class="btg-row">${list.join('')}</div></div>` : '';
  const mineHtml = g('Lead', 'lead', r.lead.map(i => V2.btgMon(mine[i].p.n, V2.btItem(mine[i])))) + g('Back', 'back', r.back.map(i => V2.btgMon(mine[i].p.n, V2.btItem(mine[i]))));
  const home = r.bench.length ? `<p class="btg-home"><span class="btg-gl u">Leave home</span>${r.bench.map(i => `<button type="button" class="np-link" data-v2mon="${E(mine[i].p.n)}" aria-label="${E(mine[i].d)}: open its page">${E(mine[i].d)}</button>`).join('')}</p>` : '';
  const them = o => V2.btgMon(o.p.n, '', o === D.tg ? 'tgt' : '', o === D.tg ? 'Target' : '');
  return `<section class="btg-cast" aria-label="Your four against their six"><div class="btg-mine"><h2 class="btg-h u">Bring These Four</h2><div class="btg-grp">${mineHtml}</div>${home}</div>
    <div class="btg-them"><h2 class="btg-h u">Their Six</h2><div class="btg-grp">${g('Likely lead', 'll', ll.map(them))}${g('The other four', 'rest', rest.map(them))}</div></div>${V2.btgVerdict(P)}</section>`; };
V2.btgActs = P => `<div class="btg-acts"><p class="fine">Lead pair tested on 13,000 ladder games: players who led with this pair won more than their rating predicted.${P.twoMegas ? ' Only one Mega can Mega Evolve this battle.' : ''}</p>
  <div class="row"><button type="button" class="np-btn2" data-btopp><span>Change Their Six</span></button>${V2.btSheet() ? '<button type="button" class="np-btn2" data-btcopy><span>Copy for Showdown</span></button>' : ''}<button type="button" class="np-link" data-btclear>Clear</button></div></div>`;
(() => { const before = V2.pages.battle.draw; V2.pages.battle.draw = () => { const {mine, theirs, P} = V2.btPlan(); if (!P || !theirs.length || !P.r || !P.r.lead || S.format !== 'doubles') return before();
  let D = null; try { D = V2.btgData(mine, theirs, P); } catch (e) { console.error(e); } if (!D) return before();
  return `<div class="bt2 pbp btg">${V2.battleToolsBar()}${V2.btgHead(D, P, theirs)}${V2.btgHero(D, P)}${V2.btgCast(mine, theirs, P, D)}${V2.btgActs(P)}<section class="bt-plan"><div class="bt-pl">${V2.battleRead(theirs, P, true)}</div>${V2.battleWatch(P)}</section>${V2.battleTabs(theirs, P)}${V2.battleDetail(mine, theirs, P)}${V2.battleMoreTools()}${V2.battleLog(P)}</div>`; }; })();
