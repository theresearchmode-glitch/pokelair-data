import fs from 'node:fs';
import path from 'node:path';
import {stampReg} from '../reg-stamp.mjs';
import {guardOut, emptyFor} from '../reg-guard.mjs';

let failed = 0;
function check(name, actual, expected) {
  if (actual === expected) console.log(`pass ${name}`);
  else { failed++; console.log(`FAIL ${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
}

const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'reg-guard-test-'));
const runCase = (regDoc, files) => {
  const dir = fs.mkdtempSync(path.join(tmp, 'c-'));
  const dataDir = path.join(dir, 'data');
  fs.mkdirSync(dataDir);
  fs.writeFileSync(path.join(dataDir, 'index.json'), JSON.stringify({tournaments: {t1: {d: '2026-11-20', f: 'M-C'}}}));
  const outDir = path.join(dir, 'out');
  fs.mkdirSync(outDir);
  if (regDoc) fs.writeFileSync(path.join(outDir, 'reg.json'), JSON.stringify(regDoc));
  for (const [k, v] of Object.entries(files)) {
    fs.writeFileSync(path.join(outDir, k), typeof v === 'string' ? v : JSON.stringify(v));
  }
  const res = guardOut({outDir, regFile: path.join(outDir, 'reg.json'), log: () => {}});
  const read = f => JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8'));
  const rawData = JSON.parse(fs.readFileSync(path.join(dataDir, 'index.json'), 'utf8'));
  return {res, read, rawData};
};

try {
  // 1. stampReg adds reg without changing existing fields
  const orig = {updated: '2026-12-02', teams: [1, 2]};
  const stamped = stampReg(orig, 'M-D');
  check('stampReg-adds-reg', `${stamped.reg}/${stamped.teams.length}/${orig.reg}`, 'M-D/2/undefined');

  // 2. M-D active: M-D stamped file stays ok
  const mdReg = {id: 'M-D', since: '2026-12-02', sd: 'gen9championsvgc2026regmd', switched: {from: 'M-C', to: 'M-D', on: '2026-12-02'}};
  {
    const {res, read} = runCase(mdReg, {'limitless.json': {reg: 'M-D', teams: 42}});
    check('md-stamped-stays-ok', res.lines.includes('ok limitless.json') && read('limitless.json').teams === 42, true);
  }

  // 3. M-D active: M-C stamped model.json is emptied
  {
    const {res, read} = runCase(mdReg, {'model.json': {reg: 'M-C', ships: true, mons: {Incineroar: 0.5}}});
    check('mc-model-emptied', res.lines.includes('emptied model.json (was M-C)') && read('model.json').ships === false && read('model.json').reg === 'M-D', true);
  }

  // 4. M-D active: M-C stamped official.json is emptied
  {
    const {res, read} = runCase(mdReg, {'official.json': {reg: 'M-C', events: [{name: 'LAIC'}]}});
    check('mc-official-emptied', res.lines.includes('emptied official.json (was M-C)') && read('official.json').events.length === 0, true);
  }

  // 5. M-D active (switched): unstamped sources.json is emptied
  {
    const {res, read} = runCase(mdReg, {'sources.json': {updated: '2026-12-01', sdt: {rows: [1]}}});
    check('unstamped-after-switch-emptied', res.lines.includes('emptied sources.json (was unstamped)') && read('sources.json').sdt === undefined && read('sources.json').reg === 'M-D', true);
  }

  // 6. M-C active (before switch): unstamped legacy file stays ok
  const mcReg = {id: 'M-C', since: '2026-09-01', sd: 'gen9championsvgc2026regmc', switched: null};
  {
    const {res, read} = runCase(mcReg, {'sources.json': {updated: '2026-11-24', sdt: {rows: [1]}}});
    check('unstamped-before-switch-ok', res.lines.includes('ok sources.json') && read('sources.json').sdt.rows.length === 1, true);
  }

  // 7. M-C active: M-D stamped file (wrong reg) is emptied
  {
    const {res, read} = runCase(mcReg, {'teams.json': {reg: 'M-D', teams: [{event: 'Future'}]}});
    check('wrong-reg-before-switch-emptied', res.lines.includes('emptied teams.json (was M-D)') && read('teams.json').teams.length === 0 && read('teams.json').reg === 'M-C', true);
  }

  // 8. perf.json with object reg {id: 'M-D'} stays ok (does not break object reg)
  {
    const {res, read} = runCase(mdReg, {'perf.json': {updated: '2026-12-02', reg: {id: 'M-D', name: 'Reg M-D'}, tour: {rows: [1]}}});
    check('perf-object-reg-ok', res.lines.includes('ok perf.json') && read('perf.json').tour.rows.length === 1, true);
  }

  // 9. perf.json with object reg {id: 'M-C'} is emptied when M-D active
  {
    const {res, read} = runCase(mdReg, {'perf.json': {updated: '2026-12-01', reg: {id: 'M-C', name: 'Reg M-C'}, tour: {rows: [1]}}});
    check('perf-object-reg-mismatch-emptied', res.lines.includes('emptied perf.json (was M-C)') && read('perf.json').tour === undefined && read('perf.json').reg.id === 'M-D', true);
  }

  // 10. Exempt files (reg.json, calendar.json, skips.json) stay untouched
  {
    const {res, read} = runCase(mdReg, {'calendar.json': {ev: [{n: 'Regional'}]}, 'skips.json': {runs: [{day: '2026-12-02'}]}});
    check('exempt-files-untouched', res.lines.includes('ok reg.json') && res.lines.includes('ok calendar.json') && res.lines.includes('ok skips.json') && read('calendar.json').ev.length === 1, true);
  }

  // 11. Unknown .json file prints "unknown <file>" and is not deleted or modified
  {
    const {res, read} = runCase(mdReg, {'mystery.json': {hello: 1}});
    check('unknown-file-reported', res.lines.includes('unknown mystery.json') && read('mystery.json').hello === 1, true);
  }

  // 12. Corrupt JSON file after switch is replaced with empty state
  {
    const {res, read} = runCase(mdReg, {'weekly.json': '{not valid json'});
    check('corrupt-json-emptied', res.lines.includes('emptied weekly.json (was unstamped)') && read('weekly.json').enough === false && read('weekly.json').v === 1, true);
  }

  // 13. Raw data/ folder is never touched
  {
    const {rawData} = runCase(mdReg, {'model.json': {reg: 'M-C', ships: true}});
    check('data-folder-untouched', rawData.tournaments.t1.f, 'M-C');
  }

  // 14. replays.json empty state carries activeReg().sd as format
  {
    const e = emptyFor('replays.json', 'M-D', 'gen9championsvgc2026regmd');
    check('replays-empty-carries-sd', `${e.reg}/${e.format}/${e.games.length}`, 'M-D/gen9championsvgc2026regmd/0');
  }
} finally {
  fs.rmSync(tmp, {recursive: true, force: true});
}

console.log(failed ? `${failed} FAILED` : 'ALL PASSED');
process.exit(failed ? 1 : 0);
