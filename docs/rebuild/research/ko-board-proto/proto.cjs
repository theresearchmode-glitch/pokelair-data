// KO Board opened-state options, injected into the real built page (no shared code changed).
// usage: node proto.cjs <outdir> [shots]
const {chromium} = require('playwright');
const WT = '/home/user/pokelair-data/.claude/worktrees/agent-a02249b20fb40bd11';
const OUT = process.argv[2], SHOTS = process.argv[3] === 'shots';

const CSS = {
  // A: one group at a time, picked by three count tabs (the bar's colours); tiles unchanged (4 across on phones, names kept)
  a: `
.kob-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s1);margin-top:var(--s4)}
.kob-tabs button{--cut:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));display:grid;justify-items:start;gap:0;min-height:var(--s16);padding:var(--s2) var(--s3);border:0;border-bottom:6px solid var(--g);background:var(--wash);color:var(--ink);clip-path:var(--cut);text-align:left;cursor:pointer}
.kob-tabs button b{font:italic 800 var(--t28)/1.15 var(--u);font-synthesis:style}
.kob-tabs button span{font:600 var(--t13)/1.3 var(--b);color:var(--ink-2)}
.kob-tabs button[aria-pressed=true]{background:var(--arn-fill);color:var(--arn-on-fill)}.kob-tabs button[aria-pressed=true] span{color:var(--arn-on-fill)}
.kob-tabs .ko{--g:var(--arn-kb-ko)}.kob-tabs .sv{--g:var(--arn-kb-sv)}
.kob-tabs .can{border-bottom:0;background-image:repeating-linear-gradient(135deg,var(--arn-kb-ko) 0 4px,var(--arn-kb-sv) 4px 8px);background-size:100% 6px;background-repeat:no-repeat;background-position:bottom;padding-bottom:calc(var(--s2) + 6px)}
.kob-a .dc2-kg[data-g]:not([data-g=ko]){display:none}.kob-a .dc2-kg h3{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.kob-a .dc2-kg .dc2-kts{margin-top:var(--s2)}
`,
  // B: every group on show as a colour field: a 6px stripe in the bar's colour and a big slanted count; 5 across on phones;
  // from 1024 the opened board spans the whole page under the Arena, 10 across
  b: `
.kob-b .dc2-kg{position:relative;margin-top:var(--s4);padding-left:var(--s4)}
.kob-b .dc2-kg::before{content:"";position:absolute;top:0;bottom:0;left:0;width:6px;border-radius:var(--r-s);background:var(--g)}
.kob-b .dc2-kg[data-g=ko]{--g:var(--arn-kb-ko)}.kob-b .dc2-kg[data-g=sv]{--g:var(--arn-kb-sv)}.kob-b .dc2-kg[data-g=can]{--g:repeating-linear-gradient(135deg,var(--arn-kb-ko) 0 4px,var(--arn-kb-sv) 4px 8px)}
.kob-b .dc2-kg h3{display:flex;align-items:baseline;gap:var(--s2);margin:0 0 var(--s2);font:600 var(--t15)/1.3 var(--b)}
.kob-b .dc2-kg h3 b{margin:0;font-size:var(--t34);line-height:1;color:var(--ink)}
.kob-b .dc2-kb .dc2-kts{grid-template-columns:repeat(5,minmax(0,1fr))}
@media (min-width:700px){.kob-b .dc2-kb .dc2-kts{grid-template-columns:repeat(8,minmax(0,1fr))}}
@media (min-width:1024px){.kob-full{margin-top:var(--s4)}.kob-full .dc2-kb{margin-top:0}.kob-b .dc2-kb .dc2-kts{grid-template-columns:repeat(12,minmax(0,1fr))}
  .kob-full .dc2-kbh{justify-content:flex-start}.kob-full .dc2-kbh h2{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  .kob-full .dc2-kb>.fine{max-width:none}}
`,
  // C: the ladder: each threat is a row with its name, the move and the damage in numbers; from 1024 the three groups stand side by side
  c: `
.kob-c .dc2-kg{margin-top:var(--s4)}
.kob-c .dc2-kg h3{display:flex;align-items:baseline;gap:var(--s2);margin:0 0 var(--s1);padding-bottom:var(--s1);border-bottom:6px solid var(--g);font:600 var(--t15)/1.3 var(--b)}
.kob-c .dc2-kg h3 b{margin:0;font-size:var(--t28);line-height:1.1;color:var(--ink)}
.kob-c .dc2-kg[data-g=ko]{--g:var(--arn-kb-ko)}.kob-c .dc2-kg[data-g=sv]{--g:var(--arn-kb-sv)}
.kob-c .dc2-kg[data-g=can] h3{border-bottom:0;background:repeating-linear-gradient(135deg,var(--arn-kb-ko) 0 4px,var(--arn-kb-sv) 4px 8px) bottom/100% 6px no-repeat;padding-bottom:calc(var(--s1) + 6px)}
.kob-c .dc2-kb .dc2-kts{display:grid;grid-template-columns:minmax(0,1fr);gap:0}
.kob-c .dc2-kt{clip-path:none;display:grid;grid-template-columns:24px 40px minmax(0,1fr) auto;grid-template-rows:auto auto;align-items:center;justify-items:start;column-gap:var(--s2);min-height:var(--s12);padding:var(--s1) 0;border-bottom:1px solid var(--rule);background:none;text-align:left;color:var(--ink)}
.kob-c .dc2-kt.ko{background:none}
.kob-c .dc2-kt .by{position:static;grid-row:1/3;grid-column:1}.kob-c .dc2-kt>.np-mon{grid-row:1/3;grid-column:2}
.kob-c .dc2-kt .nm{display:block;grid-column:3;grid-row:1;max-width:100%;margin:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font:600 var(--t15)/1.3 var(--b);font-stretch:100%;color:var(--ink)}
.kob-c .dc2-kt .mv{grid-column:3;grid-row:2;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font:500 var(--t13)/1.3 var(--b);color:var(--ink-2)}
.kob-c .dc2-kt .pc{grid-column:4;grid-row:1;justify-self:end;font:italic 800 var(--t17)/1.2 var(--u);font-synthesis:style}
.kob-c .dc2-kt .hp{grid-column:4;grid-row:2;width:64px;justify-self:end}
.kob-c .dc2-kt .stamp{position:static;grid-column:4;grid-row:1;justify-self:end;transform:none;display:none}
.kob-c .dc2-kt.ko .pc{color:var(--bad-text)}
.kob-c .dc2-kt.on{outline-offset:0}
@media (min-width:1024px){.kob-full{margin-top:var(--s4)}.kob-full .dc2-kb{margin-top:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:var(--s8);align-items:start}
  .kob-full .dc2-kbh,.kob-full .dc2-kb>.fine,.kob-full .dc2-all{grid-column:1/-1}.kob-full .dc2-kbh{justify-content:flex-start}
  .kob-full .dc2-kbh h2{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}}
`};

