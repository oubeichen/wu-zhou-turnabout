#!/usr/bin/env python3
"""Parse the project EPUB into John-friendly markdown and chapter JSON."""

from __future__ import annotations

import argparse
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET


PROMO_PATTERNS = (
    "本书由",
    "ePUBw.COM",
    "提供最新最全的优质电子书下载",
)


def clean_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value)
    value = html.unescape(value)
    value = value.replace("\u3000", " ")
    value = re.sub(r"[ \t\r\f\v]+", " ", value)
    return value.strip()


def is_noise(text: str) -> bool:
    return not text or any(pattern in text for pattern in PROMO_PATTERNS)


def read_toc(epub: ZipFile) -> list[dict[str, str]]:
    ns = {"n": "http://www.daisy.org/z3986/2005/ncx/"}
    root = ET.fromstring(epub.read("toc.ncx"))
    chapters: list[dict[str, str]] = []
    for point in root.findall(".//n:navPoint", ns):
        label = point.findtext("n:navLabel/n:text", default="", namespaces=ns).strip()
        content = point.find("n:content", ns)
        src = content.attrib.get("src", "") if content is not None else ""
        if label and label != "封面":
            chapters.append({"title": label, "src": src})
    return chapters


def split_chapters(epub: ZipFile) -> list[dict[str, object]]:
    toc = read_toc(epub)
    spine_files = [
        "OEBPS/Text/Section0001_split_000.xhtml",
        "OEBPS/Text/Section0001_split_001.xhtml",
    ]
    parts: list[tuple[str, str, str]] = []
    for filename in spine_files:
        raw = epub.read(filename).decode("utf-8", "replace")
        matches = list(re.finditer(r"<h1\b[^>]*id=\"([^\"]+)\"[^>]*>(.*?)</h1>", raw, re.S))
        for index, match in enumerate(matches):
            start = match.end()
            end = matches[index + 1].start() if index + 1 < len(matches) else len(raw)
            chapter_id = match.group(1)
            title = clean_text(match.group(2))
            body = raw[start:end]
            parts.append((chapter_id, title, body))

    chapters: list[dict[str, object]] = []
    toc_by_title = {item["title"]: item["src"] for item in toc}
    for number, (chapter_id, title, body) in enumerate(parts, start=1):
        if title == "封面":
            continue
        paragraph_matches = re.findall(r"<p\b[^>]*>(.*?)</p>", body, re.S)
        paragraphs = [clean_text(p) for p in paragraph_matches]
        paragraphs = [p for p in paragraphs if not is_noise(p)]
        text = "\n".join(paragraphs)
        chapters.append(
            {
                "number": len(chapters) + 1,
                "epub_order": number,
                "id": chapter_id,
                "title": title,
                "source": toc_by_title.get(title, ""),
                "paragraphs": paragraphs,
                "char_count": len(text),
                "preview": text[:240],
            }
        )
    return chapters


def write_outputs(epub_path: Path, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    with ZipFile(epub_path) as epub:
        chapters = split_chapters(epub)

    lines = ["# 武则天正传", ""]
    for chapter in chapters:
        lines.append(f"## {chapter['title']}")
        lines.append("")
        for paragraph in chapter["paragraphs"]:
            lines.append(paragraph)
            lines.append("")

    metadata = {
        "source_path": str(epub_path),
        "source_name": epub_path.name,
        "source_size_bytes": epub_path.stat().st_size,
        "parser": "stdlib-epub-opf-spine",
        "parsed_at": datetime.now(timezone.utc).isoformat(),
        "chapter_count": len(chapters),
        "notes": "Parsed XHTML spine into chapter markdown and JSON; promotional boilerplate removed.",
    }

    (out_dir / "doc.md").write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    (out_dir / "chapters.json").write_text(
        json.dumps(chapters, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (out_dir / "metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps({"success": True, **metadata}, ensure_ascii=False))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("epub_path", type=Path)
    parser.add_argument("out_dir", type=Path)
    args = parser.parse_args()
    write_outputs(args.epub_path, args.out_dir)


if __name__ == "__main__":
    main()
