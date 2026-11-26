# PC job: Reg M-D pictures + Meowstic-F (HH, Wed Nov 25, 6:10 AM ET)
Paste the block below into the PC chat (Sim's PC Claude Code, the GPU one). About 10-15 minutes.

---
NastyPlot PC job (from HH, Nov 25): make the site pictures for 10 Pokémon with the GPU upscale. Reg M-D is official
(news.pokemon-home.com/en/page/878.html): Heatran, Dondozo, Tatsugiri arrive, plus Mega Heatran and Mega Tatsugiri. Meowstic-F
also has no picture yet.

1. git fetch origin && git checkout claude/design6 && git pull   (the script is experiments/add-sprites.mjs; read its header first)
2. Dry run, to download each HOME render and print the exact upscale commands:
   node experiments/add-sprites.mjs 10025:Meowstic-F 485:Heatran 10311:Heatran-Mega 977:Dondozo 978:Tatsugiri 10258:Tatsugiri-Droopy 10259:Tatsugiri-Stretchy 10322:Tatsugiri-Curly-Mega 10323:Tatsugiri-Droopy-Mega 10324:Tatsugiri-Stretchy-Mega
3. For each id, run the printed Real-ESRGAN command (realesrgan-x4plus-anime, -s 4, -g 0) and copy <id>-x4.png to
   experiments/out/sprites/x4/<id>.png
4. Run the same command again with --write --crowd. Check each new art/<id>.webp by eye next to an existing one (same edge
   quality, no halo); say which ones you looked at.
5. node app/build.mjs --v2 --preview-data   (expect "guard: clean")
6. Commit ONLY the new picture files + 15-visual-helpers.js SPRITE_ID lines + meta/crowd sheet changes, message ending with a
   blank line and "Claude-Session: https://claude.ai/code/session_01YGeTVTPLowhKWrgD2jqHEG", and push to a NEW branch
   alt/pc-md-sprites (never main, never claude/design6). Report: the branch sha, the list of files, and anything that looked off.
---
