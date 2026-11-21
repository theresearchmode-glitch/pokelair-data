// Measures each mock-up's phone height at 390 and today's page height at 390 (from the inventory), and writes a table into notes/_heights.json.
import { createRequire } from 'module'; import fs from 'fs';
const { chromium } = createRequire('C:/Users/simra/code/pl-mascot/package.json')('playwright');
const DIR = 'C:/Users/simra/code/pl-cohesion/docs/rebuild/mocks/cohesion-nov21/pages';
const out = JSON.parse(fs.existsSync(new URL('./notes/_heights.json', import.meta.url)) ? fs.readFileSync(new URL('./notes/_heights.json', import.meta.url), 'utf8') : '{}');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
for (const id of process.argv.slice(2)) {
  await p.goto('file:///' + DIR + '/' + id + '.html'); await p.waitForTimeout(300);
  const mock = await p.evaluate(() => document.documentElement.scrollHeight);
  const inv = JSON.parse(fs.readFileSync(new URL(`./inv/${id.replace(/-b$/, '')}.json`, import.meta.url), 'utf8'));
  out[id] = { mock, today: inv.m.h };
}
await b.close();
fs.writeFileSync(new URL('./notes/_heights.json', import.meta.url), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(12), 'mock', v.mock, 'px', (v.mock / 844).toFixed(2), '| today', v.today, 'px', (v.today / 844).toFixed(2), v.mock <= v.today ? 'OK' : 'LONGER');
