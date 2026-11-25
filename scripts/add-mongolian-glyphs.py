# Usage: pip install fonttools brotli
#   python3 scripts/add-mongolian-glyphs.py full  <in.woff> <out.woff>     (OG image fonts in src/assets/fonts)
#   python3 scripts/add-mongolian-glyphs.py subset <in.woff> <out.woff2>   (web patch fonts in src/assets/fonts/web)
"""Add the Mongolian letters Ө ө Ү ү that Unbounded lacks, built as composites of O o Y y and the hyphen bar."""
import sys
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent
from fontTools.subset import Subsetter, Options

from fontTools.pens.ttGlyphPen import TTGlyphPen

def add(font):
    glyf, hmtx = font['glyf'], font['hmtx']
    order = font.getGlyphOrder()
    hy = glyf['hyphen']; bar = hy.yMax - hy.yMin
    new = {}
    for name, base in (('uni04E8', 'O'), ('uni04E9', 'o')):
        b = glyf[base]; pen = TTGlyphPen(glyf)
        b.draw(pen, glyf)
        inset = (b.xMax - b.xMin) * 0.06; cy = (b.yMin + b.yMax) / 2
        x0, x1, y0, y1 = round(b.xMin + inset), round(b.xMax - inset), round(cy - bar / 2), round(cy + bar / 2)
        pen.moveTo((x0, y0)); pen.lineTo((x0, y1)); pen.lineTo((x1, y1)); pen.lineTo((x1, y0)); pen.closePath()
        new[name] = (pen.glyph(), hmtx[base])
    for name, base in (('uni04AE', 'Y'), ('uni04AF', 'y')):
        pen = TTGlyphPen(glyf); glyf[base].draw(pen, glyf)
        new[name] = (pen.glyph(), hmtx[base])
    for name, (g, m) in new.items():
        glyf[name] = g; hmtx[name] = m
        if name not in order: order.append(name)
    font.setGlyphOrder(order); glyf.glyphOrder = order
    for t in font['cmap'].tables:
        if t.isUnicode():
            t.cmap.update({0x4E8: 'uni04E8', 0x4E9: 'uni04E9', 0x4AE: 'uni04AE', 0x4AF: 'uni04AF'})
    font['maxp'].numGlyphs = len(order)
    for name in new: glyf[name].recalcBounds(glyf)
    return font

mode, src, dst = sys.argv[1:4]
f = TTFont(src); f.flavor = None; add(f)
if mode == 'subset':  # tiny web font with only the four letters
    o = Options(); o.flavor = 'woff2'; o.layout_features = []; o.notdef_outline = False
    s = Subsetter(o); s.populate(unicodes=[0x4E8, 0x4E9, 0x4AE, 0x4AF]); s.subset(f); f.flavor = 'woff2'
else:
    f.flavor = 'woff'
f.save(dst)
