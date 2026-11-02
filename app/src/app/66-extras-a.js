/* ---------- Extras A (Nov 2): holographic S tier, Mega moments, type-themed info sheets ---------- */

/* ===== 1 · Holographic S-tier cards =====
   Design pass C marks S-tier cards with class nps (hot list's top cards, the tier board's S row, the info sheet's rating box).
   They now carry a trading-card foil: one pseudo-element under the text (polish.css, EXTRAS A) that only shifts hue
   (mix-blend-mode: color), moved by transform. Here we feed it two numbers, --hx and --hy (0..1): the pointer over the card
   on a desktop, device tilt where the browser gives it without a permission prompt (never on iOS, which would ask), and,
   only in browsers without CSS scroll-driven animations (where CSS moves the foil with scroll by itself), the card's place
   on screen as you scroll. Work happens once per frame at most, only for cards on screen (IntersectionObserver), only when
   a value changed, and not at all under reduced motion (the foil then stays still). */
const NX = {obs: new Set(), vis: new Set(), raf: 0, pt: null, tilt: null, tiltOn: false};
NX.mm = q => { try { return matchMedia(q); } catch (e) { return {matches: false}; } };
NX.rm = NX.mm('(prefers-reduced-motion: reduce)'); NX.fine = NX.mm('(hover: hover) and (pointer: fine)');
NX.io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(es => { for (const e of es) { if (e.isIntersecting) NX.vis.add(e.target); else NX.vis.delete(e.target); } NX.tiltSet(); NX.kick(); }) : null;
NX.cl = v => v < 0 ? 0 : v > 1 ? 1 : v;
NX.kick = () => { if (NX.raf || !NX.vis.size || NX.rm.matches) return; NX.raf = requestAnimationFrame(NX.frame); };
/* where the browser has scroll-driven animations, CSS moves the foil with scroll by itself (no script per frame); then only
   the pointer and tilt are fed from here */
NX.css = (() => { try { return CSS.supports('animation-timeline: view()'); } catch (e) { return false; } })();
NX.frame = () => { NX.raf = 0; const H = innerHeight || 800, W = innerWidth || 400, out = [];
  /* reads first, then writes: no layout thrash */
  for (const el of NX.vis) { if (!el.isConnected) { NX.vis.delete(el); continue; }
    let x, y;
    if (NX.pt && NX.pt.el === el) { const r = el.getBoundingClientRect(); x = NX.cl((NX.pt.x - r.left) / (r.width || 1)); y = NX.cl((NX.pt.y - r.top) / (r.height || 1)); }
    else if (NX.css) { if (!NX.tilt) { x = y = .5; } else { x = NX.cl(.5 + NX.tilt.x * .45); y = NX.cl(.5 + NX.tilt.y * .45); } }
    else { const r = el.getBoundingClientRect(); y = NX.cl((r.top + r.height / 2) / H); x = NX.cl(.25 + .5 * ((r.left + r.width / 2) / W) + (y - .5) * .5);
      if (NX.tilt) { x = NX.cl(x + NX.tilt.x * .45); y = NX.cl(y + NX.tilt.y * .45); } }
    x = x.toFixed(2); y = y.toFixed(2); if (el.__hx === x && el.__hy === y) continue; el.__hx = x; el.__hy = y; out.push([el, x, y]); }
  for (const [el, x, y] of out) { el.style.setProperty('--hx', x); el.style.setProperty('--hy', y); } };
NX.scan = () => { if (!NX.io) return;
  for (const el of NX.obs) if (!el.isConnected || !el.classList.contains('nps')) { NX.io.unobserve(el); NX.obs.delete(el); NX.vis.delete(el); }
  document.querySelectorAll('.nps').forEach(el => { if (!NX.obs.has(el)) { NX.obs.add(el); NX.io.observe(el); } }); };
/* device tilt: only where it needs no permission (iOS has requestPermission: there we use scroll only), only on touch
   screens, and only listening while a foil card is on screen */
NX.canTilt = (() => { try { return typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function' && !NX.fine.matches; } catch (e) { return false; } })();
NX.onTilt = e => { if (e.gamma == null || e.beta == null) return; NX.tilt = {x: Math.max(-1, Math.min(1, e.gamma / 35)), y: Math.max(-1, Math.min(1, (e.beta - 40) / 35))}; NX.kick(); };
NX.tiltSet = () => { const want = NX.canTilt && NX.vis.size > 0 && !NX.rm.matches; if (want === NX.tiltOn) return; NX.tiltOn = want;
  if (want) addEventListener('deviceorientation', NX.onTilt, {passive: true}); else { removeEventListener('deviceorientation', NX.onTilt); NX.tilt = null; } };
if (!NX.css) { addEventListener('scroll', () => { if (NX.vis.size) NX.kick(); }, {passive: true, capture: true});
  addEventListener('resize', () => { if (NX.vis.size) NX.kick(); }, {passive: true}); }
document.addEventListener('pointermove', e => { if (!NX.vis.size || !NX.fine.matches || e.pointerType !== 'mouse') return;
  const el = e.target && e.target.closest ? e.target.closest('.nps') : null; if (!el && !NX.pt) return;
  NX.pt = el ? {el, x: e.clientX, y: e.clientY} : null; NX.kick(); }, {passive: true});
CH.wrap('renderLair', () => { NX.scan(); NX.kick(); });
CH.wrap('lairSheet', () => { NX.scan(); NX.kick(); });

/* ===== 2 · Mega moments =====
   A soft prismatic halo behind Mega Pokémon pictures in a few key places only (info sheet hero, the hot list, your team
   sheet): a class on the card (npmega), the halo is the picture's own background, so the picture element is never touched
   or swapped (the sprite-reuse observer in 15-visual-helpers.js keeps working). The MEGA / M badges get their rainbow in CSS. */
const npMega = n => { const p = n && byName.get(n); return !!(p && p.m); };
CH.wrap('renderLair', () => { const hot = $('chHot'); if (!hot) return; hot.querySelectorAll('[data-lt]').forEach(c => c.classList.toggle('npmega', npMega(c.dataset.lt))); });
CH.wrap('chTeamRender', () => { const o = $('chSheetOut'); if (!o) return;
  o.querySelectorAll('.chrow[data-chedit]').forEach(r => { const s = S.slots[+r.dataset.chedit]; r.classList.toggle('npmega', !!(s && npMega(s.n))); }); });

/* ===== 3 · Type-themed info sheets =====
   The info sheet's header gets a faint pattern for its first type (embers, ripples, leaves ...), drawn from inline SVG masks
   in polish.css and coloured from the second type (--tb). It is blended so it can only push the header's background away
   from the text colour (darker under white text, lighter under dark text): text contrast never drops. */
CH.wrap('lairSheet', n => { const sh = $('lairSheet'), p = n && byName.get(n); if (!sh || sh.hidden || !p) return; const head = sh.querySelector('.lshead'); if (!head) return;
  head.className = head.className.replace(/\bnpty-\w+/g, '').trim(); head.classList.add('npty', 'npty-' + String(p.t[0] || 'normal').toLowerCase()); head.classList.toggle('npmega', !!p.m); });
