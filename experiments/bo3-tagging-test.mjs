// Fixture tests for Best-of-3 / round-format tagging (Kip job 24, Part 2).
// Verifies roundMode(), eventMode(), backward compatibility with 4-field data/p/*.json rows,
// explicit phase tagging on 5-field rows, and that existing matches.json indices 0..8 and events[i][0..2] stay unchanged.
import assert from 'node:assert/strict';
import {phasesOf, roundMode, eventMode} from '../tour-modes.mjs';

// 1. phasesOf parsing (sorted by phase number)
const mixedPhases = phasesOf({
  phases: [
    {phase: 2, type: 'SINGLE_BRACKET', rounds: 1, mode: 'BO3'},
    {phase: 1, type: 'SWISS', rounds: 6, mode: 'BO1'}
  ]
});
assert.deepEqual(mixedPhases, [['SWISS', 6, 'BO1'], ['SINGLE_BRACKET', 1, 'BO3']]);

const allBo3 = phasesOf({
  phases: [
    {phase: 1, type: 'SWISS', rounds: 5, mode: 'BO3'},
    {phase: 2, type: 'SINGLE_BRACKET', rounds: 1, mode: 'BO3'}
  ]
});
assert.equal(eventMode(mixedPhases), 'mixed');
assert.equal(eventMode(allBo3), 'bo3');
assert.equal(eventMode([['SWISS', 5, 'BO1']]), 'bo1');
assert.equal(eventMode(null), 'unknown');

// 2. Explicit phase field (5-field pairing row) takes precedence
assert.equal(roundMode(mixedPhases, 1, 1), 'bo1');
assert.equal(roundMode(mixedPhases, 6, 1), 'bo1');
assert.equal(roundMode(mixedPhases, 1, 2), 'bo3'); // Top Cut bracket round 1 in phase 2
assert.equal(roundMode(mixedPhases, null, 2), 'bo3');

// 3. Backward-compatible fallback for cached 4-field pairing rows (phase = null)
assert.equal(roundMode(mixedPhases, 1), 'bo1');
assert.equal(roundMode(mixedPhases, 6), 'bo1');
assert.equal(roundMode(mixedPhases, 7), 'bo3'); // Beyond Swiss rounds -> Top Cut bracket
assert.equal(roundMode(mixedPhases, null), 'unknown'); // Mixed event with no round and no phase -> honest unknown

// 4. Uniform event resolves even when round is null
assert.equal(roundMode(allBo3, null), 'bo3');
assert.equal(roundMode(allBo3, 99), 'bo3');

// 5. Missing/unknown tournament mode
assert.equal(roundMode(null, 3, 1), 'unknown');
assert.equal(roundMode([], 3, 1), 'unknown');

// 6. Simulated matches.json row & event compatibility: existing indices 0..8 and 0..2 untouched
const baseRow = [12, 45, 1, 0, 3, 8, 7, 10, 22];
const taggedRow = [...baseRow, roundMode(mixedPhases, baseRow[6], null)];
assert.equal(taggedRow.length, 10);
assert.deepEqual(taggedRow.slice(0, 9), baseRow);
assert.equal(taggedRow[9], 'bo3');
// Destructuring reader (like model.mjs / scoreboard.mjs / v3-lab.mjs) still reads exact same 9 values
const [a, b, y, ei, pa, pb, r, da, db] = taggedRow;
assert.deepEqual([a, b, y, ei, pa, pb, r, da, db], baseRow);

const baseEvent = ['tour_abc', '2026-11-20', 64];
const taggedEvent = [...baseEvent, eventMode(mixedPhases)];
assert.deepEqual(taggedEvent.slice(0, 3), baseEvent);
assert.equal(taggedEvent[3], 'mixed');

console.log('bo3-tagging-test: PASS (all 18 assertions passed)');
