"""Builds LG-QA-safe app icons: flat solid background (no gradient, no glow, no transparency).

LG QA defects fixed:
  - "The app icon has a gradient color."            -> background is one solid colour
  - "Appicon background color and tile color do not match." -> same colour goes to
    appinfo.json "iconColor" and to the Seller Lounge "App Tile Color" field.

Usage: python scripts/make_flat_icons.py   (requires Pillow + numpy)
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'store-assets', 'webos', 'app_icon_solid_1024x1024.png')
BG_HEX = '#071020'
BG = tuple(int(BG_HEX[i:i + 2], 16) for i in (1, 3, 5))
CYAN = (34, 211, 238)

# Monitor artwork bounds measured in the 1024px source (neon frame + stand)
MONITOR = (204, 245, 820, 664)
STAND = (356, 660, 668, 700)


def font(size):
    for name in ('segoeuib.ttf', 'arialbd.ttf', 'DejaVuSans-Bold.ttf'):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def build_1024():
    src = Image.open(SRC).convert('RGB')
    out = Image.new('RGB', (1024, 1024), BG)

    # keep the whole monitor (screen content is part of the logo)
    mask = Image.new('L', (1024, 1024), 0)
    ImageDraw.Draw(mask).rounded_rectangle(MONITOR, radius=26, fill=255)
    # stand: keep only its bright strokes, drop the dark gradient around it
    arr = np.array(src).astype(int)
    lum = arr.max(axis=2)
    m = np.array(mask)
    x0, y0, x1, y1 = STAND
    m[y0:y1, x0:x1] = np.where(lum[y0:y1, x0:x1] > 90, 255, m[y0:y1, x0:x1])
    out.paste(src, (0, 0), Image.fromarray(m.astype('uint8')))

    # wordmark
    d = ImageDraw.Draw(out)
    f = font(124)
    w1 = d.textlength('KDR ', font=f)
    w2 = d.textlength('IPTV', font=f)
    x = (1024 - (w1 + w2)) / 2
    y = 735
    d.text((x, y), 'KDR ', font=f, fill=(255, 255, 255))
    d.text((x + w1, y), 'IPTV', font=f, fill=CYAN)
    return out


def main():
    big = build_1024()
    targets = {
        os.path.join(ROOT, 'store-assets', 'webos', 'app_icon_flat_1024x1024.png'): 1024,
        os.path.join(ROOT, 'store-assets', 'webos', 'app_icon_flat_512x512.png'): 512,
        os.path.join(ROOT, 'store-assets', 'webos', 'app_icon_flat_400x400.png'): 400,
        os.path.join(ROOT, 'public', 'largeIcon.png'): 130,
        os.path.join(ROOT, 'public', 'icon.png'): 80,
    }
    for path, size in targets.items():
        img = big if size == 1024 else big.resize((size, size), Image.LANCZOS)
        # re-flatten edges so resampling can't leave a non-solid border
        a = np.array(img)
        # snap resampling noise next to the background back to the exact tile colour
        near = (np.abs(a.astype(int) - np.array(BG)).max(axis=2) <= 8)
        a[near] = BG
        edge = max(1, size // 64)
        a[:edge, :] = BG; a[-edge:, :] = BG; a[:, :edge] = BG; a[:, -edge:] = BG
        Image.fromarray(a).save(path, optimize=True)
        print('wrote', os.path.relpath(path, ROOT), size)
    print('tile colour:', BG_HEX)


if __name__ == '__main__':
    main()
