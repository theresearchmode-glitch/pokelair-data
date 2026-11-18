// ---------- Gifts and news, shared by Home's post band, The Post Room (#gifts) and The Champions Dispatch (#news) ----------
// POST (src/data/post.js). V2.postNow() -> {live: [...], past: [...], news: [...], checked}; a gift is live from its start until
// its end (UTC), so it moves to the stamp sheet by the clock, with no data change needed.
V2.postNow = (now = Date.now()) => { const P = (typeof POST === 'object' && POST) || {gifts: [], news: []}, t = x => x ? Date.parse(x) : NaN;
  const g = (P.gifts || []).slice(), live = g.filter(x => t(x.start) <= now && !(t(x.end) < now)).sort((a, b) => t(a.end) - t(b.end)),
    past = g.filter(x => t(x.end) < now).sort((a, b) => t(b.end) - t(a.end));
  return {live, past, news: (P.news || []).slice().sort((a, b) => t(b.date) - t(a.date)), checked: P.checked}; };
