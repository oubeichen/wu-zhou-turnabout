Original prompt: 做一个仿照 《逆转裁判》 的完整游戏。始终检查当前游戏和《逆转裁判》游戏差距在哪里，然后修改优化直到完成。不要有任何偷懒简化设计，不要实现简单设计，多考虑现代游戏的功能 内容 和 用户交互是什么样的，可以利用所有你能力用到的工具 包括 图像生成，第三方开源工具 开源库等等

# Progress

## 2026-06-18 iteration 58 result

Implemented:
- Used the built-in image generation path for a complex Tang-style evidence sprite-sheet direction, then converted that visual standard into the committed reproducible PNG pipeline because the built-in tool did not expose a local file path that could be copied into the repo.
- Regenerated `game/assets/evidence-item-sheet-v2.png` with cleaner item-first evidence icons: bottom title plaques and corner index labels were removed so the thumbnail is no longer dominated by text.
- Added more concrete evidence object drawing types in `scripts/generate_evidence_item_sheet.py`, including hairpin/ribbon, gate pass, inkstone/brush, and cloth/seal fragments, plus a non-text caution seal for risky evidence.
- Updated owned evidence thumbnails so they no longer render always-on `证` / `卷` / `图` / `札` text badges over the bitmap art. Locked evidence still keeps a small unavailable hint.
- Added `selectedEvidenceArtAsset` and `selectedEvidenceUsesBitmapOnly` to `window.render_game_to_text` so automated checks can verify the visible evidence uses the PNG sheet without a text badge overlay.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX=/Users/oubeichen/Projects/wuzetian2/.pycache npm run check:py`
- `git diff --check`
- `npm run qa:web-game` passed after rerunning with browser launch permission; the only warning remains the external develop-web-game script's module-type warning.
- Opened `game/assets/evidence-item-sheet-v2.png` and visually confirmed the sheet is populated with image-first props rather than label-dominated cards.
- Desktop 1440x810 Playwright flow collected the first evidence, opened Court Record, selected `破损的后位奏章`, and confirmed `backgroundImage` loads `evidence-item-sheet-v2.png`, `markExists=false`, `selectedEvidenceUsesBitmapOnly=true`, and page overflow is `0x0`.
- Mobile 390x844 Playwright flow repeated the same Court Record check and confirmed `backgroundImage` loads `evidence-item-sheet-v2.png`, `markExists=false`, `selectedEvidenceUsesBitmapOnly=true`, and horizontal overflow is `0`.
- Screenshots inspected: `iteration58-record-bitmap-no-mark-desktop.png` and `iteration58-record-bitmap-no-mark-mobile.png`.

Remaining Ace Attorney gap list:
- Evidence thumbnails are now image-first and no longer covered by generic text badges, but the highest-value evidence still needs true image-gen-exported bespoke item art once the tool provides a copyable project file or CLI credentials are available.
- Evidence inspection supports lens and drag/swipe rotation, but deeper object-specific interactions such as peeling, unfolding, matching fragments, or flipping seals are still missing.
- Correct objections have staged cut-ins, but animation still uses DOM/CSS composition rather than fully authored frame-by-frame sprites.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 57 result

Implemented:
- Added drag/swipe rotation for Court Record evidence inspection.
- Dragging left or right on the evidence art stage now cycles the evidence view between `正面`, `背面`, and `边缘`.
- The drag path reuses the same view state as the existing view buttons, so switching by drag resets to the target view's first inspection spot and moves the magnifier lens to the correct position.
- Added a `拖动切换角度` hint directly on the inspection art stage.
- Added short gesture feedback on the evidence art after drag rotation, with reduced-motion handling.
- Added `recordInspectGesture` to `window.render_game_to_text`, reporting `drag:next`, `drag:prev`, or `button` during the short gesture window.
- Added pointerdown/pointerup/pointercancel handling scoped to `[data-inspect-drag-stage]`, avoiding conflicts with hotspot buttons and view tabs.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX=/Users/oubeichen/Projects/wuzetian2/.pycache npm run check:py`
- `git diff --check`
- `npm run qa:web-game` passed; the only warning remains the external develop-web-game script's module-type warning.
- Desktop 1440x810 Playwright flow collected first evidence, opened Court Record inspect, dragged left on the art stage, and confirmed the view changed from `正面` to `背面`, lens changed to `back:source`, `recordInspectGesture=drag:next`, and there was no page overflow.
- Desktop flow waited for gesture cleanup, dragged right, and confirmed the view returned to `正面`, lens changed to `front:trace`, and `recordInspectGesture=drag:prev`.
- Mobile 390x844 Playwright flow dragged left on the art stage and confirmed `背面` / `back:source`, gesture feedback, visible drag hint, and no horizontal overflow.
- Screenshots inspected: `iteration57-inspect-drag-back.png` and `iteration57-inspect-drag-mobile.png`.

Remaining Ace Attorney gap list:
- Evidence inspection now supports visible lens feedback and drag/swipe view rotation, but it still lacks per-evidence bespoke generated art and deeper object-specific interaction patterns.
- Complex evidence and investigation objects use committed PNG sprite sheets instead of SVG/CSS shape overlays, but high-value evidence should still be replaced with exportable image-gen item sprites when an API key/output path is available.
- Correct objections have staged cut-ins, but animation still uses DOM/CSS composition rather than fully authored frame-by-frame sprites.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 56 result

Implemented:
- Upgraded Court Record evidence inspection with an in-art magnifier marker.
- The active inspection hotspot now renders an `inspect-lens` directly on top of the evidence art, with the hotspot label and number inside the lens.
- The lens position changes by evidence view and hotspot:
  - `front:trace` and `front:logic`
  - `back:source` and `back:gap`
  - `edge:wear` and `edge:risk`
- Switching hotspots updates the lens class and label immediately, so the visual focus matches the observation text.
- Switching views resets to that view's first spot and moves the lens to the matching view-specific position.
- Added `recordInspectLens` and `recordInspectLensLabel` to `window.render_game_to_text`.
- Added desktop and mobile lens styling, including reduced-motion handling and narrower mobile sizing to avoid horizontal overflow.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX=/Users/oubeichen/Projects/wuzetian2/.pycache npm run check:py`
- `git diff --check`
- `npm run qa:web-game` passed; the only warning remains the external develop-web-game script's module-type warning.
- Desktop 1440x810 Playwright flow collected first evidence, opened Court Record inspect, and confirmed `front:trace` lens, then switched to `front:logic`, then switched to back view and confirmed `back:source`.
- Desktop flow confirmed the lens DOM classes match the active state and there is no page overflow.
- Mobile 390x844 Playwright flow confirmed `front:trace` lens and `edge:wear` lens with no horizontal overflow.
- Screenshots inspected: `iteration56-inspect-lens-front.png`, `iteration56-inspect-lens-back.png`, and `iteration56-inspect-lens-mobile.png`.

Remaining Ace Attorney gap list:
- Evidence inspection now has visible in-art magnifier feedback, but it still lacks drag/rotate tactile controls and per-item bespoke generated art for the most important objects.
- Complex evidence and investigation objects use committed PNG sprite sheets instead of SVG/CSS shape overlays, but high-value evidence should still be replaced with exportable image-gen item sprites when an API key/output path is available.
- Correct objections have staged cut-ins, but animation still uses DOM/CSS composition rather than fully authored frame-by-frame sprites.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 55 result

Implemented:
- Upgraded the evidence pickup flow from a modal-only confirmation into a visible inventory-add effect.
- Confirming the final pickup card now triggers a short `inventoryCue`: a small evidence bitmap card labeled `收入记录` flies toward the Court Record area.
- The investigation `记录` button now gets a temporary `inventory-target-active` highlight during the inventory-add cue, making it clear where the item went.
- Added automatic cleanup for the inventory cue after about 1.15 seconds, plus immediate cleanup when returning home, opening case intro, switching commands, moving locations, entering trial, opening Court Record, replaying/resetting/loading cases, or dismissing pickup state.
- Added `inventoryCueOpen`, `inventoryCueName`, and `inventoryCueArt` to `window.render_game_to_text`.
- Added desktop and mobile CSS trajectories for the flying item card, including reduced-motion handling and a smaller mobile `evidence-thumb-flight`.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX=/Users/oubeichen/Projects/wuzetian2/.pycache npm run check:py`
- `git diff --check`
- `npm run qa:web-game` passed; the only warning remains the external develop-web-game script's module-type warning.
- Desktop 1440x810 Playwright flow confirmed: pickup opens first, clicking `继续调查` closes pickup, `inventoryCueOpen=true`, flying card exists, art comes from `evidence-item-sheet-v2.png`, the `记录` button highlights, no page overflow, and the cue auto-clears after 1.25 seconds.
- Mobile 390x844 Playwright flow confirmed: inventory cue opens after pickup confirmation, flying card exists, `记录` button highlights, there is no horizontal overflow, and the cue auto-clears.
- Screenshots inspected: `iteration55-inventory-flight-desktop.png` and `iteration55-inventory-flight-mobile.png`.

Remaining Ace Attorney gap list:
- Investigation now has both evidence pickup confirmation and an inventory-add flight cue, but evidence inspection still lacks tactile rotate/zoom polish and per-item bespoke generated art for the most important objects.
- Complex evidence and investigation objects use committed PNG sprite sheets instead of SVG/CSS shape overlays, but high-value evidence should still be replaced with exportable image-gen item sprites when an API key/output path is available.
- Correct objections have staged cut-ins, but animation still uses DOM/CSS composition rather than fully authored frame-by-frame sprites.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 54 result

Implemented:
- Added a dedicated evidence pickup fanfare for investigation: when a hotspot yields new evidence, a game-style overlay appears with a large evidence bitmap, evidence name, summary, source line, and a short Court Record hint.
- The pickup overlay supports click-anywhere-on-card progression, Enter/Space progression, and Escape dismissal.
- If a hotspot yields multiple evidence items, the overlay can step through them with `收入下一件`; single evidence uses `继续调查`.
- Added an `打开记录` action inside the pickup card. It closes the pickup overlay before opening Court Record, preventing background controls from being clicked through the modal.
- Added cleanup for pickup state when changing commands, moving locations, opening case intro, entering trial, replaying/resetting/loading cases, or returning home.
- Added `evidencePickupOpen`, `evidencePickupName`, `evidencePickupIndex`, `evidencePickupHasNext`, and `evidencePickupArt` to `window.render_game_to_text`.
- Added desktop and mobile CSS for the pickup card, including a larger `evidence-thumb-pickup` size and reduced-motion handling.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX=/Users/oubeichen/Projects/wuzetian2/.pycache npm run check:py`
- `git diff --check`
- `npm run qa:web-game` passed; inspected the existing smoke screenshot. The only warning is the external develop-web-game script's module-type warning.
- Desktop 1440x810 Playwright flow entered first-case investigation, examined the first hotspot, confirmed pickup opens for `破损的后位奏章`, confirms large art loads from `evidence-item-sheet-v2.png`, and confirms no page overflow.
- Desktop flow clicked the whole pickup card and confirmed the overlay closes while the investigation beat remains available.
- Desktop flow examined the second hotspot, clicked pickup-card `打开记录`, and confirmed pickup closes before Court Record opens.
- Mobile 390x844 Playwright flow confirmed pickup opens with no horizontal overflow and Escape closes it.
- Screenshots inspected: `iteration54-pickup-desktop.png` and `iteration54-pickup-mobile.png`.

Remaining Ace Attorney gap list:
- Investigation now has a proper evidence pickup fanfare, but the inventory add effect is still a modal-style confirmation rather than a fully animated item flying into the Court Record button.
- Complex evidence and investigation objects use committed PNG sprite sheets instead of SVG/CSS shape overlays, but high-value evidence should still be replaced with exportable image-gen item sprites when an API key/output path is available.
- Correct objections have staged cut-ins, but animation still uses DOM/CSS composition rather than fully authored frame-by-frame sprites.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 53 result

Implemented:
- Used the session image generation tool to draft a reference direction for complex historical evidence props: scrolls, tallies, rosters, petitions, bronze complaint box, notices, registers, jar, confession, night gate tablet, and shift order.
- The local OpenAI Image API CLI could not run a live export because `OPENAI_API_KEY` is not set in this environment, so this iteration converted the reference direction into committed bitmap-generation improvements rather than leaving the repo unchanged.
- Upgraded `scripts/generate_evidence_item_sheet.py` so the evidence sheet now draws larger item silhouettes with paper grain, brush strokes, shadows, red seals, route threads, boxed clue boards, bronze-box letters, jar scorch marks, and smaller labels that no longer dominate the icon.
- Added `scripts/generate_prop_closeups.py` and regenerated `game/assets/prop-closeups-v1.png` as a proper bitmap close-up sheet for desk papers, screen shadow, bamboo slip, ink stain, petition scroll, and court bell.
- Removed the runtime CSS prop-piece overlays from investigation close-ups, so complex investigation objects are no longer assembled from CSS polygon/shape fragments on top of the bitmap.
- Added the new prop close-up generator to `npm run check:py`.
- Updated `.gitignore` with `tmp/imagegen/` for future image-generation batch scratch files.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX=/Users/oubeichen/Projects/wuzetian2/.pycache npm run check:py`
- `git diff --check`
- `npm run qa:web-game` passed; inspected `output/web-game/shot-0.png`. The only warning is the external develop-web-game script's module-type warning.
- Desktop 1440x810 Playwright flow entered first-case investigation, examined the first hotspot, confirmed `.prop-stage::before` loads `prop-closeups-v1.png`, confirmed no `.prop-piece` / `.piece-*` elements remain, and confirmed page overflow stays `0x0`.
- Desktop 1440x810 Playwright flow opened Court Record and confirmed evidence thumbnails load `evidence-item-sheet-v2.png` with no horizontal overflow.
- Mobile 390x844 Playwright flow confirmed the investigation close-up loads `prop-closeups-v1.png`, no CSS prop pieces are rendered, and there is no horizontal overflow.
- Screenshots inspected: `iteration53-investigation-prop-bitmap.png`, `iteration53-record-evidence-bitmap.png`, and `iteration53-mobile-prop-bitmap.png`.

Remaining Ace Attorney gap list:
- Complex evidence and investigation objects now use committed PNG sprite sheets instead of SVG/CSS shape overlays, but the art is still generated locally from drawing primitives; once an exportable Image API key/path is available, high-value evidence should be replaced with fully image-generated item sprites.
- Investigation and Court Record interactions are functional, but there is still no animated evidence pickup fanfare or inventory add animation.
- Correct objections have staged cut-ins, but animation still uses DOM/CSS composition rather than fully authored frame-by-frame sprites.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 52 result

Implemented:
- Rebuilt the case-intro top section into a two-column case dossier: written briefing on the left and a bitmap location-art dossier card on the right.
- Added bespoke briefing cards for all five cases instead of shared generic cards:
  - Case 1 focuses on who first pushed the废后 narrative.
  - Case 2 focuses on why an East Palace retainer became the accused.
  - Case 3 follows how one投书 became a political case.
  - Case 4 frames the too-clean confession as the contradiction.
  - Case 5 frames the half-hour coup as a timeline puzzle.
