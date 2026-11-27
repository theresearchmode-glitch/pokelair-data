# One-time design job for Gemini: the NastyPlot "Receipt" front page (Thu Nov 26)
Written by HH for Sim to paste into a separate Gemini session. This is a ONE-TIME exception: Gemini normally does no design work
for NastyPlot. Sim allowed it for this one job only ("lets see how kip would do too"). Paste everything below the line.

---

You are designing ONE page: the first screen of nastyplot.org, the public front page of NastyPlot, a Pokémon Champions (VGC doubles)
team-rating site for players, many of them kids and teens. This is a design competition: another designer is doing the same brief.
The owner, Sim, will pick. Make it the most exciting thing you can, but inside the rules below.

## What Sim said (his words, the most important part)
- "i like the receipt but it needs more color."
- "they have no flair at all no character nothing going like crazy."
- "our website is mainly colored by pokemon so in places like this where theres barely any it looks too plain."
So: keep the idea of a RECEIPT (a till receipt that "rings up" a team), and flood it with Pokémon colour and character.
Plain cream paper with small sprites was rejected. A boring centred hero with a gradient was rejected. Go big.

## The idea to express
NastyPlot gives every team a Strength Score out of 100. The front page shows the latest winning team "rung up" like a receipt:
the six Pokémon, each with its Rating, then the total Strength Score, with a "Reg M-D · Dec 2" stamp (a new season starts Dec 2).
The visitor should think: "I want MY team's receipt" and press Score My Team.

## Real data to use (exactly these; do not invent other numbers)
Winning team · Alpensee Tour (Reg M-C) #85 · Nov 25 · 128 players. Strength Score 87/100, band "Tournament ready".
| Pokémon | Types | Item | Rating | Art file |
|---|---|---|---|---|
| Mega Charizard Y | Fire / Flying | (Mega Stone) | 94 | 10035.webp |
| Mega Aerodactyl | Rock / Flying | (Mega Stone) | 66 | 10042.webp |
| Garchomp | Dragon / Ground | Life Orb | 92 | 445.webp |
| Farigiraf | Normal / Psychic | Sitrus Berry | 89 | 981.webp |
| Sylveon | Fairy | Fairy Feather | 85 | 700.webp |
| Kingambit | Dark / Steel | Focus Sash | 97 | 983.webp |
Strength Score bands (always these words): 90+ Top tier, 80s Tournament ready, 70s Solid, 60s Needs work, under 60 Missing a basic.
Other true facts you may use: ratings come from 17,606 real tournament teams; Reg M-C ends Dec 2 at 1:59 AM ET, the same day as a
balance patch; Reg M-D starts Dec 2.

## Assets (in the GitHub repo theresearchmode-glitch/pokelair-data, branch claude/design6)
- Pokémon art, transparent background: app/src/v2/art/<number>.webp (about 300px), and bigger 1024px versions at
  docs/rebuild/art/up1024/<number>.webp. Use these files; never draw or AI-generate a Pokémon.
- Logo: docs/brand/nastyplot-brand-assets/1-logo/devil-and-wordmark/svg/nastyplot-logo.svg (never redraw, recolour or stretch it).
- Fonts (use these two only): docs/brand/nastyplot-brand-assets/5-fonts/unbounded-latin.woff2 (headlines and big numbers, always
  slanted: font-style italic with font-synthesis: style, weight 800) and instrument-sans-latin.woff2 (body text).

## Brand rules (must follow)
1. Colours: Plot blue #0078BF, Nasty pink #E8364F, Ink #17161A, Day paper #F7F5F0 / #FBFAF7, Night #14131C, white #FFFFFF.
   Pokémon type colours (use them for the colour flood; each Pokémon's main type drives its colour):
   Normal #aba88a, Fire #f06428, Water #3d82f2, Electric #f7c815, Grass #46b62e, Ice #5ed6d0, Fighting #d0352b, Poison #a83fc2,
   Ground #e2b14a, Flying #8b8af2, Psychic #f24f80, Bug #9eb81b, Rock #c6a53a, Ghost #7452b3, Dragon #6a3cee, Dark #5f4536,
   Steel #9db0cc, Fairy #f28cc0. A type colour that MEANS a type must have the type's name next to it somewhere (a label or legend).
2. Shapes: slanted, boxy (parallelograms, skewed bands, cut corners), never rounded pills or soft blobs. Corners only 4/6/10/18px.
   Plot bars (slanted bars) are our signature for numbers. Receipts are our signature for results.
3. Type sizes only: 13, 15, 16, 17, 20, 22, 24, 26, 28, 34 px, plus big display numbers. Spacing on a 4px grid. Line height 1.5 for body.
4. NO generic AI design: no purple-blue gradient hero, no glassmorphism, no floating blurry blobs, no emoji, no stock "SaaS" layout.
   Ask: "could this be any other website?" If yes, push further.
5. Must contain, on the FIRST screen at 1440x900 AND at 390x844 (iPhone): exactly one h1 with real search words (for example
   "Rate your Pokémon Champions team" plus a Reg M-D angle), the button "Score My Team" (pink, slanted, the main action), and a smaller
   "Build Me a Team" button. The receipt must also be visible at 390, at least the top of it.
6. Light mode (day paper background) AND dark mode (night background) must both look great (use prefers-color-scheme).
7. No horizontal scrolling at any width from 320px to 2560px. Nothing important cut off. Text never on top of a Pokémon's face.
8. Motion is welcome (the receipt printing, the stamp slamming on, Pokémon popping in) but it plays once, finishes within 3 seconds,
   and with prefers-reduced-motion it shows the finished state with no motion. No layout jumping while it plays.
9. Kids use the site: nothing scary, no fake urgency, no sign-up asks. Pokémon names exactly as written above.
10. Accessibility: text contrast at least 4.5:1 (big numbers 3:1), buttons at least 44px tall, images have alt text.

## What to deliver
- ONE self-contained file: docs/rebuild/gemini-receipt/index.html (HTML + CSS + a little JS inline; it may load the art, logo and
  fonts by relative path from the repo, e.g. ../../../app/src/v2/art/445.webp). No frameworks, no external CDNs, no AI images.
- Up to 3 variations in that one file are fine (switch with ?v=1, ?v=2, ?v=3), each one a strong single idea.
- Screenshots of each variation at 1440x900 and 390x844, light and dark, in docs/rebuild/gemini-receipt/shots/.
- A short note (docs/rebuild/gemini-receipt/NOTES.md): the idea of each variation in 2-3 sentences, which one you recommend and why,
  and anything you could not do.
- Push to your own branch alt/gemini-receipt-design only. Never push to main or claude/design6. Do not change any other file.
