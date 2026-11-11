// Behaviour tests, group D: Meta pages and the site shell (inventory docs/rebuild/inventory/D-meta-shell.md).
// One test per inventory entry, keyed by its ID, written from the player's side. Page-specific helpers live in
// adapters/<adapter>.D-meta-shell.mjs and are reached as ui.D.* (see that file for why they are not merged flat).
// Overlaps (de-duplication decided later): SHEET-01..07 = A-team PKMN-01, 02, 04, 05, 06, 07, 03; SETS-01..05 here = B-build
// SETS-02, 03, 04, 05, 06/07 (same IDs, different numbering!); ARCH-01 = B ARCH-03, ARCH-02 = B ARCH-04.
// Not tested (dead/retired, inventory section 15): RATE-10 = DEAD-05 (meta map), RATE-11 = DEAD-06 (sleepers), DEAD-07, DEAD-08,
// DEAD-09, DEAD-16. Judged intended, no separate test: BROKEN-01 (shell "Data as of" hidden; the per-page stamps of SHELL-03 are the
// visible ones), BROKEN-02 (page title hidden; each page names itself, NAV-07), BROKEN-03 (two theme controls: both tested in THEME-01/02
// and must agree), DUP-11 (tested once in TOP-05), ODD-14 (About's "← Meta", NAV-06), ODD-15, ODD-17, ODD-18 (content / unsure).
import {group, open, expect, TEAM, DOCS} from './harness.mjs';
const t = group('D-meta-shell');

const PHONE = {width: 390, height: 844};
const FIVE = TEAM.slice(0, 5);
/** run a test body on a freshly opened page and always close it. Shorter fixed waits than the kit's defaults (open 900 ms,
 *  page switch 350 ms) keep the group under ~12 minutes; tests wait for what they need to see instead. */
const run = (o, fn) => async () => { const r = await open({wait: 900, ...o}); r.d = r.ui.D; const go = r.ui.go; r.ui.go = (n, w = 350) => go(n, w);
  try { await fn(r); } finally { await r.close(); } };
/** temporarily swap shared data documents (the frozen fixture) for one test */
const withDocs = (patch, fn) => async () => { const old = {}; for (const k in patch) { old[k] = DOCS[k]; DOCS[k] = patch[k]; } try { await fn(); } finally { Object.assign(DOCS, old); } };
const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString();
const has = (s, m) => m instanceof RegExp ? m.test(s) : String(s).toLowerCase().includes(String(m).toLowerCase());
const META_PAGES = ['Ratings', 'Usage', 'Popular Sets', 'Winning Teams', 'Events', 'Archetypes'];
const MENU = ['Home', 'Build for Me', 'Build Around a Core', 'My Team', 'All Suggestions', 'Saved Teams', 'Compare Teams', 'My Box', 'Battle a Team',
  'Team Preview Practice', 'Test Run', 'Speed Tiers', 'Damage Calc', 'Type Chart', 'This Week', 'Pokémon Ratings', 'Usage', 'Popular Sets', 'Winning Teams',
  'Events', 'Archetypes', 'Track Record', 'How We Calculate', 'About & Legal'];

// =============================== NAV · navigation and routing ===============================
t('NAV-01', 'Desktop main tabs: five tabs, Meta lit on Meta pages, live x/6 count', run({team: FIVE}, async ({ui, d}) => {
  expect(JSON.stringify(await d.mainTabs()) === JSON.stringify(['Home', 'Build', 'My Team', 'Battle', 'Meta']), 'main tabs are ' + (await d.mainTabs()));
  for (const p of ['Ratings', 'Usage', 'Events', 'This Week', 'Track Record', 'How We Calculate']) { await ui.go(p); expect(await d.activeMainTab() === 'Meta', `${p}: lit tab is ${await d.activeMainTab()}`); }
  await ui.go('About'); expect(await d.activeMainTab() === null, 'About & Legal lights a main tab: ' + await d.activeMainTab());
  expect(await d.teamCount() === '5/6', 'count is ' + await d.teamCount());
  await ui.go('Ratings'); await d.openPokemon('Kingambit'); await d.tapInSheet(/^Add to team$/); await d.closeSheet();
  expect(await d.teamCount() === '6/6', 'count after adding is ' + await d.teamCount()); }));

t('NAV-02', 'Phone bottom bar: five tabs, stays put while scrolling, each opens its page', run({team: TEAM, ...PHONE}, async ({ui, d}) => {
  const b = await d.bottomBar(); expect(b, 'no bottom bar on a phone');
  expect(JSON.stringify(b.names.map(n => n.replace(/\s*\d\/6$/, ''))) === JSON.stringify(['Home', 'Build', 'My Team', 'Battle', 'Meta']), 'bottom bar: ' + b.names);
  await ui.go('Ratings'); await d.scrollTo(1500); const b2 = await d.bottomBar(); expect(b2 && Math.abs(b2.top - b.top) < 3, 'bar moved while scrolling');
  for (const [tab, pane] of [['Home', 'home'], ['Build', 'auto'], ['My Team', 'report'], ['Battle', 'matchup'], ['Meta', 'ratings']]) {
    await d.tapMainTab(tab); expect(await ui.current() === pane, `${tab} opened ${await ui.current()}`); expect(await d.activeMainTab() === tab, `${tab} not lit`); } }));
t('NAV-02b', 'Desktop has no bottom bar', run({team: TEAM}, async ({d}) => { expect(!(await d.bottomBar()), 'bottom bar shows on desktop'); }));

t('NAV-03', 'The ⋯ menu lists the 24 pages, marks the current one, traps focus, closes 4 ways', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Events'); await d.openMenu();
  const pages = await d.menuPages(); expect(JSON.stringify(pages) === JSON.stringify(MENU), 'menu pages: ' + pages.join(', '));
  expect(await d.menuCurrent() === 'Events', 'current page marked: ' + await d.menuCurrent());
  expect(await d.focusInMenu(), 'focus did not move into the menu');
  for (let i = 0; i < 30; i++) { await ui.pg.keyboard.press(i % 7 === 6 ? 'Shift+Tab' : 'Tab'); expect(await d.focusInMenu(), 'Tab left the menu after ' + (i + 1) + ' presses'); }
  await d.closeMenu('escape'); expect(!(await d.menuIsOpen()), 'Escape did not close'); expect(/More pages/i.test(await d.focusName()), 'focus not back on ⋯: ' + await d.focusName());
  await d.openMenu(); await d.closeMenu('back'); expect(!(await d.menuIsOpen()), 'Back did not close'); expect(await ui.current() === 'events', 'Back changed the page');
  await d.openMenu(); await d.closeMenu('x'); expect(!(await d.menuIsOpen()), '× did not close');
  await d.openMenu(); await d.closeMenu('backdrop'); expect(!(await d.menuIsOpen()), 'backdrop did not close');
  await d.openMenu(); await d.tapMenuPage('Track Record'); expect(!(await d.menuIsOpen()) && await ui.current() === 'track', 'choosing a page did not open it and close'); }));
t('NAV-03b', 'The ⋯ button looks "on" only on pages outside the five main tabs (About & Legal)', run({team: TEAM}, async ({ui, d}) => {
  // inventory said "a page that is not one of the five main tabs"; measured: pages under a tab (This Week → Meta) keep it off
  await ui.go('Ratings'); const a = await d.menuButtonOn(); await ui.go('This Week'); const b = await d.menuButtonOn(); await ui.go('About'); const c = await d.menuButtonOn();
  expect(!a && !b && c, `⋯ on-state: Ratings ${a}, This Week ${b}, About ${c}`); }));

t('NAV-04', 'Meta section switch Pokémon | Tournaments', run({team: TEAM}, async ({ui, d}) => {
  for (const [p, sel] of [['Ratings', 'Pokémon'], ['Usage', 'Pokémon'], ['Popular Sets', 'Pokémon'], ['Winning Teams', 'Tournaments'], ['Events', 'Tournaments'], ['Archetypes', 'Tournaments']]) {
    await ui.go(p); const s = await d.sectionSwitch(); expect(s && s.selected === sel, `${p}: switch ${JSON.stringify(s)}`); }
  await ui.go('Events'); await d.tapSection('Pokémon'); expect(await ui.current() === 'ratings', 'Pokémon opened ' + await ui.current());
  expect((await d.sectionSwitch()).selected === 'Pokémon', 'Pokémon not selected');
  await d.tapSection('Tournaments'); expect(await ui.current() === 'top', 'Tournaments opened ' + await ui.current());
  for (const p of ['This Week', 'Track Record', 'How We Calculate', 'About']) { await ui.go(p); expect(!(await d.sectionSwitch()), `${p} shows the section switch`); } }));

t('NAV-05', 'Second-level sliders Rating/Usage/Sets and Winning Teams/Events/Archetypes', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); let s = await d.pageSwitch(); expect(s && s.items.join() === 'Rating,Usage,Sets' && s.selected === 'Rating', 'Pokémon slider: ' + JSON.stringify(s));
  await d.tapPageSwitch('Usage'); expect(await ui.current() === 'meta' && (await d.pageSwitch()).selected === 'Usage', 'Usage not opened/selected');
  await d.tapPageSwitch('Sets'); expect(await ui.current() === 'sets' && (await d.pageSwitch()).selected === 'Sets', 'Sets not opened/selected');
  await ui.go('Winning Teams'); s = await d.pageSwitch(); expect(s && s.items.join() === 'Winning Teams,Events,Archetypes' && s.selected === 'Winning Teams', 'Tournaments slider: ' + JSON.stringify(s));
  await d.tapPageSwitch('Archetypes'); expect(await ui.current() === 'arch', 'Archetypes not opened'); await d.tapPageSwitch('Events'); expect(await ui.current() === 'events', 'Events not opened'); }));

t('NAV-05b', 'The slider tells screen readers the page that is shown (one choice marked)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.tapPageSwitch('Usage'); const s = await d.pageSwitch(); expect(s.announced.join() === 'Usage', 'marked as current for screen readers: ' + s.announced.join(', ')); }),
  {known: 'after switching with the slider, "Rating" keeps aria-selected="true" while "Usage" gets aria-pressed="true" (the visible pill is right; measured on Usage)'});
t('NAV-06', 'Back links on Meta sub-pages', run({team: TEAM}, async ({ui, d}) => {
  for (const [p, label] of [['This Week', '← Meta'], ['How We Calculate', '← Meta'], ['About', '← Meta'], ['Track Record', '← Pokémon Ratings']]) {
    await ui.go(p); expect(await d.backLink() === label, `${p}: back link "${await d.backLink()}"`); await d.tapBackLink(); expect(await ui.current() === 'ratings', `${p}: back opened ${await ui.current()}`); } }));

t('NAV-07', 'Each Meta page opens at its top, named, and marked in the menu', run({team: TEAM}, async ({ui, d}) => {
  const rows = [['This Week', 'weekly', 'This Week'], ['Pokémon Ratings', 'ratings', 'Pokémon'], ['Usage', 'meta', 'Usage'], ['Popular Sets', 'sets', 'Popular Sets'], ['Winning Teams', 'top', 'Winning Teams'],
    ['Events', 'events', 'Events'], ['Archetypes', 'arch', 'Archetypes'], ['Track Record', 'track', 'Track Record'], ['How We Calculate', 'method', 'How We Calculate'], ['About & Legal', 'about', 'About & Legal']];
  for (const [m, pane, name] of rows) { await d.scrollTo(900); await d.openMenu(); await d.tapMenuPage(m);
    expect(await ui.current() === pane, `${m} opened ${await ui.current()}`); expect(await d.scrollY() < 5, `${m} opened scrolled to ${await d.scrollY()}`);
    expect(has(await ui.text(), name), `${m}: page does not show its name "${name}"`);
    await d.openMenu(); expect(await d.menuCurrent() === m, `${m}: menu marks ${await d.menuCurrent()}`); await d.closeMenu('escape'); } }));

t('NAV-08', 'Back steps through pages to the same scroll place, closes the sheet first; no page in the address', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.scrollTo(700); const y = await d.scrollY(); await d.scrollTo(0); await d.tapPageSwitch('Usage'); await ui.go('Ratings'); await d.scrollTo(y);
  await ui.go('Events'); expect(await ui.current() === 'events', 'Events not open');
  await d.browserBack(); expect(await ui.current() === 'ratings', 'Back opened ' + await ui.current()); expect(Math.abs(await d.scrollY() - y) < 80, `Back landed at ${await d.scrollY()}, was ${y}`);
  expect(!/#/.test(await d.address()), 'page name in the address: ' + await d.address());
  await d.openPokemon('Incineroar'); await d.browserBack(); expect(!(await d.sheetIsOpen()), 'Back did not close the sheet'); expect(await ui.current() === 'ratings', 'Back left the page instead of closing the sheet');
  await d.openSearch('keys'); await d.browserBack(); expect(!(await d.searchIsOpen()), 'Back did not close search'); expect(await ui.current() === 'ratings', 'Back after search left the page');
  await d.openPokemon('Incineroar'); await d.closeSheet('x'); await d.browserBack(); expect(await ui.current() === 'usage' || await ui.current() === 'meta', '× did not remove the sheet\'s history step: Back went to ' + await ui.current()); }));