- The case-intro art card now uses the case's first investigation background PNG through `locationBackgroundFile()`, so the entrance screen uses real bitmap scene art rather than only text.
- Added the first three evidence names to the dossier art card as quick visual objectives.
- Exposed `caseBriefingCards` and `caseIntroArt` through `window.render_game_to_text` for deterministic browser QA.
- Added responsive styling so desktop keeps the dossier and action buttons in one viewport while mobile stacks the text and art without horizontal overflow.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX=/Users/oubeichen/Projects/wuzetian2/.pycache npm run check:py`
- `git diff --check`
- Public old-template scan on `game/`: no matches for previous opaque evidence phrases.
- `npm run qa:web-game` passed; inspected `output/web-game/shot-0.png`. The only warning is the external develop-web-game script's module-type warning.
- Desktop 1440x810 Playwright flow opened all five cases and verified each has distinct briefing-card titles, a matching `caseIntroArt` background, visible action buttons, and no page overflow.
- Mobile 390x844 Playwright flow verified the case-intro art loads, the bespoke cards are exposed, and there is no horizontal overflow.
- Screenshots inspected: `iteration52-case-intro-1.png`, `iteration52-case-intro-5.png`, and `iteration52-case-intro-mobile.png`.

Remaining Ace Attorney gap list:
- Case intros now have bespoke incident framing and scene art, but the visual art is still generated/derived placeholder PNG; higher-quality image-gen exports should replace the complex location and evidence art once exportable files are available.
- Investigation and Court Record interactions are functional, but there is still no animated evidence pickup fanfare or inventory add animation.
- Correct objections have staged cut-ins, but animation still uses DOM/CSS composition rather than fully authored frame-by-frame sprites.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 51 result

Implemented:
- Added `scripts/generate_location_backgrounds.py` and generated 15 location-specific investigation backgrounds: every case now has distinct `site`, `archive`, and `defense` PNG backgrounds.
- Bound investigation scenes to the current location via `--location-art` and exposed `locationArt` through `window.render_game_to_text`, so moving between locations visibly changes the main scene.
- Removed the trial-only stage portrait layer from investigation scenes. Investigation feedback now keeps only the dialogue portrait inside the feedback box, fixing the duplicated right-bottom portrait shown in the reported screenshot.
- Raised investigation hotspots whenever a feedback dialogue is open, keeping clickable labels clear of the bottom dialogue panel.
- Rebuilt the case-intro screen into a wider case briefing: three concise context cards explain what happened, where to investigate first, and which evidence matters.
- Replaced dead `卷宗X` tags with clickable chapter-source buttons that show chapter title, relation to the current case, and a plain-language reading hint.
- Made the whole investigation dialogue beat clickable: clicking the feedback box advances to the next line, and clicking again on the last line closes it. Enter/Space now use the same continue-or-close behavior.
- Expanded evidence item drawing categories and regenerated `evidence-item-sheet-v2.png`, so tallies, rosters, decrees, notices, confession papers, jars, bronze boxes, maps, ledgers, and risk badges are more visually distinct.
- Used the image generation tool to draft higher-quality background and evidence sprite-sheet references. The generated image result was not exposed as a directly writable workspace file in this environment, so the committed assets remain PNG placeholders generated into the repo; the next art pass should replace complex placeholder assets with image-gen bitmaps once exportable files are available.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX=/Users/oubeichen/Projects/wuzetian2/.pycache npm run check:py`
- `git diff --check`
- Public old-template scan on `game/`: no matches for previous opaque evidence phrases.
- `npm run qa:web-game` passed; inspected `output/web-game/shot-0.png`. The only warning is the external develop-web-game script's module-type warning.
- Desktop 1440x810 Playwright flow verified case intro has 3 setup cards, clickable chapter-source tabs, complete source detail, visible `开始调查` / `进入庭审` buttons, and no page overflow.
- Desktop 1440x810 Playwright flow verified `立政殿`, `史官案牍房`, and `辩护席` each load their own `location-bg-palace-*.png` background, with no investigation stage portraits.
- Desktop investigation feedback flow verified clicking the dialogue box advances `1/2 -> 2/2 -> closed`, and hotspots stay above the feedback panel.
- Mobile 390x844 Playwright flow verified the case intro has no horizontal overflow and location movement still updates `locationArt`.
- Screenshots inspected: `iteration51-case-intro-wide-final.png`, `iteration51-case-intro-source-clicked.png`, `iteration51-location-archive.png`, `iteration51-investigation-defense-beat-fixed.png`, `iteration51-investigation-after-dialogue-click.png`, `iteration51-case-intro-mobile.png`, and `location-bg-contact-sheet.png`.

Remaining Ace Attorney gap list:
- Location backgrounds now change per scene, but many are still generated placeholders; complex backgrounds and evidence items should be replaced with image-gen bitmap assets rather than hand-drawn geometric compositions.
- Case intro now explains the immediate mystery and sources, but later cases should get more bespoke incident-specific framing instead of only using shared briefing templates.
- Correct objections have staged cut-ins, but animation still uses DOM/CSS composition rather than fully authored frame-by-frame sprites.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 50 result

Implemented:
- Added `scripts/generate_evidence_item_sheet.py`, which reads the public game data and emits a 7x5 per-evidence bitmap sprite sheet at `game/assets/evidence-item-sheet-v2.png`.
- Switched Court Record evidence thumbnails and large inspection art from the older generic card sheet to the new per-item evidence sheet, while preserving existing row/column sprite positioning.
- Added the new generator to `npm run check:py` so syntax checks cover the asset-generation script.
- Wrapped Court Record tab content in a dedicated `record-body` layout so the fixed drawer has clear header, tab, list, and detail regions.
- Tightened Court Record evidence list items into compact one-line inventory rows, leaving full explanation in the selected detail panel and preventing list text from spilling into neighboring rows.

Verified:
- `npm run check:js`
- `npm run check:py`
- `git diff --check`
- Public old-template scan on `game/`: no matches for previous opaque evidence phrases.
- `npm run qa:web-game` passed; inspected `output/web-game/shot-0.png`.
- Desktop 1440x810 Playwright flow verified Court Record thumbnails use `evidence-item-sheet-v2.png`, first four evidence positions are distinct, selected evidence detail remains readable, and page overflow is `0x0`.
- Desktop 1440x810 Playwright flow opened evidence `详查` and confirmed the large inspection artwork also uses `evidence-item-sheet-v2.png`.
- Mobile 390x844 Playwright flow verified the same record and inspect artwork, no horizontal overflow, stable list/detail spacing, and compact inventory rows without text overlap.
- Screenshots inspected: `iteration50-desktop-evidence-sheet-record-compact.png`, `iteration50-mobile-evidence-sheet-record-compact.png`, `iteration50-desktop-evidence-sheet-inspect-fixed.png`, and `iteration50-mobile-evidence-sheet-inspect-fixed.png`.

Remaining Ace Attorney gap list:
- Evidence now has a per-item bitmap sheet and three-view inspection, but many document-type items still share a similar visual language; high-value evidence should get more bespoke object illustrations.
- Correct objections have staged cut-ins, but animation still uses DOM/CSS composition rather than fully authored frame-by-frame sprites.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 49 result

Implemented:
- Upgraded evidence `详查` from a two-point static card into a three-view examine flow: `正面`, `背面`, and `边缘`.
- Each evidence view now has its own hotspot set and observation copy: front focuses on visible trace / courtroom logic, back focuses on source marks / missing gaps, and edge focuses on transfer wear / present risk.
- Switching views resets the active hotspot to that view's first clue, so the player reads each face from concrete observation before reasoning.
- Switching to the next evidence resets the inspection back to `正面 + 表面痕迹`, preventing stale side-view state from carrying across records.
- Added distinct visual transforms for front/back/edge evidence views and responsive view tabs in the inspection art panel.
- Added `recordInspectView` to `window.render_game_to_text` so browser QA can assert the active evidence angle.

Verified:
- `npm run check:js`
- `npm run check:py`
- `git diff --check`
- Public old-template scan on `game/`: no matches for previous opaque evidence phrases.
- `npm run qa:web-game` passed; inspected `output/web-game/shot-0.png`.
- Desktop 1440x810 Playwright flow opened `摇篮旁的值夜签`, checked front default, switched to back/source and back/gap, switched to edge/wear and edge/risk, then stepped to the next record and confirmed it reset to front/trace.
- Mobile 390x844 Playwright flow verified the same three-view inspection sequence, visible sticky actions, and no horizontal overflow.
- Screenshots inspected: `iteration49-desktop-inspect-back.png`, `iteration49-desktop-inspect-edge.png`, `iteration49-mobile-inspect-back.png`, and `iteration49-mobile-inspect-edge.png`.

Remaining Ace Attorney gap list:
- Evidence inspection now has view rotation and per-view hotspots, but the evidence artwork is still generated from card archetypes rather than bespoke illustrations for every single item.
- Correct objections now have staged cut-ins, but animation still uses DOM/CSS composition rather than fully authored frame-by-frame sprites.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 48 result

Implemented:
- Rebuilt the correct-present reveal from a single static panel into a three-step courtroom cut-in: `异议切入` -> `证物对照` -> `矛盾揭示`.
- Added a visual three-frame cut-in strip for defense, Court Record, and opponent reaction; the active frame changes with the reveal step.
- Added explicit `下一幕`, final `揭示矛盾`, and `跳过演出` controls so players can either watch the full beat or quickly return to the case flow.
- Changed Enter/Space during the reveal to advance one beat at a time; the final beat resolves the contradiction and preserves the existing testimony/interlude logic.
- Exposed `objectionRevealStep`, `objectionRevealStepTitle`, and `objectionRevealSteps` through `window.render_game_to_text` for deterministic QA.
- Added desktop and mobile responsive styling for the reveal cut-in so the staged controls stay visible and do not introduce horizontal overflow.

Verified:
- `npm run check:js`
- `npm run check:py`
- `git diff --check`
- Public old-template scan on `game/`: no matches for previous opaque evidence phrases.
- `npm run qa:web-game` passed; inspected `output/web-game/shot-0.png`.
- Desktop 1440x810 Playwright flow: first-case correct evidence reached reveal step 1, advanced to step 2 and step 3, then resolved to `trial-interlude` with `objectionReveal=false`.
- Mobile 390x844 Playwright flow verified the same three reveal steps, visible action controls, and no horizontal overflow.
- Mobile skip regression: `跳过演出` from step 1 immediately resolved to `trial-interlude` without horizontal overflow.
- Screenshots inspected: `iteration48-desktop-objection-reveal-step-1.png`, `iteration48-desktop-objection-reveal-step-3.png`, `iteration48-mobile-objection-reveal-step-2.png`, and `iteration48-mobile-objection-reveal-step-3.png`.

Remaining Ace Attorney gap list:
- Correct objections now have a staged cut-in with player-controlled timing, but the animation still uses DOM/CSS composition rather than fully authored frame-by-frame video or sprite animation.
- Court Record evidence inspection has hotspots, but individual evidence still uses generated card art rather than bespoke per-item illustrations or true 3D rotate/examine objects.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-17 iteration 47 result

Implemented:
- Added two clickable inspection points to evidence `详查`: `表面痕迹` explains what the player can directly see, and `庭审结论` explains what claim the evidence can overturn.
- Reset evidence inspection back to `表面痕迹` when switching records, so each item starts from the concrete visual clue before moving into reasoning.
- Added `recordInspectSpot` and `recordInspectObservation` to `window.render_game_to_text` for deterministic Court Record QA.
- Fixed mobile courtroom focus after testimony actions: when pressing or changing testimony, the viewport returns to the stage so both character portraits and dialogue feedback are visible instead of leaving the player at the lower operation panel.
- Reduced and lowered the mobile `异议` impact banner, and raised trial portrait layering above the transient impact layer so both courtroom standees remain visible during objection animation.

Verified:
- `npm run check:js`
- `npm run check:py`
- `git diff --check`
- Desktop 1440x810 evidence inspection flow opened `摇篮旁的值夜签`, switched `表面痕迹` -> `庭审结论`, stepped to the next evidence, and returned to court with no page overflow.
- Mobile 390x844 evidence inspection flow confirmed the same hotspot switching, visible observation copy, sticky actions, and no horizontal overflow.
- Desktop 1440x810 trial portrait flow pressed statement 2, confirmed `scrollY=0`, no page overflow, both portraits fully visible, and objection impact no longer hides the standees.
- Mobile 390x844 trial portrait flow pressed statement 2, confirmed the viewport returns to the stage, both portraits are visible, and the compact objection banner does not overlap the portraits.
- Screenshots inspected: `iteration47-desktop-logic-hotspot.png`, `iteration47-mobile-logic-hotspot.png`, `iteration48-desktop-trial-portrait-final.png`, and `iteration48-mobile-trial-portrait-final.png`.

Remaining Ace Attorney gap list:
- Evidence inspection now has clickable reasoning points, but individual evidence still uses generated card art rather than bespoke per-item illustrations or true 3D rotate/examine objects.
- The objection banner no longer hides portraits, but the animation is still CSS compositing rather than a fully authored cut-in sequence.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-17 iteration 43 result

Implemented:
- Added a shared `statementReadyToPresent()` helper so statement cards, trial controls, test state, and stage cues use the same readiness rule.
- Added an in-scene `破绽已现` cue after a suspicious testimony sentence has been pressed and is ready for evidence/profile presentation.
- Changed the stage focus for pressed suspicious statements to keep the witness in a stronger `shock` pose instead of only changing right-side controls.
- Raised trial portraits above the dialogue box on desktop so both sides remain visible during cross-examination.
- Added mobile-specific trial staging: taller courtroom scene, smaller raised portraits, compact top-right vulnerability cue, and hidden duplicate scene labels/camera notices so portraits are not covered.
- Added project-local npm metadata with `playwright` as a dev dependency plus `check:js`, `check:py`, and `qa:web-game` scripts.
- Updated README local verification instructions to use the npm scripts and document the Playwright/Chromium requirement.

Verified:
- `npm run check:js`
- `npm run check:py`
- `git diff --check`
- Public text scan on `game/`: old opaque evidence wording did not reappear.
- `npm run qa:web-game` now runs successfully with project-local Playwright after installing Chromium; only the external skill script's module-type warning remains.
- Browser 1440x810 clean first-case flow reached trial, pressed statement 2, and confirmed `readyToPresent=true`, `stageNotice=破绽已现`, both portraits above the dialogue box, vulnerability cue above the dialogue box, and no page overflow.
- Browser 390x844 clean first-case flow confirmed `readyToPresent=true`, no horizontal overflow, duplicate mobile trial scene labels hidden, both portraits above the dialogue box, and vulnerability cue above the dialogue box.
- Screenshots inspected: `iteration43-vulnerability-cue-desktop-final.png` and `iteration43-vulnerability-cue-mobile-final2.png`.

Remaining Ace Attorney gap list:
- Courtroom now reacts visually when a contradiction is ready, but the actual objection still lacks a dedicated timing pause and player-triggered dramatic cut-in.
- Portrait staging is more readable, but the cast still shares one generated pose sheet rather than bespoke animation strips per character.
- Investigation hotspots are still generic per-location slots rather than hand-authored positions for each scene.
- Court Record thumbnails still use archetype art rather than bespoke art for every individual evidence card.

## 2026-06-17 iteration 42 result

Implemented:
- Added an explicit `可举证` opportunity state after a suspicious testimony sentence has been pressed.
- Highlighted the Court Record button and selected-record helper bar only when the current statement is ready for evidence/profile presentation.
- Kept the formal `举证` button visually secondary until a record is selected; selecting evidence still does not auto-submit.
- Changed the helper copy from generic instruction to contextual prompts such as `破绽已经逼出来了。打开证物记录，选中能推翻当前句的证物。`.
- Closed the Court Record drawer as soon as a formal present action is submitted, so success/failure feedback is not hidden behind the record UI.
- Removed the permanent Court Record side panel from testimony-transition interludes; correct objections now show the result, next testimony, and continue button as the main stage content.
- Exposed per-statement `readyToPresent` and top-level `readyToPresent` in `window.render_game_to_text()` for deterministic checks.

