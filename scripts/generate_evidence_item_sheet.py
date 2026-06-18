#!/usr/bin/env python3
"""Generate per-evidence bitmap thumbnails for the browser game."""

from __future__ import annotations

import json
import random
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "game" / "game-data.js"
OUT_PATH = ROOT / "game" / "assets" / "evidence-item-sheet-v3.png"

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


FONT_SMALL = font(13)
FONT_MARK = font(24, True)


def color_mix(a: str, b: str, ratio: float) -> tuple[int, int, int]:
    ratio = max(0.0, min(1.0, ratio))
    aa = tuple(int(a[i : i + 2], 16) for i in (1, 3, 5))
    bb = tuple(int(b[i : i + 2], 16) for i in (1, 3, 5))
    return tuple(int(aa[i] * (1 - ratio) + bb[i] * ratio) for i in range(3))


def draw_soft_shadow(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int = 14) -> None:
    x1, y1, x2, y2 = box
    for step in range(radius, 0, -3):
        alpha = int(28 * step / radius)
        draw.rounded_rectangle(
            (x1 - step // 2, y1 - step // 3, x2 + step // 2, y2 + step),
            radius=12 + step // 2,
            fill=(15, 11, 8, alpha),
        )


def draw_paper_texture(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], seed: str, alpha: int = 55) -> None:
    rng = random.Random(seed)
    x1, y1, x2, y2 = box
    for _ in range(42):
        x = rng.randint(x1 + 4, max(x1 + 4, x2 - 5))
        y = rng.randint(y1 + 4, max(y1 + 4, y2 - 5))
        length = rng.randint(6, 22)
        color = (124, 95, 58, rng.randint(15, alpha))
        draw.line((x, y, min(x + length, x2 - 4), y + rng.randint(-1, 1)), fill=color, width=1)


def draw_material_grain(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], seed: str, color: tuple[int, int, int], count: int = 34) -> None:
    rng = random.Random(seed)
    x1, y1, x2, y2 = box
    for _ in range(count):
        x = rng.randint(x1 + 3, max(x1 + 3, x2 - 5))
        y = rng.randint(y1 + 3, max(y1 + 3, y2 - 5))
        length = rng.randint(5, 20)
        alpha = rng.randint(22, 75)
        draw.line((x, y, min(x + length, x2 - 4), y + rng.randint(-2, 2)), fill=color + (alpha,), width=1)


def draw_handpainted_highlight(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], seed: str) -> None:
    rng = random.Random(seed)
    x1, y1, x2, y2 = box
    for _ in range(5):
        x = rng.randint(x1 + 8, max(x1 + 8, x2 - 22))
        y = rng.randint(y1 + 6, max(y1 + 6, y2 - 16))
        draw.arc((x, y, x + rng.randint(18, 42), y + rng.randint(10, 26)), 205, 330, fill=(255, 241, 191, rng.randint(34, 72)), width=2)


def ragged_paper_points(box: tuple[int, int, int, int], seed: str, jitter: int = 7) -> list[tuple[int, int]]:
    rng = random.Random(seed)
    x1, y1, x2, y2 = box
    return [
        (x1 + rng.randint(0, jitter), y1 + rng.randint(0, jitter)),
        (x2 - rng.randint(0, jitter), y1 + rng.randint(0, jitter)),
        (x2 - rng.randint(0, jitter), y2 - rng.randint(0, jitter)),
        (x1 + rng.randint(0, jitter), y2 - rng.randint(0, jitter)),
    ]


def draw_ragged_paper(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], seed: str, fill: str = "#f4dfaf", outline: str = "#4f3724") -> None:
    points = ragged_paper_points(box, seed)
    draw.polygon(points, fill=fill, outline=outline)
    draw_paper_texture(draw, box, seed, 48)
    draw_handpainted_highlight(draw, box, f"paper-hi-{seed}")


def draw_brush_text(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], seed: str, rows: int = 4) -> None:
    rng = random.Random(seed)
    x1, y1, x2, y2 = box
    for row in range(rows):
        y = y1 + 12 + row * max(12, (y2 - y1 - 22) // max(1, rows))
        start = x1 + rng.randint(7, 16)
        end = x2 - rng.randint(8, 20)
        color = (79, 55, 36, rng.randint(130, 190))
        draw.line((start, y, end, y + rng.randint(-2, 2)), fill=color, width=rng.randint(2, 3))


def draw_stamp(draw: ImageDraw.ImageDraw, center: tuple[int, int], text: str = "印", scale: float = 1.0) -> None:
    cx, cy = center
    r = int(13 * scale)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill="#9d2f25", outline="#fff1bf", width=max(1, int(2 * scale)))
    draw.text((cx, cy + 1), text[:1], fill="#fff1bf", font=FONT_SMALL, anchor="mm")


