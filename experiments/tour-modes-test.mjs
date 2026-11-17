// Checks tour-modes.mjs (Sim, Nov 17): the daily job stores each event's round format once, newest first, only complete answers,
// never for events that haven't started, and a failed call never stops the run. Exit 1 on failure. node experiments/tour-modes-test.mjs
import {phasesOf, updateModes} from '../tour-modes.mjs';
const fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
ok(JSON.stringify(phasesOf({phases: [{phase: 2, type: 'SINGLE_BRACKET', rounds: 1, mode: 'BO3'}, {phase: 1, type: 'SWISS', rounds: 6, mode: 'bo1'}]})) === '[["SWISS",6,"BO1"],["SINGLE_BRACKET",1,"BO3"]]', 'phases are kept in order as [type, rounds, mode]');
ok(phasesOf({phases: [{phase: 1, type: 'SWISS', rounds: 5}]}) === null && phasesOf({}) === null && phasesOf(null) === null, 'a missing mode or no phases is not stored');
const now = Date.parse('2026-11-17T12:00:00Z');
const index = {tournaments: {a: {d: '2026-11-01T00:00:00Z'}, b: {d: '2026-11-16T00:00:00Z'}, c: {d: '2026-11-20T00:00:00Z'}, d: {d: '2026-11-10T00:00:00Z'}, e: {d: '2026-11-12T00:00:00Z'}}};
const calls = [], get = async p => { const id = p.split('/')[2]; calls.push(id); if (id === 'e') throw new Error('500'); return {phases: [{phase: 1, type: 'SWISS', rounds: 5, mode: 'BO3'}]}; };
const r = await updateModes(index, get, {modes: {d: [['SWISS', 4, 'BO1']]}, max: 3, now});
ok(calls.join(',') === 'b,e,a', `newest first, skips stored (d) and not-yet-started (c) events, at most 3 calls (${calls.join(',')})`);
ok(r.added === 2 && r.modes.b && r.modes.a && !r.modes.e && JSON.stringify(r.modes.d) === '[["SWISS",4,"BO1"]]', 'a failed call is skipped and tried again next day; stored formats are kept');
console.log(`tour-modes: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
