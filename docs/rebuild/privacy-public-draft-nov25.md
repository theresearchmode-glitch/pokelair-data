# Privacy page for nastyplot.org: APPROVED words (Sim, Nov 25); ships only when each row is true
The public site's version of About → Privacy. Same layout as today's page (rows of: title · short tag · text), new words, because
today's text describes the Claude-hosted version ("Your Claude account", "the anonymous ID Claude gives this page") — untrue on
nastyplot.org (launch review D). Every sentence must be TRUE ON THE DAY IT GOES LIVE; the "Must be true first" list says what the
build team has to finish before this text can ship.

## The rows (public site)
1. **Your teams** · On this device only
   Your team, saved teams, box, the opponent team you're testing and your battle log stay in this browser. Nothing about your teams is
   sent to us. Clearing your browser data removes them. To move a team to another device, use a team code or Export.
2. **Team codes** · Only what's in the team
   A team code holds the six Pokémon and their sets, nothing else: no name, no device, no date. Anyone you give it to can open the team.
3. **Feedback** · Only what you send
   The message you send, its kind (bug, idea...), the page you were on and the date (not the time). There's no field for contact
   details, and any email address, phone number or @handle typed into a message is removed before it's saved. Only the owner reads
   feedback, it's never shown on the site, and it's deleted after 180 days.
4. **Visit counts** · Totals only
   We count visits and team checks as plain totals (for example "1,200 team checks today"), using Cloudflare's privacy-first analytics:
   no cookies, no ads, no tracking across other sites, nothing that identifies you.
5. **Spam protection** · Cloudflare
   The feedback form uses Cloudflare Turnstile to check a person is sending it, not a bot. Cloudflare, which runs the site, also uses
   your IP address to deliver pages and block attacks. We don't store IP addresses.
6. **No accounts, no ads** · Nothing to sign up for
   There are no accounts, no logins, no ads and no third-party trackers. The site's fonts and pictures come from NastyPlot itself.
7. **Kids** · Built for all ages
   Lots of young players use NastyPlot, so we never ask for names, emails or anything personal. If you sent something personal by
   mistake, a parent can ask us to delete it: tap "Show email" below.
8. **Contact** · hello@nastyplot.org (behind "Show email")
   Questions, deletion requests or a mistake on the site.
9. **Not affiliated** (already in the footer)
   NastyPlot is an unofficial fan site, not affiliated with Nintendo, Game Freak or The Pokémon Company.

## Must be true first (build team, before this ships) — each checked on the day
- Row 3 "deleted after 180 days": a scheduled delete in the feedback Worker/D1 (not built yet).
- Row 4: the anonymous counter + Cloudflare Web Analytics (queue item 4; not built yet). Until then, row 4 says "We don't count visits yet."
- Row 5: Turnstile on the page (queue item 5; needs tonight's site key). Not checked: whether Turnstile sets any cookie — check Cloudflare's docs; if it does, say so.
- Row 8: hello@nastyplot.org works (Email Routing, tonight with Dos).
- Row 1 "Export": the Export/Import feature is planned (Dec); until it ships, drop "or Export".
- No cookies anywhere in our code (checked Nov 15 for the Claude version; re-check the public build: security-csp-test reports 0 cookies).
Not legal advice (COPPA notes: docs/rebuild/test-runs/kip-job32-limitless-coppa-nov25.md).