async function apply(p, opt, W) {
  await p.evaluate(({opt, W}) => {
    const kb = document.querySelector('.arn-kbin .dc2-kb'); if (!kb) return;
    for (const g of kb.querySelectorAll('.dc2-kg')) { const t = g.querySelector('h3').textContent; g.dataset.g = /down in one/.test(t) ? 'ko' : /can go/.test(t) ? 'can' : 'sv'; }
    if (opt === 'today') return;
    document.querySelector('.arn').classList.add('kob-' + opt);
    if (opt === 'a') { const gs = [...kb.querySelectorAll('.dc2-kg')];
      const lab = {ko: 'down in one hit', can: 'can go down', sv: 'survive'};
      const tabs = document.createElement('div'); tabs.className = 'kob-tabs'; tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Show');
      tabs.innerHTML = gs.map((g, i) => `<button type="button" class="${g.dataset.g}" aria-pressed="${i === 0}"><b>${g.querySelector('h3 b').textContent}</b><span>${lab[g.dataset.g]}</span></button>`).join('');
      gs[0].before(tabs); }
    if (opt === 'c') for (const t of kb.querySelectorAll('.dc2-kt')) {
      const m = /(\d+)–(\d+)%/.exec(t.dataset.dctip || ''); const nm = t.querySelector('.nm');
      const tip = (t.dataset.dctip || '').replace(/^KO: /, ''), mine = /^[^:]*: your .* does /.exec(tip), theirs = /^(.*?)'s (.*) into your (.*?): /.exec(tip);
      if (nm) nm.textContent = mine ? tip.split(': your ')[0] : theirs ? theirs[1] : nm.textContent;
      const mv = document.createElement('span'); mv.className = 'mv'; mv.setAttribute('aria-hidden', 'true');
      mv.textContent = mine ? 'your ' + /: your (.*) does /.exec(tip)[1] : theirs ? theirs[2] + ' into your ' + theirs[3] : ''; t.append(mv);
      const pc = document.createElement('span'); pc.className = 'pc'; pc.setAttribute('aria-hidden', 'true'); pc.textContent = m ? `${m[1]}–${m[2]}%` : ''; t.append(pc); }
    if ((opt === 'b' || opt === 'c') && W >= 1024) { const full = document.createElement('div'); full.className = 'kob-full'; full.append(kb); document.querySelector('.arn-grid').after(full); }
  }, {opt, W});
}

