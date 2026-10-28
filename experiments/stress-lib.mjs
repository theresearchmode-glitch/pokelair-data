// Shared loader for the stress tests: opens the built page in Chromium with the repo's data (or overridden docs)
// and returns {pg, ev, close, errs}. ev(code, arg) runs code inside the page's closure.
import fs from 'node:fs'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
export const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/';
export const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8').replace(/^﻿/, '')); } catch (e) { return null; } };
export function baseDocs() { const L = rd('limitless.json');
  return {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
    'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')}; }
let n = 0;
export async function openPage(docs, {wait = 3500, browser} = {}) {
  const page = APP + `stress-${process.pid}-${n++}.html`;
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const b = browser || await chromium.launch(), ctx = await b.newContext(), pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { window.__PL_TEST = true; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, docs || baseDocs());
  await pg.goto('file://' + page); await pg.waitForTimeout(wait); fs.unlinkSync(page);
  const ev = (code, arg) => pg.evaluate(([c, a]) => { window.__arg = a; return window.__ev(c); }, [code, arg === undefined ? null : arg]);
  return {pg, ev, errs, close: async () => { await ctx.close(); if (!browser) await b.close(); }};
}
