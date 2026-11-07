/* ===== Title Case (Nov 7, Sim: "the second word Tiers in Speed Tiers should be capitalized and so on") =====
   Page and tool names, and section headings, are written in Title Case everywhere: "Speed Tiers", "Your Six", "Fix It",
   "What's Behind This Grade". Short joining words stay lowercase unless they start the heading or follow a colon or a dot
   ("Top of the Format", "Your Six vs the Field"). Sentences, descriptions, buttons and choices keep sentence case; the tagline,
   team names, player names and Pokémon names are never touched. Words that already carry a capital or a number inside them
   (STAB, NastyPlot, Top-8, 2HKO) are kept as they are.
   Done as the page draws (headings come from many places), on the text only; nothing else on the page changes. */
const TCASE = {
  SMALL: new Set(['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet', 'as', 'at', 'by', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via', 'vs', 'vs.', 'with', 'from', 'into', 'over']),
  // headings and names; and what is never changed
  SEL: 'h1,h2,h3,h4,.chdisp,.cht,.ar-h2,.ar-sth,.wkt,.lbl,.ltd,.chpgt,.sgl,.nl,.htile b,.trcard>.chk,.nplegend>.chk,.abth,.chswk,.chsub3,.wk,.chparth,.ar-glabel',
  SKIP: '.ar-tname,.svname,.myteamsw,.lgtag,.ar-tag2,.ar-h1,.seg,.gwho,.evteam,.ttcard,.cxnm,[data-notc],input,textarea,select,[contenteditable]',
  // a page name is changed anywhere it stands alone, also on a switch between pages (Speed Tiers · Damage Calc · Type Chart)
  NSKIP: '.ar-tname,.svname,.myteamsw,.lgtag,.gwho,.evteam,.ttcard,.cxnm,[data-notc],input,textarea,select,[contenteditable]',
  names: null,
  word(w, first) { if (!/[a-z]/.test(w)) return w; const core = w.replace(/^[^A-Za-zÀ-ÿ]+/, '');
    if (/[A-Z]/.test(core.slice(1)) || /\d/.test(core)) return w;            // STAB, NastyPlot, 2HKO, Top-8
    if (!first && TCASE.SMALL.has(core.toLowerCase())) return w.toLowerCase();
    return w.split('-').map(p => p.replace(/^([^A-Za-zÀ-ÿ]*)([a-zà-ÿ])/, (m, a, c) => a + c.toUpperCase())).join('-'); },
  // the text of one heading, across its text pieces (a heading can hold a link or an emphasis inside it)
  // the first and the last word are always capitalized ("Where the Data Comes From")
  el(e, skip) { skip = skip || TCASE.SKIP; if (!e || e.closest(skip)) return; const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), ns = []; let n;
    while ((n = w.nextNode())) if (/\S/.test(n.data)) ns.push(n);
    let first = true; ns.forEach((n, i) => { if (n.parentElement && n.parentElement !== e && n.parentElement.closest(skip)) { first = false; return; }
      const t = n.data, words = t.match(/\S+/g) || [], lastNode = i === ns.length - 1; let k = 0;
      const out = t.replace(/(\S+)/g, (m, wd) => { k++; const r = TCASE.word(wd, first || (lastNode && k === words.length)); first = /[:·—–]$/.test(wd); return r; });
      if (out !== t) n.data = out; }); },
  // a page or tool name on its own anywhere (a link, a card, a menu row): the same Title Case
  nameSet() { if (TCASE.names) return TCASE.names; const s = new Set();
    try { MENU.forEach(([g, items]) => { s.add(g); items.forEach(([, t]) => s.add(t)); }); } catch (e) {}
    try { HOME_TILES.forEach(x => s.add(x[1])); } catch (e) {} try { Object.values(VIEW_TITLE).forEach(t => s.add(t)); } catch (e) {}
    return TCASE.names = new Set([...s].filter(t => / [a-z]/.test(t))); },
  run(root) { if (!root || root.nodeType !== 1) return; try {
    if (root.matches(TCASE.SEL)) TCASE.el(root); root.querySelectorAll(TCASE.SEL).forEach(e => TCASE.el(e));
    const N = TCASE.nameSet(); if (N.size) for (const e of root.querySelectorAll('button,a,span,b,div')) { if (e.children.length > 2) continue; const own = [...e.childNodes].filter(c => c.nodeType === 3).map(c => c.data).join('').trim(); if (own && N.has(own) && !e.closest(TCASE.NSKIP)) TCASE.el(e, TCASE.NSKIP); }
  } catch (e) {} } };
{ let q = new Set(), on = false; const flush = () => { on = false; const r = [...q]; q = new Set(); r.forEach(n => TCASE.run(n)); };
  const mo = new MutationObserver(rs => { for (const r of rs) { if (r.type === 'characterData') { const p = r.target.parentElement; if (p) q.add(p.closest(TCASE.SEL) || p); } else r.addedNodes.forEach(n => { if (n.nodeType === 1) q.add(n); else if (n.nodeType === 3 && n.parentElement) q.add(n.parentElement.closest(TCASE.SEL) || n.parentElement); }); }
    if (q.size && !on) { on = true; queueMicrotask(flush); } });
  const start = () => { TCASE.run(document.body); mo.observe(document.body, {childList: true, subtree: true, characterData: true}); };
  if (document.body) start(); else addEventListener('DOMContentLoaded', start); }
