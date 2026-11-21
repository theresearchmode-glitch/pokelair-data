import { createRequire } from 'module';
const { chromium } = createRequire('C:/Users/simra/code/pl-mascot/package.json')('playwright');
const DIR = 'C:/Users/simra/code/pl-cohesion/docs/rebuild/mocks/cohesion-nov21/pages/';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
for (const id of process.argv.slice(2)) {
  await p.goto('file:///' + DIR + ({ meta: '../ratings2' }[id] || id) + '.html'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const out = []; for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.width && r.right > innerWidth + 1 && !e.closest('.tick')) { if (![...e.children].some(c => c.getBoundingClientRect().right > innerWidth + 1)) out.push(`${e.tagName}.${(e.className && e.className.baseVal === undefined ? e.className : '').toString().slice(0, 30)} r=${Math.round(r.right)} "${(e.textContent || '').trim().slice(0, 24)}"`); } } return [document.documentElement.scrollWidth, ...out.slice(0, 5)]; });
  console.log(id, JSON.stringify(r));
}
await b.close();
