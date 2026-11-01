/* ---------- About & legal (Nov 1 2026): who we are, the disclaimer, data sources, privacy, contact ---------- */
/* One list of data sources for the footer and the About page (docs/legal-sources.md has the full record: each site's
   terms or robots rules, quoted, the date checked and how the daily job complies). Edit sources here only. */
var REG_NAME = 'Reg M-C';
const DATA_SOURCES = [
  {name: 'Limitless', url: 'https://play.limitlesstcg.com', use: 'Results, standings and team lists from online tournaments', terms: 'Read through its public API, within its rate limits'},
  {name: 'Victory Road', url: 'https://victoryroad.pro', use: 'Official event results and team lists', terms: 'Read once a day; its robots rules allow it'},
  {name: 'PokePaste', url: 'https://pokepast.es', use: 'Team lists linked from event results', terms: 'Only the team pages results link to, read once a day'},
  {name: 'Liquipedia', url: 'https://liquipedia.net/pokemon', note: 'CC BY-SA', use: 'Official event results and placements', terms: 'Read through its official API at its speed limits; text under CC BY-SA 3.0 (see below)'},
  {name: 'Pokémon Showdown', url: 'https://pokemonshowdown.com', use: 'Game data (Pokémon, moves, items, abilities) and public battle replays', terms: 'Game data under the MIT License (notice below); replays from its public replay API'},
  {name: 'Smogon', url: 'https://www.smogon.com/stats/', use: 'Monthly Showdown ladder usage stats', terms: 'Public stats files, read when a new month is out'},
  {name: 'op.gg', url: 'https://op.gg/pokemon-champions/tier', use: 'In-game ranked doubles usage order', terms: 'Read once a day and credited here, as op.gg asks'},
  {name: 'Pikalytics', url: 'https://www.pikalytics.com', use: 'Ladder usage, items and moves', terms: 'Read once a day from the pages its robots rules open to tools'},
  {name: 'Showdown Tier', url: 'https://showdowntier.com', use: 'Ladder tier list, usage and win rates', terms: 'Read once a day; its robots rules allow it'}];