def draw_thread(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], color: str = "#d9b45c") -> None:
    if len(points) < 2:
        return
    draw.line(points, fill=color, width=4, joint="curve")
    for x, y in points:
        draw.ellipse((x - 4, y - 4, x + 4, y + 4), fill="#9d2f25", outline="#fff1bf", width=1)


def visual_kind(item: dict) -> str:
    item_id = item.get("id", "")
    name = item.get("name", "")
    specific = {
        "case-empress-seat-ev-3": "sealed_roster",
        "case-empress-seat-ev-4": "petition_stack",
        "case-empress-seat-ev-5": "ink_edict",
        "case-crown-shadow-ev-1": "old_ledger",
        "case-crown-shadow-ev-3": "sealed_roster",
        "case-crown-shadow-ev-4": "succession_record",
        "case-crown-shadow-ev-5": "folded_will",
        "case-rebellion-box-ev-1": "bronze_letter",
        "case-rebellion-box-ev-2": "torn_manifesto",
        "case-rebellion-box-ev-3": "street_notice",
        "case-rebellion-box-ev-4": "interrogation_roster",
        "case-rebellion-box-ev-5": "arrest_warrant",
        "case-urn-ev-1": "scorched_jar_mouth",
        "case-urn-ev-2": "confession_brush",
        "case-urn-ev-3": "confession_copy",
        "case-urn-ev-4": "interrogation_manual",
        "case-urn-ev-5": "rescue_note",
        "case-half-hour-coup-ev-2": "reward_ledger",
        "case-half-hour-coup-ev-3": "charge_strip",
        "case-half-hour-coup-ev-4": "shift_order",
    }
    if item_id in specific:
        return specific[item_id]
    if item_id.endswith("-ev-pattern"):
        return "evidence_board"
    if item_id.endswith("-ev-court-note"):
        return "court_notes"
    if "收益图" in name or "图" in name:
        return "evidence_board"
    if "簪" in name or "钗" in name:
        return "hairpin"
    if "铜匦" in name:
        return "bronze_box"
    if "瓮" in name:
        return "jar"
    if "通行" in name or "门籍" in name or "门禁" in name:
        return "gate_pass"
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
    if "墨" in name or "笔" in name:
        return "inkstone"
    if "布" in name or "帛" in name:
        return "cloth"
    return "file"


def draw_folded_paper(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: str, outline: str) -> None:
    x1, y1, x2, y2 = box
    fold = 24
    draw_soft_shadow(draw, (x1 + 3, y1 + 5, x2 + 3, y2 + 7), 10)
    draw.rounded_rectangle(box, radius=10, fill=fill, outline=outline, width=3)
    draw.polygon([(x2 - fold, y1), (x2, y1 + fold), (x2 - fold, y1 + fold)], fill="#e4d1aa", outline=outline)
    draw_paper_texture(draw, box, f"paper-{box}", 40)
    for y in range(y1 + 52, y2 - 28, 22):
        draw.line((x1 + 28, y, x2 - 34, y), fill="#7e684e", width=3)


