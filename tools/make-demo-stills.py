"""Procedural demo stills for the sample deck. No stock photos, no rights issues.
Writes JPGs to public/demo/the-saltings/. Run: python3 tools/make-demo-stills.py"""
import os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "demo", "the-saltings")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def hexrgb(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))

def vgrad(w, h, stops):
    """Vertical gradient from list of (pos 0..1, hex)."""
    pos = np.array([p for p, _ in stops]); cols = np.array([hexrgb(c) for _, c in stops], np.float32)
    ys = np.linspace(0, 1, h)
    row = np.stack([np.interp(ys, pos, cols[:, k]) for k in range(3)], axis=1)  # h x 3
    return np.repeat(row[:, None, :], w, axis=1).astype(np.float32)

def noise(w, h, amount=10, blur=0):
    n = rng.normal(0, amount, (h, w, 1)).astype(np.float32)
    n = np.repeat(n, 3, axis=2)
    if blur:
        im = Image.fromarray(np.clip(n + 128, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))
        n = np.asarray(im).astype(np.float32) - 128
    return n

def fog_bands(w, h, strength=18, scale=90):
    y = np.arange(h)[:, None]; x = np.arange(w)[None, :]
    f = (np.sin(y / scale + rng.random() * 6) * 0.6 + np.sin((x + y) / (scale * 2.3)) * 0.4)
    return np.repeat((f * strength)[:, :, None], 3, axis=2).astype(np.float32)

def finish(arr, path, vignette=0.35, grain=6, quality=86):
    h, w, _ = arr.shape
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = w / 2, h / 2
    d = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2)
    v = 1 - vignette * np.clip(d - 0.4, 0, 1) ** 1.6
    arr = arr * v[:, :, None] + noise(w, h, grain)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(path, quality=quality, optimize=True)

def draw_on(arr):
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    return im, ImageDraw.Draw(im, "RGBA")

def back(im): return np.asarray(im).astype(np.float32)

# 1. Hero: dawn over the oyster beds, 2.39:1
W, H = 2400, 1004
sky = vgrad(W, H, [(0, "#0b1f26"), (0.42, "#2f5a63"), (0.55, "#9fb7ad"), (0.58, "#1b3a40"), (0.8, "#0e2a30"), (1, "#06161b")])
sky += fog_bands(W, H, 10, 120)
im, d = draw_on(sky)
# sun glow
for r, a in [(520, 18), (360, 28), (220, 40)]:
    d.ellipse([W * 0.62 - r, H * 0.55 - r * 0.55, W * 0.62 + r, H * 0.55 + r * 0.55], fill=(230, 220, 190, a))
# water shimmer
for i in range(260):
    y = int(H * 0.58 + (H * 0.42) * (i / 260) ** 1.4)
    x0 = rng.integers(0, W); ln = int(rng.integers(10, 140) * (0.3 + i / 260))
    d.line([(x0, y), (x0 + ln, y)], fill=(200, 215, 200, int(rng.integers(8, 40))), width=1)
# oyster bed posts and a body line in the silt
for i in range(28):
    x = int(W * 0.08 + i * (W * 0.84 / 28) + rng.integers(-20, 20)); y = int(H * 0.66 + rng.integers(-6, 6))
    d.line([(x, y), (x, y - rng.integers(30, 70))], fill=(20, 30, 32, 230), width=4)
d.polygon([(W * 0.30, H * 0.86), (W * 0.45, H * 0.84), (W * 0.47, H * 0.87), (W * 0.31, H * 0.89)], fill=(12, 18, 20, 200))
# harbour silhouette on the left
d.rectangle([0, H * 0.50, W * 0.22, H * 0.60], fill=(10, 18, 20, 255))
for i in range(6):
    x = int(W * 0.03 + i * W * 0.03); d.rectangle([x, H * 0.44 + rng.integers(0, 30), x + 22, H * 0.52], fill=(10, 18, 20, 255))
finish(back(im), os.path.join(OUT, "hero.jpg"), vignette=0.45)

# 2. Mood stills
W, H = 1800, 753
# a) low tide, first light
a = vgrad(W, H, [(0, "#122a31"), (0.5, "#6f8f8c"), (0.55, "#2a4a4e"), (1, "#0a1c21")]) + fog_bands(W, H, 14, 70)
im, d = draw_on(a)
for i in range(120):
    y = int(H * 0.55 + i * (H * 0.45 / 120)); d.line([(0, y), (W, y)], fill=(230, 225, 210, int(2 + (i % 7))), width=1)
