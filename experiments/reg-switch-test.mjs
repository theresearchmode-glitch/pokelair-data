import fs from 'node:fs';
import {
  REG_END, REG_SWITCH, SITE_REG,
  regAt, regOf, sameReg, inRegWindow, activeReg, detectReg,
} from '../formats.mjs';

let failed = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (ok) console.log(`pass ${name}`);
  else { failed++; console.log(`FAIL ${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
}

const mkEvents = (format, n, playersEach, date = '2026-12-03T12:00:00Z') =>
  Array.from({length: n}, () => ({format, date, players: playersEach}));

// A1: Event -> regulation date & tag edges
check('pacific-eve-before-end', regAt('M-C', '2026-12-01T17:58:00-08:00'), 'M-C');
check('pacific-eve-exact-end', regAt('M-C', '2026-12-01T17:59:00-08:00'), 'M-D');
check('utc-midnight-before-end', regAt('M-C', '2026-12-02T00:00:00Z'), 'M-C');
check('utc-015859-before-end', regAt('M-C', '2026-12-02T01:58:59Z'), 'M-C');
check('utc-015900-exact-end', regAt('M-C', '2026-12-02T01:59:00Z'), 'M-D');
check('tagged-mc-dated-dec3', regAt('M-C', '2026-12-03T12:00:00Z'), 'M-D');
check('no-tag-nov30', regOf({d: '2026-11-30'}), 'M-C');
check('no-tag-dec3', regOf({d: '2026-12-03T12:00:00Z'}), 'M-D');
check('no-date-keeps-tag', regOf({f: 'M-C'}), 'M-C');
check('sameReg-tagged-mc-dec3-is-md', sameReg({f: 'M-C', d: '2026-12-03T12:00:00Z'}, 'M-D'), true);

// A2: inRegWindow & activeReg().end
check('inRegWindow-dec1-ok', inRegWindow('2026-12-01', {since: '2026-09-01', end: '2026-12-02'}), true);
check('inRegWindow-dec2-excluded', inRegWindow('2026-12-02', {since: '2026-09-01', end: '2026-12-02'}), false);
check('inRegWindow-empty-date', inRegWindow('', {since: '2026-09-01', end: '2026-12-02'}), false);

const tmpFile = `${process.env.TMPDIR || '/tmp'}/reg-switch-test-${process.pid}.json`;
try {
  fs.writeFileSync(tmpFile, JSON.stringify({id: 'M-C', since: '2026-09-01', now: {id: 'M-D', since: '2026-12-03'}}));
  check('activeReg-end-capped-by-REG_END', activeReg(tmpFile).end, REG_END['M-C'].slice(0, 10));
} finally {
  try { fs.unlinkSync(tmpFile); } catch {}
}

// A3: detectReg & REG_SWITCH thresholds (backstop when the next regulation has no profile entry, e.g. M-D -> M-E)
const prevBase = {id: 'M-D', since: '2026-12-02', sd: 'gen9championsvgc2026regmd'};

const belowEv = detectReg(mkEvents('M-E', REG_SWITCH.events - 1, 100, '2027-03-05T12:00:00Z'), {}, prevBase, '2027-03-05');
check('switch-below-events', `${belowEv.id}/${belowEv.now && belowEv.now.id}`, 'M-D/M-E');

const belowPl = detectReg(
  [...mkEvents('M-E', REG_SWITCH.events - 1, 60, '2027-03-03T12:00:00Z'), {format: 'M-E', date: '2027-03-03T12:00:00Z', players: 59}],
  {}, prevBase, '2027-03-05'
);
check('switch-below-players', `${belowPl.id}/${belowPl.now && belowPl.now.id}`, 'M-D/M-E');

const oneBig = detectReg(mkEvents('M-E', 1, 2000, '2027-03-03T12:00:00Z'), {}, prevBase, '2027-03-03');
check('switch-one-big-event', `${oneBig.id}/${oneBig.now && oneBig.now.id}`, 'M-D/M-E');

const atThresh = detectReg(mkEvents('M-E', REG_SWITCH.events, 60, '2027-03-10T12:00:00Z'), {}, prevBase, '2027-03-10');
check('switch-at-threshold', `${atThresh.id}/${atThresh.now}/${atThresh.switched && atThresh.switched.to}`, 'M-E/null/M-E');

// REG_AUTO_SWITCH=0 holds switch
const oldEnv = process.env.REG_AUTO_SWITCH;
process.env.REG_AUTO_SWITCH = '0';
const {detectReg: detectRegNoAuto} = await import('../formats.mjs?noauto=1');
if (oldEnv === undefined) delete process.env.REG_AUTO_SWITCH; else process.env.REG_AUTO_SWITCH = oldEnv;
const held = detectRegNoAuto(mkEvents('M-E', REG_SWITCH.events, 60, '2027-03-10T12:00:00Z'), {}, prevBase, '2027-03-10');
check('switch-held-auto-0', `${held.id}/${held.now && held.now.id}/${held.switched}`, 'M-D/M-E/null');

// Showdown-only ladder data sets banner but never switches
const sdOnly = detectReg([], {gen9championsvgc2027regme: {n: 51, first: '2027-03-02'}}, prevBase, '2027-03-02');
check('showdown-only-no-switch', `${sdOnly.id}/${sdOnly.now && sdOnly.now.id}/${sdOnly.now && sdOnly.now.from}`, 'M-D/M-E/showdown');

// Never flips back from M-D to M-C
const prevMD = {id: 'M-D', since: '2026-12-02', sd: 'gen9championsvgc2026regmd', switched: {from: 'M-C', to: 'M-D', on: '2026-12-10'}};
const noBack = detectReg(
  [...mkEvents('M-C', 30, 100, '2026-11-30T12:00:00Z'), ...mkEvents('M-D', 5, 80, '2026-12-12T12:00:00Z')],
  {}, prevMD, '2026-12-12'
);
check('never-flips-back-to-mc', `${noBack.id}/${noBack.now}`, 'M-D/null');

console.log(failed ? `${failed} FAILED` : 'ALL PASSED');
process.exit(failed ? 1 : 0);
