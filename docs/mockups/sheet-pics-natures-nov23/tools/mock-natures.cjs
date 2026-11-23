// Nov 23 mock-up, round 2: the Nature sheet ("psych profile") and the Natures page (5x5 grid + the line-up).
// Injects into the downloaded Preview (preview2) with real numbers from natures-28.json. Reference only, not code to paste in.
// Usage: node mock-natures.cjs <outdir>
const {chromium} = require('C:/Users/simra/code/pl-pcrun/node_modules/playwright'); const {open} = require('./pv-shot.cjs');
const DATA = require('./natures-28.json');
// site names for the sheet names (the real build uses nameOf in update.mjs)
const SITE = {'Eternal Flower Floette': 'Floette-Eternal', 'Indeedee ♀': 'Indeedee-F'};
for (const D of Object.values(DATA.nat)) D.users.forEach(u => { u[0] = SITE[u[0]] || u[0]; });
const STATS = ['Atk', 'Def', 'SpA', 'SpD', 'Spe'];
const NAT = {Hardy: ['Atk', 'Atk'], Lonely: ['Atk', 'Def'], Adamant: ['Atk', 'SpA'], Naughty: ['Atk', 'SpD'], Brave: ['Atk', 'Spe'],
  Bold: ['Def', 'Atk'], Docile: ['Def', 'Def'], Impish: ['Def', 'SpA'], Lax: ['Def', 'SpD'], Relaxed: ['Def', 'Spe'],
  Modest: ['SpA', 'Atk'], Mild: ['SpA', 'Def'], Bashful: ['SpA', 'SpA'], Rash: ['SpA', 'SpD'], Quiet: ['SpA', 'Spe'],
  Calm: ['SpD', 'Atk'], Gentle: ['SpD', 'Def'], Careful: ['SpD', 'SpA'], Quirky: ['SpD', 'SpD'], Sassy: ['SpD', 'Spe'],
  Timid: ['Spe', 'Atk'], Hasty: ['Spe', 'Def'], Jolly: ['Spe', 'SpA'], Naive: ['Spe', 'SpD'], Serious: ['Spe', 'Spe']};
