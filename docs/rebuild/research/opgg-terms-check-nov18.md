# op.gg terms check (independent re-check)

Written: Tue Nov 17, 2026, 7:40 PM New York time (from `bash docs/rebuild/now.sh`; the file name says nov18 because the
caller asked for it; UTC was already Nov 18).
Look-only: no code or data changed. Not legal advice; I am not a lawyer.

## Verdict

1. **The helper's claim is right.** op.gg's Terms of Use ban scraping, automated scripts that collect information, and
   copying Site Content without written permission. Our daily `opgg.mjs` read does exactly that. Checked (quotes below).
2. **One correction to the helper:** the ban is **not new**. The same sentences were already in op.gg's Terms in May 2025
   (archived copy). Our Nov 1 row missed it; it did not change after we checked.
3. **Unsure:** op.gg's own help center (still live, last edited 2025-12-31) says crawling is "in general" not prohibited.
   The two op.gg pages contradict each other. The Terms say a waiver only counts "in writing and signed by us". That
   points to the Terms winning (my reading, not a lawyer's).

## 1. What our code does (checked in code)

- `opgg.mjs`: opens `https://op.gg/pokemon-champions/tier` in a headless Chromium (Playwright), clicks the "Double" tab,
  and reads every `a[href*="/pokemon-champions/pokedex/"]` link: the Pokémon key, name and rank. It also reads the season
  label ("M-8"). Writes `out/meta_ingame.json` (ranks only, no sets).
  - One page load per run, plus whatever the page itself loads when the tab is clicked (not counted).
  - User-Agent: a Mac Chrome string plus our `NastyPlot-data/1.0 (...)` string (from `http.mjs`).
- How often: `.github/workflows/update.yml` line 63, once a day (cron `7 9 * * *`, plus manual runs):
  `(npm ci && npx playwright install --with-deps chromium && node opgg.mjs) || node skip.mjs "op.gg skipped"`.
  No other workflow or script calls it (checked: grep).
- It is running: `origin/main:out/meta_ingame.json` says `updated 2026-11-17T11:25:13Z`, season M-8, 256 Pokémon.
- `docs/legal-sources.md` line 29 (checked 2026-11-01) quotes only the help center and calls this compliant.
- The About page (`app/src/app/56-about-data.js` line 12) tells visitors: "Read once a day and credited here, as op.gg asks".

## 2. What op.gg says today (checked, fetched Nov 17, 2026)

### Terms of Use: https://op.gg/lol/policies/agreement
(`https://op.gg/policies/agreement`, the link in the Pokémon Champions page footer, redirects here.)
"**Last Updated: 2026-09-14**"

- Proprietary Rights: "No Site Content may be modified, copied, distributed, framed, reproduced, republished, downloaded,
  displayed, posted, transmitted, or sold in any form or by any means, in whole or in part, without our prior written
  permission"
- Same section: "You are further prohibited from: - scraping or data mining while using the Sites or Services;
  - blocking, overwriting, modifying and copying of any contents of the Sites; or - performing any actions that may impair
  the operability of the Sites' infrastructure"
- User Conduct: "you agree not to use the Services or the Sites to: ... 03. use automated scripts to collect information
  from or otherwise interact with the Services or the Sites;"
- Site Content includes "information ... and their selection and arrangement". A usage ranking is arguably exactly that
  (my reading).
- Accounts: "You may use the Sites and Services for your personal, non-commercial use only."
- Entire agreement: "Any waiver of any provision of the Terms or Privacy Policy will be effective only if in writing and
  signed by us."
- Contact: "Email: service@op.gg" (Contact Us section).

### The same ban in May 2025 (checked, Wayback Machine)
https://web.archive.org/web/20250529043521/https://op.gg/lol/policies/agreement ("Effective as of: 2024"):
"You are further prohibited from (a) scraping or data mining while using the Sites or Services; ..." and
"use automated scripts to collect information from or otherwise interact with the Services or the Sites;".
So the ban predates our Nov 1 check. What the 2026-09-14 update changed is **unsure** (it adds a "Creator Content"
section; I did not diff the rest).

### Help center: https://help.op.gg/hc/en-us/articles/31091405109401-Can-I-use-OP-GG-data
Still live. Dates from its public Zendesk API (`help.op.gg/api/v2/help_center/en-us/articles/31091405109401.json`):
created 2024-04-11, **edited 2025-12-31**, updated 2026-09-02.
- "In general, OP.GG does not prohibit data crawling or web scraping. However, if there is any commercial use without
  citing the source or if excessive requests affect our service operation, access to the service may be restricted."
- "Please ensure proper source citation when using the data, and be careful not to affect service operation."
- Also: "All game data currently used by OP.GG is collected through official APIs provided by each game company, and
  this data is not provided to third parties."

### robots.txt: https://op.gg/robots.txt
`User-Agent: * / Allow: /` (only Googlebot/Bingbot query-string rules and one blocked bot, `carbon-umbrella-bot`).
robots.txt allows our fetch. It is a crawler courtesy file, not permission under the Terms.

### Privacy Policy: https://op.gg/lol/policies/privacy
"Last Updated: 2026-09-14". Nothing about crawling found (searched for "crawl" and "scrap"). Not relevant to us.

## 3. Does our daily read conflict?

- **With the Terms: yes** (checked). An automated script (headless browser, daily) collects information and we republish
  it. That matches "scraping or data mining", "automated scripts to collect information" and copying Site Content without
  written permission. Nothing in the Terms exempts small or credited use.
- **With the help center: no** (checked). We cite the source (footer + About), make one request a day, and are
  non-commercial (About page: "free and has no ads, paid features or donations").
- **Unsure:**
  - Which page binds. The Terms are the contract and say waivers must be written and signed. The FAQ is op.gg staff's
    public answer and was edited more recently than the 2025 Terms that already had the ban. A lawyer could weigh this;
    I can't.
  - Whether browse-only Terms bind a visitor who never made an account (no account is used). Unsure; I'd not rely on it.
  - Whether a bare rank order is protected content. It is a fact list, but the Terms forbid the act (scraping), not only
    copying. Unsure.
  - The public launch (January 2027) raises the stakes: the public site would show op.gg's order to everyone.
- The About page line "as op.gg asks" is true to the FAQ but not to the Terms, so it reads as more certain than it is.

## 4. What depends on op.gg (checked in code)

`opgg.mjs` gives **one thing**: the in-game Ranked Doubles **usage order** (rank only, ~256 Pokémon, plus the season
label). No sets, no percentages, no win rates. It reaches the site this way:

| Where | What it does with the op.gg order | File |
|---|---|---|
| Usage page, "Ranked ladder" view | The **default** source (first chip, `aria-pressed="true"`); falls back to Online tournaments if missing | `app/src/v2/pages/usage.js` l.6, l.42; `app/src/body.html` l.295; `02-set-data.js` l.124 (`metaSrc:'ingame'`) |
| Sets page, "Best data" | Default source; the rank line ("#N") comes from the op.gg order; the set itself comes from other sources | `app/src/v2/pages/sets.js` l.13-15; `21-sets.js` l.59-63; `02-set-data.js` l.43-48 |
| Pokémon ratings (tiers) | One of up to 5 popularity inputs (`W.ingame: 1`); popularity is 30% of a rating's evidence. So roughly a fifth of 30% (my reading of the code, effect not measured) | `perf.mjs` l.20-26 (`perf.json` `ingame`), `16-outside-performance-data.js` l.68-82, `13-rating.js` l.20, l.50 |
| Team Sheet evidence | Line "In-game Ranked Doubles: #N most used (op.gg, season ...)" | `24-sheet-data.js` l.13 |
| Quick add / Meta wording | "in-game doubles" label when that source is picked | `09-quick-add.js` l.103 |
| Data health | Stale alert after 3 days (`health.mjs` l.31, l.58; page `43-data-health.js` l.5) | |
| Saved snapshots | `meta/doubles_ingame` in `ratings-snapshot.mjs`, `ckwin-snapshot.mjs`; `build.mjs` `--preview-data` | |
| Credits | Footer + About & legal (`56-about-data.js` l.12), "how we rate" (`63-method-data.js` l.11) | |

If op.gg stops: the app already falls back (Usage to tournaments; ratings drop the input when `PD.ingame` is empty),
so nothing breaks, but the default "Ranked ladder" view would vanish and ratings would shift a little (not measured).
Also `ratings-snapshot.mjs` and `ckwin-snapshot.mjs` rely on Playwright being installed **by the op.gg step**; pausing that
step needs the install kept (or moved), or those two steps will skip.

## 5. Options (each with a short reason)

1. **Pause `opgg.mjs` now** (remove or comment out the step; keep the Playwright install). Why: stops the conflict at once,
   and the site already has fallbacks. Cost: lose the in-game order until a replacement lands.
2. **Ask op.gg for written permission** at service@op.gg (the Terms' stated contact), quoting their own help-center line
   and our use (one page a day, credited, free, no ads). Why: the Terms ask for exactly that, and a yes settles the
   contradiction. Can run alongside option 1.
3. **Replace with championsbattledata.com** (checked today): `GET /api/rankings?format=Doubles` returns the in-game
   Doubles order ("the game's own ordering", 262 Pokémon, current season, generated 2026-11-17). Its API rules
   (https://championsbattledata.com/api-rules/) say: "You may use the Pokémon Champions Battle Data API for personal,
   community, nonprofit, and commercial projects", "Attribution Required", and "You may not ... redistribute this API or
   its data as a standalone product". robots.txt: `Allow: /`. Why: an official API with written permission, no headless
   browser. Unsure: where it gets its data (not stated), and whether its season ("Current"/M7) lines up with op.gg's "M-8"
   label (its top 10 today closely matches our op.gg order, same names, slightly different order). Needs Sim's OK:
   it is a new outside source and needs its own legal-sources row.
4. **Keep reading op.gg on the help-center line alone.** Not recommended. Why: the binding Terms say no, and the launch
   makes the site public.

Either way, `docs/legal-sources.md` line 29 and the About line "as op.gg asks" need updating (Sim's call; I changed
nothing).
