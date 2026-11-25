// Automated practice switch for Reg M-D day one (NO design checks).
// Builds a temp out/ from repo out/ + reg-guard.mjs emptyFor() shapes + fake Reg M-D day 1 reg.json/regstate.json,
// builds the v2 page with --preview-data (OUT=<tmp> V2_OUT=<tmpHtml>), opens all 29 routes at 390 and 1440 in Playwright,
// and fails on any pageerror, NaN/undefined/Infinity in visible text, or empty/missing <h1>.
// Usage: node experiments/practice-switch.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DRY = process.argv.includes('--dry-run');

export const ROUTES = [
  '#home', '#team', '#build', '#battle', '#calc', '#meta', '#tournaments',
  '#events', '#archetypes', '#weekly', '#usage', '#sets', '#types', '#speed',
  '#natures', '#compare', '#box', '#practice', '#gauntlet', '#gifts', '#news',
  '#pokemon=Incineroar', '#method', '#about', '#track', '#feedback', '#owner',
  '#guide', '#notfound',
];

const EXEMPT = new Set(['reg.json', 'calendar.json', 'skips.json', 'official_perf.json', 'ratings_log.json', 'scoreboard.json']);

// Exact emptyFor() shapes from reg-guard.mjs (alt/gemini-dec2); used as fallback if reg-guard.mjs is not yet on this branch.
function fallbackEmptyFor(file, reg, sd = '', now = new Date().toISOString()) {
  const day = now.slice(0, 10);
  switch (file) {
    case 'limitless.json': return {reg, updated: now, tournaments: 0, teams: 0, games: 0, base: 0.5, adj: {label: '', rows: []}, tour: {label: '', split: true, updated: day, rows: [], megas: []}, results: {source: '', teams: 0, base: 0.5, minCore: 40, mons: {}, pairs: {}, cores: [], proven: [], records: []}};
    case 'meta_tour.json': return {reg, format: 'doubles', kind: 'tour', source: '', period: '', updated: now, note: '', top: [], more: []};
    case 'info.json': return {reg, N: 0, source: '', period: '', mv: {}, it: {}, ab: {}, ntN: 0, nt: {}};
    case 'teams.json': return {reg, source: '', updated: now, teams: []};
    case 'history.json': return {reg, days: []};
    case 'matches.json': return {reg, updated: now, events: [], teams: [], players: 0, feats: [], decks: [], m: []};
    case 'replays.json': return {reg, updated: now, format: sd, source: '', games: []};
    case 'replays_bo3.json': return {reg, updated: now, format: sd ? sd + 'bo3' : '', source: '', games: []};
    case 'practice.json': return {reg, updated: now, source: '', from: null, to: null, minR: 1300, roundR: 1450, dict: [], opp: [], rounds: []};
    case 'official.json': return {reg, updated: now, source: '', attribution: '', events: [], checks: []};
    case 'official_compare.json': return {reg, previous: 'none', events: [], pass: true, summary: 'regulation switched'};
    case 'events.json': return {reg, updated: now, source: '', dict: [], events: []};
    case 'weekly.json': return {reg, v: 1, updated: now, src: '', th: {}, a: {from: '', to: '', ev: 0, n: 0}, b: {from: '', to: '', ev: 0, n: 0}, enough: false, cutA: 0, up: [], down: [], top: [], tech: [], sty: {up: [], down: []}, styAll: [], fresh: []};
    case 'model.json': return {reg, updated: now, ships: false, games: 0, events: 0, mons: {}, pairs: {}, sets: {}, team: {}, sixes: {}, leads: {}};
    case 'meta_ladder.json': return {reg, format: 'doubles', kind: 'ladder', month: null, source: '', period: '', battles: 0, updated: now, note: '', top: [], more: [], usage1760: null};
    case 'meta_ingame.json': return {reg, format: 'doubles', kind: 'ingame', source: '', period: '', updated: now, top: [], more: []};
    case 'sources.json': return {reg, updated: now, problems: []};
    case 'perf.json': return {updated: day, reg: {id: reg, name: 'Reg ' + reg, since: day}};
    case 'crosscheck.json': return {reg, updated: now, checks: []};
    case 'ratings_log.json': return {reg, updated: now, days: []};
    case 'scoreboard.json': return {reg, updated: now, today: null, history: []};
    case 'track.json': return {reg, v: 1, updated: now, since: null, snaps: 0, last: null, top: 8, ev: [], mons: [], mb: [[0, 0], [0, 0], [0, 0], [0, 0]], fw: [], mv: null};
    default: return null;
  }
}

