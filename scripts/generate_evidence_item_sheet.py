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
    if "收益图" in name or "图" in name:
        return "map"
    if "铜匦" in name:
        return "bronze_box"
    if "瓮" in name:
        return "jar"
    if "签" in name or "牌" in name:
        return "tally"
    if "名册" in name or "账册" in name or "赏赐簿" in name or "手册" in name:
        return "ledger"
    if "诏" in name or "令" in name or "奏章" in name or "联名折" in name:
        return "decree"
    if "供状" in name or "供词" in name:
        return "confession"
    if "檄文" in name or "榜文" in name:
        return "notice"
    if "札" in name or "笺" in name or "纸条" in name or "残页" in name:
        return "letter"
    if "札记" in name or item.get("trialOnly"):
        return "note"
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


def draw_decree(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(118 * scale), int(82 * scale)
    paper = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    draw.rounded_rectangle(paper, radius=10, fill="#f4dfaf", outline="#4f3724", width=3)
    draw.rectangle((paper[0] - 10, paper[1] + 6, paper[0] + 10, paper[3] - 6), fill=accent, outline="#fff1bf")
    draw.rectangle((paper[2] - 10, paper[1] + 6, paper[2] + 10, paper[3] - 6), fill=accent, outline="#fff1bf")
    for y in range(paper[1] + 20, paper[3] - 12, 18):
        draw.line((paper[0] + 24, y, paper[2] - 24, y), fill="#7e684e", width=3)
    draw.ellipse((cx + 24, cy + 12, cx + 50, cy + 38), fill="#9d2f25", outline="#fff1bf", width=2)


def draw_tally(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(56 * scale), int(116 * scale)
    box = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    draw.rounded_rectangle(box, radius=12, fill="#8a5930", outline="#fff1bf", width=3)
    draw.ellipse((cx - 12, box[1] + 13, cx + 12, box[1] + 37), fill="#2e241f", outline=accent, width=3)
    for y in range(box[1] + 50, box[3] - 12, 18):
        draw.line((box[0] + 12, y, box[2] - 12, y), fill="#e8c477", width=3)


def draw_ledger(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(92 * scale), int(112 * scale)
    draw.rounded_rectangle((cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2), radius=10, fill="#26392f", outline=accent, width=4)
    draw.rectangle((cx - w // 2 + 12, cy - h // 2, cx - w // 2 + 24, cy + h // 2), fill="#111b17")
    draw.rounded_rectangle((cx - 22, cy - 34, cx + 32, cy - 4), radius=5, fill="#f4dfaf", outline="#fff1bf", width=2)
    for y in range(cy + 10, cy + 42, 14):
        draw.line((cx - 22, y, cx + 28, y), fill="#b89456", width=3)


def draw_letter(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(106 * scale), int(76 * scale)
    box = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    draw.polygon([(box[0], box[1] + 8), (box[2] - 14, box[1]), (box[2], box[3] - 8), (box[0] + 14, box[3])], fill="#f5e5c4", outline="#4f3724")
    draw.line((box[0] + 10, cy, box[2] - 12, cy), fill="#7e684e", width=3)
    draw.line((box[0] + 26, cy - 16, box[2] - 28, cy - 20), fill=accent, width=4)
    draw.ellipse((cx + 22, cy + 12, cx + 44, cy + 34), fill="#9d2f25", outline="#fff1bf", width=2)


def draw_notice(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(98 * scale), int(106 * scale)
    box = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    draw.rectangle(box, fill="#f0dfbd", outline="#4f3724", width=3)
    draw.rectangle((box[0] - 10, box[1] + 8, box[0] + 8, box[3] - 8), fill="#7d2b23", outline="#fff1bf")
    draw.rectangle((box[2] - 8, box[1] + 8, box[2] + 10, box[3] - 8), fill="#7d2b23", outline="#fff1bf")
    draw.text((cx, cy - 22), "告", fill="#7d2b23", font=FONT_MARK, anchor="mm")
    for y in range(cy + 4, box[3] - 14, 16):
        draw.line((box[0] + 24, y, box[2] - 24, y), fill="#7e684e", width=3)


def draw_confession(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_folded_paper(draw, (cx - 42, cy - 54, cx + 42, cy + 54), "#f2dec0", "#4f3724")
    draw.line((cx - 30, cy - 12, cx + 24, cy - 18), fill="#2d211c", width=4)
    draw.line((cx - 28, cy + 10, cx + 20, cy + 18), fill="#2d211c", width=4)
    draw.ellipse((cx + 14, cy + 20, cx + 42, cy + 48), fill="#9d2f25", outline="#fff1bf", width=2)
    draw.text((cx + 28, cy + 34), "供", fill="#fff1bf", font=FONT_SMALL, anchor="mm")


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


def draw_bronze_box(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw.rounded_rectangle((cx - 54, cy - 30, cx + 54, cy + 48), radius=9, fill="#8b6a38", outline="#fff1bf", width=3)
    draw.polygon([(cx - 42, cy - 30), (cx, cy - 62), (cx + 42, cy - 30)], fill="#5c4124", outline="#fff1bf")
    draw.rectangle((cx - 10, cy - 44, cx + 10, cy - 10), fill="#221815", outline=accent, width=3)
    draw.line((cx - 44, cy + 2, cx + 44, cy + 2), fill="#d5b066", width=3)


def draw_jar(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw.ellipse((cx - 46, cy - 58, cx + 46, cy - 22), fill="#3a231b", outline="#fff1bf", width=3)
    draw.rounded_rectangle((cx - 38, cy - 36, cx + 38, cy + 54), radius=28, fill="#7b4a2a", outline="#fff1bf", width=3)
    draw.arc((cx - 42, cy - 64, cx + 42, cy - 16), 10, 170, fill="#e89b47", width=6)
    draw.line((cx - 28, cy - 18, cx + 26, cy + 30), fill=accent, width=5)
    draw.line((cx - 20, cy + 20, cx + 30, cy - 18), fill="#2b1712", width=4)


def draw_risk_badge(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int]) -> None:
    x1, y1, x2, _ = box
    badge = (x2 - 58, y1 + 20, x2 - 18, y1 + 60)
    draw.ellipse(badge, fill="#9d2f25", outline="#fff1bf", width=3)
    draw.text(((badge[0] + badge[2]) // 2, (badge[1] + badge[3]) // 2 + 1), "慎", fill="#fff1bf", font=FONT_SMALL, anchor="mm")


def draw_icon(draw: ImageDraw.ImageDraw, item: dict, case_index: int, evidence_index: int, box: tuple[int, int, int, int]) -> None:
    x1, y1, x2, y2 = box
    base, accent, paper = PALETTES[case_index % len(PALETTES)]
    kind = visual_kind(item)
    draw.rounded_rectangle((x1 + 8, y1 + 8, x2 - 8, y2 - 8), radius=18, fill=base, outline=accent, width=4)
    draw.rounded_rectangle((x1 + 18, y1 + 18, x2 - 18, y2 - 18), radius=14, outline="#fff1bf", width=1)
    cx, cy = (x1 + x2) // 2, y1 + 92
    if kind in {"record", "chapter", "file"}:
        draw_record(draw, (cx, cy), 1.0, accent)
    elif kind == "decree":
        draw_decree(draw, (cx, cy), 1.0, accent)
    elif kind == "tally":
        draw_tally(draw, (cx, cy), 1.0, accent)
    elif kind == "ledger":
        draw_ledger(draw, (cx, cy), 1.0, accent)
    elif kind == "letter":
        draw_letter(draw, (cx, cy), 1.0, accent)
    elif kind == "notice":
        draw_notice(draw, (cx, cy), 1.0, accent)
    elif kind == "confession":
        draw_confession(draw, (cx, cy), 1.0, accent)
    elif kind == "map":
        draw_map(draw, (cx, cy), 1.0, accent)
    elif kind == "note":
        draw_note(draw, (cx, cy), 1.0, accent)
    elif kind == "bronze_box":
        draw_bronze_box(draw, (cx, cy), 1.0, accent)
    elif kind == "jar":
        draw_jar(draw, (cx, cy), 1.0, accent)
    else:
        draw_seal(draw, (cx, cy), 1.0, accent)
    if item.get("counterRisk"):
        draw_risk_badge(draw, box)
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
