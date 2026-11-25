// Date-based regulation switch tests (job 21, Node 22, no network).
// Usage: node experiments/date-switch-test.mjs     (exits 1 on any failure)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {REG_END, REG_FILE, REG_SWITCH, SITE_REG, regAt, detectReg, activeReg, readReg} from '../formats.mjs';
import {guardOut, stampOf} from '../reg-guard.mjs';
import {buildRegState} from '../regstate.mjs';

let failed = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (ok) console.log(`pass ${name}`);
  else { failed++; console.log(`FAIL ${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
}

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')));
const prevMC = {id: 'M-C', since: SITE_REG.since, sd: SITE_REG.sd};
const mkEvents = (format, n, playersEach, date) => Array.from({length: n}, () => ({format, date, players: playersEach}));

// 1) Day before launch (2026-12-01) -> still M-C
{
  const r = detectReg([], {}, prevMC, '2026-12-01T23:59:00Z');
  check('day-before-still-mc', `${r.id}/${r.switched}/${r.now}`, 'M-C/null/null');
}

// 2) Launch day: 2026-12-02T01:07:00Z (before M-C's official end, 01:59 UTC) stays M-C; 02:00 UTC switches to M-D by
// date, even with 0 events (Kip job 28 #6, Nov 25: the switch waits for the official start time, not just the date)
{
  const early = detectReg([], {}, prevMC, '2026-12-02T01:07:00Z');
  check('dec2-0107z-before-official-start-still-mc', `${early.id}/${early.switched}`, 'M-C/null');
  const r = detectReg([], {}, prevMC, '2026-12-02T02:00:00Z');
  check('dec2-0200z-switches-to-md',
    `${r.id}/${r.since}/${r.sd}/${r.now}/${r.switched && r.switched.from}->${r.switched && r.switched.to}@${r.switched && r.switched.on}:${r.switched && r.switched.by}`,
    'M-D/2026-12-02/gen9championsvgc2026regmd/null/M-C->M-D@2026-12-02:date');
}

// 3) REG_AUTO_SWITCH=0 holds the date switch on Dec 2
{
  const oldEnv = process.env.REG_AUTO_SWITCH;
  process.env.REG_AUTO_SWITCH = '0';
  const {detectReg: detectHeld} = await import('../formats.mjs?datehold=1');
  if (oldEnv === undefined) delete process.env.REG_AUTO_SWITCH; else process.env.REG_AUTO_SWITCH = oldEnv;
  const r = detectHeld([], {}, prevMC, '2026-12-02T02:00:00Z');
  check('reg-auto-switch-0-holds-date', `${r.id}/${r.switched}/${r.now && r.now.id}/${r.now && r.now.from}`, 'M-C/null/M-D/date');
}

// 4) M-D events before Dec 2 do NOT switch early (even above REG_SWITCH thresholds)
{
  const early = detectReg(mkEvents('M-D', REG_SWITCH.events + 5, 100, '2026-11-30T12:00:00Z'), {}, prevMC, '2026-12-01');
  check('md-events-before-dec2-no-early-switch', `${early.id}/${early.switched}/${early.now && early.now.id}`, 'M-C/null/M-D');
}

// 5) No M-D entry in regulation.json -> falls back to REG_SWITCH event/player counts
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reg-nomd-'));
  try {
    const prof = JSON.parse(JSON.stringify(REG_FILE));
    delete prof.regs['M-D'];
    const pf = path.join(tmp, 'regulation.json');
    fs.writeFileSync(pf, JSON.stringify(prof));
    const out = execFileSync(
      process.execPath,
      ['--input-type=module', '-e', `
        import {detectReg, REG_SWITCH, SITE_REG} from './formats.mjs';
        const prev = {id: 'M-C', since: SITE_REG.since, sd: SITE_REG.sd};
        const mk = (n, p) => Array.from({length: n}, () => ({format: 'M-D', date: '2026-12-05T12:00:00Z', players: p}));
        const a = detectReg(mk(REG_SWITCH.events - 1, 100), {}, prev, '2026-12-05');
        const b = detectReg(mk(REG_SWITCH.events, 60), {}, prev, '2026-12-05');
        console.log(JSON.stringify([a.id, a.now && a.now.id, b.id, b.switched && b.switched.by]));
      `],
      {cwd: ROOT, env: {...process.env, REG_PROFILE_FILE: pf}}
    ).toString().trim();
    check('no-md-entry-falls-back-to-counts', out, '["M-C","M-D","M-D","counts"]');
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
}

// 6) regAt / REG_END rules still hold
check('regAt-before-end', regAt('M-C', '2026-12-02T01:58:59Z'), 'M-C');
check('regAt-at-end', regAt('M-C', '2026-12-02T01:59:00Z'), 'M-D');
check('REG_END-mc', REG_END['M-C'], '2026-12-02T01:59:00Z');

// 7) Switch day flows into reg-guard.mjs (empties M-C files) and regstate.mjs (Day 1 of Reg M-D)
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reg-flow-'));
  try {
    const outDir = path.join(tmp, 'out');
    fs.mkdirSync(outDir, {recursive: true});
    const sw = detectReg([], {}, prevMC, '2026-12-02T02:00:00Z');
    const regFile = path.join(outDir, 'reg.json');
    fs.writeFileSync(regFile, JSON.stringify(sw));
    fs.writeFileSync(path.join(outDir, 'limitless.json'), JSON.stringify({reg: 'M-C', tournaments: 100}));
    fs.writeFileSync(path.join(outDir, 'sources.json'), JSON.stringify({reg: 'M-C', sdt: {rows: [1]}}));

    const g = guardOut({outDir, regFile, log: () => {}});
    const limAfter = JSON.parse(fs.readFileSync(path.join(outDir, 'limitless.json'), 'utf8'));
    const srcAfter = JSON.parse(fs.readFileSync(path.join(outDir, 'sources.json'), 'utf8'));
    const archived = fs.existsSync(path.join(outDir, 'archive', 'M-C', 'limitless.json'));
    check('reg-guard-empties-mc-on-switch-day',
      `${g.reg}/${g.emptied.sort().join(',')}/${stampOf(limAfter)}/${limAfter.tournaments}/${stampOf(srcAfter)}/${archived}`,
      'M-D/limitless.json,sources.json/M-D/0/M-D/true');

    const rs = buildRegState({regObj: activeReg(regFile), rawReg: readReg(regFile), matches: null, today: '2026-12-02'});
    check('regstate-day1-of-md', `${rs.reg}/day${rs.day}/${rs.events}/${rs.players}/${rs.since}`, 'M-D/day1/0/0/2026-12-02');
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
}

// 8) names.mjs falls back to M-C items list when data/regmd-items.txt is missing
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reg-items-'));
  try {
    fs.mkdirSync(path.join(tmp, 'data'), {recursive: true});
    fs.mkdirSync(path.join(tmp, 'out'), {recursive: true});
    fs.writeFileSync(path.join(tmp, 'data', 'regmc-items.txt'), 'Leftovers\nSitrus Berry\n');
    fs.writeFileSync(path.join(tmp, 'out', 'reg.json'), JSON.stringify({id: 'M-D', since: '2026-12-02', sd: 'gen9championsvgc2026regmd'}));
    fs.writeFileSync(path.join(tmp, 'roster.json'), '["Garchomp"]');
    const out = execFileSync(
      process.execPath,
      ['-e', `import(${JSON.stringify(new URL('../names.mjs', import.meta.url).href)}).then(m => console.log('ITEM=' + m.canonItem('leftover')))`],
      {cwd: tmp, env: {...process.env, REG_PROFILE_FILE: path.join(ROOT, 'regulation.json')}}
    ).toString().trim();
    check('names-md-items-fallback-to-mc',
      out.includes('data/regmd-items.txt not found') && out.includes('falling back to data/regmc-items.txt') && out.includes('ITEM=Leftovers'),
      true);
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
}

console.log(failed ? `${failed} FAILED` : 'ALL PASSED');
process.exit(failed ? 1 : 0);
