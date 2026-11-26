// Job 64 (speed program): prerender each public page's above-the-fold first screen into static HTML + inline pruned critical CSS
// + load full /v2.css asynchronously (CSP-safe via hashed inline script, no inline event handler).
// Called by app/build.mjs on PUBLIC && SPLIT builds (real deploy, security-csp-test, split-routes-cross-test).
// Every page keeps <link rel="stylesheet" href="/v2.css?v=..." media="print" id="np-css"> so tests checking /v2.css pass and
// the full stylesheet activates as soon as it arrives with zero layout shift.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

/* Safe CSS rule pruner (same token-matching rule as app/slim.mjs & Job 61 static.css):
   keeps all @layer/@media/@supports/@container/@keyframes structure and drops rules whose class/id tokens never appear in htmlText. */
export function pruneCss(css, htmlText) {
  const nonCss = htmlText.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  const words = new Set(nonCss.match(/[A-Za-z_][\w-]*/g) || []);
  const has = n => {
    if (words.has(n)) return true;
    for (let k = n.length - 1; k > 0; k--) {
      if ((n[k - 1] === '-' || n[k - 1] === '_') && words.has(n.slice(0, k))) return true;
    }
    const base = n.replace(/\d+$/, '');
    return base !== n && words.has(base);
  };
  const needed = sel => {
    const s = sel.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, '');
    const flat = s.replace(/:(?:is|where|has|matches)\((?:[^()]|\([^()]*\))*\)/g, '');
    const out = [];
    for (const m of flat.matchAll(/([.#])([A-Za-z_][\w-]*)/g)) out.push(m[2]);
    return out;
  };
  const splitTop = s => {
    const out = [];
    let d = 0, cur = '';
    for (const ch of s) {
      if (ch === '(' || ch === '[') d++;
      if (ch === ')' || ch === ']') d--;
      if (ch === ',' && d === 0) { out.push(cur); cur = ''; } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const prune = src => {
    let out = '', i = 0;
    while (i < src.length) {
      const ob = src.indexOf('{', i), sc = src.indexOf(';', i);
      if (sc >= 0 && (ob < 0 || sc < ob)) { out += src.slice(i, sc + 1); i = sc + 1; continue; }
      if (ob < 0) { out += src.slice(i); break; }
      const head = src.slice(i, ob), headT = head.trim();
      let d = 1, j = ob + 1;
      while (j < src.length && d) {
        if (src[j] === '{') d++;
        else if (src[j] === '}') d--;
        j++;
      }
      const body = src.slice(ob + 1, j - 1);
      if (headT.startsWith('@')) {
        if (/^@(media|supports|layer|container)\b/.test(headT)) {
          const inner = prune(body);
          if (inner.trim()) out += head + '{' + inner + '}';
        } else {
          out += head + '{' + body + '}';
        }
      } else {
        const sels = splitTop(head), live = sels.filter(s => needed(s).every(has));
        if (live.length) out += live.join(',') + '{' + body + '}';
      }
      i = j;
    }
    return out;
  };
  return prune(css);
}

/* CSP-safe async /v2.css activator: identical across all pages so one sha256 hash in _headers covers every page. */
export const CSS_LOADER_SCRIPT = `(function(){var l=document.getElementById('np-css');if(!l)return;var s=function(){l.media='all'};if(l.sheet)s();else{l.addEventListener('load',s);l.addEventListener('error',s)}})()`;

function applyFirstScreen(html, routeKey, preMainHtml, critCss) {
  let out = html;
  if (preMainHtml) {
    out = out.replace(
      /<main class="np-main" id="main">[\s\S]*?<\/main>/,
      () => `<main class="np-main" id="main" data-np-pre="${routeKey}">${preMainHtml}</main>`
    );
  }
  if (critCss) {
    out = out.replace(
      /<link rel="stylesheet" href="(\/v2\.css\?v=[^"]+)">/,
      (_, href) => `<style id="np-crit">${critCss}</style>\n<link rel="stylesheet" href="${href}" media="print" id="np-css"><noscript><link rel="stylesheet" href="${href}"></noscript><script>${CSS_LOADER_SCRIPT}</script>`
    );
  }
  return out;
}

export async function prerenderFirstScreens({dir, ownFileRows, seen}) {
  const dist = dir + 'dist/', root = path.resolve(dir, '..') + '/';
  if (!fs.existsSync(dist + 'v2.css') || !fs.existsSync(dist + 'v2.html')) return null;
  const v2Css = fs.readFileSync(dist + 'v2.css', 'utf8');

  let chromium = null;
  try { ({chromium} = await import('playwright')); } catch (e) { console.log('v2: playwright not installed, skipping first-screen prerender'); return null; }

  /* Load today's daily documents from out/ (same as public-site.mjs and static-pages.mjs) */
  const here = process.cwd();
  let docs = {};
  try {
    process.chdir(root);
    const {DOC_SOURCES} = await import(root + 'split-docs.mjs');
    const {perfDoc} = await import(root + 'app/data-docs.mjs');
    const rd = f => { try { return JSON.parse(fs.readFileSync('out/' + f, 'utf8')); } catch (e) { return null; } };
    docs = Object.fromEntries(Object.entries(DOC_SOURCES).map(([k, g]) => [k, g()]));
    docs.perf = perfDoc(rd('limitless.json'), rd('perf.json'));
  } finally { process.chdir(here); }

  const T = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp'};
  const srv = http.createServer((q, s) => {
    const p = decodeURIComponent(q.url.split('?')[0]);
    const dm = p.match(/^\/data\/([a-z_0-9]+)\.json$/);
    if (dm) { s.writeHead(200, {'content-type': 'application/json'}); s.end(JSON.stringify(docs[dm[1]] ?? null)); return; }
    let f = path.join(dist, p);
    if ((!f.startsWith(dist) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) && p.startsWith('/art/')) {
      f = path.join(dir, 'src/v2', p);
    }
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = dist + 'v2.html';
    s.writeHead(200, {'content-type': T[path.extname(f)] || 'application/octet-stream'});
    fs.createReadStream(f).pipe(s);
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));

  const b = await chromium.launch();
  let rendered;
  try {
    const pg = await b.newPage({viewport: {width: 390, height: 844}});
    await pg.goto(`http://127.0.0.1:${srv.address().port}/`, {waitUntil: 'networkidle'});
    await pg.waitForFunction(() => window.V2 && V2.dataReady && V2.dataReady(), null, {timeout: 30000});

    const toolKeys = ownFileRows.map(r => r.key);
    const pkList = [...seen].map(([s, n]) => ({s, n}));

    rendered = await pg.evaluate(async ({toolKeys, pkList}) => {
      const loadChunk = async rk => {
        if (!window.__NP_ROUTES || !window.__NP_ROUTES[rk]) return;
        const set = V2.routeSet ? V2.routeSet(rk) : [rk];
        await Promise.all(set.map(k => V2.routeJs ? V2.routeJs(k).catch(() => {}) : Promise.resolve()));
      };

      /* 1. Home first screen: the Stampede hero wrapped in <div class="sd"> (matches V2.sdPage for in-place V2.morph hydration) */
      let homeHtml = '';
      try {
        if (V2.sdHero) {
          const box = document.createElement('div');
          box.innerHTML = `<div class="sd">${V2.sdHero()}</div>`;
          const sec = box.querySelector('.sdh');
          if (sec) sec.classList.remove('sdh-surge');
          const herd = box.querySelector('.sdh-herd');
          if (herd) herd.innerHTML = '';
          homeHtml = box.innerHTML;
        }
      } catch (e) {}

      /* 2. All Pokémon pages: exact above-the-fold header + hero card (V2.pkTop) with fetchpriority="high" on img.k-art */
      await loadChunk('pokemon');
      const pokemonHtml = {};
      if (typeof ROSTER === 'object' && V2.pkTop && V2.pkDex && V2.kHead) {
        const byN = new Map(ROSTER.map(p => [p.n, p]));
        for (const {s, n} of pkList) {
          const p = byN.get(n);
          if (!p) continue;
          try {
            const E = V2.esc, H = lairHead(p), dex = V2.pkDex(p);
            const lead = `Pokémon Champions · VGC doubles, ${regName().replace(/ /g, '\u00a0').replace(/-/g, '\u2011')}. ${H.tot ? `Rated from ${basisNum(H.tot, true)} real tournament teams.` : V2.unrated(p) ? 'No tournament teams yet: not rated yet.' : 'No tournament teams yet: rated from its stats, typing and tools.'}${H.thinR && !V2.unrated(p) ? ' Early read: few games so far.' : ''}`;
            const ty = (V2.byName && V2.byName.get(p.n) && V2.byName.get(p.n).t) || p.t || [];
            const c1 = V2.TYPES.includes(ty[0]) ? ty[0] : 'Normal', c2 = V2.TYPES.includes(ty[1]) ? ty[1] : c1;
            let top = V2.pkTop(p).replace('<ul class="k-facts">', '<ul class="k-facts pk-hfx">');
            top = top.replace('<img class="k-art"', '<img class="k-art" fetchpriority="high"');
            pokemonHtml[s] = `<div class="ra pk pkf" style="--pk-c1:var(--ty-${c1});--pk-c2:var(--ty-${c2})"><nav class="pk-trail" aria-label="You are here"><a href="/pokemon">Pokémon A to Z</a><span aria-hidden="true">›</span><span aria-current="page">${E(V2.disp(p.n))}</span></nav><div class="pk-hd">${V2.kHead({kicker: `CASE FILE${dex ? ' #' + dex : ''} · POKÉMON`, h1Html: `The file on <em class="pk-nm">${V2.nameHtml(V2.disp(p.n))}.</em>`, lead}).replace('<h1 class="k-h1 u">', '<h1 class="k-h1 u" id="pk-name">')}</div>${top}</div>`;
          } catch (e) {}
        }
      }

      /* 3. Tool pages: exact above-the-fold first screen, trimmed below the fold so HTML stays compact */
      const toolHtml = {};
      for (const key of toolKeys) {
        try {
          await loadChunk(key);
          const P = V2.pages && V2.pages[key];
          if (!P || typeof P.draw !== 'function') continue;
          const raw = P.draw();
          if (!raw || typeof raw !== 'string') continue;
          const box = document.createElement('div');
          box.innerHTML = raw;
          /* Trim huge below-the-fold lists/tables/sections so each HTML file stays lean (~10-30 KB) while painting full above-the-fold LCP */
          const rootEl = box.firstElementChild;
          if (rootEl && rootEl.children.length > 4) {
            while (rootEl.children.length > 4) rootEl.lastElementChild.remove();
          }
          for (const list of box.querySelectorAll('ul, ol, tbody')) {
            const cap = list.classList.contains('rs-st') ? 3 : 8;
            if (list.children.length > cap) {
              while (list.children.length > cap) list.lastElementChild.remove();
            }
          }
          for (const big of box.querySelectorAll('.gs-body, .ra-list')) {
            if (box.innerHTML.length > 35000) big.remove();
          }
          while (rootEl && rootEl.children.length > 1 && box.innerHTML.length > 35000) {
            rootEl.lastElementChild.remove();
          }
          /* Never leave below-fold eager images fighting for bandwidth */
          let imgN = 0;
          for (const im of box.querySelectorAll('img')) {
            imgN++;
            if (imgN > 1 || key === 'natures') im.setAttribute('loading', 'lazy');
          }
          const html = box.innerHTML;
          if (html.length <= 45000) toolHtml[key] = html;
        } catch (e) {}
      }

      return {homeHtml, pokemonHtml, toolHtml};
    }, {toolKeys, pkList});
  } finally {
    await b.close();
    srv.close();
  }

  /* Apply Home first screen + critical CSS to dist/v2.html and mirror to dist/index.html (invariant: index.html === v2.html) */
  const v2Html0 = fs.readFileSync(dist + 'v2.html', 'utf8');
  const homeCrit = pruneCss(v2Css, v2Html0 + '\n' + (rendered.homeHtml || ''));
  const v2Html1 = applyFirstScreen(v2Html0, 'home', rendered.homeHtml, homeCrit);
  fs.writeFileSync(dist + 'v2.html', v2Html1);
  fs.writeFileSync(dist + 'index.html', v2Html1);

  /* Apply Pokémon first screen + shared pruned Pokémon critical CSS to all 346 dist/pokemon/<slug>.html */
  const pkSample = ['garchomp', 'incineroar', 'absol-mega', 'charizard-mega-y', 'pikachu']
    .map(s => rendered.pokemonHtml[s] || '').join('\n') || Object.values(rendered.pokemonHtml).slice(0, 5).join('\n');
  const pkCrit = pruneCss(v2Css, v2Html0 + '\n' + pkSample);
  let pkDone = 0;
  for (const [s] of seen) {
    const fp = dist + `pokemon/${s}.html`;
    if (!fs.existsSync(fp)) continue;
    const h0 = fs.readFileSync(fp, 'utf8');
    fs.writeFileSync(fp, applyFirstScreen(h0, 'pokemon', rendered.pokemonHtml[s] || '', pkCrit));
    pkDone++;
  }

  /* Apply Tool first screens + per-page pruned critical CSS to dist/<tool>.html */
  let toolDone = 0;
  for (const r of ownFileRows) {
    const fp = dist + `${r.path.slice(1)}.html`;
    if (!fs.existsSync(fp)) continue;
    const h0 = fs.readFileSync(fp, 'utf8');
    const pre = rendered.toolHtml[r.key] || '';
    const crit = pruneCss(v2Css, h0 + '\n' + pre);
    fs.writeFileSync(fp, applyFirstScreen(h0, r.key, pre, crit));
    toolDone++;
  }

  console.log(`public: first-screen prerender (Home crit ${(homeCrit.length / 1024).toFixed(1)} KB, ${pkDone} Pokémon crit ${(pkCrit.length / 1024).toFixed(1)} KB, ${toolDone} tool pages)`);
  return {homeCritBytes: homeCrit.length, pkCritBytes: pkCrit.length, pkDone, toolDone};
}