(async () => {
  const b = await chromium.launch(); const res = [];
  for (const opt of ['today', 'a', 'b', 'c']) for (const W of [320, 390, 768, 1024, 1440]) for (const th of (SHOTS && (W === 390) ? ['dark', 'light'] : ['dark'])) {
    const c = await b.newContext({viewport: {width: W, height: W >= 1024 ? 900 : 844}, ...(W < 1024 ? {isMobile: true, hasTouch: true} : {}), deviceScaleFactor: SHOTS ? 2 : 1, colorScheme: th});
    const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + WT + '/app/dist/v2.html#calc'); await p.waitForTimeout(3500);
    await p.click('.arn-kbbar'); await p.waitForTimeout(600);
    if (opt !== 'today') await p.addStyleTag({content: CSS[opt]});
    await apply(p, opt, W); await p.waitForTimeout(400);
    const m = await p.evaluate(() => {
      const de = document.documentElement, kb = document.querySelector('.dc2-kb'), bar = document.querySelector('.arn-kbbar');
      const kr = kb.getBoundingClientRect(), br = bar.getBoundingClientRect();
      const out = []; for (const el of kb.querySelectorAll('*')) { const r = el.getBoundingClientRect(); if (!r.width || getComputedStyle(el).position === 'absolute' && r.width <= 1) continue; if (el.closest('.dc2-gw')) continue; if (r.right > kr.right + 1 || r.left < kr.left - 1) out.push(el.className || el.tagName); }
      const small = [...kb.querySelectorAll('button')].filter(x => { const r = x.getBoundingClientRect(); return r.width && getComputedStyle(x).display !== 'none' && x.offsetParent && (r.height < 44 || r.width < 44); }).length;
      return {h: de.scrollHeight, sideways: de.scrollWidth > innerWidth, outside: [...new Set(out)].slice(0, 5), small,
        top: Math.round(br.top + scrollY), end: Math.round(kr.bottom + scrollY), kbTop: Math.round(kr.top + scrollY), boardH: Math.round(kr.bottom + scrollY - (br.top + scrollY))};
    });
    res.push({opt, W, th, screens: +(m.h / 844).toFixed(2), ...m, errs: errs.length});
    console.log(opt, W, th, 'page', m.h, 'screens@844', (m.h / 844).toFixed(2), 'bar->board end', m.boardH, 'sideways', m.sideways, 'outside', JSON.stringify(m.outside), 'tap<44', m.small, 'errors', errs.length);
    if (SHOTS && (W === 390 || W === 1440)) {
      await p.evaluate(() => { for (const el of document.querySelectorAll('body *')) { const ps = getComputedStyle(el).position; if ((ps === 'fixed' || ps === 'sticky') && !el.closest('.arn')) el.style.visibility = 'hidden'; } });
      const y0 = W >= 1024 ? 120 : m.top - 16, y1 = m.end + 24;
      if (W >= 1024) await p.screenshot({path: `${OUT}/${opt}-${W}-${th}.png`, fullPage: true, clip: {x: 0, y: y0, width: W, height: y1 - y0}});
      else { /* phones: fullPage drops the touch emulation (tiles went 6 across, no names), so shoot viewport chunks and stitch */
        const parts = []; for (let y = y0, i = 0; y < y1; y += 800, i++) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(150);
          const sy = await p.evaluate(() => scrollY), f = `${OUT}/part-${i}.png`; await p.screenshot({path: f, clip: {x: 0, y: y - sy, width: W, height: Math.min(800, y1 - y)}}); parts.push(f); }
        require('child_process').execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nims=[Image.open(f) for f in sys.argv[2:]]\no=Image.new("RGB",(ims[0].width,sum(i.height for i in ims)))\ny=0\nfor i in ims:\n o.paste(i,(0,y)); y+=i.height\no.save(sys.argv[1])', `${OUT}/${opt}-${W}-${th}.png`, ...parts]); }
    }
    await c.close();
  }
  require('fs').writeFileSync(OUT + '/measure.json', JSON.stringify(res, null, 1));
  await b.close();
})();