def draw_record(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    board = (cx - int(56 * scale), cy - int(58 * scale), cx + int(56 * scale), cy + int(58 * scale))
    draw_soft_shadow(draw, board, 16)
    draw.rounded_rectangle(board, radius=8, fill="#3f281f", outline=accent, width=4)
    for dx, dy, rot in [(-28, -18, -7), (22, -20, 5), (-5, 18, 2)]:
        paper = (cx + dx - 24, cy + dy - 19, cx + dx + 24, cy + dy + 19)
        draw.rounded_rectangle(paper, radius=4, fill="#f5e1b9", outline="#4f3724", width=2)
        draw_brush_text(draw, (paper[0] + 5, paper[1] + 4, paper[2] - 5, paper[3] - 3), f"record-{dx}-{dy}", 2)
    draw_thread(draw, [(cx - 30, cy - 20), (cx - 5, cy + 16), (cx + 28, cy - 20)])


def draw_decree(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(124 * scale), int(86 * scale)
    paper = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    draw_soft_shadow(draw, paper, 16)
    draw.rounded_rectangle(paper, radius=10, fill="#f4dfaf", outline="#4f3724", width=3)
    draw.rectangle((paper[0] - 10, paper[1] + 6, paper[0] + 10, paper[3] - 6), fill=accent, outline="#fff1bf")
    draw.rectangle((paper[2] - 10, paper[1] + 6, paper[2] + 10, paper[3] - 6), fill=accent, outline="#fff1bf")
    draw_paper_texture(draw, paper, f"decree-{center}", 48)
    draw_brush_text(draw, (paper[0] + 24, paper[1] + 16, paper[2] - 24, paper[3] - 14), f"decree-lines-{center}", 4)
    draw_stamp(draw, (cx + 36, cy + 24), "诏", 1.1)
    draw.line((cx - 34, cy - 24, cx + 22, cy + 20), fill="#2f2119", width=2)


def draw_tally(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(58 * scale), int(122 * scale)
    box = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    draw_soft_shadow(draw, box, 14)
    draw.rounded_rectangle(box, radius=12, fill="#8a5930", outline="#fff1bf", width=3)
    for x in range(box[0] + 10, box[2] - 6, 12):
        draw.line((x, box[1] + 10, x - 8, box[3] - 10), fill=(255, 241, 191, 38), width=2)
    draw.ellipse((cx - 12, box[1] + 13, cx + 12, box[1] + 37), fill="#2e241f", outline=accent, width=3)
    draw.arc((cx - 20, box[1] + 6, cx + 20, box[1] + 44), 210, 330, fill="#d8bd72", width=3)
    for y in range(box[1] + 50, box[3] - 12, 18):
        draw.line((box[0] + 12, y, box[2] - 12, y), fill="#e8c477", width=3)


def draw_ledger(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(92 * scale), int(112 * scale)
    draw_soft_shadow(draw, (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2), 16)
    draw.rounded_rectangle((cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2), radius=10, fill="#26392f", outline=accent, width=4)
    draw.rectangle((cx - w // 2 + 12, cy - h // 2, cx - w // 2 + 24, cy + h // 2), fill="#111b17")
    draw.rounded_rectangle((cx - 22, cy - 34, cx + 32, cy - 4), radius=5, fill="#f4dfaf", outline="#fff1bf", width=2)
    for y in range(cy + 10, cy + 42, 14):
        draw.line((cx - 22, y, cx + 28, y), fill="#b89456", width=3)


def draw_letter(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(106 * scale), int(76 * scale)
    box = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    draw_soft_shadow(draw, box, 13)
    draw.polygon([(box[0], box[1] + 8), (box[2] - 14, box[1]), (box[2], box[3] - 8), (box[0] + 14, box[3])], fill="#f5e5c4", outline="#4f3724")
    draw_paper_texture(draw, box, f"letter-{center}", 45)
    draw.line((box[0] + 10, cy, box[2] - 12, cy), fill="#7e684e", width=3)
    draw.line((box[0] + 26, cy - 16, box[2] - 28, cy - 20), fill=accent, width=4)
    draw_stamp(draw, (cx + 34, cy + 24), "封", 1.0)


def draw_notice(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(98 * scale), int(106 * scale)
    box = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    draw_soft_shadow(draw, box, 15)
    draw.rectangle(box, fill="#f0dfbd", outline="#4f3724", width=3)
    draw.rectangle((box[0] - 10, box[1] + 8, box[0] + 8, box[3] - 8), fill="#7d2b23", outline="#fff1bf")
    draw.rectangle((box[2] - 8, box[1] + 8, box[2] + 10, box[3] - 8), fill="#7d2b23", outline="#fff1bf")
    draw.text((cx, cy - 22), "告", fill="#7d2b23", font=FONT_MARK, anchor="mm")
    for y in range(cy + 4, box[3] - 14, 16):
        draw.line((box[0] + 24, y, box[2] - 24, y), fill="#7e684e", width=3)


def draw_confession(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_folded_paper(draw, (cx - 47, cy - 55, cx + 39, cy + 55), "#f2dec0", "#4f3724")
    draw.line((cx + 34, cy - 42, cx + 54, cy + 40), fill="#3a2219", width=7)
    draw.polygon([(cx + 50, cy + 39), (cx + 63, cy + 55), (cx + 42, cy + 54)], fill="#2f2119")
    draw.line((cx - 30, cy - 12, cx + 24, cy - 18), fill="#2d211c", width=4)
    draw.line((cx - 28, cy + 10, cx + 20, cy + 18), fill="#2d211c", width=4)
    draw_stamp(draw, (cx + 24, cy + 34), "供", 1.0)


def draw_map(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    w, h = int(104 * scale), int(78 * scale)
    box = (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2)
    draw_soft_shadow(draw, box, 13)
    draw.rounded_rectangle(box, radius=8, fill="#e5d6b6", outline="#385846", width=3)
    for i in range(4):
        x = box[0] + 20 + i * int(22 * scale)
        draw.line((x, box[1] + 8, x - 12, box[3] - 8), fill="#77916f", width=2)
    route = [(box[0] + 14, cy + 18), (cx - 8, cy + 4), (cx + 14, cy - 12), (box[2] - 15, cy - 20)]
    draw.line(route, fill=accent, width=5)
    for point in route[1:3]:
        draw_stamp(draw, point, "点", 0.72)


def draw_note(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_soft_shadow(draw, (cx - 44, cy - 58, cx + 44, cy + 58), 14)
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
    draw_soft_shadow(draw, (cx - 58, cy - 62, cx + 58, cy + 52), 16)
    draw.rounded_rectangle((cx - 54, cy - 30, cx + 54, cy + 48), radius=9, fill="#8b6a38", outline="#fff1bf", width=3)
    draw.polygon([(cx - 42, cy - 30), (cx, cy - 62), (cx + 42, cy - 30)], fill="#5c4124", outline="#fff1bf")
    draw_material_grain(draw, (cx - 50, cy - 57, cx + 50, cy + 45), f"bronze-grain-{center}", (255, 217, 139), 54)
    draw_handpainted_highlight(draw, (cx - 48, cy - 54, cx + 48, cy + 42), f"bronze-hi-{center}")
    for px, py in ((cx - 42, cy - 18), (cx + 42, cy - 18), (cx - 42, cy + 36), (cx + 42, cy + 36)):
        draw.ellipse((px - 4, py - 4, px + 4, py + 4), fill="#d0a05a", outline="#3d2418")
    draw.rectangle((cx - 10, cy - 44, cx + 10, cy - 10), fill="#221815", outline=accent, width=3)
    draw.line((cx - 7, cy - 36, cx + 7, cy - 19), fill="#d8bd72", width=2)
    draw.line((cx - 44, cy + 2, cx + 44, cy + 2), fill="#d5b066", width=3)
    draw_letter(draw, (cx + 40, cy - 30), 0.42, accent)


def draw_jar(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_soft_shadow(draw, (cx - 48, cy - 58, cx + 48, cy + 58), 16)
    draw.ellipse((cx - 46, cy - 58, cx + 46, cy - 22), fill="#3a231b", outline="#fff1bf", width=3)
    draw.rounded_rectangle((cx - 38, cy - 36, cx + 38, cy + 54), radius=28, fill="#7b4a2a", outline="#fff1bf", width=3)
    draw_material_grain(draw, (cx - 36, cy - 35, cx + 36, cy + 52), f"jar-grain-{center}", (255, 191, 112), 48)
    draw.arc((cx - 42, cy - 64, cx + 42, cy - 16), 10, 170, fill="#e89b47", width=6)
    draw.line((cx - 28, cy - 18, cx + 26, cy + 30), fill=accent, width=5)
    draw.line((cx - 20, cy + 20, cx + 30, cy - 18), fill="#2b1712", width=4)
    for dx, dy in [(-22, -30), (12, -26), (28, 4), (-6, 22)]:
        draw.ellipse((cx + dx - 9, cy + dy - 6, cx + dx + 9, cy + dy + 7), fill=(28, 18, 14, 90))
    for i in range(3):
        draw.arc((cx + 30 + i * 8, cy - 50 - i * 5, cx + 66 + i * 8, cy + 4 + i * 2), 95, 168, fill=(255, 206, 126, 90), width=2)


def draw_hairpin(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_soft_shadow(draw, (cx - 60, cy - 42, cx + 60, cy + 50), 14)
    draw.line((cx - 48, cy + 30, cx + 34, cy - 34), fill="#f1d889", width=int(8 * scale))
    draw.line((cx - 40, cy + 39, cx + 42, cy - 24), fill="#9d6d2e", width=int(3 * scale))
    draw.ellipse((cx + 20, cy - 50, cx + 58, cy - 12), fill=accent, outline="#fff1bf", width=3)
    draw.ellipse((cx + 30, cy - 40, cx + 48, cy - 22), fill="#fff1bf", outline="#7d2b23", width=2)
    ribbon = [(cx - 18, cy - 2), (cx - 52, cy + 3), (cx - 28, cy + 20), (cx - 48, cy + 41), (cx - 8, cy + 19)]
    draw.polygon(ribbon, fill="#7d2b23", outline="#fff1bf")
    draw.line((cx - 12, cy + 4, cx + 18, cy + 30), fill="#d9b45c", width=3)


def draw_gate_pass(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    tablet = (cx - 42, cy - 58, cx + 42, cy + 58)
    draw_soft_shadow(draw, tablet, 16)
    draw.rounded_rectangle(tablet, radius=10, fill="#6d4427", outline="#fff1bf", width=3)
    draw.ellipse((cx - 11, cy - 47, cx + 11, cy - 25), fill="#1f1714", outline=accent, width=3)
    draw.arc((cx - 22, cy - 54, cx + 22, cy - 20), 200, 340, fill="#d9b45c", width=3)
    for y in range(cy - 10, cy + 42, 18):
        draw.line((cx - 24, y, cx + 24, y), fill="#f4dfaf", width=3)
    draw_letter(draw, (cx + 42, cy + 25), 0.34, accent)


def draw_inkstone(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_soft_shadow(draw, (cx - 58, cy - 36, cx + 58, cy + 46), 14)
    draw.rounded_rectangle((cx - 54, cy - 24, cx + 54, cy + 42), radius=18, fill="#211c1b", outline=accent, width=4)
    draw.ellipse((cx - 30, cy - 11, cx + 20, cy + 27), fill="#312726", outline="#675146", width=2)
    draw.line((cx - 44, cy + 42, cx + 50, cy - 54), fill="#6b3a1f", width=8)
    draw.line((cx - 37, cy + 35, cx + 56, cy - 62), fill="#f0d083", width=3)
    draw.polygon([(cx + 48, cy - 56), (cx + 66, cy - 72), (cx + 58, cy - 45)], fill="#201715", outline="#fff1bf")
    for dx in (-20, -6, 8):
        draw.ellipse((cx + dx, cy + 2, cx + dx + 7, cy + 9), fill=(15, 12, 11, 160))


def draw_cloth(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_soft_shadow(draw, (cx - 57, cy - 44, cx + 58, cy + 48), 14)
    cloth = [(cx - 54, cy - 22), (cx - 18, cy - 44), (cx + 55, cy - 30), (cx + 40, cy + 36), (cx - 32, cy + 48), (cx - 58, cy + 12)]
    draw.polygon(cloth, fill="#e8dfcb", outline=accent)
    for offset in (-30, -10, 10, 30):
        draw.line((cx + offset, cy - 31, cx + offset - 18, cy + 38), fill=(96, 74, 54, 90), width=2)
    draw.line((cx - 46, cy - 8, cx + 40, cy + 22), fill="#7d2b23", width=5)
    draw.line((cx - 28, cy + 19, cx + 28, cy - 17), fill="#9d2f25", width=3)
    draw_stamp(draw, (cx + 26, cy + 22), "封", 0.84)


def draw_sealed_roster(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_ledger(draw, (cx - 16, cy + 2), 0.82, accent)
    ribbon = [(cx - 54, cy - 54), (cx - 26, cy - 66), (cx + 42, cy + 46), (cx + 18, cy + 56)]
    draw.polygon(ribbon, fill="#8e3029", outline="#fff1bf")
    draw_stamp(draw, (cx + 34, cy + 38), "封", 1.0)
    draw_thread(draw, [(cx - 46, cy - 26), (cx - 8, cy + 8), (cx + 38, cy - 24)], accent)


def draw_petition_stack(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    for offset, tilt in [(-22, 8), (0, -2), (20, 10)]:
        paper = (cx - 54 + offset, cy - 44 + tilt, cx + 42 + offset, cy + 42 + tilt)
        draw_ragged_paper(draw, paper, f"petition-paper-{offset}", "#f4dfaf", "#4f3724")
        draw_brush_text(draw, (paper[0] + 14, paper[1] + 14, paper[2] - 12, paper[3] - 12), f"petition-{offset}", 3)
    draw_thread(draw, [(cx - 42, cy - 28), (cx, cy + 8), (cx + 44, cy - 30)], accent)
    draw.line((cx - 52, cy + 50, cx + 50, cy - 45), fill=(65, 32, 18, 160), width=2)
    draw_stamp(draw, (cx + 44, cy + 34), "臣", 0.92)


def draw_ink_edict(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_decree(draw, (cx - 2, cy), 0.9, accent)
    ink = [(cx - 48, cy - 16), (cx - 5, cy - 30), (cx + 36, cy - 20), (cx + 50, cy + 8), (cx + 8, cy + 4)]
    draw.polygon(ink, fill=(24, 19, 17, 210))
    for dx, dy, r in [(-20, -30, 7), (18, -12, 9), (34, 4, 5)]:
        draw.ellipse((cx + dx - r, cy + dy - r, cx + dx + r, cy + dy + r), fill=(16, 13, 12, 230))
    draw.line((cx - 45, cy + 44, cx + 52, cy - 46), fill="#422111", width=6)


def draw_evidence_board(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    board = (cx - 58, cy - 54, cx + 58, cy + 54)
    draw_soft_shadow(draw, board, 15)
    draw.rounded_rectangle(board, radius=10, fill="#31261f", outline=accent, width=4)
    draw_material_grain(draw, board, f"board-grain-{center}", (214, 172, 100), 62)
    cards = [(cx - 46, cy - 38, cx - 8, cy - 12), (cx + 11, cy - 38, cx + 49, cy - 12), (cx - 18, cy + 14, cx + 24, cy + 42)]
    pins = []
    for index, card in enumerate(cards):
        draw_ragged_paper(draw, card, f"board-card-{index}", "#f3dfb5", "#fff1bf")
        draw_brush_text(draw, (card[0] + 5, card[1] + 5, card[2] - 5, card[3] - 5), f"board-{index}", 2)
        pins.append(((card[0] + card[2]) // 2, card[1] + 8))
    pins.append((cx + 34, cy + 28))
    draw_thread(draw, [pins[0], pins[2], pins[1], pins[3]], "#c63c32")
    draw.line((cx - 48, cy + 47, cx + 50, cy - 45), fill=(255, 241, 191, 42), width=2)
    for point in pins:
        draw_stamp(draw, point, "点", 0.56)


def draw_court_notes(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_note(draw, (cx - 16, cy), 0.82, accent)
    slip = (cx + 10, cy - 44, cx + 58, cy + 34)
    draw.rounded_rectangle(slip, radius=7, fill="#f2dfbd", outline="#4f3724", width=2)
    draw_brush_text(draw, (slip[0] + 7, slip[1] + 8, slip[2] - 7, slip[3] - 8), "court-note", 4)
    draw.line((cx - 42, cy + 42, cx + 52, cy - 46), fill="#fff1bf", width=4)


def draw_succession_record(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_decree(draw, (cx - 10, cy - 4), 0.72, accent)
    bed = (cx - 48, cy + 12, cx + 58, cy + 48)
    draw.rounded_rectangle(bed, radius=9, fill="#5b2f27", outline="#fff1bf", width=3)
    draw.rectangle((cx - 42, cy - 10, cx + 46, cy + 18), fill="#e8d7b5", outline="#4f3724", width=2)
    draw.ellipse((cx - 50, cy - 5, cx - 18, cy + 25), fill="#d0b680", outline="#fff1bf", width=2)
    draw.line((cx + 4, cy - 38, cx + 44, cy + 24), fill="#2c1c15", width=4)


def draw_folded_will(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_folded_paper(draw, (cx - 48, cy - 54, cx + 48, cy + 54), "#f0dcb3", "#4f3724")
    draw.polygon([(cx - 50, cy - 54), (cx - 20, cy - 64), (cx - 24, cy + 50), (cx - 52, cy + 44)], fill="#b59d77", outline="#fff1bf")
    draw.line((cx - 40, cy - 34, cx + 42, cy + 34), fill="#2d211c", width=5)
    draw_stamp(draw, (cx + 34, cy + 34), "诏", 0.9)


def draw_bronze_letter(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_bronze_box(draw, (cx - 8, cy + 8), 0.88, accent)
    draw_letter(draw, (cx + 42, cy - 38), 0.55, accent)
    draw_stamp(draw, (cx + 54, cy - 6), "密", 0.74)


def draw_torn_manifesto(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    left = [(cx - 58, cy - 46), (cx - 10, cy - 54), (cx - 21, cy + 52), (cx - 64, cy + 42)]
    right = [(cx - 4, cy - 48), (cx + 56, cy - 42), (cx + 46, cy + 48), (cx - 12, cy + 56)]
    for index, poly in enumerate([left, right]):
        draw.polygon(poly, fill="#edd9b6", outline="#4f3724")
        bounds = (min(x for x, _ in poly) + 8, min(y for _, y in poly) + 12, max(x for x, _ in poly) - 8, max(y for _, y in poly) - 12)
        draw_paper_texture(draw, bounds, f"manifesto-paper-{index}", 58)
        draw_handpainted_highlight(draw, bounds, f"manifesto-hi-{index}")
        draw_brush_text(draw, bounds, f"manifesto-{index}", 4)
    draw.line((cx - 6, cy - 48, cx - 18, cy + 50), fill="#7d2b23", width=4)
    draw.line((cx - 1, cy - 45, cx - 13, cy + 47), fill=(255, 241, 191, 75), width=1)
    draw_stamp(draw, (cx + 36, cy + 30), "檄", 0.88)


def draw_street_notice(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw.rectangle((cx - 58, cy - 48, cx + 58, cy + 48), fill="#44241e", outline="#fff1bf", width=3)
    draw_material_grain(draw, (cx - 58, cy - 48, cx + 58, cy + 48), f"notice-board-{center}", (219, 168, 93), 38)
    draw_notice(draw, (cx, cy - 2), 0.72, accent)
    draw.line((cx - 54, cy + 50, cx - 54, cy + 68), fill="#2b1712", width=7)
    draw.line((cx + 54, cy + 50, cx + 54, cy + 68), fill="#2b1712", width=7)


def draw_interrogation_roster(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_ledger(draw, (cx - 14, cy), 0.84, accent)
    for offset in (-30, 2, 34):
        strip = (cx + offset, cy - 46, cx + offset + 18, cy + 40)
        draw.rectangle(strip, fill=(24, 17, 14, 170), outline="#fff1bf")
        draw_material_grain(draw, strip, f"roster-bar-{offset}", (255, 241, 191), 12)
    draw_letter(draw, (cx + 36, cy - 30), 0.38, accent)
    draw_stamp(draw, (cx + 42, cy + 34), "审", 0.86)


def draw_arrest_warrant(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_decree(draw, (cx, cy), 0.82, accent)
    draw.line((cx - 44, cy - 42, cx + 42, cy + 40), fill="#7d2b23", width=5)
    draw.line((cx - 48, cy + 42, cx + 46, cy - 40), fill="#7d2b23", width=3)
    draw_stamp(draw, (cx + 38, cy + 28), "捕", 0.9)


def draw_scorched_jar_mouth(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_soft_shadow(draw, (cx - 58, cy - 50, cx + 58, cy + 50), 16)
    draw.ellipse((cx - 56, cy - 48, cx + 56, cy + 38), fill="#8d512e", outline="#fff1bf", width=4)
    draw.ellipse((cx - 42, cy - 34, cx + 42, cy + 18), fill="#211512", outline="#e89b47", width=5)
    draw_material_grain(draw, (cx - 52, cy - 45, cx + 52, cy + 35), f"scorch-grain-{center}", (255, 184, 88), 54)
    for angle, length in [(-44, 44), (-17, 56), (11, 48), (37, 38)]:
        draw.line((cx, cy - 10, cx + angle, cy - 10 + length), fill="#201310", width=5)
    for dx, dy, r in [(-24, -15, 9), (18, -20, 11), (34, 8, 8), (-8, 18, 7)]:
        draw.ellipse((cx + dx - r, cy + dy - r, cx + dx + r, cy + dy + r), fill=(16, 11, 9, 125))
    for dx in (-34, -12, 18, 40):
        draw.arc((cx + dx - 10, cy - 62, cx + dx + 18, cy - 20), 80, 160, fill=(255, 205, 122, 115), width=3)


def draw_confession_brush(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_confession(draw, (cx - 6, cy), 0.92, accent)
    inkstone = (cx - 55, cy + 22, cx - 12, cy + 48)
    draw.rounded_rectangle(inkstone, radius=10, fill="#211c1b", outline=accent, width=2)
    draw.ellipse((cx - 48, cy + 27, cx - 24, cy + 43), fill="#312726", outline="#675146", width=1)
    draw.line((cx - 44, cy + 42, cx + 58, cy - 56), fill="#5c2d19", width=8)
    draw.line((cx - 38, cy + 36, cx + 64, cy - 62), fill="#f0d083", width=3)
    draw.polygon([(cx + 58, cy - 58), (cx + 72, cy - 76), (cx + 69, cy - 50)], fill="#171211", outline="#fff1bf")
    for dx, dy in [(-26, 26), (2, 18), (28, -10)]:
        draw.ellipse((cx + dx - 4, cy + dy - 4, cx + dx + 4, cy + dy + 4), fill=(18, 14, 13, 150))


def draw_interrogation_manual(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_ledger(draw, (cx - 8, cy), 0.92, accent)
    draw.rectangle((cx - 48, cy - 42, cx + 38, cy + 42), outline="#9d2f25", width=4)
    draw.line((cx - 44, cy - 38, cx + 34, cy + 38), fill="#9d2f25", width=4)
    draw.line((cx - 36, cy + 34, cx + 42, cy - 34), fill="#9d2f25", width=3)


def draw_rescue_note(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_letter(draw, (cx - 12, cy), 0.94, accent)
    draw.line((cx - 50, cy + 44, cx + 56, cy - 42), fill="#7d2b23", width=4)
    draw_stamp(draw, (cx + 40, cy + 28), "急", 0.92)
    draw_thread(draw, [(cx - 42, cy - 22), (cx + 4, cy + 10), (cx + 46, cy - 24)], accent)


def draw_reward_ledger(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_ledger(draw, (cx - 12, cy), 0.86, accent)
    for i, offset in enumerate((18, 34, 50)):
        draw.ellipse((cx + offset - 12, cy + 20 - i * 18, cx + offset + 12, cy + 44 - i * 18), fill="#d2a24c", outline="#fff1bf", width=2)
        draw.text((cx + offset, cy + 32 - i * 18), "赏", fill="#4f3724", font=FONT_SMALL, anchor="mm")


def draw_charge_strip(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    for offset, width in [(-24, 94), (24, 70)]:
        strip = (cx - width // 2 + offset, cy - 22 + offset // 6, cx + width // 2 + offset, cy + 22 + offset // 6)
        draw.rounded_rectangle(strip, radius=6, fill="#f0dfbd", outline="#4f3724", width=2)
        draw_brush_text(draw, (strip[0] + 10, strip[1] + 9, strip[2] - 10, strip[3] - 8), f"charge-{offset}", 2)
    draw.line((cx - 60, cy - 38, cx + 58, cy + 36), fill="#7d2b23", width=4)
    draw_stamp(draw, (cx + 42, cy + 30), "罪", 0.92)


def draw_shift_order(draw: ImageDraw.ImageDraw, center: tuple[int, int], scale: float, accent: str) -> None:
    cx, cy = center
    draw_decree(draw, (cx - 14, cy - 4), 0.7, accent)
    for x in (cx + 18, cx + 38, cx + 58):
        draw.rectangle((x - 8, cy - 44, x + 8, cy + 44), fill="#53311d", outline="#fff1bf")
        draw.polygon([(x - 8, cy - 44), (x, cy - 62), (x + 8, cy - 44)], fill="#9d2f25", outline="#fff1bf")
    draw_thread(draw, [(cx - 38, cy + 22), (cx + 4, cy - 6), (cx + 48, cy + 22)], "#c63c32")


def draw_risk_badge(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int]) -> None:
    x1, y1, x2, _ = box
    badge = (x2 - 58, y1 + 20, x2 - 18, y1 + 60)
    draw.ellipse(badge, fill="#9d2f25", outline="#fff1bf", width=3)
    cx, cy = (badge[0] + badge[2]) // 2, (badge[1] + badge[3]) // 2
    draw.line((cx - 9, cy - 8, cx + 9, cy + 8), fill="#fff1bf", width=3)
    draw.line((cx + 9, cy - 8, cx - 9, cy + 8), fill="#fff1bf", width=3)


def draw_icon(draw: ImageDraw.ImageDraw, item: dict, case_index: int, evidence_index: int, box: tuple[int, int, int, int]) -> None:
    x1, y1, x2, y2 = box
    base, accent, paper = PALETTES[case_index % len(PALETTES)]
    kind = visual_kind(item)
    card = (x1 + 8, y1 + 8, x2 - 8, y2 - 8)
    draw.rounded_rectangle(card, radius=18, fill=base, outline=accent, width=4)
    for yy in range(card[1] + 8, card[3] - 8, 8):
        ratio = (yy - card[1]) / max(1, card[3] - card[1])
        line = color_mix(base, "#1f1714", ratio * 0.25)
        draw.line((card[0] + 10, yy, card[2] - 10, yy), fill=line + (45,), width=1)
    draw.rounded_rectangle((x1 + 18, y1 + 18, x2 - 18, y2 - 18), radius=14, outline="#fff1bf", width=1)
    cx, cy = (x1 + x2) // 2, y1 + 99
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
    elif kind == "hairpin":
        draw_hairpin(draw, (cx, cy), 1.0, accent)
    elif kind == "gate_pass":
        draw_gate_pass(draw, (cx, cy), 1.0, accent)
    elif kind == "inkstone":
        draw_inkstone(draw, (cx, cy), 1.0, accent)
    elif kind == "cloth":
        draw_cloth(draw, (cx, cy), 1.0, accent)
    elif kind == "sealed_roster":
        draw_sealed_roster(draw, (cx, cy), 1.0, accent)
    elif kind == "petition_stack":
        draw_petition_stack(draw, (cx, cy), 1.0, accent)
    elif kind == "ink_edict":
        draw_ink_edict(draw, (cx, cy), 1.0, accent)
    elif kind == "evidence_board":
        draw_evidence_board(draw, (cx, cy), 1.0, accent)
    elif kind == "court_notes":
        draw_court_notes(draw, (cx, cy), 1.0, accent)
    elif kind == "old_ledger":
        draw_ledger(draw, (cx, cy), 1.08, accent)
    elif kind == "succession_record":
        draw_succession_record(draw, (cx, cy), 1.0, accent)
    elif kind == "folded_will":
        draw_folded_will(draw, (cx, cy), 1.0, accent)
    elif kind == "bronze_letter":
        draw_bronze_letter(draw, (cx, cy), 1.0, accent)
    elif kind == "torn_manifesto":
        draw_torn_manifesto(draw, (cx, cy), 1.0, accent)
    elif kind == "street_notice":
        draw_street_notice(draw, (cx, cy), 1.0, accent)
    elif kind == "interrogation_roster":
        draw_interrogation_roster(draw, (cx, cy), 1.0, accent)
    elif kind == "arrest_warrant":
        draw_arrest_warrant(draw, (cx, cy), 1.0, accent)
    elif kind == "scorched_jar_mouth":
        draw_scorched_jar_mouth(draw, (cx, cy), 1.0, accent)
    elif kind == "confession_brush":
        draw_confession_brush(draw, (cx, cy), 1.0, accent)
    elif kind == "confession_copy":
        draw_confession(draw, (cx, cy), 1.08, accent)
    elif kind == "interrogation_manual":
        draw_interrogation_manual(draw, (cx, cy), 1.0, accent)
    elif kind == "rescue_note":
        draw_rescue_note(draw, (cx, cy), 1.0, accent)
    elif kind == "reward_ledger":
        draw_reward_ledger(draw, (cx, cy), 1.0, accent)
    elif kind == "charge_strip":
        draw_charge_strip(draw, (cx, cy), 1.0, accent)
    elif kind == "shift_order":
        draw_shift_order(draw, (cx, cy), 1.0, accent)
    else:
        draw_seal(draw, (cx, cy), 1.0, accent)
    if item.get("counterRisk"):
        draw_risk_badge(draw, box)
    for dot_x, dot_y in ((x1 + 28, y1 + 28), (x2 - 28, y1 + 28), (x1 + 28, y2 - 28), (x2 - 28, y2 - 28)):
        draw.ellipse((dot_x - 3, dot_y - 3, dot_x + 3, dot_y + 3), fill=paper, outline=accent, width=1)


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
