# Stress test, words and consistency (helper, Nov 16 ~2:13 AM; look-only). Status per item.
HIGH
1. Home tool links opened the hub, not the page named. FIXED (ed969c0).
2. "outspeeds X% of the top 30" differs: Speed page (your sets, e.g. Choice Scarf Garchomp 95%) vs Pokémon page (usual set 98%). OPEN: name the set.
3. Speed: heading "top 20" vs rows "top 30 threats". OPEN (both true; Sim note).
4. Footer "(5 days old)" vs Events "(6 days ago)": two ways of counting days. OPEN.
5. One pair, two game counts: Kingambit page "Sneasler 2,884 games" vs Sneasler page / Practice "3,582". OPEN (check source).
6. Word list: "Converts to top cut 93" (Pokémon pages). OPEN.
7. Word list: "grade" for the team score on How We Calculate (6 places). OPEN.
8. My Team: Suggestions "Nothing to fix" while Things to Know shows "1 fix" (Quick add Mega Dragonite). OPEN (check).
MEDIUM
9. "ready for" wording (About, Test Run, How We Calculate). OPEN.
10. Kingambit page: Typical set Defiant 99% vs Abilities 96%; typical item Life Orb vs list Chople 40% first; Usually moves skip Iron Head 76%. OPEN (check sources).
11. Counts: "345 rated" vs "ranked among 321"; About "9 sources" vs Meta "4 data sources". OPEN.
12. Source names vs the word list (Limitless, Showdowntier, Smogon usage stats, op.gg). OPEN.
13. Showdown rating cut-offs: 1630+ (Home, Sets) vs 1760+ (Meta, Method) vs 1,300+ (Practice). OPEN (check: may be different data).
14. Events "113 events" then "from the last 30 days"; top-cut depth differs Events vs Winning Teams. OPEN.
15. My Team Your Games block vs say-it-once one line; "None logged yet" vs "No games logged yet". OPEN.
16. "?" tip reads into the text in innerText ("teams?"). Spoken label is right; check spacing.
17. Missing spaces where elements meet (innerText): Build "1st9-1", Method "statsNov 2". Check screen readers.
SAY IT ONCE: 18 My Team top bar repeats the eyebrow; "TOP 1%" twice; "most recent event winners" x4. 19 Home "13,826 real tournament teams" x3.
  20 Meta tier band twice. 21 Method repeats. 22 Track "fair test" twice. 23 About disclaimer twice. 24 dates outside footer (Meta "DATA FROM NOV 10", Events "checked Nov 10").
  25 card watermark names not aria-hidden (read 3 times).
CAPITALISATION: 26 "How It Works" vs "How it works", "Load Team ›" vs "Load Team" etc. 27 sentence-case buttons ("In my box", "List with win rates",
  "Best data", "See the placings, 1st to 8th ›", "Show More · 100 left ›", calc toggles, "Matchup prep ›", usage tabs). 28 headings sentence case on
  Pokémon/Usage/Sets vs Title Case elsewhere. 29 "MEGA Charizard Y" on Sets.
DATES/NUMBERS: 30 five date formats. 31 "2027 Gdańsk Regional" (season name) vs "Gdańsk Regional". 32 "13.8k" vs "13,826"; "Reg M‑C" non-breaking hyphen. 33 Track 34 events, 287 top-8 teams (ties?). 34 "TailRoom" (kept: community name).
CHECKED OK: no broken text (undefined/NaN/etc.), ratings and usage agree across pages for Kingambit/Sneasler/Charizard Y, matchup totals add up, every › link has a target.
