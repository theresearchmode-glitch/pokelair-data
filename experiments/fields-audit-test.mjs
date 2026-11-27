#!/usr/bin/env node
// fields-audit-test.mjs (Job 76): proves experiments/fields-audit.mjs treats non-item player typos (e.g. "Dragonitete")
// as a NOTE ("names that are not items (player typos)") rather than a FAIL, while real unmodelled items from REGMC_ITEMS
// (e.g. "Shed Shell") still FAIL.
//
// Usage: node experiments/fields-audit-test.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fields-audit-test-'));
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  PASS  ' : '  FAIL  ') + msg); if (!cond) fails++; };

function runAudit(metaTourObj) {
  const dir = fs.mkdtempSync(path.join(TMP, 'out-'));
  fs.writeFileSync(path.join(dir, 'meta_tour.json'), JSON.stringify(metaTourObj));
  const r = spawnSync(process.execPath, [path.join(ROOT, 'experiments/fields-audit.mjs')], {
    cwd: ROOT,
    env: {...process.env, FIELDS_OUT: dir},
    encoding: 'utf8',
  });
  return {code: r.status, out: (r.stdout || '') + (r.stderr || '')};
}

try {
  // 1. Live repo out/ (contains Dragonitete typo in meta_tour.json) must pass and list Dragonitete in the typo note
  {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'experiments/fields-audit.mjs')], {cwd: ROOT, encoding: 'utf8'});
    const out = (r.stdout || '') + (r.stderr || '');
    ok(r.status === 0, `1a. live out/ passes (exit=${r.status})`);
    ok(/note: names that are not items \(player typos\):.*Dragonitete/i.test(out), '1b. live out/ lists Dragonitete in player typos note');
  }

  // 2. Fixture with a made-up player typo ("FakeTypoStone") must pass (exit 0) and list it in the note with its share
  {
    const r = runAudit({
      top: [{n: 'Dragonite-Mega', u: 10, ab: [['Multiscale', 100]], it: [['FakeTypoStone', 5]]}],
      more: [],
    });
    ok(r.code === 0, `2a. fixture with made-up typo passes (exit=${r.code})`);
    ok(/note: names that are not items \(player typos\):.*FakeTypoStone \(0\.50% of slots\)/i.test(r.out), '2b. fixture typo listed in note with share (0.50% of slots)');
  }

  // 3. Fixture with a real unmodelled item ("Shed Shell" in REGMC_ITEMS) must still FAIL (exit 1)
  {
    const r = runAudit({
      top: [{n: 'Garchomp', u: 20, ab: [['Rough Skin', 100]], it: [['Shed Shell', 10]]}],
      more: [],
    });
    ok(r.code === 1, `3a. fixture with real unmodelled item (Shed Shell) FAILS (exit=${r.code})`);
    ok(/items players run that the engine never reads.*Shed Shell \(2\.00% of slots\)/i.test(r.out), '3b. Shed Shell listed in FAIL output');
  }
} finally {
  fs.rmSync(TMP, {recursive: true, force: true});
}

console.log(`fields-audit-test: ${fails ? fails + ' FAILED' : 'ALL PASSED'}`);
process.exit(fails ? 1 : 0);
