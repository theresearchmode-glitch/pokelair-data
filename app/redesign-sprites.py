# Redesign sprites (Sim, Nov 5: the 256px inked set looked blurry on phones). Takes the 512px HOME renders (git: eadf41d^:app/sp)
# and draws a clean ink outline and magenta rim at full resolution. Usage: python3 app/redesign-sprites.py <in.webp> <out.webp>; output is app/sp-redesign/,
# published as sp/<id>.webp on the redesign page only. The live page keeps app/sp.
import sys
from PIL import Image, ImageFilter, ImageChops
def ink(src,dst,ink=(24,22,40),rim=(232,30,140)):
    im=Image.open(src).convert('RGBA')
    W=im.width; pad=24
    big=Image.new('RGBA',(W+2*pad,W+2*pad),(0,0,0,0)); big.alpha_composite(im,(pad,pad))
    a=big.getchannel('A').point(lambda v:255 if v>40 else 0)
    def grow(m,r):
        m=m.filter(ImageFilter.GaussianBlur(r/2)).point(lambda v:255 if v>20 else 0)
        return m.filter(ImageFilter.GaussianBlur(1.1))
    a_ink=grow(a,7)
    a_rim=grow(a,12)
    # rim shifted down-right like the old set
    rim_l=Image.new('RGBA',big.size,rim+(0,)); rim_l.putalpha(ImageChops.offset(a_rim,6,6))
    ink_l=Image.new('RGBA',big.size,ink+(0,)); ink_l.putalpha(a_ink)
    out=Image.new('RGBA',big.size,(0,0,0,0)); out.alpha_composite(rim_l); out.alpha_composite(ink_l); out.alpha_composite(big)
    out=out.resize((W,W),Image.LANCZOS)
    out.save(dst,'WEBP',quality=88,method=6)
if __name__=='__main__':
    ink(sys.argv[1],sys.argv[2])
