// Job 64 (speed program): safe critical-CSS pruner + CSP-safe async /v2.css loader.
// Keeps all @layer/@media/@supports/@container/@keyframes structure and drops rules whose class/id names never appear in htmlText.
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

export function applyCritCss(html, critCss) {
  if (!critCss) return html;
  return html.replace(
    /<link rel="stylesheet" href="(\/v2\.css\?v=[^"]+)">/,
    (_, href) => `<style id="np-crit">${critCss}</style>\n<link rel="stylesheet" href="${href}" media="print" id="np-css"><noscript><link rel="stylesheet" href="${href}"></noscript><script>${CSS_LOADER_SCRIPT}</script>`
  );
}
