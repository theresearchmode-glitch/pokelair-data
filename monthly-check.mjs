// Monthly accuracy check (Foundation Phase 4, Nov 9; .github/workflows/monthly.yml). Catches the grade slowly drifting.
// A model is trained only on games BEFORE the last CHECK_DAYS days (default 30), exactly as the daily run builds one; then the
// last CHECK_DAYS days of tournament games are scored the way the site works (experiments/site-board.mjs), so every number is
// real later performance. Scoring only: nothing here tunes anything (the sealed-set rule allows scoring; decisions are then
// tested on dev data). Fails (exit 1, GitHub emails the owner) when:
//   grade      picks the winner less than 53% of games, or log-loss above 0.688 (coin flip 0.693), or A teams don't beat C teams
//   battle     the one-opponent chance (Plan a Match) is worse than the grade alone by more than 0.002 log-loss
//   threats    the verdicts point the wrong way (95% upper bound below 0)
// Writes out/monthly.json. Usage: node monthly-check.mjs   (needs playwright and a built page: node app/build.mjs)
import fs from 'node:fs'; import {execSync} from 'node:child_process';
const DAYS = +(process.env.CHECK_DAYS || 30), FROM = new Date(Date.now() - DAYS * 864e5).toISOString().slice(0, 10), T = 'out/', sh = (c, env = {}) => execSync(c, {stdio: 'inherit', env: {...process.env, ...env}});
const M = JSON.parse(fs.readFileSync(T + 'matches.json', 'utf8')), nLater = M.m.filter(g => M.events[g[3]][1] >= FROM).length;
console.log(`monthly check: games from ${FROM} (${nLater}) scored by a model trained on games before it`);
if (nLater < 500) { console.log(`::warning::monthly check: only ${nLater} games in the last ${DAYS} days; too few to judge, skipped`); fs.writeFileSync(T + 'monthly.json', JSON.stringify({from: FROM, games: nLater, skipped: true})); process.exit(0); }
// games before FROM only, for the six records and learned matchups
fs.writeFileSync(T + 'matches_mtrain.json', JSON.stringify({...M, m: M.m.filter(g => M.events[g[3]][1] < FROM)}));
sh('node model.mjs', {MATCHES: T + 'matches.json', TEST_DATE: FROM, TRAIN_ONLY: '1', MODEL_OUT: T + 'model_month.json'});
sh('node six.mjs', {MODEL_FILE: T + 'model_month.json', MATCHES: T + 'matches_mtrain.json'});
sh('node ctr.mjs', {MODEL_FILE: T + 'model_month.json', MATCHES: T + 'matches_mtrain.json'});
sh(`node experiments/site-board.mjs ${T}monthly_pred.json ${T}monthly_board.json`, {SB_MODEL: T + 'model_month.json', BOARD_DATE: FROM, MATCHES: T + 'matches.json', SEALED: '1'});
sh('node experiments/threat-verdict-test.mjs 40000', {THR_MODEL: T + 'model_month.json', THR_FROM: FROM, THR_OUT: T + 'monthly_thr.json'});
const B = JSON.parse(fs.readFileSync(T + 'monthly_board.json', 'utf8')), TH = JSON.parse(fs.readFileSync(T + 'monthly_thr.json', 'utf8'));
const row = p => { const k = Object.keys(B.rows).find(x => x.startsWith(p)); return k ? B.rows[k] : null; }, site = row('site today'), battle = row('site + learned matchups against this opponent');
const won = l => { const m = String((B.lettersAll || {})[l] || '').match(/won ([\d.]+)%/); return m ? +m[1] : null; }, wA = won('A'), wC = won('C');
const bad = [];
if (!site) bad.push('no grade results'); else { if (site.pick < 53) bad.push(`grade picks only ${site.pick}% of winners`); if (site.ll > .688) bad.push(`grade log-loss ${site.ll}`); }
if (wA != null && wC != null && !(wA > wC)) bad.push(`A teams won ${wA}%, not more than C teams (${wC}%)`);
if (site && battle && battle.ll > site.ll + .002) bad.push(`Battle's one-opponent chance (log-loss ${battle.ll}) worse than the grade alone (${site.ll})`);
if (TH.level + TH.level95 < 0) bad.push(`threat verdicts point the wrong way (${TH.level.toFixed(1)} ± ${TH.level95.toFixed(1)} pts)`);
const out = {at: new Date().toISOString().slice(0, 10), from: FROM, games: B.games, grade: site, battle, letters: {A: wA, C: wC}, threats: TH, problems: bad};
fs.writeFileSync(T + 'monthly.json', JSON.stringify(out, null, 1)); for (const f of ['matches_mtrain.json', 'model_month.json', 'monthly_pred.json', 'monthly_board.json', 'monthly_thr.json']) try { fs.unlinkSync(T + f); } catch (e) {}
console.log(`grade: picks ${site && site.pick}% · log-loss ${site && site.ll} · A won ${wA}% vs C ${wC}% · battle log-loss ${battle && battle.ll} · threats ${TH.level.toFixed(1)} ± ${TH.level95.toFixed(1)} pts`);
if (bad.length) { console.log('::error::monthly check: ' + bad.join('; ')); process.exit(1); } console.log('monthly check: ok');
