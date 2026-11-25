// The regulation profile (regulation.json; reg-md-plan.md 0.1 and gap G1; data-job port for alt/gemini-dec2).
// Exits 1 on any failure. Usage: node experiments/reg-profile-test.mjs
// 1) the profile: the site's entry and M-D entry have every required field; SITE_REG and REG_END come from it
// 2) old saved events with no format stay Reg M-C after a switch (history), and dates after M-C's end count for M-D
// 3) outside sources: a page about another regulation, or no page listed, is "not available yet" (sourcePageCheck, regSources)
// 4) a scratch Reg M-D profile (REG_PROFILE_FILE) exposes SITE_REG M-D while keeping LEGACY_REG M-C
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {REG_FILE, REG_PROFILE, SITE_REG, REG_END, LEGACY_REG, regOf, regProfile, regSources, sourcePageCheck} from '../formats.mjs';

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('  FAIL', m); } else console.log('  ok  ', m); };
const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')));

// 1) the profile
const need = ['name', 'long', 'sd', 'since', 'sources', 'rules'];
ok(REG_PROFILE && REG_PROFILE.id === REG_FILE.site, `the site's regulation (${REG_FILE.site}) has an entry in regulation.json`);
ok(need.every(k => REG_PROFILE[k] != null), `its entry has ${need.join(', ')}`);
ok(REG_PROFILE.name === 'Reg ' + REG_PROFILE.id && REG_PROFILE.long === 'Regulation ' + REG_PROFILE.id, 'name and long name match its id');
ok(SITE_REG.id === REG_PROFILE.id && SITE_REG.sd === REG_PROFILE.sd && SITE_REG.since === REG_PROFILE.since, 'SITE_REG is read from the profile');
ok(Object.entries(REG_FILE.regs).every(([id, r]) => !r.end || REG_END[id] === r.end) && REG_END['M-C'] === '2026-12-02T01:59:00Z', 'REG_END is read from the profile (M-C ends 2026-12-02 01:59 UTC)');
ok(Object.entries(REG_FILE.regs).every(([id, r]) => /^[A-Z]-[A-Z]$/.test(id) && /^gen9championsvgc\d{4}reg[a-z]{2}$/.test(r.sd) && /^\d{4}-\d{2}-\d{2}$/.test(r.since)), 'every regulation listed has a valid id, Showdown id and first day');

const mdProf = regProfile('M-D');
ok(mdProf && mdProf.since === '2026-12-02' && mdProf.end === '2027-03-03T01:59:00Z' && mdProf.sd === 'gen9championsvgc2026regmd' && mdProf.items === 'data/regmd-items.txt', 'M-D entry exists with expected since, official end (Mar 3 2027 01:59 UTC, Pokémon HOME news Nov 25), sd, and items');
ok(mdProf && mdProf.sources && mdProf.sources.showdowntier === null && mdProf.sources.pikalytics === null && mdProf.sources.official === null, 'M-D outside sources are null until their pages exist');

// 2) history stays history
ok(LEGACY_REG === 'M-C' && regOf({d: '2026-10-01'}) === 'M-C', 'an old saved event with no format counts as Reg M-C');
ok(regOf({f: 'M-C', d: '2026-12-05'}) === 'M-D', 'an event dated after M-C ends counts for M-D, whatever its tag');

// 3) outside sources (G1)
const SDT_MC = '<title>VGC 2026 Regulation M-C (Pokemon Champions) Competitive Viability Tier List - Showdown Tier</title>';
const PIKA_MC = '| 1 | a | 9-0 | Intimidators Champions Challenge #52 REG M-C |\n| 2 | b | 12-2 | Maddo\'s Cup #13 | Reg M-C |\n| 3 | c | 11-1 | Alpensee Tour (Reg M-C) #80 |\n| 4 | d | 10-0 | 2026 Worlds Reg M-B rerun |';
ok(sourcePageCheck('showdowntier', SDT_MC, 'M-C') === null, "Showdowntier's M-C page is accepted for Reg M-C");
ok(/not say Regulation M-D/.test(sourcePageCheck('showdowntier', SDT_MC, 'M-D') || ''), "Showdowntier's M-C page is refused for Reg M-D");
ok(sourcePageCheck('pikalytics', PIKA_MC, 'M-C') === null, "Pikalytics' tournament page (3 of 4 named events M-C) is accepted for Reg M-C");
ok(/mostly M-C/.test(sourcePageCheck('pikalytics', PIKA_MC, 'M-D') || ''), 'the same page is refused for Reg M-D (its events are M-C)');
ok(Object.keys(regSources('Z-Z')).length === 0 && regProfile('Z-Z') === null, 'a regulation with no entry has no source ids (so every source says "not available yet")');

// 4) a scratch Reg M-D profile (data-job checks)
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'regmd-'));
const md = JSON.parse(JSON.stringify(REG_FILE));
md.site = 'M-D';
fs.writeFileSync(path.join(tmp, 'regulation.json'), JSON.stringify(md));
const env = {...process.env, REG_PROFILE_FILE: path.join(tmp, 'regulation.json')};
try {
  const sw = execFileSync(
    process.execPath,
    ['-e', "import('./formats.mjs').then(m=>console.log(JSON.stringify([m.SITE_REG,m.regOf({d:'2026-10-01'}),Object.keys(m.regSources('M-D')).length])))"],
    {cwd: ROOT, env}
  ).toString().trim();
  ok(sw === '[{"id":"M-D","sd":"gen9championsvgc2026regmd","since":"2026-12-02"},"M-C",3]', 'with the M-D profile, the data job sees SITE_REG M-D and old events stay M-C: ' + sw);
} finally {
  fs.rmSync(tmp, {recursive: true, force: true});
}

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