const GUARDED_FILES = [
  'limitless.json', 'meta_tour.json', 'info.json', 'teams.json', 'history.json', 'matches.json',
  'replays.json', 'replays_bo3.json', 'practice.json', 'official.json', 'official_compare.json',
  'events.json', 'weekly.json', 'model.json', 'meta_ladder.json', 'meta_ingame.json',
  'sources.json', 'perf.json', 'crosscheck.json', 'track.json',
];

export const BAD_TEXT_RE = /\b(NaN|undefined|Infinity)\b/;

export function auditRouteSnapshot({pageErrors = [], text = '', h1Text = ''}) {
  const errs = [];
  if (pageErrors.length) errs.push('pageerror: ' + pageErrors.join(' | '));
  const m = String(text || '').match(BAD_TEXT_RE);
  if (m) errs.push('bad visible text: ' + m[0]);
  if (!String(h1Text || '').trim()) errs.push('empty or missing <h1>');
  return errs;
}

export async function buildDayOneOut(repoOutDir, tmpOutDir, {reg = 'M-D', sd = 'gen9championsvgc2026regmd', day = '2026-12-02'} = {}) {
  fs.mkdirSync(tmpOutDir, {recursive: true});
  if (fs.existsSync(repoOutDir)) {
    for (const f of fs.readdirSync(repoOutDir)) {
      if (f.endsWith('.json') && EXEMPT.has(f)) {
        fs.copyFileSync(path.join(repoOutDir, f), path.join(tmpOutDir, f));
      }
    }
    if (fs.existsSync(path.join(repoOutDir, 'post.json'))) {
      fs.copyFileSync(path.join(repoOutDir, 'post.json'), path.join(tmpOutDir, 'post.json'));
    }
  }
  let emptyFor = fallbackEmptyFor;
  if (fs.existsSync(path.join(ROOT, 'reg-guard.mjs'))) {
    try { const rg = await import(path.join(ROOT, 'reg-guard.mjs')); if (typeof rg.emptyFor === 'function') emptyFor = rg.emptyFor; } catch (e) {}
  }
  const nowIso = day + 'T12:00:00.000Z';
  fs.writeFileSync(path.join(tmpOutDir, 'reg.json'), JSON.stringify({
    id: reg, name: 'Reg ' + reg, since: day, sd, site: 'M-C', now: null,
    switched: {from: 'M-C', to: reg, on: day, by: 'date'}, seen: {}, checked: day,
  }));
  fs.writeFileSync(path.join(tmpOutDir, 'regstate.json'), JSON.stringify({
    reg, day: 1, events: 0, players: 0, games: 0, since: day, updated: nowIso,
  }));
  for (const f of GUARDED_FILES) {
    const doc = emptyFor(f, reg, sd, nowIso);
    if (f === 'perf.json' && doc && doc.reg) {
      doc.reg = {id: reg, name: 'Reg ' + reg, since: day};
    }
    if (doc) fs.writeFileSync(path.join(tmpOutDir, f), JSON.stringify(doc));
  }
  return fs.readdirSync(tmpOutDir).filter(f => f.endsWith('.json')).sort();
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'np-practice-switch-'));
const tmpOut = path.join(tmpRoot, 'out');
const tmpHtml = path.join(tmpRoot, 'v2-md-day1.html');

