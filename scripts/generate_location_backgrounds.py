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


def clean_room_art_path() -> Path:
    return ASSET_DIR / "investigation-room-v1.png"


def tinted_base(scene_key: str, variant: str) -> Image.Image:
    base = cover_resize(Image.open(clean_room_art_path()), SIZE)
    primary, accent, _paper = PALETTES.get(scene_key, PALETTES["palace"])
    tint = Image.new("RGB", SIZE, primary)
    base = Image.blend(base, tint, 0.14 if variant == "site" else 0.22)
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


def draw_soft_rect(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    fill: str,
    outline: str,
    radius: int = 12,
    width: int = 2,
) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_paper(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], accent: str) -> None:
    x1, y1, x2, y2 = box
    draw_soft_rect(draw, box, "#ead7b4dd", "#5d442caa", radius=8, width=2)
    for y in range(y1 + 18, y2 - 10, 18):
        draw.line((x1 + 16, y, x2 - 18, y + ((y // 18) % 2) * 2), fill=accent + "88", width=3)
    draw.ellipse((x2 - 36, y1 + 12, x2 - 12, y1 + 36), fill="#8e3029bb", outline="#fff1bf99", width=2)


def draw_lamp_glow(layer: Image.Image, center: tuple[int, int], color: str) -> None:
    glow = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    cx, cy = center
    for radius, alpha in [(240, 26), (150, 38), (72, 58)]:
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color + f"{alpha:02x}")
    layer.alpha_composite(glow)


def draw_site(draw: ImageDraw.ImageDraw, scene_key: str, location_name: str) -> None:
    primary, accent, paper = PALETTES.get(scene_key, PALETTES["palace"])
    draw.rectangle((0, 510, 1280, 720), fill="#2317147a")
    draw.polygon([(80, 720), (1220, 720), (990, 530), (230, 530)], fill=primary + "42")
    draw.ellipse((125, 130, 372, 378), fill=accent + "18")
    draw.ellipse((780, 380, 1180, 700), fill=paper + "0f")


def draw_archive(draw: ImageDraw.ImageDraw, scene_key: str, location_name: str) -> None:
    primary, accent, paper = PALETTES.get(scene_key, PALETTES["palace"])
    draw.rectangle((0, 0, 1280, 720), fill="#10100f8c")
    draw.rectangle((0, 510, 1280, 720), fill=primary + "56")
    for x in range(350, 920, 150):
        draw_paper(draw, (x, 456, x + 118, 548), accent)
    draw.text((94, 664), location_name, fill=paper + "cc", font=FONT_SMALL)


def draw_defense(draw: ImageDraw.ImageDraw, scene_key: str, location_name: str) -> None:
    primary, accent, paper = PALETTES.get(scene_key, PALETTES["palace"])
    draw.rectangle((0, 0, 1280, 720), fill="#130c0a8e")
    draw.rounded_rectangle((72, 500, 1210, 706), radius=24, fill="#332015b2", outline=accent + "44", width=2)
    draw.rounded_rectangle((830, 110, 1185, 488), radius=20, fill=primary + "7e", outline=paper + "55", width=2)
    for x in [116, 232, 348]:
        draw_paper(draw, (x, 510, x + 86, 642), accent)
    draw.ellipse((570, 510, 720, 660), fill=accent + "92", outline=paper + "aa", width=4)
    draw.text((645, 590), "案", fill="#231b16dd", font=FONT_LABEL, anchor="mm")
    draw_soft_rect(draw, (890, 180, 1120, 420), "#ead7b499", "#5d442c77", radius=12, width=2)
    for y in range(224, 384, 34):
        draw.line((925, y, 1085, y), fill=accent + "77", width=4)


def draw_background(case: dict, location: dict) -> Image.Image:
    scene_key = case.get("scene", {}).get("key", "palace")
    variant = location.get("sceneVariant", "site")
    image = tinted_base(scene_key, variant)
    shade = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    shade_draw = ImageDraw.Draw(shade)
    overlay(shade_draw, "#000000", 50 if variant == "site" else 76, (0, 0, 1280, 720))
    image = Image.alpha_composite(image, shade)
    art = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw_lamp_glow(art, (260, 182), PALETTES.get(scene_key, PALETTES["palace"])[1])
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
