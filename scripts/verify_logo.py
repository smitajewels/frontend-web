from PIL import Image

img = Image.open(r"D:\GS_v2\frontend\public\logo.png")
print("mode", img.mode, "size", img.size)
a = img.getchannel("A")
hist = a.histogram()
print("transparent", hist[0], "opaque", hist[255], "partial", sum(hist[1:255]))
px = img.load()
w, h = img.size
print("corners", px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1])
print("center", px[w // 2, h // 3])