try {
  const written = await buildDayOneOut(path.join(ROOT, 'out'), tmpOut);
  console.log(`practice-switch: built M-D day 1 temp out/ (${written.length} files)`);

  if (DRY) {
    // Self-test auditRouteSnapshot (S7 proof) and verify all 29 routes + temp out/ shapes
    if (ROUTES.length !== 29) throw new Error('expected 29 routes, got ' + ROUTES.length);
    if (auditRouteSnapshot({pageErrors: [], text: 'Day 1 of Reg M-D', h1Text: 'Ratings'}).length !== 0) throw new Error('clean snapshot failed');
    if (auditRouteSnapshot({pageErrors: ['TypeError: x'], text: 'ok', h1Text: 'Ratings'}).length === 0) throw new Error('pageerror not caught');
    if (auditRouteSnapshot({pageErrors: [], text: 'Win rate: NaN%', h1Text: 'Ratings'}).length === 0) throw new Error('NaN not caught');
    if (auditRouteSnapshot({pageErrors: [], text: 'Score: undefined', h1Text: 'Ratings'}).length === 0) throw new Error('undefined not caught');
    if (auditRouteSnapshot({pageErrors: [], text: 'Ratio: Infinity', h1Text: 'Ratings'}).length === 0) throw new Error('Infinity not caught');
    if (auditRouteSnapshot({pageErrors: [], text: 'ok', h1Text: '   '}).length === 0) throw new Error('empty h1 not caught');
    const pf = JSON.parse(fs.readFileSync(path.join(tmpOut, 'perf.json'), 'utf8'));
    const rs = JSON.parse(fs.readFileSync(path.join(tmpOut, 'regstate.json'), 'utf8'));
    if (!pf.reg || pf.reg.id !== 'M-D' || rs.reg !== 'M-D' || rs.day !== 1) throw new Error('bad M-D day 1 fixture');
    console.log('practice-switch --dry-run: PASS (29 routes, M-D day 1 fixture + audit checks verified)');
    process.exit(0);
  }

  const artArg = fs.existsSync(path.join(ROOT, 'app/src/v2/art')) ? ['--art=' + path.join(ROOT, 'app/src/v2/art') + '/'] : [];
  const build = spawnSync(process.execPath, [path.join(ROOT, 'app/build.mjs'), '--v2', '--preview-data', '--no-static', ...artArg], {
    env: {...process.env, OUT: tmpOut, V2_OUT: tmpHtml},
    stdio: 'inherit',
  });
  if (build.status !== 0 || !fs.existsSync(tmpHtml)) {
    console.error('practice-switch: v2 build failed');
    process.exit(1);
  }

  const {chromium} = await import('playwright');
  const browser = await chromium.launch();
  const failures = [];
  for (const width of [390, 1440]) {
    const ctx = await browser.newContext({viewport: {width, height: width < 700 ? 844 : 900}});
    const page = await ctx.newPage();
    await page.addInitScript(() => { window.__PL_TEST = 1; });
    for (const hash of ROUTES) {
      const pageErrors = [];
      const onErr = e => pageErrors.push(e && e.message ? e.message : String(e));
      page.on('pageerror', onErr);
      try {
        await page.goto('file://' + tmpHtml + hash);
        await page.waitForTimeout(700);
        const snap = await page.evaluate(() => {
          const main = document.getElementById('main') || document.body;
          const h1 = main.querySelector('h1');
          return {
            text: (main && main.innerText) || '',
            h1Text: h1 ? h1.textContent : '',
          };
        });
        const errs = auditRouteSnapshot({pageErrors, text: snap.text, h1Text: snap.h1Text});
        if (errs.length) {
          console.log(`  FAIL  ${width}px ${hash}: ${errs.join('; ')}`);
          failures.push({width, hash, errs});
        } else {
          console.log(`  pass  ${width}px ${hash} (${snap.h1Text.trim().slice(0, 40)})`);
        }
      } finally {
        page.off('pageerror', onErr);
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`practice-switch: ${ROUTES.length * 2 - failures.length}/${ROUTES.length * 2} passed`);
  if (failures.length) process.exit(1);
} finally {
  fs.rmSync(tmpRoot, {recursive: true, force: true});
}
