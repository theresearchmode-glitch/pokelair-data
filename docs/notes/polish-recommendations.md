# Open recommendations for NastyPlot (for the Batch 5 talk with Sim)

Sim, Nov 10: "with an open mind and no limits, what you think might be the best direction moving forward ... don't do anything,
we need to discuss your findings and plan changes." Notes only. Each item says what was seen (measured or looked at) and why it
matters; labelled **measured** or **my opinion**. Nothing here is built until we discuss it.

## Seen during the polish work
1. **One design system instead of layers (my opinion, from measured symptoms).** Most bugs found today come from old theme layers
   fighting each other: riso.css resets every element to upright, manga.css still carries rules, and fixes win by stacking ever
   longer `:root:not(#_#_#_#_#_#_)` selectors with `!important`. The half-slanted headlines, the 14.5px names and the 19px tabs
   were all side effects of that. A rebuild of the CSS around one token file (type scale, spacing, colours, slant) with no
   legacy layers would make polish hold by default instead of by patches. Medium-heavy, look-identical, testable with the
   polish check (it must come out with no new findings).
2. **The polish check in GitHub (measured: it found ~30 real problems the 16 checks never saw).** Today it runs by hand. Once
   Batches 1-4 are in, make it a test that fails on any NEW finding (a saved list of accepted ones), so polish can't slip again.
3. **Data storage for the public launch (measured).** The page's daily data lives in Claude artifact storage with a 256 KB limit
   per document; results grew 3 KB a day and broke it today. Splitting fixes it for now (two parts each, room for ~2 months),
   but the January public site needs a real data host (a static JSON CDN or a small database) that has no such ceiling and
   doesn't depend on Claude-only features.
4. **Fluid sizes vs the scale (decided today, worth confirming).** Big display headlines may scale with the screen (that's
   what makes the type fill the width: the WOW); everything else snaps to the scale. If Sim wants even headlines on fixed
   steps, it's a small change.
