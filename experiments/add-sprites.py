# Helper for experiments/add-sprites.mjs (Reg M-D plan, Phase 0.3, Nov 24). Run with python3 -I from the repo root.
#   edge <x4.png> <out.webp>   the upscale's finish, as approved in docs/rebuild/gpu-jobs.md ("Edge check review", Nov 10): trim, fit
#                              1024px on the long side, edge colour bled in from the body, alpha eroded 1px and re-feathered 0.6px,
#                              but keep the un-eroded alpha (bleed only) when erosion loses more than 3% of the opaque area; WebP q90.
#                              Written from that recipe: the PC script that made docs/rebuild/art/up1024 isn't in the repo, so this
#                              is NOT proven byte-equal to it (compare by eye on the first new Pokémon).
#   small <id>                 app/src/v2/art-s/<id>.webp from app/src/v2/art/<id>.webp: fit 240px, WebP q88 method 6 (checked: rebuilds
#                              20 of 20 random existing art-s files byte for byte, Nov 24).
import sys, os
from PIL import Image, ImageFilter

def edge(src, dst):
    import numpy as np
    im = Image.open(src).convert('RGBA'); bb = im.getbbox(); im = im.crop(bb) if bb else im
    s = 1024 / max(im.size); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    A = np.asarray(im).astype(np.float64); rgb, a = A[..., :3], A[..., 3] / 255
    # bleed: where the art isn't fully opaque, its colour becomes the alpha-weighted average of the body around it (normalised
    # convolution at 3 growing radii), so a soft edge carries the body's colour, not the fringe the upscaler leaves at low alpha
    blur = lambda x, r: np.asarray(Image.fromarray(np.clip(x, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float64)
    fill = rgb.copy()
    for r in (8, 4, 2):
        den = blur(a * 255, r) / 255
        num = np.stack([blur(rgb[..., c] * a, r) for c in range(3)], -1)
        est = num / np.maximum(den, 1e-3)[..., None]
        fill = np.where((den > 0.01)[..., None], est, fill)
    out_rgb = np.where((a >= 0.98)[..., None], rgb, fill)
    al = Image.fromarray(A[..., 3].astype(np.uint8))
    er = al.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    before, after = int((A[..., 3] > 128).sum()), int((np.asarray(er) > 128).sum()); lost = (before - after) / max(before, 1)
    keep = lost > 0.03
    out = Image.fromarray(np.dstack([np.clip(out_rgb, 0, 255), np.asarray(al if keep else er)]).astype(np.uint8), 'RGBA')
    out.save(dst, 'WEBP', quality=90)
    print(f'edge: {dst} {out.size} opaque area {before} -> {after} ({100 * lost:.1f}% lost): {"bleed only (kept the alpha)" if keep else "eroded + re-feathered"}')

def small(i):
    src, dst = f'app/src/v2/art/{i}.webp', f'app/src/v2/art-s/{i}.webp'
    t = Image.open(src).copy(); t.thumbnail((240, 240), Image.LANCZOS); t.save(dst, 'WEBP', quality=88, method=6); print('small:', dst, t.size)

if __name__ == '__main__':
    if sys.argv[1] == 'edge': edge(sys.argv[2], sys.argv[3])
    elif sys.argv[1] == 'small': small(sys.argv[2])
    else: print('usage: edge <x4.png> <out.webp> | small <id>'); sys.exit(2)