const CSS = `
:root{--nt-paper:#FBF8F0;--nt-ink:#17161A;--nt-rule:rgba(0,104,173,.14);--nt-clip:#8F98A3}
.nt-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font:700 13px/1.4 var(--b);color:#fff;white-space:nowrap}
.nt-chip.up{background:var(--sc)}.nt-chip.dn{background:transparent;color:var(--sc);box-shadow:inset 0 0 0 2px var(--sc)}
:root[data-theme=night] .ntp .nt-chip.dn{color:#fff;box-shadow:inset 0 0 0 2px var(--sc)}
/* THE SHEET: a clipboard. Paper with faint ruled lines, a red margin line in the raised stat's colour, a metal clip on top */
.is-tab.kd-nature{position:relative;background:var(--nt-paper);color:var(--nt-ink);border-radius:10px;padding:34px 28px 22px 44px;display:flex;align-items:center;gap:22px;overflow:hidden;
  background-image:repeating-linear-gradient(180deg,transparent 0 27px,var(--nt-rule) 27px 28px);box-shadow:0 1px 0 rgba(0,0,0,.06),0 10px 24px -14px rgba(30,20,50,.45)}
.is-tab.kd-nature:before{content:"";position:absolute;left:26px;top:0;bottom:0;width:2px;background:var(--sc)}
.is-tab.kd-nature .clip{position:absolute;top:-2px;left:50%;width:120px;height:22px;margin-left:-60px;border-radius:0 0 8px 8px;background:linear-gradient(180deg,#B9C0C8,var(--nt-clip));box-shadow:inset 0 -2px 0 rgba(0,0,0,.18)}
.is-tab.kd-nature .clip:after{content:"";position:absolute;left:50%;top:6px;width:22px;height:8px;margin-left:-11px;border-radius:4px;background:#6D7580}
.is-tab.kd-nature .gh{color:transparent;-webkit-text-stroke:1.5px rgba(23,22,26,.08)}
.is-tab.kd-nature .is-kk{background:var(--nt-ink);color:#fff}
.is-tab.kd-nature h2{color:var(--nt-ink)}
.is-tab.kd-nature h2 .ul{display:block;height:6px;margin-top:2px;width:70%;background:var(--sc);border-radius:3px;transform:skewX(-24deg) rotate(-1.2deg);opacity:.85}
.is-tab.kd-nature .is-sub{color:#48454F}
.is-tab.kd-nature .is-sh b,.is-tab.kd-nature .is-sh span{color:var(--nt-ink)}
.is-tab.kd-nature .stamp{position:absolute;right:190px;top:16px;font:italic 800 13px/1 var(--u);font-synthesis:style;color:var(--sc);box-shadow:inset 0 0 0 2px var(--sc);padding:5px 8px;transform:rotate(-8deg);opacity:.85}
/* the picture slot (same idea as the move seal): the two stats, raised over lowered */
.ntpic{flex:none;width:96px;display:grid;gap:6px;transform:rotate(-2deg)}
.ntpic div{display:flex;align-items:center;justify-content:center;gap:6px;height:40px;border-radius:6px;font:italic 800 17px/1 var(--u);font-synthesis:style}
.ntpic .up{background:var(--sc);color:#fff}.ntpic .dn{background:#fff;color:var(--sd);box-shadow:inset 0 0 0 2.5px var(--sd)}
.ntpic .nn{background:#E7E3DA;color:#66636E;height:86px;flex-direction:column;gap:2px;font-size:15px}
.ntpic .nn small{font:600 11px/1.2 var(--b);font-style:normal}
.is-tab.kd-nature .is-tn{flex:1;min-width:0}
@media (max-width:699.98px){.is-tab.kd-nature{flex-wrap:wrap;padding:32px 16px 16px 30px;gap:14px}.is-tab.kd-nature:before{left:16px}.ntpic{width:76px}.ntpic div{height:34px;font-size:15px}
  .is-tab.kd-nature .is-sh{flex-basis:100%}.is-tab.kd-nature .stamp{display:none}}
/* THE PAGE */
.ntp{max-width:1248px;margin:0 auto;padding:32px var(--gut) 64px}
.ntp-k{display:inline-block;background:var(--plate);color:var(--on-plate);font:italic 800 13px/1 var(--u);font-synthesis:style;padding:6px 10px;transform:skewX(-12deg)}
.ntp h1{font:italic 800 var(--d-hero)/1.05 var(--u);font-synthesis:style;margin:12px 0 8px;color:var(--ink)}
.ntp .lede{font:400 17px/1.5 var(--b);color:var(--ink-2);max-width:62ch;margin:0 0 28px}
.ntp .lede b{color:var(--ink)}
.ntg{display:grid;grid-template-columns:84px repeat(5,minmax(0,1fr));gap:6px}
.ntg .hd{display:flex;align-items:center;justify-content:center;font:700 13px/1.2 var(--b);color:var(--ink-2);text-align:center}
.ntg .hd.row{justify-content:flex-start}
.ntg .corner{font:600 13px/1.3 var(--b);color:var(--ink-3);justify-content:flex-start;align-items:flex-end}
.ntc{position:relative;min-height:92px;border-radius:6px;padding:10px 12px;display:flex;flex-direction:column;justify-content:space-between;background:var(--surface);
  box-shadow:inset 0 0 0 1px var(--rule);color:var(--ink);text-align:left;font:inherit;border:0;cursor:pointer;overflow:hidden}
.ntc .fill{position:absolute;inset:0;background:var(--sc);opacity:var(--a);pointer-events:none}
.ntc b{position:relative;font:700 16px/1.2 var(--b)}
.ntc em{position:relative;font:italic 800 20px/1 var(--u);font-synthesis:style}
.ntc small{position:relative;font:600 13px/1.3 var(--b);color:var(--ink-3)}
.ntc.hot{color:#fff}.ntc.hot small{color:rgba(255,255,255,.86)}
.ntc.neu{background:repeating-linear-gradient(-45deg,var(--wash) 0 6px,transparent 6px 12px);box-shadow:inset 0 0 0 1px var(--rule)}
.ntc.neu em{font-size:15px;color:var(--ink-3)}
.ntg .nt-chip .sh{display:none}@media (max-width:699.98px){.ntg .nt-chip .sh{display:inline}.ntg .hd.row .nt-chip{padding:2px 3px}}
.nt-key{display:flex;flex-wrap:wrap;gap:16px;margin:14px 0 0;font:400 13px/1.5 var(--b);color:var(--ink-3)}
.ntl{margin-top:48px}
.ntl h2{font:italic 800 28px/1.1 var(--u);font-synthesis:style;margin:0 0 4px;color:var(--ink)}
.ntl > p{margin:0 0 16px;font:400 15px/1.5 var(--b);color:var(--ink-3)}
.ntl ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:0 40px}
.ntl li{display:grid;grid-template-columns:28px minmax(0,1fr) auto;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--rule)}
.ntl .rk{font:italic 800 17px/1 var(--u);font-synthesis:style;color:var(--ink-3)}
.ntl .nm b{font:700 17px/1.2 var(--b);color:var(--ink);margin-right:8px}
.ntl .nm .nt-chip{margin-right:4px;transform:translateY(-1px)}
.ntl .nm small{display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;margin-top:6px;font:400 13px/1.3 var(--b);color:var(--ink-3)}
.ntl .nm small .w{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}.ntl .nm small img{width:32px;height:32px;object-fit:contain}
.ntl .pc{font:italic 800 22px/1 var(--u);font-synthesis:style;color:var(--ink);text-align:right}
.ntl .pc span{display:block;font:400 13px/1.3 var(--b);font-style:normal;color:var(--ink-3);margin-top:4px}
.ntsrc{margin-top:16px;font:400 13px/1.5 var(--b);color:var(--ink-3)}
@media (max-width:699.98px){.ntg{grid-template-columns:40px repeat(5,minmax(0,1fr));gap:3px}.ntg .nt-chip{padding:2px 4px;font-size:13px}.ntg .nt-chip .lg{display:none}.ntc.neu em{visibility:hidden}.ntg .corner{font-size:11px}.ntc{min-height:64px;padding:6px 5px}.ntc b{font-size:13px;letter-spacing:-.01em}.ntc em{font-size:15px}.ntc small{display:none}
  .ntg .hd{font-size:13px}.ntc.neu em{font-size:13px}.ntl ol{grid-template-columns:1fr}.ntp{padding-top:20px}}
@media (max-width:699.98px){.ntg{grid-template-columns:repeat(5,minmax(0,1fr))!important}.ntg .hd.row,.ntg .corner{display:none}
  .ntc{box-shadow:inset 3px 0 0 var(--rc),inset 0 0 0 1px var(--rule);padding:6px 4px 6px 7px;min-height:58px}.ntc b{font-size:13px;letter-spacing:-.02em}.ntc em{font-size:13px}
  .ntl li{padding:10px 0}.ntl .nm small{gap:2px 8px}.ntl .nm small .w{font-size:0}.ntl .nm small .w:after{content:attr(data-p);font:600 13px/1 var(--b)}.ntl .nm small img{width:28px;height:28px}
  .ntl .nm .nt-chip{font-size:13px;padding:1px 6px}}`;