t('NAV-09', 'A new page opens at its top', run({team: TEAM}, async ({ui, d}) => {
  // the "Track Record →" link sits near the top of Ratings, so after scrolling down the player opens it from the menu
  await ui.go('Ratings'); await d.scrollToBottom(); expect(await d.scrollY() > 400, 'could not scroll Ratings');
  await d.openMenu(); await d.tapMenuPage('Track Record'); await ui.pg.waitForTimeout(600); expect(await ui.current() === 'track' && await d.scrollY() < 5, `Track Record opened at ${await d.scrollY()}`);
  await d.scrollToBottom(); await ui.go('Events'); await ui.pg.waitForTimeout(500); expect(await d.scrollY() < 5, 'Events opened at ' + await d.scrollY()); }));

t('NAV-10', 'Keyboard focus stays inside an open Pokémon sheet', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.focusPokemon('Incineroar'); await d.key('Enter'); expect(await d.sheetIsOpen(), 'Enter on a row did not open its sheet');
  for (let i = 0; i < 40; i++) { await ui.pg.keyboard.press(i % 9 === 8 ? 'Shift+Tab' : 'Tab'); expect(await d.sheetFocusInside(), 'focus left the sheet after ' + (i + 1) + ' Tabs'); } }));

t('NAV-11', 'Section colours: all Meta pages share one accent; Battle, Home, Build, My Team differ', run({team: TEAM}, async ({ui, d}) => {
  const acc = {}; for (const p of [...META_PAGES, 'This Week', 'Track Record', 'How We Calculate', 'About', 'Battle', 'Home', 'Build', 'My Team']) { await ui.go(p, 400); acc[p] = await d.accent(); }
  const meta = acc.Usage; expect(meta, 'no accent colour'); for (const p of [...META_PAGES, 'This Week', 'Track Record', 'How We Calculate', 'About']) expect(acc[p] === meta, `${p} accent ${acc[p]} ≠ Meta ${meta}`);
  const others = ['Battle', 'Home', 'Build', 'My Team'].map(p => acc[p]); expect(new Set([meta, ...others]).size === 5, 'section colours not distinct: ' + JSON.stringify(acc)); }));

t('BROKEN-04', 'Reload reopens the page you were on', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Events'); await ui.reload(); expect(await ui.current() === 'events', 'reload opened ' + await ui.current()); }),
  {known: 'the last page is saved (cc2.view) but never read; reload always opens Home. Sim to decide if Home-on-reload is intended'});

// =============================== JUMP · search ===============================
t('JUMP-01', 'Search opens from the header button, Ctrl+K (toggles) and "/" (not while typing)', run({team: TEAM}, async ({ui, d}) => {
  await d.openSearch('button'); expect(await d.searchIsOpen() && await d.searchHasFocus(), 'header button did not open search with the cursor in it'); await d.key('Escape');
  await d.openSearch('keys'); expect(await d.searchIsOpen() && await d.searchHasFocus(), 'Ctrl+K did not open search'); await d.openSearch('keys'); expect(!(await d.searchIsOpen()), 'Ctrl+K again did not close');
  await d.openSearch('slash'); expect(await d.searchIsOpen(), '"/" did not open search'); await d.key('Escape');
  await ui.go('Ratings'); await d.focusField('Find a Pokémon or type'); await d.typeKeys('/'); expect(!(await d.searchIsOpen()), '"/" opened search while typing');
  expect(await d.fieldValue('Find a Pokémon or type') === '/', 'the slash was not typed into the field');
  await d.focusField('Find a Pokémon or type'); await d.openSearch('keys'); expect(await d.searchIsOpen(), 'Ctrl+K did not open search while typing'); }));
t('JUMP-01b', 'Phone: the search is an icon button in the header', run({team: TEAM, ...PHONE}, async ({d}) => {
  const c = await d.headerControls(); expect(c.some(x => /Search/i.test(x)), 'no search button on a phone: ' + c);
  await d.openSearch('button'); expect(await d.searchIsOpen(), 'phone search button did not open search'); }));

t('JUMP-02', 'Empty search lists 14 tools, Home first, each with a description', run({team: TEAM}, async ({d}) => {
  await d.openSearch('keys'); const r = await d.searchResults();
  expect(r.length === 14, 'listed ' + r.length); expect(r[0].name === 'Home', 'first is ' + r[0].name); expect(r.every(x => x.sub && x.kind === 'Tool'), 'a tool row lacks a description or Tool label'); }));
t('JUMP-02b', 'Phone: the "Tool" label is hidden', run({team: TEAM, ...PHONE}, async ({d}) => {
  await d.openSearch('button'); const r = await d.searchResults(); expect(r.length && r.every(x => !x.kindShown), 'Tool label shows on a phone'); }));

t('JUMP-03', 'Typing finds Pokémon (with rating and types), saved teams, and says when nothing matches', run({team: TEAM, saved: [{name: 'Sun Tailwind', team: TEAM}]}, async ({d}) => {
  await d.openSearch('keys'); await d.search('garch'); let r = await d.searchResults();
  expect(r[0] && r[0].name === 'Garchomp', 'first result ' + (r[0] && r[0].name)); expect(/Rated \d+, #\d+ of \d+ with results, Dragon\/Ground/.test(r[0].sub), 'Garchomp row: ' + r[0].sub);
  expect(r.length <= 14, 'more than 14 results');
  await d.search('sun tail'); r = await d.searchResults(); const team = r.find(x => x.name === 'Sun Tailwind'); expect(team && has(team.text, 'Garchomp'), 'saved team not found with its six: ' + JSON.stringify(r));
  await d.search('incinéroar'); r = await d.searchResults(); expect(r[0] && r[0].name === 'Incineroar', 'search is not accent-insensitive: ' + (r[0] && r[0].name));
  await d.search('zzzq'); expect(has(await d.searchMessage(), 'Nothing matches'), 'no "Nothing matches" line'); }));

t('JUMP-04', 'Choosing results: arrows+Enter open a Pokémon sheet, a tool opens its page, a saved team loads, Esc and backdrop close', run({team: TEAM, saved: [{name: 'Rain Practice', team: OPP6()}]}, async ({ui, d}) => {
  await d.openSearch('keys'); await d.search('garchomp'); const r = await d.searchResults(); await d.key('ArrowDown');
  expect((await d.searchResults())[1].selected, 'ArrowDown did not move the highlight'); await d.key('Enter');
  expect(await ui.current() === 'ratings' && await d.sheetIsOpen(), 'Enter did not open Ratings with a sheet'); expect(await d.sheetName() === r[1].name, `sheet is ${await d.sheetName()}, expected ${r[1].name}`);
  await d.closeSheet('escape');
  await d.openSearch('keys'); await d.search('speed'); await d.tapSearchResult('Speed Tiers'); expect(await ui.current() === 'speed', 'Speed Tiers opened ' + await ui.current());
  await d.openSearch('keys'); await d.key('Escape'); expect(!(await d.searchIsOpen()), 'Escape did not close');
  await d.openSearch('button'); await d.key('Escape'); expect(/Search/i.test(await d.focusName()), 'focus not back on the search button: ' + await d.focusName());
  await d.openSearch('keys'); await d.closeSearchByBackdrop(); expect(!(await d.searchIsOpen()), 'backdrop did not close');
  await d.openSearch('keys'); await d.search('rain prac'); await d.tapSearchResult('Rain Practice');
  expect(await ui.current() === 'report', 'saved team did not open My Team'); expect(has(await d.toastText() || '', 'Opened'), 'no "Opened" toast: ' + await d.toastText());
  expect(JSON.stringify(await ui.team()) === JSON.stringify(OPP6()), 'saved team not loaded: ' + await ui.team()); }));

t('JUMP-05', 'Search finds the tools it lists (e.g. "speed" → Speed Tiers)', run({team: TEAM}, async ({d}) => {
  await d.openSearch('keys'); for (const [q, n] of [['speed', 'Speed Tiers'], ['popular', 'Popular Sets'], ['arche', 'Archetypes'], ['type chart', 'Type Chart'], ['my box', 'My Box'], ['events', 'Events']]) {
    await d.search(q); expect((await d.searchResults()).some(r => r.name === n), `"${q}" did not list ${n}`); } }));
t('BROKEN-10', 'Search finds every menu page, under its menu name', run({team: TEAM}, async ({d}) => {
  await d.openSearch('keys'); const miss = [];
  for (const m of MENU) { await d.search(m); if (!(await d.searchResults()).some(r => r.name.toLowerCase() === m.toLowerCase())) miss.push(m); }
  expect(!miss.length, 'not findable by its menu name: ' + miss.join(', ')); }),
  {known: 'search uses old names (Best additions, Battle Mode, Ratings, Meta rankings, Teams, Winning cores) and cannot find This Week, Track Record, How We Calculate, About & Legal, Team Preview Practice'});

// =============================== THEME ===============================
t('THEME-01', 'Day/night button switches to Dark, saves it, and agrees with the menu picker', run({team: TEAM}, async ({ui, d, ls}) => {
  expect(!(await d.looksDark()), 'starts dark'); expect(/Day mode is on/i.test(await d.themeButton()), 'label: ' + await d.themeButton());
  await d.tapThemeButton(); expect(await d.looksDark(), 'did not turn dark'); expect(/night mode is on|switch to day/i.test(await d.themeButton()), 'label after: ' + await d.themeButton());
  expect(await ls('cc2.theme') === 'dark', 'saved theme: ' + await ls('cc2.theme'));
  await d.openMenu(); const c = await d.themeChoices(); expect((c.find(x => x.on) || {}).name === 'Dark', 'menu picker disagrees: ' + JSON.stringify(c));
  await d.closeMenu('escape'); await d.tapThemeButton(); expect(!(await d.looksDark()), 'second tap did not go back to light'); }));
t('THEME-01b', 'A dark choice survives a reload', run({team: TEAM, mode: 'dark'}, async ({ui, d}) => {
  // the kit seeds the saved theme on every load (open({mode})), so this checks a saved "dark" is applied at load
  expect(await d.looksDark(), 'saved dark not applied'); await ui.reload(); expect(await d.looksDark(), 'dark lost on reload'); }));

t('THEME-02', 'Menu Auto / Light / Dark: Auto follows the device, Light and Dark override it', run({team: TEAM}, async ({d, ls}) => {
  await d.chooseTheme('Light'); await d.deviceDark(true); expect(!(await d.looksDark()), 'Light did not override a dark device');
  await d.chooseTheme('Dark'); await d.deviceDark(false); expect(await d.looksDark(), 'Dark did not override a light device');
  await d.chooseTheme('Auto'); expect(await ls('cc2.theme') === 'auto', 'Auto not saved: ' + await ls('cc2.theme'));
  await d.deviceDark(true); expect(await d.looksDark(), 'Auto did not follow the device to dark'); await d.deviceDark(false); expect(!(await d.looksDark()), 'Auto did not follow the device back to light'); }));

t('THEME-03', 'Share image has its own Light/Dark choice (see WEEK-02)', run({team: TEAM, mode: 'dark'}, async ({ui, d}) => {
  await ui.go('This Week'); await ui.tap('Share this week'); expect(await d.shareCard(), 'no share image');
  await d.tapInDialog(/^Light$/); await ui.pg.waitForTimeout(700); const light = await d.shareImageBrightness();
  await d.tapInDialog(/^Dark$/); await ui.pg.waitForTimeout(700); const dark = await d.shareImageBrightness();
  expect(light > dark + 0.15, `image brightness light ${light} vs dark ${dark}`); expect(await d.looksDark(), 'the site theme changed'); }));

// =============================== SHELL · global parts ===============================
t('SHELL-01', 'Tab title, icon and the slanted Unbounded headline font', run({team: TEAM}, async ({ui, d}) => {
  expect(await d.pageTitle() === 'NastyPlot', 'tab title: ' + await d.pageTitle()); expect(await d.hasFavicon(), 'no favicon');
  await ui.go('This Week'); const f = await d.headlineFont(); expect(/Unbounded/i.test(f.family) && /italic|oblique/.test(f.style), 'headline font: ' + JSON.stringify(f)); }));

t('SHELL-02', 'Header controls in order, nothing overflowing (desktop)', run({team: TEAM}, async ({d}) => {
  const c = await d.headerControls(); const want = ['Home', 'Build', 'My Team', 'Battle', 'Meta', 'Search', 'Day mode', 'More pages'];
  let i = 0; for (const x of c) if (i < want.length && has(x, want[i])) i++; expect(i === want.length, 'header controls: ' + c.join(' | '));
  expect(await d.logoShown(), 'no NastyPlot logo'); expect(await d.headerFits(), 'a header control is off screen'); }));
t('SHELL-02b', 'Header on a phone: logo, search, day/night, ⋯', run({team: TEAM, ...PHONE}, async ({ui, d}) => {
  const c = await d.headerControls(); const want = ['Search', 'mode', 'More pages']; let i = 0; for (const x of c) if (i < want.length && has(x, want[i])) i++;
  expect(i === 3, 'phone header: ' + c.join(' | ')); expect(await d.logoShown(), 'no logo'); expect(await d.headerFits(), 'header overflows'); expect(await ui.noSideScroll(), 'side scroll'); }));

t('SHELL-03', '"Data as of" dates show on the pages', run({team: TEAM}, async ({ui}) => {
  const D = /[A-Z][a-z]{2} \d{1,2}/;
  await ui.go('Ratings'); expect(new RegExp('data as of ' + D.source, 'i').test(await ui.text()), 'Ratings has no "data as of <date>"');
  await ui.go('Winning Teams'); expect(new RegExp('updated ' + D.source).test(await ui.text()), 'Winning Teams has no "updated <date>"');
  await ui.go('Events'); expect(new RegExp('checked ' + D.source).test(await ui.text()), 'Events calendar has no "checked <date>"');
  await ui.go('How We Calculate'); expect(/Updated (today|yesterday|[A-Z][a-z]{2} \d)/.test(await ui.text()), 'How We Calculate has no "Updated …"'); }));

t('SHELL-04', 'Stale data gets an amber note on Home and Meta pages only', withDocs({'meta/events': {...DOCS['meta/events'], updated: daysAgo(9)}}, run({team: TEAM}, async ({ui, d}) => {
  for (const p of ['Home', 'Ratings', 'Events', 'This Week']) { await ui.go(p); const n = await d.healthNote(); expect(n && /older than usual/i.test(n) && /Events, last updated [A-Z][a-z]{2} \d/.test(n), `${p}: note ${n}`); }
  for (const p of ['About', 'My Team', 'Battle']) { await ui.go(p); expect(!(await d.healthNote()), `${p} shows the stale-data note`); } })));
t('SHELL-04b', 'Fresh data: no stale-data note', run({team: TEAM}, async ({ui, d}) => { await ui.go('Ratings'); const n = await d.healthNote(); expect(!n || !/Events, last updated/.test(n), 'fresh events listed as stale: ' + n); }));

t('SHELL-05', 'A new regulation shows a calm banner with its start date and event count', withDocs({'meta/perf': {...(DOCS['meta/perf'] || {}), reg: {id: 'M-C', since: '2026-09-01', now: {id: 'M-D', since: '2026-11-08', events: 3, need: {events: 20}}}}}, run({team: TEAM}, async ({ui, d}) => {
  for (const p of ['Home', 'Ratings']) { await ui.go(p); const b = await d.regBanner(); expect(b && /New regulation \(Reg M-D\) started Nov 8, 2026/.test(b) && /3 Reg M-D events so far, switches at 20/.test(b), `${p}: banner ${b}`); }
  await ui.go('My Team'); expect(!(await d.regBanner()), 'banner shows on My Team'); })));

t('SHELL-06', 'Footer: tagline, disclaimer, sources and links into About', run({team: TEAM}, async ({ui, d}) => {
  const f = await d.footerText(); expect(has(f, 'Sharply raise your win rate.') && has(f, 'unofficial, fan-made'), 'footer: ' + f.slice(0, 200));
  await d.tapFooter('Sources and credits'); const f2 = await d.footerText();
  for (const s of ['Limitless', 'Victory Road', 'VR Pastes', 'Liquipedia', 'Pokémon Showdown', 'Smogon', 'op.gg', 'Pikalytics', 'Showdown Tier']) expect(has(f2, s), 'sources list lacks ' + s);
  await d.tapFooter(/^Privacy$/); expect(await ui.current() === 'about', 'Privacy opened ' + await ui.current());
  expect(await d.foldIsOpen('Privacy'), 'Privacy section not open'); expect(await d.inView('Privacy'), 'Privacy section not scrolled into view'); }));

t('SHELL-07', 'Toast with Undo after loading a team; Undo brings your team back', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Winning Teams'); await ui.tap(/^Load team$/); await ui.tap(/^Replace$/);
  const tx = await d.until(() => d.toastText()); expect(tx, 'no toast'); expect(await d.toastHasUndo(), 'toast has no Undo');
  expect(JSON.stringify(await ui.team()) !== JSON.stringify(TEAM), 'team was not replaced');
  await d.tapUndo(); expect(JSON.stringify(await ui.team()) === JSON.stringify(TEAM), 'Undo did not restore: ' + await ui.team()); }));
