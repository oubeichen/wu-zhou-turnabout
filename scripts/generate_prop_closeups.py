#!/usr/bin/env python3
"""Generate bitmap close-up props used by investigation clue cards."""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "game" / "assets" / "prop-closeups-v1.png"

CELL_W = 390
CELL_H = 390
COLS = 3
ROWS = 2


def draw_shadow(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], strength: int = 46) -> None:
    x1, y1, x2, y2 = box
    for grow in range(18, 0, -3):
        alpha = int(strength * grow / 18)
        draw.rounded_rectangle(
            (x1 - grow // 2, y1 - grow // 3, x2 + grow // 2, y2 + grow),
            radius=18 + grow // 3,
            fill=(10, 7, 5, alpha),
        )


def texture(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], seed: str, light: bool = False) -> None:
    rng = random.Random(seed)
    x1, y1, x2, y2 = box
    for _ in range(90):
        x = rng.randint(x1 + 4, x2 - 5)
        y = rng.randint(y1 + 4, y2 - 5)
        length = rng.randint(8, 40)
        alpha = rng.randint(12, 42)
        color = (255, 238, 188, alpha) if light else (71, 44, 27, alpha)
        draw.line((x, y, min(x + length, x2 - 4), y + rng.randint(-2, 2)), fill=color, width=1)


def panel(draw: ImageDraw.ImageDraw, x: int, y: int, title_seed: str) -> tuple[int, int, int, int]:
    box = (x + 14, y + 14, x + CELL_W - 14, y + CELL_H - 14)
    draw.rectangle((x, y, x + CELL_W, y + CELL_H), fill="#17120f")
    draw.rounded_rectangle(box, radius=6, fill="#201611", outline="#7b5a2e", width=3)
    draw.rectangle((box[0] + 12, box[1] + 12, box[2] - 12, box[3] - 12), outline=(255, 232, 170, 26), width=2)
    texture(draw, box, f"panel-{title_seed}", True)
    return box


def paper(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], seed: str, fill: str = "#d9bf87") -> None:
    draw_shadow(draw, box, 32)
    draw.rounded_rectangle(box, radius=10, fill=fill, outline="#3c2a1d", width=3)
    texture(draw, box, seed)
    x1, y1, x2, y2 = box
    for y in range(y1 + 28, y2 - 18, 22):
        draw.line((x1 + 22, y, x2 - 20, y + random.Random(f"{seed}-{y}").randint(-2, 2)), fill=(70, 45, 31, 135), width=2)


