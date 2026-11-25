# Home hero crowd sprite sheets (Sim, Nov 18, Q7a B): every Pokémon picture at 128px (its longer side), packed into 4 webp sheets.
#   python3 -I experiments/v2-crowd-sheets.py   (run from the repo root, after experiments/v2-art.py)
#   -> app/src/v2/art/crowd-0.webp .. crowd-3.webp  and  app/src/v2/art/crowd.json
#      {"s": [[w, h] per sheet], "m": {id: [sheet, x, y, w, h]}}  (build.mjs puts it in the page as ART_CROWD)
# The hero draws the 35 nearest (highest rated) crowd members from their own 384px files and the rest from these sheets: 4 requests in
# place of about 300 (research: docs/rebuild/research/first-visit-nov18.md, change 4a / 4b). 2px of empty space around every tile, so a
# neighbour never shows at a tile's edge after scaling. Swapping the art means rerunning v2-art.py, then this script.
import os, io, json
from PIL import Image
DST, H, W, N, PAD = 'app/src/v2/art', 128, 2048, 4, 2
ids = sorted(f[:-5] for f in os.listdir(DST) if f.endswith('.webp') and f[:-5].isdigit())
tiles = []
for i in ids:
    im = Image.open(os.path.join(DST, i + '.webp')).convert('RGBA'); k = H / max(im.size)
    tiles.append((i, im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)))
per = -(-len(tiles) // N); meta = {}; sizes = []; total = 0
for s in range(N):
    part = tiles[s * per:(s + 1) * per]; x = y = 0
    for i, t in part:
        if x + t.width + 2 * PAD > W: x = 0; y += H + 2 * PAD
        meta[i] = [s, x + PAD, y + PAD, t.width, t.height]; x += t.width + 2 * PAD
    sh = Image.new('RGBA', (W, y + H + 2 * PAD), (0, 0, 0, 0))
    for i, t in part: m = meta[i]; sh.paste(t, (m[1], m[2] + H - t.height))  # feet on the row's line, as the 384px files stand
    for i, t in part: meta[i][2] += H - t.height
    b = io.BytesIO(); sh.save(b, 'WEBP', quality=80, method=6); d = b.getvalue(); total += len(d)
    open(os.path.join(DST, f'crowd-{s}.webp'), 'wb').write(d); sizes.append([sh.width, sh.height])
json.dump({'s': sizes, 'm': meta}, open(os.path.join(DST, 'crowd.json'), 'w'), separators=(',', ':'))
print(f'{len(meta)} pictures in {N} sheets, {total // 1024} KB')