t('SHELL-07b', 'A plain toast goes after about 2 s; an Undo toast stays about 6 s', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Winning Teams'); await ui.tap(/^Practice against$/); // a plain toast ("Opponent set: ...")
  expect(await d.toastText(), 'no toast'); expect(!(await d.toastHasUndo()), 'plain toast has Undo'); await ui.pg.waitForTimeout(3000); expect(!(await d.toastText()), 'plain toast still showing after 3 s');
  await ui.go('Winning Teams'); await ui.tap(/^Load team$/); await ui.tap(/^Replace$/); await ui.pg.waitForTimeout(3500);
  expect(await d.toastText(), 'Undo toast gone before 3.5 s'); await ui.pg.waitForTimeout(3500); expect(!(await d.toastText()), 'Undo toast still showing after 7 s'); }));

t('SHELL-08', 'Undo bar steps back through applied suggestions (My Team pages)', run({team: FIVE}, async ({ui, d}) => {
  // overlap: A-team (undo bar after Apply) and B-build cover the same bar; this is the shared component
  await ui.go('My Team', 2500); const before = await ui.team();
  await d.applySuggestion(); const one = await ui.team(); await d.applySuggestion(); const two = await ui.team();
  expect(JSON.stringify(one) !== JSON.stringify(before) && JSON.stringify(two) !== JSON.stringify(one), 'applying did not change the team');
  expect(has(await ui.text(), 'Applied') && has(await ui.text(), 'Undo'), 'no "Applied … Undo" bar');
  await d.tapUndoBar(); await d.tapUndoBar(); expect(JSON.stringify(await ui.team()) === JSON.stringify(before), 'two Undos did not restore: ' + await ui.team()); }));

t('SHELL-09', '"?" tips: one at a time, link to How We Calculate, close on scroll / Escape / second tap', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openTip('numbers|rating'); const tx = await d.tipText(); expect(tx && tx.length > 30, 'tip did not open');
  expect(await d.tipHasPicture(), 'no small picture on the tip');
  await d.openTip('numbers|rating'); expect(!(await d.tipText()), 'second tap did not close');
  await d.openTip('numbers|rating'); await d.key('Escape'); expect(!(await d.tipText()), 'Escape did not close');
  await d.openTip('numbers|rating'); await ui.pg.mouse.wheel(0, 300); await ui.pg.waitForTimeout(400); expect(!(await d.tipText()), 'scrolling did not close');
  await d.scrollTo(0); await d.openTip('numbers'); await d.toggleFold('Every Pokémon, by Tier'); await d.openTip('tiers'); expect(await d.tipCount() === 1 && /tier/i.test(await d.tipText()), 'two tips open at once, or the second did not open');
  await d.scrollTo(0); await d.openTip('numbers'); expect(has(await d.tipText(), 'How We Calculate'), 'numbers tip has no How We Calculate link');
  await d.tapInTip('How We Calculate'); expect(await ui.current() === 'method', 'tip link opened ' + await ui.current()); }));

t('SHELL-10', 'The × in a search box empties it and brings the full list back', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); expect(!(await d.clearShown('Find a Pokémon or type')), '× shows on an empty box');
  await d.ratingsSearch('fire'); expect(await d.clearShown('Find a Pokémon or type'), 'no × with text'); const n = await d.matchCount();
  await d.clearField('Find a Pokémon or type'); expect(await d.fieldValue('Find a Pokémon or type') === '', 'box not emptied');
  expect(await d.focusedPlaceholder() === 'Find a Pokémon or type', 'focus left the box'); expect((await d.topList()).length >= 16, 'full list did not return');
  await ui.go('Usage'); await d.usageSearch('gar'); await d.clearField('Find a Pokémon'); expect((await d.usageRows()).length === 10, 'Usage list did not return'); }));

t('SHELL-11', 'Long paragraphs fold to More / Less', run({team: TEAM}, async ({d}) => {
  expect((await d.moreButtons('footer')).includes('More'), 'footer disclaimer has no More'); const before = await d.footerText();
  expect(!has(before, 'Nintendo'), 'full text shows before More'); await d.tapMore('footer'); expect(has(await d.footerText(), 'Nintendo'), 'More did not show the rest');
  expect((await d.moreButtons('footer')).includes('Less'), 'button did not become Less'); await d.tapMore('footer', 'Less'); expect(!has(await d.footerText(), 'Nintendo'), 'Less did not fold it'); }));

t('SHELL-12', 'Text style: Title Case page names, commas not dots in lists, "Mega X" naming', run({team: TEAM}, async ({ui, d}) => {
  const small = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'at', 'by', '&']);
  await d.openMenu(); for (const n of await d.menuPages()) for (const w of n.split(' ').slice(1)) expect(small.has(w) || /^[A-ZÉ]/.test(w), `menu name not Title Case: ${n}`); await d.closeMenu('escape');
  await ui.go('Ratings'); await d.openPokemon('Incineroar'); await d.tapSheetTab('Info'); const s = await d.sheetPanel();
  expect(/Fake Out, /.test(s) && !/Fake Out · /.test(s), 'move list not comma separated'); await d.closeSheet();
  for (const p of ['Ratings', 'Usage', 'Winning Teams', 'This Week']) { await ui.go(p); expect(!/\bM-(?!C\b|D\b|\d)[A-Z][a-z]+/.test(await ui.text()), `${p} uses "M-X" naming`); } }));

t('SHELL-13', 'Sliding pickers: one choice at a time, the list follows (Usage source)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Usage'); let s = await d.usageSources(); expect(s.map(x => x.name).join() === 'Ranked ladder,Online tournaments,Showdown ladder' && s[0].on, 'sources: ' + JSON.stringify(s));
  const line = await d.usageSourceLine(); await d.chooseUsageSource('Online tournaments'); s = await d.usageSources();
  expect(s.filter(x => x.on).map(x => x.name).join() === 'Online tournaments', 'selection: ' + JSON.stringify(s)); expect(await d.usageSourceLine() !== line, 'list did not change source');
  expect(await d.sliderMoved('Online tournaments'), 'the slider highlight did not move to the choice'); }));

t('SHELL-14', 'Folds remember open/closed across a reload', run({team: TEAM}, async ({ui, d, ls}) => {
  await ui.go('Ratings'); expect(await d.foldIsOpen('About the Ratings') === false, 'About the Ratings starts open');
  await d.toggleFold('About the Ratings'); expect(await d.foldIsOpen('About the Ratings'), 'did not open');
  await ui.reload(); await ui.go('Ratings'); expect(await d.foldIsOpen('About the Ratings'), 'not remembered after reload');
  await d.toggleFold('About the Ratings'); await ui.reload(); await ui.go('Ratings'); expect(await d.foldIsOpen('About the Ratings') === false, 'closing not remembered'); }));

t('SHELL-15', '"Details" shows the sample sizes behind the top list', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); expect(!/\d games/.test(await d.hotText()), 'games show before Details'); await d.tapDetails();
  expect(/% wins/.test(await d.hotText()) && /\d(\.\d)?k? games/.test(await d.hotText()), 'Details did not show wins and games'); expect(await d.detailsLabel() === 'Hide details', 'label: ' + await d.detailsLabel());
  await d.tapDetails(); expect(!/\d games/.test(await d.hotText()), 'Hide details did not hide them'); }));

