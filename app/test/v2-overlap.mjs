// Phone overlap and edge check (hybrid rule 9, Sim approved Nov 21). The design review found overlaps that qcheck-all passed: a
// "MOVE" label drawn over a move name, a long button text cut at the right edge, a gift code broken mid-word, numbers spilling
// past the screen edge. qcheck compares whole text boxes and skips a lot; this check measures every LINE of text instead.
// For every v2 page (V2.pages, not 'owner') at phone widths, light and night, every visible text line is checked for:
//   TEXT     a text line overlapping another element's text line by more than 2px both ways, on ink boxes (0.85 of the font
//            size around the line's middle, about cap top to descender, so tight display leading is no hit); not ancestor/descendant
//   PICTURE  a text line over the SOLID pixels of an <img> (alpha > 128; a sprite's see-through edges and soft shadow don't count)
//            or over an <svg> box, for more than 25% of the line, unless the text is meant to sit on the picture (it, or an ancestor
//            below the box they share, has a background, a text-shadow or a text outline)
//   CLIP     text cut off: overflow hidden/clip with scrollWidth > clientWidth + 1, a line past the screen's left/right edge, or a
//            line past the edge of its nearest overflow:hidden/clip box (sideways; downwards only where it doesn't scroll)
//   COVER    a text line painted over by another part of the page (a neighbour's plate or card with a background on top of it)
//   BREAK    a word of 4+ letters broken mid-word across two lines (no space, hyphen or soft hyphen at the break)
// Hidden text is skipped: screen-reader-only (1px / clip), aria-hidden, closed <details>, display/visibility/opacity 0, and text
// scrolled out of a sideways swipe row. position:fixed parts (top bar, bottom menu, toasts) are only compared with each other,
// since page content scrolls under them on purpose. Entrance animations are run to their end before measuring; a looping ticker
// strip is stopped and checked along its whole length (sliding past its window's edge is its design, not a CLIP).
// A self-test runs first on a small planted page (each bug kind above, plus deliberate look-alikes that must pass), so a broken
// check can't pass the site by finding nothing.
// Findings judged deliberate are in app/test/v2-overlap-known.json (each with its reason); any other finding fails.
// Usage: PAGE=app/dist/v2.html node app/test/v2-overlap.mjs     (a --v2 --art=../src/v2/art/ build)
//   WIDTHS=320,360,390,430 (default; add 768,1440 for tablet/desktop)  THEMES=day,night  ROUTES=home,team
//   VIEWS=0 skips the other views of a page (tabs, sliding pickers); VIEW_WIDTHS=320,390 (default) are the widths they're checked at
//   SHOTS=dir  saves a screenshot (deviceScaleFactor 1, the finding outlined in red) of every new finding
//   KNOWN=print prints today's findings as known-list keys (to paste, each with a reason)
import {chromium} from 'playwright'; import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const HERE = fileURLToPath(new URL('.', import.meta.url)), PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html'), KF = HERE + 'v2-overlap-known.json';
const WIDTHS = (process.env.WIDTHS || '320,360,390,430').split(',').map(Number), THEMES = (process.env.THEMES || 'day,night').split(',');
const SHOTS = process.env.SHOTS || '', VIEW_W = (process.env.VIEW_WIDTHS || '320,390').split(',').map(Number);
const t0 = Date.now(), b = await chromium.launch({args: ['--allow-file-access-from-files']});   // file:// sprites readable by a canvas (their see-through edges)