Verified:
- `node --check game/app.js && node --check game/game-data.js`
- `python3 -m py_compile scripts/build_game_content.py scripts/parse_epub_to_markdown.py`
- `git diff --check`
- Public text scan on `game/`: old opaque evidence wording did not reappear.
- Browser 1440x810 clean-save flow: main menu -> first-case briefing -> investigation; collected all six first-case investigation evidence through scene hotspots and entered trial only after `canStartTrial=true`.
- Browser cross-examination flow: clicked statement 2, pressed it, confirmed `readyToPresent=true`, active statement card shows `readyToPresent=true`, record button and selected-record bar are in opportunity state, and the present button remains unhighlighted before selecting a record.
- Browser correct-present flow: selected `摇篮旁的值夜签`, confirmed the present button becomes the opportunity action, clicked `举证`, and reached `trial-interlude` with `recordOpen=false`, no `.record-panel`, no `.record-scrim`, and `impactTitle=异议成立`.
- Desktop page stayed single-window throughout the checked trial states: `document.body.scrollHeight == innerHeight` and `document.body.scrollWidth == innerWidth` at 1440x810.
- Screenshots inspected: `iteration42-ready-present-opportunity-final.png` and `iteration42-correct-present-interlude-final.png`.

Remaining Ace Attorney gap list:
- Cross-examination now clearly separates press -> identify contradiction -> select record -> present, but it still lacks character-by-character timing and a stronger animated objection timing beat.
- Statement cards are readable and stateful, but future polish should add per-witness expression changes when a statement becomes vulnerable.
- Investigation hotspots are in the background scene, but hotspot coordinates are still generic per-location slots rather than hand-authored scene-specific positions for every case.
- Court Record thumbnails still use archetype art rather than bespoke art for every individual evidence card.

## 2026-06-17 iteration 41 result

Implemented:
- Replaced the trial statement number dots with readable, clickable statement cards.
- Each statement card now shows its index, a one-line statement preview, and a status label: `未追问`, `有疑点`, `已追问`, `新证词`, or `已突破`.
- Added direct statement jumping via `data-jump-statement`, so players can click a testimony sentence instead of only using previous/next.
- Kept previous/next and keyboard flow intact while making the cross-examination state easier to scan.
- Added `statementIndex` and structured `statementCards` to `window.render_game_to_text` for deterministic browser validation.

Verified:
- Clean browser flow collected all first-case investigation evidence and entered trial.
- Browser clicked the third statement card; `statementIndex` changed to 3 and the active card moved to statement 3.
- Browser pressed the active statement; the active card became `pressed=true` and the press response appeared.
- Desktop 1440x810 trial layout kept the statement card list, right trial panel, courtroom scene, and equal-width action buttons inside the viewport.
- Mobile 390x844 trial layout had no horizontal overflow; statement cards and trial buttons stayed within the viewport width.
- Screenshot inspected: `iteration41-statement-cards-trial.png`.
- `node --check game/app.js && node --check game/game-data.js`
- `python3 -m py_compile scripts/build_game_content.py scripts/parse_epub_to_markdown.py`
- `git diff --check`
- Public text scan on `game/`: old opaque evidence wording did not reappear.
- GitHub Pages URL returned HTTP 200: `https://oubeichen.github.io/wu-zhou-turnabout/`.
- Required develop-web-game client was attempted, but the local skill script still failed with `ERR_MODULE_NOT_FOUND: Cannot find package 'playwright'`; MCP browser verification is the authoritative interaction evidence.

Remaining Ace Attorney gap list:
- Cross-examination now has readable clickable statement cards, but it still lacks dramatic per-statement typewriter timing and stronger objection timing windows.
- Suspicious statements are labeled, but future polish should distinguish “safe to press” from “ready to present” more cinematically.
- Main investigation hotspot positions are still generic per-location slots rather than hand-authored coordinates for every scene.
- Court Record thumbnails still use archetype art rather than bespoke art for every evidence card.

## 2026-06-17 iteration 40 result

Implemented:
- Moved investigation examine targets from the right-side mini map into the main background scene as clickable `scene-hotspot` buttons.
- Removed the duplicate right-side hotspot list; the right column now serves as location context, clue close-up, command mode, and bottom actions.
- Widened the desktop game container from 1180px to 1440px so 16:9 screens use more horizontal space instead of compressing content into a centered narrow column.
- Reworked desktop investigation into a wide scene plus 380-440px tool column; tightened the clue board and command status rows to avoid local scrolling for core actions.
- Reworked desktop trial into a wide left courtroom scene plus right trial panel, fixing the prior off-screen trial controls.
- Made trial action buttons equal width in desktop mode.
- Upgraded investigation feedback beats with portrait, previous/next/close controls, and Enter/Space progression.
- Added the fixed GitHub Pages play link and useful README badges for Pages, static game, and vanilla JS.

Verified:
- Browser 1440x810 main menu uses a 1412px app width and no page scroll.
- Browser investigation page shows two main-scene hotspots and zero old `.location-map .hotspot` buttons.
- Clicking a main-scene hotspot switches command state to `examine`, collects evidence, and opens the two-step investigation dialogue.
- Investigation dialogue advances with Enter, supports previous line, and can be closed.
- Investigation right column has no clipped map, clue, or command content after layout tuning.
- Browser trial page now keeps both courtroom scene and trial panel within the viewport; action buttons are equal width.
- Mobile 390x844 investigation check has no horizontal overflow; scene hotspots become full-width mobile buttons.
- Screenshots inspected: `iteration40-investigation-hotspots-wide.png` and `iteration40-trial-wide-layout.png`.
- `node --check game/app.js && node --check game/game-data.js`
- `python3 -m py_compile scripts/build_game_content.py scripts/parse_epub_to_markdown.py`
- `git diff --check`
- Public text scan on `game/`: old opaque evidence wording did not reappear.
- Required develop-web-game client was attempted, but the local skill script still failed with `ERR_MODULE_NOT_FOUND: Cannot find package 'playwright'`; MCP browser verification is the authoritative interaction evidence.

Remaining Ace Attorney gap list:
- Main investigation now uses background hotspots like Ace Attorney, but hotspot positions are still generic per-location slots rather than hand-authored coordinates for every scene.
- Trial layout is now visible and aligned on wide screens, but cross-examination could still use a more explicit statement list and objection timing polish.
- README has badges and a fixed Pages URL, but the online deployment should be checked after GitHub Actions completes on `origin/main`.
- Court Record thumbnails still use archetype art rather than bespoke art for every evidence card.

## 2026-06-17 iteration 39 result

Implemented:
- Turned investigation feedback beats into two-step player-readable dialogue for examine, talk, and present actions.
- Added a compact `1/2` step badge and an explicit `继续` button inside the investigation beat layer, so important feedback is staged like dialogue instead of being dumped into one dense block.
- Added current beat line speaker/text fields to `window.render_game_to_text` for deterministic browser checks.
- Kept evidence selection separate from any trial-style formal submission; investigation present remains a low-risk prompt-gathering action.
- Added `README.md` with project background, gameplay loop, technical structure, local usage, QA commands, and continuing development standards.
- Added `.github/workflows/pages.yml` to validate static files and deploy the `game/` directory through GitHub Pages on pushes to `main`.

Verified:
- Browser desktop 1366x768 flow from clean localStorage through main menu -> first case -> investigation.
- `查看` first clue: confirmed evidence collection, beat `1/2`, explicit continue button, and page height equal to viewport height.
- `查看` continue: confirmed beat `2/2`, speaker switched to `辩方`, continue button disappeared, and no page scroll was introduced.
- `交谈` topic and `出示` evidence both confirmed the same two-step progression and single-window desktop layout.
- Screenshot inspected: `iteration39-investigation-continue.png`.
- `node --check game/app.js`
- `node --check game/game-data.js`
- `python3 -m py_compile scripts/build_game_content.py scripts/parse_epub_to_markdown.py`
- `git diff --check`
- Public text scan on `game/`: old opaque `章节卷宗` / `已选中。需要正式提交` style strings did not reappear.
- Required develop-web-game client was attempted, but the local skill script failed with `ERR_MODULE_NOT_FOUND: Cannot find package 'playwright'`; browser MCP verification is the authoritative interaction evidence for this iteration.

Remaining Ace Attorney gap list:
- Investigation feedback now has staged dialogue, but it is still a compact two-beat layer rather than a full character-by-character dialogue box with history controls.
- GitHub Pages CI can publish the playable static game, but no GitBook-style generated manual site exists yet beyond the README and online game build.
- Court Record thumbnails still use archetype art rather than bespoke art for every evidence card.
- Audio tracks remain procedural placeholders rather than fully authored soundtrack compositions.


## 2026-06-17 content text generation rewrite

已完成：
- 重写 `scripts/build_game_content.py` 中的证物生成：证物从“章节卷宗”改为玩家可理解的道具/档案卡，例如后位奏章、东宫账册、告密原札、瓮口烙痕、夜门更漏牌。
- 每个案件新增 `openingLines`，用于后续主线程展示更具体的开场引入。
- 调整案件目标、调查地点描述、交谈文本、查看文本，让调查阶段更像现场搜证和人物对话。
- 重写证词、追问、错误举证反馈和异议文本，重点改成角色说话、证物矛盾和玩家能理解的反驳点。
- 保留原证物 ID 顺序、证词字段名和人物档案举证结构，避免破坏现有前端庭审逻辑。

验证：
- `python3 scripts/build_game_content.py`：通过，生成 5 个案件。
- 生成数据基础检查：5 个案件均有开场引入；34 件证物均有 name/summary/detail/use；证词中的 evidence/profile 引用均可解析。
- 抽象模板词扫描：未发现 `本卷用于定位`、`结构性矛盾`、`制度压力`、`过度简化`、`章节卷宗` 等旧模板词。
- 按本轮写入范围要求，运行生成脚本后已恢复 `game/game-data.js`，最终只保留脚本与进度文件变更。

## 2026-06-17 iteration 34 result

Implemented:
- 重新生成并保留玩家向 `game/game-data.js`：证物不再是“卷宗说明”，改为具体道具/档案卡，并保留章节来源作为短标签。
- 案件简介页接入 `openingLines` 开场对白，让每案先有冲突和角色动机，再进入调查。
- 法庭记录从常驻右栏改为调查/庭审阶段可打开、可关闭的抽屉；案件简介页不再显示记录面板。
- 庭审主界面默认只保留当前对话、证词条、信誉、提示和核心操作；右侧证物菜单必须点击“记录”才出现。
- 新手提示可隐藏；证物选择不会自动提交；错误举证后清空选择，玩家能立即回到当前证词继续操作。
- `.gitignore` 新增本地 John 状态、Playwright 输出、截图和缓存忽略规则。

Verified:
- `python3 scripts/build_game_content.py`
- `python3 -m py_compile scripts/build_game_content.py`
- `node --check game/app.js`
- `git diff --check`
- 旧模板词扫描：`game/` 中未发现 `本卷用于定位`、`结构性矛盾`、`制度压力`、`过度简化`、`章节顺序`、`本案推理`、`主人` 等公开文案问题。
- Playwright 断言通过：案件简介无常驻记录；调查记录默认关闭且可打开/关闭；证物详情不含旧模板词；庭审记录默认关闭；隐藏提示、证物不足开庭拦截、选择不提交、错误举证恢复均通过。
- 截图已检查：`output/web-game/iteration34-investigation-drawer-text.png`、`output/web-game/iteration34-trial-main-only.png`。

Remaining Ace Attorney gap list:
- 仍需要更像章节式视觉小说的“主菜单/继续/读档/设置”入口，而不是直接把案件画廊放在首屏。
- 后续应继续按案件增加更具体的证人个性和语气差异，减少所有证人共享的句式。
- 法庭记录抽屉已解决信息堆叠，但移动端还需要专门复查抽屉高度、关闭按钮和底部操作按钮触达性。
- 证物美术已有独立图集，但仍是统一卡牌风格；后续可为关键证物补更具体大图。

## 2026-06-17 iteration 35 result

Implemented:
- 将首页从直接展示案件画廊改为正式主菜单，首屏只保留标题、进度、当前继续案件预览和四个主操作。
- 新增主菜单入口：`继续/开始新案`、`案件选择`、`结案档案`、`设置`。
- 案件选择与结案档案改成二级界面，需要从主菜单点击进入，并提供返回主菜单按钮。
- `render_game_to_text` 新增 `homeView`、`continueCase`、`continueCaseIndex`、`continueLabel`，便于验证主菜单状态和继续入口。
- 移除主菜单默认新手提示卡，避免首屏再次堆叠教程内容；提示仍可通过顶部“提示”打开。

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- 公开 `game/` 文案扫描无旧模板词和内部路径。
- Playwright 桌面断言：首屏为主菜单；案件画廊和结案档案不在首屏；案件选择、结案档案、返回主菜单、继续入口均可用。
- Playwright 移动端断言：390px 宽度下主菜单无横向溢出，四个主菜单按钮可见。
- develop-web-game 客户端已运行并检查截图：`output/web-game/iteration35-client/shot-0.png`。

Remaining Ace Attorney gap list:
- 主菜单已成型，但仍缺“读档/存档槽”式管理；当前只有 localStorage 自动存档。
- 需要继续增加证人差异化表达，让每案证人和对手的语气更明显。
- 结案档案仍偏统计面板，后续应做成更有“案件档案册”质感的可翻阅界面。
- 关键证物仍只有卡面缩略图，后续可给每案核心证物补大图或特写演出。

## 2026-06-17 iteration 36 result

Implemented:
- 顶部返回入口从含糊的“案”改为明确的“菜单”，点击后强制回到主菜单视图。
- 修复“重置当前案”后继续入口错误跳到第 2 案的问题：继续逻辑现在优先当前未完成案，重置时同步当前案和首页焦点。
- 新增主菜单“存档/读档”二级界面，包含自动存档摘要和 3 个手动存档槽；手动读取后回到主菜单，不直接把玩家丢进案件中。
- 桌面端改为游戏式单屏布局：页面本身禁止滚动，案件选择、调查、存档等长内容收进局部面板。
- 案件选择页改成当前档案摘要 + 可见案件画廊，避免卡片被主菜单或长档案挤到窗口外。
- 调查页改成左侧主舞台、右侧地图/线索/指令三段式布局；法庭记录保持抽屉，不再占用隐藏列。
- 更新 `.gitignore`，排除本轮浏览器调试生成的 `wuzetian-*.png` 截图。
- 将证物选中提示改成更直观的玩家语言，强调“选中”和“举证提交”不是同一步。

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- 公开 `game/` 文案扫描无旧模板词和“已选中。需要正式提交”等生硬提示。
- develop-web-game 客户端尝试运行，但当前技能脚本环境缺少 `playwright` 包，记录为工具环境限制。
- Browser/in-app browser 验证：桌面首页、案件选择页、调查页、存档页的 `bodyScrollHeight` 等于视口高度；调查页“开始调查”后主舞台和右侧操作区在同一窗口内可见。
- Browser/in-app browser 验证：第二案有进度时，回第一案执行“重置当前案”，返回主菜单后“当前继续”仍为第一案。
- Browser/in-app browser 验证：存档页保存到槽 1 后，“读取”按钮可用，三个槽位保持在桌面单屏内。

