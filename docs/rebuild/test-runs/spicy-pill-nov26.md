# Spicy pill inside its card (HH's Job P; WebKit check wkb-10), Thu Nov 26, 08:30 AM Eastern onward (`date`)
Branch alt/kl-batch2, from origin/alt/kl-batch 14325eb1.

## Cause (checked)
- `.k-tag` is slanted with `transform: skewX(-8deg)`. A skew moves the top edge right and the bottom edge left by half the height × tan 8°.
- One line of label (25px) puts each corner 1.8px past its box. Wrapped to two lines (46px), each corner is 3.2px out.
- Spicy's labels may wrap on phones (`.sg2-spl .k-tag{white-space:normal}`). So "Rare pick, plenty of games (1,598)" at 360-390 reached 3.2px past the card on both sides.

## Fix (one CSS rule, app/src/v2/css/sugs.css)
- `.sg2-spl .k-tag{white-space:normal; max-width:calc(100% - var(--s2)); margin-left:var(--s1)}`: 4px of room each side, which is more than the 3.2px a two-line slant needs.
- Otherwise the look is the same (picture spicypill-2).

## Check SP-7 (app/test/v2-minors.mjs, inside SP, groups; `ONLY=SP`)
- **The state:** the README team, Whole Roster, Spicy on. The first label is set to "Rare pick, plenty of games (1,598)".
- **It checks:** at 360, 375, 390 and 430, both slanted corners are inside the card (the bounding box of the transformed pill against the card's box).
- **alt/kl-batch 14325eb1 (frozen data):** "FAIL SP-7 … (360: {"lines":2,"left":-3.2,"right":-3.2} | 375: … -3.2 … | 390: … -3.2 … | 430: {"lines":1,"left":-1.8,"right":32})".
- **This branch:** "pass SP-7 … (360: 2 line(s), 0.8/0.8px inside | 375: … 0.8/0.8 … | 390: … 0.8/0.8 … | 430: 1 line(s), 2.2/28px inside)".
- **WebKit** (iPhone, isMobile, over http):
  - kl-batch: 375 and 390 at -3.2/-3.2.
  - This branch: 375 and 390 at +0.8/+0.8 (inside).

## Other checks
- `node app/test/v2-guard.mjs` → "v2 guard: clean (...)".
- `ONLY=SP` → "v2-minors:all passed" (SP-1..7).
- Full `node app/test/v2-minors.mjs` on the frozen out/ (0c992f69 checked out first, restored after) → "v2-minors:all passed" (319 pass, SP-7 included).

## Pictures: docs/rebuild/pics/nov26/spicypill-1 (before), spicypill-2 (after), 390 light, frozen data ("(1,163)")
