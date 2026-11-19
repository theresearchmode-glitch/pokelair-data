// Checks names.mjs's one-spelling fold (Nov 18 data audit, finding 4): items, Abilities and moves typed in another case or with
// stray spaces get the site's list spelling, Mega Stones spelled oddly still pick the Mega, "No Item" means no item, and
// anything not on the lists is never guessed (kept as written and counted). Also checks update.mjs folds the sheets it shows
// (the split, Nov 18: the grade's input stays as typed; experiments/split-test.mjs checks that end to end).
// Exit 1 on failure. Run from the repo root: node experiments/canon-test.mjs
import fs from 'node:fs';
const N = await import('../names.mjs'), id = x => x;
const canonItem = N.canonItem || id, canonAbility = N.canonAbility || id, canonMove = N.canonMove || id, canonSet = N.canonSet || id, U = N.CANON_UNKNOWN || {i: new Map(), a: new Map(), mv: new Map()};
const {lkey, lmap} = N;
const fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
// moves (spellings seen on Limitless sheets)
ok(['protect', 'Protect ', ' Protect', 'PROTECT', 'Protect'].every(x => canonMove(x) === 'Protect'), 'Protect in any case or spacing becomes "Protect"');
ok(canonMove('fake out') === 'Fake Out' && canonMove('u-turn') === 'U-turn' && canonMove('Will-O-Wisp') === canonMove('will o wisp'), 'other moves fold to one spelling');
// Abilities and items
ok(canonAbility('intimidate') === 'Intimidate' && canonAbility('As One ') === canonAbility('As One'), 'Abilities fold to the list spelling');
ok(canonItem('focus sash') === 'Focus Sash' && canonItem('Zoom lens') === 'Zoom Lens' && canonItem('Sitrus Berry ') === 'Sitrus Berry', 'items fold to the list spelling');
ok(['No Item', 'No Held Item', 'none', 'm', 'F', ''].every(x => canonItem(x) === ''), '"No Item", "none" and a gender letter mean no item');
// the Mega Stones the old key() missed (14 sheets): case, hyphen, no space
ok(canonItem('raichunite y') === 'Raichunite Y' && canonItem('charizarditey') === 'Charizardite Y' && canonItem('Lucarionite-Z') === 'Lucarionite Z' && canonItem('GARCHOMPITE Z') === 'Garchompite Z', 'oddly spelled stones get the list spelling');
ok(lmap(lkey({name: 'Raichu', item: 'raichunite y'})) === 'Raichu-Mega-Y', `"raichunite y" makes Raichu its Mega Y (${lmap(lkey({name: 'Raichu', item: 'raichunite y'}))})`);
ok(lmap(lkey({name: 'Lucario', item: 'Lucarionite-Z'})) === 'Lucario-Mega-Z', `"Lucarionite-Z" makes Lucario its Mega Z (${lmap(lkey({name: 'Lucario', item: 'Lucarionite-Z'}))})`);
ok(lmap(lkey({name: 'Charizard', item: 'Charizardite Y '})) === 'Charizard-Mega-Y', 'a stone with a trailing space still picks the Mega');
// stone typos with a certain holder
ok(canonItem('Staraptorite') === 'Staraptite' && canonItem('Dragonitite') === 'Dragoninite' && canonItem('Golisopodite') === 'Golisopite' && canonItem('raichuite Y') === 'Raichunite Y', 'stone typos map to the real stone');
ok(lkey({name: 'Eternal Flower Floette', item: 'Floetitte'}) === 'Eternal Flower Floette|M', '"Floetitte" now reads as a Mega Stone');
ok(lkey({name: 'Porygon2', item: 'Eviolite'}) === 'Porygon2' && lkey({name: 'Porygon2', item: 'eviolite'}) === 'Porygon2', 'Eviolite is never a Mega Stone');
// never guessed: not on a list -> kept as written (trimmed) and counted
const before = (U.mv.get('Last Respect') || 0) + (U.a.get('Lighting Rod') || 0) + (U.i.get('Passcho Berry') || 0);
ok(canonMove('Last Respect') === 'Last Respect' && canonAbility('Lighting Rod') === 'Lighting Rod' && canonItem(' Passcho Berry') === 'Passcho Berry' && canonItem('Mega Stone') === 'Mega Stone', 'texts not on the lists are kept as written');
ok((U.mv.get('Last Respect') || 0) + (U.a.get('Lighting Rod') || 0) + (U.i.get('Passcho Berry') || 0) === before + 3, 'and counted for the report');
// a whole sheet entry
const s = canonSet({n: 'Kingambit', i: 'black glasses', a: 'defiant', mv: ['protect', 'Sucker Punch ', 'kowtow cleave', 'Swords Dance'], t: '', nt: 'Adamant'});
ok(JSON.stringify(s) === JSON.stringify({n: 'Kingambit', i: 'Black Glasses', a: 'Defiant', mv: ['Protect', 'Sucker Punch', 'Kowtow Cleave', 'Swords Dance'], t: '', nt: 'Adamant'}), 'canonSet folds a sheet entry and keeps the rest');
// update.mjs folds every sheet for what players see (the grade's features stay as typed: experiments/split-test.mjs runs the job)
const U2 = fs.readFileSync('update.mjs', 'utf8');
ok(/dk: \(p\.dk \|\| \[\]\)\.map\(canonSet\)/.test(U2) && /canonReport\('update'\)/.test(U2), 'update.mjs folds every sheet for the shown outputs, and reports what it kept as written');
console.log(`canon: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