Remaining Ace Attorney gap list:
- 桌面端已做到页面级单屏，但部分右侧局部面板仍需要内部滚动；后续可继续压缩调查指令内容，让关键按钮不被局部滚动遮住。
- 需要继续增加证人差异化表达，让每案证人和对手的语气更明显。
- 结案档案仍偏统计面板，后续应做成更有“案件档案册”质感的可翻阅界面。
- 关键证物仍只有卡面缩略图，后续可给每案核心证物补大图或特写演出。

## 2026-06-17 iteration 37 result

Implemented:
- 继续收紧 PC 调查页单屏操作：将调查指令内容包进 `.command-body`，底部 `案件概要 / 记录 / 开庭` 独立为 `.investigation-actions`。
- 桌面调查页取消常驻书记提示卡，把提示入口留给顶部“提示”，腾出空间给真正操作按钮。
- 桌面调查页的移动/查看/交谈/出示列表改为紧凑按钮名，详细说明由场景地图、线索板、对话框承载，避免长描述挤压按钮。
- 修复地点描述从压缩按钮中漏出的视觉问题。

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- 公开 `game/` 文案扫描无旧模板词和生硬选中提示。
- 浏览器验证桌面调查页 `bodyScrollHeight == innerHeight`；移动、查看、交谈、出示四个指令模式下，命令按钮和 `案件概要 / 记录 / 开庭` 均在当前窗口内可见。
- 截图已检查：`iteration37-investigation-actions-clean.png`，确认右侧命令按钮不再被文字挤压，底部操作直接可点。
- develop-web-game 客户端仍因技能脚本环境缺少 `playwright` 包失败；本轮交互验证由浏览器工具完成。

Remaining Ace Attorney gap list:
- 调查页 PC 单屏操作已明显改善；下一步应让“查看/交谈”后的反馈更像逆转裁判式短对话演出，而不是只更新一条说明。
- 需要继续增加证人差异化表达，让每案证人和对手的语气更明显。
- 结案档案仍偏统计面板，后续应做成更有“案件档案册”质感的可翻阅界面。
- 关键证物仍只有卡面缩略图，后续可给每案核心证物补大图或特写演出。

## 2026-06-17 iteration 38 result

Implemented:
- 为调查阶段新增 `investigationBeat` 演出状态，用于当前查看、交谈、出示反馈，不写入存档，避免破坏旧存档兼容。
- 左侧现场画面新增 `investigation-beat` 浮层，显示行动类型、说话人、核心反馈和新取得证物，让调查反馈更像短对白/现场记录，而不是普通系统说明。
- `查看` 会显示“证物取得 / 没有新的证物”，并把新证物名称单独列出。
- `交谈` 会显示实际说话人和“证言已记录”。
- `出示` 会显示证人反应和“出示反应”。
- 切换指令、移动地点、重新进入调查会清空旧调查演出，避免误导玩家。
- `render_game_to_text` 新增 `investigationBeatKind`、`investigationBeatSpeaker`、`investigationBeatResult`，用于自动化验证。
- 补充窄屏样式，调查演出层在移动端改为更安全的换行布局，降低横向溢出风险。

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- 公开 `game/` 文案扫描无旧模板词和生硬选中提示。
- 浏览器验证：初始调查无演出层；点击查看后出现“查看 / 调查 / 证物取得 / 新证物”；点击交谈后出现说话人和“证言已记录”；点击出示后出现证人反应和“出示反应”。
- 浏览器验证：桌面调查页添加演出层后仍保持 `bodyScrollHeight == innerHeight`。
- 截图已检查：`iteration38-investigation-beat.png`，确认演出层不遮挡右侧操作区。
- in-app browser 移动端点击验证本轮仍遇到浏览器控制超时；已补移动端 CSS 保护规则，移动交互需后续在浏览器恢复稳定后复查。
- develop-web-game 客户端仍因技能脚本环境缺少 `playwright` 包失败；本轮交互验证由浏览器工具完成。

Remaining Ace Attorney gap list:
- 调查反馈已有短演出，但仍是单句反馈；后续可为关键线索做两到三句连续对白和“继续”推进节奏。
- 需要继续增加证人差异化表达，让每案证人和对手的语气更明显。
- 结案档案仍偏统计面板，后续应做成更有“案件档案册”质感的可翻阅界面。
- 关键证物仍只有卡面缩略图，后续可给每案核心证物补大图或特写演出。

## 2026-06-16 baseline gap audit

Current game is a functional prototype, not yet a complete Ace Attorney-like game.

High-priority gaps:
- Investigation is too shallow: current flow is only clicking locations to auto-collect evidence. Needs move/examine/talk/present style verbs, location-specific responses, progress hints, and optional flavor.
- Court Record is too flat: current evidence list is always visible and mixes evidence/profiles. Needs a record drawer with evidence, profiles, timeline, selected detail, source notes, and trial selection behavior.
- Trial rhythm is too simple: current cross-examination jumps one contradiction per testimony. Needs stronger pacing, press responses, wrong-evidence penalty feedback, objection animation, and clearer current statement state.
- Presentation is too static: no dramatic title/case splash, courtroom speaker framing, character portrait treatment, objection banner, motion settings, or readable mobile HUD.
- Modern UX is missing: no settings, no text speed, no backlog, no keyboard flow, no reset controls, no `render_game_to_text`, no deterministic test hook.
- Content density is thin: case data exists but lacks per-location talk/examine content, profiles tied to cases, timeline events, and richer verdict/case intro structure.

Iteration 1 target:
- Upgrade data generator and static UI without adding a build step.
- Preserve standalone local hosting.
- Keep public UI free of John internals and large source-text dumps.
- Add deterministic text-state hooks for playtesting.

## 2026-06-16 iteration 1 result

Implemented:
- Data model now includes case timelines, per-location talk topics, examine spots, evidence details, evidence use text, and testimony mood metadata.
- Investigation now has four commands: 移动, 查看, 交谈, 出示.
- Court Record now has tabs: 证物, 人物, 时间线, 记录.
- Evidence detail panel shows type, source, reasoning detail, and intended use.
- Trial now has statement position indicators, richer press/present flow, objection and penalty banners, keyboard controls, and backlog.
- Settings panel added: text speed, reduced motion, reset current case, keyboard hint.
- Added `window.render_game_to_text` and `window.advanceTime` for automated playtesting.

Verified:
- `node --check game/app.js`
- regenerated game data and checked all five cases for evidence reachability, investigation content, testimony answer validity, and timeline density
- John UI leak scan on `game/`: passed
- develop-web-game Playwright client: ran against local server and produced `output/web-game/shot-0.png` plus `state-0.json`
- Browser interaction pass: entered first case, used investigation commands to collect 6/6 evidence, checked profiles/timeline tabs, completed the trial through verdict
- Mobile viewport 390px: no horizontal overflow
- Browser console: no errors

Remaining Ace Attorney gap list:
- Result and trial screens still do not fully use wide-screen composition; add more cinematic courtroom staging and split foreground/background treatment.
- Character presentation is symbolic; replace with generated or authored portraits for major roles.
- No audio yet; add objection sting, UI ticks, verdict cue, and settings mute toggle.
- Case content is still templated; add case-specific witness dialogue, contradictions, and optional wrong-present responses per case.
- Trial branches are linear three-stage flows; add multi-statement testimony with optional press unlocks and evidence revealed by pressing.
- Investigation should eventually include hotspot map art or visual locations rather than only button lists.

## 2026-06-16 iteration 2 result

Implemented:
- Generated an original Tang-dynasty palace courtroom background with the built-in image generation tool.
- Copied the generated asset into `game/assets/courtroom-bg-v1.png` and connected it to the trial scene.
- Added settings-controlled Web Audio cues: click, objection, penalty, verdict, plus mute toggle.
- Fixed topbar settings handling; status bar buttons now share the same event handling as the game surface.
- Increased testimony density to at least three statements per testimony, with the contradiction hidden in the middle.
- Added a press-before-present rule for contradiction statements. Presenting the right evidence before pressing is blocked with feedback rather than advancing.
- Statement strip now marks pressed statements.
- Centered verdict layout for stronger wide-screen composition.

Verified:
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright browser checks: settings panel opens from topbar and shows mute option; investigation still exposes four commands
- Playwright trial check: first premature present is blocked, pressing unlocks contradiction, three correct presents still reach verdict
- Screenshot inspected: `output/web-game/trial-generated-bg.png` confirms generated courtroom background loads in the trial scene
- Screenshot inspected: `output/web-game/verdict-denser-testimony.png` confirms verdict layout is centered and readable

Remaining Ace Attorney gap list:
- Character presentation is still symbolic; generate/import portraits and give each major role a persistent visual identity.
- Trial scene has improved background, but no animated camera cuts or witness entrance transitions.
- Audio is synthesized tones; future iteration should add richer generated or authored sound effects if acceptable.
- Case-specific branches are stronger but still structurally similar across cases; add bespoke wrong-answer feedback and optional press-only evidence reveals per case.
- Investigation still uses command lists instead of image hotspots. A future iteration should create visual investigation maps.

## 2026-06-16 iteration 3 result

Implemented:
- Generated a five-character portrait sheet with the built-in image generation tool and saved it as `game/assets/character-sheet-v1.png`.
- Added portrait metadata to all profiles and per-case witness/opponent portrait routing.
- Replaced symbolic letter portraits in trial/investigation scenes with cropped character art from the sheet.
- Added portrait thumbnails to the 人物 tab in the Court Record.
- Added a visual investigation map layer with two clickable hotspots per location.
- Generated a dedicated investigation room background and saved it as `game/assets/investigation-room-v1.png`.
- Replaced the old EPUB-derived investigation backgrounds with the generated room art.
- Fixed mobile hotspot layout so hotspot buttons stack instead of overlapping.

Verified:
- `python3 scripts/build_game_content.py`
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- develop-web-game client produced `output/web-game/iteration3/state-0.json`.
- Playwright checks confirmed: portrait data exists, profile thumbnails render, trial portraits use `character-sheet-v1.png`, investigation map uses `investigation-room-v1.png`, first case can still complete through verdict.
- Screenshot inspected: `output/web-game/iteration3/trial-character-portraits.png`.
- Screenshot inspected: `output/web-game/iteration3/investigation-consistent-bg.png`.
- Screenshot inspected after mobile fix: `output/web-game/iteration3/mobile-hotspots-fixed.png`.

Remaining Ace Attorney gap list:
- Add witness entrance/camera-cut style transitions and stronger testimony start/end animations.
- Add press-only evidence unlocks or optional clues so some evidence appears from cross-examination rather than only investigation.
- Add bespoke wrong-evidence responses per case and per testimony.
- Add per-case custom investigation backgrounds or location variants instead of one shared room.
- Improve case select with episode completion medals and replay/continue distinction.

## 2026-06-16 iteration 4 result

Implemented:
- Added one trial-only evidence item per case, obtained only by pressing the final testimony.
- Updated investigation completion so trial can start after all investigation evidence is collected while still showing that courtroom questioning may reveal more.
- Added press-only evidence unlock flow and locked Court Record wording for trial-only clues.
- Added bespoke wrong-evidence feedback to testimony statements.
- Added mistake counting and post-verdict grades: 无瑕逆转, 稳健逆转, 险胜逆转.
- Updated case cards and verdict screen to show completion state and grades.

Verified:
- `python3 scripts/build_game_content.py`
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright checks confirmed: investigation evidence reaches 6/7, trial starts, wrong evidence increases mistakes, final press unlocks 追问札记, final contradiction requires the new trial-only evidence, verdict grade appears, and case select shows completion.
- Screenshots inspected: `output/web-game/iteration4/wrong-evidence-feedback.png`, `output/web-game/iteration4/press-unlocked-note.png`, `output/web-game/iteration4/verdict-grade.png`, `output/web-game/iteration4/case-select-grade.png`.

Remaining Ace Attorney gap list:
- Trial staging still needs witness entrance and camera-cut feedback instead of only text and banners.
- Result page needs tighter viewport fitting on common desktop heights.
- The courtroom loop still lacks stronger mid-trial presentation rhythm for transitions between testimony blocks.
- Completion grades exist, but broader replay affordances and medals could be richer.
- Each case still shares the same broad structural template; future work should make later cases more bespoke.

## 2026-06-16 iteration 5 result

Implemented:
- Added courtroom stage state with `stageFocus` and `stageNotice` for witness, defense, record, opponent, clash, and verdict moments.
- Added witness entrance notice when entering trial.
- Added testimony header showing cross-examination count, testimony title, speaker, and mood.
- Added visible camera notices, spotlight treatment, portrait focus, and reduced-motion handling for courtroom transitions.
- Connected stage focus to statement movement, pressing, evidence unlocks, wrong evidence, correct contradiction hits, testimony transitions, and verdict.
- Added stage state to `window.render_game_to_text` for deterministic testing.
- Fixed result screen scroll reset and compressed verdict layout so main action buttons fit within a 1280x720 viewport.

Verified:
- `python3 scripts/build_game_content.py`
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- develop-web-game client ran against `http://127.0.0.1:8787/game/` and captured `output/web-game/iteration5-client/`.
- Playwright end-to-end check confirmed trial entrance notice, press focus, wrong-evidence opponent focus, trial-only evidence unlock, verdict focus, grade, and no console errors.
- Viewport assertion confirmed the result action button is fully visible at 1280x720.
- Screenshots inspected: `output/web-game/iteration5/trial-entrance-camera.png`, `output/web-game/iteration5/press-camera-focus.png`, `output/web-game/iteration5/wrong-evidence-opponent-focus.png`, `output/web-game/iteration5/record-unlock-camera.png`, `output/web-game/iteration5/verdict-fit-720.png`.

Remaining Ace Attorney gap list:
- Add stronger case-specific investigation scenes or location variants instead of a shared archive-room background.
- Add more bespoke testimony structures for later cases: optional dead-end statements, profile-based contradictions, and case-specific branch dialogue.
- Add richer replay/medal presentation and a clearer completed-case gallery.
- Audio is still synthesized tones; authored sound effects would improve feel.
- Trial camera focus is now visible, but witness entrance could become a short modal-free animation sequence with speaker-specific poses.

## 2026-06-16 iteration 6 result

Implemented:
- Added one profile-based contradiction to every case, requiring the player to present a 人物档案 rather than a chapter evidence card.
- Expanded generated profiles from 5 to 12 so every case witness and opponent can appear in the Court Record.
- Updated Court Record selection so evidence and profiles are mutually exclusive presentable records.
- Updated trial present logic to support both `answerEvidence` and `answerProfile`.
- Fixed trial progression for multi-contradiction testimony: a testimony now advances only after all answerable statements in that testimony are solved.
- Added solved statement markers to the testimony strip.
- Added selected profile detail copy explaining that people can be presented in court.
- Added `selectedProfile` to `window.render_game_to_text` for deterministic testing.

Verified:
- `python3 scripts/build_game_content.py`
- `node --check game/app.js`
- data integrity check confirmed all five cases have one profile contradiction and no missing profile references
- John UI leak scan on `game/`: passed
- `git diff --check`
- develop-web-game client produced `output/web-game/iteration6-client/shot-0.png` and `output/web-game/iteration6-client/state-0.json`.
- Playwright end-to-end check confirmed wrong profile present reduces credibility, correct profile present solves only one contradiction, the same testimony does not advance until the evidence contradiction is also solved, and the case still reaches verdict.
- Mobile viewport check at 390px confirmed 12 profile buttons render without horizontal overflow.
- Screenshots inspected: `output/web-game/iteration6/wrong-profile-selected.png`, `output/web-game/iteration6/wrong-profile-feedback.png`, `output/web-game/iteration6/correct-profile-selected.png`, `output/web-game/iteration6/profile-contradiction-partial-solve.png`, `output/web-game/iteration6/after-second-contradiction-advance.png`, `output/web-game/iteration6/profile-flow-verdict.png`, `output/web-game/iteration6/mobile-profiles.png`.