t('SHELL-16', 'A rarely used Pokémon shows "Early read"', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); if (!(await d.foldIsOpen('Every Pokémon, by Tier'))) await d.toggleFold('Every Pokémon, by Tier');
  await d.showWholeBoard(); const est = (await d.boardTiles()).find(x => x.est); expect(est, 'no tile marked as an estimate on the board');
  await d.openPokemon(est.id); expect(has(await d.sheetText(), 'Early read'), `${est.name}'s sheet does not say "Early read"`); }),
  {known: 'the sheet builds "Early read" inside its rating cell, which a later module hides (the ring shows the number instead), so players never see it (measured at 1280 and 390)'});

t('SHELL-17', 'First visit: the welcome card shows on Home; "Got it" removes it for good', run({fresh: true}, async ({ui, d, ls}) => {
  await ui.go('Home'); const w = await d.welcomeCard(); expect(w, 'no welcome card for a first-time visitor');
  for (const x of ['How NastyPlot works', 'Get a team', 'Read your scouting report', 'Plan each match', 'Build me a team', 'Copy a top team', 'Got it']) expect(has(w, x), 'welcome card lacks ' + x);
  await ui.tap(/^Got it$/); expect(!(await d.welcomeCard()), '"Got it" did not remove the card'); expect(await ls('cc2.welcomed'), 'not marked welcomed');
  await ui.reload(); await ui.go('Home'); expect(!(await d.welcomeCard()), 'card came back after reload'); }));
t('SHELL-17b', 'Welcome card "Copy a top team" opens Winning Teams', run({fresh: true}, async ({ui, d}) => {
  await ui.go('Home'); await ui.tap(/^Copy a top team$/); expect(await ui.current() === 'top', 'opened ' + await ui.current()); }));
t('SHELL-17c', 'Returning visitors never see the welcome card', run({team: TEAM}, async ({ui, d}) => { await ui.go('Home'); expect(!(await d.welcomeCard()), 'welcome card shown to a returning visitor'); }));

t('SHELL-18', 'What\'s new shows once after an update, stays for the visit, × dismisses it', run({team: TEAM, stored: {'cc2.seenNew': '"2026-01-01"'}}, async ({ui, d}) => {
  await ui.go('Home'); expect(await d.whatsNew(), 'no What\'s new card for a returning visitor after an update');
  await ui.reload(); await ui.go('Home'); expect(await d.whatsNew(), 'card gone after a reload in the same visit');
  await d.dismissWhatsNew(); expect(!(await d.whatsNew()), '× did not dismiss'); }));
t('SHELL-18b', 'First-time visitors never see What\'s new', run({fresh: true}, async ({ui, d}) => { await ui.go('Home'); expect(!(await d.whatsNew()), 'What\'s new shown on a first visit'); }));

t('SHELL-19', 'First visit starts with the real sample team and a note', run({fresh: true}, async ({ui, d}) => {
  const want = ['Charizard-Mega-Y', 'Whimsicott', 'Basculegion', 'Kingambit', 'Garchomp', 'Sneasler'];
  expect(JSON.stringify((await ui.team()).slice().sort()) === JSON.stringify(want.slice().sort()), 'sample team: ' + await ui.team());
  await ui.go('My Team'); const tx = await ui.text(); expect(has(tx, 'This is a sample team'), 'no sample note'); expect(has(tx, 'Build your own') && has(tx, 'Import a team'), 'sample note lacks its two buttons');
  await ui.go('Saved Teams'); expect(has(await ui.text(), 'Sun Tailwind (sample)'), 'sample not in Saved Teams'); }));

t('SHELL-20', 'Feedback: anonymous, no name/email fields, too-short check, sent with personal details removed', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Usage'); await d.openFeedback(); const dl = await d.dialogText(); expect(dl, 'no feedback dialog');
  expect(has(dl, 'Usage') && has(dl, 'We see the page'), 'dialog does not name the page: ' + dl.slice(0, 160)); expect(/anonymous/i.test(dl), 'not marked anonymous');
  for (const k of ['Something broke', 'Confusing', 'Idea', 'I like this', 'Wrong info']) expect(has(dl, k), 'kind missing: ' + k);
  const f = await d.dialogFields(); expect(f.length === 1 && /textarea/i.test(f[0].type), 'feedback asks for more than a message: ' + JSON.stringify(f));
  expect(!f.some(x => /name|e-?mail/i.test(x.ph + x.label)), 'feedback asks for a name or email');
  await d.typeFeedback('ok'); await d.tapInDialog(/^Send$/); expect(has(await d.dialogText() || '', 'Write a few words first'), 'no too-short message');
  await d.typeFeedback('The usage list is great, write me at me' + String.fromCharCode(64) + 'example.com please'); await d.tapInDialog(/^Send$/);
  const tx = await d.until(() => d.toastText()); expect(has(tx || '', 'Thanks! Feedback sent.') && has(tx, 'Personal details were removed'), 'toast: ' + tx);
  expect(!(await d.dialogText()), 'dialog stayed open'); const saved = JSON.stringify(await d.savedFeedback());
  expect(saved && has(saved, 'usage list is great') && !saved.includes(String.fromCharCode(64)), 'saved feedback: ' + saved); }));
t('SHELL-20b', '"Report a mistake" on a sheet sends what was on screen', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openPokemon('Incineroar'); await d.tapInSheet(/^Report a mistake$/); const dl = await d.dialogText();
  expect(dl && has(dl, 'Report a mistake') && has(dl, 'Incineroar'), 'mistake dialog: ' + (dl || '').slice(0, 200)); await d.tapInDialog(/^Send$/);
  expect(has(await d.until(() => d.toastText()) || '', 'Thanks! Mistake reported.'), 'toast: ' + await d.toastText()); }));
t('SHELL-20c', 'Viewers who cannot save see no feedback buttons', run({team: TEAM, account: false}, async ({ui, d}) => {
  expect(!has(await d.footerText(), 'Send feedback'), 'Send feedback shows'); await ui.go('Ratings'); await d.openPokemon('Incineroar');
  expect(!has(await d.sheetText(), 'Report a mistake'), 'Report a mistake shows'); }));

t('SHELL-21', 'Owner-only panels on Home: feedback and what people use', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Home'); const tx = await ui.text(); expect(has(tx, 'Feedback') && has(tx, 'only you see this') && has(tx, 'What people use'), 'owner panels missing');
  await d.toggleFold('What people use'); const u = await d.until(async () => { const x = await d.foldText('What people use'); return x && !/Loading/.test(x) ? x : null; });
  expect(u && (/No visits counted yet/.test(u) || /people/i.test(u)), 'usage panel: ' + u); }));
t('SHELL-21b', 'Owner panels are absent for a viewer without an account', run({team: TEAM, account: false}, async ({ui}) => {
  await ui.go('Home'); expect(!has(await ui.text(), 'only you see this'), 'owner panel visible'); }));

t('SHELL-22', 'Page visits are counted anonymously (saved when the tab is left)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await ui.go('Events'); await d.leaveTab(); const u = JSON.stringify(await d.savedUsage() || {});
  expect(has(u, 'view:ratings') && has(u, 'view:events'), 'visits not counted: ' + u.slice(0, 300)); expect(!/u_test/.test(u.replace(/"usage\/u_test"/, '')), 'usage record carries the viewer id inside'); }));

t('SHELL-23', 'Saved Teams says where teams are saved (account vs this browser)', run({team: TEAM}, async ({ui}) => {
  await ui.go('Saved Teams'); expect(has(await ui.text(), 'Saved to your Claude account'), 'no account note'); }));
t('SHELL-23b', 'Without an account: "Saved in this browser only"', run({team: TEAM, account: false}, async ({ui}) => {
  await ui.go('Saved Teams'); expect(has(await ui.text(), 'Saved in this browser only'), 'no browser-only note'); }));
t('SHELL-23c', 'A change on another device arrives live with a toast', async () => {}, {skip: 'needs a second device pushing a live change; the fake account fires its snapshot once (kit change needed: a push helper)'});

t('SHELL-24', 'Shared team link: banner, Not now keeps your team and clears the address; Load it loads', async () => {
  const a = await open({team: OPP6()}); const code = await a.ui.D.teamLinkCode(); await a.close(); expect(code, 'could not make a team link');
  let r = await open({team: TEAM, hash: '#team=' + code}); try { const d = r.ui.D; const b = await d.until(() => d.sharedBanner()); expect(b, 'no shared-team banner');
    expect(JSON.stringify(await r.ui.team()) === JSON.stringify(TEAM), 'team applied silently'); await r.ui.tap(/^Not now$/);
    expect(!(await d.sharedBanner()), 'banner did not close'); expect(JSON.stringify(await r.ui.team()) === JSON.stringify(TEAM), 'team changed'); expect(!/team=/.test(await d.address()), 'code left in the address'); } finally { await r.close(); }
  r = await open({team: TEAM, hash: '#team=' + code}); try { const d = r.ui.D; await d.until(() => d.sharedBanner()); await r.ui.tap(/^Load it$/);
    expect(JSON.stringify(await r.ui.team()) === JSON.stringify(OPP6()), 'Load it did not load: ' + await r.ui.team()); expect(await r.ui.current() === 'report', 'did not open My Team');
    expect(has(await d.toastText() || '', 'Loaded'), 'no Loaded toast'); expect(await d.toastHasUndo(), 'no Undo on the toast'); } finally { await r.close(); } });

t('SHELL-25', 'Box link opens My Box with the link pasted and Add / Replace ready', async () => {
  const a = await open({team: TEAM, box: ['Absol', 'Kingambit', 'Azumarill']}); const code = await a.ui.D.boxLinkCode(); await a.close(); expect(code, 'could not make a box link');
  const r = await open({team: TEAM, hash: '#box=' + code}); try { await r.ui.D.until(async () => await r.ui.current() === 'box');
    expect(await r.ui.current() === 'box', 'box link opened ' + await r.ui.current()); const tx = await r.ui.text();
    expect(has(tx, 'A box link with 3 Pokémon'), 'no box link message'); expect(/\bAdd\b/.test(tx) && /\bReplace\b/.test(tx), 'Add / Replace missing');
    expect(JSON.stringify(await r.ui.box()) === '[]', 'box changed before choosing'); } finally { await r.close(); } });

t('SHELL-26', 'Copy for Showdown gives six Showdown blocks at Level 50', run({team: TEAM}, async ({ui, d}) => {
  await d.allowClipboard(); await ui.go('Winning Teams'); await ui.tap(/^Copy for Showdown$/); const txt = await d.until(() => d.showdownText());
  expect(txt, 'nothing copied and no copy dialog'); expect((txt.match(/Level: 50/g) || []).length === 6, 'blocks with Level: 50: ' + (txt.match(/Level: 50/g) || []).length);
  expect(/@ .*Charizardite|@ /.test(txt), 'no items in the paste'); expect(has(await d.toastText() || '', 'Copied') || await d.dialogText(), 'no "Copied" toast or dialog'); }));

t('SHELL-27', 'Share card: tall image, Light/Dark, Save image downloads a PNG', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('This Week'); await ui.tap('Share this week'); const c = await d.until(() => d.shareCard()); expect(c && c.h > c.w, 'share image: ' + JSON.stringify(c));
  expect(has(c.text, 'Light') && has(c.text, 'Dark') && has(c.text, 'Save image'), 'dialog lacks the picker or Save image');
  const name = await d.saveShareImage(); expect(/This week in Reg M-C - NastyPlot\.png/.test(name || ''), 'download name: ' + name);
  await d.closeDialog(); expect(!(await d.shareCard()), 'Escape did not close'); }));

t('SHELL-28', 'Darkrai on empty screens and tips, never beside ratings', run({team: TEAM, account: false}, async ({ui, d}) => {
  await ui.go('Events'); expect(has(await ui.text(), 'Tournament results appear here after the next data refresh.'), 'no empty note on Events');
  expect(await d.mascotShown(), 'no Darkrai on the empty Events note');
  await ui.go('Ratings'); expect(!(await d.mascotShown()), 'Darkrai shown on Ratings'); await d.openPokemon('Incineroar'); expect(!(await d.mascotShown('#lairSheet')), 'Darkrai on a rating sheet'); }));

t('SHELL-29', 'With no live data the pages still work from the built-in snapshot', run({team: TEAM, account: false}, async ({ui, d}) => {
  await ui.go('Ratings'); expect((await d.topList()).length >= 16, 'Ratings empty without live data'); expect(/data as of [A-Z][a-z]{2} \d/.test(await ui.text()), 'no data date');
  await ui.go('Usage'); expect(/No meta data loaded yet|Plotting/.test(await ui.text()), 'Usage has no loading/no-data line'); }));

t('SHELL-30', 'A fast double tap on "Add to team" adds once', run({team: ['Garchomp', 'Incineroar', 'Whimsicott']}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openPokemon('Kingambit'); await d.doubleTapInSheet(/^Add to team$/);
  expect((await ui.team()).length === 4, 'team now ' + await ui.team()); expect(!/already on your team/i.test(await d.toastText() || ''), 'second tap was not ignored: ' + await d.toastText()); }));

