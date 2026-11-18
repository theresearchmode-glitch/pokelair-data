// ---------- Gifts and news, shared by Home's post band, The Post Room (#gifts) and The Champions Dispatch (#news) ----------
// POST (src/data/post.js). V2.postNow() -> {live: [...], past: [...], news: [...], checked}; a gift is live from its start until
// its end (UTC), so it moves to the stamp sheet by the clock, with no data change needed. A gift with no start counts as already
// started (review, Nov 18: it was shown nowhere), so it is live until its end passes.
// Only Mystery Gifts (Sim, Nov 18: "just mystery gifts"; she chose Serial Code and Event Gift): a gift of another kind (Battle Pass,
// Competition Prize, Livestream Reward, Early Download) is kept off every page even if it is in POST. V2.postMG(g): true for a Mystery Gift
// (no 'how' counts as one: a gift with a code reads as a serial code, one without as an event gift, as V2.prG reads it).
V2.postMG = g => !!g && !/pass|prize|competition|stream|twitch|early/i.test(String(g.how || g.via || g.method || g.type || ''));
V2.postNow = (now = Date.now()) => { const P = (typeof POST === 'object' && POST) || {gifts: [], news: []}, t = x => x ? Date.parse(x) : NaN;
  const g = (P.gifts || []).filter(V2.postMG), live = g.filter(x => !(t(x.start) > now) && !(t(x.end) < now)).sort((a, b) => t(a.end) - t(b.end)),
    past = g.filter(x => t(x.end) < now).sort((a, b) => t(b.end) - t(a.end));
  return {live, past, news: (P.news || []).slice().sort((a, b) => t(b.date) - t(a.date)), checked: P.checked}; };
// V2.safeUrl(u): the one link check for the family (Post Room sources, Dispatch headlines, Read links and Fixtures, Home's band): u when
// it is an https:// URL, else ''. A javascript:, data:, http: or broken link never becomes a link; its words show as plain text.
V2.safeUrl = u => { u = typeof u === 'string' ? u.trim() : ''; if (!/^https:\/\//i.test(u)) return ''; try { return new URL(u).protocol === 'https:' ? u : ''; } catch (e) { return ''; } };
// V2.officialHost(u): true only for an official host or its subdomain (a URL parse, then the host equals it or ends with "." + it). The
// official news feed is champions-news.pokemon-home.com. A lookalike ("notpokemon.com", "pokemon.com.example.org") is not official.
V2.OFFICIAL_HOSTS = ['pokemon.com', 'pokemon-home.com', 'pokemonchampions.jp'];
V2.officialHost = u => { let h = ''; try { h = new URL(u).hostname.toLowerCase().replace(/\.$/, ''); } catch (e) { return false; } return V2.OFFICIAL_HOSTS.some(d => h === d || h.endsWith('.' + d)); };