const SN = {Atk: 'Attack', Def: 'Defense', SpA: 'Sp. Atk', SpD: 'Sp. Def', Spe: 'Speed'};
const SV = {Atk: '--st-atk', Def: '--st-def', SpA: '--st-spa', SpD: '--st-spd', Spe: '--st-spe'};
const LINES = (up, dn) => {
  if (up === dn) return ['Raises and lowers the same stat, so it changes nothing', 'Almost never chosen on purpose: pick a nature that helps', 'Same as Hardy, Docile, Bashful and Quirky'];
  const L = [`${SN[up]} ×1.1, ${SN[dn]} ×0.9. HP is never changed`];
  if (up === 'Atk' && dn === 'SpA') L.push('The usual pick for physical attackers: Special Attack goes unused');
  if (up === 'SpA' && dn === 'Atk') L.push('The usual pick for special attackers: Attack goes unused');
  if (up === 'Spe') L.push('Outspeeds the same Pokémon with a neutral Speed nature');
  if (dn === 'Spe') L.push('For Trick Room, where the slower Pokémon moves first');
  if (up === 'Def' || up === 'SpD') L.push('For bulky support Pokémon that need to stay in');
  if (dn === 'Def' || dn === 'SpD') L.push('Rare in doubles: spread moves hit the weak side often');
  return L.slice(0, 4); };