t('SHELL-31', 'Keep your place: a tapped filter chip stays under the finger', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openFilter(); const y0 = await d.chipTop('Fire'); await d.tapFilterChip('Fire'); const y1 = await d.chipTop('Fire');
  expect(Math.abs(y1 - y0) < 6, `chip moved from ${y0} to ${y1}`); }));

t('SHELL-32', 'Reduced motion: no page fade and no shimmering S cards', run({team: TEAM}, async ({ui, d}) => {
  await d.reduceMotion(); await ui.go('Events', 0); const a = await d.runningAnimations(); await ui.go('Ratings', 50); const b = await d.runningAnimations();
  expect(!a.length && !b.length, 'animations with reduced motion: ' + JSON.stringify([...a, ...b])); }));
t('SHELL-32b', 'Without reduced motion the page fades in on switch', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Events', 0); expect((await d.runningAnimations()).length > 0, 'no page fade on switch (so SHELL-32 could not fail)'); }));

t('SHELL-33', 'Every Pokémon on Ratings stands on its own colour field; Megas get the Mega contour', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); const art = await d.pokemonArt(); expect(art.length >= 16, 'few Pokémon');
  expect(art.every(x => x.sprite), 'a Pokémon has no sprite: ' + JSON.stringify(art.find(x => !x.sprite))); expect(art.every(x => x.field), 'a Pokémon has no colour field');
  const zard = art.find(x => x.id === 'Charizard-Mega-Y'); expect(zard && zard.mega, 'Mega Charizard Y has no Mega mark'); expect(!art.find(x => x.id === 'Incineroar').mega, 'non-Mega marked Mega'); }));

t('SHELL-34', 'Broken data for one page never breaks the others', withDocs({'meta/weekly': {v: 'x', a: 7, b: null, up: 'nope', top: {}}}, run({team: TEAM}, async ({ui, errs}) => {
  await ui.go('This Week'); expect(has(await ui.text(), "This week's changes appear after the next data refresh."), 'This Week has no empty note: ' + (await ui.text()).slice(0, 200));
  await ui.go('Ratings'); expect(has(await ui.text(), 'Sneasler'), 'Ratings broke'); expect(!errs.length, 'page errors: ' + errs.join(' | ')); })));

// =============================== RATE · Ratings ===============================
t('RATE-01', 'Ratings head: kicker with team count and date; "How ratings work →" opens the method section', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); expect(/Rated 0–100 from real results: Reg M.C doubles, [\d,]+ teams, data as of [A-Z][a-z]{2} \d/.test(await ui.text()), 'kicker missing');
  expect(has(await ui.text(), 'Track Record →'), 'no Track Record link');
  await ui.tap(/^How ratings work →$/); await ui.pg.waitForTimeout(500); expect(await ui.current() === 'method', 'link opened ' + await ui.current());
  expect(await d.foldIsOpen('Pokémon Ratings'), 'Pokémon Ratings section not open'); expect(await d.inView('Pokémon Ratings'), 'section not scrolled into view'); }));

t('RATE-02', 'Ratings search by name or type, with a match count', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.ratingsSearch('chomp'); const c = await d.matchCount(); const tiles = await d.boardTiles();
  expect(c && c.n === tiles.length && c.n >= 2, `count ${JSON.stringify(c)} vs ${tiles.length} tiles`); expect(tiles.every(x => /garchomp/i.test(x.name + x.id)), 'non-matching tile: ' + tiles.map(x => x.name));
  expect(!(await d.topList()).length, 'top list still shows while searching');
  await d.ratingsSearch('fire'); const f = await d.boardTiles(); expect(f.length > 10 && f.some(x => x.id === 'Incineroar') && !f.some(x => x.id === 'Garchomp'), 'type search "fire" wrong: ' + f.length); }));

t('RATE-03', 'Filter: two types at most, flags, badge count, Clear', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openFilter(); await d.tapFilterChip('Fire'); await d.tapFilterChip('Flying');
  let ids = (await d.boardTiles()).map(x => x.id); expect(ids.includes('Charizard-Mega-Y') && !ids.includes('Incineroar') && !ids.includes('Garchomp'), 'Fire+Flying filter wrong: ' + ids.slice(0, 8));
  expect(/2/.test(await d.filterLabel()), 'badge: ' + await d.filterLabel());
  await d.tapFilterChip('Water'); const on = (await d.filterChips()).filter(x => x.on).map(x => x.name); expect(on.join() === 'Flying,Water' || on.join() === 'Water,Flying', 'third type did not replace the oldest: ' + on);
  await d.tapFilterChip('Clear').catch(async () => { await ui.tap(/^Clear$/); }); expect(!(await d.filterChips()).some(x => x.on), 'Clear left filters on'); expect((await d.topList()).length >= 16, 'list did not return');
  await d.openFilter(); await d.tapFilterChip('Megas'); ids = (await d.boardTiles()).map(x => x.id); expect(ids.length && ids.every(i => /-Mega/.test(i)), 'Megas flag shows non-Megas');
  await d.tapFilterChip('No Megas'); const ch = await d.filterChips(); expect(ch.find(x => x.name === 'No Megas').on && !ch.find(x => x.name === 'Megas').on, 'Megas/No Megas not exclusive');
  ids = (await d.boardTiles()).map(x => x.id); expect(ids.length && !ids.some(i => /-Mega/.test(i)), 'No Megas shows Megas'); }));

t('RATE-04', 'No matches: clear message and "0 of N match"; empty box message', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.ratingsSearch('zzzz'); expect(has(await ui.text(), 'No Pokémon match. Try clearing a filter.'), 'no no-match line'); expect((await d.matchCount() || {}).n === 0, 'count not 0');
  await d.ratingsSearch(''); await d.openFilter(); await d.tapFilterChip('In my box'); expect(has(await ui.text(), 'Your box is empty'), 'no empty-box message'); }));

t('RATE-05', 'Top of the ratings: #1 first, rows in rating order, 20 on desktop; a row opens its sheet', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); const l = await d.topList(); expect(l.length >= 20 && l.length <= 22, 'rows: ' + l.length);
  expect(l[0].rank === 1 || l[0].rank === null, 'first is not #1'); for (let i = 1; i < l.length; i++) expect(l[i].rating <= l[i - 1].rating, `out of order at ${l[i].name}`);
  const ranked = l.filter(x => x.rank); for (let i = 1; i < ranked.length; i++) expect(ranked[i].rank >= ranked[i - 1].rank, 'ranks not ascending');
  expect(has(await d.hotText(), 'S') && /90\+: \d+ Pokémon, ranked among \d+ with results/.test(await ui.text()), 'no S tier header');
  await d.openPokemon(l[3].id); expect(await d.sheetIsOpen() && await d.sheetName() === l[3].name, 'row opened ' + await d.sheetName()); }));
t('RATE-05b', 'Phone: the top list is shorter (16 rows)', run({team: TEAM, ...PHONE}, async ({ui, d}) => {
  await ui.go('Ratings'); const l = await d.topList(); expect(l.length >= 16 && l.length <= 18, 'phone rows: ' + l.length); expect(await ui.noSideScroll(), 'side scroll on phone'); }));

t('RATE-06', 'Details on the top list shows win % and games', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.tapDetails(); expect(/\d+(\.\d)?% wins/.test(await d.hotText()) && /games/.test(await d.hotText()), 'no win % / games'); }));

t('RATE-07', 'Every Pokémon, by Tier: six tier rows, "+N more" / "Show fewer", remembered', run({team: TEAM}, async ({ui, d, ls}) => {
  await ui.go('Ratings'); if (await d.foldIsOpen('Every Pokémon, by Tier')) await d.toggleFold('Every Pokémon, by Tier'); await d.toggleFold('Every Pokémon, by Tier');
  const rows = await d.boardRows(); expect(rows.map(r => r.tier).join() === 'S,A,B,C,D,F', 'tiers: ' + rows.map(r => r.tier));
  expect(/Top of the Format: \d+/.test(rows[0].head), 'S row head: ' + rows[0].head); const f = rows[5]; expect(/^\+\d+ more$/.test(f.more), 'F row has no "+N more": ' + f.more);
  await d.tapTierMore('F'); const f2 = (await d.boardRows())[5]; expect(f2.tiles > f.tiles && f2.more === 'Show fewer', 'F row did not expand: ' + JSON.stringify(f2));
  expect(await ls('cc2.chf.lairboard') == 1, 'open state not remembered'); }));

t('RATE-08', 'About the Ratings: track record line and four number cells', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.toggleFold('About the Ratings'); const tx = await d.foldText('About the Ratings');
  expect(/finished higher in \d+% of [\d,]+ head-to-head pairs/.test(tx), 'no track record sentence'); for (const x of ['Pokémon rated', 'in S tier', 'hidden gems']) expect(has(tx, x), 'missing cell ' + x);
  expect(/Doubles sources/i.test(tx), 'no sources list'); }));

t('RATE-09', 'Rating bands: tier letter matches the number everywhere on the board', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); if (!(await d.foldIsOpen('Every Pokémon, by Tier'))) await d.toggleFold('Every Pokémon, by Tier'); await d.showWholeBoard();
  const band = n => n >= 90 ? 'S' : n >= 80 ? 'A' : n >= 70 ? 'B' : n >= 60 ? 'C' : n >= 50 ? 'D' : 'F';
  const tiles = await d.boardTiles(); expect(tiles.length > 300, 'board has ' + tiles.length); const bad = tiles.filter(x => band(x.rating) !== x.tier);
  expect(!bad.length, 'wrong tier: ' + bad.slice(0, 5).map(x => `${x.name} ${x.rating} in ${x.tier}`)); }));

t('RULE-RATING-ONE-NUMBER', 'A Pokémon\'s rating is the same number on Ratings, its sheet, search and Popular Sets', run({team: TEAM}, async ({ui, d}) => {
  for (const [id, shown] of [['Incineroar', 'Incineroar'], ['Whimsicott', 'Whimsicott'], ['Charizard-Mega-Y', 'Mega Charizard Y']]) {
    await ui.go('Ratings'); const r = await d.ratingOnRatings(shown); await d.openPokemon(id); const s = await d.sheetRating(); const st = await d.sheetText(); await d.closeSheet();
    await d.openSearch('keys'); await d.search(shown); const j = +(((await d.searchResults()).find(x => x.name === shown) || {}).sub || '').replace(/^Rated (\d+).*/, '$1'); await d.key('Escape');
    await ui.go('Popular Sets'); await d.lookUpSets(shown); const p = await d.setsRating();
    expect(r && r === s && s === j && j === p, `${shown}: Ratings ${r}, sheet ${s}, search ${j}, Popular Sets ${p}`);
    expect(new RegExp(`\\b${s}\\b`).test(st) && /[SABCDF] tier/.test(st), `${shown}: sheet does not say "${s}" with an "X tier" label`); } }));

// =============================== SHEET · Pokémon info sheet (= A-team PKMN-*) ===============================
t('SHEET-01', 'Sheet opens from any Pokémon, closes with ✕ / backdrop / Escape / Back, focus returns (PKMN-01)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('This Week'); const id = await d.firstPokemon(); await d.openPokemon(id); expect(await d.sheetIsOpen(), 'This Week row did not open a sheet'); expect(await d.sheetFocusInside(), 'focus not moved into the sheet');
  await d.closeSheet('escape'); expect(!(await d.sheetIsOpen()), 'Escape did not close'); expect(await d.focusIsPokemon(id), 'focus not back on the row: ' + await d.focusName());
  for (const how of ['x', 'backdrop', 'back']) { await d.openPokemon(id); await d.closeSheet(how); expect(!(await d.sheetIsOpen()), how + ' did not close'); expect(await ui.current() === 'weekly', how + ' changed the page'); }
  for (const p of ['Track Record', 'Usage', 'Home']) { await ui.go(p); const x = await d.firstPokemon(); if (p !== 'Usage') { expect(x, p + ' has no tappable Pokémon'); await d.openPokemon(x); expect(await d.sheetIsOpen(), p + ': no sheet'); await d.closeSheet(); } } }));

t('SHEET-02', 'Sheet header: rating with tier and rank, types, % of teams, win rate and games (PKMN-02)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openPokemon('Incineroar'); const s = await d.sheetText();
  expect(/[SABCDF] tier, #\d+ of \d+ with results/.test(s), 'no tier/rank'); expect(has(s, 'Fire') && has(s, 'Dark'), 'no type chips');
  expect(/\d+(\.\d)?% of teams/.test(s) && /\d+(\.\d)?% win rate/.test(s) && /[\d,]+ games/.test(s), 'numbers missing: ' + s.slice(0, 200)); }));