def seal(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int = 15) -> None:
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill="#8b3025", outline="#f0d495", width=3)
    draw.rectangle((cx - r // 2, cy - r // 2, cx + r // 2, cy + r // 2), outline=(255, 242, 192, 120), width=1)


def desk(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    panel(draw, x, y, "desk")
    paper(draw, (x + 68, y + 88, x + 225, y + 150), "desk-stack-a", "#bda879")
    paper(draw, (x + 108, y + 112, x + 272, y + 182), "desk-stack-b", "#c7af7d")
    paper(draw, (x + 150, y + 134, x + 320, y + 212), "desk-stack-c", "#bba06d")
    draw_shadow(draw, (x + 64, y + 226, x + 340, y + 318), 36)
    draw.rounded_rectangle((x + 52, y + 214, x + 350, y + 314), radius=14, fill="#78261e", outline="#b8913f", width=4)
    draw.rectangle((x + 72, y + 236, x + 330, y + 255), fill=(255, 216, 146, 35))
    draw.line((x + 92, y + 276, x + 258, y + 300), fill="#c9a75b", width=4)
    seal(draw, x + 279, y + 248, 19)


def screen(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    panel(draw, x, y, "screen")
    frame = (x + 58, y + 54, x + 334, y + 334)
    draw_shadow(draw, frame, 38)
    draw.rounded_rectangle(frame, radius=10, fill="#5d4a2b", outline="#b8913f", width=5)
    for gx in range(frame[0] + 36, frame[2], 76):
        draw.line((gx, frame[1] + 22, gx, frame[3] - 22), fill=(206, 159, 76, 90), width=2)
    for gy in range(frame[1] + 68, frame[3], 72):
        draw.line((frame[0] + 24, gy, frame[2] - 24, gy), fill=(206, 159, 76, 90), width=2)
    draw.polygon(
        [(x + 206, y + 72), (x + 244, y + 100), (x + 290, y + 122), (x + 276, y + 312), (x + 244, y + 324), (x + 176, y + 236), (x + 188, y + 108)],
        fill=(18, 15, 14, 220),
    )
    draw.ellipse((x + 188, y + 68, x + 244, y + 126), fill=(12, 10, 9, 220))
    draw.line((x + 196, y + 58, x + 196, y + 326), fill=(22, 15, 12, 185), width=4)


def bamboo(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    panel(draw, x, y, "bamboo")
    for i, (dx, dy, rot) in enumerate([(50, 180, -6), (135, 167, 2), (222, 154, -10)]):
        box = (x + dx, y + dy, x + dx + 190, y + dy + 34)
        draw_shadow(draw, box, 20)
        draw.rounded_rectangle(box, radius=18, fill="#9d7f40", outline="#2e2419", width=3)
        for tick in range(box[0] + 48, box[2] - 20, 48):
            draw.line((tick, box[1] + 3, tick, box[3] - 3), fill=(48, 34, 22, 120), width=2)
    paper(draw, (x + 194, y + 118, x + 292, y + 214), "bamboo-slip", "#d8c38b")
    for offset in range(0, 72, 13):
        draw.line((x + 210 + offset, y + 134, x + 228 + offset // 2, y + 205), fill="#2f251b", width=2)
    draw.arc((x + 125, y + 215, x + 306, y + 330), 25, 158, fill="#9d6e2d", width=5)


def ink(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    panel(draw, x, y, "ink")
    paper(draw, (x + 62, y + 78, x + 312, y + 314), "ink-paper", "#bca77a")
    for blob in [(x + 154, y + 206, 42), (x + 210, y + 166, 50), (x + 228, y + 226, 31)]:
        cx, cy, r = blob
        draw.ellipse((cx - r, cy - r // 2, cx + r, cy + r // 2), fill=(8, 8, 7, 218))
    draw.line((x + 274, y + 92, x + 270, y + 296), fill="#91662d", width=18)
    draw.line((x + 274, y + 92, x + 270, y + 296), fill="#2b1d14", width=8)
    draw.polygon([(x + 270, y + 296), (x + 290, y + 324), (x + 251, y + 316)], fill="#19100c")


def petition(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    panel(draw, x, y, "petition")
    box = (x + 54, y + 108, x + 336, y + 288)
    draw_shadow(draw, box, 38)
    draw.rounded_rectangle(box, radius=16, fill="#d3bd88", outline="#3c2a1d", width=3)
    texture(draw, box, "petition-main")
    draw.ellipse((x + 40, y + 92, x + 86, y + 138), fill="#8b5f24", outline="#d3a64a", width=3)
    draw.ellipse((x + 304, y + 92, x + 350, y + 138), fill="#8b5f24", outline="#d3a64a", width=3)
    draw.rectangle((x + 95, y + 144, x + 292, y + 149), fill=(70, 45, 31, 115))
    draw.rectangle((x + 118, y + 232, x + 274, y + 238), fill=(70, 45, 31, 115))
    seal(draw, x + 197, y + 201, 33)


def bell(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    panel(draw, x, y, "bell")
    draw.line((x + 196, y + 34, x + 196, y + 86), fill="#8a6423", width=6)
    draw.arc((x + 168, y + 78, x + 224, y + 136), 180, 360, fill="#c79b3d", width=7)
    draw_shadow(draw, (x + 142, y + 118, x + 250, y + 290), 42)
    draw.rounded_rectangle((x + 146, y + 126, x + 246, y + 292), radius=48, fill="#987029", outline="#d8ad4c", width=4)
    draw.ellipse((x + 132, y + 116, x + 260, y + 174), fill="#a47a2c", outline="#d8ad4c", width=4)
    draw.ellipse((x + 96, y + 284, x + 296, y + 338), outline="#a5792b", width=5)
    for i in range(3):
        draw.arc((x + 220 + i * 18, y + 112 + i * 14, x + 314 + i * 18, y + 250 + i * 18), 290, 42, fill=(212, 171, 76, 150), width=4)


def main() -> None:
    image = Image.new("RGBA", (COLS * CELL_W, ROWS * CELL_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    drawers = [desk, screen, bamboo, ink, petition, bell]
    for index, drawer in enumerate(drawers):
        x = (index % COLS) * CELL_W
        y = (index // COLS) * CELL_H
        drawer(draw, x, y)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUT_PATH)
    print(f"wrote {OUT_PATH} {image.size[0]}x{image.size[1]}")


if __name__ == "__main__":
    main()
