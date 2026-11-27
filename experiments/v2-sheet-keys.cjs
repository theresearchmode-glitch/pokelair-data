// Keyboard in sheets (Sim's outside check D11, Nov 12). Usage: node experiments/v2-sheet-keys.cjs app/dist/v2.html
// keyboard in sheets: Tab 40 times (and Shift+Tab 40 times) inside the info sheet and other sheets; count stops that leave the sheet;
// in the info sheet, reach every tab with the arrow keys
const pw = (()=>{try{return require(require('path').join(__dirname,'..','node_modules','playwright'))}catch(e){return require('playwright')}})(), fs = require('fs'), path = require('path'), R = require('path').resolve(__dirname, '..') + require('path').sep;
const rd = f => { try { return JSON.parse(fs.readFileSync(R + 'out/' + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json') || {}, D = {'meta/results': L.results, 'meta/perf': L.adj ? {adj: L.adj, updated: String(L.updated || '').slice(0, 10)} : null, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/events': rd('events.json')};
(async () => { const file = process.argv[2]; const out = [];
  for (const eng of ['chromium', 'webkit']) for (const w of [390, 1440]) for (const [name, open] of [['info sheet', "V2.openMon('Garchomp')"], ['Why this score', "document.querySelector('[data-v2why]').click()"], ['More', "document.querySelector('[data-v2more]').click()"], ['Saved Teams', "document.querySelector('[data-v2saved]').click()"]]) {
    const b = await pw[eng].launch(); const p = await b.newPage({viewport: {width: w, height: 900}});
    await p.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: q => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[q], data: () => D[q]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
    await p.goto('file://' + path.resolve(file) + '#team'); await p.waitForTimeout(2500); await p.waitForFunction(() => !document.querySelector('.sg2-wait'), null, {timeout: 90000}).catch(() => {});
    await p.evaluate(open); await p.waitForTimeout(900);
    const inside = () => p.evaluate(() => !!(document.activeElement && document.activeElement.closest('.np-sheet')));
    let left = 0, stops = new Set();
    for (let k = 0; k < 40; k++) { await p.keyboard.press(eng === 'webkit' ? 'Alt+Tab' : 'Tab'); if (!(await inside())) left++; stops.add(await p.evaluate(() => (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent || '').trim().slice(0, 20))); }
    for (let k = 0; k < 40; k++) { await p.keyboard.press(eng === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab'); if (!(await inside())) left++; }
    let tabs = '';
    if (name === 'info sheet') { await p.evaluate(() => document.querySelector('.ms2 [data-mstab][aria-selected="true"]').focus()); const seen = [];
      for (let k = 0; k < 4; k++) { seen.push(await p.evaluate(() => document.activeElement.dataset.mstab + (document.querySelector('#msp-' + document.activeElement.dataset.mstab) && !document.querySelector('#msp-' + document.activeElement.dataset.mstab).hidden ? '(shown)' : ''))); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150); }
      tabs = ' | arrow keys reach tabs: ' + seen.join(', '); }
    out.push(`${eng} ${w} ${name}: 80 Tab/Shift+Tab presses, ${left} left the sheet, ${stops.size} different stops${tabs}`); await b.close(); }
  console.log(out.join('\n')); })();