(async () => { const out = process.argv[2]; const b = await chromium.launch();
  const sheetJobs = ['Adamant', 'Timid', 'Quiet', 'Serious'];
  await Promise.all([[1440, 900], [390, 844]].map(async ([w, h]) => { const {p} = await open(b, w, h, '#meta');
    await p.addStyleTag({content: CSS});
    await p.evaluate(([NAT, SV]) => { window.NATM = NAT; window.SVM = SV; }, [NAT, SV]);
    for (const theme of ['day', 'night']) { if (theme === 'night') await p.evaluate(() => document.documentElement.dataset.theme = 'night');
      // the sheets
      for (const n of sheetJobs) { if (theme === 'night' && n !== 'Adamant') continue;
        const [up, dn] = NAT[n], D = DATA.nat[n];
        await p.evaluate(([n, up, dn, D, N, withNat, period, SN, lines]) => {
          const E = V2.esc, sc = `var(${SVM[up]})`, sd = `var(${SVM[dn]})`, neu = up === dn;
          const pct = D.pctMons, share = D.mons < 20 ? `<div class="is-sh is-sh0"><span>Rarely used (on ${D.mons} Pokémon)</span></div>` : `<div class="is-sh"><b class="u">${pct < 1 ? '<1' : Math.round(pct)}%</b><span>of tournament Pokémon</span></div>`;
          const pic = neu ? `<div class="ntpic" aria-hidden="true"><div class="nn">▲▼ ${E(SN[up])}<small>cancel out</small></div></div>`
            : `<div class="ntpic" aria-hidden="true" style="--sd:${sd}"><div class="up">▲ ${up.toUpperCase()}</div><div class="dn">▼ ${dn.toUpperCase()}</div></div>`;
          const sub = neu ? '<span>Neutral nature</span>' : '<span>Nature</span>';
          const tab = `<div class="is-tab kd-nature" style="--sc:${neu ? 'var(--type-none)' : sc}"><span class="clip" aria-hidden="true"></span><span class="gh u" aria-hidden="true">${E(n.toUpperCase())}</span>${pic}<div class="is-tn"><span class="is-kk u">PSYCH PROFILE · NATURE</span><h2 class="u">${E(n)}<span class="ul" aria-hidden="true"></span></h2><div class="is-sub">${sub}</div></div>${neu ? '' : '<span class="stamp u" aria-hidden="true">' + (up === 'Spe' ? 'QUICK TEMPER' : dn === 'Spe' ? 'TAKES ITS TIME' : up === 'Atk' || up === 'SpA' ? 'HITS HARD' : 'THICK SKIN') + '</span>'}${share}</div>`;
          const U = {t: D.mons, N: withNat, period, u: D.users.filter(u => u[3] >= 20).slice(0, 6).map(u => [u[0], u[1], u[3]])};
          const users = D.mons >= 50 && !neu ? U.u : [];
          const usersHtml = users.length ? `<section class="is-sec">${V2.isH('Usual suspects.', 'who runs it, and how often · tap one to open it')}<div class="is-users">${users.map(([q, c, tot]) => `<button type="button" class="is-u" data-v2mon="${E(q)}">${V2.mon(q, {iw: 48, bare: true})}<b>${V2.nameHtml(V2.disp(q))}</b><em class="u">${Math.round(100 * c / tot)}%</em><small>of ${V2.isFmt(tot)} ${E(V2.disp(q))} run it</small></button>`).join('')}</div><p class="is-src">Online tournaments, last 28 days (${E(period)}) · ${V2.isFmt(N)} teams</p></section>` : '';
          const stats = V2.isStats(neu ? [['Pokémon run it', String(D.nUsers)], ['Teams', V2.isFmt(D.teams)]]
            : [['Raises', SN[up] + ' +10%'], ['Lowers', SN[dn] + ' −10%'], ['Pokémon run it', String(D.nUsers)], ['Teams', V2.isFmt(D.teams)]]);
          const links = `<div class="is-sec is-links">${up === 'Spe' || dn === 'Spe' ? V2.kLink('Speed Tiers', {href: '#speed'}) : V2.kLink('Try It in the Calc', {href: '#calc'})}${V2.kLink('All Natures', {href: '#natures'})}</div>`;
          V2.sheet(`<div class="is2 kd-nature">${tab}<p class="is-lead">${neu ? 'Raises and lowers the same stat, so it does nothing.' : `Raises ${E(SN[up])} by 10% and lowers ${E(SN[dn])} by 10%.`}</p>${stats}${V2.isLines(lines)}${usersHtml}${links}</div>`, {label: n});
        }, [n, up, dn, D, DATA.N, DATA.withNat, 'Oct 21 – Nov 18', SN, LINES(up, dn)]);
        await p.waitForTimeout(700); const s = await p.$('.np-sheet'), bb = await s.boundingBox();
        const f = `${out}/sheet-${n.toLowerCase()}-${w}${theme === 'night' ? '-night' : ''}.png`;
        await p.screenshot({path: f, clip: {x: bb.x, y: bb.y, width: bb.width, height: Math.min(w < 700 ? 844 : 900 - bb.y, bb.height)}}); console.log('wrote', f);
        if (w < 700 && theme === 'day') { await s.screenshot({path: f.replace('.png', '-full.png')}); }
        await p.evaluate(() => V2.closeSheet()); await p.waitForTimeout(300); }
      // the page
      await p.evaluate(([DATA, STATS, SN]) => {
        const E = V2.esc, app = document.getElementById('app'), main = app.querySelector('main') || app;
        const byNat = {}; Object.entries(NATM).forEach(([n, [u, d]]) => byNat[u + d] = n);
        const max = Math.max(...Object.values(DATA.nat).map(x => x.pctMons));
        let g = `<div class="hd corner">▲ raises<br>▼ lowers</div>` + STATS.map(s => `<div class="hd"><span class="nt-chip dn" style="--sc:var(${SVM[s]})">▼<span class="lg"> ${E(SN[s])}</span><span class="sh"> ${s}</span></span></div>`).join('');
        for (const u of STATS) { g += `<div class="hd row"><span class="nt-chip up" style="--sc:var(${SVM[u]})">▲ ${E(u === 'SpA' ? 'SpA' : u === 'SpD' ? 'SpD' : u)}</span></div>`;
          for (const d of STATS) { const n = byNat[u + d], D = DATA.nat[n];
            if (u === d) { g += `<button class="ntc neu" type="button" style="--rc:var(${SVM[u]})"><b>${E(n)}</b><em>changes nothing</em><small>${D.pctMons < 0.1 ? 'almost never run' : D.pctMons + '% of Pokémon'}</small></button>`; continue; }
            const a = D.pctMons <= 0 ? 0 : Math.max(.06, Math.sqrt(D.pctMons / max)), hot = a > .55;
            g += `<button class="ntc${hot ? ' hot' : ''}" type="button" style="--sc:var(${SVM[u]});--rc:var(${SVM[u]});--a:${a.toFixed(2)}"><span class="fill"></span><b>${E(n)}</b><em>${D.pctMons < 0.1 ? '<0.1%' : D.pctMons + '%'}</em><small>${D.users[0] && D.mons >= 50 ? 'Top: ' + E(V2.disp(D.users[0][0])) : D.mons < 20 ? 'rarely used' : ''}</small></button>`; } }
        const top = Object.entries(DATA.nat).sort((a, b) => b[1].pctMons - a[1].pctMons).slice(0, 12);
        const li = top.map(([n, D], i) => { const [u, d] = NATM[n];
          const who = D.users.filter(x => x[3] >= 50).slice(0, 3).map(x => `<span class="w" data-p="${x[2]}%">${V2.mon(x[0], {iw: 32, bare: true})}${E(V2.disp(x[0]))} ${x[2]}%</span>`).join('');
          return `<li><span class="rk">${i + 1}</span><div class="nm"><b>${E(n)}</b><span class="nt-chip up" style="--sc:var(${SVM[u]})">▲ ${E(SN[u])}</span><span class="nt-chip dn" style="--sc:var(${SVM[d]})">▼ ${E(SN[d])}</span><small>${who}</small></div><div class="pc">${D.pctMons}%<span>of Pokémon</span></div></li>`; }).join('');
        const html = `<div class="ntp"><span class="ntp-k">META · NATURES</span><h1>Natures.</h1><p class="lede">Every nature raises one stat by 10% and lowers another by 10%. <b>Four natures cover 76% of tournament Pokémon.</b> Tap any square to see who runs it.</p>
          <div class="ntg" role="group" aria-label="Natures by the stat they raise and lower">${g}</div>
          <div class="nt-key"><span>Darker square = run more often.</span><span>Striped = raises and lowers the same stat, so it does nothing.</span></div>
          <section class="ntl"><h2>The line-up.</h2><p>The 12 natures tournament players actually run, and who runs them.</p><ol>${li}</ol>
          <p class="ntsrc">Online tournaments, last 28 days (Oct 21 – Nov 18) · ${V2.isFmt(DATA.N)} teams, ${V2.isFmt(DATA.withNat)} Pokémon.</p></section></div>`;
        if (!window.__ntOrig) window.__ntOrig = main.innerHTML; main.innerHTML = html; window.scrollTo(0, 0);
      }, [DATA, STATS, SN]);
      await p.waitForTimeout(800);
      const f = `${out}/page-${w}${theme === 'night' ? '-night' : ''}.png`; await p.screenshot({path: f, fullPage: true}); console.log('wrote', f,
        await p.evaluate(() => (document.documentElement.scrollHeight / innerHeight).toFixed(2) + ' screens'));
      if (theme === 'day' && w < 700) { /* phone only checks day */ break; } } }));
  await b.close(); })();
