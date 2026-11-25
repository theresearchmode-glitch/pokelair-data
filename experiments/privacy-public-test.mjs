// About → Privacy ("Everything We Save") on the public site (night plan item 7, Nov 25). nastyplot.org shows the words Sim
// APPROVED on Nov 25 (docs/rebuild/privacy-public-draft-nov25.md), only the rows true today; the Claude-hosted page keeps today's
// words. Builds both (node app/build.mjs --v2 --public, then --v2), opens each page's #about and reads the receipt.
// Leaves app/dist/v2.html as the Claude build.
//   node experiments/privacy-public-test.mjs
import {chromium} from 'playwright'; import {spawnSync} from 'node:child_process'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT = fileURLToPath(new URL('../', import.meta.url)), OUT = ROOT + 'app/dist/v2.html', TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'npriv-'));
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const build = (args, name) => { const r = spawnSync(process.execPath, [ROOT + 'app/build.mjs', ...args], {encoding: 'utf8'}); ok(r.status === 0, `the ${name} build runs`);
  const f = path.join(TMP, name + '.html'); fs.copyFileSync(OUT, f); return f; };
const pubFile = build(['--v2', '--public'], 'public'), claudeFile = build(['--v2'], 'claude');

const b = await chromium.launch();
const open = async f => { const p = await b.newPage({viewport: {width: 1280, height: 900}}), errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + f + '#about'); await p.waitForSelector('#abt-priv li', {timeout: 15000}).catch(() => {}); await p.waitForTimeout(800);
  const rc = await p.evaluate(() => { const s = document.getElementById('abt-priv'); return !s ? null : {text: s.innerText.replace(/\s+/g, ' '),
    rows: [...s.querySelectorAll('li')].map(li => ({t: (li.querySelector('.inf-rc b') || {}).textContent || '', d: (li.querySelector('.abt-d') || {}).textContent || '', btn: !!li.querySelector('[data-abtmail="show"]')}))}; });
  return {p, errs, rc}; };
const showIn = async (p, sel) => { const before = await p.evaluate(() => document.documentElement.outerHTML.includes('hello@nastyplot.org'));
  await p.evaluate(s => { const d = document.querySelector(s); if (d && d.tagName === 'DETAILS') d.open = true; }, sel); /* a fine-print row may be folded */
  await p.click(sel + ' [data-abtmail="show"]'); await p.waitForTimeout(200);
  const got = await p.evaluate(s => { const a = document.querySelector(s + ' a[href^="mailto:"]'); return a ? a.textContent : ''; }, sel); return {before, got}; };

/* ---- public ---- */
{ const {p, errs, rc} = await open(pubFile);
  ok(!!rc, 'public: the receipt (#abt-priv) draws');
  const t = rc ? rc.text : '';
  for (const bad of ['Claude', 'anonymous ID', 'Export', 'We count visits and team checks', "We don't count visits yet"])
    ok(!t.includes(bad), `public: the receipt never says "${bad}"`);
  const titles = rc ? rc.rows.map(r => r.t) : [];
  const want = ['Your teams', 'Team codes', 'Feedback', 'Visit counts', 'Spam protection', 'No accounts, no ads', 'Kids', 'Contact', 'Not affiliated'];
  ok(JSON.stringify(titles) === JSON.stringify(want), `public: the approved rows that are true today, in order (Nov 25: counter + Turnstile built, so rows 4 and 5 are in): ${JSON.stringify(titles)}`);
  for (const s of ["Nothing about your teams is sent to us.", 'Clearing your browser data removes them.', 'To move a team to another device, use a team code.',
    'A team code holds the six Pokémon and their sets, nothing else: no name, no device, no date.', 'Anyone you give it to can open the team.',
    "There's no field for contact details, and any email address, phone number or @handle typed into a message is removed before it's saved.",
    "Only the owner reads feedback, it's never shown on the site, and it's deleted after 180 days.", 'We count team checks as plain totals (for example "1,200 team checks today"): no cookies, no ads, no tracking across other sites, nothing that identifies you.', "The feedback form uses Cloudflare Turnstile to check a person is sending it, not a bot.", "We don't store IP addresses.",
    'There are no accounts, no logins, no ads and no third-party trackers.', "The site's fonts and pictures come from NastyPlot itself.",
    'Lots of young players use NastyPlot, so we never ask for names, emails or anything personal.', 'a parent can ask us to delete it: tap "Show email" below.',
    'Questions, deletion requests or a mistake on the site.', 'NastyPlot is an unofficial fan site, not affiliated with Nintendo, Game Freak or The Pokémon Company.'])
    ok(t.includes(s), `public: says "${s.slice(0, 70)}${s.length > 70 ? '...' : ''}"`);
  const ki = titles.indexOf('Kids'), ci = titles.indexOf('Contact');
  ok(ki >= 0 && ci > ki && rc.rows[ci].btn, 'public: "tap Show email below" points at a real Show email button in the Contact row under Kids');
  const li = '#abt-priv li:nth-child(' + (ci + 1) + ')', m = ci >= 0 ? await showIn(p, li) : {before: true, got: ''};
  ok(!m.before && m.got === 'hello@nastyplot.org', `public: the address is not in the page until the tap, then shows in the Contact row (${m.got || 'nothing'})`);
  const fp = await showIn(p, '#abt-contact');
  ok(fp.got === 'hello@nastyplot.org', `public: the fine print's own Show Email still opens in its box (${fp.got || 'nothing'})`);
  ok(!errs.length, 'public: no page errors' + (errs.length ? ': ' + errs[0].slice(0, 120) : '')); await p.close(); }

/* ---- Claude-hosted: today's words, unchanged ---- */
{ const {p, errs, rc} = await open(claudeFile);
  const titles = rc ? rc.rows.map(r => r.t) : [];
  ok(JSON.stringify(titles) === JSON.stringify(['Your teams', 'Usage counts', 'Feedback', 'One anonymous ID', 'On this device only', 'Fonts']), `claude: today's six rows (${JSON.stringify(titles)})`);
  const t = rc ? rc.text : '';
  ok(t.includes('Your Claude account') && t.includes('the same anonymous ID that Claude gives this page') && t.includes('never reads them from your Claude account'), "claude: today's words and closing line are there");
  ok(!t.includes('Team codes') && !t.includes('team checks as plain totals'), 'claude: none of the public rows');
  const fp = await showIn(p, '#abt-contact');
  ok(fp.got === 'hello@nastyplot.org' && !fp.before, `claude: the fine print's Show Email works as today (${fp.got || 'nothing'})`);
  ok(!errs.length, 'claude: no page errors' + (errs.length ? ': ' + errs[0].slice(0, 120) : '')); await p.close(); }
await b.close();

/* the held words wait in the source, word for word, to switch on later */
{ const src = fs.readFileSync(ROOT + 'app/src/v2/pages/about.js', 'utf8');
  ok(/V2\.ABT_PUB_LATER\s*=/.test(src) && src.includes("and it's deleted after 180 days.") && src.includes('Cloudflare Turnstile') && src.includes("Cloudflare's privacy-first analytics") && src.includes('use a team code or Export.'),
    'the held approved words (180 days, Turnstile, visit counts, Export) are kept in V2.ABT_PUB_LATER'); }
fs.rmSync(TMP, {recursive: true, force: true});
console.log(`privacy-public: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