Remaining Ace Attorney gap list:
- Case investigation backgrounds are still shared; add location-specific scene art or distinct visual states per case.
- Later cases should receive more bespoke contradiction paths, not just the same structural pattern with different names.
- Add a clearer completed-case gallery with medals, replay labels, and per-case performance history.
- Add authored or generated sound effects beyond synthesized tones.
- Add stronger witness entrance pose changes and short transition beats between multiple contradictions in the same testimony.

## 2026-06-16 iteration 7 result

Implemented:
- Added persistent per-case completion records separate from the current trial state.
- Added medals mapped from verdict grades: 金章, 银章, 铜章.
- Added best grade, best mistakes, last grade, last mistakes, and clear count to saved records.
- Added a 结案档案 section on the home screen with per-case medals and best results.
- Upgraded case cards to show medals, best grades, clear counts, and separate 查看案件 / 重审此案 actions.
- Added replay flow that clears current investigation/trial progress but preserves best records.
- Updated verdict screen with current medal, best medal, current mistakes, best mistakes, and clear count.
- Added best-grade fields to `window.render_game_to_text` for automated checks.
- Fixed completion counting so the first verdict counts as one clear, not two.

Verified:
- `python3 scripts/build_game_content.py`
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- develop-web-game client produced `output/web-game/iteration7-client/shot-0.png` and `output/web-game/iteration7-client/state-0.json`.
- Playwright end-to-end check confirmed first flawless clear yields 金章, home archive shows the medal, replay clears current progress while preserving best medal, a later one-mistake clear yields 稳健逆转 while best remains 金章, and clear count increments to 2.
- Mobile viewport check confirmed awards home has no horizontal overflow.
- Screenshots inspected: `output/web-game/iteration7/gold-verdict-record.png`, `output/web-game/iteration7/home-medal-archive.png`, `output/web-game/iteration7/archive-panel-visible.png`, `output/web-game/iteration7/replay-preserves-best.png`, `output/web-game/iteration7/silver-run-best-gold.png`, `output/web-game/iteration7/mobile-awards-home.png`.

Remaining Ace Attorney gap list:
- Case investigation backgrounds are still shared; add location-specific scene art or scene states per case.
- Later cases still need more bespoke contradiction structures and optional dead ends.
- Completion archive now exists, but could become a richer gallery with case art and individual performance history rows.
- Audio is still synthesized tones; add authored/generated UI stings and courtroom ambience.
- Witness entrance could use more pose/state changes instead of only focus and notice transitions.

## 2026-06-16 iteration 8 result

Implemented:
- Added case-specific investigation scene metadata for all five cases, including scene key, public scene name, visual motif, and tone text.
- Added location variants for each case: primary incident site, archive review, and defense preparation.
- Updated investigation rendering so the current scene applies distinct palette, watermark, atmosphere text, and location-map note.
- Updated the visual map layer so scene states are visible even when locations share the same base generated room image.
- Added `scene` and `sceneVariant` fields to `window.render_game_to_text` for deterministic Playwright checks.
- Fixed hotspot/card positioning after screenshot review so desktop scene buttons no longer crowd the dialogue layer.

Verified:
- `python3 scripts/build_game_content.py`
- `node --check game/app.js`
- data integrity check confirmed all five cases have scene key, motif, tone, and the expected `site`, `archive`, `defense` location variants
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright five-case scene check confirmed each case opens with the expected public scene name, the matching scene CSS class, a non-empty map note, and location transitions to `archive` / `defense` variants.
- develop-web-game client produced `output/web-game/iteration8-client/shot-0.png` and `output/web-game/iteration8-client/state-0.json`.
- Mobile viewport check confirmed the final-case night-gate scene has no horizontal overflow.
- Screenshots inspected: `output/web-game/iteration8/case-1-scene-fixed.png`, `output/web-game/iteration8/case-5-scene-fixed.png`, `output/web-game/iteration8/mobile-night-gate-fixed.png`.

Remaining Ace Attorney gap list:
- The scene system now differentiates cases, but still uses one generated room base; future work should add actual per-case generated backgrounds or layered props.
- Later cases still need more bespoke contradiction paths, optional dead-end statements, and unique cross-examination branches.
- Completion archive could become a richer gallery with case art, history rows, and replay filters.
- Audio is still synthesized tones; add authored/generated courtroom ambience and stronger stings.
- Witness entrance and testimony transitions need speaker-specific pose/state changes rather than only focus, notice, and palette effects.

## 2026-06-17 iteration 9 result

Implemented:
- Rebuilt the home screen into a chapter-style case gallery with poster-like case cards, visible scene motifs, focused selection state, and separate 查看档案 / 进入案件 / 重审此案 actions.
- Added a large focused case dossier with scene name, progress state, evidence count, testimony count, source chapter list, medal seal, best mistakes, clear count, and latest grade.
- Added persistent recent-run history to per-case records. Each completed verdict now stores the latest six run rows with grade, medal, mistakes, and timestamp while preserving best medal logic.
- Upgraded the 结案档案 panel with overall gold count, solved count, total clear count, and per-case replay links that focus the dossier.
- Added `homeFocusCase`, `homeFocusScene`, and `homeFocusRuns` to `window.render_game_to_text` for automated verification.
- Fixed home navigation scroll behavior: returning from verdict resets to the top, while 查看档案 / 查看复盘 scrolls the focused dossier under the sticky header instead of leaving the player stranded at the card grid.

Verified:
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop flow confirmed: focus final case, complete first case from fresh save through investigation and trial, receive 金章 verdict, return home with scroll reset to 0, and see one recent run in the focused dossier.
- Playwright focus-scroll checks confirmed desktop and 390px mobile views align the dossier at 86px below the top bar and have no horizontal overflow.
- develop-web-game client produced `output/web-game/iteration9-client-final/shot-0.png` and `output/web-game/iteration9-client-final/state-0.json`.
- Screenshots inspected: `output/web-game/iteration9/desktop-focus-scroll.png`, `output/web-game/iteration9/mobile-focus-scroll.png`, `output/web-game/iteration9/home-history-after-clear-fixed.png`, and `output/web-game/iteration9-client-final/shot-0.png`.

Remaining Ace Attorney gap list:
- Home and archive now feel closer to a modern chapter-select layer, but they still reuse the investigation-room background; add distinct episode poster art or generated case illustrations.
- Later cases still need more bespoke contradiction paths, optional dead-end statements, and unique cross-examination branches.
- Add an in-trial chapter/episode transition sequence before major witness testimony changes.
- Audio is still synthesized tones; add authored/generated courtroom ambience and stronger UI stings.
- Witness entrance and testimony transitions need speaker-specific pose/state changes rather than only focus, notice, and palette effects.

## 2026-06-17 iteration 10 result

Implemented:
- Added press-unlocked hidden testimony branches to the courtroom runtime.
- Trial progress now stores `unlockedStatements` and remains compatible with older saves that do not have the field.
- Reworked statement navigation to distinguish visible statement index from raw testimony index, so hidden statements can appear without corrupting pressed/solved state.
- Pressing specific setup statements can now reveal a hidden statement, play a transition cue, update stage notice to 隐藏证词解锁, and show a new testimony message.
- Statement strip now marks revealed hidden statements with a gold outline.
- Added five case-specific hidden branch texts in `scripts/build_game_content.py`, each tying the branch to that case's opponent and theme.
- Added `visibleStatements` and `unlockedStatements` to `window.render_game_to_text` for deterministic branch verification.

Verified:
- `python3 scripts/build_game_content.py`
- `node --check game/app.js`
- data integrity check confirmed all five cases have one unlocker, one hidden branch, matching branch ids, and a profile contradiction against that case's opponent
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop flow confirmed: first case starts testimony two with 3 visible statements, pressing the setup statement unlocks a 4th hidden statement, the hidden profile contradiction must be solved before testimony three, and the case can still reach 金章 verdict with 0 mistakes.
- Mobile Playwright check confirmed hidden-branch unlock at 390px with no horizontal overflow.
- develop-web-game client produced `output/web-game/iteration10-client/shot-0.png` and `output/web-game/iteration10-client/state-0.json`.
- Screenshots inspected: `output/web-game/iteration10/before-hidden-branch.png`, `output/web-game/iteration10/hidden-branch-unlocked.png`, `output/web-game/iteration10/hidden-branch-verdict.png`, `output/web-game/iteration10/mobile-hidden-branch.png`, and `output/web-game/iteration10-client/shot-0.png`.

Remaining Ace Attorney gap list:
- Courtroom cross-examination now has press-revealed hidden testimony, but later cases still need more unique dead-end traps and optional side branches.
- Add an in-trial chapter/episode transition sequence before major witness testimony changes.
- Home/archive still reuse the investigation-room background; add distinct episode poster art or generated case illustrations.
- Audio is still synthesized tones; add authored/generated courtroom ambience and stronger UI stings.
- Witness entrance and testimony transitions need speaker-specific pose/state changes rather than only focus, notice, and palette effects.

## 2026-06-17 iteration 11 result

Implemented:
- Added an interactive testimony-transition interlude between cross-examination blocks.
- Trial progress now stores `awaitingInterlude` and `lastObjection` so a solved testimony can pause on a visible 证词更新 screen instead of immediately jumping forward.
- Added `renderTestimonyInterlude()` with courtroom background, witness portrait crop, previous/next testimony flow cards, and a 继续交叉询问 action.
- Added keyboard support: Enter or Space continues from the interlude.
- Updated `render_game_to_text` with `awaitingInterlude` for deterministic verification.
- Kept interlude compatible with hidden testimony branches and existing replay/reset behavior.

Verified:
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop flow confirmed: solving testimony one enters `trial-interlude`, clicking continue enters testimony two, solving testimony two with the hidden branch enters another interlude, pressing Enter enters testimony three, and the case still reaches 金章 verdict with 0 mistakes.
- Mobile Playwright check confirmed the interlude at 390px has no horizontal overflow and the continue button remains visible in the first viewport.
- develop-web-game client produced `output/web-game/iteration11-client/shot-0.png` and `output/web-game/iteration11-client/state-0.json`.
- Screenshots inspected: `output/web-game/iteration11/testimony-interlude-2.png`, `output/web-game/iteration11/testimony-interlude-3.png`, `output/web-game/iteration11/interlude-flow-verdict.png`, `output/web-game/iteration11/mobile-testimony-interlude.png`, and `output/web-game/iteration11-client/shot-0.png`.

Remaining Ace Attorney gap list:
- Courtroom rhythm now has interludes, but witness entrance and pose/state changes are still static.
- Later cases still need more unique dead-end traps and optional side branches beyond one hidden testimony reveal.
- Home/archive still reuse the investigation-room background; add distinct episode poster art or generated case illustrations.
- Audio is still synthesized tones; add authored/generated courtroom ambience and stronger UI stings.
- Add a clearer in-game help/tutorial layer for players unfamiliar with press-present logic.

## 2026-06-17 iteration 12 result

Implemented:
- Added contextual 书记提示 cards across home, case briefing, investigation, trial, testimony interlude, and verdict screens.
- Added a topbar 提示 action and a detailed guide panel with current-context title, tactical note, and three concise steps.
- Guide state now persists in the save file as `guideSeen`, with backward compatibility for older saves.
- Added stage-aware guide contexts for investigation commands, press-first trial logic, evidence selection, profile-based objections, hidden testimony unlocks, testimony interludes, and verdict replay.
- Added `guideOpen`, `guideTitle`, and `guideSeen` to `window.render_game_to_text` for deterministic UI verification.
- Added responsive coach-card and guide-panel styles so the guidance layer remains readable on desktop and mobile.

Verified:
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop guide flow confirmed: initial home guide is unseen, opening it marks it seen, case/investigation/trial contexts update correctly, pressing a suspicious statement switches the guide to 选择证物, and the detailed guide panel opens for that context.
- Mobile Playwright check confirmed the guide panel at 390px has no horizontal overflow and fits inside the first viewport.
- Full first-case regression confirmed the new guide layer does not break investigation, hidden testimony, testimony interludes, or 金章 verdict with 0 mistakes.
- develop-web-game client produced `output/web-game/iteration12-client/shot-0.png` and `output/web-game/iteration12-client/state-0.json`.
- Screenshots inspected: `output/web-game/iteration12/home-guide-panel.png`, `output/web-game/iteration12/trial-guide-evidence.png`, `output/web-game/iteration12/mobile-guide-panel.png`, and `output/web-game/iteration12-client/shot-0.png`.

Remaining Ace Attorney gap list:
- Player guidance now exists, but witness entrance and pose/state changes are still static.
- Later cases still need more unique dead-end traps and optional side branches beyond one hidden testimony reveal.
- Home/archive still reuse the investigation-room background; add distinct episode poster art or generated case illustrations.
- Audio is still synthesized tones; add authored/generated courtroom ambience and stronger UI stings.
- Add a richer gallery/episode-art layer so the five cases feel visually distinct before entering gameplay.

## 2026-06-17 iteration 13 result

Implemented:
- Added five per-case episode art PNGs under `game/assets/`: palace, east-palace, bronze-urn, censorate, and night-gate.
- Reworked home case posters and focused dossier art so they use per-scene `--episode-art` instead of one shared investigation-room image.
- Connected scene CSS classes to the new episode art assets while keeping the existing scene palette, motif, and dossier overlay system.
- Added `homeFocusEpisodeArt` and `episodeArt` to `window.render_game_to_text` so browser tests can prove the focused home dossier and active case use the expected art.
- Confirmed the image-generation attempt did not leave a usable local file in this environment, so this iteration ships deterministic local composite art rather than pretending external generated art was integrated.

Verified:
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- asset existence check confirmed all five expected episode art PNGs exist
- Playwright desktop check confirmed all five case posters compute the expected `episode-art-*.png` backgrounds, focusing the final case updates `homeFocusEpisodeArt` to `episode-art-night-gate.png`, and the focused dossier uses the night-gate art.
- Mobile Playwright check at 390px confirmed the final-case poster/dossier art renders without horizontal overflow.
- develop-web-game client produced `output/web-game/iteration13-client/shot-0.png` and `output/web-game/iteration13-client/state-0.json`.
- Screenshots inspected: `output/web-game/iteration13/desktop-episode-gallery.png`, `output/web-game/iteration13/desktop-focused-night-gate-art.png`, `output/web-game/iteration13/mobile-episode-gallery.png`, and `output/web-game/iteration13-client/shot-0.png`.

Remaining Ace Attorney gap list:
- The five cases now have distinct episode art on the gallery/dossier layer, but these are deterministic local composites; future work should replace or augment them with higher-fidelity generated/key art when an API key or saved image output is available.
- Witness entrance and pose/state changes are still mostly static; add speaker-specific pose cuts and short courtroom animations.
- Later cases still need more unique dead-end traps, optional side branches, and bespoke wrong-answer paths beyond one hidden testimony reveal.
- Audio is still synthesized tones; add authored/generated courtroom ambience and stronger UI stings.
- Investigation scenes use differentiated art and overlays, but deeper per-location props and inspectable visual clues would make them closer to a modern mystery adventure.

## 2026-06-17 iteration 14 result

