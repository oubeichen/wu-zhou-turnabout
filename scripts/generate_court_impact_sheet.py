#!/usr/bin/env python3
"""Generate bitmap impact bursts for courtroom cue flashes."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "game" / "assets" / "court-impact-burst-sheet-v1.png"

FRAME_W = 640
FRAME_H = 360
FRAMES = 3


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def base_frame(seed: int, top: str, bottom: str) -> Image.Image:
    rng = random.Random(seed)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), rgba(bottom))
    draw = ImageDraw.Draw(frame, "RGBA")
    top_rgb = rgba(top)
    bottom_rgb = rgba(bottom)
    for y in range(FRAME_H):
        t = y / max(1, FRAME_H - 1)
        color = tuple(int(top_rgb[i] * (1 - t) + bottom_rgb[i] * t) for i in range(3)) + (255,)
        draw.line((0, y, FRAME_W, y), fill=color)
    for _ in range(80):
        x = rng.randint(0, FRAME_W)
        y = rng.randint(0, FRAME_H)
        draw.point((x, y), fill=(255, 241, 191, rng.randint(18, 60)))
    return frame


def draw_rays(draw: ImageDraw.ImageDraw, center: tuple[int, int], colors: list[str], seed: int) -> None:
    rng = random.Random(seed)
    cx, cy = center
    for index in range(46):
        angle = (index / 46) * math.tau + rng.uniform(-0.045, 0.045)
        inner = rng.randint(26, 58)
        outer = rng.randint(360, 530)
        spread = rng.uniform(0.014, 0.04)
        points = [
            (cx + math.cos(angle - spread) * inner, cy + math.sin(angle - spread) * inner),
            (cx + math.cos(angle) * outer, cy + math.sin(angle) * outer),
            (cx + math.cos(angle + spread) * inner, cy + math.sin(angle + spread) * inner),
        ]
        draw.polygon(points, fill=rgba(rng.choice(colors), rng.randint(90, 190)))


def draw_speed_slashes(draw: ImageDraw.ImageDraw, colors: list[str], seed: int, tilt: float = -0.22) -> None:
    rng = random.Random(seed)
    for _ in range(70):
        x = rng.randint(-160, FRAME_W + 80)
        y = rng.randint(-40, FRAME_H + 40)
        length = rng.randint(90, 260)
        width = rng.randint(2, 8)
        color = rgba(rng.choice(colors), rng.randint(70, 185))
        draw.line((x, y, x + length, y + tilt * length), fill=color, width=width)


def draw_shards(draw: ImageDraw.ImageDraw, center: tuple[int, int], palette: list[str], seed: int) -> None:
    rng = random.Random(seed)
    cx, cy = center
    for _ in range(34):
        angle = rng.random() * math.tau
        dist = rng.randint(46, 260)
        x = cx + math.cos(angle) * dist
        y = cy + math.sin(angle) * dist
        size = rng.randint(10, 38)
        rot = angle + rng.uniform(-0.9, 0.9)
        pts = []
        for p in range(3):
            a = rot + p * (math.tau / 3)
            pts.append((x + math.cos(a) * size, y + math.sin(a) * size * 0.62))
        draw.polygon(pts, fill=rgba(rng.choice(palette), rng.randint(120, 230)), outline=rgba("#fff1bf", 90))


def draw_core(draw: ImageDraw.ImageDraw, center: tuple[int, int], outer: str, inner: str, seed: int) -> None:
    rng = random.Random(seed)
    cx, cy = center
    for radius, alpha in [(108, 58), (78, 96), (50, 150)]:
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=rgba(outer, alpha))
    draw.ellipse((cx - 30, cy - 30, cx + 30, cy + 30), fill=rgba(inner, 245), outline=rgba("#fff8e7", 220), width=5)
    for _ in range(12):
        angle = rng.random() * math.tau
        draw.line((cx, cy, cx + math.cos(angle) * 68, cy + math.sin(angle) * 68), fill=rgba("#fff8e7", 120), width=2)


def objection_frame() -> Image.Image:
    frame = base_frame(101, "#8f241a", "#250e0d")
    draw = ImageDraw.Draw(frame, "RGBA")
    center = (FRAME_W // 2, FRAME_H // 2)
    draw_rays(draw, center, ["#fff1bf", "#d8a83c", "#b43427"], 101)
    draw_speed_slashes(draw, ["#fff8e7", "#d8a83c", "#2a1210"], 102, -0.24)
    draw_shards(draw, center, ["#f5dfae", "#9d2f25", "#d8a83c"], 103)
    draw_core(draw, center, "#d8a83c", "#9d2f25", 104)
    return frame.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=3))


def penalty_frame() -> Image.Image:
    frame = base_frame(201, "#243e5a", "#111416")
    draw = ImageDraw.Draw(frame, "RGBA")
    center = (FRAME_W // 2, FRAME_H // 2)
    draw_rays(draw, center, ["#b8d4e8", "#5a83ad", "#111416"], 201)
    draw_speed_slashes(draw, ["#e5f2ff", "#5a83ad", "#111416"], 202, 0.18)
    for offset in (-120, -54, 32, 118):
        draw.line((center[0] + offset, 30, center[0] + offset * 0.2, FRAME_H - 28), fill=rgba("#e5f2ff", 148), width=4)
        draw.line((center[0] + offset + 12, 26, center[0] + offset * 0.2 + 6, FRAME_H - 30), fill=rgba("#0b0f13", 190), width=2)
    draw_shards(draw, center, ["#d9e9f8", "#406b91", "#1a242c"], 203)
    draw_core(draw, center, "#5a83ad", "#172537", 204)
    return frame.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=3))


def verdict_frame() -> Image.Image:
    frame = base_frame(301, "#b17c22", "#2b160b")
    draw = ImageDraw.Draw(frame, "RGBA")
    center = (FRAME_W // 2, FRAME_H // 2)
    draw_rays(draw, center, ["#fff8d8", "#f0c65b", "#9d2f25"], 301)
    draw_speed_slashes(draw, ["#fff8d8", "#f0c65b", "#4d2212"], 302, -0.08)
    for radius in (124, 88, 58):
        draw.ellipse((center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius), outline=rgba("#fff1bf", 150), width=5)
    draw_shards(draw, center, ["#fff1bf", "#d8a83c", "#7d2b23"], 303)
    draw_core(draw, center, "#fff1bf", "#d8a83c", 304)
    return frame.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=3))


def main() -> None:
    sheet = Image.new("RGBA", (FRAME_W * FRAMES, FRAME_H), (0, 0, 0, 0))
    for index, frame in enumerate((objection_frame(), penalty_frame(), verdict_frame())):
        sheet.alpha_composite(frame, (index * FRAME_W, 0))
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT_PATH)
    print(f"wrote {OUT_PATH} {sheet.size[0]}x{sheet.size[1]}")


if __name__ == "__main__":
    main()
