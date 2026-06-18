#!/usr/bin/env python3
"""Generate bitmap cut-in frames for the objection reveal sequence."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "game" / "assets" / "objection-cutin-sheet-v1.png"

FRAME_W = 520
FRAME_H = 292
FRAMES = 3


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def make_frame(seed: int, base: str, glow: str) -> Image.Image:
    rng = random.Random(seed)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), rgba(base))
    draw = ImageDraw.Draw(frame, "RGBA")
    for y in range(FRAME_H):
        ratio = y / max(1, FRAME_H - 1)
        shade = int(42 * ratio)
        draw.line((0, y, FRAME_W, y), fill=(shade, max(0, shade - 12), max(0, shade - 20), 68))
    for _ in range(120):
        x = rng.randint(-70, FRAME_W)
        y = rng.randint(0, FRAME_H)
        length = rng.randint(70, 210)
        angle = rng.uniform(-0.34, 0.14)
        color = rgba(glow if rng.random() < 0.32 else "#130c0b", rng.randint(25, 95))
        draw.line((x, y, x + math.cos(angle) * length, y + math.sin(angle) * length), fill=color, width=rng.randint(2, 7))
    return frame


def slash(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], color: str, alpha: int = 230, width: int = 12) -> None:
    draw.line(points, fill=rgba(color, alpha), width=width, joint="curve")
    draw.line(points, fill=rgba("#fff1bf", min(255, alpha + 18)), width=max(2, width // 3), joint="curve")


def draw_defense_frame() -> Image.Image:
    frame = make_frame(11, "#7d1713", "#d8a83c")
    draw = ImageDraw.Draw(frame, "RGBA")
    slash(draw, [(-24, 236), (122, 194), (332, 154), (548, 104)], "#f1d889", 238, 18)
    slash(draw, [(-42, 62), (126, 90), (295, 74), (556, 28)], "#160f0d", 210, 16)
    draw.ellipse((44, 36, 142, 134), fill=rgba("#17100f", 238), outline=rgba("#d8a83c", 180), width=4)
    draw.polygon([(80, 120), (210, 104), (292, 222), (62, 260)], fill=rgba("#1a1110", 244), outline=rgba("#d8a83c", 130))
    draw.polygon([(178, 116), (376, 86), (430, 104), (218, 154)], fill=rgba("#231514", 245), outline=rgba("#f1d889", 170))
    draw.polygon([(392, 83), (472, 70), (436, 111)], fill=rgba("#fff1bf", 238), outline=rgba("#251514", 255))
    draw.line((462, 75, 510, 62), fill=rgba("#fff8e7", 230), width=5)
    for offset in range(0, 110, 18):
        draw.line((208 + offset, 108 - offset // 5, 250 + offset, 143 - offset // 7), fill=rgba("#8b5f2d", 150), width=3)
    return frame.filter(ImageFilter.UnsharpMask(radius=1.2, percent=105, threshold=3))


def draw_record_frame() -> Image.Image:
    frame = make_frame(22, "#201711", "#d8a83c")
    draw = ImageDraw.Draw(frame, "RGBA")
    glow = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow, "RGBA")
    gdraw.polygon([(178, -20), (352, -20), (446, 292), (68, 292)], fill=rgba("#f5d27e", 92))
    frame.alpha_composite(glow.filter(ImageFilter.GaussianBlur(16)))
    draw = ImageDraw.Draw(frame, "RGBA")
    desk = (82, 186, 438, 272)
    draw.rounded_rectangle(desk, radius=16, fill=rgba("#3c261b", 240), outline=rgba("#d8a83c", 180), width=3)
    scroll = (116, 74, 402, 206)
    draw.rounded_rectangle(scroll, radius=12, fill=rgba("#ead4a4", 246), outline=rgba("#513222", 255), width=4)
    draw.rectangle((scroll[0] - 18, scroll[1] + 12, scroll[0] + 20, scroll[3] - 12), fill=rgba("#9d6d2e", 245), outline=rgba("#fff1bf", 160))
    draw.rectangle((scroll[2] - 20, scroll[1] + 12, scroll[2] + 18, scroll[3] - 12), fill=rgba("#9d6d2e", 245), outline=rgba("#fff1bf", 160))
    for y in range(scroll[1] + 24, scroll[3] - 18, 20):
        draw.line((scroll[0] + 34, y, scroll[2] - 38, y + random.Random(y).randint(-3, 3)), fill=rgba("#5d4330", 160), width=3)
    for x, y, size in [(92, 52, 44), (420, 52, 34), (62, 154, 30), (448, 168, 38), (248, 32, 24)]:
        paper = [(x, y), (x + size, y - 8), (x + size + 14, y + size), (x - 8, y + size + 8)]
        draw.polygon(paper, fill=rgba("#f2e2bf", 220), outline=rgba("#d8a83c", 92))
    draw.ellipse((236, 188, 288, 240), fill=rgba("#9d2f25", 238), outline=rgba("#fff1bf", 170), width=4)
    slash(draw, [(56, 226), (174, 180), (304, 132), (474, 80)], "#f1d889", 190, 9)
    return frame.filter(ImageFilter.UnsharpMask(radius=1.1, percent=90, threshold=3))


def draw_opponent_frame() -> Image.Image:
    frame = make_frame(33, "#821912", "#f1d889")
    draw = ImageDraw.Draw(frame, "RGBA")
    cx, cy = 262, 148
    for angle in range(0, 360, 24):
        r1 = 22
        r2 = 285
        x1 = cx + math.cos(math.radians(angle)) * r1
        y1 = cy + math.sin(math.radians(angle)) * r1
        x2 = cx + math.cos(math.radians(angle + 5)) * r2
        y2 = cy + math.sin(math.radians(angle + 5)) * r2
        draw.line((x1, y1, x2, y2), fill=rgba("#f1d889", 210), width=5)
        draw.line((x1, y1, x2, y2), fill=rgba("#1b1010", 150), width=2)
    draw.ellipse((292, 36, 394, 136), fill=rgba("#1b1110", 244), outline=rgba("#d8a83c", 150), width=4)
    draw.rectangle((310, 18, 382, 62), fill=rgba("#16100f", 248), outline=rgba("#d8a83c", 160), width=3)
    draw.polygon([(294, 132), (442, 120), (506, 272), (250, 278)], fill=rgba("#1b1110", 244), outline=rgba("#d8a83c", 100))
    draw.polygon([(322, 84), (334, 78), (342, 88), (328, 94)], fill=rgba("#fff8e7", 238))
    draw.polygon([(366, 84), (378, 78), (386, 90), (370, 95)], fill=rgba("#fff8e7", 238))
    draw.arc((334, 102, 378, 136), 200, 340, fill=rgba("#fff1bf", 220), width=4)
    for hand in [(426, 122), (112, 204)]:
        hx, hy = hand
        draw.ellipse((hx - 18, hy - 18, hx + 18, hy + 18), fill=rgba("#3b2119", 238), outline=rgba("#d8a83c", 120), width=2)
        for i in range(4):
            draw.line((hx + i * 5 - 8, hy - 14, hx + i * 8 - 10, hy - 42), fill=rgba("#3b2119", 238), width=8)
    draw.ellipse((232, 118, 292, 178), outline=rgba("#fff8e7", 230), width=7)
    return frame.filter(ImageFilter.UnsharpMask(radius=1.3, percent=120, threshold=3))


def main() -> None:
    sheet = Image.new("RGBA", (FRAME_W * FRAMES, FRAME_H), (0, 0, 0, 0))
    for index, frame in enumerate((draw_defense_frame(), draw_record_frame(), draw_opponent_frame())):
        sheet.alpha_composite(frame, (index * FRAME_W, 0))
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT_PATH)
    print(f"wrote {OUT_PATH} {sheet.size[0]}x{sheet.size[1]}")


if __name__ == "__main__":
    main()
