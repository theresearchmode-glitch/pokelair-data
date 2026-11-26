// ---------- Track record (Nov 1, Sim approved): how right have our ratings been? ----------
// meta/track (out/track.json from track.mjs): each recent event checked against the ratings saved BEFORE it was played.
// The history is short (snapshots started Oct 29), so the page says exactly how much it rests on, shows the numbers as
// "early" until there are enough events, and lists what appears when. It never claims more than the data supports.
/* track.mjs buckets the saved (internal) totals at 80 / 60 / 40; the labels show those cut points on the shown school
   scale (RS), so "Rated 90+" here means the same as 90+ everywhere else (Nov 2) */
/* player review 3h (Nov 17): the cut-offs come from the data when it says ("bands" in track.json: 80 / 70 / 60 = shown 90+, 80-89, 70-79,
   under 70, a tier each); data without it keeps the old 80 / 60 / 40, so the labels always match the numbers (trSetCut, called by cleanTrack) */
var TR_CUT = [80, 60, 40], TR_BANDS = [];
function trSetCut(c) { TR_CUT = c; TR_BANDS = [`${RS(c[0])}+`, `${RS(c[1])}–${RS(c[0]) - 1}`, `${RS(c[2])}–${RS(c[1]) - 1}`, `Under ${RS(c[2])}`]; }
trSetCut(TR_CUT);
const TR_MIN = {verdict: 10, misses: 5, weeks: 3};
// cleanTrack: moved to 05-data-clean.js (R4, Nov 11; shared with the rebuild)
const trPct = x => pctFmt(100 * x);
const trAdd = (d, n) => { const t = new Date(d + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const trWeek = d => { const t = new Date(d + 'T12:00:00Z'), w = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - w); return t.toISOString().slice(0, 10); };
// per band: the average share of top-8 teams each Pokémon in the band was on
function trRates(evs) { const a = [0, 0, 0, 0], s = [0, 0, 0, 0]; for (const e of evs) for (let b = 0; b < 4; b++) { a[b] += e.ap[b]; s[b] += e.bs[b] * e.teams; } return a.map((x, b) => s[b] ? x / s[b] : null); }
