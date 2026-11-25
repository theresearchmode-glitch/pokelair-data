// Accessibility code checks (job 18: job 12 diffs 1-4 + Q1 sugs.js aria-live + Q3 kit.js kCard aria-pressed).
// Usage: PAGE=app/dist/v2.html node experiments/a11y-code.mjs     (build with: node app/build.mjs --v2)
import fs from 'node:fs';
import {createRequire} from 'node:module';

const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PAGE = process.env.PAGE ? (process.env.PAGE.startsWith('/') ? process.env.PAGE : ROOT + process.env.PAGE) : ROOT + 'app/dist/v2.html';

if (!fs.existsSync(PAGE)) {
  throw new Error(`Built v2 page not found at ${PAGE}. Run: node app/build.mjs --v2`);
}

let browser;
try {
  browser = await chromium.launch();
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));

  await pg.addInitScript(() => {
    localStorage.setItem('cc2.welcomed', '"1"');
    window.__NP_PREVIEW = 1;
  });

  await pg.goto('file://' + PAGE + '#home');
  await pg.waitForTimeout(1500);

  const results = [];
  const check = (id, ok, detail) => results.push({id, ok: !!ok, detail: String(detail || '')});

  // A11Y-1: V2.ARROW_LISTS skips .np-hitx and includes all 6 added pickers
  {
    const info = await pg.evaluate(() => {
      const sels = (V2.ARROW_LISTS || []).map(([s]) => s);
      const v2q = (V2.ARROW_LISTS || []).find(([s]) => s === '[data-v2q]');
      const v2qTarget = v2q ? v2q[1]({}) : '';
      const needed = ['[data-arnq]', '[data-arnmq]', '[data-ygq]', '[data-exq]', '[data-tcfind]', '[data-stq]'];
      return {
        v2qTarget,
        hasAll: needed.every(s => sels.includes(s)),
        missing: needed.filter(s => !sels.includes(s))
      };
    });
    check('A11Y-1', info.v2qTarget.includes(':not(.np-hitx)') && info.hasAll, JSON.stringify(info));
  }

  // A11Y-2: V2.kCard emits aria-pressed="false" when 'sel' in o and o.sel is falsy (Order Q3)
  {
    const info = await pg.evaluate(() => {
      const btnOff = V2.kCard('Garchomp', {sel: false, attrs: {'data-test': '1'}});
      const btnOn = V2.kCard('Garchomp', {sel: true, attrs: {'data-test': '1'}});
      const btnPlain = V2.kCard('Garchomp', {attrs: {'data-test': '1'}});
      const divOff = V2.kCard('Garchomp', {sel: false});
      return {
        btnOffHasFalse: btnOff.includes('aria-pressed="false"'),
        btnOnHasTrue: btnOn.includes('aria-pressed="true"'),
        btnPlainNoPressed: !btnPlain.includes('aria-pressed'),
        divOffNoPressed: !divOff.includes('aria-pressed')
      };
    });
    check('A11Y-2',
      info.btnOffHasFalse && info.btnOnHasTrue && info.btnPlainNoPressed && info.divOffNoPressed,
      JSON.stringify(info)
    );
  }

  // A11Y-3: guide.js (preview page) buttons have type="button", tablist has aria-label + roving tabindex + arrow keys, Forms strip is role="group"
  {
    const hasGuide = await pg.evaluate(() => !!(V2.pages && V2.pages.guide));
    if (hasGuide) {
      await pg.evaluate(() => { location.hash = '#guide'; V2.redraw(); });
      await pg.waitForTimeout(300);
      const info = await pg.evaluate(() => {
        const chips = [...document.querySelectorAll('.sg .np-chip')];
        const tablist = document.querySelector('.sg .np-tabs[role="tablist"]');
        const tabs = tablist ? [...tablist.querySelectorAll('[role="tab"]')] : [];
        const forms = document.querySelector('.sg .np-forms .r');
        const initOk = chips.length === 3 && chips.every(b => b.getAttribute('type') === 'button') &&
          tablist && tablist.getAttribute('aria-label') === 'Example tabs' &&
          tabs.length === 4 && tabs.every(t => t.getAttribute('type') === 'button') &&
          tabs[0].getAttribute('tabindex') === '0' && tabs.slice(1).every(t => t.getAttribute('tabindex') === '-1') &&
          forms && forms.getAttribute('role') === 'group' && forms.getAttribute('aria-label') === 'Forms';
        if (!initOk) return {initOk, arrowOk: false};
        tabs[0].focus();
        tabs[0].dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true, cancelable: true}));
        const arrowOk = document.activeElement === tabs[1] &&
          tabs[1].getAttribute('aria-selected') === 'true' && tabs[1].getAttribute('tabindex') === '0' &&
          tabs[0].getAttribute('aria-selected') === 'false' && tabs[0].getAttribute('tabindex') === '-1';
        return {initOk, arrowOk};
      });
      check('A11Y-3', info.initOk && info.arrowOk, JSON.stringify(info));
    } else {
      check('A11Y-3', true, 'skipped (guide page stripped from non-preview build)');
    }
  }

  // A11Y-4: sets.js .st-hits uses role="group" instead of role="listbox"
  {
    await pg.evaluate(() => { location.hash = '#sets'; V2.redraw(); });
    await pg.waitForTimeout(300);
    await pg.fill('[data-stq]', 'Gar');
    await pg.waitForTimeout(200);
    const info = await pg.evaluate(() => {
      const el = document.querySelector('.st-hits');
      return {exists: !!el, role: el ? el.getAttribute('role') : null};
    });
    check('A11Y-4', info.exists && info.role === 'group', JSON.stringify(info));
  }

  // A11Y-5: winning.js #tsIn only sets aria-controls="wt-sug" when query is non-empty, removes on Escape
  {
    await pg.evaluate(() => { location.hash = '#tournaments'; V2.redraw(); });
    await pg.waitForTimeout(300);
    const before = await pg.evaluate(() => {
      const inp = document.getElementById('tsIn');
      return {exists: !!inp, hasControls: inp ? inp.hasAttribute('aria-controls') : null};
    });
    let during = null, afterEsc = null;
    if (before.exists) {
      await pg.fill('#tsIn', 'Gar');
      await pg.waitForTimeout(200);
      during = await pg.evaluate(() => {
        const inp = document.getElementById('tsIn');
        return {controls: inp && inp.getAttribute('aria-controls'), sugExists: !!document.getElementById('wt-sug')};
      });
      await pg.press('#tsIn', 'Escape');
      await pg.waitForTimeout(150);
      afterEsc = await pg.evaluate(() => {
        const inp = document.getElementById('tsIn');
        return {hasControls: inp && inp.hasAttribute('aria-controls'), expanded: inp && inp.getAttribute('aria-expanded')};
      });
    }
    check('A11Y-5',
      before.exists && !before.hasControls &&
      during && during.controls === 'wt-sug' && during.sugExists &&
      afterEsc && !afterEsc.hasControls && afterEsc.expanded === 'false',
      JSON.stringify({before, during, afterEsc})
    );
  }

  // A11Y-6: sugs.js exclSheet [data-exhits] has no aria-live attribute (Order Q1)
  {
    const info = await pg.evaluate(() => {
      const html = typeof V2.exclSheet === 'function' ? V2.exclSheet() : '';
      const d = document.createElement('div');
      d.innerHTML = html;
      const hits = d.querySelector('[data-exhits]');
      return {exists: !!hits, ariaLive: hits ? hits.getAttribute('aria-live') : 'missing'};
    });
    check('A11Y-6', info.exists && info.ariaLive === null, JSON.stringify(info));
  }

  let failed = 0;
  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.id}: ${r.detail}`);
    if (!r.ok) failed++;
  }
  if (errs.length) {
    console.error('Page errors:', errs);
    failed++;
  }
  if (failed) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
