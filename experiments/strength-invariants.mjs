// Strength Score invariants (job 18: merges job 10 cases + job 11 J11-1..J11-5, plus HH's Option (a) rounded band edge).
// Loads app/dist/page.html the same way experiments/golden.mjs does.
// Usage: node experiments/strength-invariants.mjs     (exit code 1 if any case fails; build app/dist/page.html first)
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {withFixtures} from './md-fixtures.mjs';

const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const OUT = process.env.GOLDEN_OUT || ROOT + 'out/';
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };

const L = rd('limitless.json') || {results: {}, adj: {}, updated: '2026-01-01'};
const D = {
  'meta/results': L.results,
  'meta/perf': {adj: L.adj, updated: String(L.updated || '').slice(0, 10)},
  'meta/doubles_tour': rd('meta_tour.json'),
  'meta/teams': rd('teams.json'),
  'meta/model': process.env.GOLDEN_MODEL ? JSON.parse(fs.readFileSync(process.env.GOLDEN_MODEL, 'utf8')) : rd('model.json'),
  'meta/doubles': rd('meta_ladder.json'),
  'meta/doubles_ingame': rd('meta_ingame.json'),
  'meta/events': rd('events.json'),
  'meta/history': rd('history.json')
};
withFixtures(D);

const pageFile = ROOT + `app/strength-inv-${process.pid}.html`;
const srcHtml = fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8');
if (!srcHtml.includes('render();setView(view,false);')) {
  throw new Error('app/dist/page.html missing expected boot hook');
}
fs.writeFileSync(
  pageFile,
  '<!doctype html><meta charset="utf-8">' +
    srcHtml.replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);')
);

