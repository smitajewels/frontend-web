from PIL import Image

src = r"D:\GS_v2\frontend\public\logo-opaque.png"
full = r"D:\GS_v2\frontend\public\logo.png"
mark = r"D:\GS_v2\frontend\public\logo-mark.png"

img = Image.open(src).convert("RGBA")
pixels = img.load()
w, h = img.size

# Transparent background
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        brightness = (r + g + b) / 3.0
        if r > 240 and g > 240 and b > 235 and abs(r - g) < 20 and abs(g - b) < 25:
            pixels[x, y] = (r, g, b, 0)
        elif r > 245 and g > 240 and b > 230 and brightness > 242:
            pixels[x, y] = (r, g, b, 0)
        elif r > 230 and g > 225 and b > 215 and brightness > 228:
            alpha = int(max(0, min(255, (255 - brightness) * 8)))
            if alpha < a:
                pixels[x, y] = (r, g, b, alpha)

img.save(full, "PNG")

# Crop lotus mark (top ~58% of artwork, excluding wordmark)
# Find content bounding box of non-transparent pixels
bbox = img.getbbox()
if not bbox:
    raise SystemExit("No content found")
left, top, right, bottom = bbox
content_h = bottom - top
# Lotus sits in upper portion; keep ~top 55% of content
mark_bottom = top + int(content_h * 0.55)
mark_img = img.crop((left, top, right, mark_bottom))
# Trim again
mb = mark_img.getbbox()
if mb:
    mark_img = mark_img.crop(mb)
mark_img.save(mark, "PNG")
print("full", img.size, "mark", mark_img.size)
