// A daily-job step that failed and was skipped (Nov 7): prints the ::warning:: as before and records it in out/skips.json
// (last 14 days), so health.mjs can raise the "Daily data problem" issue when the SAME step is skipped two runs in a row.
// One flaky day stays quiet; a step that has quietly stopped working (like the ratings snapshot on Nov 6) gets noticed.
// Usage in update.yml: node step.mjs || node skip.mjs "step name skipped (detail)". Never fails itself.
import fs from 'node:fs';
const msg = process.argv.slice(2).join(' ') || 'a step skipped', step = msg.replace(/ skipped.*$/, '').trim();
console.log('::warning::' + msg);
try { const f = 'out/skips.json'; let S = {runs: []}; try { S = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) {}
  const day = new Date().toISOString().slice(0, 10); let run = S.runs.find(r => r.day === day); if (!run) { run = {day, steps: []}; S.runs.push(run); }
  if (!run.steps.includes(step)) run.steps.push(step);
  S.runs = S.runs.sort((a, b) => a.day < b.day ? -1 : 1).slice(-14); fs.writeFileSync(f, JSON.stringify(S)); } catch (e) {}
