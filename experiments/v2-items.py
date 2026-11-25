# NastyPlot v2 item pictures (Sim, Nov 23: the real item images, upscaled on his PC, inside the item sheet's evidence bag).
# The same route as the Pokémon art (experiments/v2-art.py): big source files outside the page -> small web copies in the art folder.
#   python3 experiments/v2-items.py [SRC]      SRC default docs/rebuild/art/items512 (gpu-jobs.md Job 4), or ITEM_SRC=<folder>
#     -> app/src/v2/art/items/<file>.webp      192px on the long side (the bag shows 62px on desktop: 3x)
#     -> app/src/v2/art-s/items/<file>.webp    128px on the long side (the bag shows 40px on phones: 3x)
#     -> app/src/v2/art/items.json             {"Life Orb": "life-orb", ...} only for the items that have a picture
# Names and file names come from docs/rebuild/art/items-list.tsv (PokéAPI file names: Leek -> stick). A source may be .webp or .png.
# The build reads items.json (as it reads meta.json); V2.itemImg(name) gives the picture's address, and an item with none keeps
# our drawing (item-art.js). No source folder = nothing is written and the site keeps every drawing.
#   --clean   removes the three outputs (items/, art-s/items/, items.json), e.g. after a test with stand-in pictures.
import os, sys, json, shutil
from PIL import Image
args = [a for a in sys.argv[1:] if not a.startswith('--')]
SRC = args[0] if args else os.environ.get('ITEM_SRC', 'docs/rebuild/art/items512')
BIG, SMALL, MAP = 'app/src/v2/art/items', 'app/src/v2/art-s/items', 'app/src/v2/art/items.json'
if '--clean' in sys.argv:
    for d in (BIG, SMALL): shutil.rmtree(d, ignore_errors=True)
    if os.path.exists(MAP): os.remove(MAP)
    print('item pictures removed'); sys.exit(0)
if not os.path.isdir(SRC):
    print(f'no item source folder ({SRC}): nothing written, every item keeps its drawing'); sys.exit(0)
rows = [l.rstrip('\n').split('\t') for l in open('docs/rebuild/art/items-list.tsv', encoding='utf8')][1:]
for d in (BIG, SMALL): os.makedirs(d, exist_ok=True)
def fit(im, n):
    # trim to the picture itself, then n px on the long side. Downscaling (the PC's 512px files) uses Lanczos; a small pixel icon
    # (only a stand-in test) is enlarged with nearest-neighbour so it stays crisp instead of blurring.
    im = im.convert('RGBA'); bb = im.split()[3].getbbox()
    if bb: im = im.crop(bb)
    w, h = im.size; s = n / max(w, h)
    return im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS if s <= 1 else Image.NEAREST)
found, missing = {}, []
for name, slug, *_ in rows:
    src = next((os.path.join(SRC, slug + e) for e in ('.webp', '.png') if os.path.exists(os.path.join(SRC, slug + e))), None)
    if not src: missing.append(name); continue
    im = Image.open(src)
    fit(im, 192).save(os.path.join(BIG, slug + '.webp'), 'WEBP', quality=84, method=4)
    fit(im, 128).save(os.path.join(SMALL, slug + '.webp'), 'WEBP', quality=84, method=4)
    found[name] = slug
json.dump(found, open(MAP, 'w', encoding='utf8'), separators=(',', ':'), ensure_ascii=False, sort_keys=True)
print(f'{len(found)} of {len(rows)} item pictures from {SRC}; items.json written; {len(missing)} keep the drawing')