t('SHEET-02b', 'Phone sheet fits the screen', run({team: TEAM, ...PHONE}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openPokemon('Incineroar'); expect(await d.sheetFits(), 'sheet wider than the phone'); }));

t('SHEET-03', 'Sheet tabs Info | Meta | Rating; the last tab is remembered (PKMN-04)', run({team: TEAM}, async ({ui, d, ls}) => {
  await ui.go('Ratings'); await d.openPokemon('Incineroar'); const tabs = await d.sheetTabs(); expect(tabs.map(x => x.name.split(' ')[0]).join() === 'Info,Meta,Rating', 'tabs: ' + tabs.map(x => x.name));
  await d.tapSheetTab('Rating'); await d.closeSheet(); await d.openPokemon('Garchomp'); expect((await d.sheetTabs()).find(x => x.on).name.startsWith('Rating'), 'opened on ' + JSON.stringify(await d.sheetTabs()));
  expect(await ls('cc2.lstab'), 'tab not saved on the device'); }));
t('SHEET-03b', 'First visit opens the sheet on Info', run({fresh: true}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openPokemon('Incineroar'); expect((await d.sheetTabs()).find(x => x.on).name.startsWith('Info'), 'first tab: ' + JSON.stringify(await d.sheetTabs())); }));
t('SHEET-03c', 'Sideways swipe moves to the next sheet tab', async () => {}, {skip: 'touch swipe gestures are not reliably simulated headless; check on iPhone'});

t('SHEET-04', 'Info tab: usual set, stats, abilities with share, weaknesses, speed builds (PKMN-05)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openPokemon('Incineroar'); await d.tapSheetTab('Info'); const s = await d.sheetPanel();
  expect(has(s, 'Usually') && has(s, 'Full set ›') && has(s, 'Base Stats'), 'usual set / stats missing'); expect(/Intimidate.*Most used, \d+%/.test(s), 'Intimidate share missing');
  expect(/2× weak[^A-Z]*Water.*Fighting.*Ground.*Rock/.test(s), 'weaknesses: ' + (s.match(/2× weak.{0,60}/) || [''])[0]);
  expect(has(s, 'Speed at Level 50') && /outspeeds \d+% of the top 30/.test(s) && has(s, 'Speed Tiers →'), 'speed builds missing');
  await d.tapInSheet(/^Full set ›$/); expect((await d.sheetTabs()).find(x => x.on).name.startsWith('Meta'), '"Full set" did not open the Meta tab'); }));

t('SHEET-05', 'Meta tab: typical set, move and item bars, "Brought with" partners open their sheet (PKMN-06)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openPokemon('Incineroar'); await d.tapSheetTab('Meta'); const s = await d.sheetPanel();
  expect(has(s, 'Typical Set') && /Fake Out \d+(\.\d)?%/.test(s), 'typical set / Fake Out bar missing'); expect(has(s, 'Brought with'), 'no Brought with');
  const p = await d.broughtWith(); expect(p.length >= 1 && p.length <= 4, 'partners: ' + p); await d.openPokemon(p[0]);
  expect(await d.sheetIsOpen() && await d.sheetName() !== 'Incineroar', 'partner did not open its sheet'); }));

t('SHEET-06', 'Rating tab: why it rates N, what the data says, other tier lists open a new tab (PKMN-07)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openPokemon('Incineroar'); const n = await d.sheetRating(); await d.tapSheetTab('Rating'); const s = await d.sheetPanel();
  expect(has(s, `Why It Rates ${n}`), 'no "Why It Rates ' + n + '"'); for (const b of ['Top-cut presence', 'Picked by strong players', 'Converts to top cut', 'Win rate']) expect(has(s, b), 'bar missing: ' + b);
  expect(has(s, 'What the Data Says') && has(s, 'Limitless'), 'no data rows'); expect(has(s, 'Other Tier Lists') && has(s, 'not counted'), 'no outside tier lists');
  expect(await d.outsideLinksNewTab(), 'outside tier list links do not open a new tab'); expect(has(s, 'How ratings work →') && has(s, 'Track Record →'), 'links missing'); }));

t('SHEET-07', 'Sheet actions: Add to team, Build around it, Popular Sets (PKMN-03)', run({team: FIVE}, async ({ui, d, acct}) => {
  await ui.go('Ratings'); await d.openPokemon('Kingambit'); await d.tapInSheet(/^Add to team$/);
  expect(has(await d.toastText() || '', 'Kingambit added'), 'toast: ' + await d.toastText()); expect(has(await d.sheetText(), 'On your team'), 'button did not become "On your team"');
  expect((await ui.team()).includes('Kingambit'), 'not on the team'); await ui.pg.waitForTimeout(1200); expect((await acct()).slots.some(s => s.n === 'Kingambit'), 'not saved to the account');
  await d.closeSheet(); await d.openPokemon('Garchomp'); expect(/On your team/.test(await d.sheetText()), 'team member not marked');
  await d.closeSheet(); await d.openPokemon('Archaludon'); expect(/Team full/i.test(await d.sheetText()), 'full team not said');
  await d.tapInSheet(/^Popular Sets$/); expect(await ui.current() === 'sets' && /Archaludon/.test(await d.setsShowing()), 'Popular Sets did not open on Archaludon');
  await ui.go('Ratings'); await d.openPokemon('Archaludon'); await d.tapInSheet(/^Build around it$/); expect(await ui.current() === 'auto', 'Build around it opened ' + await ui.current()); }));

// =============================== META · Usage ===============================
t('META-01', 'Usage source line names the source and size', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Usage'); expect(has(await d.usageSourceLine(), 'Ranked'), 'ranked line: ' + await d.usageSourceLine());
  await d.chooseUsageSource('Online tournaments'); expect(/Limitless.*[\d,]+ teams/.test(await d.usageSourceLine()), 'tournament line: ' + await d.usageSourceLine());
  await d.chooseUsageSource('Showdown ladder'); expect(/Showdown.*battles/i.test(await d.usageSourceLine()), 'Showdown line: ' + await d.usageSourceLine()); }));
t('META-02', 'Usage source switch changes the list; starts on Ranked ladder again after a reload', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Usage'); const a = (await d.usageRows()).map(r => r.name).join(); await d.chooseUsageSource('Showdown ladder'); const b = (await d.usageRows()).map(r => r.name).join();
  expect(a !== b, 'list order did not change'); await ui.reload(); await ui.go('Usage'); expect((await d.usageSources())[0].on, 'source remembered (it should start on Ranked ladder)'); }));
t('META-03', 'Usage search filters every rank; says when nothing matches', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Usage'); await d.usageSearch('zzz'); expect(has(await ui.text(), 'No Pokémon in this list matches that'), 'no no-match line');
  await d.usageSearch('ra'); const r = await d.usageRows(); expect(r.length && r.every(x => /ra/i.test(x.name)), 'non-matching rows: ' + r.map(x => x.name)); expect(r.some(x => x.rank > 10), 'search only looked at the top 10');
  expect(/\d+ match(es)?/.test(await ui.text()), 'no match count'); }));
t('META-03b', 'The "rest of the list" button hides while searching', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Usage'); expect(await d.restButtonShown(), 'no rest-of-list button before searching'); await d.usageSearch('ra'); expect(!(await d.restButtonShown()), '"Ranks 11–60" button still shows while searching'); }),
  {known: 'the button gets the hidden attribute but its CSS (display:flex) overrides it, so it stays on screen while searching (measured at 1280)'});
t('META-04', 'Usage rows: rank, name, types, usage and team count; trend badges where ranks moved', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Usage'); await d.chooseUsageSource('Online tournaments'); const r = await d.usageRows(); expect(r.length === 10 && r[0].rank === 1, 'rows: ' + r.length);
  expect(r.every(x => /\d+(\.\d)?%/.test(x.text) && /[\d,]+ teams/.test(x.text)), 'a row lacks usage % or team count: ' + r[0].text);
  await d.tapRestOfList(); const all = await d.usageRows(); expect(all.some(x => /▲|▼|NEW/.test(x.text)), 'no trend badge anywhere in the list'); }));
t('META-05', 'Expanded usage row: bars "Of N teams", teammates, Add to team', run({team: FIVE}, async ({ui, d}) => {
  await ui.go('Usage'); await d.chooseUsageSource('Online tournaments'); await d.openUsageRow('Rillaboom'); const s = await d.usageRowText('Rillaboom');
  expect(/Of [\d,]+ Teams/i.test(s) && has(s, 'Grassy Surge') && has(s, 'Fake Out'), 'Rillaboom details: ' + s.slice(0, 200)); expect(has(s, 'Teammates'), 'no teammates'); expect(!/Add to team/.test(s), 'Add to team offered for a team member');
  await d.openUsageRow('Kingambit'); await d.tapInUsageRow('Kingambit', /^Add to team$/); expect(/Kingambit added/.test(await d.toastText() || ''), 'toast: ' + await d.toastText()); expect((await ui.team()).includes('Kingambit'), 'not added'); }));
t('META-06', 'Top 10, then "Ranks 11–60" shows the rest and flips', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Usage'); expect((await d.usageRows()).length === 10, 'not 10 rows'); await d.tapRestOfList(); const r = await d.usageRows();
  expect(r.length > 10 && r[10].rank === 11, 'rest not shown'); expect(has(await ui.text(), 'Show the top 10'), 'button did not flip'); await d.tapRestOfList(); expect((await d.usageRows()).length === 10, 'did not fold back'); }));
t('META-07', 'Usage without data says so', run({team: TEAM, account: false}, async ({ui}) => { await ui.go('Usage'); expect(has(await ui.text(), 'No meta data loaded yet'), 'no no-data line'); }));
t('BROKEN-13', 'No-data message works on the public site (does not mention Claude)', run({team: TEAM, account: false}, async ({ui}) => {
  await ui.go('Usage'); expect(!/Claude/.test(await ui.text()), 'no-data text mentions Claude: ' + (await ui.text()).match(/[^.]*Claude[^.]*\./)); }),
  {known: 'Usage says "Live data appears here when the page is opened in Claude." (public launch concern)'});

// =============================== SETS · Popular Sets (= B-build SETS-02..07, different numbering) ===============================
t('SETS-01', 'Look up a Pokémon: its sets show and stay after reload (B SETS-02)', run({team: TEAM}, async ({ui, d, ls}) => {
  await ui.go('Popular Sets'); await d.lookUpSets('Gholdengo'); expect(/Gholdengo/.test(await d.setsShowing()) && has(await d.setsShowing(), 'Moves'), 'Gholdengo sets not shown');
  expect(has(String(await ls('cc2.setMon')), 'Gholdengo'), 'not remembered'); await ui.reload(); await ui.go('Popular Sets');
  const after = await d.setsShowing(), at = after.indexOf('Gholdengo'); expect(at >= 0 && at < after.indexOf('Moves'), 'Gholdengo not the shown Pokémon after reload'); }));
t('SETS-02', 'Your Team row: tap a member to see its sets (B SETS-03)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Popular Sets'); const row = await d.setsTeamRow(); expect(row.length === 6, 'team row: ' + row.length); await d.tapSetsTeam('Garchomp');
  expect((await d.setsTeamRow()).find(x => x.id === 'Garchomp').on, 'Garchomp not marked'); expect(/Your Garchomp/.test(await d.setsShowing()), 'Garchomp sets not shown'); }));
t('SETS-03', 'Default: your first team member, else the #1 rated Pokémon (B SETS-04)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Popular Sets'); expect((await d.setsTeamRow())[0].on && /Your Mega Charizard Y/.test(await d.setsShowing()), 'did not open on the first team member'); }));
t('SETS-03b', 'Default with no team: the #1 rated Pokémon', run({team: [], account: false, stored: {'cc2.state': JSON.stringify({slots: Array(6).fill({n: '', a: null, lock: false}), box: [], teams: [], opp: []})}}, async ({ui, d}) => {
  await ui.go('Ratings'); const top = (await d.topList())[0]; await ui.go('Popular Sets'); expect(has((await d.setsShowing()).slice(0, 400), top.name), 'did not open on #1 ' + top.name); }));
