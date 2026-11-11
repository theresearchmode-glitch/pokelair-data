// v2 guard rails (R3, Nov 11): the new build's CSS and inline styles must follow docs/rebuild/design-system.md.
// Fails (exit 1) on:
//   1. !important (the one allowed place: inside @media (prefers-reduced-motion))
//   2. id selectors (#name) in CSS: every rule is a class, so no rule ever needs to out-shout another
//   3. font sizes off the type scale: font-size / font shorthand must use var(--tNN), never a literal size
//   4. colours outside tokens.css: no hex, rgb(), hsl() or named colours in the other CSS files or in inline styles
//   5. spacing off the 4px grid: margin / padding / gap / inset literals must be 0, 1, 2, 6 or a multiple of 4 px
// Usage: node app/test/v2-guard.mjs        (also run by `node app/build.mjs --v2`)
// What it can't see: values computed in JS at run time (V2.toast's bottom offset) and colours inside SVG art data.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'v2');
const CSS = path.join(ROOT, 'css');
const found = [];
const add = (file, line, rule, text) => found.push({file: path.relative(path.join(ROOT, '..', '..'), file), line, rule, text: text.trim().slice(0, 110)});

// rgba(var(--cp),a) is allowed: the colour comes from a token or from the picture's own measured colour
const COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|lab|lch)\((?!\s*var\()|\b(?:white|black|red|blue|green|gray|grey|silver|orange|yellow|purple|pink)\b/;
const SPACE_PROPS = /^(?:margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left|margin-[a-z-]+|padding-[a-z-]+)$/;
const okPx = n => n === 0 || n === 1 || n === 2 || n === 6 || n % 4 === 0;

// strip comments but keep line numbers
const noComments = s => s.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
const lineOf = (s, i) => s.slice(0, i).split('\n').length;

// walk "selector { decls }" blocks, tracking the @media we are inside
function blocks(src) {
  const out = []; const stack = []; let i = 0, start = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '{') { stack.push({head: src.slice(start, i).trim(), at: i}); start = i + 1; }
    else if (c === '}') {
      const b = stack.pop(); if (!b) { i++; continue; }
      const body = src.slice(b.at + 1, i);
      if (!body.includes('{')) out.push({head: b.head, body, at: b.at + 1, media: stack.map(x => x.head).join(' ')});
      start = i + 1;
    }
    i++;
  }
  return out;
}

function checkDecls(file, src, body, at, media, isTokens) {
  const re = /([a-z-]+)\s*:\s*([^;]+)/g; let m;
  while ((m = re.exec(body))) {
    const [, prop, val] = m; const ln = lineOf(src, at + m.index), text = prop + ':' + val;
    if (prop.startsWith('--')) { if (!isTokens && COLOUR.test(val)) add(file, ln, 'colour outside tokens.css', text); continue; }
    if (/!important/.test(val) && !/prefers-reduced-motion/.test(media)) add(file, ln, '!important', text);
    if (!isTokens && COLOUR.test(val.replace(/url\([^)]*\)/g, ''))) add(file, ln, 'colour outside tokens.css', text);
    if (prop === 'font-size' && !/^\s*(?:var\(--(?:t\d+|d\d+|d-[a-z]+|unit)\)|inherit|1em|100%)\s*$/.test(val)) add(file, ln, 'font size off the scale', text);
    if (prop === 'font') { const sz = val.match(/(?:^|\s)(\d+(?:\.\d+)?(?:px|rem|em))(?:\/|\s)/); if (sz) add(file, ln, 'font size off the scale', text); }
    if (SPACE_PROPS.test(prop)) for (const px of val.matchAll(/(-?\d+(?:\.\d+)?)px/g)) { if (/calc\(/.test(val)) break; if (!okPx(Math.abs(+px[1]))) add(file, ln, 'spacing off the 4px grid', text); }
  }
}

for (const f of fs.readdirSync(CSS).filter(f => f.endsWith('.css'))) {
  const file = path.join(CSS, f), raw = fs.readFileSync(file, 'utf8'), src = noComments(raw), isTokens = f === 'tokens.css';
  for (const b of blocks(src)) {
    if (/^@/.test(b.head) && !/^@media|^@supports|^@layer/.test(b.head)) continue; // @keyframes steps, @font-face
    for (const sel of b.head.split(',')) if (/(^|[\s>+~(])#[A-Za-z_][\w-]*/.test(sel)) add(file, lineOf(src, b.at), 'id selector', sel);
    checkDecls(file, src, b.body, b.at, b.media, isTokens);
  }
}

// inline styles in the v2 scripts and head: only custom properties and var() values are allowed to carry colours
for (const f of ['shell.js', 'head.html', 'body.html', ...fs.readdirSync(path.join(ROOT, 'pages')).map(p => 'pages/' + p)]) {
  const file = path.join(ROOT, f); if (!fs.existsSync(file)) continue; const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/style="([^"]*)"/g)) checkDecls(file, src, m[1], m.index + 7, '', false);
}

if (found.length) {
  console.log(`v2 guard: ${found.length} finding(s)`);
  for (const x of found) console.log(`  ${x.file}:${x.line}  ${x.rule}  ${x.text}`);
  process.exit(1);
}
console.log('v2 guard: clean (no !important outside reduced motion, no id selectors, type and spacing on the scale, colours only in tokens.css)');
