# Redesign concept: handoff from the "NastyPlot redesign concept" chat (Nov 10)

Sim retired that chat on Nov 10; everything now runs through the main NastyPlot chat. This file keeps what it decided and
made, so nothing depends on it. The plan for building it: docs/rebuild-plan.md and the Plans page section "Rebuild into
the new design".

## Where the files are

- **Reference images (in this repo):** docs/redesign/concepts/. These are the images stored in the chat's record, up to
  about 2000 px. 15 and 16 are before/after sheets whose "before" side came from an OLD copy of the site on Sim's PC
  (old pink sprites, a player handle, "A 99" grade); do not show them to anyone as today's site.
- **Concept sources and full-size images (only on Sim's PC, in a temp folder Windows may clear):**
  `C:\Users\simra\AppData\Local\Temp\claude\469e588db1a22171\bb823294-4095-4fd5-ba18-59326258ebc4\scratchpad`
  - page templates and render scripts (air*.tpl.html, air2.cjs ... air5.cjs, upcmp.cjs, compare.cjs)
  - out/ (full-size renders: homepage, iPhone, My Team, info sheet, before/after sheets, sharper-art test)
  - up/ (the 30 upscaled Pokémon), esrgan/x (the Real-ESRGAN portable tool)
  To keep: copy the whole folder into the repo under docs/redesign/source/ (or anywhere safe) soon.

## How the direction developed

1. Sim's brief (21:20): breathable, lightweight, the Pokémon, their colours and art do the heavy lifting; an ambience that
   captures NastyPlot's spirit; Apple-like lightness without copying Apple, and without generic "AI design" tropes.
   21:27: "I don't want it to just look barren ... not super minimalist." 21:57: "I just don't want our design to lean too
   much into minimalism ... I absolutely love the direction."
2. Version 1 and 2 ("Room to breathe"): light room, Pokémon standing on a floor with shadow and reflection, colour tinting
   the room, thin grotesque type, placeholder wordmark. Beautiful but anonymous (the chat's own verdict: "the current site
   has more character, the redesign has more quality").
3. "Flair" version (the chosen direction): the breathable layout plus NastyPlot's own voice in fixed places: the real
   logo, Unbounded slanted headlines with the blue second line, the tilted colour panel with rays behind the hero, slanted
   black plates and buttons, section colours as small slanted marks, a little mischief in the copy.
4. Fixes after review: the giant number used once only (the grade); pairs as two tilted panels leaning together with
   bars; team preview as two calm lines with a bracket; colour pools only on the hero and the grade; darker small text;
   looser headline spacing; no player names in mocks.
5. Tool pages: My Team desktop (top band with the six on tilted ray panels, Lead/Back/Bench tags, score lockup; three
   columns Selected / Threats / Fix it with blue numbered plates, verdict tags, type-tinted moves; full-width team sheet
   table), about 1,700 px tall vs about 4,270 for today's page. My Team iPhone: one scroll with a jump bar (Set, Threats,
   Fix it, Sheet). Pokémon info sheet desktop and iPhone (ray panel with the big rating, tabs Info / Meta / Rating, base
   stats, type matchups, Speed rows with "outspeeds X% of the top 30" bars, abilities).
6. Sharper art: no larger official source than the 512 px PokéAPI HOME renders. Upscaling tested on Sneasler with
   Real-ESRGAN (realesrgan-ncnn-vulkan, open source): model A "realesrgan-x4plus-anime" clearly best (crisp eyes, fang, gem,
   clean flat colour; a faint light fringe on some outer edges still to check on dark backgrounds); model B
   "realesrgan-x4plus" smeared, dropped. About 3 s per image on Sim's RTX 3080; 30 Pokémon done (2048 px, saved at 1024 for
   pages); the full 345 would take about a minute and a half there. Sharpens the pose; does not create new poses.
   Routes ruled out: ripping game models or lifting art from official or fan sites (terms and copyright risk).
7. Interactivity: the concepts change look and layout only; every tap, sheet, switch and slider keeps working.

## Review notes from the main chat (still open)

- Home hero is crowded (ray panel, rays, blurred ghosts, two floating extras, three notes, three big stats); trim a layer.
  In the sharp version the stat column's "%" runs to the right edge on desktop.
- Too many button and chip styles: one filled button, one secondary, links, one slanted chip (no rounded pills).
- Bench Pokémon look disabled (faded sprite on a pale panel); pale panels (Whimsicott, Kingambit) barely separate from
  the page.
- My Team: score text wraps badly ("22 handled · 8 / shaky"); the iPhone header is cramped; the iPhone action row looks cut.
- Info sheet: empty left column under the buttons on desktop; "Popular sets" wraps; chips multiply.
- The concepts used retired words and old numbers (A letter grade, "ready for the top 30", Threats, Handled / Well handled,
  Fix it). Sim, Nov 10: the data and words will come from the site; judge the design. The rebuild uses the word list.
- Rating bug found through the concepts and confirmed on today's build: the My Team set card prints the raw rating (89)
  while Ratings shows the displayed score (94) (74-arena.js and 70-riso2.js use Math.round(r) instead of RS()).
