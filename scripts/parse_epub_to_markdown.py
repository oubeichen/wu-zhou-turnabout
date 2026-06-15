#!/usr/bin/env python3
"""Parse a simple EPUB into ordered Markdown using only the Python stdlib."""

from __future__ import annotations

import argparse
import html
import json
import re
import zipfile
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote
from xml.etree import ElementTree as ET


BLOCK_TAGS = {
    "body",
    "br",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "li",
    "p",
    "section",
    "title",
}


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style"}:
            self.skip_depth += 1
            return
        if self.skip_depth == 0 and tag.lower() in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style"} and self.skip_depth:
            self.skip_depth -= 1
            return
        if self.skip_depth == 0 and tag.lower() in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self.skip_depth:
            return
        text = html.unescape(data)
        if text.strip():
            self.parts.append(text)

    def text(self) -> str:
        joined = "".join(self.parts)
        joined = re.sub(r"[ \t\r\f\v]+", " ", joined)
        joined = re.sub(r"\n{3,}", "\n\n", joined)
        lines = [line.strip() for line in joined.splitlines()]
        return "\n".join(line for line in lines if line)


def ns_name(name: str) -> str:
    return name.split("}", 1)[-1]


def read_container(zf: zipfile.ZipFile) -> str:
    root = ET.fromstring(zf.read("META-INF/container.xml"))
    for elem in root.iter():
        if ns_name(elem.tag) == "rootfile":
            path = elem.attrib.get("full-path")
            if path:
                return path
    raise ValueError("container.xml does not name an OPF package")


def resolve_path(base: str, href: str) -> str:
    return str((Path(base).parent / unquote(href)).as_posix())


def spine_documents(zf: zipfile.ZipFile, opf_path: str) -> list[str]:
    package = ET.fromstring(zf.read(opf_path))
    manifest: dict[str, str] = {}
    spine: list[str] = []
    for elem in package.iter():
        name = ns_name(elem.tag)
        if name == "item":
            item_id = elem.attrib.get("id")
            href = elem.attrib.get("href")
            media_type = elem.attrib.get("media-type", "")
            if item_id and href and "xhtml" in media_type:
                manifest[item_id] = resolve_path(opf_path, href)
        elif name == "itemref":
            itemref = elem.attrib.get("idref")
            if itemref:
                spine.append(itemref)
    return [manifest[itemref] for itemref in spine if itemref in manifest]


def parse_document(zf: zipfile.ZipFile, path: str) -> str:
    raw = zf.read(path).decode("utf-8", errors="replace")
    parser = TextExtractor()
    parser.feed(raw)
    return parser.text()


def main() -> None:
    argp = argparse.ArgumentParser()
    argp.add_argument("epub", type=Path)
    argp.add_argument("out_dir", type=Path)
    args = argp.parse_args()

    args.out_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.epub) as zf:
        opf_path = read_container(zf)
        docs = spine_documents(zf, opf_path)
        sections = []
        for doc_path in docs:
            text = parse_document(zf, doc_path)
            if text:
                sections.append((doc_path, text))

    markdown_parts = [f"# {args.epub.stem}", ""]
    for doc_path, text in sections:
        markdown_parts.append(f"## {Path(doc_path).name}")
        markdown_parts.append("")
        markdown_parts.append(text)
        markdown_parts.append("")

    doc_md = "\n".join(markdown_parts).strip() + "\n"
    (args.out_dir / "doc.md").write_text(doc_md, encoding="utf-8")
    metadata = {
        "source_path": str(args.epub),
        "source_name": args.epub.name,
        "source_size_bytes": args.epub.stat().st_size,
        "parser": "stdlib_epub_spine",
        "parsed_at": datetime.now(timezone.utc).isoformat(),
        "documents": [path for path, _ in sections],
        "character_count": len(doc_md),
    }
    (args.out_dir / "metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(metadata, ensure_ascii=False))


if __name__ == "__main__":
    main()
