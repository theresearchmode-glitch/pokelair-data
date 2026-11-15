/* ---------- About & legal (Nov 1 2026): who we are, the disclaimer, data sources, privacy, contact ---------- */
/* the words, sources and parts live in 56-about-data.js (shared with the new build, Nov 15); this file keeps today's privacy
   text, the folds, the footer fill and the listeners */
/* footer: the source list comes from DATA_SOURCES */
function footFill() { const s = $('lgSrcList'); if (s) s.innerHTML = srcNames(); }
const ABT_PRIV_TODAY = `<p>NastyPlot never asks for your name, email or any contact details, and never reads them from your Claude account. It sets no cookies and has no ads or trackers. Here is everything it saves:</p>
      <ul class="abtlist">
        <li><b>Your teams.</b> Your current team, saved teams, box, the opponent team you're testing and your battle log are saved under an anonymous ID (not your name), so they're there next time. Anyone who can open this page could technically read that saved data, so don't put anything private in team names.</li>
        <li><b>Usage counts.</b> How many times each page or button was used in a visit, with the date and phone or desktop. Never what you type, and no first- or last-visit dates. Only NastyPlot's owner can read these.</li>
        <li><b>Feedback.</b> The message you send with the Feedback or Report a mistake button, its kind, the page you were on, phone or desktop and the date (not the time). Email addresses, phone numbers and @handles typed into a message are removed before it's saved. There's no field for contact details. Only the owner can read feedback.</li>
        <li><b>One anonymous ID.</b> The page's storage only lets each person write their own records, so your teams, usage counts and feedback are each filed under the same anonymous ID that Claude gives this page. It's a random code, not your name, email or username, and NastyPlot never looks up who an ID belongs to.</li>
        <li><b>On this device only.</b> Your theme, the last page you opened, which sections are open, sort and filter choices, and a copy of your teams stay in this browser's storage. They never leave your device; clearing your browser data removes them.</li>
        <li><b>Fonts.</b> Fonts load from Google Fonts, which sees an ordinary request from your device, like any web font.</li></ul>
      <p>Want your saved data or feedback deleted? Email us (see Removal &amp; contact).</p>`;
function abtSec(key, tone, title, sub, body) {
  return `<details class="chsec chfold abtsec" id="abt-${key}"><summary>${CH.tog()}<span class="abtic ${tone}" aria-hidden="true"><svg viewBox="0 0 24 24">${ABT_ICON[key]}</svg></span><div style="flex:1;min-width:0"><div class="cht">${title}</div><div class="chs">${sub}</div></div></summary><div class="chbody abtbody">${body}</div></details>`; }
function renderAbout() { const el = $('aboutOut'); if (!el) return; if (el.dataset.done) return; el.dataset.done = '1';
  el.innerHTML = `<div class="abthero"><div class="chk">About &amp; legal</div><h2 class="chdisp">Made by fans, for doubles players</h2>
      <p>A team builder for Pokémon Champions VGC doubles.</p>
      <div class="abtchips"><span>Free</span><span>No ads</span><span>Fan-made</span><span>Unofficial</span></div></div>
    ` + ABT_PARTS(ABT_PRIV_TODAY).map(p => abtSec(...p)).join('\n    '); }
/* open the About page, optionally at one section (footer links) */
function aboutOpen(sec) { setView('about', !sec); if (!sec) return; const d = $('abt-' + sec); if (!d) return; d.open = true;
  setTimeout(() => { try { d.scrollIntoView({block: 'start', behavior: 'smooth'}); } catch (e) { d.scrollIntoView(); } }, 60); }
document.addEventListener('click', e => { const t = e.target && e.target.closest && e.target.closest('[data-about],[data-abtmail]'); if (!t) return;
  if (t.dataset.about !== undefined) { e.preventDefault(); aboutOpen(t.dataset.about || ''); return; }
  const box = $('abtMail'); if (!box) return; const m = legalMail();
  if (t.dataset.abtmail === 'show') { box.innerHTML = `<a class="abtaddr" href="mailto:${esc(m)}">${esc(m)}</a><button type="button" class="chghost abtcopy" data-abtmail="copy">Copy</button>`; return; }
  if (t.dataset.abtmail === 'copy') { try { navigator.clipboard.writeText(m).then(() => toast('Email copied'), () => toast('Press and hold the address to copy it')); } catch (er) { toast('Press and hold the address to copy it'); } } });
safe('footer sources', footFill);
