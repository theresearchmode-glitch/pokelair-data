# Cuts the chat attachments out of the full-page captures made by capture.mjs (3x pixel density, 390px-wide phone).
# Usage: python3 crop.py <capture dir> <out dir>.  Rects are in CSS pixels: (page, top, bottom[, left, right]).
import sys
from PIL import Image
src, out = sys.argv[1].rstrip('/') + '/', sys.argv[2].rstrip('/') + '/'
def crop(v, y0, y1, x0=8, x1=382):
    return Image.open(src + f'{v}_full.png').convert('RGB').crop((x0 * 3, y0 * 3, x1 * 3, y1 * 3))
crop('report', 98, 250).save(out + 'grade.png')
crop('report', 392, 698).save(out + 'fixit.png')
crop('calc', 383, 624).save(out + 'calc.png')
crop('ratings', 638, 1088).save(out + 'rate.png')
b = crop('auto', 502, 948); b.crop((0, 0, b.width, 1268)).save(out + 'build2.png')
crop('home', 0, 844, 0, 390).save(out + 'home.png')
crop('home', 12, 58, 18, 170).save(out + 'logo.png')
h, c = crop('matchup', 100, 196), crop('matchup', 1124, 1514)
bt = Image.new('RGB', (h.width, h.height + c.height + 30), h.getpixel((5, 5))); bt.paste(h, (0, 0)); bt.paste(c, (0, h.height + 30)); bt.save(out + 'battle.png')
