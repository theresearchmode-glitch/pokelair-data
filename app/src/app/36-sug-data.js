// ---------- Suggestions: settings and words shared with the rebuild (R4, Nov 11) ----------
// Moved unchanged out of today's drawing and click code (34-events.js, 60-concept-h.js), so today's page and the rebuild
// change the same settings the same way and say the same words. Proof: experiments/same-sugctl.mjs.

// Suggest from: My box / Box + catch / Whole roster (kept in this browser, cc2.pool); returns the toast
const POOL_SAY = {box: 'Suggestions only use your box', boxfill: 'Your box first, then the best Pokémon to catch', all: 'Suggestions use the full roster'};
function setPool(v) { ui.pool = ['box', 'boxfill', 'all'].includes(v) ? v : 'boxfill'; LS.set('cc2.pool', ui.pool); return POOL_SAY[ui.pool]; }
// Megas on team: 0 / 1 / 2 (saved with the team's state, so it follows the account); returns the toast
function setMegaGoal(n) { S.megaGoal = Math.max(0, Math.min(2, +n || 0)); S.maxMega = Math.max(1, S.megaGoal); recCache = {key: null, val: null};
  return S.megaGoal ? `Teams aim for ${S.megaGoal} Mega${S.megaGoal > 1 ? 's' : ''}` : 'Teams without Megas: rare (about 1 in 100 tournament teams), and they win about a third of their games'; }
// the team checks card's words (moved from render(), 08-render-all.js)
const CK_TXT = {intro: 'What recent event winners usually have, measured live from the Events data. A missing check is a gap to know about, not a verdict: plenty of winning teams miss one, and play decides most games. A ~ means only partly there, and doesn\'t count as passed.',
  notes: 'Notes, not counted', notesWhy: 'In 38,513 real games, with player skill taken into account, teams with these won no more often.'};
// the problems list when nothing is wrong (moved from renderProblems, 09-quick-add.js)
const PROB_TXT = {clear: 'All clear', clearWhy: 'No type problems, and the team has speed control and support.'};
// " · " lists said in words (moved unchanged from rzDots, 70-riso2.js, R4 Nov 11; the rebuild's Suggestions use it on the same texts):
// a missing value ("— ·") in words, "who · what" in a list with ";" as "who with what", other dots as lead (", " or ": ") then ", "
function undotText(v, lead, list) { v = v.replace(/—\s*·\s*/g, 'no power, ');
  /* "Whimsicott · Tailwind; Basculegion · Aqua Jet": who with what */
  if (list) v = v.replace(/([A-Za-zé'’-]+(?: [A-Z][A-Za-zé'’-]+)*) · ([A-Z][A-Za-z'’ -]+?)(?=;|,|$| ·)/g, '$1 with $2'); if (/^\s*·\s*$/.test(v)) return lead;
  let first = true; return v.replace(/\s*·\s*/g, () => { const r = first ? lead : ', '; first = false; return r; }).replace(/^,\s*/, ', ').replace(/,\s*,/g, ',').replace(/:\s*,/g, ':'); }
// Swap my Mega? No / Yes: the hidden "Let plans swap my Mega" box the planner reads (#swapMega); returns the toast
function swapMegaSay(on) { return on ? 'Plans can now swap your Mega' : 'Your Mega is protected again'; }
function setSwapMega(on) { const sw = $('swapMega'); on = !!on; if (!sw || sw.checked === on) return null; sw.checked = on; return swapMegaSay(on); }

// the "?" explainers' words (moved unchanged from 46-onboarding.js, R4 Nov 11; today's tip() and the rebuild's "?" read them)
const TIPS = {
  readiness: ['Ready for the top threats', 'Of the 30 Pokémon that make top cut most often, how many your team is ready for: it Beats them or Handles them (Shaky and No answer don\'t count). For each one we run real damage calcs with your sets against the set most players run: a Pokémon of yours that moves first and OHKOs it, survives and OHKOs back, or walls it and 2HKOs it is a solid answer; Intimidate, Will-O-Wisp, Wide Guard or Taunt are partial answers. Support Pokémon (Trick Room, screens, Follow Me) are judged by answers to what they do: Taunt, screen breakers, Fake Out, spread attacks, KOing the setter. Beats it = 2+ solid answers, Handles it = 1, Shaky = partial only, No answer = none (one level lower if fewer than 3 of your six hold up against it, since you bring 4). It measures how many top threats your team has answers for. It is preparation, not a forecast: the player still decides the game.'],
  spread: ['Spread', 'How the 66 stat points are split across HP / Attack / Defense / Sp. Atk / Sp. Def / Speed (up to 32 each). We show the spread players use most for this Pokémon.'],
  /* Nov 2: the rating reads like a school grade; the scale, the rank and the "?" in plain words, no multipliers */
  rating: ['What a rating means', 'Ratings read like school grades: S 90+, A 80s, B 70s, C 60s, D 50s, F under 50. They come from real tournament results, mostly how often a Pokémon is on teams that make top cut and how often strong players pick it. “#20 of N” is its rank among the N Pokémon with tournament results. A “?” means few games so far, so treat it as an estimate.'],
  bars: ['What the bars mean', 'Each bar ranks this Pokémon among the Pokémon with tournament results: 94 means it beats 94% of them, so it is in the top 6%. The colours are the same grade bands as the rating.'],
  tiers: ['Tiers', 'Each tier is a grade band: S 90+, A 80s, B 70s, C 60s, D 50s, F under 50. The number is the rating; tap a Pokémon for its rank and the full breakdown.'],
  numbers: ['How to read our numbers', 'Numbers read like school grades. Pokémon ratings: S 90+, A 80s, B 70s, C 60s, D 50s, F under 50. Strength Score: how strong your team is altogether, out of 100 (its Pokémon, pairs and sets, its matchups against the top threats, and its own record with players\' skill taken out). A team that beats today\'s tournament teams half the time scores 80; 90+ Top tier, 80s Tournament ready, 70s Solid, 60s Needs work, under 60 Missing a basic. Matchups (ready for 25/30 top threats, shaky, no answer) also say what beats the team. Bars are a rank among all Pokémon (94 = better than 94% of them). A % always says what it is of: % of teams, % wins.'],
  checklist: ['Checklist', 'The things that helped real teams win: a Mega, no big shared weakness, weak spots spread out, readiness for the top threats, and items that work. Speed control, spread damage and lead support are shown as notes, not counted: in real games, teams with them won no more often. ~ means partly there and is not counted as passed.'],

};
/* the rating tip names the real count (it was a fixed "#20 of 313", Nov 4): read when the "?" opens, from the same rank as the sheet */
{ const base = TIPS.rating; Object.defineProperty(TIPS, 'rating', {configurable: true, enumerable: true, get() { let n = null; try { const k = lairRank(lairRows()[0].p); n = k && k.of; } catch (e) {}
  return n ? [base[0], base[1].replace(/N\b/g, String(n))] : [base[0], base[1].replace('“#20 of N” is its rank among the N Pokémon', '“#20 of …” is its rank among the Pokémon')]; }, set(v) { Object.defineProperty(TIPS, 'rating', {value: v, writable: true, configurable: true, enumerable: true}); }}); }
