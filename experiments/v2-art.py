# NastyPlot v2 art (R3, Nov 11): one place for every Pokémon picture.
#   python3 experiments/v2-art.py            -> app/src/v2/art/<id>.webp (384px web copies of docs/rebuild/art/up1024)
#                                               + app/src/v2/art/meta.json {id: [r,g,b normalised colour, feet margin]}
# The colour is the art's dominant hue, normalised (hue kept, saturation >= 72%, lightness 56%: design-system.md 2b).
# The feet margin is the share of empty rows under the feet, so every row of Pokémon stands on one line.
# Swapping the art means replacing up1024 (or this folder) and rerunning this script; nothing else names a picture.
import os, sys, json, colorsys
from PIL import Image
SRC, DST = 'docs/rebuild/art/up1024', 'app/src/v2/art'
os.makedirs(DST, exist_ok=True)
def dominant(im):
    s = im.convert('RGBA').resize((64, 64)); B = [[0, 0, 0, 0] for _ in range(18)]
    for r, g, b, a in s.getdata():
        if a < 200: continue
        h, l, sat = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if sat < .28 or l < .2 or l > .86: continue
        k = int(h * 360 // 20) % 18; w = sat * sat; B[k][0] += r * w; B[k][1] += g * w; B[k][2] += b * w; B[k][3] += w
    best = max(B, key=lambda x: x[3])
    return [best[i] / best[3] for i in range(3)] if best[3] else [150, 150, 165]
def norm(c):
    h, l, s = colorsys.rgb_to_hls(*(v / 255 for v in c)); r, g, b = colorsys.hls_to_rgb(h, .56, max(s, .72))
    return [round(r * 255), round(g * 255), round(b * 255)]
def foot(im):
    a = im.convert('RGBA').split()[3].point(lambda v: 255 if v > 40 else 0); bb = a.getbbox(); w, h = im.size; s = max(w, h)
    return round((h - bb[3]) / s, 3) if bb else 0
meta = {}
for f in sorted(os.listdir(SRC)):
    i = f.rsplit('.', 1)[0]; im = Image.open(os.path.join(SRC, f))
    out = os.path.join(DST, f)
    if '--meta-only' not in sys.argv or not os.path.exists(out):
        t = im.copy(); t.thumbnail((384, 384), Image.LANCZOS); t.save(out, 'WEBP', quality=84, method=4)
    meta[i] = [*norm(dominant(im)), foot(im)]
json.dump(meta, open(os.path.join(DST, 'meta.json'), 'w'), separators=(',', ':'))
print(len(meta), 'pictures; meta.json written')
