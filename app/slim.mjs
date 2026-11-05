// Lighter page (Sim, Nov 5): shrinks dist/page.html after build.mjs, with no change to what the page does or looks like.
//  1. Dead CSS: a selector that names a class or id appearing nowhere in the page's HTML or scripts can never match, so it is
//     dropped (a rule goes when all of its selectors are dead). Tokens are checked as whole words against every script and
//     the markup, so a class built at runtime from a literal ("ar-" + x) is kept whenever its full name is spelled anywhere;
//     a selector is only dropped when one of its names is spelled nowhere at all. Rules inside @keyframes are left alone.
//  2. esbuild minifies the CSS (whitespace, colours, shorthands) and strips whitespace from the scripts (no renaming).
// Runs at the end of node app/build.mjs (skip with --no-slim); alone: node app/build.mjs --no-slim && node app/slim.mjs
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const R = createRequire(import.meta.url); const esbuild = R('esbuild');
const dir = fileURLToPath(new URL('.', import.meta.url)), file = dir + 'dist/page.html';
let html = fs.readFileSync(file, 'utf8'); const before = html.length;

// every word-ish token that appears in the markup and scripts (not in the CSS)
const nonCss = html.replace(/<style>[\s\S]*?<\/style>/g, ' ');
const words = new Set(nonCss.match(/[A-Za-z_][\w-]*/g));
// names built at runtime from a spelled prefix ("is-" + state, `ar-c${n}`) count as present when their prefix is spelled
const has = n => { if (words.has(n)) return true; for (let k = n.length - 1; k > 0; k--) if ((n[k - 1] === '-' || n[k - 1] === '_') && words.has(n.slice(0, k))) return true;
  const base = n.replace(/\d+$/, ''); return base !== n && words.has(base); };
// class/id names a selector needs, ignoring anything inside :not(...) / :is() / :where() / :has() argument lists only when the
// pseudo is :not (a :not() name that never exists cannot stop a match)
const needed = sel => { const s = sel.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, ''); const out = [];
  // inside :is()/:where()/:has() any one alternative may match, so names in those lists are not "needed"
  const flat = s.replace(/:(?:is|where|has|matches)\((?:[^()]|\([^()]*\))*\)/g, '');
  for (const m of flat.matchAll(/([.#])([A-Za-z_][\w-]*)/g)) out.push(m[2]); return out; };
const splitTop = s => { const out = []; let d = 0, cur = '';
  for (const ch of s) { if (ch === '(' || ch === '[') d++; if (ch === ')' || ch === ']') d--; if (ch === ',' && d === 0) { out.push(cur); cur = ''; } else cur += ch; }
  out.push(cur); return out; };
let removedRules = 0, removedSels = 0;
const prune = css => { let out = '', i = 0;
  while (i < css.length) {
    const ob = css.indexOf('{', i); if (ob < 0) { out += css.slice(i); break; }
    const head = css.slice(i, ob), headT = head.trim();
    // find the matching close brace
    let d = 1, j = ob + 1; while (j < css.length && d) { if (css[j] === '{') d++; else if (css[j] === '}') d--; j++; }
    const body = css.slice(ob + 1, j - 1);
    if (headT.startsWith('@')) { // at-rule: recurse into @media/@supports/@layer, keep others (keyframes, font-face) whole
      out += head + '{' + (/^@(media|supports|layer|container)\b/.test(headT) ? prune(body) : body) + '}'; }
    else { const sels = splitTop(head), live = sels.filter(s => needed(s).every(has));
      removedSels += sels.length - live.length;
      if (live.length) out += live.join(',') + '{' + body + '}'; else removedRules++; }
    i = j; }
  return out; };
html = html.replace(/<style>([\s\S]*?)<\/style>/g, (m, css) => '<style>' + prune(css) + '</style>');
// 1b. The specificity prefix (":root:not(#_a):not(#_b)…", from @A/@R/@C in build.mjs) written short: ":root:not(#_#_…)" with the
//     same number of ids gives the identical specificity and still always matches (nothing has id "_"), at about a third of
//     the bytes (Nov 5, debloat).
let prefixSaved = 0;
html = html.replace(/<style>([\s\S]*?)<\/style>/g, (m, css) => '<style>' + css.replace(/:root((?::not\(#_[A-Za-z0-9]+\))+)/g, (all, nots) => {
  const n = (nots.match(/:not\(/g) || []).length, out = ':root:not(' + '#_'.repeat(n) + ')'; prefixSaved += all.length - out.length; return out; }) + '</style>');
const afterPrune = html.length;
// minify
html = html.replace(/<style>([\s\S]*?)<\/style>/g, (m, css) => '<style>' + esbuild.transformSync(css, {loader: 'css', minify: true}).code.trim() + '</style>');
html = html.replace(/<script>([\s\S]*?)<\/script>/g, (m, js) => '<script>' + esbuild.transformSync(js, {loader: 'js', minifyWhitespace: true, target: 'es2020'}).code.trim() + '</script>');
fs.writeFileSync(file, html);
console.log(`slim: ${(before / 1024 | 0)} KB -> ${(html.length / 1024 | 0)} KB (dead CSS ${(before - afterPrune) / 1024 | 0} KB: ${removedRules} rules, ${removedSels} selectors; short prefix ${prefixSaved / 1024 | 0} KB)`);