const SD_MIT = `The MIT License (MIT)

Copyright (c) 2011-2026 Guangcong Luo and other contributors http://pokemonshowdown.com/

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;
const LEGAL_P1 = 'NastyPlot is an unofficial, fan-made tool. It is not affiliated with, endorsed, sponsored or approved by Nintendo, Game Freak, Creatures Inc. or The Pokémon Company, or by any of the data sources below. Pokémon and all related names, characters and images are trademarks and © of their respective owners, used here for identification only.';
/* the contact address is only put together when someone taps "Show email", so it never sits in the page as text */
const legalMail = () => ['moc.liamg', 'aggabsj.narmis'].map(s => s.split('').reverse().join('')).reverse().join('@');
/* the small "check the official rules" caption shown once wherever the page says something is legal or not */
function regNote(cls) { return `<p class="regnote${cls ? ' ' + cls : ''}">Based on our reading of the ${esc(REG_NAME)} rules — check the official rules before an event.</p>`; }
const srcNames = () => { const n = DATA_SOURCES.map(s => esc(s.name) + (s.note ? ` (${esc(s.note)})` : '')); return n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1]; };
/* footer: the source list comes from DATA_SOURCES */
function footFill() { const s = $('lgSrcList'); if (s) s.innerHTML = srcNames(); }
const ABT_ICON = {
  what: '<path d="M12 3.5 20 8v8l-8 4.5L4 16V8z"/><path d="M12 8v5M12 16v.5"/>',
  disc: '<path d="M12 3 19.5 6v6c0 4.6-3.2 8-7.5 9.2C7.7 20 4.5 16.6 4.5 12V6z"/><path d="M9 12h6"/>',
  data: '<ellipse cx="12" cy="6" rx="7" ry="2.6"/><path d="M5 6v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6M5 12v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6"/>',
  warr: '<path d="M12 3.5 21 19H3z"/><path d="M12 10v4M12 16.6v.4"/>',
  priv: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  names: '<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/>',
  contact: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/>',
  free: '<path d="M12 20s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>'};
function abtSec(key, tone, title, sub, body) {
  return `<details class="chsec chfold abtsec" id="abt-${key}"><summary>${CH.tog()}<span class="abtic ${tone}" aria-hidden="true"><svg viewBox="0 0 24 24">${ABT_ICON[key]}</svg></span><div style="flex:1;min-width:0"><div class="cht">${title}</div><div class="chs">${sub}</div></div></summary><div class="chbody abtbody">${body}</div></details>`; }
function renderAbout() { const el = $('aboutOut'); if (!el) return; if (el.dataset.done) return; el.dataset.done = '1';
  const src = DATA_SOURCES.map(s => `<li class="abtsrc"><div class="abtsn"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a>${s.note ? ` <span class="abtlic">${esc(s.note)}</span>` : ''}</div><div class="abtuse">${esc(s.use)}</div><div class="abtterm"><span aria-hidden="true">✓</span> ${esc(s.terms)}</div></li>`).join('');
  el.innerHTML = `<div class="abthero"><div class="chk">About &amp; legal</div><h2 class="chdisp">Made by fans, for doubles players</h2>
      <p>NastyPlot is a free team builder for Pokémon Champions VGC doubles. Unofficial and fan-made.</p>
      <div class="abtchips"><span>Free</span><span>No ads</span><span>Fan-made</span><span>Unofficial</span></div></div>
    ${abtSec('what', 'b', 'What NastyPlot is', 'A free fan tool for Champions VGC doubles',
      `<p>NastyPlot helps you build and check teams for Pokémon Champions VGC doubles (${esc(REG_NAME)}): what to bring, which threats you're ready for, damage, speed and the current meta from real tournament results.</p>
      <p>It's made by fans in their spare time. It is not affiliated with Nintendo, Game Freak, Creatures Inc. or The Pokémon Company.</p>`)}
    ${abtSec('disc', 'v', 'Disclaimer &amp; trademarks', 'Unofficial · not linked to Nintendo or The Pokémon Company',
      `<p>${esc(LEGAL_P1)}</p>
      <p>Pokémon pictures are Pokémon HOME artwork from the PokéAPI sprite collection, © Nintendo, Game Freak, Creatures Inc. and The Pokémon Company.</p>`)}
    ${abtSec('data', 'g', 'Where the data comes from', `${DATA_SOURCES.length} sources, credited and used by their rules`,
      `<p>Our daily data job names itself (NastyPlot, with a link and a contact email), runs once a day, waits at least a second between requests to the same site, and follows each site's terms and robots rules. None of these sources is connected with NastyPlot or endorses it.</p>
      <ul class="abtsrcs">${src}</ul>
      <h3 class="abth">Liquipedia</h3>
      <p>Event results from <a href="https://liquipedia.net/pokemon" target="_blank" rel="noopener noreferrer">Liquipedia</a> are by Liquipedia's contributors, used under the <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution-ShareAlike 3.0 License (CC BY-SA 3.0)</a>. We reshape them into tables and numbers; that reworked data is shared under the same license.</p>
      <h3 class="abth">Pokémon Showdown game data</h3>
      <p>Game data from <a href="https://github.com/smogon/pokemon-showdown" target="_blank" rel="noopener noreferrer">Pokémon Showdown</a> is used under the MIT License:</p>
      <pre class="abtlicense" tabindex="0">${esc(SD_MIT)}</pre>`)}
    ${abtSec('warr', 'm', 'No guarantee', 'Check the official rules before an event',
      `<p>NastyPlot is provided as-is, without warranty. Numbers, calcs and legality checks can be wrong; we're not responsible for results from using it. Always check the official rules before an event.</p>`)}
    ${abtSec('priv', 'b', 'Privacy', 'No names, no cookies, no ads or trackers',
      `<p>NastyPlot never asks for your name or email. It sets no cookies and has no ads or trackers. Here is everything it saves:</p>
      <ul class="abtlist">
        <li><b>Your teams.</b> Your current team, saved teams, box, the opponent team you're testing and your battle log are saved under an anonymous ID (not your name), so they're there next time. Anyone who can open this page could technically read that saved data, so don't put anything private in team names.</li>
        <li><b>Usage counts.</b> How many times each page or button was opened in a visit, with the date and phone or desktop, under the same anonymous ID. Never what you type. Only NastyPlot's owner can read these.</li>
        <li><b>Feedback.</b> Messages you send with the Feedback button, with the page you were on, phone or desktop and the time. Only the owner can read them.</li>
        <li><b>On this device only.</b> Your theme, the last page you opened, which sections are open, sort and filter choices, and a copy of your teams stay in this browser's storage. They never leave your device; clearing your browser data removes them.</li>
        <li><b>Fonts.</b> Fonts load from Google Fonts, which sees an ordinary request from your device, like any web font.</li></ul>
      <p>Want your saved data or feedback deleted? Email us (see Removal &amp; contact).</p>`)}
    ${abtSec('names', 'g', 'Player names', "From public results · ask and we'll remove yours",
      `<p>Player names and teams come from public tournament results (adult Masters division only). If you're a player and want your name removed, email us and we'll remove it.</p>`)}
    ${abtSec('contact', 'v', 'Removal &amp; contact', 'Email us about anything shown here',
      `<p>If you own something shown here and want it changed or removed, or have any legal question, email us — we'll respond quickly.</p>
      <div class="abtmail" id="abtMail"><button type="button" class="chghost abtshow" data-abtmail="show">Show email</button></div>`)}
    ${abtSec('free', 'm', 'Not for money', 'Free · no ads, paid features or donations',
      `<p>NastyPlot is free and has no ads, paid features or donations.</p>`)}`; }
/* open the About page, optionally at one section (footer links) */
function aboutOpen(sec) { setView('about', !sec); if (!sec) return; const d = $('abt-' + sec); if (!d) return; d.open = true;
  setTimeout(() => { try { d.scrollIntoView({block: 'start', behavior: 'smooth'}); } catch (e) { d.scrollIntoView(); } }, 60); }
document.addEventListener('click', e => { const t = e.target && e.target.closest && e.target.closest('[data-about],[data-abtmail]'); if (!t) return;
  if (t.dataset.about !== undefined) { e.preventDefault(); aboutOpen(t.dataset.about || ''); return; }
  const box = $('abtMail'); if (!box) return; const m = legalMail();
  if (t.dataset.abtmail === 'show') { box.innerHTML = `<a class="abtaddr" href="mailto:${esc(m)}">${esc(m)}</a><button type="button" class="chghost abtcopy" data-abtmail="copy">Copy</button>`; return; }
  if (t.dataset.abtmail === 'copy') { try { navigator.clipboard.writeText(m).then(() => toast('Email copied'), () => toast('Press and hold the address to copy it')); } catch (er) { toast('Press and hold the address to copy it'); } } });
safe('footer sources', footFill);
