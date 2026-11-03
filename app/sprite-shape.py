# Sprite shapes for the team stage (Nov 3 redesign). Run after adding sprites to app/sp: python3 app/sprite-shape.py
# For every sp/<id>.webp it writes, into src/data/sprite-shape.js:
#   the box around the visible picture (left, top, right, bottom, in thousandths of the image), and
#   a 16 x 16 map of where the picture is inside that box (1 = some of the Pokemon is in that cell), as 16 rows of 4 hex digits.
# The stage uses these to size each Pokemon by what you actually see (not the empty space around it) and to place the
# four on the stage so no wing, arm or tail crosses another.
import os, json
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__))
N = 16
out = {}
for f in sorted(os.listdir(os.path.join(here, 'sp'))):
    if not f.endswith('.webp') or '_' in f: continue
    im = Image.open(os.path.join(here, 'sp', f)).convert('RGBA'); a = im.getchannel('A').point(lambda v: 255 if v > 60 else 0)
    bb = a.getbbox()
    if not bb: continue
    W, H = im.size; x0, y0, x1, y1 = bb
    c = a.crop(bb).resize((N, N), Image.BOX)
    rows = []
    for y in range(N):
        bits = 0
        for x in range(N):
            if c.getpixel((x, y)) > 20: bits |= 1 << (N - 1 - x)
        rows.append('%04x' % bits)
    out[f[:-5]] = [round(x0 * 1000 / W), round(y0 * 1000 / H), round(x1 * 1000 / W), round(y1 * 1000 / H), ''.join(rows)]
js = 'const SPRITE_SHAPE=' + json.dumps(out, separators=(',', ':')) + ';\n'
open(os.path.join(here, 'src', 'data', 'sprite-shape.js'), 'w').write(js)
print(len(out), 'sprites,', len(js) // 1024, 'KB')
