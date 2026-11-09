// Watchdog (Sim, Nov 9: "make sure we have checks so we know if anything fails. silent failures are the worst").
// One daily summary of every job that keeps the live site right, judged by what actually happened, not by whether a job
// said "success": a job that stopped running at all is the silent failure this exists to catch.
//   daily data job     a successful run in the last 26 h
//   tests on main      the latest finished run passed
//   live branch        its data (live/out/limitless.json "updated") is from the last 30 h (it only moves after tests pass)
//   promote            the latest run did not fail
//   weekly re-check    a successful run in the last 8 days (once it has run at all)
//   monthly check      a successful run in the last 35 days (once it has run at all)
// Writes a table to the job summary and to $WATCHDOG_REPORT (the workflow opens / refreshes / closes one issue from it).
// Exit 1 when anything is red. Needs GH_TOKEN (actions: read). Usage: GH_TOKEN=... node watchdog.mjs
import fs from 'node:fs';
// WATCHDOG_NOW=<ISO time> (test only): judge as if it were that time, to prove stale jobs turn red
const REPO = process.env.GITHUB_REPOSITORY || 'theresearchmode-glitch/pokelair-data', T = process.env.GH_TOKEN, now = process.env.WATCHDOG_NOW ? Date.parse(process.env.WATCHDOG_NOW) : Date.now(), H = 36e5;
const api = async p => { const r = await fetch(`https://api.github.com/repos/${REPO}/${p}`, {headers: {Accept: 'application/vnd.github+json', ...(T ? {Authorization: `Bearer ${T}`} : {}), 'User-Agent': 'nastyplot-watchdog'}});
  if (!r.ok) throw new Error(`${p}: HTTP ${r.status}`); return r.json(); };
const runs = async (wf, q = '') => (await api(`actions/workflows/${wf}/runs?per_page=30${q}`)).workflow_runs || [];
const rows = [], add = (name, level, detail) => rows.push({name, level, detail}), ago = t => `${Math.round((now - Date.parse(t)) / H)} h ago`;
const lastOk = (R) => R.find(r => r.conclusion === 'success');
async function check(name, f) { try { await f(); } catch (e) { add(name, 'red', `could not check: ${e.message}`); } }
await check('Daily data job', async () => { const R = await runs('update.yml'), ok = lastOk(R);
  if (!ok) return add('Daily data job', 'red', 'no successful run found');
  const h = (now - Date.parse(ok.updated_at)) / H; add('Daily data job', h <= 26 ? 'green' : 'red', `last success ${ago(ok.updated_at)}${h > 26 ? ' (expected daily: it has stopped or keeps failing)' : ''}`); });
await check('Tests on main', async () => { const R = (await runs('test.yml', '&branch=main')).filter(r => r.status === 'completed' && r.conclusion !== 'cancelled' && r.conclusion !== 'skipped'), r = R[0];
  if (!r) return add('Tests on main', 'red', 'no finished run found');
  add('Tests on main', r.conclusion === 'success' ? 'green' : 'red', `latest finished run ${r.conclusion} (${ago(r.updated_at)}, ${r.head_sha.slice(0, 7)}) ${r.html_url}`); });
await check('Live data (live branch)', async () => { const r = await fetch(`https://raw.githubusercontent.com/${REPO}/live/out/limitless.json`); if (!r.ok) throw new Error(`live/out/limitless.json HTTP ${r.status}`);
  const u = (await r.json()).updated, h = (now - Date.parse(u)) / H;
  add('Live data (live branch)', h <= 30 ? 'green' : h <= 54 ? 'amber' : 'red', `data from ${String(u).slice(0, 16)} (${Math.round(h)} h old)${h > 30 ? ': live has not moved today (tests failing, or promote did not run)' : ''}`); });
await check('Promote to live', async () => { const R = (await runs('promote.yml')).filter(r => r.status === 'completed'), r = R[0];
  if (!r) return add('Promote to live', 'amber', 'has not run yet');
  add('Promote to live', r.conclusion === 'failure' ? 'red' : 'green', `latest run ${r.conclusion} (${ago(r.updated_at)})`); });
for (const [wf, name, days] of [['weekly.yml', 'Weekly settings re-check', 8], ['monthly.yml', 'Monthly accuracy check', 35]])
  await check(name, async () => { const R = (await runs(wf)).filter(r => r.status === 'completed'); if (!R.length) return add(name, 'amber', 'has not run yet');
    const ok = lastOk(R), h = ok ? (now - Date.parse(ok.updated_at)) / H : Infinity;
    add(name, h <= days * 24 ? 'green' : 'red', ok ? `last success ${Math.round(h / 24)} days ago${R[0].conclusion !== 'success' ? `; latest run ${R[0].conclusion}` : ''}` : `no successful run (latest ${R[0].conclusion})`); });
const ICON = {green: '🟢', amber: '🟠', red: '🔴'}, red = rows.filter(r => r.level === 'red'), day = new Date(now).toISOString().slice(0, 10);
const md = [red.length ? `## 🔴 NastyPlot watchdog: ${red.length} problem${red.length > 1 ? 's' : ''} (${day})\n\n${red.map(r => `- **${r.name}**: ${r.detail}`).join('\n')}\n` : `## 🟢 NastyPlot watchdog: all running (${day})\n`,
  '| Job | Status | Detail |', '|---|---|---|', ...rows.map(r => `| ${r.name} | ${ICON[r.level]} | ${r.detail} |`)].join('\n');
console.log(md);
try { if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n'); } catch (e) {}
try { if (process.env.WATCHDOG_REPORT) fs.writeFileSync(process.env.WATCHDOG_REPORT, md + '\n'); } catch (e) {}
process.exit(red.length ? 1 : 0);
