"""Rebuild self-hosted fonts from source text (requires fonttools and brotli)."""
from pathlib import Path
import argparse
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
text = ''.join(p.read_text(encoding='utf-8-sig') for p in (root/'src').rglob('*') if p.suffix in ['.astro','.ts','.md','.mdx'])
text += ''.join(chr(i) for i in range(32, 127))
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', default='C:/Windows/Fonts/NotoSansSC-VF.ttf', help='Path to the original Noto Sans SC variable TTF')
font = TTFont(parser.parse_args().source)
options = subset.Options()
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
font.flavor = 'woff2'
font.save(root/'public/fonts/mori-chinese.woff2')
print('Subset ready:', (root/'public/fonts/mori-chinese.woff2').stat().st_size)
