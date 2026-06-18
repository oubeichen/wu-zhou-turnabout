#!/usr/bin/env python3
"""Generate bitmap title callouts for courtroom impact flashes."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "game" / "assets" / "court-impact-callout-sheet-v1.png"

FRAME_W = 520
FRAME_H = 190
CALLOUTS = [
    ("异议成立", "#9d2f25", "#fff1bf", "#5f1f1a"),
    ("追问不足", "#244969", "#e5f2ff", "#0f1c28"),
    ("驳回", "#263340", "#f1f6ff", "#101820"),
    ("反制", "#8f241a", "#f0c65b", "#32110e"),
    ("逆转", "#5b3c18", "#fff1bf", "#20120a"),
    ("判决", "#76551b", "#fff8d8", "#2a1809"),
    ("档案击破", "#4f2f72", "#f7edff", "#1d102a"),
]


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size, index=1 if bold else 0)
        except Exception:
            continue
    return ImageFont.load_default()


FONT_BIG = font(96, True)
FONT_MED = font(78, True)


def text_font_for(title: str) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    return FONT_MED if len(title) >= 5 else FONT_BIG


def draw_slashes(draw: ImageDraw.ImageDraw, rng: random.Random, accent: str, dark: str) -> None:
    for _ in range(32):
        x = rng.randint(-80, FRAME_W + 30)
        y = rng.randint(-20, FRAME_H + 20)
        length = rng.randint(50, 190)
        angle = rng.uniform(-0.32, 0.18)
        color = accent if rng.random() < 0.55 else dark
        draw.line(
            (x, y, x + math.cos(angle) * length, y + math.sin(angle) * length),
            fill=rgba(color, rng.randint(45, 135)),
            width=rng.randint(2, 7),
        )


def draw_callout(title: str, base: str, accent: str, dark: str, seed: int) -> Image.Image:
    rng = random.Random(seed)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    glow = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow, "RGBA")
    gdraw.rounded_rectangle((22, 28, FRAME_W - 22, FRAME_H - 28), radius=20, fill=rgba(base, 214))
    gdraw.ellipse((FRAME_W // 2 - 170, 6, FRAME_W // 2 + 170, FRAME_H - 6), fill=rgba(accent, 44))
    frame.alpha_composite(glow.filter(ImageFilter.GaussianBlur(10)))

    draw = ImageDraw.Draw(frame, "RGBA")
    draw_slashes(draw, rng, accent, dark)
    draw.rounded_rectangle((28, 32, FRAME_W - 28, FRAME_H - 32), radius=18, outline=rgba(accent, 170), width=4)
    draw.rounded_rectangle((39, 43, FRAME_W - 39, FRAME_H - 43), radius=12, outline=rgba("#fff8e7", 74), width=2)

    for _ in range(18):
        cx = rng.randint(50, FRAME_W - 50)
        cy = rng.randint(32, FRAME_H - 32)
        size = rng.randint(8, 24)
        rot = rng.random() * math.tau
        pts = []
        for index in range(3):
            a = rot + index * (math.tau / 3)
            pts.append((cx + math.cos(a) * size, cy + math.sin(a) * size * 0.6))
        draw.polygon(pts, fill=rgba(accent, rng.randint(55, 140)), outline=rgba("#fff8e7", 45))

    text_font = text_font_for(title)
    bbox = draw.textbbox((0, 0), title, font=text_font, stroke_width=4)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (FRAME_W - tw) // 2 - bbox[0]
    y = (FRAME_H - th) // 2 - bbox[1] - 5
    draw.text((x + 6, y + 8), title, font=text_font, fill=rgba("#120b0a", 155), stroke_width=5, stroke_fill=rgba("#120b0a", 110))
    draw.text((x, y), title, font=text_font, fill=rgba("#fff8e7", 255), stroke_width=5, stroke_fill=rgba(dark, 238))
    draw.text((x - 2, y - 3), title, font=text_font, fill=rgba(accent, 180), stroke_width=1, stroke_fill=rgba("#fff8e7", 92))

    for offset in (-118, 118):
        draw.line((FRAME_W // 2 + offset, 38, FRAME_W // 2 + offset * 0.34, FRAME_H - 36), fill=rgba("#fff8e7", 82), width=3)

    return frame.filter(ImageFilter.UnsharpMask(radius=1.1, percent=110, threshold=3))


def main() -> None:
    sheet = Image.new("RGBA", (FRAME_W * len(CALLOUTS), FRAME_H), (0, 0, 0, 0))
    for index, (title, base, accent, dark) in enumerate(CALLOUTS):
        sheet.alpha_composite(draw_callout(title, base, accent, dark, 900 + index), (index * FRAME_W, 0))
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT_PATH)
    print(f"wrote {OUT_PATH} {sheet.size[0]}x{sheet.size[1]}")


if __name__ == "__main__":
    main()
