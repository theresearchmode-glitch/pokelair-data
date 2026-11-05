# Clean inked sprites: same look (navy outline + pink misprint edge) but crisp.
# 512px in -> 512px out (was 256), no posterize blend, anti-aliased outline built at 2x, high-quality webp.
# usage: python3 -I ink2.py <src_dir> <out_dir> [quality]
import os, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image, ImageFilter, ImageEnhance, ImageChops
SRC, OUT = sys.argv[1], sys.argv[2]
Q = int(sys.argv[3]) if len(sys.argv) > 3 else 92
NAVY = (29, 33, 64); PINK = (255, 72, 176)
C = 512; FIT = 444; K = 2  # work at 2x for smooth edges

def ramp(lo, hi):
    return lambda v: 0 if v <= lo else 255 if v >= hi else int((v - lo) * 255 / (hi - lo))

def bake(f):
    im = Image.open(os.path.join(SRC, f)).convert('RGBA'); bb = im.getbbox()
    if not bb: im.save(os.path.join(OUT, f), 'WEBP', lossless=True); return
    im = im.crop(bb)
    s = FIT / max(im.size)
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    r, g, b, al = im.split()
    rgb = ImageEnhance.Color(Image.merge('RGB', (r, g, b))).enhance(1.08)
    im = Image.merge('RGBA', (*rgb.split(), al))
    ox = (C - im.width) // 2 - 6; oy = (C - im.height) // 2 - 6
    # outline mask at 2x: blur the alpha and ramp it, so the edge is smooth, not stair-stepped
    CK = C * K
    a = Image.new('L', (CK, CK), 0)
    a.paste(al.resize((im.width * K, im.height * K), Image.LANCZOS), (ox * K, oy * K))
    line = a.filter(ImageFilter.GaussianBlur(6 * K)).point(ramp(5, 28))
    mis = ImageChops.offset(line, 10 * K, 10 * K)
    line = line.resize((C, C), Image.LANCZOS); mis = mis.resize((C, C), Image.LANCZOS)
    o = Image.new('RGBA', (C, C), (0, 0, 0, 0))
    P = Image.new('RGBA', (C, C), PINK + (255,)); P.putalpha(mis)
    N = Image.new('RGBA', (C, C), NAVY + (255,)); N.putalpha(line)
    o = Image.alpha_composite(Image.alpha_composite(o, P), N)
    spr = Image.new('RGBA', (C, C), (0, 0, 0, 0)); spr.paste(im, (ox, oy))
    Image.alpha_composite(o, spr).save(os.path.join(OUT, f), 'WEBP', quality=Q, method=6, alpha_quality=100)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    fs = sorted(x for x in os.listdir(SRC) if x.endswith('.webp'))
    if os.environ.get('ONLY'): fs = [x for x in fs if x in os.environ['ONLY'].split(',')]
    with ProcessPoolExecutor(8) as ex: list(ex.map(bake, fs))
    print(len(fs), 'sprites')
