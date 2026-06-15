# CLAUDE.md

Project memory for this John-driven project. Loaded automatically into every Claude Code session in this directory.

## Project context

- Domain: Chinese historical interactive fiction inspired by Wu Zetian's rise.
- Source provenance: `武则天正传.epub` was copied into `.john/input/` by the first John build pass.
- Current product shape: standalone static AVG-style website. The reader plays from Wu Zetian's first-person point of view, reads several passages before each major choice, sees the current story paragraph refresh, and reaches a dedicated ending summary screen based on route tendencies.
- Public UI language: Simplified Chinese. Avoid visible John internals, raw data labels, local file paths, and English engineering terms.
- Visual direction: Tang court atmosphere, generated palace background, generated Wu Zetian-inspired portrait, restrained crimson/jade/gold palette, readable text, light particle and transition effects.
- Runtime posture: no build step and no runtime network dependency. Music is synthesized locally with Web Audio.

## Active template

Whatever template is loaded is the one your session launched with — Claude Code reads `$CLAUDE_PLUGIN_ROOT` at session start, which is fixed for the lifetime of the session. To check from inside a session: ask Claude "which template am I running?" — it can read the plugin install path and report.

To switch templates: exit, optionally run `~/.claude/plugins/joharnessburg-templates/<name>/apply.sh`, then relaunch with `claude --plugin-dir ~/.claude/plugins/joharnessburg-applied/<name>/`.

## Project status

- Scaffolded by `/john:init` on 2026-06-15
- First playable AVG interface delivered on 2026-06-15: `index.html`, `styles.css`, `script.js`, `assets/palace-bg.png`, `assets/wu-portrait.png`
- AVG pacing and ending summary revised on 2026-06-15: no visible continue button, choices appear after several text passages, ending screen summarizes route stats and key choices.
- Verified on 2026-06-15 with syntax checks, JSON checks, public UI leak scan, and browser checks at desktop 1440x900 plus mobile 390x844.
