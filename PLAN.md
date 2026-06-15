# PLAN.md — wuzetian2

*Created by `/john:init` on 2026-06-15. Updated after first playable AVG delivery on 2026-06-15.*

## Project intent

Build a standalone Simplified Chinese AVG-style historical interactive fiction website inspired by Wu Zetian's rise. The reader plays from Wu Zetian's first-person point of view, makes political choices, sees the current story paragraph refresh, and reaches a final historical evaluation based on accumulated tendencies.

Success means:

- The app is a usable static website with no build step.
- Public UI is Simplified Chinese and does not expose John internals, raw JSON, local paths, or English implementation labels.
- The story has enough length to feel like a compact visual novel rather than a short demo.
- The presentation includes generated visual assets, light animation, save/load, review log, choices, route stats, and music control.

## Intent and display contracts

- Intent question budget: one batch maximum, four questions maximum.
- Intent questions: not used; the user's request was specific enough.
- Normalized user intent: `.john/brief/user_intent.json`
- Public app blueprint: `.john/contracts/app_blueprint.json`
- UI-driven extraction plan: `.john/contracts/extraction_plan.json`
- Story outline checkpoint: `.john/knowledge/story_outline.json`

## Knowledge inventory

- Input: `.john/input/武则天正传.epub`
- Parsed output: `.john/parsed/wuzetian/doc.md`
- Parser: local stdlib EPUB spine parser at `scripts/parse_epub_to_markdown.py`
- Corpus profile: one Chinese EPUB, about 117k parsed characters, 45 chapters plus appendix.
- Surveyed threads: return to palace, empress struggle, two-saints rule, Fengshan ceremony, succession conflict, Gaozong's death, regency, rebellion, bronze petition boxes, cruel officials, Zhou founding, Di Renjie, and Shenlong coup.

## App-type definition

- User intent: first-person Wu Zetian AVG visual novel with choices, story length, effects, music, and strong visual atmosphere.
- App mechanism: static HTML/CSS/JS visual novel. Each scene presents one first-person story paragraph, two or three choices, and stat effects. The last scene computes one of three endings from the route stats.
- Display contract: public screens are start/current scene, choice buttons, four tendency meters, review dialog, and system controls. Labels are all Chinese.
- Extraction targets: historical stages, court pressure, first-person motive, player action choices, political consequence hints, and ending evaluation.
- Knowledge format/schema: storyline entries with scene title, era/location, public paragraph, political wind note, choices, stat deltas, next scene, and final route resolver.
- Build pipeline: parse/survey -> app-first contracts -> story outline -> static app -> visual/audio polish -> browser verification.

## Phases

### Phase 1: bootstrap

- Intent: initialize John workspace and record app-first project direction.
- Skills invoked: `init-workspace`, `using-john`, `plan-md-authoring`.
- Required artifacts: `.john/`, `PLAN.md`, `AGENTS.md`, `CLAUDE.md`.
- Status: done.

### Phase 2: parse + survey

- Intent: ingest the EPUB and identify narrative arcs suitable for AVG scenes.
- Skills invoked: `parsing`.
- Required artifacts: `.john/input/武则天正传.epub`, `.john/parsed/wuzetian/doc.md`, `.john/parsed/wuzetian/metadata.json`.
- Status: done.

### Phase 3: intent + app blueprint

- Intent: settle public app contract before implementation.
- Skills invoked: `app-design-thinking`, `schema-design`.
- Required artifacts: `.john/brief/user_intent.json`, `.john/contracts/app_blueprint.json`, `.john/contracts/extraction_plan.json`, `.john/knowledge/story_outline.json`.
- Status: done.

### Phase 4: static AVG build

- Intent: create the playable website.
- Required artifacts: `index.html`, `styles.css`, `script.js`, `assets/palace-bg.png`, `assets/wu-portrait.png`.
- Implemented features: typewriter text, 18-scene route, variable-length text passages before each major choice, choice effects, four meters, review dialog, local save/load, restart, generated palace background, generated character portrait, particle drift, scene transition, synthesized palace-style music, and a dedicated ending summary screen.
- Status: done.

### Phase 5: verification

- Intent: verify syntax, JSON contracts, public UI leak guardrail, responsive layout, and core interactions.
- Checks run:
  - `node --check script.js`
  - `python3 -m json.tool` on John JSON artifacts
  - public-file leak scan for forbidden internal terms
  - browser verification through temporary `http://127.0.0.1:8765/`
  - desktop viewport 1440x900
  - mobile viewport 390x844
- Observed results: assets load, intermediate text passages show no choice buttons or visible instruction/progress text, choices appear only after several text passages in a scene, first choice advances to second scene, meters update, save/load works, review dialog records route, music button toggles, a full 18-choice route reaches the dedicated ending summary screen, no browser console warnings/errors, no horizontal overflow on tested viewports.
- Status: done.

## Subagent matrix

No subagents used. The corpus is a single small EPUB and the first playable app could be produced inline without fan-out.

## Open decisions

None blocking. Possible future expansion: add more route-specific middle scenes, more character portraits, or chapter-select unlocks.

## Log

- 2026-06-15: Revised AVG pacing so each scene presents multiple passages before choices; added dedicated ending summary screen with route stats and major-choice recap.
- 2026-06-15: Removed visible advance/progress hints and expanded scene prose with variable passage counts so the pacing is closer to common AVG presentation.
- 2026-06-15: First playable static AVG delivered with generated background/portrait assets, local synthesized music, 18 scenes, three endings, save/load, review dialog, and responsive browser verification.
- 2026-06-15: Parsed `武则天正传.epub` into `.john/parsed/wuzetian/doc.md` using a stdlib EPUB spine parser after confirming `lxml`, `bs4`, and `ebooklib` were unavailable.
- 2026-06-15: Copied `武则天正传.epub` into `.john/input/` and created app-first intent/display contracts.
- 2026-06-15: PLAN.md scaffolded by `/john:init`.
