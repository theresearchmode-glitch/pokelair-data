// The improvement rule (Nov 8, foundation plan Phase 0). Is version B of the grade really better than version A, or is the
// gap just chance? Both are scored on exactly the same later games (a BOARD_PRED file from experiments/board.mjs, or two
// files with the same games). The games are resampled BY TOURNAMENT (games in one event share players and teams, so they
// are not independent), 2,000 times, giving a 95% range for the gap in log-loss and in pick rate.
// KEEP the change only if the whole 95% range for log-loss is on the better side (B lower than A). Otherwise the change
// counts as "no difference" and the simpler version stays. Log-loss decides because it uses every game and rewards honest
// win chances; pick rate is shown alongside.
// Usage: node experiments/compare.mjs <pred.json> "<row A>" "<row B>"      (row names as board.mjs prints them)
//        node experiments/compare.mjs <predA.json> <predB.json> "<row A>" "<row B>"   (two files, same games)
import fs from 'node:fs';
const a = process.argv.slice(2), two = a.length === 4, PA = JSON.parse(fs.readFileSync(a[0], 'utf8')), PB = two ? JSON.parse(fs.readFileSync(a[1], 'utf8')) : PA;
const kA = two ? a[2] : a[1], kB = two ? a[3] : a[2], pA = PA.rows[kA], pB = PB.rows[kB];
if (!pA || !pB) { console.error('row not found; rows:', Object.keys(PA.rows).join(' | ')); process.exit(2); }
if (pA.length !== pB.length || PA.ev.some((e, i) => e !== PB.ev[i])) { console.error('the two files do not score the same games'); process.exit(2); }
const y = PA.y, cl = p => Math.min(1 - 1e-9, Math.max(1e-9, p)), ll = (p, i) => -(y[i] ? Math.log(cl(p)) : Math.log(1 - cl(p))), hit = (p, i) => p === .5 ? .5 : ((p > .5) === (y[i] === 1) ? 1 : 0);
const byE = new Map(); PA.ev.forEach((e, i) => { if (!byE.has(e)) byE.set(e, []); byE.get(e).push(i); }); const E = [...byE.values()];
const stat = idx => { let dl = 0, dp = 0; for (const i of idx) { dl += ll(pB[i], i) - ll(pA[i], i); dp += hit(pB[i], i) - hit(pA[i], i); } return [dl / idx.length, dp / idx.length * 100]; };
const all = E.flat(), [DL, DP] = stat(all);
let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const L = [], P = []; for (let r = 0; r < 2000; r++) { const idx = []; for (let k = 0; k < E.length; k++) idx.push(...E[Math.floor(rnd() * E.length)]); const [l, p] = stat(idx); L.push(l); P.push(p); }
L.sort((x, z) => x - z); P.sort((x, z) => x - z); const q = (A, f) => A[Math.floor(f * (A.length - 1))];
const lo = q(L, .025), hi = q(L, .975), verdict = hi < 0 ? 'KEEP: B is better than A beyond chance' : lo > 0 ? 'REJECT: B is worse than A beyond chance' : 'NO DIFFERENCE: the gap is within chance, keep the simpler version';
console.log(`${all.length} games in ${E.length} tournaments (cut ${PA.cutDate})\nA: ${kA}\nB: ${kB}`);
console.log(`log-loss B − A: ${DL.toFixed(5)} (95% range ${lo.toFixed(5)} to ${hi.toFixed(5)}; negative = B better)`);
console.log(`pick rate B − A: ${DP >= 0 ? '+' : ''}${DP.toFixed(2)} pts (95% range ${q(P, .025).toFixed(2)} to ${q(P, .975).toFixed(2)})`);
console.log(verdict);
process.exitCode = hi < 0 ? 0 : lo > 0 ? 1 : 3;