Implemented:
- Added transient courtroom pose state with left/right roles, covering 入庭, 作证, 沉思, 动摇, 破绽, 压制, 反击, 失衡, and 审视.
- Mapped trial events to visible pose changes: trial entrance, statement navigation, press, hidden/evidence unlocks, premature present, already-solved statements, wrong present, contradiction hit, testimony update, verdict, and continue testimony.
- Added `stagePoseLeft` and `stagePoseRight` to `window.render_game_to_text` for deterministic playtest assertions.
- Added pose-specific portrait transforms, shock animation, spotlight-compatible styling, reduced-motion handling, and compact pose badges on courtroom scenes.
- Connected testimony interludes to the same pose system so a correct objection carries through into the 证词更新 screen instead of being immediately replaced by a neutral entrance pose.
- Fixed a CSS cascade issue where the interlude pose badge was stretched by `.interlude-stage > *`; the final badge is a compact red-gold marker.

Verified:
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop flow confirmed: trial entrance yields `enter/observe`, pressing yields thinking/tense-style pose, wrong present yields `stagger/attack`, and correct contradiction into interlude yields `shock/stagger` with a visible `破绽` badge.
- Playwright mobile check at 390px confirmed pose UI does not introduce horizontal overflow.
- Screenshots inspected: `output/web-game/iteration14/entrance-pose.png`, `output/web-game/iteration14/wrong-present-pose.png`, `output/web-game/iteration14/correct-present-pose.png`, and `output/web-game/iteration14/mobile-pose-check.png`.

Remaining Ace Attorney gap list:
- Courtroom pose feedback now exists, but true multi-frame character animations are still simulated through transforms and badges; future work should add authored/generated pose sheets for major characters.
- Later cases still need more unique dead-end traps, optional side branches, and bespoke wrong-answer paths beyond one hidden testimony reveal.
- Audio is still synthesized tones; add authored/generated courtroom ambience and stronger UI stings.
- Investigation scenes use differentiated art and overlays, but deeper per-location props and inspectable visual clues would make them closer to a modern mystery adventure.
- Episode art exists, but higher-fidelity key art would improve the case-select gallery further.

## 2026-06-17 iteration 15 result

Implemented:
- Added optional per-case trap configuration to `scripts/build_game_content.py` for cases 2-5.
- Generated one bespoke counterattack trap for each later case: 东宫旧账反制, 告密原札反制, 酷吏话术反制, and 夜门时间反制.
- Added `counterEvidence`, `counterNotice`, `counterFeedback`, and `counterPenalty` to generated testimony data where a tempting but wrong evidence choice should trigger a stronger opponent response.
- Added runtime counterattack handling in `presentEvidence()`: matching a trap evidence deducts 2 credibility, records `counterattacks`, switches the stage to opponent pressure, and shows the case-specific feedback.
- Added `counterattacks` to trial progress and `window.render_game_to_text` for deterministic verification.

Verified:
- `python3 scripts/build_game_content.py`
- `node --check game/app.js`
- generated data integrity check confirmed case 1 has no counter trap and cases 2-5 each have exactly one trap whose evidence exists and is not the correct answer.
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop flow for case 2 confirmed the trap path reaches `东宫旧账反制`, credibility drops from 5 to 3, `counterattacks` becomes 1, and stage poses become `stagger/confident`.
- Playwright mobile check at 390px confirmed the counterattack path has no horizontal overflow.
- Screenshots inspected: `output/web-game/iteration15/case2-counterattack-stage.png`, `output/web-game/iteration15/case2-counterattack.png`, and `output/web-game/iteration15/mobile-counterattack.png`.

Remaining Ace Attorney gap list:
- Later cases now have one bespoke counterattack trap each, but they still need longer optional side branches and case-specific bad-ending pressure moments.
- Courtroom pose feedback uses simulated transforms and badges; true multi-frame generated pose sheets would improve character acting.
- Audio is still synthesized tones; add authored/generated courtroom ambience and stronger UI stings.
- Investigation scenes need deeper per-location props and inspectable visual clues tied to the new trap logic.
- Episode art exists, but higher-fidelity key art would improve the case-select gallery further.

## 2026-06-17 iteration 16 result

Implemented:
- Added `risk` copy to each later-case trap configuration so counterattack traps have a fair warning before punishment.
- Wrote `counterRisk` and `counterNotice` onto the tempting evidence item generated for each case 2-5 trap.
- Updated the Court Record evidence detail panel to show a visible `慎用提示` block when a selected evidence item has counterattack risk.
- Updated trial guide logic so selecting a risky evidence item on the matching counterattack statement changes the guide to `慎防反制` before the player commits to `举证`.
- Added `selectedEvidenceRisk` to `window.render_game_to_text` for deterministic verification of warning visibility.
- Added responsive `risk-note` styling for desktop and mobile record panels.

Verified:
- `python3 scripts/build_game_content.py`
- `node --check game/app.js`
- generated data integrity check confirmed case 1 has no warning/counter trap and cases 2-5 each have one counter trap with one matching risky evidence item.
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop flow for case 2 confirmed: investigation Court Record shows the risky evidence warning, trial selection on the trap statement switches the guide title to `慎防反制`, and committing the warned evidence still triggers `东宫旧账反制`.
- Playwright mobile check at 390px confirmed the risk note appears without horizontal overflow.
- develop-web-game client produced `output/web-game/iteration16-client/shot-0.png` and `output/web-game/iteration16-client/state-0.json`.
- Screenshots inspected: `output/web-game/iteration16/trial-counter-risk-guide.png`, `output/web-game/iteration16/mobile-risk-note.png`, and `output/web-game/iteration16-client/shot-0.png`.

Remaining Ace Attorney gap list:
- Counterattack traps are now fairer and readable, but later cases still need longer optional side branches and case-specific bad-ending pressure moments.
- Courtroom pose feedback uses simulated transforms and badges; true multi-frame generated pose sheets would improve character acting.
- Audio is still synthesized tones; add authored/generated courtroom ambience and stronger UI stings.
- Investigation scenes need deeper per-location props and inspectable visual clues beyond record text warnings.
- Episode art exists, but higher-fidelity key art would improve the case-select gallery further.

## 2026-06-17 iteration 17 result

Implemented:
- Added a counterattack recovery branch to cases 2-5. Triggering a case-specific counterattack now unlocks a new optional recovery testimony statement.
- Generated recovery testimony with `optionalRecovery`, `recoveryCredibility`, `hiddenUntilPressed`, and a correct evidence answer tied to the real contradiction evidence.
- Updated trial completion logic so optional recovery answers do not block normal completion unless the recovery branch has actually been unlocked.
- Updated counterattack handling so a counterattack unlocks its recovery statement, increases `counterattacks`, and tells the player that a new recovery opening appeared.
- Added recovery success handling: presenting the correct evidence on the recovery statement restores 1 credibility, increments `recoveries`, and then returns focus to the original contradiction statement so the player can continue cleanly.
- Added `recoveries` to trial progress and `window.render_game_to_text`.
- Added a `补救破绽` guide context so the recovery statement tells the player to avoid the bait evidence and use the real contradiction evidence.

Verified:
- `python3 scripts/build_game_content.py`
- `node --check game/app.js`
- generated data integrity check confirmed case 1 has no counter/recovery branch and cases 2-5 each have one counter branch plus one matching recovery statement.
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop full route for case 2 confirmed: solve testimony 1, unlock and solve the existing hidden profile branch, trigger `东宫旧账反制`, unlock a fourth visible statement, solve the recovery statement, restore credibility from 3 to 4, return to the original contradiction, solve it, and advance to the next testimony interlude.
- Playwright mobile route at 390px confirmed the same recovery path works without horizontal overflow.
- develop-web-game client produced `output/web-game/iteration17-client/shot-0.png` and `output/web-game/iteration17-client/state-0.json`.
- Screenshots inspected: `output/web-game/iteration17/desktop-counter-unlocks-recovery.png`, `output/web-game/iteration17/desktop-recovery-success.png`, `output/web-game/iteration17/recovery-to-interlude.png`, `output/web-game/iteration17/mobile-recovery-success.png`, and `output/web-game/iteration17-client/shot-0.png`.

Remaining Ace Attorney gap list:
- Later cases now have counterattack and recovery branches, but they still need case-specific bad-ending pressure moments and more varied optional side branches.
- Courtroom pose feedback uses simulated transforms and badges; true multi-frame generated pose sheets would improve character acting.
- Audio is still synthesized tones; add authored/generated courtroom ambience and stronger UI stings.
- Investigation scenes need deeper per-location props and inspectable visual clues beyond record text warnings.
- Episode art exists, but higher-fidelity key art would improve the case-select gallery further.

## 2026-06-17 iteration 18 result

Implemented:
- Added generated `badEnding` text for every case so trial failure has case-specific consequence copy.
- Replaced the old instant credibility-reset behavior with a formal `bad-ending` screen when court credibility reaches zero.
- Added `failed` and `failureReason` to trial progress and `window.render_game_to_text`.
- Added a `庭审崩盘` / `败诉复盘` result panel with the last pressure reason, mistake/counter/recovery stats, and visible actions.
- Added `重审庭审`, which preserves investigation evidence while resetting only trial progress, mistakes, solved statements, counterattacks, recoveries, and credibility.
- Added routing support so `bad-ending` survives rerender, settings/guide toggles, and trial-entry attempts until the player explicitly retries.
- Adjusted the bad-ending layout so the retry action is visible in the first viewport on desktop and mobile.

Verified:
- `python3 scripts/build_game_content.py`
- `node --check game/app.js`
- generated data integrity check confirmed all five cases have bad-ending copy.
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop flow confirmed: wrong presents reduce credibility to zero, `bad-ending` appears with `failed=true`, retry button is visible in the first viewport, clicking `重审庭审` returns to trial with credibility 5, mistakes 0, failed false, and all 6 investigation evidence preserved.
- Playwright mobile flow at 390px confirmed the bad-ending retry button is first-screen visible and no horizontal overflow appears.
- develop-web-game client produced `output/web-game/iteration18-client/shot-0.png` and `output/web-game/iteration18-client/state-0.json`.
- Screenshots inspected: `output/web-game/iteration18/desktop-bad-ending.png`, `output/web-game/iteration18/desktop-retry-trial.png`, `output/web-game/iteration18/mobile-bad-ending.png`, and `output/web-game/iteration18-client/shot-0.png`.

Remaining Ace Attorney gap list:
- Failure now has a proper bad-ending screen, but later cases still need more case-specific near-loss pressure beats before the final collapse.
- Courtroom pose feedback uses simulated transforms and badges; true multi-frame generated pose sheets would improve character acting.
- Audio is still synthesized tones; add authored/generated courtroom ambience and stronger UI stings.
- Investigation scenes need deeper per-location props and inspectable visual clues beyond record text warnings.
- Episode art exists, but higher-fidelity key art would improve the case-select gallery further.

## 2026-06-17 iteration 19 result

Implemented:
- Replaced the single-tone audio helper with a small layered Web Audio engine for click, objection, penalty, verdict, transition, counterattack, and collapse cues.
- Added scene-aware continuous ambience states for home, case briefing, investigation, trial, testimony interlude, bad ending, and verdict screens.
- Kept autoplay behavior compliant: ambience starts only after a user interaction creates the audio context, and stays silent before that.
- Added separate settings controls for `提示音量` and `环境音量`, plus a visible `当前声场` status line.
- Made mute stop the active ambience immediately while preserving separate volume settings.
- Exposed `audioReady`, `audioMuted`, `audioMode`, `audioAmbience`, `sfxVolume`, and `ambienceVolume` in `window.render_game_to_text`.
- Split counterattack and credibility-collapse cues from ordinary penalty feedback.
- Added an inline SVG favicon so browser QA no longer reports a missing favicon console error.
- Fixed mobile topbar behavior so `提示` and `设置` remain visible on narrow screens while status tags collapse.

Verified:
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop flow confirmed: before interaction `audioReady=false` and `audioAmbience=silent`; opening settings starts `audioReady=true` and `audioAmbience=home`; changing ambience volume persists to `render_game_to_text`; muting sets `audioMuted=true` and `audioAmbience=silent`; entering case/investigation/trial switches ambience to `briefing`, `investigation`, and `trial`.
- Playwright mobile flow at 390px confirmed the topbar settings button is visible, the settings panel opens through real click interaction, audio sliders render, and there is no horizontal overflow.
- Browser console check after favicon fix: no errors.
- develop-web-game client produced `output/web-game/iteration19-client/shot-0.png` and `output/web-game/iteration19-client/state-0.json`, confirming settings click initializes audio state.
- Screenshots inspected: `output/web-game/iteration19/trial-audio.png`, `output/web-game/iteration19/mobile-settings.png`, and `output/web-game/iteration19-client/shot-0.png`.

Remaining Ace Attorney gap list:
- Audio now has layered synthetic cues and ambience, but still lacks authored/generated high-fidelity sound assets and musical stingers.
- Later cases still need more case-specific near-loss pressure beats before the final collapse.
- Courtroom pose feedback uses simulated transforms and badges; true multi-frame generated pose sheets would improve character acting.
- Investigation scenes need deeper per-location props and inspectable visual clues beyond record text warnings.
- Episode art exists, but higher-fidelity key art would improve the case-select gallery further.

## 2026-06-17 iteration 20 result

Implemented:
- Added a derived trial pressure system with `stable`, `danger`, `final-warning`, and `collapse` levels based on current court credibility.
- Added pressure labels to the credibility meter so low-credibility states are visible without opening a guide panel.
- Added a dedicated pressure warning card in the trial panel for `法庭警戒` and `最后警告`.
- Appended low-credibility pressure copy to wrong-present feedback before full collapse, and updated the camera notice to the current pressure warning.
- Exposed `pressureLevel` and `pressureLabel` through `window.render_game_to_text`.
- Fixed mobile play order by removing the previous mobile-only `record-panel` first ordering; the courtroom scene and pressure state now appear before the Court Record on narrow screens.

Verified:
- `node --check game/app.js`
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop flow confirmed: existing low-credibility save renders `pressureLevel=danger`; another wrong present changes to `pressureLevel=final-warning`, shows the final-warning card, updates the camera notice, appends pressure copy to the toast, and keeps the trial alive at credibility 1.
- Playwright mobile flow at 390px confirmed the trial scene appears before the Court Record, the pressure card is in the first gameplay flow, topbar settings remains visible, and there is no horizontal overflow.
- Browser console check: no errors.
- develop-web-game client produced `output/web-game/iteration20-client/shot-0.png` and `output/web-game/iteration20-client/state-0.json`, confirming `pressureLevel=stable` on a clean home-state run.
- Screenshots inspected: `output/web-game/iteration20/final-warning.png`, `output/web-game/iteration20/mobile-warning-fixed.png`, and `output/web-game/iteration20-client/shot-0.png`.

Remaining Ace Attorney gap list:
- Pressure warning now exists, but later cases still need bespoke near-loss dialogue beats tied to their specific political stakes.
- Audio has layered synthetic cues and ambience, but still lacks authored/generated high-fidelity sound assets and musical stingers.
- Courtroom pose feedback uses simulated transforms and badges; true multi-frame generated pose sheets would improve character acting.
- Investigation scenes need deeper per-location props and inspectable visual clues beyond record text warnings.
- Episode art exists, but higher-fidelity key art would improve the case-select gallery further.

## 2026-06-17 iteration 21 result

Implemented:
- Added case-specific near-loss pressure beats to all five case blueprints, with separate `danger` and `final-warning` titles, body copy, and opponent pressure lines.
- Generated public `pressureBeats` into `game/game-data.js` while keeping the intermediate `pressure` blueprint field out of shipped case data.
- Added `pressureBeat(caseData, level)` runtime routing so pressure cards, credibility labels, wrong-present pressure feedback, camera notices, and test state use the active case's bespoke content.
- Updated the pressure warning card to show a third line for the opponent's active pressure argument.
- Exposed `pressureTitle`, `pressureBody`, and `pressureOpponentLine` through `window.render_game_to_text`.

