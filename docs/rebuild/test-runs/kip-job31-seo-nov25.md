# Kip job 31: SEO research (answer pasted by Sim, Wed Nov 25, about 1:45 PM ET)
Full answer: in the chat of Nov 25 (session HH). Key points kept here.

- Competitors ranking today (Kip, live Google, Nov 25): Pokemon Zone, Pikalytics, PokéBase, Showdown calc, Limitless, OP.GG,
  PokeSynergy (#1 for "team builder" and "team checker"), ChampTeams.gg (AI Arena needs sign-in). Search volumes: not checked.
- Gap: no top site gives a free, no-account 0-100 team score graded from real results, with Matchups vs the top 30 threats.
- Fastest wins: one page per Pokémon (set queries still rank YouTube/Reddit in the top 3) and Reg M-D pages in launch week
  (Mega Heatran, Mega Tatsugiri, Dondozo, "reg m-d tier list"). The other 21 new Pokémon and 2 Megas were not named yet (Nov 25).
- Game words: "Replica Teams" replaced "Rental Teams"; "Stat Points (SP)" replaced EVs. HH checked: our pages use neither
  "Rental" nor "Replica" (grep app/src, Nov 25).
- Suggested titles/descriptions per page type: kept in the chat; input only (our rules win, Sim decides wording).
- Search Console: Domain property via a Cloudflare DNS TXT record; submit sitemap.xml; request indexing for key pages;
  indexing takes a day to 1-2 weeks (Google's docs).

HH checks (Nov 25, 1:50 PM): the public build's sitemap (app/build.mjs line 214-216, `--public`) lists 24 page types
(/, /team, /build, /battle, /calc, /speed, /meta, /usage, /sets ...) and NO per-Pokémon pages. That is the biggest gap
against Kip's findings.
