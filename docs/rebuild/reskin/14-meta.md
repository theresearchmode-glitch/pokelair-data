# Reskin: Meta · Ratings "The line-up" (brief; Sim's usability ask, Nov 21, 1:44 PM)

Sim: "I want the meta section with the pokemon ratings to be easy to use and look through. People should be able to see what's
S tier, what's A tier, B tier and so on easily and look through everything. Megas and no Megas. Let's make sure of the usability."

Requirements (usability first, then the look of ratings2.html):
1. Every tier visible in order S, A, B, C, D, F, each with its label (90+, 80+ ...), its meaning and its count.
2. A tier bar under the header: S · A · B · C · D · F with counts; tap = jump to that tier (anchor, focus moves to it); sticky on scroll if it fits.
3. Browse everything (all 345): each tier shows its top cards as kit roster cards (6 desktop, 3x2 phone), the rest of the tier as
   dense rows (picture 40px, name with form line, score, tier, one fact); never hidden behind a fold. "Show N more ›" adds rows below.
4. Filters as one sentence (<= 6 words): "Show me [everyone] [Megas] [no Megas]" + one "[every event ▾]"-style word for the other
   filters today has (inventory section 14). Search box kept. Hidden Gems / In my box / Types kept (inventory).
5. The kingpin hero kept (Ratings #1), phone layout per HYBRID 6 (card on top, facts row, pink move one line).
6. Usability test (new): a script that, at 390 and 1440, (a) finds a named Pokémon by search, (b) jumps to B tier from the bar,
   (c) switches to Megas and checks only Megas show, (d) counts every tier's Pokémon = total rated. Plus v2-overlap and kit-page rules.
7. Phone no longer than today (meta 2,893 px at 390, inventory).
