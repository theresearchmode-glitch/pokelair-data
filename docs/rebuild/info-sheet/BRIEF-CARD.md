# Info sheet: "The Card" (Sim's change of direction, received Fri Nov 13, 10:08 PM Eastern; replaces BRIEF.md's Stadium / Side Stage)

Reference pictures (sent in chat, not in the repo): "Trading Card, refined": Garchomp (with forms) and Sneasler (no forms), each on
phone, iPad upright and desktop, dark and light.

---

INFO SHEET — CHANGE OF DIRECTION. Sim has replaced Stadium and Side Stage with "The Card".
Design brief, no code. Build it your way, by your rules.

Sim picked this from mock-ups made in a separate chat. The six attached pictures are the reference (Garchomp = a Pokémon with forms,
Sneasler = one without; each on phone, iPad upright and desktop, dark and light). The mock-ups were drawn over dist/v2.html with real
data but NOT by your rules (literal colours, off-scale sizes, off-grid spacing), so every number below is a target to translate into
your tokens and scale. Match the pictures first, the numbers second. Nothing goes to Preview or live without Sim's go.

0. REMOVE STADIUM AND SIDE STAGE
- Take out everything built for the earlier brief: the dark stage, crowd lights, spotlights, perspective floor, the hanging screen and
  its cables, the base-stat web on the screen, the floor glow, the type-colour strip, the 480-wide Side Stage column, and any tokens or
  styles that existed only for them.
- There is NO stat web and NO base stats at the top of the sheet any more. Base stats live only in the Info tab (keep the faint
  full-width track on those bars).
- Keep from the earlier brief: the three numbers side by side in even columns with thin dividers; "Speed" with "at level 50" under it;
  Build Around It and Popular Sets at equal widths; forms as one row of tiles with the slanted blue bar under the open form.

WHAT DOES NOT CHANGE
- Every piece of information and every control stays: rating, tier, rank line, name, types, the three numbers, Add / On your team,
  Build Around It, Popular Sets, forms and "Compare all N", all four tabs and everything in them. Same data, same wording.
- Fonts stay exactly as they are (Unbounded slanted for names and big numbers, Instrument Sans for the rest).

1. THE CARD (the same object on every screen)
The card holds ONLY the Pokémon, its name and its type chips. No rating, no numbers, no stats of any kind on it. It is there for looks.
- Shape: a rectangle with two cut corners (top-right and bottom-left, about 26 each). Not rounded. A thin edge (about 2) runs around it:
  type 1 colour, to white, to the Pokémon's own colour, to type 2 colour.
- Behind the Pokémon, back to front:
  a) the card face (see dark / light below), tinted with type 1 in the top-left corner and type 2 in the bottom-right corner;
  b) a soft round glow in the Pokémon's own colour, about 400 across, centred on it;
  c) its name as giant outlined letters, capitals, in the logo font, slanted, about 128 tall, outline only (no fill), very faint. Two
     rows: the first starts at the card's top-left, the second is lower, shifted left and fainter. Both are cropped by the card's edge.
     Use the plain name (no "Mega" prefix);
  d) two thin orbit lines (flat ovals, about 460 x 160 and 560 x 210, tilted about -16 and +12 degrees), the larger one in the
     Pokémon's colour;
  e) a very faint diagonal hairline texture, and one soft diagonal sheen band. The sheen sits BEHIND the Pokémon, never over it.
- The Pokémon stands centred on its usual glowing floor ring, in front of all of that.
- Bottom of the card: its name (about 28, centred) with the type chips centred under it, about 22 up from the bottom edge. The face
  fades slightly behind the name so it reads.
- Dark mode: near-black face, white name, the card glows softly in the Pokémon's colour.
- Light mode: a real light card (white to a pale lilac-grey face, ink name, faint ink outlines for the giant letters, soft drop shadow
  plus a faint glow in its colour). It is NOT the dark card placed on a white sheet.
- One-type Pokémon: both corner tints and both ends of the edge use the one colour.

