# The switch: checklist (Sat Nov 28, done together with Sim)
Written Tue Nov 24 from the live artifact's real file list and the build scripts (checked: Artifact file listing of
5VBfLTR5sM4JU5NswJYyGk; app/build.mjs; docs/rebuild/preview-kit/rebuild-preview.sh; docs/undo-plan.md).

## What "the switch" is
- The live artifact **NastyPlot** (5VBfLTR5sM4JU5NswJYyGk) gets the new site at the **same link**. Bookmarks keep working.
- **Saved teams stay**: they live in that artifact's own database (`data/users/{self}`), which a publish doesn't touch. The new site
  reads the same place (test: app/test/v2-saved.mjs).
- **The old site is kept**: its `index.html` is saved in the repo before anything changes, and the artifact keeps every old version.

## What the live artifact holds today (checked Nov 24)
- `index.html`: the old site (3.07 MB), 345 `sp/*.webp` sprites, 13 fonts. 359 files.
- Capabilities: db (6 rules: data, saved teams, usage, feedback), downloads, mcp (fire_trigger), sample, user.
- **Limit: one version holds at most 511 files; one publish sends at most 255.** The new site needs 354 `v2art/*.webp` + `v2.js`.
  359 + 355 = 714 > 511, so the old `sp/` sprites (345, not used by the new site: checked, no "sp/" in app/src/v2 or the v2 build)
  are removed in the same switch. New total ≈ 13 fonts + index.html + v2.js + 354 art = 369.

## Friday (the day before)
- [ ] Full check on the switch commit: every GitHub check green on claude/design6, PC chat full run (WebKit + qcheck-all).
- [ ] Main has the info-sheet counts + Gifts/news data (done Nov 24, 6db70843) AND the data refresh writes meta/info and meta/post
      (edit the refresh task: Sim's standing OK). Check the next morning's run wrote both.
- [ ] Merge plan for main: claude/design6 → main (the code), tested on main's data with main's checks; nothing pushed yet.
- [ ] Save the old live page: `Artifact read` index.html → docs/rebuild/history/live-old-index-nov27.html (commit). Our undo copy.
- [ ] Build the live candidate: `node app/build.mjs --v2 --art=v2art/ --one-art-size --split` (NO --preview-data: live reads its
      own database). Expect "guard: clean". Files: app/dist/v2.html → index.html, app/dist/v2.js, app/src/v2/art/*.webp → v2art/.
- [ ] Dry run: open that build against a COPY of today's data (Preview build with the same flags) at 390/820/1440, day/night.
- [ ] Sim: go / no-go.

## Saturday (with Sim)
1. [ ] Sim says yes. Note the time (now.sh) and the live artifact's current version id (the undo point).
2. [ ] Push main: the design6 merge (after main's checks pass on it). Wait for "Test NastyPlot page" + "Promote to live" green.
3. [ ] Publish batch 1 to the live link: index.html (new), v2.js, and `sp/*: null` (remove the 345 old sprites). Capabilities
       OMITTED so the db rules, downloads, mcp, user stay exactly as they are.
4. [ ] Publish batch 2: v2art/ files 1-250. Batch 3: v2art/ 251-354. (255 per publish.)
5. [ ] Check the file list: index.html, v2.js, 354 v2art, 13 fonts; capabilities unchanged (listing shows the same declaration).
6. [ ] Fire the data refresh by hand so the new site has every document (results, perf, teams, events, info, post...).
7. [ ] Checks on the live link, phone and desktop, day and night (Sim on iPhone/iPad/desktop app, HH with a script):
       - Home loads with today's data date; no "Getting today's numbers" stuck.
       - My Team shows Sim's saved team(s) exactly as before; Saved teams list intact.
       - Damage Calc, Speed Tiers, Meta/Usage, a Pokémon page, an info sheet (item/move/Ability/Nature) with counts, Gifts/news.
       - Search finds a Pokémon, a move, a page.
       - Feedback button works (writes feedback/{self}); owner page reads it.
8. [ ] Logged with times; Game Plan ticked; "What's new" note live.
9. [ ] Watch the rest of the day; 10 PM: HH's authority summary.

## Undo (if anything is wrong)
- **Page looks wrong / broken:** republish the saved old index.html + restore `sp/` (from app/sp/ in the repo) to the same link,
  `v2art/` and `v2.js` set to null. About 5 minutes. Saved teams are untouched either way.
- **Data wrong:** docs/undo-plan.md section 2 (revert the data commit, fire the refresh).
- **Main's merge broke the daily job:** revert the merge commit on main; live keeps the last good data meanwhile.
- Keep the old index.html for 2 weeks (Sim, Nov 24).

## Not checked yet (do before Friday)
- That the new build without --preview-data reads every META document from the live database exactly as the Preview reads
  preview.json (the code path is the same 03-persistence.js metaJoin; to prove with the dry run above).
- That v2 needs none of the old fonts (archivo, dela-gothic): harmless to keep either way.
