// Checks the feedback box, the What's new note and back-button page history in a real browser, with a fake db and owner.
// Usage: node experiments/feedback-check.mjs [shotDir]
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('../app/', import.meta.url)), shots = process.argv[2];
const page = APP + 'fbcheck.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), fails = []; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'dark'}), pg = await ctx.newPage();
pg.on('pageerror', e => fails.push('page error: ' + e.message));
await pg.addInitScript(() => { window.__store = {}; const S = window.__store;
  const doc = p => ({get: async () => ({exists: p in S, data: () => S[p]}), set: async d => { S[p] = JSON.parse(JSON.stringify(d)); },
    update: async d => { if (!(p in S)) throw Object.assign(new Error('missing'), {code: 'invalid_argument'}); const m = (a, b) => { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') m(a[k], b[k]); else a[k] = JSON.parse(JSON.stringify(b[k])); } }; m(S[p], d); },
    onSnapshot: cb => { setTimeout(() => cb({exists: false, data: () => null}), 5); return () => {}; }});
  window.claude = {use: async n => n === 'db' ? {doc, collection: c => ({get: async () => ({docs: Object.keys(S).filter(k => k.startsWith(c + '/')).map(k => ({id: k, data: () => S[k]}))})})}
    : n === 'user' ? {isOwner: () => true, can: () => true, id: async () => 'u1'} : null};
  try { localStorage.setItem('cc2.welcomed', '"1"'); } catch (e) {} });
await pg.goto('file://' + page); await pg.waitForTimeout(3000);
const ev = c => pg.evaluate(c => window.__ev(c), c);
await ev("setView('home')"); await pg.waitForTimeout(300);
ok(await pg.$('#wnewCard'), "What's new shows for a returning visitor");
if (shots) { await pg.$eval('#wnewCard', e => e.scrollIntoView({block: 'center'})); await pg.screenshot({path: shots + '/whatsnew.png'}); }
await pg.click('[data-wnewx]'); ok(!(await pg.$('#wnewCard')), "What's new dismisses");
await ev("render();setView('home')"); ok(!(await pg.$('#wnewCard')), "What's new stays dismissed");
// feedback
ok(await pg.$('.hfb .fbbtn'), 'feedback button on Home');
ok(await pg.$eval('.legal .fbbtn', e => !e.hidden), 'feedback button in the footer');
await ev("setView('calc')"); await pg.click('.legal .fbbtn'); await pg.waitForTimeout(200);
ok(await pg.$eval('#fbSheet', e => !e.hidden), 'feedback sheet opens');
await pg.click('#fbSend'); ok((await pg.textContent('#fbMsg')).includes('few words'), 'empty message is refused');
await pg.click('[data-fbk="bug"]'); await pg.fill('#fbText', 'Calc froze when I picked Tera.');
if (shots) await pg.screenshot({path: shots + '/feedback.png'});
await pg.click('#fbSend'); await pg.waitForTimeout(300);
let st = await pg.evaluate(() => window.__store['feedback/u1']); const m1 = st && Object.values(st.m || {});
ok(m1 && m1.length === 1 && m1[0].k === 'bug' && m1[0].v === 'calc' && m1[0].t.startsWith('Calc froze'), 'message saved with kind and page');
ok(await pg.$eval('#fbSheet', e => e.hidden), 'sheet closes after sending');
await pg.click('.legal .fbbtn'); await pg.fill('#fbText', 'Love the sleepers.'); await pg.click('[data-fbk="like"]'); await pg.click('#fbSend'); await pg.waitForTimeout(300);
st = await pg.evaluate(() => window.__store['feedback/u1']); ok(Object.keys(st.m).length === 2, 'second message adds, first kept');
// report a mistake (Nov trust pass): one tap on a Pokémon sheet or the calc result, context filled in, the note optional
await ev("lairSheet('Incineroar')"); await pg.waitForTimeout(200);
ok(await pg.$eval('#lairSheet .fbmis', e => !e.hidden), 'Report a mistake shows on the Pokémon sheet');
await pg.click('#lairSheet .fbmis'); await pg.waitForTimeout(200);
ok((await pg.textContent('#fbSheet .fbctx')).includes('Incineroar · rated'), 'sheet report is filled in with the Pokémon and its numbers');
await pg.click('#fbSend'); await pg.waitForTimeout(300);
st = await pg.evaluate(() => window.__store['feedback/u1']); { const x = Object.values(st.m).find(m => m.k === 'mistake'); ok(x && /Incineroar/.test(x.c) && x.t === '', 'sent with no note: kind "mistake", context saved'); }
await ev("lairClose();setView('calc')"); await pg.waitForTimeout(300);
ok(await pg.$eval('#dcOut .fbmis', e => !e.hidden), 'Report a mistake shows under the calc result');
await pg.click('#dcOut .fbmis'); await pg.waitForTimeout(200);
{ const c = await pg.textContent('#fbSheet .fbctx'); ok(/Attacker: .*Defender: .*Move: .*Field: .*Result shown: /s.test(c), 'calc report carries attacker, defender, move, field and the result'); }
await pg.fill('#fbText', 'Should be a KO'); await pg.click('#fbSend'); await pg.waitForTimeout(300);
st = await pg.evaluate(() => window.__store['feedback/u1']); ok(Object.values(st.m).filter(m => m.k === 'mistake').length === 2, 'calc report saved');
await pg.click('.legal .fbbtn'); await pg.waitForTimeout(150); ok(!(await pg.$('#fbSheet .fbctx')) && (await pg.$('[data-fbk="mistake"]')), 'the plain Feedback button opens without the context (Wrong info is one of the kinds)'); await ev('fbClose()');
await ev("setView('home')"); await pg.waitForTimeout(200); await pg.$eval('#fbBox', d => { d.open = true; }); await pg.waitForTimeout(400);
ok((await pg.textContent('#fbOut')).includes('Calc froze') && (await pg.textContent('#fbOut')).includes('4 messages') && (await pg.textContent('#fbOut')).includes('Wrong info'), 'owner sees the feedback list (with the mistake reports)');
if (shots) { await pg.$eval('#fbBox', e => e.scrollIntoView({block: 'start'})); await pg.screenshot({path: shots + '/fblist.png'}); }
// back button
await ev("setView('home')"); await pg.click('.bnav [data-view="report"]'); await pg.click('.bnav [data-view="ratings"]'); await pg.click('.bnav [data-view="matchup"]');
await pg.goBack(); await pg.waitForTimeout(200); ok(await ev('view') === 'ratings', 'back: Battle mode -> Ratings');
await pg.goBack(); await pg.waitForTimeout(200); ok(await ev('view') === 'report', 'back: Ratings -> Report');
await pg.goForward(); await pg.waitForTimeout(200); ok(await ev('view') === 'ratings', 'forward: Report -> Ratings');
await ev("lairSheet('Incineroar')"); await pg.waitForTimeout(200); ok(await pg.$eval('#lairSheet', e => !e.hidden), 'sheet open');
await pg.goBack(); await pg.waitForTimeout(200); ok(await pg.$eval('#lairSheet', e => e.hidden) && await ev('view') === 'ratings', 'back closes the sheet, stays on Ratings');
await pg.goBack(); await pg.waitForTimeout(200); ok(await ev('view') === 'report', 'next back goes to the previous page');
await ev("setView('calc')"); await ev("setView('calc')"); await pg.goBack(); await pg.waitForTimeout(200); ok(await ev('view') === 'report', 'same page twice adds one step');
await b.close(); fs.unlinkSync(page);
console.log(fails.length ? `\n${fails.length} FAILED\n` + fails.join('\n') : '\nALL PASSED'); process.exit(fails.length ? 1 : 0);
