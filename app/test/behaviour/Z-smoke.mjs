// Kit self-test: proves the harness, frozen data, fake account and adapter work before the real groups are written.
import {group, open, TEAM, expect} from './harness.mjs';
const t = group('Z-smoke');
t('KIT-01', 'opens with a team, shows My Team with all six, no page errors', async () => {
  const {ui, errs, close} = await open({team: TEAM}); await ui.go('My Team');
  const tx = await ui.text(); for (const n of ['Garchomp', 'Incineroar', 'Sneasler']) expect(tx.includes(n), `My Team doesn't show ${n}`);
  expect(!errs.length, 'page errors: ' + errs.join(' | ')); await close(); });
t('KIT-02', 'a change is saved to the fake account', async () => {
  const {ui, acct, close} = await open({team: TEAM}); await ui.peek(`S.slots[5]={n:'',a:null,lock:false};render()`); await ui.pg.waitForTimeout(1200);
  const a = await acct(); expect(a && a.slots && !a.slots[5].n, 'removal not saved to the account'); await close(); });
t('KIT-03', 'a reload keeps what the player saved (account and this browser)', async () => {
  const {ui, acct, ls, close} = await open({team: TEAM}); await ui.peek(`S.slots[5]={n:'',a:null,lock:false};render()`); await ui.pg.waitForTimeout(1200);
  await ui.reload(); const tm = await ui.team(); expect(tm && tm.length === 5, 'after reload the team has ' + (tm && tm.length) + ' (the removal was lost)');
  const a = await acct(); expect(a && !a.slots[5].n, 'account copy lost the removal'); await close(); });
