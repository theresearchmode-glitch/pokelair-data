// ---------- feedback: the kinds and the scrub, shared with the new build (moved unchanged from 53-feedback.js, Nov 15) ----------
const FB_KINDS = [['bug', 'Something broke'], ['confusing', 'Confusing'], ['idea', 'Idea'], ['like', 'I like this'], ['mistake', 'Wrong info']];
/* personal details typed by mistake are removed before saving: email addresses, phone numbers (9+ digits, so damage
   ranges like "45.2 - 53.1%" and EV spreads stay) and @handles (not Showdown's "Mon @ Item", which has a space) */
function fbScrub(t) { let n = 0; t = String(t || '')
  .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, () => { n++; return '[email removed]'; })
  .replace(/\+?\d[\d\s().-]{7,}\d/g, m => (m.match(/\d/g) || []).length >= 9 ? (n++, '[number removed]') : m)
  .replace(/(^|[\s(])@[A-Za-z0-9_.]{2,}/g, (m, a) => { n++; return a + '[handle removed]'; });
  return {t, n}; }
