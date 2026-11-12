// ---------- Home's numbers (R4 Home, Nov 12): shared by today's page (71-manga.js MG.month / srcLine / pct) and the new build ----------
// Moved here unchanged so both builds say exactly the same thing. Data only, no HTML.
// the month of a usage period "2026-10" -> "October"
const homeMonth = per => { const m = /^(\d{4})-(\d{2})/.exec(per || ''); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, 15)).toLocaleString('en-US', {month: 'long', timeZone: 'UTC'}) : ''; };
// the data line under the most-used Pokémon: "Most used in October, Showdown ladder 1630+. Data as of Nov 10"
const homeSrcLine = () => { const d = typeof META === 'object' && META && META[S.format]; if (!d) return 'Share of teams that bring each one';
  const src = String(d.source || '').replace(/\s*\(.*$/, '').trim(), mo = homeMonth(d.period); return `Most used${mo ? ' in ' + mo : ''}${src ? ', ' + src : ''}${typeof dataDateText === 'function' && dataDateText() ? '. ' + dataDateText() : ''}`; };
// a Pokémon's share of teams, one decimal ("35.6"), '' when unknown
const homePct = p => { const u = U(p); return u ? u.toFixed(1) : ''; };
// 13826 -> "13,826"
const homeNum = n => n && n.toLocaleString ? n.toLocaleString('en-US') : String(n || 0);
