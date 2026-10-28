// Stress test: no win predictions anywhere in the UI (product rule, Oct 28). Loads several teams (empty, a strong six,
// an odd six, an illegal six), opens every page, expands every <details>, and searches all visible text and tooltips for
// win-chance / odds / Team Score wording. Win RATES from real games ("won 54% of games at events") are facts and allowed.
// Usage: node experiments/stress-nowin.mjs   (exit 1 on any hit)
import {openPage} from './stress-lib.mjs';
const VIEWS = ['home', 'build', 'auto', 'matchup', 'speed', 'calc', 'gauntlet', 'arch', 'coverage', 'types', 'ratings', 'meta', 'cores', 'top', 'events', 'sets', 'teams', 'box', 'battle', 'usage'];
const BAD = [/win(ning)? (chance|odds|probability)/i, /chance (of|to) win/i, /odds (of|to) win/i, /\b\d+% to win\b/i, /likely to win/i, /expected to win/i, /\bfavou?red\b/i, /Team Score/i, /predicted (win|result)/i, /\bwin model\b(?! isn't used)/i, /will (probably )?(win|lose)\b/i];
const TEAMS = {empty: [], strong: ['Incineroar', 'Rillaboom', 'Sneasler', 'Archaludon', 'Charizard-Mega-Y', 'Basculegion'], odd: ['Watchog', 'Vileplume', 'Wigglytuff', 'Dedenne', 'Sableye', 'Chimecho'],
  illegal: [{n: 'Garchomp', it: {doubles: 'Leftovers'}}, {n: 'Incineroar', it: {doubles: 'Leftovers'}}, 'Incineroar', 'Whimsicott', 'Kingambit', 'Sneasler']};
const {pg, ev, errs, close} = await openPage(); const hits = [];
for (const [tk, t] of Object.entries(TEAMS)) {
  await ev(`(()=>{S.slots=__arg.map(x=>typeof x==='string'?{n:x}:x);fixSlots();render();return 1})()`, t);
  for (const v of VIEWS) {
    const txt = await pg.evaluate(v => { const b = document.querySelector(`.sidenav [data-view="${v}"]`) || document.querySelector(`[data-view="${v}"]`); if (!b) return null; b.click();
      return new Promise(r => setTimeout(() => { document.querySelectorAll('details').forEach(d => d.open = true);
        const p = document.querySelector(`[data-pane="${v}"]`) || document.body; const tips = [...p.querySelectorAll('[title],[aria-label],[data-tip]')].map(e => (e.getAttribute('title') || '') + ' ' + (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('data-tip') || ''));
        r(p.innerText + '\n' + tips.join('\n') + '\n' + (document.getElementById('verdict') || {innerText: ''}).innerText); }, v === 'gauntlet' ? 2500 : 500)); }, v);
    if (txt == null) continue;
    for (const re of BAD) { const m = txt.match(new RegExp('.{0,60}' + re.source + '.{0,60}', 'i')); if (m) hits.push(`${tk}/${v}: ${m[0].replace(/\s+/g, ' ')}`); } } }
// tooltips/glossary shown by tip()
const gl = await ev(`typeof TIPS==='object'?JSON.stringify(TIPS):typeof GLOSS==='object'?JSON.stringify(GLOSS):''`);
for (const re of BAD) { const m = (gl || '').match(new RegExp('.{0,60}' + re.source + '.{0,60}', 'i')); if (m) hits.push('glossary: ' + m[0]); }
await close();
for (const h of [...new Set(hits)]) console.log('  HIT', h);
console.log(`page errors: ${errs.length} ${[...new Set(errs)].slice(0, 5).join(' | ')}`);
console.log(hits.length || errs.length ? `STRESS NO-WIN: ${new Set(hits).size} hits, ${errs.length} errors` : 'STRESS NO-WIN CLEAN'); process.exit(hits.length || errs.length ? 1 : 0);
