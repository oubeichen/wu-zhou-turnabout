#!/usr/bin/env python3
"""Generate per-evidence bitmap thumbnails for the browser game."""

from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "game" / "game-data.js"
OUT_PATH = ROOT / "game" / "assets" / "evidence-item-sheet-v2.png"

CELL_W = 180
CELL_H = 210
COLS = 7
ROWS = 5


PALETTES = [
    ("#5f1f1a", "#c99b3b", "#fff1bf"),
    ("#25483d", "#7aa88f", "#f3eddc"),
    ("#2f4059", "#9ab1ca", "#f4ead4"),
    ("#66421f", "#d39b4e", "#fff1bf"),
    ("#382f5f", "#b9a2d8", "#f7edff"),
]


def load_data() -> dict:
    raw = DATA_PATH.read_text(encoding="utf-8")
    match = re.search(r"window\.WUZHOU_GAME_DATA\s*=\s*(\{.*\})\s*;\s*$", raw, re.S)
    if not match:
        raise SystemExit(f"Cannot parse {DATA_PATH}")
    return json.loads(match.group(1))


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size, index=1 if bold else 0)
        except Exception:
            continue
    return ImageFont.load_default()


FONT_TITLE = font(20, True)
FONT_SMALL = font(13)
FONT_MARK = font(24, True)


def short_text(text: str, limit: int = 7) -> str:
    cleaned = re.sub(r"\s+", "", text or "")
    return cleaned[:limit]


def visual_kind(item: dict) -> str:
    name = item.get("name", "")
    if item.get("counterRisk"):
        return "risk"
    if "收益图" in name or "图" in name:
        return "map"
    if "札记" in name or item.get("trialOnly"):
        return "note"
    if "名册" in name or "签" in name:
        return "record"
    if "奏章" in name or "供词" in name:
        return "file"
    if "卷宗" in name:
        return "chapter"
    return "file"


def draw_folded_paper(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: str, outline: str) -> None:
    x1, y1, x2, y2 = box
    fold = 24
    draw.rounded_rectangle(box, radius=10, fill=fill, outline=outline, width=3)
    draw.polygon([(x2 - fold, y1), (x2, y1 + fold), (x2 - fold, y1 + fold)], fill="#e4d1aa", outline=outline)
    for y in range(y1 + 52, y2 - 28, 22):
        draw.line((x1 + 28, y, x2 - 34, y), fill="#7e684e", width=3)


def draw_record(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(74 * scale), int(100 * scale)
    draw_folded_paper(draw, (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2), "#f7ead0", "#4f3724")
    draw.rounded_rectangle((cx - w // 2 - 12, cy + h // 2 - 18, cx + w // 2 + 12, cy + h // 2 + 8), radius=6, fill=accent, outline="#fff1bf", width=2)


def draw_map(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(104 * scale), int(78 * scale)
    box = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    draw.rounded_rectangle(box, radius=8, fill="#e5d6b6", outline="#385846", width=3)
    for i in range(4):
        x = box[0] + 20 + i * int(22 * scale)
        draw.line((x, box[1] + 8, x - 12, box[3] - 8), fill="#77916f", width=2)
    draw.line((box[0] + 12, cy + 16, box[2] - 12, cy - 18), fill=accent, width=5)
    draw.ellipse((cx - 9, cy - 9, cx + 9, cy + 9), fill="#9d2f25", outline="#fff1bf", width=2)


def draw_note(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw.rounded_rectangle((cx - 44, cy - 58, cx + 44, cy + 58), radius=8, fill="#3f281f", outline=accent, width=4)
    for x in range(cx - 25, cx + 36, 18):
        draw.line((x, cy - 52, x, cy + 52), fill="#d8c08b", width=2)
    draw.line((cx - 34, cy - 18, cx + 34, cy + 18), fill="#fff1bf", width=4)
    draw.line((cx + 32, cy - 18, cx - 32, cy + 18), fill="#fff1bf", width=4)


def draw_seal(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    r = int(34 * scale)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill="#9d2f25", outline="#fff1bf", width=5)
    draw.text((cx, cy - 2), "印", fill="#fff1bf", font=FONT_MARK, anchor="mm")
    draw.line((cx - r - 24, cy + r + 12, cx + r + 24, cy + r + 12), fill=accent, width=5)


def draw_icon(draw: ImageDraw.ImageDraw, item: dict, case_index: int, evidence_index: int, box: tuple[int, int, int, int]) -> None:
    x1, y1, x2, y2 = box
    base, accent, paper = PALETTES[case_index % len(PALETTES)]
    kind = visual_kind(item)
    draw.rounded_rectangle((x1 + 8, y1 + 8, x2 - 8, y2 - 8), radius=18, fill=base, outline=accent, width=4)
    draw.rounded_rectangle((x1 + 18, y1 + 18, x2 - 18, y2 - 18), radius=14, outline="#fff1bf", width=1)
    cx, cy = (x1 + x2) // 2, y1 + 92
    if kind in {"record", "chapter", "file"}:
        draw_record(draw, (cx, cy), 1.0, accent)
    elif kind == "map":
        draw_map(draw, (cx, cy), 1.0, accent)
    elif kind == "note":
        draw_note(draw, (cx, cy), 1.0, accent)
    else:
        draw_seal(draw, (cx, cy), 1.0, accent)
    label = short_text(item.get("name", "证物"))
    draw.rounded_rectangle((x1 + 20, y2 - 68, x2 - 20, y2 - 22), radius=8, fill=paper, outline=accent, width=2)
    draw.text((cx, y2 - 47), label, fill="#2a2119", font=FONT_TITLE, anchor="mm")
    draw.text((x1 + 22, y1 + 22), f"{case_index + 1}-{evidence_index + 1}", fill="#fff8e7", font=FONT_SMALL)


def main() -> None:
    data = load_data()
    image = Image.new("RGBA", (COLS * CELL_W, ROWS * CELL_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for case_index, case in enumerate(data["cases"][:ROWS]):
        for evidence_index, item in enumerate(case.get("evidence", [])[:COLS]):
            x1 = evidence_index * CELL_W
            y1 = case_index * CELL_H
            draw_icon(draw, item, case_index, evidence_index, (x1, y1, x1 + CELL_W, y1 + CELL_H))
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUT_PATH)
    print(f"wrote {OUT_PATH} {image.size[0]}x{image.size[1]}")


if __name__ == "__main__":
    main()