t('SETS-04', 'Set head: tier pill and "Your <Pokémon>: Ability @ Item, moves" (B SETS-05)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Popular Sets'); const s = await d.setsShowing(); expect(/[SABCDF] tier, rated \d+, #\d+ of \d+/.test(s), 'no tier pill'); expect(/Your Mega Charizard Y: Drought @ Charizardite Y/.test(s), 'no "Your …" line'); }));
t('SETS-05', 'Sets source switch Best data / Tournaments / Showdown, remembered (B SETS-06/07)', run({team: TEAM}, async ({ui, d, ls}) => {
  await ui.go('Popular Sets'); await d.tapSetsTeam('Incineroar'); const s = await d.setsSources(); expect(s.map(x => x.name).join() === 'Best data,Tournaments,Showdown', 'sources: ' + s.map(x => x.name));
  const a = await d.setsShowing(); await d.chooseSetsSource('Tournaments'); const b = await d.setsShowing(); expect(a !== b && /tournament/i.test(b), 'card did not switch to tournament data');
  expect(has(String(await ls('cc2.setSrc')), 'tour'), 'source not remembered: ' + await ls('cc2.setSrc')); }));

// =============================== TOP · Winning Teams ===============================
t('TOP-01', 'Winning Teams source line with update date', run({team: TEAM}, async ({ui}) => {
  await ui.go('Winning Teams'); expect(/Top 4 from online tournaments with 32\+ players, top 8 from official events, updated [A-Z][a-z]{2} \d/.test(await ui.text()), 'no source line'); }));
t('TOP-02', 'Team search: suggestions with kind and count; Enter makes a chip; nonsense says so', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Winning Teams'); await d.teamSearch('Sitrus', false); const sug = (await d.teamSearchSuggestions()).join(' | ');
  expect(/Sitrus Berry.*Item.*\d+ teams/.test(sug), 'suggestion: ' + sug); await ui.pg.press('#tsIn', 'Enter'); await ui.pg.waitForTimeout(600);
  expect(/Sitrus Berry/.test(await d.topSearchChips()), 'no chip: ' + await d.topSearchChips());
  await d.teamSearch('zzqx', false); expect(has(await d.teamSearchMenuText() || await ui.text(), 'Nothing in the winning teams matches that'), 'no nothing-matches line'); }));
t('TOP-03', 'Team search results: count, "Often with" adds a filter, cards with matches', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Winning Teams'); await d.teamSearch('Sitrus'); const m = (await ui.text()).match(/([\d,]+) teams? match, (\d+) won their event/); expect(m, 'no results count');
  expect(has(await ui.text(), 'Often with'), 'no Often with'); await d.tapOftenWith(); const m2 = (await ui.text()).match(/([\d,]+) teams? match/);
  expect(m2 && +m2[1].replace(/,/g, '') < +m[1].replace(/,/g, ''), 'count did not drop'); expect((await d.topSearchChips()).split('|').length === 2, 'not two chips: ' + await d.topSearchChips());
  expect(await d.teamCards() >= 1, 'no team cards'); }));
t('TOP-04', 'Your Team strip: checks badge with six; asks for six when not full', run({team: TEAM}, async ({ui}) => {
  await ui.go('Winning Teams'); expect(/Your Team.*\d\/4 checks/.test(await ui.text()), 'no checks badge'); }));
t('TOP-04b', 'Your Team strip with five Pokémon asks to add six', run({team: FIVE}, async ({ui}) => {
  await ui.go('Winning Teams'); expect(has(await ui.text(), 'Add six Pokémon on My team to compare.'), 'no "add six" line'); }));
t('TOP-05', 'Team list: top 3, "More Winning Teams" shows more, "Show fewer" folds back', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Winning Teams'); const n0 = await d.teamCards(); expect(n0 === 3, 'cards: ' + n0); expect(/Showing the top 3 of \d+/.test(await ui.text()), 'no "Showing the top 3 of N"');
  await ui.tap(/More Winning Teams/); const n1 = await d.teamCards(); expect(n1 > 3, 'more not shown: ' + n1); await ui.tap(/^Show fewer/i); expect(await d.teamCards() === 3, 'did not fold back'); }));
t('TOP-06', 'Card actions: Load team (confirm, Undo), Practice against, Compare', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Winning Teams'); await ui.tap(/^Load team$/); expect(has(await ui.text(), 'Replace your current team?'), 'no confirm'); await ui.tap(/^Cancel$/);
  expect(JSON.stringify(await ui.team()) === JSON.stringify(TEAM), 'Cancel changed the team'); await ui.tap(/^Load team$/); await ui.tap(/^Replace$/);
  expect(await ui.current() === 'report', 'did not open My Team'); expect(await d.toastHasUndo(), 'no Undo'); const loaded = await ui.team(); expect(loaded.includes('Gholdengo'), 'first card not loaded: ' + loaded);
  await ui.go('Winning Teams'); await ui.tap(/^Practice against$/); expect(await ui.current() === 'matchup', 'Practice against opened ' + await ui.current());
  expect(has(await d.toastText() || '', 'Opponent set'), 'toast: ' + await d.toastText());
  await ui.go('Winning Teams'); await ui.tap(/^Compare$/, '[data-pane=top]'); expect(await ui.current() === 'compare', 'Compare opened ' + await ui.current()); }));
t('TOP-07', 'Winning Teams without data says so', run({team: TEAM, account: false}, async ({ui}) => {
  await ui.go('Winning Teams'); expect(has(await ui.text(), 'Top teams appear here after the next data refresh.'), 'no empty line'); }));

// =============================== EVT · Events ===============================
t('EVT-01', 'Events head: total, online and official counts, "?" explains', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Events'); const m = (await ui.text()).match(/(\d+) events (\d+) online (\d+) official/); expect(m && +m[1] === +m[2] + +m[3], 'counts: ' + (m && m[0]));
  await d.openTip('event'); expect(/32\+ players/.test(await d.tipText() || '') && /official/i.test(await d.tipText()), 'tip: ' + await d.tipText()); }));
t('EVT-02', 'Next events calendar: countdowns, Show all, recent results open the event', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Events'); const c = await d.calendar(); expect(c.rows.length === 4, 'rows: ' + c.rows.length); expect(/(\d+) on the calendar/.test(c.head), 'head: ' + c.head);
  for (const r of c.rows) expect(r.countdownOk, 'countdown wrong: ' + r.text); expect(c.newTab, 'calendar rows do not open a new tab');
  await ui.tap(/^Show all \d+$/); const all = await d.calendar(); expect(all.rows.length === +c.head.match(/(\d+) on/)[1], 'Show all shows ' + all.rows.length);
  await ui.tap(/results ›$/); expect(has(await ui.text(), '‹ All events'), 'results link did not open the event'); }));
t('EVT-03', 'Event filter Official keeps only official events', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Events'); const all = await d.eventCards(); await d.chooseEventFilter('Official'); const off = await d.eventCards();
  expect(off.length && off.length < all.length + 100 && off.every(x => /official/i.test(x)), 'non-official card under Official'); await d.chooseEventFilter('100+ players');
  expect((await d.eventCards()).every(x => +(x.match(/([\d,]+) players/) || [0, '0'])[1].replace(/,/g, '') >= 100), 'a card under 100 players'); }));
t('EVT-04', 'Event list 12 at a time with "Show more"', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Events'); expect((await d.eventCards()).length === 12, 'cards: ' + (await d.eventCards()).length); await ui.tap(/^Show more \(\d+ left\)$/); expect((await d.eventCards()).length === 24, 'after Show more: ' + (await d.eventCards()).length); }));
t('EVT-05', 'Event detail: placings 1st→16th, opens at top, "‹ All events" returns', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Events'); await d.scrollTo(400); await ui.tap(/^Gdańsk Regional results ›$/); const tx = await ui.text();
  expect(has(tx, '‹ All events') && /758 players/.test(tx) && /Official/i.test(tx), 'detail head: ' + tx.slice(0, 200)); expect(await d.scrollY() < 5, 'did not open at its top');
  expect(await d.placings() >= 16, 'placings: ' + await d.placings()); await ui.tap(/‹ All events/); expect((await d.eventCards()).length >= 12, 'list did not return'); }));
t('EVT-06', 'Team sheet card: Sets shows items/moves; Load team needs a second tap and loads the exact sheet', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Events'); await ui.tap(/^Gdańsk Regional results ›$/); await ui.tap(/^Sets$/); expect(/Ability|@/.test(await ui.text()) && has(await ui.text(), 'Hide sets'), 'sets not shown');
  await ui.tap(/^Load team$/); expect(has(await ui.text(), 'Tap again to replace your team'), 'no second-tap warning'); expect(JSON.stringify(await ui.team()) === JSON.stringify(TEAM), 'first tap changed the team');
  await ui.pg.waitForTimeout(500); await ui.tap(/Tap again to replace your team/); expect(await ui.current() === 'report', 'did not open My Team'); expect(/team loaded with its moves and items/.test(await d.toastText() || ''), 'toast: ' + await d.toastText());
  expect(await d.toastHasUndo(), 'no Undo'); expect((await ui.team()).includes('Gholdengo'), 'winning six not loaded: ' + await ui.team()); }));
t('EVT-07', 'Events without data: empty note', run({team: TEAM, account: false}, async ({ui}) => {
  await ui.go('Events'); expect(has(await ui.text(), 'Tournament results appear here after the next data refresh.'), 'no empty note'); }));

// =============================== ARCH · Archetypes (= B-build ARCH-03/04) ===============================
t('ARCH-01', 'Archetype list sorted by share with team counts (B ARCH-03)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Archetypes'); const tx = await ui.text(); expect(/From the latest \d+ top tournament teams/.test(tx), 'no source line');
  const g = [...tx.matchAll(/([A-Z][A-Za-z ]+?) (\d+)% (\d+) of (\d+) top teams/g)].map(m => +m[2]); expect(g.length >= 6, 'styles: ' + g.length);
  for (let i = 1; i < g.length; i++) expect(g[i] <= g[i - 1], 'not sorted by share'); }));
t('ARCH-02', 'Inside a guide: how to beat it and what your team has (B ARCH-04)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Archetypes'); await d.toggleFold('Trick Room'); const s = await d.foldText('Trick Room');
  expect(has(s, 'How to beat it') && has(s, 'Key Pokémon'), 'guide body missing'); expect(has(s, 'What your team has') || has(s, 'Nothing on your team directly answers it'), 'no "your team" part'); }));

// =============================== WEEK · This Week ===============================
t('WEEK-01', 'This Week head: two date ranges, team and event counts, Share button', run({team: TEAM}, async ({ui}) => {
  await ui.go('This Week'); const tx = await ui.text(); expect(/Tournament teams, [A-Z][a-z]{2} \d+ – .*against .*\d/.test(tx), 'no ranges');
  expect(/This Week [\d,]+ teams \d+ events/.test(tx) && /Week before [\d,]+ teams \d+ events/.test(tx), 'no counts'); expect(has(tx, 'Share this week'), 'no share button'); }));
t('WEEK-02', 'Share this week opens a 1200-wide image', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('This Week'); await ui.tap('Share this week'); const c = await d.until(() => d.shareCard()); expect(c && c.w === 1200, 'image: ' + JSON.stringify(c)); }));
t('WEEK-02b', 'Without data, Share says "Nothing to share yet"', run({team: TEAM, account: false}, async ({ui, d}) => {
  await ui.go('This Week'); const b = await ui.sees('Share this week'); if (b) { await ui.tap('Share this week'); expect(has(await d.toastText() || '', 'Nothing to share yet'), 'toast: ' + await d.toastText()); }
  else expect(has(await ui.text(), "This week's changes appear"), 'no empty note'); }));
t('WEEK-03', 'Rising and Falling: "a% → b% of teams", points; tap opens the sheet', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('This Week'); const tx = await ui.text(); expect(has(tx, 'Rising') && has(tx, 'Falling'), 'no Rising/Falling');
  expect(/\d+(\.\d)?% → \d+(\.\d)?% of teams ▲\d/.test(tx) && /▼\d/.test(tx), 'rows lack the change'); await d.openPokemon(await d.firstPokemon()); expect(await d.sheetIsOpen(), 'no sheet'); }));
t('WEEK-04', 'Most used this week: five tiles open their sheet', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('This Week'); expect(has(await ui.text(), 'Most used this week, % of teams.'), 'no caption'); const ids = await d.pokemonOnPage();
  expect(ids.length >= 13, 'few tappable Pokémon: ' + ids.length); await d.openPokemon('Sneasler'); expect(await d.sheetName() === 'Sneasler', 'tile did not open Sneasler'); }));
t('WEEK-05', 'New tech: kind word, "a% → b% of its teams", Details shows team counts', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('This Week'); const tx = await ui.text(); expect(/(Move|Item|Ability) .+ \d+(\.\d)?% → \d+(\.\d)?% of its teams ▲\d+/.test(tx), 'no new tech rows');
  await d.tapDetails(); expect(/\(\d+ .+ teams this week, \d+ the week before\)/.test(await ui.text()), 'Details did not show team counts'); }));