// ---------- in-page measurement ----------
const MEASURE = async () => {
  const vw = document.documentElement.clientWidth, out = [], sx = scrollX, sy = scrollY;
  const R = q => ({l: q.left + sx, r: q.right + sx, t: q.top + sy, b: q.bottom + sy});
  const css = e => getComputedStyle(e);
  const path = e => { const p = []; for (let c = e; c && c !== document.body && p.length < 4; c = c.parentElement) {
      const cl = [...c.classList].filter(x => !/^(on|is-|active)/.test(x)).slice(0, 2).join('.'); p.unshift(c.tagName.toLowerCase() + (cl ? '.' + cl : '')); }
    return p.join(' > '); };
  const hidden = e => { if (e.checkVisibility && !e.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) return true;
    if (e.closest('[aria-hidden="true"],details:not([open]) > :not(summary),[inert],.sr,.sr-only,.vh')) return true;
    for (let c = e; c && c !== document.body; c = c.parentElement) { const s = css(c), q = c.getBoundingClientRect();
      if (+s.opacity < 0.05) return true;
      if (s.position === 'absolute' && q.width <= 1 && q.height <= 1) return true;            // sr-only pattern
      if (s.clip && s.clip !== 'auto' && /rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)/.test(s.clip)) return true;
      if (s.clipPath && /inset\(50%\)/.test(s.clipPath)) return true; }
    return false; };
  const fixedOf = e => { for (let c = e; c && c !== document.documentElement; c = c.parentElement) if (css(c).position === 'fixed') return c; return null; };
  // clipping boxes between e and the page (overflow not visible); x/y modes
  const clips = e => { const L = []; for (let c = e.parentElement; c && c !== document.body && c !== document.documentElement; c = c.parentElement) {
      const s = css(c); if (s.overflowX !== 'visible' || s.overflowY !== 'visible') L.push({c, s, q: R(c.getBoundingClientRect())});
      if (s.position === 'fixed') break; } return L; };
  // the visible part of a box after every clipping ancestor (scroll rows included: what's scrolled away isn't seen)
  const cut = (q, L) => { let a = {...q}; for (const {q: B} of L) { a = {l: Math.max(a.l, B.l), r: Math.min(a.r, B.r), t: Math.max(a.t, B.t), b: Math.min(a.b, B.b)}; if (a.r - a.l <= 0 || a.b - a.t <= 0) return null; } return a; };
  const ov = (a, c) => [Math.min(a.r, c.r) - Math.max(a.l, c.l), Math.min(a.b, c.b) - Math.max(a.t, c.t)];
  const num = x => Math.round(x);
  // ---- text leaves and their lines
  // a fixed moment: entrance animations run to their end; a looping one (a ticker strip) stops at its start, and its text is checked
  // along the whole strip, not only the part in its window just now (every part passes through the window)
  const loop = a => { const t = a.effect && a.effect.getComputedTiming(); return t && t.iterations === Infinity; };
  for (const a of document.getAnimations()) { try { if (loop(a)) { a.currentTime = 0; a.pause(); } else a.finish(); } catch (e) {} }
  const strip = e => { for (let c = e; c && c !== document.body; c = c.parentElement) if (c.getAnimations().some(loop)) return c; return null; };
  const T = [];
  for (const e of document.body.querySelectorAll('*')) {
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|svg|SVG|OPTION|TITLE)$/.test(e.tagName) || e.closest('svg')) continue;
    const tn = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()); if (!tn.length || hidden(e)) continue;
    const s = css(e), fs = parseFloat(s.fontSize), M = strip(e), L = clips(e).filter(c => !(M && c.c.contains(M))), lines = [];
    for (const n of tn) { const rg = document.createRange(); rg.selectNodeContents(n);
      for (const x of rg.getClientRects()) { if (x.width < 2 || x.height < 2) continue;
        const raw = R(x), mid = (raw.t + raw.b) / 2, h = Math.min(raw.b - raw.t, 0.85 * fs);   // ink box: 0.85 of the em box around the line's middle (cap top to descender)
        lines.push({raw, ink: {l: raw.l, r: raw.r, t: mid - h / 2, b: mid + h / 2}}); } }
    if (!lines.length) continue;
    const vis = lines.map(x => ({...x, v: cut(x.ink, L)})).filter(x => x.v); if (!vis.length && !L.length) continue;
    T.push({e, s, fs, L, M, lines, vis, fixed: fixedOf(e), text: (e.innerText || e.textContent || '').trim().replace(/\s+/g, ' '), tn});
  }
  const add = (type, a, info, boxes) => out.push({type, path: path(a.e), text: a.text.slice(0, 40), info, boxes});
  // ---- TEXT over TEXT
  for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) { const a = T[i], c = T[j];
    if (a.e.contains(c.e) || c.e.contains(a.e) || !!a.fixed !== !!c.fixed || (a.fixed && a.fixed !== c.fixed)) continue;
    let hit = null; for (const u of a.vis) { for (const v of c.vis) { const [x, y] = ov(u.v, v.v); if (x > 2 && y > 2) { hit = [u.v, v.v, x, y]; break; } } if (hit) break; }
    if (hit) add('TEXT', a, `x ${JSON.stringify(c.text.slice(0, 30))} (${c.e.tagName.toLowerCase()}${c.e.className ? '.' + String(c.e.className).split(' ')[0] : ''}) overlap ${num(hit[2])}x${num(hit[3])}px`, [hit[0], hit[1]]);
  }
  // ---- TEXT over PICTURE
  // a sprite's box is mostly see-through, so a line counts only the part of it over the picture's SOLID pixels (alpha > 128; soft
  // shadows and glows are see-through): a 128-px alpha mask of the picture, mapped through object-fit / object-position and a mirror
  // (scaleX(-1)), sampled on a 24 x 6 grid over the line. An <svg> or an unreadable picture counts as solid over its whole box.
  const AC = window.__ovlA || (window.__ovlA = {});
  const solidAt = async p => { const q = R(p.getBoundingClientRect()), all = () => 1; if (p.tagName !== 'IMG' || !p.naturalWidth) return all;
    const k = p.currentSrc || p.src; if (!(k in AC)) { AC[k] = null; try { await p.decode().catch(() => {}); const nw = p.naturalWidth, nh = p.naturalHeight, sc = Math.min(1, 128 / Math.max(nw, nh)), cw = Math.max(1, Math.round(nw * sc)), ch = Math.max(1, Math.round(nh * sc));
        const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d'); g.drawImage(p, 0, 0, cw, ch); const d = g.getImageData(0, 0, cw, ch).data;
        const m = new Uint8Array(cw * ch); for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 128 ? 1 : 0; AC[k] = {cw, ch, m}; } catch (e) { AC[k] = null; } }
    const f = AC[k]; if (!f) return all; const s = css(p), W = q.r - q.l, H = q.b - q.t, nw = p.naturalWidth, nh = p.naturalHeight;
    let sx2 = W / nw, sy2 = H / nh; const fit = s.objectFit; if (fit === 'contain' || fit === 'scale-down') { sx2 = sy2 = Math.min(W / nw, H / nh); if (fit === 'scale-down') sx2 = sy2 = Math.min(1, sx2); } else if (fit === 'cover') sx2 = sy2 = Math.max(W / nw, H / nh); else if (fit === 'none') sx2 = sy2 = 1;
    const cw = nw * sx2, ch = nh * sy2, [px, py] = (s.objectPosition || '50% 50%').split(' '), off = (v, free) => /%$/.test(v) ? free * parseFloat(v) / 100 : parseFloat(v) || 0;
    const ox = q.l + off(px, W - cw), oy = q.t + off(py || '50%', H - ch), mir = /^matrix\(-/.test(s.transform);
    return (X, Y) => { let u = (X - ox) / cw; const v = (Y - oy) / ch; if (mir) u = 1 - u; if (u < 0 || u >= 1 || v < 0 || v >= 1) return 0; return f.m[Math.floor(v * f.ch) * f.cw + Math.floor(u * f.cw)]; }; };
  const P = []; for (const p of document.body.querySelectorAll('img, svg')) { if (p.parentElement.closest('svg') || hidden(p)) continue;
    const q = cut(R(p.getBoundingClientRect()), clips(p)); if (q) P.push({p, q, fixed: fixedOf(p), at: await solidAt(p)}); }
  const onTop = (t, pic) => { // the text has its own backdrop or outline between itself and the box it shares with the picture
    for (let c = t.e; c && !c.contains(pic); c = c.parentElement) { const s = css(c);
      if (s.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor) || s.backgroundImage !== 'none') return true;
      if (s.textShadow && s.textShadow !== 'none' || parseFloat(s.webkitTextStrokeWidth) > 0 || /stroke/.test(s.paintOrder || '')) return true; }
    return false; };
  for (const t of T) for (const pc of P) { if (!!t.fixed !== !!pc.fixed || t.e.contains(pc.p) || pc.p.contains(t.e)) continue;
    for (const u of t.vis) { const [x, y] = ov(u.v, pc.q); if (x <= 0 || y <= 0) continue; const a = u.v;
      let n = 0; for (let i = 0; i < 24; i++) for (let j = 0; j < 6; j++) { const X = a.l + (a.r - a.l) * (i + 0.5) / 24, Y = a.t + (a.b - a.t) * (j + 0.5) / 6;
        if (X >= pc.q.l && X <= pc.q.r && Y >= pc.q.t && Y <= pc.q.b && pc.at(X, Y)) n++; }
      if (n / 144 > 0.25 && !onTop(t, pc.p)) { add('PICTURE', t, `covers ${pc.p.tagName.toLowerCase()}${pc.p.getAttribute('class') ? '.' + pc.p.getAttribute('class').split(' ')[0] : ''}${pc.p.getAttribute('alt') ? ' "' + pc.p.getAttribute('alt').slice(0, 20) + '"' : ''} ${num(100 * n / 144)}% of the line (solid pixels)`, [u.v, pc.q]); break; } } }
  // ---- CLIP
  for (const t of T) { const {e, s} = t;
    if (/hidden|clip/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) add('CLIP', t, `cut inside its own box: scrollWidth ${e.scrollWidth} > clientWidth ${e.clientWidth}${s.textOverflow === 'ellipsis' ? ' (ellipsis)' : ''}`, [R(e.getBoundingClientRect())]);
    else { let done = false;
      // a ticker strip slides past its window's edge by design (its window is left out of t.L, so only boxes inside the strip count)
      const moving = !!t.M;
      for (const x of t.lines) { const q = x.raw, seen = cut(q, t.L);
        if (!moving && seen && (seen.r > vw + sx + 1 || seen.l < sx - 1)) { add('CLIP', t, `line runs past the screen edge: ${num(q.l - sx)}..${num(q.r - sx)} of ${vw}`, [q]); done = true; break; }
        const c = t.L[0]; if (!c || moving) continue; const B = c.q;
        const sideways = /hidden|clip/.test(c.s.overflowX) && (q.r > B.r + 1 || q.l < B.l - 1);
        const down = /hidden|clip/.test(c.s.overflowY) && (q.b > B.b + 2 || q.t < B.t - 2) && (x.ink.b > B.b + 1 || x.ink.t < B.t - 1);
        if (sideways || down) { add('CLIP', t, `line past its box (${c.c.tagName.toLowerCase()}.${String(c.c.className).split(' ')[0]}): line ${num(q.l)}..${num(q.r)} x ${num(q.t)}..${num(q.b)}, box ${num(B.l)}..${num(B.r)} x ${num(B.t)}..${num(B.b)}`, [q, B]); done = true; break; } }
      void done; } }
  // ---- BREAK (mid-word)
  for (const t of T) { if (t.lines.length < 2 || /auto/.test(t.s.hyphens)) continue;
    for (const n of t.tn) { const s = n.textContent; if (s.length > 600) continue; const rg = document.createRange(); let prevTop = null, prevI = -1;
      for (let i = 0; i < s.length; i++) { if (/\s/.test(s[i])) continue; rg.setStart(n, i); rg.setEnd(n, i + 1); const q = rg.getClientRects()[0]; if (!q || !q.width) continue;
        if (prevTop !== null && q.top > prevTop + q.height * 0.5 && prevI === i - 1 && /[\p{L}\p{N}]/u.test(s[i - 1]) && /[\p{L}\p{N}]/u.test(s[i])) {
          let a = i; while (a > 0 && /[\p{L}\p{N}'’]/u.test(s[a - 1])) a--; let z = i; while (z < s.length && /[\p{L}\p{N}'’]/u.test(s[z])) z++;
          const w = s.slice(a, z); if (w.replace(/[^\p{L}\p{N}]/gu, '').length >= 4) { add('BREAK', t, `"${w}" broken as "${s.slice(a, i)}" / "${s.slice(i, z)}"`, [R(q)]); break; } }
        prevTop = q.top; prevI = i; } } }
  // ---- COVER: text painted over by another part of the page (a neighbour's plate or card drawn on top of it). Five points along
  // each line's middle are hit-tested; a point counts when the top element there is not the text's own element, ancestor or
  // descendant AND something between it and their shared box paints (a background, a picture). Two of five points = covered.
  // Fixed and sticky parts are left out (content scrolls under them on purpose); hit-testing needs the spot on screen, so the
  // page is scrolled a screen at a time and then back to the top.
  // (an <svg> box itself is see-through: only a hit on one of its shapes counts as paint)
  const paints = (top, stop) => { for (let c = top; c && c !== stop; c = c.parentElement) { if (/^(IMG|VIDEO|CANVAS)$/.test(c.tagName) || c.ownerSVGElement && c === top) return true;
      const s = css(c), m = s.backgroundColor.match(/[\d.]+/g); if (m && (m.length < 4 || +m[3] > 0.5)) return true; if (s.backgroundImage !== 'none') return true; } return false; };
  const pinned = e => { for (let c = e; c && c !== document.documentElement; c = c.parentElement) { const p = css(c).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  { const vh = innerHeight, H = document.documentElement.scrollHeight, todo = T.filter(t => !t.fixed && !t.M && !pinned(t.e)), hitAt = new Map();   // (a ticker's text slides under its own controls by design)
    for (let y = 0; y < H; y += vh - 160) { scrollTo(0, y); const Y0 = scrollY; await new Promise(r => requestAnimationFrame(() => r()));
      // positions are read again at each scroll step (a page can move while it scrolls: a header folding, a section filling in)
      const V = q => ({l: q.left, r: q.right, t: q.top, b: q.bottom});
      for (const t of todo) { if (hitAt.has(t)) continue; const k = t.e, LB = t.L.map(c => V(c.c.getBoundingClientRect()));
        for (const n0 of t.tn) { const rg = document.createRange(); rg.selectNodeContents(n0);
          for (const x of rg.getClientRects()) { if (x.width < 2 || x.height < 2 || hitAt.has(t)) continue; const mid = (x.top + x.bottom) / 2, h = Math.min(x.height, 0.85 * t.fs);
            const v = cut({l: x.left, r: x.right, t: mid - h / 2, b: mid + h / 2}, LB.map(q => ({q}))); if (!v) continue; const my = (v.t + v.b) / 2; if (my < 80 || my > vh - 80) continue;
            let n = 0, who = null;
            for (const f of [0.1, 0.3, 0.5, 0.7, 0.9]) { const top = document.elementFromPoint(v.l + (v.r - v.l) * f, my); if (!top || top === k || k.contains(top) || top.contains(k) || pinned(top)) continue;
              let shared = top.parentElement; while (shared && !shared.contains(k)) shared = shared.parentElement; if (paints(top, shared)) { n++; who = who || top; } }
            if (n >= 2) { hitAt.set(t, 1); const w2 = V(who.getBoundingClientRect()), pg = b => ({l: b.l + scrollX, r: b.r + scrollX, t: b.t + scrollY, b: b.b + scrollY});
              add('COVER', t, `${n} of 5 points along the line are under ${who.tagName.toLowerCase()}${typeof who.className === 'string' && who.className ? '.' + who.className.split(' ')[0] : ''}${(who.innerText || '').trim() ? ' ' + JSON.stringify(who.innerText.trim().replace(/\s+/g, ' ').slice(0, 20)) : ''}`, [pg(v), pg(w2)]); } } } } }
    scrollTo(0, 0); }
  return out; };

// ---------- self-test: the check must catch each kind of bug the design review saw, and pass the deliberate look-alikes ----------
{ const IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#c33"/></svg>');
  const HALF = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="50" fill="#36c"/></svg>');   // see-through lower half
  const FIX = `<!doctype html><meta name="viewport" content="width=device-width"><style>body{margin:0;font:16px/1.5 sans-serif;overflow-x:clip}section{position:relative;margin:0 0 24px 16px;width:300px}</style>
  <section data-want="TEXT"><span style="position:absolute;left:0;top:0;font-size:13px">MOVE</span><span>Dragon Dance</span></section>
  <section data-want="CLIP"><button style="width:120px;overflow:hidden;white-space:nowrap;font:16px sans-serif">OPEN YOUR PLAYBOOK</button></section>
  <section data-want="BREAK"><div style="width:70px;overflow-wrap:anywhere;font:16px monospace">LA1CTRA1N1NG27</div></section>
  <section data-want="CLIP"><div style="white-space:nowrap;margin-left:330px">9.0% 6.0%</div></section>
  <section data-want="CLIP"><div style="width:200px;overflow:hidden"><span style="display:inline-block;white-space:nowrap">Charizardite Y with a long name here</span></div></section>
  <section data-want="PICTURE" style="height:100px"><img src="${IMG}" width="100" height="100" alt=""><span style="position:absolute;left:10px;top:40px">Bring these four</span></section>
  <section data-want="" style="height:100px"><img src="${IMG}" width="100" height="100" alt=""><span style="position:absolute;left:10px;top:40px;background:#fff">97</span></section>
  <section data-want="" style="height:100px"><img src="${HALF}" width="100" height="100" alt=""><span style="position:absolute;left:10px;top:70px">Mega</span></section>
  <section data-want=""><p style="margin:0">Ordinary running text that wraps across a few lines at a normal width, with whole words on each line.</p></section>
  <section data-want=""><span style="position:absolute;left:0;top:0" aria-hidden="true">MOVE</span><span>Dragon Dance</span></section>
  <section data-want=""><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Screen reader copy</span><span>Seen text</span></section>
  <section data-want=""><div style="width:200px;overflow:hidden"><div style="display:flex;gap:16px;white-space:nowrap;animation:t 20s linear infinite"><span>Incineroar</span><span>Mega Raichu Y</span><span>Gholdengo</span><span>Archaludon</span></div></div></section>
  <section data-want="TEXT"><div style="width:200px;overflow:hidden"><div style="display:flex;white-space:nowrap;animation:t 20s linear infinite"><span style="margin-right:200px">a</span><span>Rillaboom</span><span style="margin-left:-8px">97</span></div></div></section>
  <section data-want="COVER"><div style="display:flex"><div style="width:80px;white-space:nowrap">Rillaboom 97</div><div style="width:120px;margin-left:-30px;background:#fff;position:relative">Sneasler</div></div></section>
  <section data-want=""><div style="overflow-x:auto;width:200px;white-space:nowrap"><span>Swipe row item one</span> <span>Swipe row item two</span></div></section>
  <style>@keyframes t{to{transform:translateX(-50%)}}</style>`;
  const p = await b.newPage({viewport: {width: 390, height: 844}}); await p.setContent(FIX); await p.waitForTimeout(300);
  const got = await p.evaluate(MEASURE), wants = await p.evaluate(() => [...document.querySelectorAll('section')].map(s => s.dataset.want));
  const per = await p.evaluate(F => { const S = [...document.querySelectorAll('section')]; return F.map(f => { const q = f.boxes[0]; const i = S.findIndex(s => { const r = s.getBoundingClientRect(); return q.t >= r.top + scrollY - 1 && q.t <= r.bottom + scrollY + 1; }); return [i, f.type]; }); }, got);
  await p.close(); const bad = [];
  wants.forEach((w, i) => { const t = per.filter(x => x[0] === i).map(x => x[1]); if (w && !t.includes(w)) bad.push(`case ${i + 1} should be ${w}, got ${t.join(',') || 'nothing'}`); if (!w && t.length) bad.push(`case ${i + 1} should pass, got ${t.join(',')}`); });
  if (bad.length) { console.log('v2-overlap self-test FAILED (the check itself is broken):\n  ' + bad.join('\n  ')); await b.close(); process.exit(1); }
  console.log(`  self-test: ${wants.filter(Boolean).length} planted bugs caught, ${wants.filter(w => !w).length} deliberate look-alikes passed`); }

// ---------- run ----------
const VSEL = '#main .np-slide, #main [role=tablist]';
const VLIST = S => [...document.querySelectorAll(S)].filter(e => e.getClientRects().length).flatMap((g, j) => [...g.querySelectorAll('button')].map((x, k) => ({j, k, on: x.getAttribute('aria-pressed') === 'true' || x.getAttribute('aria-selected') === 'true', t: x.textContent.trim().replace(/\s+/g, ' ').slice(0, 24)})).filter(v => !v.on && v.t));
// open a page (fresh: via another page first, so its own state redraws) and, for a view, tap that choice; false if the choice is gone
const openView = async (p, r, v) => { await p.evaluate(() => { location.hash = '#notfound'; }); await p.waitForTimeout(150);
  await p.evaluate(r => { location.hash = '#' + r; scrollTo(0, 0); }, r); await p.waitForTimeout(1300);
  if (v) { const ok = await p.evaluate(([S, v]) => { const g = [...document.querySelectorAll(S)].filter(e => e.getClientRects().length)[v.j], x = g && g.querySelectorAll('button')[v.k];
      if (!x || x.textContent.trim().replace(/\s+/g, ' ').slice(0, 24) !== v.t) return false; x.click(); scrollTo(0, 0); return true; }, [VSEL, v]); if (!ok) return false; await p.waitForTimeout(900); }
  await p.evaluate(() => document.fonts && document.fonts.ready); return true; };
let routes = process.env.ROUTES ? process.env.ROUTES.split(',') : null;
if (!routes) { const p = await b.newPage(); await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(2500);
  routes = await p.evaluate(() => Object.keys(V2.pages).filter(r => r !== 'owner')); await p.close(); }
const found = [], errors = [];
for (const th of THEMES) for (const w of WIDTHS) {
  const touch = w < 1100, ctx = await b.newContext({viewport: {width: w, height: w < 700 ? 844 : 900}, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch && w < 700});
  const p = await ctx.newPage(); p.on('pageerror', e => errors.push(`${th} ${w}: ${e.message}`));
  await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', t); } catch (e) {} }, th);
  await p.goto('file://' + PAGE + '#home', {timeout: 90000}); await p.waitForTimeout(2500);
  for (const r of routes) {
    // the default view, then (as qcheck-all does; VIEWS=0 skips) every other choice of a sliding picker or tab list on the page
    const views = [null]; if (process.env.VIEWS !== '0' && VIEW_W.includes(w)) { await openView(p, r, null); views.push(...await p.evaluate(VLIST, VSEL)); }
    for (const v of views) { const label = v ? `${r} [${v.t}]` : r;
      if (!await openView(p, r, v)) continue;
      let f = []; try { f = await p.evaluate(MEASURE); } catch (e) { errors.push(`${label}@${w}/${th}: measure failed ${e.message.split('\n')[0]}`); }
      for (const x of f) found.push({...x, at: `${label}@${w}/${th}`, route: r, view: v, w, th, key: `${label}@${w}/${th} | ${x.type} | ${x.path} | ${JSON.stringify(x.text)}`}); }
  }
  await ctx.close(); }
// one key per finding (the same spot can be hit twice, e.g. two lines of one label)
const seen = new Set(), uniq = found.filter(x => !seen.has(x.key) && seen.add(x.key));
if (process.env.KNOWN === 'print') { for (const x of uniq) console.log(JSON.stringify({key: x.key, why: ''}) + ','); }
let known = []; try { known = JSON.parse(fs.readFileSync(KF, 'utf8')).items; } catch (e) {}
const K = new Map(known.map(k => [k.key, k.why])), fresh = uniq.filter(x => !K.has(x.key));
const gone = known.filter(k => !seen.has(k.key) && routes.includes(k.key.split('@')[0].replace(/ \[.*$/, '')) && WIDTHS.includes(+k.key.split('@')[1].split('/')[0]) && THEMES.includes(k.key.split('/')[1].split(' ')[0]));
for (const x of fresh) console.log(`  NEW  ${x.at}: ${x.type} ${x.path} ${JSON.stringify(x.text)} | ${x.info}`);
if (process.env.VERBOSE) for (const x of uniq.filter(x => K.has(x.key))) console.log(`  known ${x.at}: ${x.type} ${x.path} ${JSON.stringify(x.text)} | ${x.info}`);
for (const e of errors) console.log('  ERROR ' + e);
if (gone.length) console.log(`  (${gone.length} known findings no longer seen: remove them from v2-overlap-known.json after a look)`);
if (SHOTS && fresh.length) { fs.mkdirSync(SHOTS, {recursive: true});
  const by = {}; for (const x of fresh) (by[x.at] ||= []).push(x);
  for (const [k, list] of Object.entries(by)) { const {route, w, th} = list[0];
    const ctx = await b.newContext({viewport: {width: w, height: w < 700 ? 844 : 900}, deviceScaleFactor: 1, hasTouch: w < 1100, isMobile: w < 700});
    const p = await ctx.newPage(); await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', t); } catch (e) {} }, th);
    await p.goto('file://' + PAGE + '#home', {timeout: 90000}); await p.waitForTimeout(2500); await openView(p, route, list[0].view);
    for (let i = 0; i < list.length; i++) { const x = list[i];
      await p.evaluate(bx => { document.querySelectorAll('.__ovl').forEach(e => e.remove()); for (const [k, q] of bx.entries()) { const d = document.createElement('div'); d.className = '__ovl';
        Object.assign(d.style, {position: 'absolute', left: q.l - 1 + 'px', top: q.t - 1 + 'px', width: q.r - q.l + 2 + 'px', height: q.b - q.t + 2 + 'px', outline: (k ? '1px dashed ' : '2px solid ') + '#f00', zIndex: 2147483647, pointerEvents: 'none'}); document.body.appendChild(d); } }, x.boxes);
      // scroll the spot to the upper middle of the screen (fixed bars stay where a player sees them) and keep that screen
      const q = x.boxes[0], y0 = await p.evaluate(t => { scrollTo(0, Math.max(0, t - 260)); return scrollY; }, q.t); await p.waitForTimeout(300);
      const file = path.join(SHOTS, `${route}${list[0].view ? '-' + list[0].view.t.replace(/[^\w]+/g, '_') : ''}-${w}-${th}-${i + 1}-${x.type}.png`);
      await p.screenshot({path: file, clip: {x: 0, y: Math.max(0, Math.min(q.t - y0 - 200, (w < 700 ? 844 : 900) - 440)), width: w, height: 440}}); x.shot = file; console.log(`  shot ${file}`); }
    await ctx.close(); } }
await b.close();
console.log(`v2-overlap: ${uniq.length} findings, ${uniq.length - fresh.length} known, ${fresh.length} new (${routes.length} pages x ${WIDTHS.length} widths x ${THEMES.length} themes; ${Math.round((Date.now() - t0) / 1000)}s)`);
process.exit(fresh.length || errors.length ? 1 : 0);
