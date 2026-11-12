# Team link: what exists today, and the plan (Sim's items F22-F25, Nov 12). PLAN ONLY, nothing built.

## F22. What exists today (checked by reading the code, Nov 12)
- **A team link already exists**, on today's site and the new build: `#team=<code>` (app/src/app/45-team-links.js).
  The code is the team written as JSON then base64url: each Pokémon's name, and only what differs from the usual set
  (Ability if not the usual, moves if changed, item and nature + stat points if set), plus the team's name (up to 60 letters).
  Nothing goes to a server; the whole team travels in the link.
- **Where it goes:** on claude.ai the link points at the live artifact (TL_ART); on any other site it points at that site's own
  address. So it will point at the public site in January without changes (checked in `teamLinkBase`).
- **Opening one today:** today's site shows a "Shared team" bar; the new build shows a "Shared team" sheet with the six and
  "Open This Team" / "Not now". Opening **replaces your team** (Undo brings it back). It is not a look-only view and does not
  offer "Save to My Teams". Checks on the way in: one of each species, real Abilities only, legal items only, at most 6.
- **Box links** (`#box=`) work the same way: your box's names in the link; Add or Replace, both with Undo.
- **Share:** the new build's Share sheet has Team Card / Poster / Sheet images, Save Image and **Copy Team Link** already.
  The images say "NastyPlot, unofficial fan tool" but **no address**, so a posted picture can't lead back.
- **Copy for Showdown:** copies the team as Showdown text (paste into Showdown or a team site). No link.
- **Bug found while checking (fixed, 5626d00):** in the Preview only, every team and box link was silently dropped (the Preview's
  "land on My Team" step reset the address first). Real builds never had this.
- **Not yet checked:** whether claude.ai passes the `#team=` part into the artifact when someone taps a link to the live site
  (I can't open claude.ai from here). One tap on Sim's phone answers it.

## F23. The plan (pictures: link-desktop.png, link-phone.png, link-phone-2.png, link-broken-phone.png)
1. Copy Team Link stays in the Share sheet next to the images (already there on the new build).
2. **Opening a link = a look-only My Team** for the link's team: the Strength Score, six, Set, Matchups, Suggestions and Team Checks,
   worked out for that team. Eyebrow "Shared team · look only"; no Remove / Lock / Set as Lead / Apply. Two buttons:
   **Save to My Teams** (main; with Undo) and **Back to My Team**. One line: "Your own team and saved teams stay as they are."
   Your team (S.slots) and saved teams are never touched unless you tap Save.
3. **A brand-new visitor** lands straight on that view (no welcome card in front).
4. **Broken, cut-off or edited link:** the normal site and one plain message ("That team link didn't work: it may be cut off");
   **recommend: refuse the whole link if any Pokémon in it can't be read**, so it never half-loads (today it silently drops
   unreadable rows). Old-regulation Pokémon: say which were left out.
5. Names from a link are shown as text only (already: escaped).
6. **Address on the share images** (small, next to "NastyPlot, unofficial fan tool"): needs the public address. Not decided yet.

## F24. Length (measured Nov 12, node, same format as teamCode)
| Team | Code | Whole link (claude.ai) | Whole link (a short public address) |
|---|---|---|---|
| Six Pokémon, usual sets | 158 | 213 | 186 |
| Six with every set changed + a 33-letter name | 914 | 969 | 942 |
Shorter options: squeeze the code (deflate): 914 -> 467; numbers instead of names: about 146, but a numbering that changes with
the data would break old links, so it needs a fixed, versioned list. Recommend: deflate now (old links keep opening), numbers never.
Platforms (**not yet checked**, my understanding only, to test with real posts): Discord allows 2,000 characters per message, so
both fit; Reddit should keep a long link working; TikTok and Instagram don't make links in captions or comments tappable at all,
so there the address printed on the picture is the only way back.
COPPA: the team's name is free text a child could fill with their own name. **Recommend: leave the name out of the link**
(the look-only view titles the team by its style, e.g. "Rain Team").

## F25. Tests before it is called done
Make a link -> open it in a fresh browser: same six, same sets, same Strength Score; the visitor's own team and saved teams
unchanged (compared before/after); Save to My Teams adds one saved team, Undo removes it; a cut-off, edited, empty and
nonsense link each show the message and the normal site with nothing changed; a name with <script> shows as text;
every check at 390 and 1440, Chromium and WebKit; one real tap on Sim's iPhone in the Claude app.
