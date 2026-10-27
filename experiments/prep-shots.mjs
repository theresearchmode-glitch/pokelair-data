// Screenshots of the scouting report (Team page) and the Gauntlet, phone + desktop, dark + light, with the user's old 97
// team loaded. Usage: node experiments/prep-shots.mjs <outDir>
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const dir = process.argv[2]; fs.mkdirSync(dir, {recursive: true});
const page = APP + 'shots-prep.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const USER = `Raichu @ Raichunite X\nAbility: Lightning Rod\nJolly Nature\n- Fake Out\n- Protect\n- Volt Tackle\n- Volt Switch\n\nSneasler @ Psychic Seed\nAbility: Unburden\nEVs: 2 HP / 32 Atk / 32 Spe\nAdamant Nature\n- Close Combat\n- Dire Claw\n- Protect\n- Fake Out\n\nPrimarina @ Leftovers\nAbility: Liquid Voice\nModest Nature\n- Hyper Voice\n- Protect\n- Moonblast\n- Calm Mind\n\nCharizard @ Charizardite Y\nAbility: Blaze\nTimid Nature\n- Heat Wave\n- Protect\n- Weather Ball\n- Solar Beam\n\nFarigiraf @ Sitrus Berry\nAbility: Armor Tail\nBold Nature\n- Trick Room\n- Helping Hand\n- Psychic\n- Thunderbolt\n\nHydreigon @ Choice Scarf\nAbility: Levitate\nModest Nature\n- Dark Pulse\n- Draco Meteor\n- Earth Power\n- Snarl`;
const b = await chromium.launch(), errs = [];
for (const [w, h, tag] of [[390, 844, 'phone'], [1366, 900, 'desk']]) for (const scheme of ['dark', 'light']) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: w < 700 ? 2 : 1, isMobile: w < 700, hasTouch: w < 700, colorScheme: scheme}), pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; try { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"x"'); } catch (e) {} }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(3000);
  await pg.evaluate(t => window.__ev(`(()=>{const u=parsePaste(${JSON.stringify(t)});S.slots=normSlots(u.slots);fixSlots();S.loadedId=null;planCache={key:null,plans:[]};render();setView('build');window.scrollTo(0,0)})()`), USER);
  await pg.waitForTimeout(1500);
  await pg.screenshot({path: `${dir}/team_${tag}_${scheme}.png`, fullPage: false});
  // open the threat card's Unanswered group and the first threat
  await pg.evaluate(() => { const r = document.querySelector('#thrCard .thrrow'); if (r) r.open = true; const c = document.getElementById('thrCard'); if (c) c.scrollIntoView({block: 'start'}); });
  await pg.waitForTimeout(300); await pg.screenshot({path: `${dir}/threats_${tag}_${scheme}.png`});
  if (scheme === 'dark') { await pg.evaluate(() => { const s = document.getElementById('sugs'); if (s) s.scrollIntoView({block: 'start'}); }); await pg.waitForTimeout(300); await pg.screenshot({path: `${dir}/plans_${tag}.png`});
    await pg.evaluate(() => window.__ev("setView('gauntlet');window.scrollTo(0,0)")); await pg.waitForTimeout(3000);
    await pg.evaluate(() => { const d = document.querySelector('.gprep'); if (d) { d.open = true; d.closest('.gitem').scrollIntoView({block: 'start'}); } }); await pg.waitForTimeout(300);
    await pg.screenshot({path: `${dir}/gauntlet_${tag}.png`}); }
  await ctx.close(); }
await b.close(); fs.unlinkSync(page); console.log('shots in', dir, errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no page errors');
