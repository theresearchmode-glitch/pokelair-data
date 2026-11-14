# Info sheet redesign: Sim's picks (received Fri Nov 13, 7:01 PM Eastern, from the other chat)

Sim (with it): "I want us to follow OUR RULES AND DATA and I know the mock ups will have mistakes but they are rough
mock ups and we will fix those and put our rules and stuff into them."
Earlier (6:45 PM): picked "Stadium, refined" for phone; "we can refine it as we need to".

Reference pictures (sent in chat, not in the repo): stadium-edge (phone hard cases: Mega Garchomp Z, Rillaboom,
Watchog, Sneasler at 320), Side Stage desktop dark/light, short laptop 1366x768 + iPad on its side, iPad upright
dark/light/scrolled.

---

INFO SHEET REDESIGN — Sim's picks (phone, iPad, desktop). Design brief, no code.

Sim chose these from mock-ups made in a separate chat. The five attached pictures are the reference. The mock-ups were
drawn over dist/v2.html with real data but were NOT built by your rules (they use literal colours, off-scale sizes and
off-grid spacing), so treat every number below as a target to translate into your tokens and scale, not as code to copy.
Build it your way, by your rules. Nothing goes to Preview or live without Sim's go.

WHAT DOES NOT CHANGE
- Every piece of information and every control on today's sheet stays: rating, tier, rank line, name, types, the three
  numbers, Add / On your team, Build Around It, Popular Sets, forms, all four tabs and everything in them. Same data
  functions, same wording.
- Fonts stay as they are (Unbounded slanted for names and big numbers, Instrument Sans for the rest).
- Only the top of the sheet and the desktop/iPad arrangement change.

1. THE STADIUM STAGE (all screen sizes)
A dark tournament stage replaces today's sprite-on-a-ring header.
- Backdrop: near-black, with soft blurred crowd lights across the top (white, the Pokémon's own colour, and its two type
  colours) and two faint spotlights from above.
- Floor: a darker stage floor across the bottom with faint lines running back in perspective.
- The Pokémon stands on the LEFT of the stage on its usual glowing floor ring.
- A big screen hangs on the RIGHT from two thin cables, tilted slightly toward the Pokémon, with a glowing frame in the
  Pokémon's colour. It is captioned "Base stats" and shows the six base stats as a web (hexagon, three rings, six spokes,
  filled shape with a point on each corner). Order clockwise from the top: HP, Attack, Defense, Speed, Sp. Def, Sp. Atk.
  Each corner has its number and name.
- The Pokémon's highest stat is larger and lit white, with a bright point on the web. (No extra colour: blue clashed on
  red and gold screens.)
- Web scale: a stat of 160 reaches the outer ring.
- The screen's light spills onto the floor below it in the Pokémon's colour.
- A thin strip in the two type colours runs along the bottom edge of the stage and is the join between the stage and
  the sheet.
- The stage looks the SAME in light and dark mode (it is a lit place). Only the sheet around it changes with the theme.
- The Pokémon must never cover the screen's numbers.

2. UNDER THE STAGE (the headline block)
- Name and type chips on the left; rating, tier and rank line on the right, right-aligned.
- The three numbers side by side in even columns with thin dividers (today they stack). Speed reads as a number with
  "Speed" and "at level 50" under it.
- "On your team" / Add, then Build Around It and Popular Sets at equal widths.
- Forms as ONE row of tiles (sprite, name, rating and tier), with a slanted blue bar under the open form.
  "Compare all N" stays.
- Base Stats bars in the Info tab get a faint full-width track.

3. PHONE (Sim's pick: "Stadium, refined")
- Stage full width at the top, about 330 tall. Pokémon about 164 wide; screen about 228 x 232.
- Then the headline block, then the tabs and content as today.
- Smallest phones (320 wide): the Pokémon and screen scale down together (about 80%).
- Close button: a round button on the stage's top-right corner.

4. DESKTOP (Sim's pick: "Side Stage")
- Two halves. LEFT column about 480 wide: the stage on top, then the headline block (name, rating, three numbers,
  buttons, forms). RIGHT: the tabs at the very top, then the tab's content in two balanced columns (sections flow to
  fill both columns, no half-empty rows).
- The left column stays in place while the right side scrolls.
- The left column always fills the sheet's height: the stage grows to take spare room, so there is no empty strip under
  the buttons (e.g. a Pokémon with no forms gets a taller stage). With forms, the stage shrinks to about 292 tall so
  everything fits at 900 high.
- Short windows (under about 900 high): the left column must NOT be clipped. It scrolls with the page there.
- Pokémon about 224 wide on desktop (Sim rejected a 400-wide column because the Pokémon looked squished).

5. iPAD
- On its side: same as desktop.
- Upright (sheet about 756 wide): the phone idea, wider. Stage full width on top (about 350 tall), Pokémon and screen
  centred as a pair. Under it the headline block in two even halves: name, rating and three numbers on the left; buttons
  and forms on the right. Content below in two columns.

6. HARD CASES ALREADY CHECKED IN THE MOCK-UP (see stadium-edge.png)
- Long Mega name (Mega Garchomp Z): name takes two lines, nothing collides.
- One type (Rillaboom): one chip; the stage strip becomes one colour.
- No tournament data (Watchog): the web still shows; rating and numbers behave as today.
- 320-wide phone: no label cut off, no sideways scroll.
- "Your team is full" line fits above the buttons.

7. NOT CHECKED — please check
- The "Add to My Team" button state (the sample team was full).
- A stat above 160 (clamps to the outer ring).
- A Pokémon with more than three forms in the one-row forms strip.
- Keyboard and screen-reader behaviour of the stage (the web repeats the Base Stats section, so decide how it is
  announced).
- Desktop scrolling smoothness with the blurred crowd lights (Sim's rule: no filtered sprites on their own layers).
- Short laptop (1366 x 768) with forms: the left column is taller than the sheet, so the forms row needs a short scroll.

8. KNOWN CONFLICTS WITH YOUR RULES (for you to resolve your way)
- The stage needs its own dark colours that do not change with the theme: new tokens.
- Mock-up sizes off the type scale: rating at 56 on phone and 48 on the smallest phone.
- Some mock-up offsets are off the 4px grid (30, 34, 42).
- The mock-up shortened "Speed at level 50" to "Speed" + "at level 50", and the forms label to "Forms". Keep today's
  wording if your same-info checks need it.

9. SIM'S STANDING RULES THAT APPLY
- Preview before live; real data only; never remove functionality; ask when unsure.
- Good use of space, even columns, symmetry; no boxes inside boxes; thin soft dividers.
- Works in light AND dark mode, on iPhone, iPad and Windows desktop.
- Show Sim pictures of the built result next to these mock-ups before anything is published.
