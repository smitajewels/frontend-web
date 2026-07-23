from PIL import Image

src = r"D:\GS_v2\frontend\public\logo.png"
# Keep a backup of the opaque original if not already backed up
backup = r"D:\GS_v2\frontend\public\logo-opaque.png"

img = Image.open(src).convert("RGBA")
img.save(backup, "PNG")

pixels = img.load()
w, h = img.size

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        brightness = (r + g + b) / 3.0
        is_near_white = r > 240 and g > 240 and b > 235 and abs(r - g) < 20 and abs(g - b) < 25
        is_light_cream = r > 245 and g > 240 and b > 230 and brightness > 242
        if is_near_white or is_light_cream:
            pixels[x, y] = (r, g, b, 0)
        elif r > 230 and g > 225 and b > 215 and brightness > 228:
            alpha = int(max(0, min(255, (255 - brightness) * 8)))
            if alpha < a:
                pixels[x, y] = (r, g, b, alpha)

img.save(src, "PNG")
print(f"Saved transparent logo {w}x{h}")
print(f"Backup: {backup}")
