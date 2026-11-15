// ---------- event calendar helpers shared by today's page and the new build (Nov 14; moved unchanged from 63-weekly.js) ----------
/* ---------- Upcoming events (Nov): the official VGC calendar with a countdown, at the top of Events ----------
   meta/calendar (out/calendar.json from calendar.mjs, read from Victory Road's season calendar). Dates are the event's own
   local dates (VGC days), so the countdown counts calendar days from the viewer's today. */
// cleanCalendar: moved to 05-data-clean.js (R4, Nov 11; shared with the rebuild)
const CAL = {
  today: () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; },
  days: (a, b) => Math.round((Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10)) - Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10))) / 864e5),
  type: {worlds: 'Worlds', international: 'International', regional: 'Regional', sc: 'Special', pbl: 'Premier Ball League', national: 'National', online: 'Online'},
  country: cc => { try { return cc ? new Intl.DisplayNames(['en'], {type: 'region'}).of(cc) : ''; } catch (e) { return cc; } },
  when: e => { const t = CAL.today(); if (e.s <= t && e.e >= t) return ['live', 'Live now']; const d = CAL.days(e.s, t);
    return d === 1 ? ['soon', 'Tomorrow'] : d <= 7 ? ['soon', `in ${d} days`] : ['', `in ${d} days`]; },
  range: e => { const o = {month: 'short', day: 'numeric'}, a = new Date(e.s + 'T12:00:00'), b = new Date(e.e + 'T12:00:00');
    if (e.s === e.e) return a.toLocaleDateString('en-US', o); return a.getMonth() === b.getMonth() ? `${a.toLocaleDateString('en-US', o)}–${b.getDate()}` : `${a.toLocaleDateString('en-US', o)} – ${b.toLocaleDateString('en-US', o)}`; },
  /* a finished official event with results in meta/events: same city, within 3 days */
  results: e => { const E = META.events; if (!E) return null; const nz = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(), c = nz(e.city.split(',')[0]);
    return c ? E.events.find(x => x.src === 'official' && nz(x.name).includes(c) && Math.abs(CAL.days(x.date, e.s)) <= 3) || null : null; }
};