2. PHONE
- Order: card, rating, three numbers, On your team / Add, the two buttons, forms, tabs.
- Card: full width inside the normal side gutters, about 360 tall, starting about 44 below the top of the sheet. The round close button
  sits in that 44 strip, top-right.
- Pokémon about 284 wide. Its head breaks out over the top edge of the card by about 13. This is deliberate and is the main "wow" of
  the phone layout.
- Under the card: the rating (big number, tier and rank line beside it), then the three numbers in even columns.
- For a Pokémon with no forms the tabs must show on the first screen without scrolling (they did in the mock-up at 390 x 844).

3. iPAD UPRIGHT (sheet about 756 wide)
- Top: two halves side by side, centred on each other. Left: the card, about 340 x 480. Pokémon about 285 wide, feet about 66 above its
  name. Right: rating, three numbers, On your team / Add, the two buttons, forms.
- Below: tabs, then the content in two balanced columns.

4. DESKTOP AND iPAD ON ITS SIDE (window 1000 wide or more)
- LEFT column about 440 wide: the card, then On your team / Add and the two buttons under it. Nothing else.
- The card is about 392 wide and takes all the height that is left, so it is a tall upright card (about 392 x 654 at 1440 x 900) and is
  the same size for every Pokémon. Minimum about 330 tall. Pokémon about 324 wide, feet about 76 above its name. On desktop the Pokémon
  stays inside the card (no break-out).
- RIGHT side, top to bottom:
  a) one row: the rating on the left, the three numbers beside it, a thin divider under. Leave room on the right for the close button.
  b) only if the Pokémon has forms: one slim row. "Forms" with "Compare all N" under it on the left, then the form tiles spread across
     (small sprite about 40, name and rating beside it, slanted blue bar under the open form). Thin divider under.
  c) the tabs.
  d) the tab's content in two balanced columns (sections flow to fill both, no half-empty rows).
- The left column stays in place while the right side scrolls. In short windows (under about 900 high) it must not be clipped: it
  scrolls with the page there.

5. KNOWN PROBLEMS IN THE MOCK-UP (please solve, do not copy)
- Phone: on a tall Pokémon (Sneasler) the close button covers the tip of the part that breaks out of the card.
- Phone: the Pokémon's feet almost touch the top of its name (about 2 clear).
- Phone: with forms, the tabs fall below the first screen.
- Phone: the slanted Popular Sets button pokes about 10 past the card's right edge.

6. NOT CHECKED — please check
- Long Mega names (Mega Garchomp Z) on the card's name line and in the desktop forms row.
- A one-type Pokémon, and a Pokémon with no tournament data.
- The smallest phone (320 wide) and a short laptop (1366 x 768).
- The "Add to My Team" state (the sample team was full).
- A Pokémon with more than three forms.
- Very wide or very tall Pokémon inside the card.
- Scrolling smoothness on desktop with the card's glow (Sim's rule: no filtered sprites on their own layers).
- Keyboard and screen-reader behaviour (the giant letters and decorations are decoration only; the real name is the heading on the card).

7. KNOWN CONFLICTS WITH YOUR RULES (resolve your way)
- The dark card face and the light card face need their own colours: new tokens.
- Off the type scale: giant letters at 128, rating at 56 on phone.
- Off the 4px grid: 22, 26, 44, the 2 edge, and the Pokémon offsets.
- The mock-up shortened "Speed at level 50" to "Speed" + "at level 50" and the forms label to "Forms". Keep today's wording if your
  same-info checks need it.

8. SIM'S STANDING RULES THAT APPLY
- Preview before live; real data only; never remove functionality; ask when unsure.
- Good use of space, even columns, symmetry; no boxes inside boxes; thin soft dividers.
- Works in light AND dark mode, on iPhone, iPad and Windows desktop.
- It must not look like a children's site or a sticker: restrained colour, the Pokémon's own colour and its two type colours only.
- Show Sim pictures of the built result next to these mock-ups before anything is published.
