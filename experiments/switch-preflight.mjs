// Switch-day preflight check (Job 62, switch-runbook-nov28.md step 1).
// Read-only. Prints PASS / FAIL / CHECK BY HAND per line; exits 1 on any FAIL, 0 otherwise.
// Usage:
//   node experiments/switch-preflight.mjs
//   PREFLIGHT_FIXTURE=/path/to/fixture.json node experiments/switch-preflight.mjs
//   PREFLIGHT_NO_GH=1 node experiments/switch-preflight.mjs
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = process.env.PREFLIGHT_REPO || 'theresearchmode-glitch/pokelair-data';
const FIXTURE_PATH = process.env.PREFLIGHT_FIXTURE || '';
const NO_GH = process.env.PREFLIGHT_NO_GH === '1';
const REQUIRE_RAN = process.env.PREFLIGHT_REQUIRE_RAN === '1';

const fixture = FIXTURE_PATH ? JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8')) : null;

let fails = 0;
let manual = 0;
const pass = msg => console.log(`  PASS           ${msg}`);
const fail = msg => { console.log(`  FAIL           ${msg}`); fails++; };
const byHand = msg => { console.log(`  CHECK BY HAND  ${msg}`); manual++; };

// A test.yml run that was 'skipped' (the workflow_run trigger after an update.yml run with no change) tested nothing: look past it
// to the newest run that really ran (HH, Nov 26: main's newest run was skipped on e7e2ad16 while an earlier run on the same commit passed).
const realRun = runs => (runs || []).find(x => x.conclusion !== 'skipped');
function hasGh() {
  if (fixture) return fixture.ghAvailable !== false;
  if (NO_GH) return false;
  try {
    execFileSync('gh', ['--version'], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
}

function ghJson(endpoint) {
  if (fixture) {
    const map = fixture.api || {};
    if (!(endpoint in map)) return {ok: false, error: 'not in fixture'};
    const v = map[endpoint];
    if (v && v.__error) return {ok: false, error: v.__error};
    return {ok: true, data: v};
  }
  try {
    const out = execFileSync('gh', ['api', endpoint], {cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
    return {ok: true, data: JSON.parse(out)};
  } catch (e) {
    return {ok: false, error: String(e.stderr || e.message || e).trim().split('\n')[0]};
  }
}

function readOutFile(rel) {
  if (fixture && fixture.out) {
    if (!(rel in fixture.out)) return {exists: false};
    const raw = fixture.out[rel];
    if (raw === null) return {exists: false};
    if (typeof raw === 'string') {
      try { return {exists: true, data: JSON.parse(raw)}; } catch (e) { return {exists: true, corrupt: e.message}; }
    }
    return {exists: true, data: raw};
  }
  // Prefer origin/main's out/ when available, falling back to local out/
  const fp = path.join(ROOT, 'out', rel);
  if (fs.existsSync(fp)) {
    try { return {exists: true, data: JSON.parse(fs.readFileSync(fp, 'utf8'))}; }
    catch (e) { return {exists: true, corrupt: e.message}; }
  }
  return {exists: false};
}

const ACTIVE_STATUSES = new Set(['in_progress', 'queued', 'waiting', 'requested', 'pending']);
const ghOk = hasGh();

console.log(`Switch preflight (${fixture ? 'fixture: ' + path.basename(FIXTURE_PATH) : REPO})`);

// 1. No update.yml run in progress on main
if (!ghOk) {
  byHand('update.yml on main: gh CLI not available — check GitHub Actions "Update Limitless data" by hand');
} else {
  const r = ghJson(`repos/${REPO}/actions/workflows/update.yml/runs?branch=main&per_page=5`);
  if (!r.ok) {
    byHand(`update.yml on main: GitHub API unreadable (${r.error}) — check by hand`);
  } else {
    const runs = r.data?.workflow_runs || [];
    const active = runs.filter(x => ACTIVE_STATUSES.has(x.status));
    if (active.length) {
      fail(`update.yml on main has ${active.length} active run(s): #${active[0].id} (${active[0].status})`);
    } else {
      const last = runs[0];
      pass(`no update.yml run in progress on main (latest: ${last ? `#${last.id} ${last.status}/${last.conclusion}` : 'none'})`);
    }
  }
}

// 2. main's latest test.yml run is green
let mainSha = null;
if (!ghOk) {
  byHand('main latest test.yml: gh CLI not available — check GitHub Actions "Test NastyPlot page" on main by hand');
} else {
  const brMain = ghJson(`repos/${REPO}/branches/main`);
  if (brMain.ok) mainSha = brMain.data?.commit?.sha || null;
  const r = ghJson(`repos/${REPO}/actions/workflows/test.yml/runs?branch=main&per_page=5`);
  if (!r.ok) {
    byHand(`main latest test.yml: GitHub API unreadable (${r.error}) — check by hand`);
  } else {
    const last = realRun(r.data?.workflow_runs);
    if (!last) fail('main latest test.yml: no runs found (other than skipped ones)');
    else if (last.status === 'completed' && last.conclusion === 'success') {
      if (mainSha && last.head_sha !== mainSha) fail(`main's newest real test.yml run (#${last.id}) is for ${String(last.head_sha || '').slice(0, 8)}, not main's tip ${mainSha.slice(0, 8)}`);
      else pass(`main latest test.yml is green (#${last.id}, sha ${String(last.head_sha || '').slice(0, 8)})`);
    } else {
      fail(`main latest test.yml is NOT green (#${last.id}: ${last.status}/${last.conclusion || 'pending'})`);
    }
  }
}

// 3. live branch == main OR live commit's test.yml run is green
if (!ghOk) {
  byHand('live branch status: gh CLI not available — verify live == main or live commit is green by hand');
} else {
  const brLive = ghJson(`repos/${REPO}/branches/live`);
  if (!brLive.ok) {
    byHand(`live branch status: GitHub API unreadable (${brLive.error}) — check by hand`);
  } else {
    const liveSha = brLive.data?.commit?.sha || null;
    if (liveSha && mainSha && liveSha === mainSha) {
      pass(`live branch == main (${liveSha.slice(0, 8)})`);
    } else if (!liveSha) {
      fail('live branch has no commit SHA');
    } else {
      const r = ghJson(`repos/${REPO}/actions/workflows/test.yml/runs?head_sha=${liveSha}&per_page=5`);
      if (!r.ok) {
        byHand(`live commit ${liveSha.slice(0, 8)} != main: could not read test.yml runs (${r.error}) — check by hand`);
      } else {
        const okRun = (r.data?.workflow_runs || []).find(x => x.status === 'completed' && x.conclusion === 'success');
        if (okRun) pass(`live (${liveSha.slice(0, 8)}) != main (${String(mainSha || '').slice(0, 8)}), but live commit is green (#${okRun.id})`);
        else fail(`live (${liveSha.slice(0, 8)}) != main (${String(mainSha || '').slice(0, 8)}) and live commit has no green test.yml run`);
      }
    }
  }
}

// 4. Repository variable FAST_DATA is not "1" (if readable)
if (!ghOk) {
  byHand('FAST_DATA variable: gh CLI not available — check Settings > Variables > FAST_DATA != 1 by hand');
} else {
  const r = ghJson(`repos/${REPO}/actions/variables`);
  if (!r.ok) {
    byHand(`FAST_DATA variable: not readable via API (${r.error}) — check Settings > Variables by hand`);
  } else {
    const vars = r.data?.variables || [];
    const fd = vars.find(v => v.name === 'FAST_DATA');
    if (fd && String(fd.value).trim() === '1') {
      fail('repository variable FAST_DATA is "1" (must not be "1" during switch)');
    } else {
      pass(`repository variable FAST_DATA is not "1" (${fd ? 'value=' + JSON.stringify(fd.value) : 'unset'})`);
    }
  }
}

// 5. origin/claude/design6's latest test.yml run is green
if (!ghOk) {
  byHand('claude/design6 latest test.yml: gh CLI not available — check GitHub Actions on claude/design6 by hand');
} else {
  const r = ghJson(`repos/${REPO}/actions/workflows/test.yml/runs?branch=claude/design6&per_page=5`);
  if (!r.ok) {
    byHand(`claude/design6 latest test.yml: GitHub API unreadable (${r.error}) — check by hand`);
  } else {
    const last = realRun(r.data?.workflow_runs);
    if (!last) fail('claude/design6 latest test.yml: no runs found (other than skipped ones)');
    else if (last.status === 'completed' && last.conclusion === 'success') {
      pass(`claude/design6 latest test.yml is green (#${last.id}, sha ${String(last.head_sha || '').slice(0, 8)})`);
    } else {
      fail(`claude/design6 latest test.yml is NOT green (#${last.id}: ${last.status}/${last.conclusion || 'pending'})`);
    }
  }
}

// 6. out/regstate.json and out/post.json state (step 5 note)
{
  const rs = readOutFile('regstate.json');
  if (rs.corrupt) {
    fail(`out/regstate.json is corrupt JSON: ${rs.corrupt}`);
  } else if (!rs.exists) {
    pass('out/regstate.json absent (expected before first merged data run — step 5 note)');
  } else if (!rs.data || typeof rs.data !== 'object' || !rs.data.reg) {
    fail('out/regstate.json exists but is missing required "reg" field');
  } else {
    pass(`out/regstate.json valid (reg=${rs.data.reg}, events=${rs.data.events ?? '?'}, games=${rs.data.games ?? '?'})`);
  }

  const po = readOutFile('post.json');
  if (po.corrupt) {
    fail(`out/post.json is corrupt JSON: ${po.corrupt}`);
  } else if (!po.exists) {
    if (REQUIRE_RAN) fail('out/post.json missing (required after step 5 merged data run)');
    else pass('out/post.json absent locally (step 5 first merged data run will write it with "ran")');
  } else {
    const hasNews = Array.isArray(po.data?.news) && po.data.news.length > 0;
    const ran = po.data?.ran;
    const ranValid = typeof ran === 'string' && !Number.isNaN(Date.parse(ran));
    if (!hasNews) {
      fail('out/post.json has no news entries');
    } else if (ran !== undefined && !ranValid) {
      fail(`out/post.json has invalid "ran" timestamp: ${JSON.stringify(ran)}`);
    } else if (REQUIRE_RAN && !ranValid) {
      fail('out/post.json is missing "ran" field (step 5: health.mjs will fail without it)');
    } else {
      pass(`out/post.json valid (${po.data.news.length} stories, ran=${ranValid ? ran : 'not yet stamped — step 5 adds it'})`);
    }
  }
}

console.log(`\nswitch-preflight: ${fails ? fails + ' FAILED' : 'ALL PASSED'}${manual ? ` (${manual} CHECK BY HAND)` : ''}`);
process.exit(fails ? 1 : 0);
