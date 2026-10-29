# Group Chat promo

A 66–70-second vertical (1080×1920) promo styled as a group text: a player's team is "mid", friends point them to NastyPlot, and each reply lifts a real NastyPlot screen into a full-screen feature card. Six features: Team grade, Fix it, Damage calc, Battle mode, Ratings, Build me a team. Ends on the 4-0 moment, the Home page in a phone and the end card.

- `why-u-hate-me.html`: the main version (the one Sim picked), timed to *why_u_hate_me*. Bars are 3.0 s from 0:00; kicks on sixteenths 0, 3 and 10; drops at 0:24 (Damage calc lands here) and 0:51 (the 4-0).
- `coil-trap.html`: the *RuneScape 07 – Coil Trap* remix version (picked over the rap tracks so the music suits more people), 81 s. 75 BPM, 3.2 s bars from 0.15 s (kick on sixteenths 0 and 7, snare on 4 and 12). Bars 0–8 and 13–16 have no drums, so there every message, panel and title word lands on a measured melody note (`MEL`, triplets slightly behind the drum grid); the drum bars stay on the drums. Damage calc lands on the drop (bar 9, 0:28.95), the chat builds up through bar 16 into the 4-0 on bar 17 (0:54.55), then the reveal, a one-tool-per-hit recap, FREE. / NO ADS., and the end card, ending where the song drops back to quiet (1:20).
- `fido.html`: the same edit on *Fido* (115 BPM, 2.087 s bars from 0.461 s, drums in at 0:17.16, loud section at 0:50.55).

Everything in a composition is placed on the song's bar grid (`at(bar, sixteenth)` near the top of the script), so retiming means changing the grid constants and the bar numbers in `FEAT` and `M`.

## Music

The songs are **not** in the repo (they aren't ours to publish). Keep the mp3s locally and pass them to ffmpeg below. The videos assume the song starts at 0:00.

## Remaking it

```bash
node app/build.mjs                                   # build the page
node promo/group-chat/capture.mjs <shots> report,matchup,ratings,auto,home,calc
python3 promo/group-chat/crop.py <shots> promo/group-chat/a
node promo/group-chat/stills.mjs $PWD/promo/group-chat/why-u-hate-me.html <dir> 10 24.1 51.2   # spot-check frames
for w in 0 1 2 3; do node promo/group-chat/render.mjs $PWD/promo/group-chat/why-u-hate-me.html <frames> $w 4 & done; wait
python3 promo/group-chat/sfx.py <frames>/../cues.json 66 sfx.wav
ffmpeg -i why_u_hate_me.mp3 -i sfx.wav -filter_complex "[0:a]atrim=0:66,afade=t=out:st=64:d=2[m];[1:a]atrim=0:66,volume=0.4[s];[m][s]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]" -map "[a]" -ar 48000 -ac 2 mix.wav
ffmpeg -framerate 30 -i <frames>/%05d.jpg -i mix.wav -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart group-chat.mp4
```

The `capture.mjs` setup renames the sample team to "Sun Tailwind" so "(sample)" doesn't show on screen. Re-capture when the site's design or numbers change.