Verified:
- `python3 scripts/build_game_content.py`
- `python3 -m py_compile scripts/build_game_content.py`
- `node --check game/app.js`
- Data integrity check confirmed all five cases have exactly two generated pressure beats with label/title/body/opponentLine, and no shipped case keeps the intermediate `pressure` field.
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop flow for case 3 confirmed: investigation collected 6/7 evidence, trial opened, repeated wrong presents reached `danger` with `pressureTitle=铜匦回声压庭`, then `final-warning` with `pressureTitle=酷吏定案在即`; the pressure card, toast, camera notice, and `render_game_to_text` all used the case-specific 来俊臣 pressure copy.
- Playwright mobile flow at 390px confirmed the case 3 final-warning pressure card remains readable in the first gameplay flow, topbar settings stays visible, and there is no horizontal overflow.
- Browser console check: no errors.
- develop-web-game client produced `output/web-game/iteration21-client/shot-0.png` and `output/web-game/iteration21-client/state-0.json`, confirming pressure fields are stable on a clean home-state run.
- Screenshots inspected: `output/web-game/iteration21/case3-final-warning.png`, `output/web-game/iteration21/mobile-case3-warning.png`, and `output/web-game/iteration21-client/shot-0.png`.

Remaining Ace Attorney gap list:
- Later cases now have bespoke near-loss pressure beats, but they still need case-specific recovery/turnabout celebration beats after escaping final warning.
- Audio has layered synthetic cues and ambience, but still lacks authored/generated high-fidelity sound assets and musical stingers.
- Courtroom pose feedback uses simulated transforms and badges; true multi-frame generated pose sheets would improve character acting.
- Investigation scenes need deeper per-location props and inspectable visual clues beyond record text warnings.
- Episode art exists, but higher-fidelity key art would improve the case-select gallery further.

## 2026-06-17 iteration 22 result

Implemented:
- Added case-specific `turnabout` beats to all five case blueprints, each with title, body, opponent-line, and 1-point credibility recovery.
- Generated public `turnaboutBeat` into `game/game-data.js` while keeping the intermediate `turnabout` blueprint field out of shipped case data.
- Added runtime `turnaboutBeat(caseData)` routing and low-credibility correct-present detection.
- When the player correctly hits a contradiction while at `danger` or `final-warning`, the game now restores 1 credibility, increments `turnabouts`, records `lastTurnabout`, and appends the case-specific turnabout copy to the objection message.
- Added a visible green `turnabout-panel` in both the trial HUD and testimony-update interlude so a successful rescue does not disappear into transient toast text.
- Added `turnabouts`, `lastTurnabout`, `turnaboutTitle`, `turnaboutBody`, and `turnaboutOpponentLine` to `window.render_game_to_text`.
- Added turnabout count to the bad-ending stats panel so near-rescues remain visible in failure review.

Verified:
- `python3 scripts/build_game_content.py`
- `python3 -m py_compile scripts/build_game_content.py`
- `node --check game/app.js`
- Data integrity check confirmed all five cases have public `turnaboutBeat` data, each with title/body/opponentLine/recovery, and no shipped case keeps the intermediate `turnabout` field.
- John UI leak scan on `game/`: passed
- `git diff --check`
- Playwright desktop flow for case 3 confirmed: after four wrong presents, credibility reached 1 and `pressureLevel=final-warning`; moving to the real contradiction, pressing it, and presenting `卷宗25：第二十五章 男妃冯小宝` advanced to testimony interlude with credibility restored to 2, `turnabouts=1`, `lastTurnabout=告密机器逆转`, and the visible turnabout panel.
- Playwright mobile flow at 390px confirmed the turnabout interlude remains readable, topbar settings stays visible, and there is no horizontal overflow.
- Browser console check: no errors.
- develop-web-game client produced `output/web-game/iteration22-client/shot-0.png` and `output/web-game/iteration22-client/state-0.json`, confirming turnabout fields are stable on a clean home-state run.
- Screenshots inspected: `output/web-game/iteration22/turnabout-interlude.png`, `output/web-game/iteration22/mobile-turnabout.png`, and `output/web-game/iteration22-client/shot-0.png`.

Remaining Ace Attorney gap list:
- Low-credibility reversal now has visible case-specific payoff, but broader multi-frame character acting is still simulated through transforms and badges.
- Audio has layered synthetic cues and ambience, but still lacks authored/generated high-fidelity sound assets and musical stingers.
- Investigation scenes need deeper per-location props and inspectable visual clues beyond record text warnings.
- Episode art exists, but higher-fidelity key art would improve the case-select gallery further.
- The game still needs a stronger final completion audit across all five cases, including full-case clear paths after the newer pressure/turnabout systems.

## 2026-06-17 iteration 23 result

Implemented:
- Ran a full five-case completion audit against the real browser UI instead of a single-case smoke path.
- Exercised the full player route for every case: home case entry, investigation movement, all examine spots, trial start, testimony one evidence contradiction, testimony two press-unlocked hidden branch, profile contradiction, second evidence contradiction, testimony interlude continuation, final press-unlocked court note, and verdict return to home.
- Corrected the audit assertions while running: case briefing screen is named `case`, investigation has duplicate visual-hotspot/list buttons, completed examine spots remain re-clickable by design, verdict grade is `无瑕逆转` while medal is `金章`, and the final case has five pretrial evidence pieces plus one court-unlocked note.

Verified:
- Playwright full-case audit passed for all five cases from clean localStorage: every case reached result with `mistakes=0`, `credibility=5`, `bestMedal=金章`, `clears=1`, and final home state reported `completed=5`.
- Audit artifact: `iteration23-full-clear-audit.json`.
- Final-home screenshot inspected: `iteration23-final-home.png`, showing `已结案 5/5`, five gold-medal case cards, and the completion archive with `金章 5/5` and `结案 5/5`.
- Final-home accessibility snapshot captured: `iteration23-final-home-snapshot.md`.
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- John UI leak scan on `game/`: passed.

Remaining Ace Attorney gap list:
- The core five-case route is now fully proven, but courtroom acting still uses simulated transforms and badges rather than true generated multi-frame pose sheets.
- Audio has layered synthetic cues and ambience, but still lacks authored/generated high-fidelity sound assets and musical stingers.
- Investigation scenes have scene art and hotspots, but can still become richer with prop-specific close-up panels and clue-state visuals.
- Episode art exists and the gallery is complete, but higher-fidelity key art would improve the first impression further.

## 2026-06-17 iteration 24 result

Implemented:
- Added an investigation `线索特写` board beneath the scene map, summarizing the active clue, inspected spot progress, collected evidence at the current location, talked topic progress, and current site judgment.
- The clue board updates from the existing investigation state, so it reflects real examine/talk/evidence progress instead of separate duplicated state.
- Updated examined spot copy from `已记录` to `已记录，可复查` to make the intentional re-click behavior clearer.
- Added `activeClue`, `clueProgress`, and `locationEvidenceProgress` to `window.render_game_to_text` for browser QA.
- Added responsive CSS so the clue grid is three columns on desktop and one column on mobile.

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- John UI leak scan on `game/`: passed.
- Browser investigation flow confirmed: entering first case investigation exposes `activeClue=朱漆案几`, `clueProgress=0/2`, `locationEvidenceProgress=0/2`; examining the first spot updates to `clueProgress=1/2`, `locationEvidenceProgress=1/2`, and the clue board text shows the gained卷宗.
- Desktop screenshot inspected: `iteration24-clue-board-desktop.png`.
- Mobile 390px check confirmed `overflowX=0`, clue board width fits the viewport, and `.clue-grid` collapses to one column.
- Mobile screenshot inspected: `iteration24-clue-board-mobile.png`.
- Full five-case regression audit passed after the UI change, again clearing every case flawlessly and ending at home with `completed=5`.
- Regression artifact: `iteration24-full-clear-regression.json`.

Remaining Ace Attorney gap list:
- Investigation now has live clue-state panels, but close-up art is still data-driven UI rather than authored/generated per-prop illustrations.
- Courtroom acting still uses simulated transforms and badges rather than true generated multi-frame pose sheets.
- Audio has layered synthetic cues and ambience, but still lacks authored/generated high-fidelity sound assets and musical stingers.
- Episode art exists and the gallery is complete, but higher-fidelity key art would improve the first impression further.

## 2026-06-17 iteration 25 result

Implemented:
- Replaced the previous single-word `异议/驳回` overlay with a richer `court-impact` presentation layer: slanted impact board, speed-line texture, large result title, subtitle, and the presented evidence/profile label.
- Added `impactCue` runtime state and `setImpactCue()` so successful objections, profile hits, low-credibility reversals, counterattacks, premature presents, rejected evidence, and collapse can each carry a distinct impact title and record label.
- Rendered the impact layer on trial, testimony-update interlude, result, and bad-ending screens so correct presents that immediately advance the case still show the courtroom hit.
- Added reduced-motion support for the new impact layer; in reduced-motion mode the board stays static instead of animating out.
- Exposed `impactKind`, `impactTitle`, `impactRecord`, and `impactSubtitle` through `window.render_game_to_text`.

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- John UI leak scan on `game/`: passed.
- Browser correct-present flow confirmed: first case testimony one reaches `trial-interlude` with `impactKind=objection`, `impactTitle=异议成立`, `impactRecord=卷宗5：第五章 为了对付那个貌美多姿的妃子`, and a visible `.court-impact`.
- Browser wrong-present flow confirmed: first case remains in trial with `credibility=4`, `mistakes=1`, `impactKind=penalty`, `impactTitle=驳回`, and the wrong evidence label shown in the impact layer.
- Reduced-motion screenshot inspected: `iteration25-objection-impact-still.png`, confirming the impact layer remains visible with large title, subtitle, and evidence label.
- Mobile 390px check confirmed `overflowX=0`, the impact layer fits within the viewport, and the evidence label wraps inside the board.
- Mobile screenshot inspected: `iteration25-objection-impact-mobile.png`.
- Full five-case regression audit passed after the impact-layer change, clearing every case flawlessly and ending at home with `completed=5`.
- Regression artifact: `iteration25-full-clear-regression.json`.
- develop-web-game client smoke passed with `output/web-game/iteration25-client/shot-0.png` and `output/web-game/iteration25-client/state-0.json`.

Remaining Ace Attorney gap list:
- Courtroom hit feedback is much stronger, but character acting still uses one generated sheet plus CSS transforms rather than true multi-frame pose animations.
- Investigation close-ups still use text/state panels instead of generated per-prop close-up art.
- Audio has layered synthetic cues and ambience, but still lacks authored/generated high-fidelity sound assets and musical stingers.
- Episode art exists and the gallery is complete, but higher-fidelity key art would improve the first impression further.

## 2026-06-17 iteration 26 result

Implemented:
- Added a three-frame courtroom acting sequence to every impact cue, turning each objection/rejection from a single overlay into a mini sequence: defense action, court-record/evidence cut-in, and opponent reaction.
- Added `impactFramesFor()` so `objection` and `penalty` cues build different acting beats. Successful hits now read as `辩方 -> 法庭记录 -> 对手动摇`; rejected evidence reads as `辩方受阻 -> 驳回证物 -> 对手夺回节奏`.
- Rendered the sequence inside the `court-impact` board as `.acting-strip` / `.acting-frame` cells using existing character portraits and a record glyph for evidence.
- Added reduced-motion behavior for acting frames and responsive mobile sizing.
- Exposed `impactFrames` through `window.render_game_to_text` for automated checks.

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- John UI leak scan on `game/`: passed.
- Browser correct-present flow confirmed three frames on first-case testimony one: `辩方:指出矛盾`, `法庭记录:卷宗5：第五章 为了对付那个貌美多姿的妃子`, `许敬宗:证物与证词正面冲突`.
- Browser wrong-present flow confirmed three frames: `辩方:举证受阻`, `驳回:卷宗4：第四章 乱伦，接近权力中心的第一步`, `许敬宗:证物没有击中这句证词`; credibility dropped to 4 and mistakes became 1.
- Desktop screenshots inspected: `iteration26-acting-frames-objection.png`, `iteration26-acting-frames-penalty.png`.
- Mobile 390px check confirmed `overflowX=0`, three acting frames remain visible inside the impact board, and the board does not block progression controls permanently.
- Mobile screenshot inspected: `iteration26-acting-frames-mobile.png`.
- Full five-case regression audit passed after the acting-frame change; each key present action exposed at least three impact frames and final home state ended with `completed=5`.
- Regression artifact: `iteration26-full-clear-regression.json`.
- develop-web-game client smoke passed with `output/web-game/iteration26-client/shot-0.png` and `output/web-game/iteration26-client/state-0.json`.

Remaining Ace Attorney gap list:
- Courtroom acting now has multi-frame impact beats, but the underlying portraits are still sourced from one generated sheet rather than bespoke per-character animation strips.
- Investigation close-ups still use text/state panels instead of generated per-prop close-up art.
- Audio has layered synthetic cues and ambience, but still lacks authored/generated high-fidelity sound assets and musical stingers.
- Episode art exists and the gallery is complete, but higher-fidelity key art would improve the first impression further.

## 2026-06-17 iteration 27 result

Implemented:
- Added prop-specific visual close-up panels to the investigation `线索特写` board, so examined clues now have a visible object-stage treatment instead of only progress text.
- Classified the recurring investigation spots into six public prop types: 朱漆案几, 屏风阴影, 断签断面, 墨迹湿痕, 空白辩状, and 庭铃回声.
- Rendered each prop type with distinct CSS motifs, layered prop pieces, status badges, scene context, and responsive desktop/mobile layout.
- Added `closeupType`, `closeupTitle`, and `closeupStatus` to `window.render_game_to_text` for deterministic browser QA.
- Cleaned courtroom impact state so investigation screens do not retain objection/penalty impact frames after evidence pickup feedback.

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- John UI leak scan on `game/`: passed.
- Browser investigation flow confirmed all six close-up types appear from real examine spots: `desk`, `screen`, `bamboo`, `ink`, `petition`, and `bell`.
- Browser state check confirmed an examined clue reports `closeupType=desk`, `closeupTitle=案几近景`, `closeupStatus=已记录`, and no leftover `impactKind` / `impactFrames` on the investigation screen.
- Desktop screenshot inspected: `iteration27-prop-closeup-desktop-fixed.png`.
- Mobile 390px screenshot inspected: `iteration27-prop-closeup-mobile.png`; no horizontal overflow and the close-up stacks cleanly above clue copy.
- Full five-case regression audit passed after the close-up change, clearing every case flawlessly and ending at home with `completed=5`.
- Regression artifact: `iteration27-full-clear-regression.json`.
- develop-web-game client smoke passed with `output/web-game/iteration27-client/shot-0.png` and `output/web-game/iteration27-client/state-0.json`.

Remaining Ace Attorney gap list:
- Investigation now has procedural prop close-ups, but not AI-generated bitmap illustrations for every unique clue.
- Audio has layered synthetic cues and ambience, but still lacks authored/generated high-fidelity sound assets and musical stingers.
- Courtroom acting uses one generated portrait sheet plus CSS/multi-frame overlays rather than bespoke per-character animation strips.
- Episode art exists and the gallery is complete, but higher-fidelity key art would improve the first impression further.

## 2026-06-17 iteration 28 result