let browser;
try {
  browser = await chromium.launch();
  const ctx = await browser.newContext();
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));

  await pg.addInitScript(data => {
    localStorage.setItem('cc2.welcomed', '"1"');
    localStorage.removeItem('np.gl');
    window.__PL_TEST = 1;
    window.claude = {
      use: async n => n === 'db' ? {
        doc: p => ({
          onSnapshot: cb => { setTimeout(() => cb({exists: !!data[p], data: () => data[p]}), 5); return () => {}; },
          get: async () => ({exists: false}),
          set: async () => {},
          update: async () => {}
        })
      } : null
    };
  }, D);

  await pg.goto('file://' + pageFile);
  await pg.waitForTimeout(4000);

  const run = code => pg.evaluate(c => window.__ev(c), code).then(s => JSON.parse(s));

  const res = await run(`(() => {
    const out = [];
    const check = (id, ok, detail) => out.push({id, ok: !!ok, detail: String(detail || '')});
    const mk = ns => ns.map(n => abMember(byName.get(n)));
    const legalSix = ['Incineroar', 'Rillaboom', 'Sneasler', 'Kingambit', 'Charizard-Mega-Y', 'Whimsicott'];

    // J10-1: CH.wordOf guards NaN / non-finite / null
    check('J10-1',
      CH.wordOf(NaN) === '' && CH.wordOf(Infinity) === '' && CH.wordOf(-Infinity) === '' && CH.wordOf(null) === '' &&
      CH.wordOf(89.6) === 'Tournament ready' && CH.wordOf(90) === 'Top tier',
      JSON.stringify([CH.wordOf(NaN), CH.wordOf(Infinity), CH.wordOf(null), CH.wordOf(89.6), CH.wordOf(90)])
    );

    // J10-2: CH.sdOf and swapSure return null when monSd is empty or non-finite
    {
      const saved = META.model && META.model.monSd;
      const ms = mk(legalSix), ms2 = mk(['Garchomp', 'Rillaboom', 'Sneasler', 'Kingambit', 'Charizard-Mega-Y', 'Whimsicott']);
      try {
        META.model.monSd = {};
        const sdEmpty = CH.sdOf(ms), swEmpty = swapSure(ms, ms2);
        META.model.monSd = {Incineroar: NaN};
        const sdNaN = CH.sdOf(ms), swNaN = swapSure(ms, ms2);
        check('J10-2', sdEmpty === null && swEmpty === null && sdNaN === null && swNaN === null,
          JSON.stringify({sdEmpty, swEmpty, sdNaN, swNaN}));
      } finally {
        if (META.model) META.model.monSd = saved;
      }
    }

    // J10-3: Option (a) rounded band edge (89.6 -> 90 -> 'A' / 'Top tier')
    {
      localStorage.removeItem('np.gl');
      const ms = mk(legalSix);
      const gf = [CH.gradeFull(89.6), CH.gradeFull(79.6), CH.gradeFull(69.6), CH.gradeFull(59.6)];
      const st = CH.sticky(ms, 89.6);
      const gm = CH.gradeMove(89.4, 89.6);
      const chip = gradeChip(89.6, 90.0);
      check('J10-3',
        gf.join(',') === 'A,B,C,D' && st === 'A' && gm.includes('Top tier') && chip.includes('Strength Score now 90 (Top tier)'),
        JSON.stringify({gf, st, gm, chip})
      );
    }

    // J10-4: Duplicate species flagged illegal in CH.gradeOf
    {
      const dup = mk(['Garchomp', 'Garchomp-Mega', 'Incineroar', 'Rillaboom', 'Sneasler', 'Whimsicott']);
      const RD = THR.teamReport(dup);
      const G = CH.gradeOf(RD, proChecks(dup, true), dup);
      check('J10-4', G && G.illegal === true && CH.strengthOf(dup, RD.score) === null,
        JSON.stringify({v: G && G.v, illegal: G && G.illegal}));
    }

    // J10-5: strengthX skipStruct=true skips structCredit
    {
      const ms = mk(legalSix);
      const xs = strengthX(legalSix, ms, true);
      check('J10-5', xs && xs.sc && xs.sc.c === 1 && xs.sc.miss.length === 0,
        JSON.stringify(xs && xs.sc));
    }

    // J10-6: gradeMemo key includes itemDefault flag
    {
      gradeMemo.clear();
      const base = mk(legalSix);
      const a = base.map((m, i) => i === 0 ? {...m, heldItem: 'Sitrus Berry', itemDefault: true} : m);
      const b = base.map((m, i) => i === 0 ? {...m, heldItem: 'Sitrus Berry', itemDefault: false} : m);
      gradeTeam(a);
      const sz1 = gradeMemo.size;
      gradeTeam(b);
      const sz2 = gradeMemo.size;
      check('J10-6', sz2 === sz1 + 1, JSON.stringify({sz1, sz2}));
    }

    // J10-7: v1 fallback guards non-finite RD.score -> null
    {
      const ms = mk(legalSix.slice(0, 3));
      const savedP = CH.PARTIAL_V2;
      try {
        CH.PARTIAL_V2 = false;
        const G = CH.gradeOf({score: NaN, rows: []}, null, ms);
        check('J10-7', G === null, JSON.stringify(G));
      } finally {
        CH.PARTIAL_V2 = savedP;
      }
    }

    // J11-1: Item Clause clash marks G.illegal === true even if CK is null
    {
      const ill = mk(legalSix);
      ill[0] = {...ill[0], item: 'Sitrus Berry', heldItem: 'Sitrus Berry'};
      ill[1] = {...ill[1], item: 'Sitrus Berry', heldItem: 'Sitrus Berry'};
      const RD = THR.teamReport(ill);
      const G = CH.gradeOf(RD, null, ill);
      check('J11-1', G && G.illegal === true, JSON.stringify({illegal: G && G.illegal}));
    }

    // J11-2: Dead/missing item without Item Clause or Species Clause clash does NOT mark G.illegal
    {
      // Replace Rillaboom so Grassy Terrain is not set (Grassy Seed is dead, but legal)
      const noGrass = mk(['Incineroar', 'Garchomp', 'Sneasler', 'Kingambit', 'Charizard-Mega-Y', 'Whimsicott']);
      noGrass[0] = {...noGrass[0], item: 'Grassy Seed', heldItem: 'Grassy Seed'};
      const RD = THR.teamReport(noGrass);
      const CK = proChecks(noGrass, true);
      const G = CH.gradeOf(RD, CK, noGrass);
      check('J11-2', G && G.illegal === false, JSON.stringify({illegal: G && G.illegal}));
    }

    // J11-3: Legal 6-Pokemon team has illegal === false and G.word === CH.wordOfL(G.letter)
    {
      const ms = mk(legalSix);
      const RD = THR.teamReport(ms);
      const G = CH.gradeOf(RD, proChecks(ms, true), ms);
      check('J11-3', G && G.illegal === false && G.word === CH.wordOfL(G.letter),
        JSON.stringify({s: G && G.s, letter: G && G.letter, word: G && G.word, illegal: G && G.illegal}));
    }

    // J11-4: THR.reportSides ignores non-finite / non-positive threat weights
    {
      const team = legalSix.map(n => THR.side({n}));
      const ths = [
        {...THR.side({n: 'Garchomp'}), w: 10},
        {...THR.side({n: 'Incineroar'}), w: NaN},
        {...THR.side({n: 'Whimsicott'}), w: Infinity},
        {...THR.side({n: 'Sneasler'}), w: -5}
      ];
      const rep = THR.reportSides(team, ths);
      check('J11-4', isFinite(rep.score) && rep.score >= 0 && rep.score <= 100 && rep.W === 10,
        JSON.stringify({score: rep.score, W: rep.W}));
    }

    // J11-5: THR.threatList filters out non-finite / non-positive weights from RES.tc.rows
    {
      const savedTc = RES && RES.tc;
      try {
        if (RES && RES.tc && RES.tc.rows) {
          const rowsCopy = {...RES.tc.rows};
          rowsCopy.Garchomp = [1, NaN];
          rowsCopy.Incineroar = [1, -3];
          RES.tc = {...RES.tc, rows: rowsCopy};
          metaVersion++;
          const list = THR.threatList(30);
          const bad = list.filter(x => !isFinite(x.w) || !(x.w > 0));
          check('J11-5', list.length > 0 && bad.length === 0, JSON.stringify({n: list.length, bad: bad.length}));
        } else {
          const list = THR.threatList(30);
          check('J11-5', list.every(x => isFinite(x.w) && x.w > 0), JSON.stringify({n: list.length}));
        }
      } finally {
        if (RES) RES.tc = savedTc;
        metaVersion++;
      }
    }

    return JSON.stringify(out);
  })()`);

  let failed = 0;
  for (const r of res) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.id}: ${r.detail}`);
    if (!r.ok) failed++;
  }
  if (errs.length) {
    console.error('Page errors:', errs);
    failed++;
  }
  if (failed) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  try { fs.unlinkSync(pageFile); } catch (e) {}
}
