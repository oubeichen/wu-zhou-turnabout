# AGENTS.md

Project memory for this John-driven project. Loaded automatically into Codex sessions in this directory.

## Project context

- Domain: Chinese historical interactive fiction inspired by Wu Zetian's rise.
- Source provenance: `武则天正传.epub` was copied into `.john/input/` by the first John build pass.
- Current product shape: standalone static AVG-style website. The reader plays from Wu Zetian's first-person point of view, makes choices, sees the current story paragraph refresh, and reaches an ending based on route tendencies.
- Public UI language: Simplified Chinese. Avoid visible John internals, raw data labels, local file paths, and English engineering terms.
- Visual direction: Tang court atmosphere, generated palace background, generated Wu Zetian-inspired portrait, restrained crimson/jade/gold palette, readable text, light particle and transition effects.
- Runtime posture: no build step and no runtime network dependency. Music is synthesized locally with Web Audio.

## Active John plugin

Codex reads John through the Codex plugin manifest when the `john` plugin is installed, or through project-local skills under `.agents/skills/`.

Claude Code reads John through the Claude plugin manifest and `CLAUDE.md`. Keep this file and `CLAUDE.md` aligned for provider-neutral project decisions.

## Project status

- Scaffolded by John init on 2026-06-15
- First playable AVG interface delivered on 2026-06-15: `index.html`, `styles.css`, `script.js`, `assets/palace-bg.png`, `assets/wu-portrait.png`
- Verified on 2026-06-15 with syntax checks, JSON checks, public UI leak scan, and browser checks at desktop 1440x900 plus mobile 390x844.
