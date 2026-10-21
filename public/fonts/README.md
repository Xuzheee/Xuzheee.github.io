# Font source

Switzer, by Indian Type Foundry, downloaded from Fontshare on 2026-10-14.

- Family: https://www.fontshare.com/fonts/switzer
- License: https://www.fontshare.com/licenses/itf-free-font-license
- CSS source: https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap
- Files: original, unmodified WOFF2 web fonts in weights 400, 500, 600 and 700.

The files are served locally so the preview does not require a third-party font request. The legacy layout keeps its platform CJK fallback; the Mori layout uses the fonts below.

## Mori layout fonts

- Anton: Google Fonts / https://github.com/googlefonts/AntonFont. `anton.woff2` is used for the large MORI wordmark. SIL Open Font License: `anton-OFL.txt`.
- Noto Sans SC: Google Fonts / https://github.com/notofonts/noto-cjk. `mori-chinese.woff2` is a variable-weight subset of the locally installed `NotoSansSC-VF.ttf`, containing the site's current text. SIL Open Font License: `noto-OFL.txt`.
- Rebuild the Chinese subset after adding new characters: `python scripts/mori-fonts.py --source /path/to/NotoSansSC-VF.ttf` (requires `fonttools` and `brotli`). The original full-size font is not shipped.
