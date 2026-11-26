// ---------- Gifts and news, shared by Home's post band, The Post Room (#gifts) and The Champions Dispatch (#news) ----------
// POST (src/data/post.js). V2.postNow() -> {live: [...], past: [...], news: [...], checked}; a gift is live from its start until
// its end (UTC), so it moves to the stamp sheet by the clock, with no data change needed. A gift with no start counts as already
// started (review, Nov 18: it was shown nowhere), so it is live until its end passes.
// Only Mystery Gifts (Sim, Nov 18: "just mystery gifts"; he chose Serial Code and Event Gift): a gift of another kind (Battle Pass,
// Competition Prize, Livestream Reward, Early Download) is kept off every page even if it is in POST. V2.postMG(g): true for a Mystery Gift
// (no 'how' counts as one: a gift with a code reads as a serial code, one without as an event gift, as V2.prG reads it).
V2.postMG = g => !!g && !/pass|prize|competition|stream|twitch|early/i.test(String(g.how || g.via || g.method || g.type || ''));
V2.postNow = (now = Date.now()) => { const P = (typeof POST === 'object' && POST) || {gifts: [], news: []}, t = x => x ? Date.parse(x) : NaN;
  const g = (P.gifts || []).filter(V2.postMG), live = g.filter(x => !(t(x.start) > now) && !(t(x.end) < now)).sort((a, b) => t(a.end) - t(b.end)),
    past = g.filter(x => t(x.end) < now).sort((a, b) => t(b.end) - t(a.end));
  return {live, past, news: (P.news || []).slice().sort((a, b) => t(b.date) - t(a.date)), checked: P.checked}; };
// V2.safeUrl(u): the one link check for the family (Post Room sources, Dispatch headlines, Read links and Next Events, Home's band): u when
// it is an https:// URL, else ''. A javascript:, data:, http: or broken link never becomes a link; its words show as plain text.
V2.safeUrl = u => { u = typeof u === 'string' ? u.trim() : ''; if (!/^https:\/\//i.test(u)) return ''; try { return new URL(u).protocol === 'https:' ? u : ''; } catch (e) { return ''; } };
// V2.officialHost(u): true only for an official host or its subdomain (a URL parse, then the host equals it or ends with "." + it). The
// official news feed is champions-news.pokemon-home.com. A lookalike ("notpokemon.com", "pokemon.com.example.org") is not official.
V2.OFFICIAL_HOSTS = ['pokemon.com', 'pokemon-home.com', 'pokemonchampions.jp'];
V2.officialHost = u => { let h = ''; try { h = new URL(u).hostname.toLowerCase().replace(/\.$/, ''); } catch (e) { return false; } return V2.OFFICIAL_HOSTS.some(d => h === d || h.endsWith('.' + d)); };
// ---------- today's list from the daily data (Nov 18, switch blocker 5 / D3) ----------
// post.js is built into the page, so new headlines used to reach players only on a republish. The daily job writes out/post.json (post-news.mjs,
// the same shape as POST) and the morning refresh stores it as meta/post; the data loader (03-persistence.js, META_KEYS 'post') hands each
// answer to V2.postTake. A usable document replaces POST (so every reader, V2.postNow and the Dispatch's gifts and series, sees it); a
// missing, empty or malformed one puts the built-in POST back. Kept from the document: known fields only, every link through V2.safeUrl
// (a non-https one becomes '' and shows as plain text, as before), titles without markup; no article text or images can come in.
V2.POST_BUILTIN = typeof POST === 'object' && POST ? POST : null;
V2.postClean = v => { if (!v || typeof v !== 'object' || Array.isArray(v) || !Array.isArray(v.news) || !Array.isArray(v.gifts)) return null;
  const str = x => typeof x === 'string' ? x : '', when = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}/.test(x) && !Number.isNaN(Date.parse(x)) ? x : '',
    strs = a => Array.isArray(a) ? a.filter(x => typeof x === 'string') : undefined, obj = x => x && typeof x === 'object' && !Array.isArray(x);
  const pick = (x, keys) => { const o = {}; for (const [k, t] of keys) { const y = x[k]; if (y === undefined) continue;
    const z = t === 's' ? (typeof y === 'string' ? y : undefined) : t === 'n' ? (Number.isFinite(y) ? y : undefined) : t === 'a' ? strs(y) : t === 'u' ? V2.safeUrl(y) : t === 'm' ? (y === null || typeof y === 'string' ? y : undefined)
      : t === 'us' ? (strs(y) || []).map(V2.safeUrl).filter(Boolean) : undefined; if (z !== undefined) o[k] = z; } return o; };
  const news = v.news.filter(obj).map(n => { const o = pick(n, [['id', 's'], ['type', 's'], ['kind', 'n'], ['url', 'u']]);
    o.title = str(n.title).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 300); o.date = when(n.date); if (when(n.updated)) o.updated = n.updated; return o; }).filter(n => n.id && n.title && n.date);
  const gifts = v.gifts.filter(obj).map(g => pick(g, [['id', 's'], ['kind', 's'], ['item', 's'], ['mon', 's'], ['name', 's'], ['amount', 'n'], ['extras', 'a'], ['how', 's'], ['via', 's'], ['method', 's'], ['type', 's'],
    ['start', 's'], ['end', 's'], ['approx', 'a'], ['code', 's'], ['nature', 's'], ['ability', 's'], ['moves', 'a'], ['src', 'us'], ['note', 's']])).filter(g => g.id && g.name);
  const series = (Array.isArray(v.series) ? v.series : []).filter(obj).map(r => pick(r, [['id', 's'], ['month', 's'], ['name', 's'], ['entry', 's'], ['start', 's'], ['end', 's'], ['reg', 's'], ['battle', 's'], ['mon', 'm'], ['src', 'u']])).filter(r => r.id && r.month);
  if (!news.length) return null;
  return {checked: when(v.checked) || null, gifts, series, news}; };
// one answer of meta/post: the document when usable (its news joined with any built-in story it lacks, so a page built after the last
// refresh never loses a headline), else the built-in POST. Returns true when the document was used.
V2.postTake = v => { const B = V2.POST_BUILTIN, c = V2.postClean(v);
  if (!c) { if (B) POST = B; return false; }
  const have = new Set(c.news.map(n => n.id)); if (B && Array.isArray(B.news)) for (const n of B.news) if (n && !have.has(n.id)) c.news.push(n);
  POST = c; return true; };