d.line([(W * 0.2, H * 0.78), (W * 0.62, H * 0.74)], fill=(8, 12, 14, 220), width=9)
finish(back(im), os.path.join(OUT, "still-1.jpg"))
# b) harbour office at night, sodium lamps
b = vgrad(W, H, [(0, "#05090b"), (0.6, "#0e1416"), (1, "#1a1410")])
im, d = draw_on(b)
for cx, cy in [(W * 0.28, H * 0.30), (W * 0.72, H * 0.26)]:
    for r, al in [(260, 18), (160, 36), (70, 90), (26, 220)]:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(235, 170, 70, al))
d.rectangle([W * 0.1, H * 0.62, W * 0.9, H * 0.9], fill=(28, 24, 18, 255))
for i in range(5):
    x = W * 0.16 + i * W * 0.14; d.rectangle([x, H * 0.66, x + W * 0.1, H * 0.86], fill=(60, 48, 30, 255))
    d.rectangle([x + 10, H * 0.69, x + W * 0.1 - 10, H * 0.84], fill=(170, 130, 60, 90))
finish(back(im), os.path.join(OUT, "still-2.jpg"), vignette=0.5)
# c) weatherboard houses in sea fog
c = vgrad(W, H, [(0, "#b9c7c6"), (0.55, "#8fa4a3"), (1, "#4e6467")]) + fog_bands(W, H, 16, 50)
im, d = draw_on(c)
x = 0
while x < W:
    w = rng.integers(140, 260); hh = rng.integers(int(H * 0.25), int(H * 0.42))
    col = (40 + rng.integers(0, 30), 52 + rng.integers(0, 30), 56 + rng.integers(0, 30), 170)
    d.rectangle([x, H - hh, x + w, H], fill=col)
    d.polygon([(x, H - hh), (x + w / 2, H - hh - rng.integers(40, 90)), (x + w, H - hh)], fill=col)
    x += w + rng.integers(10, 40)
finish(back(im), os.path.join(OUT, "still-3.jpg"), vignette=0.25)

# 3. Locations
W, H = 1800, 753
loc1 = vgrad(W, H, [(0, "#2b4d55"), (0.5, "#8aa39f"), (0.52, "#223f44"), (1, "#0b1e23")]) + fog_bands(W, H, 10, 80)
im, d = draw_on(loc1)
for i in range(40):
    x = int(i * W / 40 + rng.integers(-10, 10)); d.line([(x, H * 0.53), (x, H * 0.53 - rng.integers(20, 60))], fill=(14, 22, 24, 230), width=3)
d.polygon([(W * 0.55, H * 0.6), (W * 0.75, H * 0.58), (W * 0.78, H * 0.63), (W * 0.56, H * 0.65)], fill=(14, 22, 24, 240))
finish(back(im), os.path.join(OUT, "location-1.jpg"))
loc2 = vgrad(W, H, [(0, "#9fb3b5"), (0.62, "#c9d2cf"), (0.64, "#3f5a4c"), (1, "#1d2d26")]) + fog_bands(W, H, 8, 150)
im, d = draw_on(loc2)
d.line([(0, H * 0.64), (W, H * 0.60)], fill=(30, 40, 36, 255), width=6)
for i in range(300):
    x = rng.integers(0, W); y = int(H * 0.66 + rng.integers(0, int(H * 0.34)))
    d.line([(x, y), (x + rng.integers(-6, 6), y - rng.integers(6, 22))], fill=(70, 90, 70, 160), width=1)
finish(back(im), os.path.join(OUT, "location-2.jpg"), vignette=0.25)

# 4. Headshot placeholders, 4:5: head-and-shoulders silhouette on a studio backdrop
def headshot(name, bg_a, bg_b, tint):
    W, H = 800, 1000
    arr = vgrad(W, H, [(0, bg_a), (1, bg_b)]) + noise(W, H, 4, 3)
    im, d = draw_on(arr)
    d.ellipse([W * 0.3, H * 0.6, W * 0.7, H * 1.0], fill=tint)  # glow behind
    d.ellipse([W * 0.33, H * 0.18, W * 0.67, H * 0.56], fill=(12, 16, 18, 255))  # head
    d.rounded_rectangle([W * 0.12, H * 0.62, W * 0.88, H * 1.05], radius=160, fill=(12, 16, 18, 255))  # shoulders
    finish(back(im), os.path.join(OUT, name), vignette=0.4, grain=4)

headshot("wishlist-a.jpg", "#d8e3e2", "#8ea7a8", (47, 179, 194, 60))
headshot("wishlist-b.jpg", "#e4dcd2", "#a89a86", (200, 160, 90, 60))
headshot("wishlist-c.jpg", "#d9dde6", "#8e95a8", (120, 140, 200, 60))
headshot("team-1.jpg", "#e2e6e6", "#9aa8a8", (47, 179, 194, 50))
headshot("team-2.jpg", "#e6e2dc", "#aaa094", (47, 179, 194, 50))

print("wrote", sorted(os.listdir(OUT)))
