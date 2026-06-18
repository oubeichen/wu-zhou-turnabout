#!/usr/bin/env python3
"""Generate distinct investigation backgrounds for every case location."""

from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "game" / "game-data.js"
ASSET_DIR = ROOT / "game" / "assets"
SIZE = (1280, 720)


PALETTES = {
    "palace": ("#5f1f1a", "#c99b3b", "#fff1bf"),
    "east-palace": ("#203d55", "#7aa8be", "#edf6ff"),
    "bronze-urn": ("#50351f", "#bf782e", "#f5e1b9"),
    "censorate": ("#1e3d36", "#568b74", "#e7f3e8"),
    "night-gate": ("#202044", "#816cbf", "#eee6ff"),
}


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


FONT_BIG = font(126, True)
FONT_LABEL = font(38, True)
FONT_SMALL = font(24)


def cover_resize(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    src = image.convert("RGB")
    src_ratio = src.width / src.height
    dst_ratio = size[0] / size[1]
    if src_ratio > dst_ratio:
        new_h = size[1]
        new_w = int(new_h * src_ratio)
    else:
        new_w = size[0]
        new_h = int(new_w / src_ratio)
    resized = src.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - size[0]) // 2
    top = (new_h - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def episode_art_path(scene_key: str) -> Path:
    path = ASSET_DIR / f"episode-art-{scene_key}.png"
    return path if path.exists() else ASSET_DIR / "investigation-room-v1.png"


def tinted_base(scene_key: str, variant: str) -> Image.Image:
    base = cover_resize(Image.open(episode_art_path(scene_key)), SIZE)
    if variant == "archive":
        base = ImageEnhance.Color(base).enhance(0.55)
        base = ImageEnhance.Brightness(base).enhance(0.82)
    elif variant == "defense":
        base = ImageEnhance.Color(base).enhance(0.72)
        base = ImageEnhance.Brightness(base).enhance(0.68)
    else:
        base = ImageEnhance.Contrast(base).enhance(1.08)
        base = ImageEnhance.Brightness(base).enhance(0.9)
    return base.filter(ImageFilter.GaussianBlur(radius=0.6)).convert("RGBA")


def overlay(draw: ImageDraw.ImageDraw, color: str, alpha: int, box: tuple[int, int, int, int]) -> None:
    draw.rectangle(box, fill=color + f"{alpha:02x}")


def draw_site(draw: ImageDraw.ImageDraw, scene_key: str, location_name: str) -> None:
    primary, accent, paper = PALETTES.get(scene_key, PALETTES["palace"])
    draw.rectangle((0, 500, 1280, 720), fill="#2a1812aa")
    draw.polygon([(60, 700), (1180, 700), (920, 510), (260, 510)], fill=primary + "88")
    draw.line((160, 538, 1120, 538), fill=accent + "cc", width=8)
    draw.rounded_rectangle((70, 120, 330, 420), radius=18, outline=accent + "cc", width=7)
    draw.rounded_rectangle((880, 150, 1190, 470), radius=24, outline=paper + "99", width=6)
    draw.text((990, 252), location_name[:2], fill=paper + "55", font=FONT_BIG, anchor="mm")


def draw_archive(draw: ImageDraw.ImageDraw, scene_key: str, location_name: str) -> None:
    primary, accent, paper = PALETTES.get(scene_key, PALETTES["palace"])
    draw.rectangle((0, 0, 1280, 720), fill="#10100fcc")
    for x in range(90, 1180, 180):
        draw.rounded_rectangle((x, 74, x + 118, 520), radius=8, fill=primary + "aa", outline=accent + "aa", width=3)
        for y in range(116, 486, 54):
            draw.line((x + 18, y, x + 98, y), fill=paper + "88", width=6)
    draw.rounded_rectangle((280, 500, 1050, 695), radius=16, fill="#4a2a1dcc", outline=accent + "cc", width=5)
    for x in range(350, 920, 150):
        draw.rounded_rectangle((x, 430, x + 126, 532), radius=8, fill=paper + "dd", outline="#5d442c", width=3)
    draw.text((1060, 172), "档", fill=paper + "46", font=FONT_BIG, anchor="mm")
    draw.text((94, 664), location_name, fill=paper + "cc", font=FONT_SMALL)


def draw_defense(draw: ImageDraw.ImageDraw, scene_key: str, location_name: str) -> None:
    primary, accent, paper = PALETTES.get(scene_key, PALETTES["palace"])
    draw.rectangle((0, 0, 1280, 720), fill="#130c0acc")
    draw.rounded_rectangle((72, 466, 1210, 706), radius=24, fill="#332015dd", outline=accent + "bb", width=6)
    draw.rounded_rectangle((830, 110, 1185, 488), radius=20, fill=primary + "99", outline=paper + "88", width=5)
    for x in [116, 232, 348]:
        draw.rounded_rectangle((x, 510, x + 86, 642), radius=6, fill=paper + "e6", outline="#5d442c", width=3)
        draw.line((x + 15, 550, x + 70, 550), fill=primary + "cc", width=4)
        draw.line((x + 15, 584, x + 70, 584), fill=primary + "99", width=4)
    draw.ellipse((570, 510, 720, 660), fill=accent + "aa", outline=paper + "dd", width=5)
    draw.text((645, 590), "辩", fill="#231b16dd", font=FONT_LABEL, anchor="mm")
    draw.text((1005, 276), location_name[:2], fill=paper + "42", font=FONT_BIG, anchor="mm")


def draw_background(case: dict, location: dict) -> Image.Image:
    scene_key = case.get("scene", {}).get("key", "palace")
    variant = location.get("sceneVariant", "site")
    image = tinted_base(scene_key, variant)
    shade = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    shade_draw = ImageDraw.Draw(shade)
    overlay(shade_draw, "#000000", 50 if variant == "site" else 76, (0, 0, 1280, 720))
    image = Image.alpha_composite(image, shade)
    art = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(art)
    name = location.get("name", "")
    if variant == "archive":
        draw_archive(draw, scene_key, name)
    elif variant == "defense":
        draw_defense(draw, scene_key, name)
    else:
        draw_site(draw, scene_key, name)
    return Image.alpha_composite(image, art)


def main() -> None:
    data = load_data()
    written = []
    for case in data["cases"]:
        scene_key = case.get("scene", {}).get("key", "palace")
        for location in case.get("locations", []):
            variant = location.get("sceneVariant", "site")
            out = ASSET_DIR / f"location-bg-{scene_key}-{variant}.png"
            draw_background(case, location).save(out)
            written.append(out.name)
    print(f"wrote {len(written)} location backgrounds")
    for name in written:
        print(name)


if __name__ == "__main__":
    main()
