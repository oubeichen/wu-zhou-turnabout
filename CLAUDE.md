# CLAUDE.md

Project memory for this John-driven project. Loaded automatically into every Claude Code session in this directory.

## Project context

<!-- Fill in as the project develops:
- Domain / subject matter
- Source provenance
- Project-specific terminology or conventions
- User taste preferences (writing style, output formats, what to avoid)

The `using-john` skill provides general John orientation; this file is for what's specific to THIS project. -->

## Active template

Whatever template is loaded is the one your session launched with — Claude Code reads `$CLAUDE_PLUGIN_ROOT` at session start, which is fixed for the lifetime of the session. To check from inside a session: ask Claude "which template am I running?" — it can read the plugin install path and report.

To switch templates: exit, optionally run `~/.claude/plugins/joharnessburg-templates/<name>/apply.sh`, then relaunch with `claude --plugin-dir ~/.claude/plugins/joharnessburg-applied/<name>/`.

## Project status

- Scaffolded by `/john:init` on 2026-06-16