t('WEEK-06', 'Winners this week open that event on Events', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('This Week'); expect(has(await ui.text(), 'Winners This Week'), 'no winners'); await d.tapWinner();
  expect(await ui.current() === 'events' && has(await ui.text(), '‹ All events'), 'winner did not open its event'); }));
t('WEEK-07', 'Team styles with % and real changes only', run({team: TEAM}, async ({ui}) => {
  await ui.go('This Week'); const tx = await ui.text(); expect(has(tx, '% of teams using each style'), 'no styles caption'); expect(/Tailwind \d+(\.\d)?%/.test(tx), 'no style %'); }));
t('WEEK-08', 'New in top cut: first top 8 this regulation, or "nothing new"', run({team: TEAM}, async ({ui}) => {
  await ui.go('This Week'); const tx = await ui.text(); expect(/First top 8 this regulation/.test(tx) || has(tx, 'Nothing new reached a top 8 this week.'), 'no New in top cut part'); }));
t('WEEK-09', 'How we decide what changed: fold with thresholds and date', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('This Week'); await d.toggleFold('How we decide'); await d.tapMore('[data-pane=weekly] details[open]'); const s = await d.foldText('How we decide');
  expect(s && /\d+\+? teams/.test(s) && /standard errors/.test(s) && /Updated [A-Z][a-z]{2} \d/.test(s), 'fold: ' + s); }));
t('WEEK-10', 'This Week without data: empty note', run({team: TEAM, account: false}, async ({ui}) => {
  await ui.go('This Week'); expect(has(await ui.text(), "This week's changes appear after the next data refresh."), 'no empty note'); }));
t('WEEK-11', 'Kind marker: icon and word, never colour alone', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('This Week'); const k = await d.kindMarkers(); expect(k.length >= 1 && k.every(x => /^(Move|Item|Ability|Nature)$/.test(x.word) && x.icon), 'kind markers: ' + JSON.stringify(k)); }));

// =============================== TRACK · Track Record ===============================
t('TRACK-01', 'Track Record head and stats', run({team: TEAM}, async ({ui}) => {
  await ui.go('Track Record'); const tx = await ui.text(); expect(has(tx, 'How right have our ratings been?'), 'no subtitle');
  expect(/tracking since/.test(tx) && /\d+ days of ratings saved/.test(tx) && /\d+ events checked so far/.test(tx), 'stats missing'); }));
t('TRACK-02', 'How the check works: three steps and the fair-test line', run({team: TEAM}, async ({ui}) => {
  await ui.go('Track Record'); const tx = await ui.text(); for (const x of ['Ratings saved each morning', 'An event is played', 'Its top 8 compared', 'A fair test']) expect(has(tx, x), 'missing ' + x); }));
t('TRACK-03', 'Top-8 teams by the rating we gave: four bands and a verdict', run({team: TEAM}, async ({ui}) => {
  await ui.go('Track Record'); const tx = await ui.text(); for (const b of ['Rated 90+', 'Rated 70–89', 'Rated 53–69', 'Rated Under 53']) expect(has(tx, b), 'band missing ' + b);
  expect(/\d+ of \d+ Pokémon made a top 8/.test(tx), 'no band counts'); expect(/Pokémon we rated 90\+ were on top-8 teams/.test(tx) || /Early: only \d+ events/.test(tx), 'no verdict or early note'); }));
t('TRACK-04', 'Biggest hits and misses open their sheet', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Track Record'); const tx = await ui.text(); expect(has(tx, 'Biggest Hits') && has(tx, 'Biggest Misses'), 'no hits/misses'); expect(/Rated \d+, on \d+ top-8 teams/.test(tx), 'hit rows');
  await d.openPokemon(await d.firstPokemon()); expect(await d.sheetIsOpen(), 'no sheet'); }));
t('TRACK-05', 'Week by week chart (or the "from about" note)', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Track Record'); expect(has(await ui.text(), 'Week by Week'), 'no section'); expect(await d.hasChart() || /From about/.test(await ui.text()), 'no chart and no note'); }));
t('TRACK-06', 'Coming as the data grows: with only 3 events it lists the verdict and misses still to come', withDocs({'meta/track': {...DOCS['meta/track'], ev: DOCS['meta/track'].ev.slice(-3)}}, run({team: TEAM}, async ({ui}) => {
  await ui.go('Track Record'); const tx = await ui.text(); expect(has(tx, 'Coming as the data grows'), 'no "Coming as the data grows" list with 3 events');
  expect(/verdict after 10 events \(3 so far\)/.test(tx) && /misses after 5 events/.test(tx), 'list does not name what comes later: ' + (tx.match(/Coming as the data grows.{0,160}/) || [''])[0]);
  expect(/Early: only 3 events/.test(tx), 'no "Early" note with 3 events'); })));
t('TRACK-06b', 'With 34 events the "coming" list is gone (everything is shown)', run({team: TEAM}, async ({ui}) => {
  await ui.go('Track Record'); expect(!has(await ui.text(), 'Coming as the data grows'), 'still promises things that are already shown'); }));
t('TRACK-07', 'Events Checked fold: one row per event checked, remembered', run({team: TEAM}, async ({ui, d, ls}) => {
  await ui.go('Track Record'); const n = +(await ui.text()).match(/(\d+) events checked so far/)[1]; await d.toggleFold('Events Checked');
  expect(await d.foldRows('Events Checked') === Math.min(n, 60), `rows ${await d.foldRows('Events Checked')} vs ${n}`); expect(await ls('cc2.chf.trevents') == 1, 'not remembered'); }));
t('TRACK-08', 'Track Record link and empty state', run({team: TEAM}, async ({ui}) => {
  await ui.go('Track Record'); await ui.tap(/^How ratings work →$/); expect(await ui.current() === 'method', 'link opened ' + await ui.current()); }));
t('TRACK-08b', 'Track Record without data: Collecting', run({team: TEAM, account: false}, async ({ui}) => {
  await ui.go('Track Record'); expect(has(await ui.text(), 'The first results appear here after the next morning'), 'no empty note'); }));

// =============================== METHOD · How We Calculate ===============================
t('METHOD-01', 'How We Calculate head: freshness, team and game counts', run({team: TEAM}, async ({ui}) => {
  await ui.go('How We Calculate'); const tx = await ui.text(); expect(/Updated (today|yesterday|[A-Z][a-z]{2} \d)/.test(tx), 'no freshness');
  expect(/[\d,]+ tournament teams/.test(tx) && /[\d,]+ games/.test(tx), 'no counts'); }));
t('METHOD-02', 'How to read our numbers: rating bands and Strength Score bands with the approved words', run({team: TEAM}, async ({ui}) => {
  await ui.go('How We Calculate'); const tx = await ui.text(); expect(/S 90\+ A 80s B 70s C 60s D 50s F <50/.test(tx), 'rating bands');
  expect(/90\+ Top tier 80s Tournament ready 70s Solid 60s Needs work under 60 Missing a basic/.test(tx), 'Strength Score bands'); }));
t('METHOD-03', 'Ten remembered sections; each opens with content', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('How We Calculate'); const titles = ['Strength Score', 'The 7 Team Checks', 'Pokémon Ratings', 'Usage, Sets and Sources', 'Damage Calc', 'Speed Tiers', 'Build Me a Team', 'What Gets Left Out', 'Updates and Cross-Checks'];
  for (const x of titles) expect(await d.foldIsOpen(x) !== null, 'no section ' + x); expect((await d.methodSections()).length === 10, 'sections: ' + (await d.methodSections()).length);
  await d.toggleFold('Speed Tiers'); expect((await d.foldText('Speed Tiers')).length > 80, 'section empty'); await ui.reload(); await ui.go('How We Calculate'); expect(await d.foldIsOpen('Speed Tiers'), 'not remembered'); }));
t('RULE-WORDS', 'Meta pages, menu and search use the approved words (Matchups, Strength Score, Test run…)', run({team: TEAM}, async ({ui, d}) => {
  const bad = [/Ready for the Top Threats/i, /\breadiness\b/i, /\bGauntlet\b/, /\bElo\b/, /\bwin edge\b/i, /\bpts\b/, /\bFix it\b/, /\bgrade\b/i];
  const found = []; for (const p of [...META_PAGES, 'This Week', 'Track Record', 'How We Calculate']) { await ui.go(p); const tx = await ui.text(); for (const b of bad) if (b.test(tx)) found.push(`${p}: ${tx.match(b)[0]}`); }
  expect(!found.length, 'old words: ' + found.join('; ')); }), {known: 'How We Calculate still says "Ready for the Top Threats" (word list: Matchups) and "grade" (Strength Score)'});
t('METHOD-04', 'Links and tips open How We Calculate at the right section', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.openTip('numbers'); await d.tapInTip('How We Calculate'); expect(await ui.current() === 'method', 'tip link opened ' + await ui.current());
  expect(await d.inView('How to Read Our Numbers') || await d.anyOpenInView(), 'no section in view'); }));
t('METHOD-05', 'Track Record card opens Track Record', run({team: TEAM}, async ({ui}) => {
  await ui.go('How We Calculate'); expect(/Track Record How right have our ratings been\?.*\d+ events checked/.test(await ui.text()), 'no card'); await ui.tap(/events checked/);
  expect(await ui.current() === 'track', 'card opened ' + await ui.current()); }));
t('DUP-12', 'Every data source named in How We Calculate is credited in About and the footer', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('How We Calculate'); await d.toggleFold('Usage, Sets and Sources'); const used = await d.methodSourceNames(); expect(used.length >= 5, 'sources found: ' + used);
  // a source counts as credited when its name (ignoring spaces and words like "replays" / "usage stats") is in the footer credits
  const norm = x => x.toLowerCase().replace(/\b(replays|usage stats|data)\b/g, '').replace(/[^a-z0-9é]/g, '');
  await d.tapFooter('Sources and credits'); const credits = norm(await d.footerText()); const miss = used.filter(s => !credits.includes(norm(s))); expect(!miss.length, 'used but not credited: ' + miss.join(', ')); }),
  {known: 'RK9 and project-red-data feed numbers but are not credited in About/footer (inventory DUP-12, possible credit gap)'});

// =============================== ABOUT · About & Legal ===============================
t('ABOUT-01', 'About head with the four chips', run({team: TEAM}, async ({ui}) => {
  await ui.go('About'); const tx = await ui.text(); expect(has(tx, 'Made by Fans, for Doubles Players') && /Free No ads Fan-made Unofficial/.test(tx), 'head: ' + tx.slice(0, 200)); }));
t('ABOUT-02', 'Eight sections; Privacy promises no names, no cookies; folds are not remembered', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('About'); for (const x of ['What NastyPlot Is', 'Disclaimer & Trademarks', 'Where the Data Comes From', 'No Guarantee', 'Privacy', 'Player Names', 'Removal & Contact', 'Not for Money']) expect(await d.foldIsOpen(x) === false, 'section missing or open: ' + x);
  await d.toggleFold('Privacy'); const p = await d.foldText('Privacy'); expect(/no names/i.test(p) && /cookies/i.test(p), 'privacy text: ' + p.slice(0, 200));
  await ui.reload(); await ui.go('About'); expect(await d.foldIsOpen('Privacy') === false, 'About fold remembered'); }));
t('ABOUT-03', 'Contact email hidden until "Show email"; then a mail link and Copy', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('About'); expect(!(await d.emailInPage()), 'an email address is in the page before "Show email"'); await d.toggleFold('Removal & Contact'); await ui.tap(/^Show email$/);
  const e = await d.emailShown(); expect(e.mailto && e.at, 'no mail link with an address after the tap'); expect(e.copy, 'no Copy button'); }));
t('ABOUT-04', 'Footer About & Legal opens at the top; Contact opens Removal & Contact in view', run({team: TEAM}, async ({ui, d}) => {
  await ui.go('Ratings'); await d.tapFooter(/^Contact$/); expect(await ui.current() === 'about' && await d.foldIsOpen('Removal & Contact') && await d.inView('Removal & Contact'), 'Contact did not open its section');
  await ui.go('Ratings'); await d.tapFooter(/^About & Legal$/); expect(await ui.current() === 'about' && await d.scrollY() < 5, 'About & Legal did not open at the top'); }));
t('ABOUT-05', 'Rules caption under legality statements elsewhere', run({team: TEAM}, async ({ui, d}) => {
  const where = await d.findRulesCaption(); expect(where, 'no "Based on our reading of the Reg M-C rules" caption on My Team, Speed Tiers, Damage Calc or Popular Sets'); }));

function OPP6() { return ['Gholdengo', 'Excadrill', 'Tyranitar', 'Staraptor', 'Sinistcha', 'Milotic']; }
