# Sim's after-4 PM check, Mon Nov 16 (verification plan items 4, 5, 6)

About 25-35 minutes in total. Open the Preview: https://claude.ai/artifact/8KBkk7PtbGjVzLzLKK5akf
Anything that looks or feels wrong: a screenshot plus one line ("iPad, Meta, the chips overlap") is perfect.

## 4. Devices checklist (about 15 minutes)

Do each row on the device named. Tick, or note what you saw.

| # | Device | Where | What to do | Looks right when |
|---|--------|-------|------------|------------------|
| 1 | iPhone | Home | Scroll top to bottom, light then dark | Logo is the small imp; nothing cut off; footer notice reads cleanly |
| 2 | iPhone | My Team | Import a team, open Suggestions, tap a Pokémon | Its page opens; Back returns to the same spot |
| 3 | iPhone | Battle > Damage Calc | Pick an attacker with a long move (Flamethrower) | The four moves sit 2 by 2, every name fully visible |
| 4 | iPhone | Battle | Enter an opponent's six | VS badge does not cover anything |
| 5 | iPhone | Type Chart | Read the headline | No word left alone on its own line |
| 6 | iPad (both ways round) | Meta | Switch page tabs, open a tier | Selected tab clear in dark (blue); nothing overlaps |
| 7 | iPad | Test Run | Load an opponent, look at the open card | "Top of the pile" label shows in full |
| 8 | Windows app, mouse | Home, My Team, Meta | Scroll with the wheel | Smooth; feature sprites still glow, others don't |
| 9 | Windows app | Any page | Drag the window narrower and wider slowly | Nothing jumps, overlaps or spills at any size |
| 10 | Windows app | Any page | Press Tab a few times | A clear ring shows on each control, including slanted buttons |
| 11 | Any | Share (My Team) | Make a Team Card, light and dark | New logo, crisp, nothing cut |

## 5. VoiceOver script, iPhone (about 10 minutes)

Turn on: Settings > Accessibility > VoiceOver (or triple-click the side button if set up).
Swipe right = next item, double-tap = press, two-finger swipe up = read everything.

1. Open the Preview. Listen for the page title: it should say the page name, then "NastyPlot".
2. Swipe through the top bar: each link is read by name; the current page says "current page".
3. My Team: swipe to the jump links; the one you're on is read as "current location".
4. On a Pokémon's page, the Show button for a section says "Show <section name>", then "Hide <section name>" after pressing.
5. Damage Calc: KO tiles start with "KO:"; the attacker picker reads its label.
6. Saved Teams: the copy button says "Copy for Showdown: <team name>".
7. Track chart: VoiceOver reaches a table of the numbers (hidden on screen).
8. Note anything read twice, read as gibberish, or skipped.

## 6. Prompt for the local PC chat (paste as is)

> Pull branch `claude/design6` of theresearchmode-glitch/pokelair-data. Build the Preview: `cd app && node build.mjs --v2 --art=v2art/ --preview-data`,
> then serve `app/dist` (copy `dist/v2.html` next to the `v2art/` folder) on a local server.
> Goal: scrolling smoothness and Windows display scaling on the NEW site (Home, My Team with a team loaded, Meta, Battle, Pokémon page).
> 1. Read `experiments/scroll-perf.mjs` first and say what it measures. If it does not measure the new build, make a copy
>    `experiments/scroll-perf-v2.mjs` pointed at the new build; keep its method (mouse-wheel steps, frame times).
> 2. Run it headed at 1440x900 at 100% scaling, then again with Chromium `--force-device-scale-factor=1.25` and `1.5`,
>    light and dark. Report per page: average frames per second, % frames slower than 20 ms, slowest frame.
> 3. At 1.25 and 1.5, also run `node experiments/polish-check.mjs` on the same build if it supports it, and list findings.
> Save results to `docs/rebuild/test-runs/scroll-scale-nov16.md` and commit to `claude/design6`.
> Fix only setup, never the site's code or the tests.