Implemented:
- Added a project-local bitmap evidence close-up sheet at `game/assets/prop-closeups-v1.png`.
- Connected the investigation prop close-up panels to the bitmap sheet through `.prop-stage::before`, using a 3x2 sprite layout and per-type `background-position` values.
- Kept the existing CSS prop pieces as a faint fallback/decorative overlay, so the panel still has visual structure if the image layer fails.
- Preserved the existing close-up data contract: `closeupType`, `closeupTitle`, and `closeupStatus` did not need schema changes.

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- John UI leak scan on `game/`: passed.
- Browser render check confirmed `.prop-stage::before` loads `http://127.0.0.1:8787/game/assets/prop-closeups-v1.png`, uses `background-size: 300% 200%`, and starts the desk cell at `0% 0%`.
- Desktop browser state confirmed `closeupType=desk`, `closeupTitle=案几近景`, `closeupStatus=已记录`, `clueProgress=1/2`, `locationEvidenceProgress=1/2`, and `overflowX=0`.
- Mobile 390px browser state confirmed the sprite layer remains loaded and `overflowX=0`.
- Screenshots inspected: `iteration28-prop-sprite-desktop.png` and `iteration28-prop-sprite-mobile.png`.
- develop-web-game client smoke passed with `output/web-game/iteration28-client/shot-0.png` and `output/web-game/iteration28-client/state-0.json`.

Remaining Ace Attorney gap list:
- Investigation now has a bitmap close-up sheet for core prop archetypes, but not bespoke generated art for every individual evidence card.
- Audio has layered synthetic cues and ambience, but still lacks authored/generated high-fidelity sound assets and musical stingers.
- Courtroom acting uses one generated portrait sheet plus CSS/multi-frame overlays rather than bespoke per-character animation strips.
- Episode art exists and the gallery is complete, but higher-fidelity key art would improve the first impression further.

## 2026-06-17 iteration 29 result

Implemented:
- Added seven project-local WAV cue assets under `game/assets/audio/`: click, objection, penalty, verdict, transition, counter, and collapse.
- Updated `playCue()` so sampled WAV cues are preferred after decode, while the existing Web Audio oscillator patterns remain as a fallback when a sample is not yet loaded or cannot decode.
- Added runtime sample cache and promise tracking in `audioState`, avoiding repeated fetch/decode work for the same cue.
- Added `audioSamplesLoaded` and `audioSamplesTotal` to `window.render_game_to_text` so browser QA can verify asset-backed audio state.

Verified:
- `node --check game/app.js`
- Browser `fetch()` + `AudioContext.decodeAudioData()` decoded all seven WAV files successfully.
- Browser runtime check after entering the first case confirmed `audioReady=true`, `audioSamplesLoaded=1`, and `audioSamplesTotal=7`; only the click sample was loaded because that smoke path only triggered click.
- develop-web-game client smoke passed with `output/web-game/iteration29-client/shot-0.png` and `output/web-game/iteration29-client/state-0.json`.

Remaining Ace Attorney gap list:
- Audio now has project-local sampled cue assets, but ambience remains synthesized and there is still no full music track system.
- Investigation has bitmap close-ups for core prop archetypes, but not bespoke generated art for every individual evidence card.
- Courtroom acting uses one generated portrait sheet plus CSS/multi-frame overlays rather than bespoke per-character animation strips.
- Episode art exists and the gallery is complete, but higher-fidelity key art would improve the first impression further.

## 2026-06-17 iteration 30 result

Implemented:
- Added seven local looped music tracks under `game/assets/music/`: home, briefing, investigation, trial, interlude, collapse, and verdict.
- Added a music runtime alongside the existing cue and ambience systems: music buffers are fetched/decoded once, loop through `AudioBufferSourceNode`, and switch by `audioModeForScreen()`.
- Added `musicVolume` to saved settings and a visible `配乐音量` slider in the settings panel.
- Added `syncMusicForScreen()` so user interaction, screen changes, mute, and volume changes keep the current loop in sync.
- Exposed `audioMusic`, `musicTracksLoaded`, `musicTracksTotal`, and `musicVolume` through `window.render_game_to_text`.

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- John UI leak scan on `game/`: passed.
- Browser `fetch()` + `AudioContext.decodeAudioData()` decoded all seven music WAV files successfully.
- Browser runtime check after entering the first case confirmed `audioMusic=briefing`, `musicTracksLoaded=2`, `musicTracksTotal=7`, and `musicVolume=0.3`.
- Desktop settings screenshot inspected: `iteration30-music-settings.png`; the new `配乐音量 30%` slider appears cleanly.
- Mobile 390px settings check confirmed `overflowX=0`, panel width 354px, and the `配乐音量 30%` label is visible.
- Mobile screenshot inspected: `iteration30-music-settings-mobile.png`.
- develop-web-game client smoke passed with `output/web-game/iteration30-client/shot-0.png` and `output/web-game/iteration30-client/state-0.json`.

Remaining Ace Attorney gap list:
- Audio now has local cue samples and local looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.
- Investigation has bitmap close-ups for core prop archetypes, but not bespoke generated art for every individual evidence card.
- Courtroom acting uses one generated portrait sheet plus CSS/multi-frame overlays rather than bespoke per-character animation strips.
- Episode art exists and the gallery is complete, but higher-fidelity key art would improve the first impression further.

## 2026-06-17 iteration 31 result

Implemented:
- Upgraded the Court Record evidence tab from text-only rows into visual evidence cards with thumbnails.
- Added front-end evidence visual derivation for record, map, note, risk, locked, and generic evidence types without changing `game/game-data.js`.
- Added `renderEvidenceThumb()` and reused it in both the evidence list and selected evidence detail panel.
- Added a large selected-evidence thumbnail in the detail area, making the record feel closer to an Ace Attorney evidence encyclopedia.
- Added `selectedEvidenceIcon` to `window.render_game_to_text` for deterministic browser QA.

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- John UI leak scan on `game/`: passed.
- Browser investigation flow collected and selected the first evidence; state confirmed `selectedEvidenceIcon=record:卷4`, `selectedEvidence=卷宗4：第四章 乱伦，接近权力中心的第一步`, and `overflowX=0`.
- Desktop screenshot inspected: `iteration31-evidence-thumbs-desktop.png`; the evidence list and selected detail both show visual cards.
- Mobile 390px screenshot inspected: `iteration31-evidence-thumbs-mobile.png`; the record panel remains readable with no horizontal overflow.
- Five-case Court Record structure check confirmed every case's evidence buttons have thumbnails, locked evidence uses a locked card face, and there are no console errors.
- develop-web-game client smoke passed with `output/web-game/iteration31-client/shot-0.png` and `output/web-game/iteration31-client/state-0.json`.

Remaining Ace Attorney gap list:
- Court Record now has visual evidence cards, but the icons are generated by CSS archetypes rather than bespoke art for every individual evidence card.
- Audio now has local cue samples and local looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.
- Courtroom acting uses one generated portrait sheet plus CSS/multi-frame overlays rather than bespoke per-character animation strips.
- Episode art exists and the gallery is complete, but higher-fidelity key art would improve the first impression further.

## 2026-06-17 iteration 32 result

Implemented:
- Generated a project-local multi-pose character sprite sheet at `game/assets/character-pose-strip-v1.png`.
- The pose sheet expands the existing five-character cast into three rows: idle, assertive/attack, and shaken/stagger.
- Switched courtroom stage portraits, testimony interlude portraits, and impact acting portraits to the new pose sheet.
- Added pose-aware impact frame metadata: successful hits use assertive defense plus shaken opponent, while penalties use shaken defense plus assertive opponent.
- Added `poseSpriteAsset` and `poseSpriteRows` to `window.render_game_to_text`; `impactFrames` now includes each frame's pose.
- Fixed audio screen sync by adding `syncAudioForScreen()` and routing screen renders through it, so ambience and music do not drift apart across mode changes.

Verified:
- `node --check game/app.js`
- `python3 -m py_compile scripts/build_game_content.py`
- `git diff --check`
- John UI leak scan on `game/`: passed.
- Asset check confirmed `game/assets/character-pose-strip-v1.png` is a 1670x2823 PNG.
- Browser run before the final audio-sync fix confirmed the courtroom stage loads `character-pose-strip-v1.png` with `background-size: 500% 300%`.
- Browser run confirmed impact acting portraits load the pose sheet for non-record frames, with computed positions `0% 100%` for shaken defense and `75% 50%` for assertive opponent.
- Browser state confirmed `poseSpriteAsset=character-pose-strip-v1.png`, `poseSpriteRows=3`, and impact frames include pose suffixes such as `辩方:举证受阻:shaken`.
- Desktop screenshot inspected: `iteration32-pose-strip-impact.png`.
- Mobile 390px screenshot inspected: `iteration32-pose-strip-mobile.png`; no horizontal overflow and three acting portraits remain visible.
- Final custom Playwright rerun after the audio-sync fix was blocked by the approval channel, so final post-fix verification is limited to static checks and code-path inspection.

Remaining Ace Attorney gap list:
- Courtroom acting now uses a multi-pose bitmap strip, but the poses are derived variants of the same base portraits rather than fully redrawn per-character animation sheets.
- Court Record has visual evidence cards, but the icons are generated by CSS archetypes rather than bespoke art for every individual evidence card.
- Audio has local cue samples and local looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.
- Episode art exists and the gallery is complete, but higher-fidelity key art would improve the first impression further.

## 2026-06-17 iteration 44 result

Implemented:
- Added a formal post-correct-present `异议揭示` pause: correct evidence now opens a visible reveal layer and waits for `揭示矛盾`, Enter, or Space before resolving the contradiction.
- Split correct-present handling into a reveal preparation step and an explicit resolution step, preserving counterattack, recovery, turnabout, testimony advance, and interlude behavior.
- Cleared transient reveal state when returning home, loading a save, replaying, retrying, or resetting a case so stale courtroom overlays cannot leak across screens.
- Reworked desktop trial portraits so both sides are visible as large courtroom half-body standees inside the scene instead of being pushed under the dialogue area.
- Repositioned testimony interlude portraits as a clear right-side courtroom card and adjusted mobile portrait sizing so characters no longer collapse into tiny thumbnails.

Verified:
- `npm run check:js`
- `npm run check:py`
- `git diff --check`
- Public old-template scan on `game/`: no matches for the previous opaque evidence phrases.
- `npm run qa:web-game` passed with the local Playwright dependency; Node emitted only the external skill script module-type warning.
- Desktop 1440x810 Playwright flow collected all first-case investigation evidence, pressed statement 2, selected `摇篮旁的值夜签`, closed the Court Record, and clicked `举证`.
- Desktop reveal state confirmed `screen=trial`, `objectionReveal=true`, `objectionRevealTitle=异议成立`, `objectionRevealRecord=摇篮旁的值夜签`, and no page-level overflow (`1440x810` scroll/client match).
- Desktop reveal screenshot inspected: `iteration44-final-desktop-objection-reveal.png`; the reveal panel, evidence label, and `揭示矛盾` button are visible.
- Desktop trial portrait screenshot inspected: `iteration44-final-desktop-trial-portraits.png`; both courtroom portraits are visible and aligned inside the scene.
- Desktop interlude screenshot inspected: `iteration44-final-desktop-interlude-portrait.png`; the next-testimony portrait is no longer hidden below the fold or blocked by panels.
- Mobile 390x844 Playwright flow confirmed no horizontal overflow; the mobile trial screenshot keeps both portraits visible while allowing vertical operation scroll.

Remaining Ace Attorney gap list:
- Correct objections now have a deliberate reveal beat, but the impact/reveal animation still uses CSS compositing rather than fully authored animated cut-ins.
- Courtroom acting now keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Court Record selection still requires closing the drawer before pressing the main `举证` button in the tested player path; a future pass should make that return-to-main-action step feel more automatic without reintroducing auto-submit.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-17 iteration 45 result

Implemented:
- Added a clear Court Record drawer CTA after selecting a trial evidence/profile: `带回庭审`.
- Kept the Ace Attorney-style two-step flow intact: selecting a record does not auto-submit; only the main trial `举证` button formally presents it.
- Changed trial record detail copy from a vague “回到主区” hint into a concrete sequence: select record -> `带回庭审` -> main `举证`.
- Added `recordReturnAvailable`, `selectedRecordLabel`, and `presentEnabled` to `window.render_game_to_text` so browser QA can assert the drawer-to-main-action chain directly.
- Styled the drawer return action as a prominent decision block without making it more important than the final `举证` button.

Verified:
- `npm run check:js`
- `npm run check:py`
- `git diff --check`
- Public old-template scan on `game/`: no matches for the previous opaque evidence phrases.
- `npm run qa:web-game` passed; inspected `output/web-game/shot-0.png`.
- Desktop 1440x810 Playwright flow collected all first-case evidence, reached ready-to-present statement 2, opened Court Record, selected `摇篮旁的值夜签`, confirmed `recordReturnAvailable=true`, clicked `带回庭审`, confirmed drawer/scrim closed and main `举证` enabled, then clicked `举证` into the objection reveal.
- Desktop screenshots inspected: `iteration45-desktop-record-return-cta.png` and `iteration45-desktop-returned-to-trial.png`.
- Mobile 390x844 Playwright flow confirmed the same selected-record return chain with no horizontal overflow.
- Mobile screenshots inspected: `iteration45-mobile-record-return-cta.png` and `iteration45-mobile-returned-to-trial.png`.

Remaining Ace Attorney gap list:
- Court Record selection now has an explicit return-to-court confirmation, but there is still no full evidence-detail modal with rotate/inspect-style interactions.
- Correct objections have a deliberate reveal beat, but the impact/reveal animation still uses CSS compositing rather than fully authored animated cut-ins.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-17 iteration 46 result

Implemented:
- Added a Court Record `详查` mode for selected evidence and selected profiles.
- Evidence inspection now opens a focused modal with a large evidence card, source/type, detailed description, courtroom use, risk note when present, and current index.
- Profile inspection now opens the same modal structure with a large character portrait, role, observation notes, and index.
- Added previous/next controls inside the inspection modal; ArrowLeft/ArrowRight also switch inspected records, while Escape closes the modal.
- In trial, the inspection modal can return directly to the main court action area through `带回庭审` without auto-submitting evidence.
- Added `recordInspectOpen`, `recordInspectType`, `recordInspectTitle`, and `recordInspectIndex` to `window.render_game_to_text` for deterministic QA.
- Fixed a CSS class collision where the profile inspection panel was accidentally styled as the portrait itself.
- Made the inspection action bar sticky so mobile users can see the key buttons without hunting through a long modal.

Verified:
- `npm run check:js`
- `npm run check:py`
- `git diff --check`
- Public old-template scan on `game/`: no matches for the previous opaque evidence phrases.
- `npm run qa:web-game` passed; inspected `output/web-game/shot-0.png`.
- Desktop 1440x810 Playwright flow: opened evidence inspection for `摇篮旁的值夜签`, switched to the next evidence, switched back, returned to court, formally presented evidence, and reached the objection reveal.
- Desktop profile inspection flow: opened `武则天`, ArrowRight switched to `狄仁杰`, Escape closed the modal.
- Mobile 390x844 Playwright flow verified the same evidence/profile inspection chains with no horizontal overflow and visible sticky action controls.
- Screenshots inspected: `iteration46-desktop-evidence-inspect.png`, `iteration46-desktop-profile-inspect.png`, and `iteration46-mobile-evidence-inspect.png`.

Remaining Ace Attorney gap list:
- Court Record now has a full inspection modal, but evidence inspection still uses generated card art rather than bespoke item illustrations or true rotate/examine hotspots.
- Correct objections have a deliberate reveal beat, but the impact/reveal animation still uses CSS compositing rather than fully authored animated cut-ins.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.
