// Team-wide basics of one real sheet, as the trainer (model.mjs) sees them: Pokémon, "Name#Ability", "Name@Item", "Name:Move".
// The page computes the same basics in app/src/app/35-win-model.js (teamBasicsOf); experiments/suggest-gaps.mjs checks that the two
// agree on every real sheet in out/matches.json, so a weight learned here means the same thing on the page.
// Nov 18 (rule-holes sweep, hole 10): "no speed control" now counts the same tools as the game plan's speed rows (11-game-plan.js):
// Tailwind, Trick Room, every speed-drop move (ROLE.drop: Icy Wind, Electroweb, Thunder Wave, Nuzzle, Glare... and every attack
// that always lowers Speed), and weather speed (Swift Swim, Chlorophyll, Sand Rush, Slush Rush) with a setter of that weather on the
// team; plus Choice Scarf (the Nov 8 expert list). Before, weather speed and Thunder Wave were missing. Today's model gives
// noSpeed no weight (model.mjs TEAMF), so this changes no score.
import fs from 'node:fs';
const ROOT = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const MOVE_META = (() => { try { return JSON.parse(fs.readFileSync(ROOT + 'app/src/data/move-meta.js', 'utf8').match(/const MOVE_META=(\{.*?\});/s)[1]); } catch (e) { return {}; } })();
// the same list as ROLE.drop in 11-game-plan.js
export const SPEED_DROP = [...new Set(['Icy Wind', 'Electroweb', 'Thunder Wave', 'Nuzzle', 'Glare', 'Bulldoze', 'Rock Tomb', 'Scary Face', 'Drum Beating', 'Mud Shot', 'Pounce', 'Low Sweep',
  ...Object.keys(MOVE_META).filter(n => (MOVE_META[n].s || []).some(s => s[0] >= 100 && s[1] && s[1].spe < 0))])];
const SPEED_MV = new Set(['Tailwind', 'Trick Room', ...SPEED_DROP]);
const WEATHER_OF = {Drizzle: 'rain', Drought: 'sun', 'Sand Stream': 'sand', 'Snow Warning': 'snow'};
const WEATHER_SPEED = {'Swift Swim': 'rain', Chlorophyll: 'sun', 'Sand Rush': 'sand', 'Slush Rush': 'snow'};
const SPD = (() => { try { const t = fs.readFileSync(ROOT + 'app/src/data/data.js', 'utf8').match(/const ROSTER=(\[.*?\]);/s); return new Map(JSON.parse(t[1]).map(r => [r.n, r.sp])); } catch (e) { return new Map(); } })();
// nm: the sheet's feature names. Returns null when the sheet lists fewer than 16 moves (unknown).
export function deckBasics(nm) {
  const mv = nm.filter(n => n.includes(':'));
  if (mv.length < 16) return null; const prot = mv.filter(n => /:Protect$/.test(n)).length;
  const trU = new Set(mv.filter(n => /:Trick Room$/.test(n)).map(n => n.slice(0, n.indexOf(':')))), deckMons = new Set(mv.map(n => n.slice(0, n.indexOf(':'))));
  const slow = [...deckMons].filter(n => !trU.has(n) && (SPD.get(n) ?? 100) <= 60).length;
  const abs = nm.filter(n => n.includes('#')).map(n => n.slice(n.indexOf('#') + 1)), wx = new Set(abs.map(a => WEATHER_OF[a]).filter(Boolean));
  const speed = mv.some(n => SPEED_MV.has(n.slice(n.indexOf(':') + 1))) || nm.some(n => /@Choice Scarf$/.test(n)) || abs.some(a => WEATHER_SPEED[a] && wx.has(WEATHER_SPEED[a]));
  return {trNoSlow: trU.size && slow < 2 ? 1 : 0, protectLow: prot <= 2 ? 1 : 0, noSpeed: speed ? 0 : 1, noFakeOut: mv.some(n => /:Fake Out$/.test(n)) ? 0 : 1};
}
