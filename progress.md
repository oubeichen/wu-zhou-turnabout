Original prompt: 做一个仿照 《逆转裁判》 的完整游戏。始终检查当前游戏和《逆转裁判》游戏差距在哪里，然后修改优化直到完成。不要有任何偷懒简化设计，不要实现简单设计，多考虑现代游戏的功能 内容 和 用户交互是什么样的，可以利用所有你能力用到的工具 包括 图像生成，第三方开源工具 开源库等等

# Progress

## 2026-06-18 iteration 60 result

Implemented:
- Used the built-in image generation tool for a courtroom impact-burst sprite-sheet direction, then implemented a committed reproducible bitmap sheet because no copyable project file path was exposed by the built-in image result.
- Added `scripts/generate_court_impact_sheet.py`, producing `game/assets/court-impact-burst-sheet-v1.png` as a 3-frame horizontal PNG sheet:
  - frame 1: red-gold objection burst.
  - frame 2: blue-black penalty/rejection burst.
  - frame 3: gold verdict/turnabout burst.
- Upgraded `renderCue()` so the immediate courtroom impact flash now renders a `.impact-bitmap` layer from the PNG sheet before the text and acting frames.
- Added `impactBitmapFrameFor(cue)`:
  - penalty cues use frame 2.
  - verdict/turnabout cues use frame 3.
  - normal objection cues use frame 1.
- Raised `.court-impact` above the objection reveal layer so the instant flash is actually visible before fading, while keeping `pointer-events: none`.
- Reduced the old CSS `impact-lines` to a low-opacity overlay so it no longer carries the main visual weight.
- Added `impactBitmapAsset` and `impactBitmapFrame` to `window.render_game_to_text`.
- Added the new impact generator to `npm run check:py`.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX=/Users/oubeichen/Projects/wuzetian2/.pycache npm run check:py`
- `git diff --check`
- `npm run qa:web-game` passed with browser launch permission; the only warning remains the external develop-web-game script's module-type warning.
- Opened `game/assets/court-impact-burst-sheet-v1.png` and visually confirmed it contains three non-empty bitmap impact frames with no readable text.
- Desktop 1440x810 Playwright correct-present flow:
  - collected all 6 investigation evidence items.
  - entered trial, pressed statement 2, selected `摇篮旁的值夜签`, returned, and clicked `举证`.
  - confirmed `impactKind=objection`, `impactBitmapAsset=court-impact-burst-sheet-v1.png`, `impactBitmapFrame=1`, background position `0`, `z-index=38`, and page overflow `0x0`.
- Desktop 1440x810 Playwright premature-present flow:
  - selected the same statement and evidence without pressing first.
  - confirmed `impactKind=penalty`, `impactTitle=追问不足`, `impactBitmapFrame=2`, background position `50%`, no objection reveal, and page overflow `0x0`.
- Mobile 390x844 Playwright correct-present flow confirmed `impactBitmapFrame=1`, the PNG sheet loads, and horizontal overflow is `0`.
- Captured an early desktop frame at 80ms after `举证` and visually confirmed the bitmap impact burst is visible above the objection reveal: `iteration60-impact-objection-early-desktop.png`.
- Screenshots inspected: `iteration60-impact-objection-early-desktop.png`, `iteration60-impact-objection-mobile.png`, and the earlier desktop penalty/object screenshots used during verification.

Remaining Ace Attorney gap list:
- The immediate impact flash now has a bitmap burst layer, but the text itself is still DOM-rendered rather than a fully authored bitmap callout.
- Correct objections and impact flashes now have separate committed bitmap sheets, but they still need higher-fidelity case/opponent-specific authored animation strips.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Evidence inspection supports lens and drag/swipe rotation, but deeper object-specific interactions such as peeling, unfolding, matching fragments, or flipping seals are still missing.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 59 result

Implemented:
- Used the built-in image generation tool for a three-frame Tang courtroom objection cut-in visual direction, then implemented a committed reproducible bitmap sprite sheet because no copyable project file path was exposed by the built-in image result.
- Added `scripts/generate_objection_cutin_sheet.py`, producing `game/assets/objection-cutin-sheet-v1.png` as a 3-frame horizontal PNG sheet:
  - frame 1: defense voice/pointing-sleeve cut-in.
  - frame 2: evidence record under a gold spotlight.
  - frame 3: opponent shaken by fracture impact lines.
- Replaced the objection reveal's old DOM portrait cut-in cards with bitmap sprite rendering:
  - a large current-frame `.objection-sprite-stage`.
  - three small `.objection-sprite-thumb` step frames using the same PNG sheet.
  - background positions now switch from frame 1 to 2 to 3 as the reveal advances.
- Added `objectionRevealSpriteAsset` and `objectionRevealSpriteFrame` to `window.render_game_to_text`.
- Adjusted desktop objection reveal layout so the full overlay, stepper, and action buttons fit in a 1440x810 PC viewport without page scrolling.
- Added mobile sizing for the sprite stage and thumbnails so the cut-in remains visible with no horizontal overflow.
- Added the new generator to `npm run check:py`.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX=/Users/oubeichen/Projects/wuzetian2/.pycache npm run check:py`
- `git diff --check`
- `npm run qa:web-game` passed with browser launch permission; the only warning remains the external develop-web-game script's module-type warning.
- Opened `game/assets/objection-cutin-sheet-v1.png` and visually confirmed it contains three non-empty bitmap frames with no readable text.
- Desktop 1440x810 Playwright UI flow:
  - confirmed `进入庭审` is disabled on the case intro before evidence collection.
  - collected all 6 investigation evidence items through the investigation UI.
  - entered trial, moved to statement 2, pressed it, selected `摇篮旁的值夜签`, returned to trial, and clicked `举证`.
  - confirmed objection reveal opens with `objectionRevealSpriteAsset=objection-cutin-sheet-v1.png`.
  - confirmed sprite frame progression: step 1 position `0`, step 2 `50%`, step 3 `100%`.
  - confirmed overlay action buttons are visible in the same 1440x810 viewport and page overflow is `0x0`.
- Mobile 390x844 Playwright UI flow repeated the same correct-present path and confirmed the sprite frame is visible, the next button is visible, and horizontal overflow is `0`.
- Screenshots inspected: `iteration59-objection-sprite-desktop-fit.png` and `iteration59-objection-sprite-mobile-fit.png`.

Remaining Ace Attorney gap list:
- Correct objections now use a committed bitmap sprite sheet for the reveal cut-in, but they still need higher-fidelity hand-authored or image-gen-exported animation strips per case/opponent.
- The immediate impact flash before the reveal still uses DOM/CSS impact text and lines; it should eventually become a bitmap/particle animation layer.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Evidence inspection supports lens and drag/swipe rotation, but deeper object-specific interactions such as peeling, unfolding, matching fragments, or flipping seals are still missing.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

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

## 2026-06-18 iteration 61 result

Implemented:
- Added a bitmap court-impact callout sheet with seven authored title frames: `异议成立`, `追问不足`, `驳回`, `反制`, `逆转`, `判决`, and `档案击破`.
- Reworked court-impact rendering so the visible title is now drawn from `court-impact-callout-sheet-v1.png`; the DOM text remains only as an accessible fallback.
- Added deterministic frame mapping for objection, penalty, rebuttal, reversal, verdict, and dossier-break cues.
- Exposed `impactCalloutAsset` and `impactCalloutFrame` through `window.render_game_to_text` so browser QA can assert that the visual cue uses the sprite sheet instead of plain text.
- Added the bitmap-sheet generator to Python checks so the asset pipeline stays reproducible.

Verified:
- `python3 scripts/generate_court_impact_callout_sheet.py`
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `npm run qa:web-game`
- Desktop 1440x810 Playwright correct-present flow confirmed `impactKind=objection`, `impactCalloutAsset=court-impact-callout-sheet-v1.png`, `impactCalloutFrame=1`, callout sprite background loaded, hidden fallback text clipped, and no page-level overflow.
- Desktop 1440x810 Playwright premature-present flow confirmed `impactKind=penalty`, `impactCalloutFrame=2`, sprite background-position switched to the second frame, and no page-level overflow.
- Mobile 390x844 Playwright correct-present flow confirmed the bitmap callout is visible with no horizontal overflow.
- Screenshots inspected: `iteration61-impact-callout-objection-desktop.png` and `iteration61-impact-callout-objection-mobile.png`.

Remaining Ace Attorney gap list:
- Impact, cut-in, and title callout cues now use bitmap layers, but case/opponent-specific high-fidelity animation strips are still missing.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Evidence inspection has a full modal and item/card art, but complex evidence objects still need richer bitmap item illustrations and object-specific inspect interactions.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 62 result

Implemented:
- Used the image generation tool for a Tang-dynasty evidence sprite-sheet visual direction pass, then converted the usable direction into a project-local reproducible bitmap pipeline.
- Upgraded `scripts/generate_evidence_item_sheet.py` to emit `evidence-item-sheet-v3.png`.
- Added specific complex-evidence drawing branches for sealed rosters, petition stacks, ink-stained edicts, clue boards, court notes, succession records, folded wills, bronze-box letters, torn manifestos, street notices, interrogation rosters, arrest warrants, scorched jar mouths, confession papers with brush, interrogation manuals, rescue notes, reward ledgers, fabricated charge strips, and guard shift orders.
- Switched Court Record thumbnails and evidence detail metadata from `evidence-item-sheet-v2.png` to `evidence-item-sheet-v3.png`.
- Updated README technical notes so the documented evidence-art pipeline points at the v3 asset and explains that complex evidence is rendered as combined item bitmap art.

Verified:
- `python3 scripts/generate_evidence_item_sheet.py`
- Visual inspection of `game/assets/evidence-item-sheet-v3.png`: complex evidence now has distinct multi-object silhouettes instead of repeated generic file cards.
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `npm run qa:web-game`
- Desktop 1440x810 Playwright flow opened a new case, entered investigation, collected the first evidence through a scene hotspot, opened Court Record, and confirmed the unlocked thumbnail uses `evidence-item-sheet-v3.png`, `filter=none`, and no page-level overflow.
- Screenshot inspected: `iteration62-evidence-v3-record-unlocked-desktop.png`.

Remaining Ace Attorney gap list:
- Complex evidence thumbnails are now richer bitmap props, but the `详查` modal still needs object-specific interaction hotspots for each important artifact.
- The evidence sheet is reproducible local bitmap art; future passes can replace selected high-value props with direct Image API exports once the tool exposes stable workspace output paths.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 63 result

Implemented:
- Upgraded Court Record `详查` from generic evidence spots into object-specific inspection logic for key evidence families.
- Added per-evidence-type inspection spots for clue boards, rosters, ledgers, petitions, edicts, bronze-box letters, notices, orders, scorched jars, confession papers, interrogation manuals, notes, and tallies.
- Added an in-art `已查` progress badge and checked hotspot states so players can tell which parts of an evidence object have been inspected.
- Marked inspected spots when the modal opens, when the player switches view, and when the player clicks a hotspot.
- Exposed `recordInspectSpotId`, `recordInspectSpotChecked`, `recordInspectProgress`, `recordInspectCheckedCount`, and `recordInspectTotalCount` through `window.render_game_to_text` for deterministic QA.
- Added fallback lens slot positions so object-specific hotspot ids still place the magnifier correctly on desktop and mobile.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `npm run qa:web-game`
- Desktop 1440x810 Playwright flow collected all first-case investigation evidence, opened Court Record, selected `后位线索板`, opened `详查证物`, clicked object-specific spots, switched to `背面`, and confirmed `红线关系` / `钉住节点` / `排列顺序` observations plus progress from `1/6` to `3/6` with no page-level overflow.
- Mobile 390x844 Playwright flow opened `后位线索板` inspection, switched to `边缘`, clicked `反复翻阅`, confirmed `recordInspectProgress=2/6`, and confirmed no horizontal overflow.
- Screenshots inspected: `iteration63-evidence-specific-inspect-desktop.png` and `iteration63-evidence-specific-inspect-mobile.png`.

Remaining Ace Attorney gap list:
- Evidence inspection now has object-specific hotspots and progress, but the most important objects still need puzzle-like secondary interactions such as comparing two items or unlocking a new deduction after all parts are inspected.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Impact, cut-in, title callout, and evidence art now use bitmap layers, but case/opponent-specific high-fidelity animation strips are still missing.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 64 result

Implemented:
- Added a Court Record `证物对照` secondary reasoning step after an evidence item has all inspection spots checked.
- The compare panel stays locked until the current evidence reaches full `详查` progress; after completion it offers collected evidence candidates from the same case.
- Added compare target logic for key evidence families so clue boards, rosters, tallies, bronze-box records, jar/confession/manual chains, and orders can suggest a meaningful matching evidence item.
- Correct comparisons produce a `推理确认` result; wrong comparisons produce a non-punitive hint so players can keep reasoning without leaving the modal.
- Exposed compare QA fields through `window.render_game_to_text`: readiness, options, target, result, and result text.
- Adjusted mobile `详查` actions so the bottom controls no longer cover the new compare panel.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `npm run qa:web-game`
- Desktop 1440x810 Playwright flow collected all first-case evidence, opened `后位线索板` inspection, checked all six spots, confirmed compare readiness and options, selected `染墨的封后诏稿`, and reached `recordInspectCompareResult=match` with no page-level overflow.
- Mobile 390x844 Playwright flow repeated the same completed-inspection compare path, confirmed `match`, `6/6`, and no horizontal overflow after the sticky-action layout fix.
- Screenshots inspected: `iteration64-evidence-compare-desktop.png` and `iteration64-evidence-compare-mobile-final.png`.

Remaining Ace Attorney gap list:
- Evidence inspection now supports hotspot completion and item comparison, but these deductions do not yet unlock new trial-only evidence or branch dialogue.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Impact, cut-in, title callout, and evidence art now use bitmap layers, but case/opponent-specific high-fidelity animation strips are still missing.
- Audio has local cue samples and looped music tracks, but the tracks are procedurally generated placeholders rather than fully authored soundtrack compositions.

## 2026-06-18 iteration 65 result

Implemented:
- Persisted successful evidence comparisons as Court Record `对照札记` entries through a new `recordDeductions` save field.
- Correct `证物对照` now writes the confirmed reasoning back into the current evidence record instead of remaining only as a transient modal message.
- Evidence list rows show an `已对照` badge when an item has a saved deduction.
- Selected evidence detail renders the saved `对照札记` with the matched evidence name.
- The `详查` compare panel also reuses saved deduction text so reopening the modal shows the already confirmed reasoning.
- Added QA fields for selected-evidence deduction text/target, current inspect deduction text, and per-case deduction count.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Source inspection confirmed `recordDeductions` is included in `snapshotSaveData()` and `restoreSaveData()`, and is rendered in evidence list/detail/inspect UI.
- Browser persistence verification was attempted but blocked by the environment approval/usage limit before Chromium could launch. This remains a follow-up verification item; do not treat the browser persistence path as visually verified yet.

Remaining Ace Attorney gap list:
- Saved compare deductions now update the Court Record, but they still do not unlock new trial-only evidence or branch dialogue.
- Browser verification for the saved-deduction reload path still needs to be rerun when browser execution is available again.
- Courtroom acting keeps both portraits visible, but character animation remains limited to a shared multi-pose sheet rather than bespoke per-character animation strips.
- Impact, cut-in, title callout, and evidence art now use bitmap layers, but case/opponent-specific high-fidelity animation strips are still missing.

## 2026-06-18 iteration 66 result

Implemented:
- Rewrote the case-intro headline paragraph for all five cases from objective/briefing copy into story-first incident hooks.
- Replaced homepage briefing cards with more player-readable narrative beats: what happened, what feels wrong, and why the opponent's version is dangerous.
- Reworked the chapter-source strip so buttons show story clues such as `宫门前的哭声` / `值夜签被改` instead of leading with opaque `卷宗`-style labels.
- Kept original chapter provenance in the detail panel as `原书线索：...`, so players can still understand where the adapted beat comes from without reading a bibliography first.
- Added `caseSourceTabs`, `activeCaseSourceTitle`, `activeCaseSourceChapter`, and `activeCaseSourceNote` to `render_game_to_text` so future QA can catch regressions back to manual-like copy.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Source inspection confirmed every current case has story-first intro card copy and every current timeline entry has a story clue title/note.

Blocked verification:
- `npm run qa:web-game` still cannot launch Chromium in this environment because macOS denies Chromium's Mach port rendezvous.
- In-app Browser verification was attempted. Direct `file://` navigation was blocked by Browser Use URL policy, and starting a local HTTP server from the browser runtime failed with `listen EPERM` on `127.0.0.1:8788`. This iteration therefore has no fresh visual screenshot verification.

Remaining Ace Attorney gap list:
- Case-intro copy is now more story-like, but investigation dialogue, evidence descriptions, and trial testimony still need a broader pass to sound like character voices instead of system explanation.
- Evidence art already uses bitmap sheets, but complex props still need a follow-up pass using exportable Image API assets or a stronger generated sprite workflow.
- Saved compare deductions now update the Court Record, but they still do not unlock new trial-only evidence or branch dialogue.
- Browser visual verification needs to be rerun when local browser execution is available again.

## 2026-06-18 iteration 67 result

Implemented:
- Strengthened the committed raster evidence-sheet pipeline for complex evidence objects.
- Added reusable hand-painted material helpers to `scripts/generate_evidence_item_sheet.py`: paper grain, rough paper edges, material grain, and small highlight strokes.
- Applied the richer raster treatment to multi-object and high-complexity props: minister petition stacks, clue boards, bronze petition boxes, scorched urn mouths, torn manifestos, street notices, interrogation rosters, and confession brush/inkstone evidence.
- Regenerated `game/assets/evidence-item-sheet-v3.png` so these items read more like distinct historical props instead of flat geometric icons.
- Fixed a generated-art overflow issue where the confession inkstone reused a large-object brush path and escaped its evidence cell.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Visual inspection of `game/assets/evidence-item-sheet-v3.png` confirmed the regenerated sheet stays inside its grid cells and the complex props now have visible paper, bronze, soot, thread, and ink textures.

Blocked verification:
- No fresh browser screenshot was captured in this iteration because the local browser restrictions recorded in iteration 66 still apply.

Remaining Ace Attorney gap list:
- Evidence icons are now stronger committed bitmap props, but the workflow still lacks direct, per-prop exported Image API source files that can be curated one by one.
- Case-intro copy is more story-like, but investigation dialogue, evidence descriptions, and trial testimony still need a broader character-voice rewrite.
- Saved compare deductions update the Court Record, but they still do not unlock new trial-only evidence or branch dialogue.
- Browser visual verification needs to be rerun when local browser execution is available again.

## 2026-06-18 iteration 68 result

Implemented:
- Connected saved Court Record `对照札记` entries back into the courtroom loop.
- Added `trialDeductionForStatement()` so a saved deduction is only surfaced after the player has pressed a contradictory statement and the answer evidence has a matching saved deduction.
- Added a compact `对照札记可用` trial card above the selected-record bar, reminding players to use the already compared evidence without auto-submitting it.
- Updated the trial guide copy so it can point players toward a saved deduction when a ready-to-present statement has one.
- Updated the correct-present reveal sequence so deductions change the cut-in subtitle and step text, making the objection feel based on prior evidence comparison rather than a raw guess.
- Added `trialDeductionAvailable`, `trialDeductionEvidence`, `trialDeductionTarget`, `trialDeductionText`, `objectionRevealDeductionText`, and `objectionRevealDeductionTarget` to `render_game_to_text`.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Source inspection confirmed the new deduction path is gated by `statementReadyToPresent()` and only reads saved `recordDeductions` for answer-evidence statements.

Blocked verification:
- `npm run qa:web-game` was attempted and still fails before page load because Chromium cannot register its Mach port rendezvous in this environment (`Permission denied (1100)`). No new browser screenshot was captured.

Remaining Ace Attorney gap list:
- Saved deductions now influence trial guidance and objection reveal copy, but they still do not unlock new testimony branches, new evidence, or alternate courtroom routes.
- Browser visual verification needs to be rerun when local browser execution is available again.
- Investigation dialogue, evidence descriptions, and trial testimony still need a broader character-voice rewrite.
- Evidence icons are stronger bitmap props, but selected high-value items still lack curated per-prop Image API source exports.

## 2026-06-18 iteration 69 result

Implemented:
- Upgraded saved `对照札记` from courtroom hint text into an actual post-objection pursuit branch.
- Correctly presenting an evidence item with a saved deduction now creates `pendingDeductionFollowUp` instead of immediately falling through to the normal testimony result.
- Added a full-screen `追击证词` beat where the player must click `追击证人` or press Enter/Space to push the witness on the saved deduction.
- After the pursuit resolves, the original testimony progression resumes through the shared `finishCorrectPresent()` path, preserving existing solved-statement, testimony-interlude, verdict, recovery, and turnabout behavior.
- Added `deductionPursuits` to trial progress and result stats as `札记追击`, so the route is reflected in the case clear summary.
- Added QA fields for `pendingDeductionFollowUp`, pending deduction record/text/target/chase line, and pursuit count.
- Added desktop/mobile styling for the pursuit scene so the two reasoning blocks collapse to one column on narrow screens.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Source inspection confirmed reset/retry initializes the new fields, keyboard and click events both continue the pursuit, and `render_game_to_text` exposes the new state.

Blocked verification:
- `npm run qa:web-game` was attempted after the final change and still fails before page load because Chromium cannot register its Mach port rendezvous in this environment (`Permission denied (1100)`). No new browser screenshot was captured.

Remaining Ace Attorney gap list:
- Saved deductions now create a real pursuit branch, but the branch is still generic; future iterations should author case-specific pursuit lines and optionally unlock unique testimony/evidence.
- Browser visual verification needs to be rerun when local browser execution is available again.
- Investigation dialogue, evidence descriptions, and trial testimony still need a broader character-voice rewrite.
- Evidence icons are stronger bitmap props, but selected high-value items still lack curated per-prop Image API source exports.

## 2026-06-18 iteration 70 result

Implemented:
- Rewrote saved `对照札记` pursuit copy so each case now has its own pursuit title, defense challenge, witness reaction, and action button.
- Added case-specific pursuit beats for the five current cases: `哭声被写进了诏书`, `家事被整理成罪名`, `投书途中被加了罪`, `供词照着刑具长出来`, and `半小时早被人排好`.
- Expanded the full-screen `追击证词` beat from two reasoning cards to three cards, adding the witness reaction as visible story feedback instead of hiding it in system text.
- Included witness-reaction copy in the post-pursuit objection message so the branch feels like a courtroom exchange, not a generic confirmation.
- Added `pendingDeductionPursuitTitle`, `pendingDeductionWitnessLine`, and `pendingDeductionButton` to `render_game_to_text` for regression checks.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Source inspection confirmed the pursuit copy uses stable fallbacks for missing record names and exposes the new QA fields.

Blocked verification:
- `npm run qa:web-game` was attempted and still fails before page load because Chromium cannot register its Mach port rendezvous in this environment (`Permission denied (1100)`). No new browser screenshot was captured.

Remaining Ace Attorney gap list:
- Pursuit branches are now case-specific, but they still do not unlock unique evidence/testimony routes after the chase.
- The latest case-home screenshot still reads too much like briefing copy rather than a playable story scene; the next iteration should rewrite the case-intro opening into witness/defense dialogue and make chapter source cards feel actionable.
- Browser visual verification needs to be rerun when local browser execution is available again.
- Investigation dialogue, evidence descriptions, and trial testimony still need a broader character-voice rewrite.
- Evidence icons are stronger bitmap props, but selected high-value items still lack curated per-prop Image API source exports.

## 2026-06-18 iteration 71 result

Implemented:
- Rebuilt the case-intro opening from a one-line objective plus briefing cards into a story-first scene block.
- Added five per-case opening scenes with incident moment, dramatic title, plain-language story paragraph, and player-facing stakes, so ordinary players can understand what happened before choosing `开始调查`.
- Moved the existing witness/defense opening lines into the story block as visible dialogue, avoiding the previous separate black “script note” block that still felt like UI instruction text.
- Reframed the three briefing cards under `先盯住这三个地方`, clarifying that they are suspicious story points rather than a task checklist.
- Reworked chapter-source tabs with a section header, `点击翻看` / `当前线索` labels, and detail copy beginning with `这一段能帮你看清`, so the buttons no longer look like unexplained `卷宗X` blocks.
- Added `caseOpeningTitle`, `caseOpeningBody`, and `caseOpeningStakes` to `render_game_to_text`.
- Added desktop/mobile CSS for the story block, dialogue strip, and section titles, including a clamp override so the case opening text is not silently cut off by the single-window desktop layout rules.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Source inspection confirmed the old standalone opening-lines block was removed from the case-intro flow and the new story fields are exposed for QA.

Blocked verification:
- `npm run qa:web-game` was attempted and still fails before page load because Chromium cannot register its Mach port rendezvous in this environment (`Permission denied (1100)`). No new browser screenshot was captured.

Remaining Ace Attorney gap list:
- Case-intro opening now reads more like a story scene, but investigation dialogue, evidence descriptions, and trial testimony still need a broader character-voice rewrite.
- Chapter-source tabs are clearer and clickable, but they could later become a staged “翻阅卷宗” drawer instead of living fully on the case intro.
- Pursuit branches are case-specific, but they still do not unlock unique evidence/testimony routes after the chase.
- Browser visual verification needs to be rerun when local browser execution is available again.
- Evidence icons are stronger bitmap props, but selected high-value items still lack curated per-prop Image API source exports.

## 2026-06-18 iteration 72 result

Implemented:
- Replaced the shared investigation-location template with per-case, per-location investigation scripts in `scripts/build_game_content.py`.
- Added bespoke descriptions, two talk topics, and two examine spots for all three investigation locations in each of the five cases: 15 locations total.
- Rewrote investigation talk to sound like specific witnesses, clerks, guards, historians, defense aides, and opponents reacting to the local case instead of generic hints.
- Rebuilt `game/game-data.js` from the source script so the playable investigation flow now has case-specific dialogue such as `哭声从哪来`, `账册是谁递的`, `投书人看见什么`, `供状太干净`, and `半小时够做什么`.
- Kept fallback investigation templates in the generator for future cases, but current five cases now all use authored scripts.

Verified:
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" python3 -m py_compile scripts/build_game_content.py`
- `python3 scripts/build_game_content.py`
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Custom Node data integrity check confirmed `cases=5`, `locations=15`, and each case contains its expected authored investigation topic titles.

Blocked verification:
- `npm run qa:web-game` was attempted and still fails before page load because Chromium cannot register its Mach port rendezvous in this environment (`Permission denied (1100)`). No new browser screenshot was captured.

Remaining Ace Attorney gap list:
- Investigation dialogue is now case-specific, but evidence descriptions and courtroom testimony still need the same character-voice treatment.
- Browser visual verification needs to be rerun when local browser execution is available again.
- Chapter-source tabs are clearer and clickable, but they could later become a staged `翻阅卷宗` drawer instead of living fully on the case intro.
- Pursuit branches are case-specific, but they still do not unlock unique evidence/testimony routes after the chase.
- Evidence icons are stronger bitmap props, but selected high-value items still lack curated per-prop Image API source exports.

## 2026-06-18 iteration 73 result

Implemented:
- Added a `case_testimony_script()` layer in `scripts/build_game_content.py` so the five current cases no longer share the same courtroom testimony wording.
- Rewrote witness testimony, opponent legality testimony, and final reasoning testimony for all five cases with case-specific voice and stakes.
- Kept the existing trial mechanics intact: answer evidence, answer profile, hidden profile contradiction, counterattack trap, recovery branch, court-note unlock, and final court-note answer still use the same structural fields.
- Regenerated `game/game-data.js` so the playable trial now contains authored lines such as `东宫旧臣递账那晚`, `我只把纸投进铜匦`, `空瓮、供状、手册`, and `夜门那半小时`.

Verified:
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" python3 -m py_compile scripts/build_game_content.py`
- `python3 scripts/build_game_content.py`
- Custom Node integrity check confirmed `cases=5`, `testimonyGroups=15`, `trapCases=4`, and every case still has hidden profile contradictions, court-note unlocks, final court-note answers, and authored phrase coverage.
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`

Blocked verification:
- `npm run qa:web-game` was attempted and still fails before page load because Chromium cannot register its Mach port rendezvous in this environment (`Permission denied (1100)`). No new browser screenshot was captured.

Remaining Ace Attorney gap list:
- Trial testimony is now case-specific, but evidence details still read partly like explanatory database text and need a player-facing character-voice pass.
- Pursuit branches are case-specific, but they still do not unlock unique evidence/testimony routes after the chase.
- Browser visual verification needs to be rerun when local browser execution is available again.
- Chapter-source tabs are clearer and clickable, but they could later become a staged `翻阅卷宗` drawer instead of living fully on the case intro.
- Evidence icons are stronger bitmap props, but selected high-value items still lack curated per-prop Image API source exports.

## 2026-06-18 iteration 74 result

Implemented:
- Added an `EVIDENCE_VOICE_COPY` display layer in `scripts/build_game_content.py` so player-facing Court Record text can be authored separately from evidence ids and structure.
- Rewrote visible summary/detail/use text for all investigation evidence in the current five cases with plainer, more story-like language.
- Expanded `FINAL_BOARD_COPY` with case-specific detail/use text so clue-board evidence no longer falls back to generic `线索板用红线` explanation.
- Added `COURT_NOTE_COPY` so trial-only `庭上追问记录` text now reflects each case's actual pursuit gap instead of one generic description.
- Regenerated `game/game-data.js` with the new evidence copy while keeping evidence ids, source chapters, counter-risk metadata, and trial answer references intact.

Verified:
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" python3 -m py_compile scripts/build_game_content.py`
- `python3 scripts/build_game_content.py`
- Custom Node integrity check confirmed 5 cases, 34 evidence entries, upgraded board/court-note copy, and valid `answerEvidence` / `counterEvidence` / `pressUnlockEvidence` references. The fifth case has 6 evidence entries because it has 4 source chapters plus clue board plus court note.
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`

Blocked verification:
- `npm run qa:web-game` was attempted and still fails before page load because Chromium cannot register its Mach port rendezvous in this environment (`Permission denied (1100)`). No new browser screenshot was captured.

Remaining Ace Attorney gap list:
- Case intro, investigation dialogue, testimony, and evidence text are now more character/story oriented; the larger remaining gameplay gap is that pursuit branches still do not unlock unique evidence/testimony routes after the chase.
- Browser visual verification needs to be rerun when local browser execution is available again.
- Chapter-source tabs are clearer and clickable, but they could later become a staged `翻阅卷宗` drawer instead of living fully on the case intro.
- Evidence icons are stronger bitmap props, but selected high-value items still lack curated per-prop Image API source exports.

## 2026-06-18 iteration 75 result

Implemented:
- Connected `对照札记` pursuit branches to an actual Court Record unlock instead of leaving them as dialogue-only beats.
- Correctly resolving a deduction pursuit now unlocks the current case's trial-only `庭上追问记录` through the shared `unlockEvidence()` path.
- Added a visible pursuit-scene reward hint: `追击成立后写入法庭记录：庭上追问记录`.
- Added `deductionPursuitUnlocks` and `lastPursuitUnlock` to trial progress and reset state, plus a result-page `追击补记` stat.
- Added QA fields `deductionPursuitUnlocks`, `lastPursuitUnlock`, `pendingDeductionUnlock`, and `pursuitNoteCollected` to `render_game_to_text`.
- Added desktop/mobile styling for the pursuit reward hint.

Verified:
- Source inspection confirmed pursuit unlocks target the existing `${caseId}-ev-court-note` trial-only evidence for all five cases.
- Custom Node check confirmed all five cases have the trial-only court note target.
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`

Blocked verification:
- `npm run qa:web-game` was attempted and still fails before page load because Chromium cannot register its Mach port rendezvous in this environment (`Permission denied (1100)`). No new browser screenshot was captured.

Remaining Ace Attorney gap list:
- Pursuit now changes Court Record resources, but it reuses the existing `庭上追问记录` to avoid overflowing the current 7-column evidence sprite sheet. A later media-system pass should expand the sheet and add fully separate pursuit-only evidence.
- Browser visual verification needs to be rerun when local browser execution is available again.
- Chapter-source tabs are clearer and clickable, but they could later become a staged `翻阅卷宗` drawer instead of living fully on the case intro.
- Evidence icons are stronger bitmap props, but selected high-value items still lack curated per-prop Image API source exports.

## 2026-06-18 iteration 76 result

Implemented:
- Expanded the committed evidence item sprite sheet from 7 columns to 8 columns in `scripts/generate_evidence_item_sheet.py`.
- Updated frontend evidence-sheet positioning to use `evidenceSheetColumns = 8` instead of hard-coded 7-column math.
- Added a separate trial-only `追击补记` evidence item for every current case with authored names, summaries, details, and use text.
- Changed `对照札记` pursuit rewards to unlock `${caseId}-ev-pursuit-note` instead of reusing `${caseId}-ev-court-note`.
- Preserved the final testimony path: final press/unlock and final answer still use `${caseId}-ev-court-note`; pursuit notes no longer leak into final testimony answers.
- Regenerated `game/game-data.js` and `game/assets/evidence-item-sheet-v3.png`; the PNG is now `1440x1050` and contains the new 8th-column pursuit-note icons.

Verified:
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" python3 -m py_compile scripts/build_game_content.py scripts/generate_evidence_item_sheet.py`
- `python3 scripts/build_game_content.py`
- `python3 scripts/generate_evidence_item_sheet.py`
- Custom Node integrity check confirmed 5 pursuit notes, evidence counts `[8,8,8,8,7]`, final testimony still uses court notes, and pursuit notes do not leak into final testimony answer/unlock fields.
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Visual inspection of `game/assets/evidence-item-sheet-v3.png` confirmed the 8-column sheet renders nonblank pursuit-note icons without obvious cropping.

Blocked verification:
- `npm run qa:web-game` was attempted and still fails before page load because Chromium cannot register its Mach port rendezvous in this environment (`Permission denied (1100)`). No new browser screenshot was captured.

Remaining Ace Attorney gap list:
- Pursuit now unlocks fully separate evidence, but the new pursuit notes reuse the local generated court-note icon style; high-value notes still need curated Image API assets when an exportable path is available.
- Browser visual verification needs to be rerun when local browser execution is available again.
- Chapter-source tabs are clearer and clickable, but they could later become a staged `翻阅卷宗` drawer instead of living fully on the case intro.

## 2026-06-18 iteration 77 result

Implemented:
- Added pursuit-only hidden follow-up testimony for all five cases, with three unlockable statements per case across surface, legality, and final reasoning sections.
- Correct evidence with a saved `对照札记` now unlocks both `${caseId}-ev-pursuit-note` and a matching hidden follow-up testimony line.
- Added `requiredAfterUnlock` so pursuit-only statements do not block the ordinary trial route before the player chooses to pursue.
- Focuses the newly revealed follow-up testimony after pursuit and records `lastPursuitStatement` for QA/debug text output.
- Exposed pending/last pursuit statement labels through `render_game_to_text`.

Verified:
- Regenerated `game/game-data.js` with `python3 scripts/build_game_content.py`.
- Custom Node integrity check confirmed 5 cases, 15 pursuit triggers, 15 pursuit follow-up statements, matching unlock ids, and pursuit follow-ups answered by `${caseId}-ev-pursuit-note`.
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`

Blocked verification:
- `npm run qa:web-game` was attempted and still fails before page load because Chromium cannot register its Mach port rendezvous in this environment (`Permission denied (1100)`). No new browser screenshot was captured.

Remaining Ace Attorney gap list:
- Pursuit now changes both evidence and testimony state, but the case-intro/home dossier copy still needs another pass toward scene storytelling instead of briefing prose.
- Browser visual verification needs to be rerun when local browser execution is available again.
- High-value pursuit-note icons still need curated Image API assets when a filesystem-exportable path is available.

## 2026-06-18 iteration 78 result

Implemented:
- Installed the external `novel-writing` Codex skill from `wgwtest/novel-writing` into `/Users/oubeichen/.codex/skills/novel-writing` and applied its character-introduction, scene-structure, style-fidelity, and realism-constraint guidance to the current case-intro rewrite.
- Added `menuHook`, `openingStory`, `introCards`, and `sourceStoryItems` to every current case blueprint so case-home and case-intro copy comes from authored story data instead of UI hard-coded fallback prose.
- Expanded each case opening to three character-positioned lines: witness/record side, defense side, and opponent or key witness pressure.
- Updated `game/app.js` to prefer generated story fields for main-menu preview, case opening, briefing cards, and chapter-source tabs.
- Reworded case-source UI labels from technical chapter language toward player-facing dossier language.
- Tightened desktop case-intro layout so the 1280x720 PC view keeps the story, scene art, clickable dossier tabs, and `开始调查` button in one window without page or panel scrolling.

Verified:
- `python3 scripts/build_game_content.py`
- Custom Node integrity check confirmed 5 cases, 15 opening lines, 15 intro cards, and 30 source story items matching case timelines.
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `npm run qa:web-game` with non-sandbox Playwright Chromium succeeded; the default sandbox still blocks Chromium MachPortRendezvous, but non-sandbox browser launch is now verified.
- Browser screenshot inspection confirmed the main menu uses the new story hook and the case intro renders the story, three dialogue lines, scene art, clickable dossier tabs, and visible `开始调查` action.
- Browser layout probe at 1280x720 confirmed `bodyOverflowY=0`, `.case-brief` overflow delta `0`, and `startVisible=true`.

Remaining Ace Attorney gap list:
- Case intro is now story-first and single-screen on desktop, but later passes should add animated opening cuts instead of static story panels.
- Investigation and trial scenes still need more moment-to-moment character animation changes when testimony pressure rises.
- High-value pursuit-note icons still need curated Image API assets when a filesystem-exportable path is available.

## 2026-06-18 iteration 79 result

Implemented:
- Added a formal `case-opening` screen between case intro and investigation so first-time `开始调查` plays a three-beat opening sequence instead of jumping straight into command UI.
- The opening sequence uses the current case's generated story, first dossier clue, and opponent pressure line as three cinematic beats.
- Players can click the whole scene, click `继续`, or press Enter/Space to advance; `跳过开场` and Escape immediately enter investigation.
- Opening playback is tracked per case with `investigation[caseId].openingSeen`; after a player has seen or skipped it, `开始调查` goes straight to investigation.
- Added QA state fields for opening step, title, speaker, line, and `openingSeen`.
- Added desktop/mobile styling for a full-scene opening card, dialogue box, and bottom action row over the location background.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Non-sandbox Playwright flow verified `开始调查 -> case-opening 1/3 -> 2/3 -> 3/3 -> investigation`, with `openingSeen=true`, `bodyOverflowY=0`, and investigation action controls visible.
- Screenshot inspection of `output/web-game/opening-cutscene-step1.png` confirmed the opening scene renders as a staged background scene with readable story and dialogue, not a blank or ordinary form panel.
- Non-sandbox Playwright verified `跳过开场` enters investigation and a second `开始调查` after opening does not replay the cutscene.
- Non-sandbox `npm run qa:web-game` succeeded.

Remaining Ace Attorney gap list:
- Opening is now interactive and staged, but later passes should add motion/camera timing, audio stingers per beat, and case-specific cut-in art.
- Investigation and trial scenes still need more character pose changes tied to pressure and testimony state.
- High-value pursuit-note icons still need curated Image API assets when a filesystem-exportable path is available.

## 2026-06-18 iteration 80 result

Implemented:
- Removed the remaining SVG favicon data URI from `game/index.html` and added a committed PNG favicon at `game/assets/favicon.png`.
- Confirmed there are no `svg`, `data:image/svg`, `<svg>`, or `xmlns` references under `game/`.
- Reworked `scripts/generate_location_backgrounds.py` so investigation backgrounds no longer inherit the older episode-art images that had large vector-like outline boxes and watermark glyphs baked in.
- Regenerated all 15 `location-bg-*-{site,archive,defense}.png` investigation backgrounds from the clean bitmap room base with scene-specific tone, light, and subtle raster props.
- Removed the CSS `.scene.investigation::after` giant motif watermark so investigation scenes no longer overlay huge decorative text on top of the background.

Verified:
- `python3 scripts/generate_location_backgrounds.py`
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `rg -n "svg|SVG|data:image/svg|<svg|xmlns" game` returned no matches.
- Non-sandbox Playwright investigation-page check confirmed `svgElements=0`, `dataSvgRefs=0`, investigation `::after` content is `none`, `bodyOverflowY=0`, and the scene is using `location-bg-palace-site.png`.
- Screenshot inspection of `output/web-game/investigation-after-no-svg-no-watermark.png` confirmed the investigation page now uses a bitmap background without the previous large vector-like outlines or giant glyph overlay.
- Non-sandbox `npm run qa:web-game` succeeded.

Remaining Ace Attorney gap list:
- Investigation backgrounds are now clean PNG scenes, but the foreground hotspot buttons still use generic CSS pills; a later pass should replace them with a small committed PNG marker sheet or image-generated interactive marker assets.
- High-value pursuit-note icons still need curated Image API assets when a filesystem-exportable path is available.
- Trial scenes still need more character pose changes tied to pressure and testimony state.

## 2026-06-18 iteration 81 result

Implemented:
- Added a committed bitmap investigation marker sheet at `game/assets/investigation-marker-sheet-v1.png` with separate idle and recorded frames.
- Replaced the foreground investigation `.scene-hotspot` CSS pill buttons with sprite-backed PNG marker pins while keeping the same accessible button elements and click targets.
- Added a compact mobile treatment that keeps the PNG marker visible beside the label without reintroducing duplicate map buttons or SVG/vector decoration.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `rg -n "svg|SVG|data:image/svg|<svg|xmlns" game` returned no matches.
- `npm run qa:web-game` with escalated Chromium browser access succeeded.
- Non-sandbox Playwright investigation-page check confirmed the hotspot uses `investigation-marker-sheet-v1.png`, idle state starts at `0px 0px`, clicking it switches to the recorded frame at `-128px 0px`, `svgElements=0`, `htmlSvgText=false`, and `bodyOverflowY=0`.
- Screenshot inspection of `output/web-game/investigation-marker-png-after-click.png` confirmed the visible hotspot is now a bitmap marker over the scene rather than a generic pill or SVG-like foreground shape.

Remaining Ace Attorney gap list:
- Investigation hotspots are now PNG markers, but Court Record inspect hotspots still need a more tactile bitmap marker treatment instead of flat UI dots.
- High-value pursuit-note icons still need curated Image API assets when a filesystem-exportable path is available.
- Trial scenes still need more character pose changes tied to pressure and testimony state.

## 2026-06-18 iteration 82 result

Implemented:
- Added a committed bitmap Court Record inspection marker sheet at `game/assets/inspect-hotspot-marker-sheet-v1.png` with idle, active, and checked frames.
- Replaced the `详查` modal's flat red pill inspection hotspots with sprite-backed PNG markers while preserving the existing accessible buttons, numeric order badges, labels, and checked state.
- Tuned the mobile inspection hotspot positions so the PNG markers no longer crowd the `正面 / 背面 / 边缘` view tabs and still avoid horizontal overflow.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `rg -n "svg|SVG|data:image/svg|<svg|xmlns" game` returned no matches.
- `npm run qa:web-game` with escalated Chromium browser access succeeded.
- Desktop Playwright flow entered a new case, collected the first evidence, opened `记录 -> 详查证物`, confirmed the inspection hotspots load `inspect-hotspot-marker-sheet-v1.png`, and verified clicking the second hotspot advances `recordInspectProgress` from `1/6` to `2/6` with `bodyOverflowY=0`.
- Mobile 390px Playwright flow confirmed the PNG inspection marker loads, the first hotspot clears the angle tabs, and `bodyOverflowX=0`.
- Screenshot inspection of `output/web-game/inspect-hotspot-png-after-click.png` and `output/web-game/inspect-hotspot-png-mobile.png` confirmed the `详查` markers now read as bitmap game markers rather than flat UI pills.

Remaining Ace Attorney gap list:
- Investigation and Court Record hotspots now use committed PNG markers, but high-value pursuit-note and court-only evidence icons still need stronger generated raster art.
- Trial scenes still need more character pose changes tied to pressure and testimony state.
- Case opening scenes are staged, but later passes should add beat-specific motion/camera timing and audio stingers.

## 2026-06-18 iteration 83 result

Implemented:
- Split `庭上追问记录` and `追击补记` out of the shared generic `court_notes` sprite style in `scripts/generate_evidence_item_sheet.py`.
- Added a distinct `court_record_notes` icon: lacquer court-record folder, stacked parchment slips, red court tag, brass corners, and seal.
- Added a distinct `pursuit_notes` icon: pursuit clue card with ragged paper, red string connections, magnifying glass, and pursuit stamp.
- Regenerated `game/assets/evidence-item-sheet-v3.png` so all cases now show separate raster silhouettes for court-note evidence and pursuit-note evidence.
- Used the image generation tool as a visual reference pass for the two evidence-icon directions before implementing the reproducible local sprite generator update.

Verified:
- `python3 scripts/generate_evidence_item_sheet.py`
- Custom Node data check confirmed every case has both `-ev-court-note` and `-ev-pursuit-note`, with distinct evidence indexes.
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `rg -n "svg|SVG|data:image/svg|<svg|xmlns" game` returned no matches.
- `npm run qa:web-game` with escalated Chromium browser access succeeded.
- Browser record-drawer check confirmed `庭上追问记录` and `追击补记：哭声入诏` both load `evidence-item-sheet-v3.png` but use different sprite positions (`85.7143% 0%` vs `100% 0%`) with no desktop overflow.
- Screenshot inspection of `game/assets/evidence-item-sheet-v3.png` and `output/web-game/court-pursuit-note-icons-bottom.png` confirmed the two trial-only evidence icons are now visually distinct even in the locked, grayscale record list.

Remaining Ace Attorney gap list:
- Trial scenes still need richer pressure-state character pose changes and stronger reaction timing.
- Case-opening scenes are staged, but later passes should add beat-specific motion/camera timing and audio stingers.
- The pursuit-note flow has distinct evidence art now, but the unlock moment itself could use a stronger courtroom reward animation.

## 2026-06-18 iteration 84 result

Implemented:
- Fixed the mobile `法庭记录详查` hotspot overlap reported by the user: PNG hotspot labels no longer stay visible on small screens where they crowd the text beneath the evidence art.
- Kept the bitmap hotspot markers and numeric badges visible, while moving the inspection point name responsibility to the existing magnifier/observation text so the art area no longer repeats the same label.
- Raised the second mobile hotspot away from the bottom drag hint, increasing the measured gap between hotspot buttons and `拖动切换角度`.
- Preserved desktop labels, where the modal has enough horizontal space and the labels do not cover the copy panel.

Verified:
- Mobile 390px Playwright repro captured the old overlap: hotspot bottom was `261px` and the drag hint began at `265px`, leaving only `4px`.
- Mobile 390px Playwright after the fix confirmed hotspot labels are `display: none`, hotspot bottom is `241px`, drag hint begins at `265px`, the gap is now `24px`, the hotspots still clear the angle tabs, and `overflowX=0`.
- Desktop 1366px Playwright confirmed labels remain visible, there is still a `12px` gap to the drag hint, and page overflow remains `0x0`.
- Screenshot inspection of `output/web-game/inspect-hotspot-overlap-after-mobile.png` confirmed the hotspot buttons no longer cover the lower hint or evidence text.
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `npm run qa:web-game` with escalated Chromium browser access succeeded.

Remaining Ace Attorney gap list:
- The pursuit-note flow has distinct evidence art now, but the unlock moment itself still needs a stronger courtroom reward animation.
- Trial scenes still need richer pressure-state character pose changes and stronger reaction timing.
- Case-opening scenes are staged, but later passes should add beat-specific motion/camera timing and audio stingers.

## 2026-06-22 iteration 85 result

Implemented:
- Fixed the in-game `返回主菜单` route so investigation/trial buttons reset `homeView` to `menu` before rendering home. Players now return to the real main menu instead of landing on the previous `案件选择` subpage.
- Kept the previously committed screen-reset guard that clears scene transition signatures and scroll positions when rendering home/case intro.
- Reworked source-line display in case dossier/source panels so player-facing text leads with story notes and readable clue summaries, not chapter/archive labels.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Escalated Playwright visual audit at 1600x960 and 390x844 confirmed:
  - opening cutscene advances into investigation,
  - investigation hotspots are visible only in examine mode,
  - `hotspotsOverlapText=0` on desktop and mobile,
  - clicking a hotspot opens the evidence pickup flow,
  - closing record and clicking `返回主菜单` now returns to `topText='宫廷法庭推理'` on both desktop and mobile,
  - no stale investigation scene remains after returning home.
- Screenshot inspection of `/tmp/wuz-audit-shots-v2/1600x960-back-home.png`, `/tmp/wuz-audit-shots-v2/390x844-back-home.png`, and `/tmp/wuz-audit-shots-v2/1600x960-record-open.png` confirmed the returned main menu and record drawer are visually readable.
- `npm run qa:web-game` with escalated Chromium browser access succeeded.

Remaining Ace Attorney gap list:
- Continue replacing explanation-like dialogue with character-viewpoint lines; prioritize case-opening beats and investigation follow-up lines.
- Trial scenes still need richer pressure-state character pose changes and stronger reaction timing.
- Mobile record drawer is readable and closeable, but later passes should reduce the long full-page height created by full-page screenshot capture and make the drawer feel more like a native game overlay.

## 2026-06-22 iteration 86 result

Implemented:
- Rewrote high-frequency coach/investigation copy so prompts sound like defense-side judgment instead of system instructions.
- Replaced visible `章节/当前查看/记录提示/打开记录` style wording with player-facing `案件线索/现在盯住/辩方札记/翻看记录` language.
- Reworked evidence pickup feedback so new evidence feels like something the defense can use later, rather than a dry inventory notification.
- Rewrote investigation `交谈` and `出示` follow-up lines into character-viewpoint reactions.
- Replaced all repeated pursuit-note trial prompts that said `这是对照追击后才出现...打开法庭记录...` with a more dramatic “证人嘴滑、辩方抓住补记” line.
- Rewrote the six visible evidence `use` strings that began with `用于...` into direct courtroom action language.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Escalated Playwright visual audit at 1600x960 and 390x844 confirmed:
  - opening cutscene still advances into investigation,
  - investigation hotspots remain visible in examine mode,
  - `hotspotsOverlapText=0` on desktop and mobile,
  - evidence pickup and record drawer still render after the text changes,
  - returning home still lands on `topText='宫廷法庭推理'`.
- Screenshot inspection of `/tmp/wuz-audit-shots-v2/1600x960-case-intro.png`, `/tmp/wuz-audit-shots-v2/1600x960-after-hotspot-click.png`, `/tmp/wuz-audit-shots-v2/1600x960-record-open.png`, and `/tmp/wuz-audit-shots-v2/390x844-after-hotspot-click.png` confirmed the rewritten copy is readable and not overlapping.
- `npm run qa:web-game` with escalated Chromium browser access succeeded.
- Web gameplay reference check: Ace Attorney's core loop remains investigation actions (`examine/move/talk/present`) followed by trial cross-examination (`press/present evidence`). This iteration kept that loop intact while making the text less instructional.

Remaining Ace Attorney gap list:
- Continue line-by-line review of testimony `press`, `wrongEvidenceFeedback`, and `objection` text for character-specific voice.
- Trial scenes still need richer pressure-state character pose changes and stronger reaction timing.
- Mobile record drawer is usable, but should later become a tighter game overlay with less full-page height.

## 2026-06-22 iteration 87 result

Implemented:
- Continued the line-by-line courtroom text review, focusing on repeated `wrongEvidenceFeedback`, final-proof prompts, and pursuit-note `objection` lines.
- Replaced repeated system-like strings such as “这句只是传闻入口”, “不是正式矛盾点”, “最后一击需要...”, and “补救追问需要...” with defense-side courtroom judgment.
- Reworked pursuit-note objections across cases so they read as a witness being trapped by their own leaked words, not as a generic “supplementary testimony is pinned” instruction.
- Rewrote two remaining visible `app.js` helper strings that still used `用于/需要` language in evidence detail and record inspection.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Escalated Playwright trial audit created a completed-investigation save, entered the first trial, pressed the first statement, opened the Court Record, and confirmed:
  - `pressedStatements=1`,
  - record drawer opens at desktop size,
  - no old copy matching `这是对照追击|打开法庭记录，使用|普通证物只能` remains in the rendered page,
  - new press feedback is present.
- Screenshot inspection of `/tmp/wuz-trial-audit-shots/trial-start.png`, `/tmp/wuz-trial-audit-shots/trial-after-press.png`, and `/tmp/wuz-trial-audit-shots/trial-record-open.png` confirmed the trial UI remains readable and the record drawer does not overlap the main dialogue incoherently.
- `npm run qa:web-game` with escalated Chromium browser access succeeded.

Remaining Ace Attorney gap list:
- Continue deeper per-character voice work for `press` and `objection`: each witness should sound less interchangeable.
- Trial scenes still need richer pressure-state character pose changes and stronger reaction timing.
- Mobile record drawer is usable, but should later become a tighter game overlay with less full-page height.

## 2026-06-22 iteration 88 result

Implemented:
- Fixed the investigation hotspot safe zone so clickable markers stay in the upper scene image area instead of being clamped toward the dialogue area.
- Restored mobile page scrolling while keeping the desktop play surface in a single-window, non-page-scrolling layout.
- Raised and darkened the evidence pickup modal layer, then tightened its mobile layout so the collected-evidence card reads as a foreground game panel instead of mixing with the investigation dialogue behind it.
- Rewrote high-frequency investigation hints and default dialogue from operation-manual phrasing into defense-side scene judgment, for example replacing the generic “先从一个动作下手” instruction with a line about the room refusing to speak for itself.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Escalated Chromium visual audit captured desktop and mobile screenshots covering home, case intro, opening, investigation, hotspot pickup, record drawer, and trial start.
- Desktop investigation at 1600x960 confirmed:
  - page scroll remains locked at the game window height,
  - 2/2 investigation hotspots are visible,
  - hotspot/text overlap count is 0,
  - record drawer and trial start remain readable.
- Mobile investigation at 390x844 confirmed:
  - the page can scroll from `scrollY=38` to `scrollY=500`,
  - 2/2 investigation hotspots are visible,
  - hotspot/text overlap count is 0,
  - the evidence pickup card no longer visually collides with the investigation beat.
- Screenshot inspection used:
  - `/tmp/wuz-ui-audit-88/04-investigation.png`
  - `/tmp/wuz-ui-audit-88/05-hotspot-beat.png`
  - `/tmp/wuz-ui-audit-88/07-record-open.png`
  - `/tmp/wuz-ui-audit-88/08-trial-start.png`
  - `/tmp/wuz-ui-audit-88-rerun/mobile-pickup.png`
  - `/tmp/wuz-ui-audit-88-copy/desktop-investigation-copy.png`
  - `/tmp/wuz-ui-audit-88-copy/mobile-investigation-copy.png`
- `npm run qa:web-game` with escalated Chromium browser access succeeded.
- Web reference check for Ace Attorney loop: investigation remains centered on examining scenes, talking, presenting, and collecting evidence before trial; trial remains centered on press/present contradiction play.

Remaining Ace Attorney gap list:
- Continue deeper per-character voice work in investigation talk/present lines so each witness reacts from their own social position and fear, not from narrator knowledge.
- Trial scenes still need richer pressure-state character pose changes and stronger reaction timing.
- Mobile record drawer is usable, but should later become a tighter game overlay with less full-page height.

## 2026-06-22 iteration 89 result

Implemented:
- Kept the already-fixed hotspot layout untouched and moved this round back to writing/UX polish.
- Reworked the player-visible record timeline so rows show story-facing clue names and clue meanings instead of raw chapter titles, `卷宗` labels, or generic “阶段性线索” notes.
- Changed evidence source display from raw book chapter titles to player-facing provenance labels such as `旧案线索`, `庭上追问`, `追击札记`, and `线索归纳`.
- Added case-specific investigation follow-up lines for `交谈`, so different cases now respond from their own pressure point: palace silence, East Palace record control, informant-chain fear, Censorate coercion, and night-gate timing.
- Added case-specific `出示` reactions so the person reacting to an item changes by case and speaks from their role, instead of reusing one generic witness response.
- Fixed mobile investigation UX after `交谈/出示/查看`: when a reaction panel appears, mobile now returns the viewport to the scene dialogue instead of leaving the player down at the command buttons.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Escalated Chromium audit at 1600x960 and 390x844 confirmed:
  - record timeline no longer shows raw `卷宗`, chapter labels, or generic `阶段性线索` copy,
  - investigation `交谈` no longer shows the old generic “这句话听着轻...” follow-up,
  - investigation `出示` no longer shows the old generic “他没有否认...” follow-up,
  - first-case present reaction now reads as the inner-court recorder avoiding the words he must write down,
  - mobile present reaction panel becomes visible after tapping an item from the bottom command area (`beatVisible=true`, beat top around 202px).
- Screenshot inspection used:
  - `/tmp/wuz-ui-audit-89/desktop-record-timeline.png`
  - `/tmp/wuz-ui-audit-89/desktop-talk-beat.png`
  - `/tmp/wuz-ui-audit-89/desktop-present-beat.png`
  - `/tmp/wuz-ui-audit-89-mobile-fix3/mobile-present-beat.png`
- `npm run qa:web-game` with escalated Chromium browser access succeeded. The only warning was the external web-game Playwright client being reparsed as an ES module.
- Web reference check: Ace Attorney investigation phases are built around searching scenes, gathering evidence, talking to characters, and presenting evidence before trial cross-examination. This round specifically improved those investigation interactions.

Remaining Ace Attorney gap list:
- Continue deeper per-character voice work for trial `press` and `objection`; witnesses and prosecutors still need more distinct courtroom rhythms.
- Trial scenes still need richer pressure-state character pose changes and stronger reaction timing.
- Mobile record drawer is usable, but should later become a tighter game overlay with less full-page height.

## 2026-06-22 iteration 90 result

Implemented:
- Continued the trial-side polish loop instead of touching the already-fixed investigation hotspot layout.
- Replaced the opening cutscene system message with scene-grounded copy: the player is now asked to notice what the door, papers, and witnesses are hiding, instead of being told to click through a tutorial sentence.
- Shortened the opening cutscene continue hint from button-like instructions to in-world action prompts.
- Rewrote the ready-to-present vulnerability cue so it sounds like a courtroom opening has appeared rather than a UI manual: the cue now says the witness has left a retreat path and the player should bring the matching record to hand.
- Fixed a courtroom feedback regression found by screenshot inspection: pressing a suspicious statement no longer fires the oversized `异议成立` impact overlay before the player has actually presented evidence, so the record drawer stays readable.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Escalated Chromium screenshot audit at 1600x960 and 390x844 covered home, case list, case intro, opening cutscene, three investigation locations, record drawer open/close, trial start, first press, suspicious statement, ready-to-present state, trial record drawer, selected record return, and objection reveal.
- Desktop audit confirmed the whole active play surface remains one-window: `appHeight=896` and `appClientHeight=896` across investigated and trial states, with no page scroll required.
- Mobile audit confirmed scrolling remains available where expected, and the full flow now reaches real trial states after the record drawer closes.
- Hotspot/text overlap count stayed `0` in every desktop and mobile investigation screenshot.
- Trial stage state now visibly changes through `enter/observe`, `thinking/observe`, `tense/thinking`, `shock/confident`, and `confident/stagger` across the press-present-objection flow.
- Mobile record drawer screenshot after pressing now shows the record list and confirm button without the pre-objection impact card covering the usable area.
- Screenshot inspection used:
  - `/tmp/wz_audit_live/v1600x960-trial-start.png`
  - `/tmp/wz_audit_live/v1600x960-trial-ready-present.png`
  - `/tmp/wz_audit_live/v1600x960-trial-record-drawer.png`
  - `/tmp/wz_audit_live/v1600x960-trial-objection-reveal.png`
  - `/tmp/wz_audit_live/v390x844-trial-start.png`
  - `/tmp/wz_audit_live/v390x844-trial-ready-present.png`
  - `/tmp/wz_audit_live/v390x844-trial-record-drawer.png`
  - `/tmp/wz_audit_live/v390x844-trial-objection-reveal.png`
- `npm run qa:web-game` with escalated Chromium browser access succeeded. The only warning was the external web-game Playwright client being reparsed as an ES module.

Remaining Ace Attorney gap list:
- Continue deeper per-character voice work for trial `press` and `objection`; each witness and opponent should expose a different fear, habit, and social position.
- Add more authored reaction beats after correct objections so the victory moment is not only a mechanical reveal.
- Mobile record drawer is usable, but should later become a tighter game overlay with less full-page height.

## 2026-06-22 iteration 91 result

Implemented:
- Added case-specific aftermath copy for correct objections, so a successful contradiction now produces a witness/opponent reaction rooted in the current case instead of only saying the evidence matched.
- Extended the objection reveal sequence from three beats to four beats by adding a final `证人反应` beat after `异议切入`、`证物对照`、`矛盾揭示`.
- Connected the same aftermath copy to the post-objection trial message and deduction pursuit entry, so the next step tells the player what the witness is trying to avoid rather than giving a generic instruction.
- Exposed `objectionRevealReactionTitle` and `objectionRevealReactionText` through `render_game_to_text` so automated browser checks can verify the new narrative beat.
- Fixed the reveal overlay layering after screenshot review: while the objection reveal modal is open, the separate impact cue no longer renders over it; the fourth beat is readable on desktop and mobile.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Escalated Chromium screenshot audit at 1600x960 and 390x844 covered the full first-case flow through investigation, record drawer, trial, correct evidence selection, and all four objection reveal beats.
- Screenshot inspection confirmed:
  - `/tmp/wz_audit_live/v1600x960-trial-objection-reveal-step-4.png` shows the new desktop `证人反应` beat without the impact card covering the text.
  - `/tmp/wz_audit_live/v390x844-trial-objection-reveal-step-4.png` shows the same beat on mobile with the title and reaction readable.
  - The earlier ready-to-present and record drawer states still do not show the premature `异议成立` overlay.
- `npm run qa:web-game` with escalated Chromium browser access succeeded. The only warning was the external web-game Playwright client being reparsed as an ES module.

Remaining Ace Attorney gap list:
- Continue deeper per-character voice work for trial `press` and `objection` across later cases, especially prosecutors and hostile witnesses.
- Add more after-correct-objection branch variety: some wins should unlock new testimony, some should pressure the opponent, and some should change court momentum.
- Mobile record drawer is usable, but should later become a tighter game overlay with less full-page height.

## 2026-06-22 iteration 92 result

Implemented:
- Added `scripts/sleep_after_round.sh` and the `npm run round:sleep` command. Default sleep is 20 minutes; `ROUND_SLEEP_SECONDS=1 npm run round:sleep` is available for a fast smoke test.
- Continued the writing polish loop using the novel-writing guidance and web reference check for Ace Attorney-style investigation/cross-examination pacing: short scene beats, witness reactions, and evidence-driven reversals instead of system-like instructions.
- Spawned a subagent review pass for `game/game-data.js` and a separate `game/app.js` runtime-copy review. The data-file pass edited case briefs, evidence copy, investigation text, testimony press text, wrong-evidence feedback, and counter-feedback across all five cases; the app-copy review identified high-priority runtime UI copy that still sounded like system instructions.
- Replaced the flagged investigation command copy `换个做法：查看。别急...` with scene-grounded lines for move, examine, talk, and present.
- Replaced the flagged first-case present follow-up `他怕的不是证物真假...` with an in-world recorder reaction, and adjusted one similar case-2 line that used the same rhetorical shape.
- Made correct-objection aftermath copy depend on the actual testimony speaker, so the first case can distinguish 内廷记录官、许敬宗、御前书记 instead of always speaking as one generic witness.
- Rewrote several correct-objection follow-up lines away from imperative coaching such as `别让...` / `继续追...` into courtroom reactions and exposed contradictions.
- Rewrote runtime copy flagged by the app-copy review: selected-record prompt, key failure feedback, trial advance hint, objection reveal copy, evidence inspect details, record return action, pursuit unlock wording, and evidence pickup hints now avoid `玩家`、`主操作区`、`按 E`、`面板`、`预演` 等出戏词。

Already fixed and not revisited this round:
- Investigation hotspot buttons covering text: previous audits showed overlap count stayed `0`; do not rework hotspot layout again unless a new screenshot shows a regression.
- Trial record drawer being covered by premature `异议成立` impact: previous screenshot audit fixed it; this round only keeps verifying it is not back.
- Fourth objection reveal beat being hidden by impact overlay: previous screenshot audit fixed it; this round only checks for regression.

Verified in this round:
- Keyword scan confirmed the two user-flagged exact strings no longer remain in `game/app.js` or `game/game-data.js`.
- `global.window=global; require('./game/game-data.js')` loaded all 5 cases successfully.
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `ROUND_SLEEP_SECONDS=1 npm run round:sleep`
- Escalated Chromium screenshot audit at 1600x960 and 390x844 covered case intro, investigation start, first investigation location, ready-to-present, record drawer, and objection reveal step 4.
- Screenshot state audit confirmed hotspot/text overlap stayed `0` on desktop and mobile for the checked states, desktop active play surface stayed single-window (`appHeight=896`, `appClientHeight=896`), and the updated ready-to-present copy displayed as a courtroom beat instead of a UI instruction.
- Screenshot inspection files:
  - `/tmp/wz_audit_live/v1600x960-investigation-location-1.png`
  - `/tmp/wz_audit_live/v1600x960-trial-ready-present.png`
  - `/tmp/wz_audit_live/v1600x960-trial-objection-reveal-step-4.png`
  - `/tmp/wz_audit_live/v390x844-investigation-location-1.png`
  - `/tmp/wz_audit_live/v390x844-trial-ready-present.png`
  - `/tmp/wz_audit_live/v390x844-trial-objection-reveal-step-4.png`
- `npm run qa:web-game` with escalated Chromium browser access succeeded. The only warning was the external web-game Playwright client being reparsed as an ES module.
- Commit and push pending below, then default 20-minute round sleep.

Remaining Ace Attorney gap list:
- Keep rewriting per-character trial `press`, `wrongEvidenceFeedback`, and `counterFeedback`; many are still too close to tactical notes instead of character speech.
- Add more authored branch outcomes after correct objections: new testimony, opponent counterpressure, courtroom momentum shifts, and witness-specific breakdown beats.
- Continue screenshot-first QA, but avoid reworking already fixed layout issues without new evidence.

## 2026-06-22 iteration 93 result

Implemented:
- Continued the copy-polish loop without reworking already-fixed hotspot, record drawer, or objection overlay layout.
- Spawned one worker subagent for `game/game-data.js` and one explorer subagent for `game/app.js`.
- Rewrote all 30 `timeline.note` entries that still used the `与...相关的阶段性线索` template. Each timeline item now states what changed in the case and why that chapter matters.
- Rewrote 8 generated `profiles.note` entries that still said `直接相关，庭审中可能...`, replacing them with character stance, fear, and likely courtroom exposure.
- Rewrote 5 repeated `badEnding` templates that used `单一罪名 / 定案理由 / 真正该查的人`, so failure outcomes now name the concrete loss in each case.
- Replaced runtime UI-ish text in `game/app.js`: `书记提示` became `案旁札记`, visible `点击任意处...` hints became in-world continuation text, command buttons no longer show `1/2/3/4`, the trial present button no longer shows `E`, and record drawer no longer shows `Tab 切换`.
- Rewrote selected-evidence empty state, profile detail hint, evidence inspect progress, deduction panel copy, save-slot copy, and trial opening message so they read like case-file narration instead of controls.

Already fixed and not revisited this round:
- Investigation hotspot/text overlap remains treated as fixed unless a new screenshot proves regression.
- Record drawer overlay and objection reveal layering remain treated as fixed; this round only verified they did not regress.

Verified:
- Residual template scan only found the settings-page keyboard help line, which is intentionally hidden in the settings/help surface.
- `global.window=global; require('./game/game-data.js')` loaded `cases=5`, `timelineCount=30`, `profiles=12`.
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Escalated Chromium screenshot audit at 1600x960 and 390x844 covered home, case intro, investigation, trial start, ready-to-present, record drawer, and objection reveal step 4.
- Screenshot state audit confirmed hotspot/text overlap stayed `0`, desktop active play surface remained one-window (`appHeight=896`, `appClientHeight=896`), and mobile still uses vertical layout without blocking core flow.
- Screenshot inspection files:
  - `/tmp/wz_audit_live/v1600x960-investigation-start.png`
  - `/tmp/wz_audit_live/v1600x960-trial-start.png`
  - `/tmp/wz_audit_live/v1600x960-trial-record-drawer.png`
  - `/tmp/wz_audit_live/v390x844-investigation-start.png`
  - `/tmp/wz_audit_live/v390x844-trial-start.png`
  - `/tmp/wz_audit_live/v390x844-trial-record-drawer.png`
- `npm run qa:web-game` with escalated Chromium browser access succeeded. The only warning was the external web-game Playwright client being reparsed as an ES module.

Remaining Ace Attorney gap list:
- Continue replacing generic `press` and `objection` lines with witness-specific cadence across later cases.
- Add more branch variety after correct objections: prosecutor counterpressure, witness breakdown stages, and new testimony routes.
- Continue screenshot-first QA, but keep avoiding repeated fixes for bugs already recorded as resolved.

## 2026-06-22 iteration 94 result

Implemented:
- Continued the copy-polish loop in smaller batches instead of another broad rewrite.
- Reworked a second batch of main-flow `game/app.js` visible copy: home guide text, guide card wording, save-slot copy, empty selected-evidence hint, profile-detail hint, evidence inspect progress, compare-panel copy, and trial opening message.
- Reworked the trial present button structure itself after screenshot inspection showed the previous `拍案` text had been incorrectly stuffed into the old 20x20 key badge slot.
- The present button now uses a two-line hierarchy: small `拍案` kicker plus large `举证` label, with dedicated CSS sizing instead of the old circular hotkey badge.
- Verified that the remaining visible `点击任意处...` / `Tab 切换` / `E 举证` style text was removed from the primary play surface, leaving only the optional settings help for keyboard guidance.

Already fixed and not revisited this round:
- Hotspot/text overlap remains treated as fixed unless a new screenshot proves regression.
- Record drawer overlay and objection reveal layering remain treated as fixed; this round only rechecked they stayed correct.
- Present button abnormal text badge is now treated as fixed unless a new screenshot shows another layout regression.

Verified:
- `npm run check:js`
- `git diff --check`
- Residual scan of `game/app.js` / `game/game-data.js` left only the settings-page keyboard help line as intentional explicit controls text.
- Re-ran escalated Chromium screenshot audit at 1600x960 and 390x844 after the button fix.
- Screenshot state audit confirmed:
  - desktop `trial-start` still stays one-window (`appHeight=896`, `appClientHeight=896`),
  - mobile `trial-start` remains readable with no hotspot overlap,
  - the new `拍案 / 举证` button no longer collapses into the broken circular badge layout.
- Screenshot inspection files:
  - `/tmp/wz_audit_live/v1600x960-trial-start.png`
  - `/tmp/wz_audit_live/v390x844-trial-start.png`

Remaining Ace Attorney gap list:
- Continue replacing generic later-case `press` and `wrongEvidenceFeedback` lines with speaker-specific fear and cadence.
- Keep checking visible button and panel copy in small batches rather than returning to already-fixed layout bugs without new evidence.

## 2026-06-22 iteration 95 result

Implemented:
- Reopened the `举证` button issue after the previous double-line `拍案 / 举证` hierarchy still looked unlike a normal courtroom main action.
- Removed the extra `拍案` kicker from the visible button face and restored the button to a single clear action label: `举证`.
- Rebalanced the trial action row so all four buttons return to the same action-strip rhythm instead of letting `举证` stand taller than the rest.
- Kept the emphasis where it belongs: selected-record guidance still sits in the selected-record bar, while the button itself is now only the action trigger.
- Added a tiny `debug-launch.html?scenario=trial-action-preview` QA scene so the trial action strip can be screenshot-checked without replaying a whole case just to inspect one control.

Already fixed and not revisited this round:
- Hotspot/text overlap remains treated as fixed unless a new screenshot proves regression.
- Record drawer overlay and objection reveal layering remain treated as fixed.
- This round did not reopen broader trial layout work; it only normalized the present button itself.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- In-app browser desktop preview for `debug-launch.html?scenario=trial-action-preview` confirmed:
  - the `举证` button is back to a single-line label,
  - it aligns visually with `返回主菜单 / 追问 / 法庭记录`,
  - the selected-record hint remains outside the button instead of being stuffed into the button face.

Remaining Ace Attorney gap list:
- Continue replacing later-case tactical helper copy with scene-native speech and case-file narration.
- Keep using screenshot-first checks, but do not reopen already-recorded UI fixes without fresh evidence.

## 2026-06-22 iteration 96 result

Implemented:
- Continued the copy-polish loop in one focused batch instead of reopening already-fixed layout bugs.
- Rewrote a visible batch in `game/app.js` so the main flow stops sounding like a built-in walkthrough:
  - home hero hint,
  - case gallery heading and `案件简报` button wording,
  - case intro action buttons (`进入现场` / `进入庭审`),
  - case intro status hint under the action row,
  - source panel helper copy,
  - investigation map quick hints,
  - dormant hotspot line,
  - investigation command-panel hints for `移动 / 查看 / 交谈 / 出示`,
  - vulnerability cue text,
  - investigation start message,
  - trial penalty / wrong-present default messages.
- Rewrote a second batch of optional guide text in `game/app.js` so even the hidden `案旁札记` panel reads like case judgment instead of numbered tactics:
  - `追问突破`,
  - `话没说完`,
  - `交叉询问`.
- Rewrote a visible batch in `game/game-data.js`:
  - first-case opening stakes,
  - first-case intro card,
  - first-case defense/opponent opening lines,
  - second-case defense opening line,
  - first-case two core evidence `use` descriptions,
  - first-case legality testimony `press` / `wrongEvidenceFeedback`,
  - one later-case opening `stakes`.
- Rewrote several profile notes that previously spoiled the solution path or used explicit courtroom攻略口吻:
  - `内廷记录官`,
  - `许敬宗`,
  - `宫廷书记官`,
  - `告密人`,
  - `魏元忠`,
  - `周兴`.
- Rewrote a small but obvious batch in record inspection copy so it stops telling the player what to do and instead states what the object means:
  - generic source/risk text,
  - red-line board wording,
  - bronze-box origin wording,
  - edict title wording,
  - compare-failure wording.
- Used one read-only explorer subagent to rank the worst remaining tutorial-like strings before finalizing the batch; the implementation still happened in the main worktree.

Already fixed and not revisited this round:
- `举证` button hierarchy/layout remains treated as fixed from iteration 95.
- Hotspot overlap, record drawer layering, and objection reveal layering were not reopened.
- This round stayed on text only; no renewed layout churn without new evidence.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- `node -e "global.window=global; require('./game/game-data.js'); ..."` confirmed `cases=5` and `profiles=12`.
- Targeted string verification confirmed the old visible tutorial wording is gone for the changed hotspots:
  - removed: `先去现场看看`
  - removed: `证据齐了就开庭`
  - removed: `想摸现场，先回到“查看”这一手。`
  - removed: `先盯住最像被人碰过的地方。`
  - removed: `这件证物压不到当前这句话。`
  - removed: `先追问，再举证`
  - removed: `先找能替她开口的现场记录。`
  - removed: `太子之争不能只听一句‘家事’。`
  - removed: `辩方若拿不出纸证，就别让一场哭声惊动朝堂。`
- In-app browser screenshot verification could not be rerun at the end of this round because the `iab` browser surface was unavailable after the browser runtime reset; this round therefore stopped at code-level and string-level verification.

Remaining Ace Attorney gap list:
- Keep rewriting later-case testimony `press`, `wrongEvidenceFeedback`, and profile/evidence descriptions that still leak tactics instead of character stance.
- Continue reducing instructional phrasing inside optional guide content; it is hidden now, but some `steps` lists still read more like workflow than story.
- When the in-app browser surface is available again, rerun screenshot checks on case intro, investigation, and trial to visually confirm these new lines fit cleanly.

## 2026-06-22 iteration 97 result

Implemented:
- Focused this round on the courtroom main action area after spotting that the `举证` button looked visually off in trial.
- Reworked the trial action strip in `game/app.js` and `game/styles.css` instead of tweaking only one color:
  - split the trial controls into a clearer 2x2 hierarchy,
  - kept `返回主菜单` and `法庭记录` as smaller secondary controls on the first row,
  - grouped `追问` and `举证` as the lower main action pair,
  - widened both main actions to the same width so the right-side control area no longer feels cramped.
- Gave the disabled `举证` state its own muted red treatment instead of the generic washed-out disabled opacity, so it still reads as an intentional main action rather than a broken button.
- Tightened the selected-record prompt copy in trial so it reads faster and supports the new action hierarchy:
  - no selection: `先从记录里挑一件，别让案卷空着。`
  - selected but not ready: shorter “在手边/还没卡住这句话” phrasing
  - ready to present: shorter “破口露出来了，把它顶上去。”

Did not reopen this round:
- Hotspot overlap changes.
- Investigation layout changes.
- Previously fixed portrait / objection overlay work.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Because the in-app browser surface `iab` was still unavailable, switched to an escalated Playwright run for screenshot verification.
- Desktop 1440x900 screenshot checks confirmed:
  - disabled `举证` now keeps a deliberate button frame instead of fading into the panel,
  - `追问 / 举证` now share the same footprint and sit as the clear primary pair,
  - the selected-record strip no longer reads like a long system prompt.
- Desktop selected-record screenshot confirmed:
  - selected evidence keeps `举证` enabled without auto-submitting,
  - `已选：破损的后位奏章` and the shorter prompt fit cleanly in the sidebar.
- Mobile 390x844 screenshot confirmed:
  - no horizontal overflow,
  - the stacked action area remains readable,
  - `追问 / 举证` stay visually distinct from `返回主菜单 / 法庭记录`.

Remaining Ace Attorney gap list:
- Continue the copy-polish pass on later-case testimony, evidence `use`, and profile notes that still sound like tactical notes instead of in-world speech.
- Revisit courtroom action labels only if a fresh screenshot shows a concrete defect; do not churn this area again without evidence.

## 2026-06-22 iteration 98 result

Implemented:
- Used one read-only explorer subagent to rank the worst remaining visible tutorial-like copy before editing.
- Treated the main problem as systemic rather than sentence-by-sentence only: `案旁札记` was still default-open behavior in practice because `hideGuides` defaulted to `false`.
- Changed `game/app.js` so guide cards are now hidden by default:
  - `hideGuides` default is now `true`,
  - top-right action reads `札记` instead of `提示`,
  - settings label now reads `收起案旁札记` instead of `隐藏新手提示卡`.
- Rewrote the visible copy in the hidden guide system so, when opened, it reads more like case notes and less like step-by-step controls:
  - removed explicit sequences such as `翻证物 / 选中记录 / 举证`,
  - replaced them with noun-style beats like `证物 / 记录 / 举证`,
  - rewrote several guide titles and bodies around investigation, interlude, press-first, recovery, and counter-risk states.
- Rewrote a visible batch in the courtroom sidebar and record surfaces:
  - selected-record bar no longer says `尚未选择证物或人物档案`,
  - prompt text now describes whether the current line has met a record instead of telling the player what to click,
  - `慎用提示` became `卷边批注`,
  - trial return text now reads like in-world tension instead of a command.
- Rewrote a visible batch in record inspection:
  - many `出示时机 / 举证时机` labels became `分量`-style notes,
  - imperative risk text such as `等对方…再用` was replaced with descriptive weight/meaning text,
  - `现场说法 / 庭审用途` became `纸面说法 / 落到庭上`,
  - locked compare text no longer says `待墨痕全明，再与旁证相合`.
- Rewrote several visible story lines in `game/game-data.js`:
  - first-case opening body/stakes,
  - first-case and fourth-case case-brief cards that used second-person or direct tactical coaching,
  - first-case defense-location description,
  - crown-shadow talk topic titles and one helper line.

Did not reopen this round:
- Hotspot overlap fixes.
- Trial main-button hierarchy/layout from iteration 97.
- Portrait sizing and other previously recorded UI bugs.

Verified:
- `npm run check:js`
- `PYTHONPYCACHEPREFIX="/Users/oubeichen/Projects/wuzetian2/.pycache" npm run check:py`
- `git diff --check`
- Escalated Playwright screenshot verification because the in-app browser surface remained unavailable.
- Desktop 1440x900 screenshots confirmed:
  - home screen shows `札记` and no default coach card,
  - case intro no longer shows a default guide card,
  - trial screen no longer shows a default guide card and the right sidebar now reads `案上还没有压住这句话的记录 / 案卷还是空的，庭上眼下只有他一个人在说话`,
  - record inspection edge-risk view now reads `分量`-style notes such as `它更像收尾`, and the adjacent cards read `纸面说法 / 落到庭上`.
- Targeted search confirmed the worst previously visible imperative strings were removed from the main guide/trial surfaces:
  - removed: `翻证物`
  - removed: `选中记录`
  - removed: `翻人物档案`
  - removed: `选中人物`
  - removed: `追问当前句`
  - removed: `先查现场`
  - removed: `准备开庭`
  - removed: `别和他比嗓门`
  - removed: `隐藏新手提示卡`

Remaining Ace Attorney gap list:
- Continue rewriting later-case `use`, `counterRisk`, and testimony follow-up text in `game/game-data.js`; many are better now, but some still explain tactic timing instead of just stating what the paper means.
- The hidden `案旁札记` system is now correctly optional, but some of its bodies still speak in a slightly omniscient system voice and can be pushed closer to notebook prose.
- Keep using screenshot-first validation on copy changes; do not reopen already-fixed layout bugs unless a fresh screenshot shows a regression.

## 2026-06-22 iteration 98 result

Implemented:
- Rechecked the real trial flow after a fresh user report that the `举证` button still looked odd.
- Confirmed with live screenshots that the problem was concentrated in the disabled state: the enabled `举证` button was fine, but the unselected state still looked like a washed-out rendering error.
- Narrowed the fix to `game/styles.css` only:
  - kept the active `举证` face on a stable dark-red gradient,
  - replaced the old muddy disabled face with a deliberate dormant style,
  - added a restrained gold edge and clearer label contrast so the button now reads as “主操作未就绪” rather than “控件坏了”.

Did not reopen this round:
- Trial action-strip layout and control hierarchy.
- Investigation UI or hotspot work.
- Any of the already-recorded overlay / portrait fixes.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran an escalated external Playwright capture because sandboxed Chromium still hits the local MachPort restriction.
- Fresh desktop 1600x960 screenshots confirmed:
  - `output/trial-start-current.png`: disabled `举证` no longer发灰发脏，仍然清楚是同一组主操作的一部分；
  - `output/trial-present-ready-current.png`: ready state stays dark red and does not lose emphasis after the disabled-state tweak.

Remaining Ace Attorney gap list:
- Continue the text-polish pass on later-case testimony, profile notes, and evidence descriptions.
- Treat the `举证` button visuals as fixed again unless a new screenshot shows another concrete regression.

## 2026-06-22 iteration 99 result

Implemented:
- This round stayed off the already-fixed `举证` button visuals and focused only on player-facing copy.
- Used one read-only explorer subagent to rank the worst remaining tutorial-like lines before editing; the highest-priority hits were the visible `案旁札记` bodies in `game/app.js`, later-case `openingStory.stakes`, several `evidence.use` lines, and a few profile notes that still sounded like design notes.
- Reworked a visible batch in `game/app.js` so the main flow reads like case pressure instead of system guidance:
  - `札记` now defaults hidden again through settings, keeping the play surface cleaner by default;
  - visible `案旁札记` titles/bodies in investigation and trial were rewritten from “怎么做” into “眼前这句话/这张纸正在暴露什么”;
  - trial selected-record prompt copy was tightened so it no longer says `去记录里挑` / `去人物档案里找` / `别让案卷空着`;
  - wrong-timing / drawer-close / return-to-trial messages were rewritten to sound like courtroom pressure rather than explicit puzzle instructions;
  - record drawer empty-state text, evidence pickup note text, and evidence detail helper labels were rewritten away from `慎用提示` / `对应哪一句` style wording.
- Reworked a second visible batch in `game/game-data.js`:
  - first-case opening `body` / `stakes`;
  - several second-case `evidence.use` lines;
  - one third-case opponent opening line;
  - fourth-case opening `stakes` plus several `evidence.use` lines;
  - fifth-case timing-evidence `use` / `counterRisk` plus pursuit-note `use`;
  - four profile notes (`武则天` / `来俊臣` / `邠王守礼` / `玄宗旧部`) that previously read like summary cards or future-spoiler hints.
- Reworked a repeated batch of later-case `wrongEvidenceFeedback` strings so they stop reading like solver hints such as “只有那份补记” / “堵住退路的，是接住后续动作的记录” and instead read like in-world reactions to the wrong pressure point.

Did not reopen this round:
- `举证` button hierarchy, disabled styling, and action-row layout.
- Hotspot overlap, portrait placement, objection overlays, or other already-recorded UI bug work.

Verified:
- `npm run check:js`
- `git diff --check`
- `npm run qa:web-game`
- Old tutorial-like strings confirmed removed from the changed batch, including:
  - `证人这段开始乱了。确认他说了什么新话`
  - `把相关人物档案拿出来`
  - `这份记录有使用边界`
  - `辩方若怀疑民声，最好先想清楚自己站在谁的对面`
  - `所有案件围绕她的权力上升`
  - `象征告密、酷刑和冤案生产机制`
- Ran escalated external Playwright screenshots to inspect the rewritten visible copy in real layouts:
  - `output/case-intro-copy-current.png`
  - `output/trial-start-copy-current.png`
  - `output/trial-record-open-copy-current.png`
- Screenshot inspection confirmed:
  - case intro now reads more like opening scene setup and less like a case-analysis card;
  - trial right rail no longer tells the player to go fetch a record, but states the current courtroom pressure directly;
  - the record drawer footer no longer reads like a mechanics explanation, and the longer rewritten lines still fit without overflow.

Remaining Ace Attorney gap list:
- Keep rewriting later-case `wrongEvidenceFeedback`, `counterRisk`, and `use` text in `game/game-data.js`; many repeated lines are better now, but a full sweep is still unfinished.
- Some hidden `案旁札记` step labels are intentionally compact now, but the hidden panel still carries more game-logic structure than ideal notebook prose.
- Keep screenshot-first copy QA; do not reopen already-fixed button/layout issues unless a fresh screenshot shows a concrete regression.

## 2026-06-22 iteration 100 result

Implemented:
- This round stayed off the already-fixed `举证` button and focused on one real interaction chain plus one highly visible copy block.
- Relaxed the investigation hotspot lock in `game/app.js`:
  - hotspot mode is no longer blocked just because the bottom investigation beat is still open;
  - hotspots remain temporarily locked only while the evidence-pickup card itself is on screen;
  - the dormant hotspot copy now distinguishes between “not in examine mode” and “pickup still settling”.
- Updated the related hotspot interaction CSS in `game/styles.css` so desktop investigation hotspots stay clickable even when the bottom beat panel remains open after the player closes a pickup card.
- Reworked the first-case source-line copy in both `game/app.js` fallback data and `game/game-data.js`:
  - replaced the case-intro header `这卷案子最硬的一条线` with `先把这几步看明白`;
  - changed tab state labels from `案上 / 卷中` to `正在看 / 待翻`;
  - rewrote all seven first-case source-note blurbs to sound more like immediate story pressure and less like abstract outline commentary.

Why this round:
- The latest local UI audit report already on disk showed a concrete `collect-error` during investigation and left trial readiness at `1/2`.
- Code inspection showed the immediate cause: after one examine action, the bottom investigation beat kept the hotspot layer inactive until the player manually closed that beat, which made the interaction chain heavier than it needed to be.
- The same screenshots also showed the first-case source panel still carrying more “策划卡片” phrasing than normal-player story framing.

Verified:
- `npm run check:js`
- `git diff --check`
- `npm run qa:web-game`
- Ran two escalated local Playwright checks because sandboxed Chromium still hit the existing MachPort permission failure:
  - first case intro capture: `output/case-intro-source-copy-current.png`
  - investigation chain capture: `output/investigation-hotspot-after-second-close-current.png`
- Escalated Playwright state checks confirmed:
  - after closing the first pickup card, the second hotspot can now be clicked without first dismissing the bottom investigation beat;
  - after the second hotspot chain, local state reported `collected: 2` while still remaining in `investigationCommand: examine`;
  - the first-case source panel now displays the rewritten header/subtitle and the active note reads like scene pressure rather than book-club summary.

Environment note:
- The in-app browser and a read-only copy-review subagent both hit the current external-usage limit during this round, so verification fell back to local shell checks plus escalated local Playwright runs only.

Remaining Ace Attorney gap list:
- Keep rewriting first-screen-visible evidence summaries and later-case source/evidence blurbs that still sound like condensed historian notes.
- The investigation beat can now coexist with hotspot clicking, but mobile and desktop should be re-swept later for broader command-flow QA beyond the first case’s first location.
- Continue treating `举证` button visuals as fixed unless a fresh screenshot shows a new concrete regression.

## 2026-06-22 iteration 101 result

Implemented:
- This round stayed off the already-fixed `举证` button and the freshly-adjusted investigation hotspot chain.
- Focused on one player-facing clarity issue still visible in screenshots: evidence surfaces were still exposing raw source/chapter provenance that means little to players, such as chapter-title-like labels on the pickup card.
- Added three small helpers in `game/app.js`:
  - `evidenceOriginShort(item)`
  - `evidenceOriginLong(item)`
  - `evidenceMetaLine(item)`
- Replaced raw `sourceForDisplay(item.source)` labels on evidence-facing UI with player-facing origin labels:
  - pickup card now shows labels like `宫中文书｜已收入案卷`;
  - selected evidence detail uses the same player-facing line;
  - evidence inspect modal subtitle now uses the same player-facing line;
  - inspect observation text now says things like `来源：这是从现场收进案卷的一页……` instead of exposing chapter provenance.

Why this round:
- The previous round’s real screenshot `output/investigation-hotspot-chain-current.png` still showed a pickup label like `现场记录｜为了对付那个貌美多姿的妃子`, which reads like a book chapter reference rather than usable game information.
- This was exactly the kind of “普通玩家看不懂 / 不需要知道原书章节名” issue the user had flagged earlier.

Verified:
- `git ls-remote origin refs/heads/main` matched local HEAD before editing.
- `npm run check:js`
- `git diff --check`
- `npm run qa:web-game`
- Ran escalated local Playwright flow to capture and inspect:
  - `output/pickup-origin-copy-current.png`
  - `output/record-origin-copy-current.png`
- Playwright text assertions confirmed:
  - pickup card meta line: `宫中文书｜已收入案卷`
  - record detail meta line: `宫中文书｜已收入案卷`
  - inspect modal subtitle: `宫中文书｜已收入案卷`
  - inspect observation now uses a full player-facing origin sentence instead of chapter provenance.
- Screenshot inspection confirmed:
  - no text overflow in the pickup card after the label change;
  - no text overflow in the record inspect modal after the subtitle/source change;
  - raw chapter labels no longer leak into these first-seen evidence surfaces.

Remaining Ace Attorney gap list:
- Keep sweeping player-facing evidence `summary`, `detail`, and `use` lines that still sound more like compressed historian annotation than spoken game-world material.
- Later-case evidence and timeline surfaces still deserve the same “remove source-provenance tone” pass, but this round intentionally stayed narrow.
- Continue screenshot-first QA and do not reopen already-fixed button/layout issues unless a fresh screenshot shows a concrete regression.

## 2026-06-22 iteration 102 result

Implemented:
- This round stayed off the already-fixed `举证` button, the already-adjusted investigation hotspot chain, and the newly-cleaned evidence origin labels.
- Focused on another player-facing residue from the original chapter framing: the timeline tab still rendered every row with the same generic heading `关键线索`, and the result-page timeline strip still relied on chapter-derived display text.
- Reworked the timeline presentation in `game/app.js`:
  - `timelineLabel()` now returns sequential player-facing step labels like `第1步`, `第2步`;
  - timeline rows in the record panel now use the actual story title as the main heading, with `第N步` as the secondary line;
  - the result-page timeline strip now renders `storyTitle + storyNote` instead of falling back to chapter-cleaned source text.

Why this round:
- A real screenshot check on the timeline tab showed the player-facing list still reading like:
  - `关键线索 / 宫门前的哭声 / ...`
  - `关键线索 / 值夜签被改 / ...`
- That presentation was not wrong, but it was too generic and repetitive. It made the list feel like metadata rather than a sequence the player can actually follow.

Verified:
- `git ls-remote origin refs/heads/main` matched local HEAD before editing.
- `npm run check:js`
- `git diff --check`
- `npm run qa:web-game`
- Ran an escalated local Playwright capture of the first-case timeline tab:
  - `output/timeline-tab-current.png`
- Playwright text extraction confirmed the first rows now read as:
  - `宫门前的哭声 / 第1步 / ...`
  - `值夜签被改 / 第2步 / ...`
  - `名册重新封蜡 / 第3步 / ...`
- Screenshot inspection confirmed:
  - the timeline list now scans as an ordered case progression rather than repeated generic labels;
  - the new `第N步` line fits without overflow in the right-side record panel.

Remaining Ace Attorney gap list:
- Keep rewriting later-case evidence/timeline copy that still sounds more like compressed historian annotation than scene pressure.
- The result-page timeline strip now no longer depends on chapter display text, but that surface still deserves a dedicated visual sweep later.
- Continue screenshot-first QA and do not reopen already-fixed button/layout issues unless a fresh screenshot shows a concrete regression.

## 2026-06-22 iteration 103 result

Implemented:
- This round stayed off the already-fixed `举证` button, the investigation hotspot flow, the evidence-origin labels, and the newly-cleaned timeline presentation.
- Focused on another still-visible “资料提纲” residue: the case-selection screen and case-intro art caption were still directly exposing `caseData.theme` text such as `宫廷后位之争、婴儿死亡疑云与元老反对`.
- Reworked those visible surfaces in `game/app.js`:
  - case cards now keep the existing `menuHook` as the first paragraph, but the second paragraph uses a player-facing deck line derived from the opening-story title instead of the raw `theme` field;
  - the focused case dossier paragraph also now uses that same deck line instead of `theme`;
  - the menu preview / intro-art small scene caption now uses `场景｜开场提示` style text via `caseSceneCaption(caseData)`, for example `立政殿内廷｜事发当晚`, instead of `场景｜theme`.
- Added two small helpers:
  - `caseDeckline(caseData)`
  - `caseSceneCaption(caseData)`

Why this round:
- A fresh live screenshot of the case-selection page still showed cards ending with raw theme summaries like:
  - `宫廷后位之争、婴儿死亡疑云与元老反对`
  - `太子处境、皇子命运与高宗末期权力交接`
- That was exactly the kind of ordinary-player readability issue the user has been flagging: the first paragraph on those cards already sounded like a story, but the second line abruptly fell back to outline metadata.

Verified:
- `git ls-remote origin refs/heads/main` matched local HEAD before editing.
- `npm run check:js`
- `git diff --check`
- `npm run qa:web-game`
- Ran escalated local Playwright captures for:
  - `output/cases-home-copy-current.png`
  - `output/case-intro-art-copy-current.png`
- Playwright text extraction confirmed:
  - first case card now ends with `婴儿死讯还没传出宫门，废后的名字已经先进了诏稿。`
  - second case card now ends with `旧臣袖里的账册，被书记官摊开后变成了储位罪状。`
  - case-intro art small line now reads `立政殿内廷｜事发当晚`.
- Screenshot inspection confirmed:
  - the case-selection cards now read like a two-line hook instead of hook + metadata;
  - the case-intro art caption no longer leaks theme-summary wording;
  - no new text overflow appeared on desktop in the changed surfaces.

Remaining Ace Attorney gap list:
- Keep sweeping later-case visible summaries that still sound more like historian annotation than immediate game-world tension.
- The top “当前档案” dossier surface is cleaner now, but the whole cases screen still deserves a later dedicated visual/content pass once more narrative text settles.
- Continue screenshot-first QA and do not reopen already-fixed button/layout issues unless a fresh screenshot shows a concrete regression.

## 2026-06-22 iteration 104 result

Implemented:
- This round did not touch copy logic, `举证` button styling, investigation flow, evidence origin labels, or the timeline wording pass.
- Fixed a concrete desktop layout bug on the case-selection screen in `game/styles.css`:
  - under the desktop `view-cases` layout, the case gallery now uses five columns instead of four.

Why this round:
- A direct desktop Playwright layout check showed the real bug clearly:
  - the app forbids desktop page scrolling as intended;
  - but the case gallery was still laid out in 4 columns for 5 cases;
  - as a result, the fifth case card sat below the viewport and was unreachable.
- Measured before the fix at 1600x960:
  - cards `0-3` were visible;
  - card `4` had `top: 868.9`, `bottom: 1317.7`, `visible: false`.
- This was more serious than any copy issue on that screen, because it made one entire case effectively inaccessible on desktop.

Verified:
- `git diff --check`
- `npm run qa:web-game`
- Ran an escalated local Playwright desktop layout check and capture:
  - `output/cases-home-layout-current.png`
- Post-fix metrics at 1600x960 confirmed:
  - all five case cards now share the same row;
  - all five report `visible: true`;
  - `bodyScrollH === bodyClientH` and `appScrollH === appClientH`, so the desktop no-scroll rule still holds.
- Screenshot inspection confirmed:
  - all 5 cases are visible at once on desktop;
  - no new overlap or card spill appeared after switching to 5 columns.

Remaining Ace Attorney gap list:
- Keep sweeping later-case visible summaries that still sound more like historian annotation than immediate game-world tension.
- The case-selection screen is now fully reachable on desktop, but card density and line-clamp tradeoffs still deserve a later polish pass.
- Continue screenshot-first QA and do not reopen already-fixed button/layout issues unless a fresh screenshot shows a concrete regression.

## 2026-06-22 iteration 105 result

Implemented:
- Kept this round tightly scoped to one visible inconsistency on the case-selection screen.
- Updated `caseTitleForDisplay()` in `game/app.js` so the final case title now strips `最终案：` and `终局案：` the same way earlier cases already strip `第一案：` style prefixes.
- This keeps shared title surfaces consistent wherever the helper is reused, instead of only patching one card template.

Why this round:
- After the previous layout fix, a fresh desktop screenshot still showed one obvious mismatch:
  - cases 1-4 displayed short playable names;
  - case 5 alone still exposed the structural label `最终案：半小时政变`.
- For a normal player, that prefix reads more like a catalog label than a playable case name.
- This was a good small-round target because it was easy to verify visually, low risk, and it improved consistency across multiple title surfaces at once.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran an escalated local Playwright desktop verification at `1600x960` against `http://127.0.0.1:8788/game/`
- Captured a fresh screenshot:
  - `output/cases-home-title-current.png`
- Captured live DOM titles from the actual rendered case cards:
  - `["皇后宝座的缺口", "东宫阴影", "告密铜匦", "请君入瓮", "半小时政变"]`
- Screenshot inspection confirmed the fifth card now shows `半小时政变`, matching the naming style of the other four cards.

Remaining Ace Attorney gap list:
- Continue rewriting later-case summaries and opening beats so they read as scene tension, not dossier annotation.
- Keep auditing all high-frequency story surfaces for any remaining raw structural labels that leak through to players.
- Do not reopen already-fixed `举证` button or hotspot layout work unless fresh screenshots show a real regression.

## 2026-06-23 iteration 106 result

Implemented:
- Kept this round scoped to one high-frequency copy surface on the case intro page: the bottom source/beat panel under the opening scene.
- Rewrote the panel title and helper lines in `game/app.js` so it sounds less like an instructional UI and more like the player is actively piecing a case back together.
- Also removed the tab sublabels `线索 A｜正在看 / 待翻`, replacing them with more natural in-world states.

Why this round:
- A fresh inspection of `output/case-intro-art-copy-current.png` still showed one obvious remaining problem:
  - the opening scene itself had improved;
  - but the bottom panel still used phrasing like `先把这几步看明白` and `线索 A｜正在看`, which reads like a product walkthrough instead of a story game surface.
- The user has repeatedly asked to eliminate “说明书式” language, especially in high-frequency reading areas.
- This was a strong small-round target because it changed no layout structure, no buttons, and no already-stable interaction logic.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran an escalated local Playwright desktop verification at `1600x960` against `http://127.0.0.1:8788/game/`
- Captured a fresh screenshot:
  - `output/case-intro-source-voice-current.png`
- Screenshot inspection confirmed:
  - the intro page still fits in one desktop screen;
  - the updated panel title `先把散开的线头接起来` renders cleanly;
  - no new overlap, overflow, or button displacement appeared after the copy change.

Remaining Ace Attorney gap list:
- Keep rewriting later-case intros, source notes, and court-facing prompts until they consistently sound like scene tension rather than annotated summary.
- Continue screenshot-first QA on intro/investigation/trial high-frequency text surfaces.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless fresh screenshots show a concrete regression.

## 2026-06-23 iteration 107 result

Implemented:
- Kept this round limited to one high-frequency court UI surface: the empty-state guidance on the trial page and the empty hint inside the record drawer.
- Rewrote the trial-entry message, the right-column “no record selected” bar, and the record drawer empty hint in `game/app.js`.
- The new copy keeps the same function, but sounds like the court is waiting for the witness to overstate his case, instead of the UI explaining a feature.

Why this round:
- Fresh screenshot review showed the next clear remaining mismatch after the intro-page pass:
  - the case intro page was improving;
  - but the trial page still used helper copy like `案卷还是空的，庭上眼下只有他一个人在说话` and `卷中尚无选中证物`, which still read as system narration.
- The user has explicitly asked to keep stripping out “说明书式” language from high-frequency screens.
- This was a good small-round target because it was highly visible, easy to validate in real screenshots, and did not require touching the already-stable trial controls.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran an escalated local Playwright verification at `1600x960` using a reproducible local save snapshot that opens case 1 directly into court-ready state
- Captured fresh screenshots:
  - `output/trial-start-voice-current.png`
  - `output/trial-record-empty-voice-current.png`
- Live DOM capture confirmed the new text was actually rendered:
  - `证人既然开口，就让他把每个字都落稳。站不住的地方，用不着多久就会自己裂开。`
  - `案上还没摆出能顶住这句话的那一页`
  - `先让他把话说满。真要把它顶回去，得从卷里翻出一页硬证。`
  - `卷里还没抽出证物。先听他把话说满，再决定哪一页该拍上案桌。`
- Screenshot inspection confirmed:
  - the new lines fit cleanly in the right panel and record drawer;
  - no new overflow, overlap, or button displacement appeared.

Remaining Ace Attorney gap list:
- Keep rewriting court-side prompts, evidence summaries, and late-case scene notes that still sound more like annotated archive text than spoken pressure.
- Continue screenshot-first QA on the court record drawer, testimony rail, and evidence detail panel.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 108 result

Implemented:
- Kept this round focused on one remaining player-facing mismatch inside the court record drawer: the two locked evidence cards at the bottom of the evidence list.
- Rewrote how locked evidence cards are titled and described in `game/app.js`.
- Instead of exposing raw structural labels such as `庭审追问可取得`, locked cards now read like missing case pages the player still has to force out of the witness.

Why this round:
- After the previous trial-page pass, the next obvious remaining “system UI” phrase was still visible in the latest record-drawer screenshot:
  - unlocked evidence had already become more readable;
  - but locked evidence still used direct tool-like labels, which felt closer to a debug inventory than an Ace Attorney-style record page.
- This mattered because the record drawer is one of the highest-frequency screens during court play.
- It was also a good small-round target because it only changed locked-card naming/copy and did not touch any button behavior, unlock logic, or record layout.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran an escalated local Playwright verification at `1600x960` using the same reproducible court-ready local save snapshot as the previous round
- Captured a fresh screenshot:
  - `output/trial-record-locked-voice-current.png`
- Live DOM capture confirmed the last two locked cards now render as:
  - `还没问出来的那一页` / `得先在庭上戳开这道缝，这页记录才会掉下来。`
  - `哭声入诏` / `还得把他追到失口，这页才会落进案卷。`
- Screenshot inspection confirmed:
  - the new copy fits inside the disabled cards;
  - the drawer list still aligns cleanly;
  - no new overflow, clipping, or button displacement appeared.

Remaining Ace Attorney gap list:
- Keep rewriting late-case evidence summaries, locked hints, and court-facing prompts that still sound like archive annotation instead of pressure on the witness.
- Continue screenshot-first QA on court record entries, evidence detail copy, and testimony-side helper text.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 109 result

Implemented:
- Kept this round limited to one very small but high-frequency court surface: the status labels on the testimony strip.
- Updated the visible state words in `game/app.js` so they read less like feature flags and more like quick judgments a player can scan during cross-examination.
- Narrow scope only: no changes to statement order, press/present logic, button behavior, or any layout rules.

Why this round:
- After the record-drawer grey-card pass, the next remaining system-like phrasing was on the testimony strip itself.
- Labels such as `可举证`, `有疑点`, and `未追问` were functional, but still read closer to interface state than courtroom pressure.
- This mattered because the player scans these tags constantly while moving across statements.
- It was a good small-round target because the copy is highly visible and easy to validate from one reproducible courtroom screenshot.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran an escalated local Playwright verification at `1600x960` using the same reproducible court-ready local save snapshot as recent trial-page checks
- Captured a fresh screenshot:
  - `output/trial-statement-status-voice-current.png`
- Live DOM capture confirmed the visible statuses now render as:
  - `还没逼问`
  - `这句发虚`
  - `还没逼问`
- Screenshot inspection confirmed:
  - the revised status words fit inside the testimony cards;
  - the right-column statement rail still aligns cleanly;
  - no new overflow, clipping, or spacing regression appeared.

Remaining Ace Attorney gap list:
- Keep rewriting testimony-side helper text, evidence summaries, and late-case prompts that still sound more like feature labels than escalating courtroom pressure.
- Continue screenshot-first QA on statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 110 result

Implemented:
- Kept this round limited to one small but always-visible court surface: the witness-mood text in the trial header.
- Rewrote the header mood labels in `game/app.js` from metadata-style words to shorter courtroom-pressure phrases.
- Scope stayed narrow: no changes to testimony progression, statement logic, controls, or layout structure.

Why this round:
- After the testimony-strip status pass, the next remaining system-like phrasing on the same screen was the top header mood label.
- `谨慎 / 强硬 / 决断` was understandable, but it still read like an abstract state enum instead of the pressure the player should feel from the witness or opponent.
- This was a strong small-round target because that line appears on every testimony block and is easy to validate across all three court sections.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran an escalated local Playwright verification at `1600x960` using the same reproducible court-ready local save snapshot as recent trial-page checks
- Captured a fresh screenshot:
  - `output/trial-header-mood-current.png`
- Live DOM capture confirmed the three testimony headers now render as:
  - `内廷记录官｜话说得很稳`
  - `许敬宗｜步步进逼`
  - `御前书记｜咬死不放`
- Screenshot inspection confirmed:
  - the current header fits cleanly on one line;
  - the right-column header still aligns;
  - no new clipping or layout drift appeared after the wording change.

Remaining Ace Attorney gap list:
- Keep rewriting testimony-side helper text, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of escalating courtroom pressure.
- Continue screenshot-first QA on trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 111 result

Implemented:
- Kept this round limited to one tiny but always-visible trial surface: the pressure-meter stable label.
- Updated the stable pressure copy in `game/app.js` so the meter no longer reads like a raw enum state.
- Scope stayed narrow: no changes to credibility values, thresholds, warning transitions, or any layout/interaction logic.

Why this round:
- After the testimony-strip and trial-header passes, the next remaining system-like term in the same cluster was the pressure-meter label `稳定`.
- That wording worked mechanically, but it still sounded like UI state rather than the sense that the defense has not yet lost control of the courtroom.
- This was a good small-round target because the label is always visible during court, easy to validate in a single reproducible screenshot, and low risk to behavior.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran an escalated local Playwright verification at `1600x960` using the same reproducible court-ready local save snapshot as the previous trial-page checks
- Captured a fresh screenshot:
  - `output/trial-pressure-label-current.png`
- Live DOM capture confirmed the meter now renders as:
  - `法庭信誉 还压得住`
- Screenshot inspection confirmed:
  - the new label fits cleanly on the right panel;
  - the pressure meter still aligns with the surrounding header content;
  - no new clipping, wrapping, or spacing regression appeared.

Remaining Ace Attorney gap list:
- Keep rewriting testimony-side helper text, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of escalating courtroom pressure.
- Continue screenshot-first QA on pressure labels, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-24 iteration 131 result

Implemented:
- Kept this round focused on the exact庭审画面问题 the user pointed out in the screenshot, instead of继续散改别处。
- Added a new image-generated palace trial backdrop at `game/assets/episode-art-palace-v2.png`, then switched both `trialBackgroundFile()` in `game/app.js` and `.scene-palace` in `game/styles.css` to that new filename so the browser could not keep serving the old cached asset.
- The new background removes the old abstract glow wedge, floating boxes, and empty gold-outline panels that were making the scene look like a broken mockup instead of a place.
- Reworked trial-stage portrait layering in `game/styles.css`: the portrait layer now sits behind the dialogue box, the portraits are smaller, the extra CSS frame/border is gone, and the dialogue box z-index is raised so the text surface stays clean.
- Rewrote one still-too-systemic courtroom line in `game/app.js` from `证人既然开口，就让他把每个字都落稳...` to `证人既然开口，就把话说清楚。真站不住的地方，庭上自然听得出来。`

Why this round:
- The user provided a marked-up screenshot showing three concrete visual failures:
  - trial portraits were colliding with the bottom text surface;
  - the background still contained meaningless generated geometry;
  - the scene was still leaning on decorative fake-picture structure instead of one coherent bitmap background.
- This was the right next round because the bug was visible, screenshot-specific, and not a matter of taste alone: the stage really was reading as a broken layered composite.
- I also kept the copy scope narrow: one visible high-frequency courtroom sentence, not a bulk rewrite pass.

Verified:
- `npm run check:js`
- `git diff --check`
- `.gitignore` still already ignores `output/`, confirmed with:
  - `git check-ignore -v output/trial-stage-clean-v2-current.png`
  - `git check-ignore -v output/trial-record-empty-copy-current.png`
- Generated the replacement backdrop with the built-in image tool, then copied the selected result into the workspace as:
  - `game/assets/episode-art-palace-v2.png`
- Fresh desktop courtroom screenshot after switching to the new asset filename:
  - `output/trial-stage-clean-v2-current.png`
- Fresh courtroom record screenshot:
  - `output/trial-record-empty-copy-current.png`
- Screenshot inspection confirmed:
  - the old abstract wedge and floating outlined shapes are gone from the palace trial backdrop;
  - the dialogue text is no longer visually covered by the portraits;
  - the portraits now read as stage-side figures instead of UI cards sitting on top of the text box.
- Live DOM capture on the refreshed court page confirmed:
  - `bg: linear-gradient(...), url("http://127.0.0.1:8788/game/assets/episode-art-palace-v2.png")`
  - `footer: 开头这句说得稳，真正会失手的地方还在后头。`
  - `coach: 证人既然开口，就把话说清楚。真站不住的地方，庭上自然听得出来。`
  - record-side prompt includes:
    - `这句眼下还只是口风，能压住它的那页纸还没碰上来。`

Notes:
- I deliberately restored the accidentally overwritten old `game/assets/episode-art-palace.png` and kept the real replacement in `episode-art-palace-v2.png`, so this round stays reviewable and does not mix in a redundant asset overwrite.
- This round did not yet replace the other older `episode-art-*` backdrops or rebuild the portrait strip itself. The user’s screenshot only proved the palace trial scene was the urgent failure.

Remaining Ace Attorney gap list:
- Continue replacing the remaining older case/trial backdrops that still carry abstract imagegen artifacts or staged overlay noise.
- Keep rewriting courtroom helper copy one sentence at a time, especially black-card prompts and record-drawer descriptions that still sound more like editorial narration than someone in the scene.
- Recheck portrait scaling on mobile separately after the next focused asset/layout round; this round verified desktop first because that was the user’s concrete complaint surface.

## 2026-06-23 iteration 126 result

Implemented:
- Kept this round focused on the investigation screen, specifically the parts that still felt like decorative UI instead of a playable scene.
- Removed the extra CSS glow layer from the main investigation stage so the background art reads more directly instead of carrying an added radial flourish on top.
- Reworked the top-right `location-map` card into a text-only `现场摘要` panel and stopped reusing a second copy of the same scene background there.
- Rewrote the high-frequency investigation hints in `game/app.js` so they read more like a person working a scene (`先看东西，别先信嘴`, `把证物递出去，谁先接不住，谁心里最虚`) instead of system-flavored rule text.

Why this round:
- The latest user direction explicitly asked to stop leaning on meaningless SVG/CSS decoration and to let scene art and direct scene interaction carry the investigation feel.
- The investigation screen still had two concrete offenders: a duplicated mini-background in the summary card, and overly abstract helper copy that read like interface copy more than live casework.
- This was a safe small-round target because it stayed inside the investigation layout and copy layer without reopening already-settled evidence, trial, or hotspot submission behavior.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran the required web-game Playwright client with escalated browser permissions because Chromium still hits the local `MachPortRendezvous` sandbox restriction here:
  - `output/web-game-iteration126/shot-0.png`
  - `output/web-game-iteration126/state-0.json`
- Ran a second escalated Playwright pass that actually entered case 1 investigation and captured:
  - `output/investigation-summary-no-ornament-current.png`
- Live DOM capture on that investigation screenshot confirmed:
  - `screen: investigation`
  - `investigationCommand: examine`
  - `hotspotsVisible: true`
  - `hotspotsInteractive: true`
  - `location: 立政殿`
- Screenshot inspection confirmed:
  - the top-right summary card no longer repeats another miniature scene background;
  - the investigation stage now reads cleaner and more like one scene plus one control column;
  - the command buttons, clue board, hotspot positions, and footer actions remained aligned on desktop.

Notes:
- Checked `.gitignore` again this round; existing `output/` rules already covered the new validation artifacts, so no `.gitignore` change was needed.
- Important follow-up finding: the large translucent arc still visible on the left side of the palace investigation scene is baked into `game/assets/location-bg-palace-site.png` itself, not left over from the CSS glow layer. That needs an asset replacement round, not another style-only tweak.

Remaining Ace Attorney gap list:
- Replace the worst baked-in background images (starting with `location-bg-palace-site.png`) with cleaner scene art that does not carry abstract arcs or pseudo-UI shapes.
- Push more investigation interaction into the scene itself, especially people/talk beats, instead of relying so heavily on command lists in the right panel.
- Keep rewriting investigation and case-intro copy that still sounds like archival summary text rather than character-voiced dramatic play.

## 2026-06-23 iteration 127 result

Implemented:
- Kept this round tightly scoped to the investigation screen's default voice, not its layout.
- Replaced the generic investigation fallback speaker from `调查` with `辩方` in the main scene render and in the investigation-beat fallback path.
- Rewrote the most common investigation fallback lines in `game/app.js` so they read like the defense side thinking on their feet, instead of a system panel narrating mode changes.
- Updated the command-switch lines (`move` / `examine` / `talk` / `present`), the enter-investigation line after the opening cutscene, the location-change line, and the no-voice examine result line.

Why this round:
- After the previous UI cleanup, the most visible remaining “说明书感” on the investigation screen was the large bottom box still speaking as `调查`.
- The user explicitly asked for more human, less high-above dialogue and description. This was the next safest high-frequency fix because it changed wording, not flow.
- Keeping the round copy-only also avoided reopening already-settled layout, button sizing, hotspot placement, and evidence submission behavior.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran the required web-game Playwright client with escalated browser permissions again:
  - `output/web-game-iteration127/shot-0.png`
  - `output/web-game-iteration127/state-0.json`
- Ran a second escalated Playwright pass into case 1 investigation and captured:
  - `output/investigation-voice-current.png`
- Live DOM capture confirmed:
  - `screen: investigation`
  - `speaker: 辩方`
  - `message: 人都把话吞回去了。那就别听嘴，先听痕迹。`
  - `hotspotsVisible: true`
  - `hotspotsInteractive: true`
- Screenshot inspection confirmed:
  - the bottom investigation box now reads as protagonist-side inner casework rather than a system narrator;
  - the new sentences fit cleanly on the desktop layout;
  - the right-side command area, clue board, and hotspot markers remained aligned.

Notes:
- Checked `.gitignore` again this round; existing `output/` rules still covered the new validation artifacts, so no `.gitignore` change was needed.
- The baked-in palace background arc identified last round still remains an asset problem, not a copy/layout problem. This round intentionally did not reopen that image issue.

Remaining Ace Attorney gap list:
- Replace the most obviously polluted investigation backgrounds, starting with `location-bg-palace-site.png`.
- Move more talk interaction into the background scene itself instead of leaning on the right-side list for every conversation beat.
- Keep revising case-intro and evidence-summary prose that still reads closer to dossier summary than live dramatic play.

## 2026-06-23 iteration 128 result

Implemented:
- Kept this round limited to one concrete asset problem on the first investigation screen: the polluted `location-bg-palace-site.png` background.
- Generated a fresh palace investigation background image specifically for the first case and replaced `game/assets/location-bg-palace-site.png`.
- Because the new image changed the visual layout, also retuned only the first case / first location hotspot field in `game/app.js` so the two clickable points land back on the desk area and the folding-screen area instead of floating on a pillar.
- Added a narrow helper path in `game/app.js` so only `case-empress-seat` location 0 uses a full-height hotspot field; other cases keep their previous hotspot behavior untouched this round.

Why this round:
- The previous round had already proven that the ugly translucent arc on the left side of the palace scene was baked into the bitmap itself, not caused by CSS.
- That made this a good small-round target: replace one bad asset instead of reopening unrelated layout systems.
- The first screenshot after replacement showed the old hotspot coordinates no longer matched the new art, so fixing those two points in the same round was necessary to avoid shipping a prettier but less playable screen.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran the required web-game Playwright client with escalated browser permissions:
  - `output/web-game-iteration128/shot-0.png`
  - `output/web-game-iteration128/state-0.json`
- After hotspot retuning, ran it again:
  - `output/web-game-iteration128b/shot-0.png`
  - `output/web-game-iteration128b/state-0.json`
- Ran a focused escalated Playwright pass into case 1 investigation and captured:
  - `output/investigation-palace-bg-replaced-current.png`
  - `output/investigation-palace-bg-hotspot-fixed-current.png`
- Live DOM capture on the final screenshot confirmed:
  - `screen: investigation`
  - `location: 立政殿`
  - `command: examine`
  - `hotspotsVisible: true`
  - hotspot bounds:
    - `压着诏稿的镇纸` at approximately `(259, 625)`
    - `屏风后的绣鞋印` at approximately `(729, 573)`
- Screenshot inspection confirmed:
  - the previous baked-in giant translucent arc is gone;
  - the replacement art still reads as the same room type the scene copy describes;
  - the two hotspots now sit near the desk and the screen-side search area instead of on empty architecture;
  - the dialogue box, right-side summary card, clue board, and action buttons remained aligned.

Asset source:
- Generated with the image tool this round and copied from:
  - `/Users/oubeichen/.codex/generated_images/019ecf74-c816-7533-b322-848453ce7320/ig_03fbe324badaecb1016a39f3f6e5d48191a8da28374025b447.png`

Notes:
- Checked `.gitignore` again this round; existing `output/` rules already covered the new validation artifacts, so no `.gitignore` change was needed.
- This round intentionally did not touch the archive or defense variants of the palace scene yet. Those should be reviewed separately rather than blindly replaced in a batch.

Remaining Ace Attorney gap list:
- Continue replacing the other investigation backgrounds that still carry old pseudo-UI or muddy overlays.
- Move more talk interaction into direct scene interaction instead of relying so heavily on the right command list.
- Keep revising case-intro and evidence-summary prose that still sounds more archival than player-spoken.

## 2026-06-23 iteration 129 result

Implemented:
- Kept this round limited to the second investigation location of case 1: `史官案牍房`.
- Replaced `game/assets/location-bg-palace-archive.png`, which was still effectively an old UI mock baked into a “background” image, with a clean image-generated archive room background.
- Retuned only the first case / second location hotspot coordinates in `game/app.js` so `新蜡封口` and `被抽走的一页` land back on the foreground archive desk instead of floating on the shelf/window zone.
- Reused the same full-height hotspot field rule already introduced for case 1 by extending it to this location only; no other case hotspots changed.

Why this round:
- After fixing `立政殿`, the next most obvious non-game-like background in the same case was `案牍房`: it literally contained cards and bottom bars inside the bitmap.
- This was another clean small-round asset task because it stayed inside case 1 and followed the exact same repair pattern as the prior round: replace one broken background, then fix only the hotspots it invalidates.
- Not touching the third `辩护席` image in the same round kept the risk bounded and made validation straightforward.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran the required web-game Playwright client before and after hotspot retuning:
  - `output/web-game-iteration129/shot-0.png`
  - `output/web-game-iteration129/state-0.json`
  - `output/web-game-iteration129b/shot-0.png`
  - `output/web-game-iteration129b/state-0.json`
- Ran a focused escalated Playwright pass into case 1 investigation, moved to `史官案牍房`, switched back to `查看`, and captured:
  - `output/investigation-palace-archive-bg-current.png`
  - `output/investigation-palace-archive-hotspot-fixed-current.png`
- Live DOM capture on the final archive-room screenshot confirmed:
  - `screen: investigation`
  - `location: 史官案牍房`
  - `command: examine`
  - `hotspotsVisible: true`
  - hotspot bounds:
    - `新蜡封口` at approximately `(537, 755)`
    - `被抽走的一页` at approximately `(422, 721)`
- Screenshot inspection confirmed:
  - the old baked-in cards/panels are gone from the archive-room background;
  - the scene now reads as a real records office instead of a UI mock background;
  - both hotspots sit on the foreground archive desk rather than on the shelving/window area;
  - the bottom dialogue box, right summary card, clue board, and action buttons remained aligned.

Asset source:
- Generated with the image tool this round and copied from:
  - `/Users/oubeichen/.codex/generated_images/019ecf74-c816-7533-b322-848453ce7320/ig_08ac6797ccceb415016a39fd5ff910819aab52dc2279761f7c.png`

Notes:
- Checked `.gitignore` again this round; existing `output/` rules still covered all new verification artifacts, so no `.gitignore` change was needed.
- The third first-case background, `location-bg-palace-defense.png`, still uses the older baked UI treatment and should be handled in a separate round rather than bundled here.

Remaining Ace Attorney gap list:
- Replace `location-bg-palace-defense.png` and then continue outward to other cases with the same old baked-overlay problem.
- Move more talk interaction into direct scene interaction instead of relying so heavily on the right-side command list.
- Keep revising case-intro and evidence-summary prose that still sounds more archival than player-spoken.

## 2026-06-23 iteration 130 result

Implemented:
- Kept this round limited to one copy problem on the investigation screen: the right-side summary card and command-panel helper text were still speaking like a tutorial.
- Rewrote the investigation summary emphasis line in `game/app.js` so it no longer says `现在先做：...`.
- Rewrote the four command helper lines (`移动` / `查看` / `交谈` / `出示`) to describe the scene and stakes directly instead of telling the player what to do.
- Changed the examine-state labels from `待触发` / `已记录` style system wording to `还没细看` / `已记下`, which fits the scene better and reads less like a trigger debugger.

Why this round:
- The user's most recent complaint was explicit: the game still had too many “说明书式” lines like “换个做法：查看” and “先看谁的反应最不自然”.
- After the recent asset cleanup rounds, the archive-room screenshot made the next obvious offender very clear:
  - `现在先做：盯现场`
  - `先看东西，别先信嘴。纸墨脚印，比谁都嘴硬。`
- This was a good small-round target because it is high-frequency, player-facing, and screenshot-verifiable without reopening any layout or hotspot logic.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran the required web-game Playwright client with escalated browser permissions:
  - `output/web-game-iteration130/shot-0.png`
  - `output/web-game-iteration130/state-0.json`
- Ran a focused escalated Playwright pass into case 1 investigation, moved to `史官案牍房`, switched back to `查看`, and captured:
  - `output/investigation-copy-de-instruction-current.png`
- Live DOM capture confirmed:
  - `screen: investigation`
  - `location: 史官案牍房`
  - `command: examine`
  - `locationMapText` now includes:
    - `桌上的纸页、封蜡和磨痕都在场。`
    - `封蜡、纸页和桌角的磨痕，都是自己留下的口供。`
  - `hintText` now renders as:
    - `纸页、封蜡、脚印，全都在这里。`
  - status labels now render as:
    - `还没细看`
    - `还没细看`
- Screenshot inspection confirmed:
  - the right summary card no longer contains `现在先做：...` style tutorial phrasing;
  - the command helper text now reads as direct scene description rather than player instruction;
  - the new copy fits cleanly without overflow or alignment drift.

Notes:
- Checked `.gitignore` again this round; existing `output/` rules still covered the new verification artifacts, so no `.gitignore` change was needed.
- This round intentionally did not touch the bottom dialogue box, courtroom text, or the remaining `辩护席` background asset. Those remain for separate focused rounds.

Remaining Ace Attorney gap list:
- Replace `location-bg-palace-defense.png` and then continue outward to other cases with the same old baked-overlay problem.
- Move more talk interaction into direct scene interaction instead of relying so heavily on the right-side command list.
- Keep revising case-intro and evidence-summary prose that still sounds more archival than player-spoken.

## 2026-06-23 iteration 122 result

Implemented:
- Kept this round limited to the top-left brand subtitle on the home screen header.
- Changed the visible subtitle in `game/index.html` from `宫廷法庭推理` to `宫门翻案`.
- Left all menu layout, button sizes, and home-screen structure untouched.

Why this round:
- The latest home screenshot still had one very high-frequency phrase that read like a product category label instead of story-facing game language.
- For a normal player, `宫廷法庭推理` explains the genre but it does not help the header sound like part of the world.
- `宫门翻案` is shorter, easier to scan in the narrow topbar slot, and keeps the palace-case tone without turning the header into interface documentation.

Verified:
- `git fetch origin main`
- confirmed `HEAD` and `origin/main` both pointed to `07d1acf32fd138a3fdeefa4a1f2dcf82da32d15f` before this round's commit
- `npm run check:js`
- `git diff --check`
- verified the served page source with `curl http://127.0.0.1:8788/game/`
- used the in-app browser on `http://127.0.0.1:8788/game/?v=20260623-brand`
- captured and inspected:
  - `output/home-brand-element-current.png`
  - `output/home-brand-element-snapshot.md`
- live DOM snapshot confirmed the header brand block now renders:
  - `武周逆转录 / 宫门翻案`
- element screenshot inspection confirmed:
  - the updated subtitle fits cleanly inside the topbar brand area;
  - the line height and spacing stayed aligned;
  - no truncation or overlap appeared in the changed element.

Notes:
- Checked `.gitignore` this round; existing rules already covered the generated verification artifacts, so no `.gitignore` change was needed.
- A separate headless Playwright shell launch still hit the known macOS `MachPortRendezvous` permission failure in this environment, so this round's visual verification stayed on the in-app browser path.

Remaining Ace Attorney gap list:
- Keep rewriting testimony-side helper text, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of escalating courtroom pressure.
- Continue screenshot-first QA on dialogue hints, topbar copy, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 123 result

Implemented:
- Kept this round limited to one case-intro readability pass plus one boot reliability fix that was blocking fresh-browser verification.
- Shortened two line-source titles in `game/game-data.js` and the matching fallback copy in `game/app.js`:
  - `诏稿上盖住的名字` -> `诏稿遮住谁`
  - `宝座终于空出缺口` -> `后位空出缺口`
- Replaced the `document.write(...)` asset boot path in `game/index.html` with sequential DOM-based asset loading so fresh in-app browser tabs render the full game instead of sometimes stopping at a topbar-only shell.

Why this round:
- The latest case-intro screenshot still had two visible source tabs clipped into ellipses on desktop, which meant a player had to guess what the later clues were about before clicking them.
- This was a clear usability problem, not just style polish: those tabs are a high-frequency navigation surface on the case-intro page.
- At the same time, fresh browser tabs had become unreliable after the earlier cache-busting pass, so a small boot-path hardening change was necessary to make screenshot-first QA trustworthy again.

Verified:
- `git fetch origin main`
- confirmed `HEAD` and `origin/main` both pointed to `d1876b4a3f02ce9433afcaa3dc258f3f1fec2111` before this round's commit
- `npm run check:js`
- `git diff --check`
- Opened a fresh in-app browser tab at:
  - `http://127.0.0.1:8788/game/?v=bootfix-20260623`
- Captured and inspected:
  - `output/bootfix-home-snapshot.md`
  - `output/bootfix-home-current.png`
- Fresh-home verification confirmed:
  - the home screen now renders full main content again in a new tab, not just the topbar shell;
  - the brand subtitle still renders as `宫门翻案`.
- Used the local debug entry only for validation:
  - `http://127.0.0.1:8788/debug-launch.html?scenario=case&case=0&v=casefix2-20260623`
- Captured and inspected:
  - `output/case-tab-short-title-snapshot.md`
  - `output/case-tab-short-title-current.png`
- Live DOM snapshot on the case-intro page confirmed the later source tabs now render as:
  - `诏稿遮住谁`
  - `后位空出缺口`
- Screenshot inspection confirmed:
  - the two revised tabs now show fully without ellipsis on the desktop case-intro layout;
  - the source row, right-side detail card, and bottom action buttons stayed aligned;
  - no new clipping or overlap appeared in that case-intro pass.

Notes:
- Checked `.gitignore` this round; existing rules already covered the generated verification artifacts, so no `.gitignore` change was needed.
- Local `debug-launch.html` was adjusted only as a temporary validation surface and remains ignored; the tracked product change for boot reliability lives in `game/index.html`.

Remaining Ace Attorney gap list:
- Keep rewriting case-intro source labels, evidence summaries, and late-case prompts that still sound like archive annotation instead of scene pressure.
- Continue screenshot-first QA on case-intro source rows, home/current-case summary copy, trial headers, statement cards, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 124 result

Implemented:
- Kept this round limited to the case-selection gallery cards.
- Simplified each card in `game/app.js` from two stacked preview paragraphs down to a single short deckline.
- Left the card title, poster, status tags, `案件简报` button, and primary entry button unchanged.

Why this round:
- The latest case-selection screenshot showed every card trying to carry two separate preview paragraphs at once.
- That produced exactly the wrong reading experience for a game menu: duplicated setup, multiple ellipses, and too much vertical text noise before the player even picks a case.
- This was a good small-round target because it reduced clutter on one high-frequency screen without reopening settled layout or navigation work.

Verified:
- `git fetch origin main`
- confirmed `HEAD` and `origin/main` both pointed to `d8598fb7c6e7d5e7b42da0ec92ee54c25fe3f00c` before this round's commit
- `npm run check:js`
- `git diff --check`
- Ran a fresh local Playwright verification at `1600x960` against:
  - `http://127.0.0.1:8788/game/?v=case-shell-20260623b`
- The script opened `案件选择`, captured:
  - `output/case-selection-single-hook-current.png`
- Live DOM capture confirmed:
  - `cardParagraphCounts: [1,1,1,1,1]`
  - first card preview: `婴儿死讯还没传出宫门，废后的名字已经先进了诏稿。`
- Screenshot inspection confirmed:
  - each case card now shows one preview paragraph instead of two;
  - the card column reads more cleanly at desktop width;
  - the `案件简报` and `开始查案` buttons remained aligned and unchanged.

Notes:
- Checked `.gitignore` this round; existing rules already covered generated verification artifacts, so no `.gitignore` change was needed.
- This verification used a fresh browser profile, so the screenshot reflects layout and card density rather than carried-over case progress state.

Remaining Ace Attorney gap list:
- Keep rewriting home/current-case summary copy, case-intro evidence summaries, and late-case prompts that still sound too archival or explanatory.
- Continue screenshot-first QA on case-selection cards, home/current-case panels, trial headers, statement cards, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 125 result

Implemented:
- Kept this round limited to the one-line case hooks shown on the case-selection gallery cards.
- Added a dedicated `cardDeckline` field for each of the five cases in `game/game-data.js`.
- Updated `caseDeckline()` in `game/app.js` to prefer `caseData.cardDeckline` over the longer opening-story title when rendering card previews.

Why this round:
- After the previous pass reduced each case card from two preview paragraphs to one, the remaining single paragraph was still too long and kept getting cut off with ellipses.
- On a game menu, that still felt wrong: the player should get one complete hook at a glance, not a half-sentence that looks like a truncated summary.
- This was a safe small-round target because it only changes short preview copy on one screen and leaves case intros, trials, and buttons alone.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran a fresh local Playwright verification at `1600x960` against:
  - `http://127.0.0.1:8788/game/?v=case-shell-20260623c`
- The script opened `案件选择`, captured:
  - `output/case-selection-short-deckline-current.png`
- Live DOM capture confirmed:
  - `cardParagraphCounts: [1,1,1,1,1]`
  - card previews now render as complete short hooks:
    - `哭声刚起，废后的字先落了纸。`
    - `一本旧账进宫，一夜之间成了罪状。`
    - `投书刚出铜匦，满城已经替人定罪。`
    - `供状太干净，像刚从刑具旁擦出来。`
    - `夜门刚破，赏簿和罪名先一步排好。`
- Screenshot inspection confirmed:
  - the five card hooks now read as full sentences instead of clipped summaries;
  - the case-selection column is cleaner and easier to scan;
  - the card actions and status tags stayed aligned.

Notes:
- Checked `.gitignore` this round; existing rules already covered the generated verification artifacts, so no `.gitignore` change was needed.

Remaining Ace Attorney gap list:
- Keep rewriting home/current-case summary copy and case-intro evidence summaries that still sound more archival than player-facing.
- Continue screenshot-first QA on case-selection cards, home/current-case panels, trial headers, statement cards, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 117 result

Implemented:
- Kept this round limited to one section title on the case-intro source panel in `game/app.js`.
- Changed the heading from `先把散开的线头接起来` to `散开的线头`.
- Left the source-panel body text, source tabs, and case flow untouched.

Why this round:
- The latest verified case-intro screenshot still had a prominent section title that was directly telling the player what to do.
- The surrounding copy was already moving closer to scene pressure, so this title had become the next most obvious “说明书口吻” mismatch on that screen.
- This was a safe small-round target because it is display-only, highly visible, and easy to verify without reopening any settled interaction or layout work.

Verified:
- `git fetch origin main`
- confirmed `HEAD` and `origin/main` both pointed to `3fe7a8e826dc9feb051b9d87c7d210703f7a69e9` before this round's commit
- `npm run check:js`
- `git diff --check`
- Used the in-app browser at `http://127.0.0.1:8788/game/` and reopened the current case-intro screen from the persisted case-1 progress state
- Captured a fresh screenshot:
  - `output/case-source-header-current.png`
- Live DOM capture confirmed:
  - `sectionTitle: 散开的线头`
  - `bodyHasOldText: false`
- Screenshot inspection confirmed:
  - the new heading fits cleanly above the source tabs;
  - the tabs, right-side detail card, and bottom action buttons remained aligned at `1600x960`;
  - no new overflow, clipping, or spacing regression appeared.

Notes:
- Checked `.gitignore` this round; current rules still cover the generated validation artifacts, so no `.gitignore` change was needed.

Remaining Ace Attorney gap list:
- Keep rewriting case-intro source labels, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of scene pressure.
- Continue screenshot-first QA on case-intro source panels, top-bar tags, pressure labels, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 118 result

Implemented:
- Kept this round limited to one visible label on the right-side scene card of the case-intro screen.
- Changed the card kicker in `game/app.js` from `现场档案` to `当夜现场`.
- Left the scene card contents, evidence strip, source panel, and action buttons untouched.

Why this round:
- The latest verified case-intro screenshot still had one very visible archive-style label on the right card.
- `现场档案` was understandable, but it still sounded like a dossier heading; `当夜现场` keeps the same function while pulling the player closer to the scene itself.
- This was a safe small-round target because it is display-only, highly visible, and easy to verify without reopening any settled interaction or layout work.

Verified:
- `git fetch origin main`
- confirmed `HEAD` and `origin/main` both pointed to `a3be7d5d2d57775e561d66e06040c7d92c77ff34` before this round's commit
- `npm run check:js`
- `git diff --check`
- Used the in-app browser at `http://127.0.0.1:8788/game/` and reopened the current case-intro screen from the persisted case-1 progress state
- Captured a fresh screenshot:
  - `output/case-intro-art-kicker-current.png`
- Live DOM capture confirmed:
  - `heroKicker: 当夜现场`
  - `bodyHasOldText: false`
- Screenshot inspection confirmed:
  - the new kicker fits cleanly in the right-side scene card;
  - the location name, time caption, evidence strip, and bottom action buttons remained aligned at `1600x960`;
  - no new clipping, overlap, or spacing regression appeared.

Notes:
- Checked `.gitignore` this round; current rules still cover the generated validation artifacts, so no `.gitignore` change was needed.

Remaining Ace Attorney gap list:
- Keep rewriting case-intro source labels, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of scene pressure.
- Continue screenshot-first QA on case-intro source panels, scene-card labels, top-bar tags, pressure labels, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 119 result

Implemented:
- Kept this round centered on one case-intro high-frequency label and one related local-debugging fix.
- Changed the first case opening-story kicker from `事发当晚` to `那一夜` in `game/game-data.js`.
- Added a display-side normalization in `game/app.js` so any stale `事发当晚` opening kicker is rendered as `那一夜`.
- Added timestamped asset loading in [game/index.html](/Users/oubeichen/Projects/wuzetian2/game/index.html) so the in-app browser stops reusing stale cached CSS/JS during local iteration.

Why this round:
- The latest case-intro screenshots still showed `事发当晚`, which read more like archive metadata than story-facing scene language.
- `那一夜` keeps the same meaning but sounds closer to a player entering a scene, not reading a dossier heading.
- During verification, the in-app browser kept serving stale cached assets, so a small local cache-busting fix was necessary to make screenshot-first QA trustworthy again instead of validating old files.

Verified:
- `git fetch origin main`
- confirmed `HEAD` and `origin/main` both pointed to `6ac5c5aee7e8663b10aca5de2229603e1b1d9142` before this round's commit
- `npm run check:js`
- `git diff --check`
- Used the in-app browser at `http://127.0.0.1:8788/game/` after the cache-busting entry update
- Confirmed on the home/current-continue surface:
  - `立政殿内廷｜那一夜`
- Reopened the current case-intro screen and captured a fresh screenshot:
  - `output/case-opening-kicker-current.png`
- Live DOM capture on the case-intro screen confirmed:
  - `openingKicker: 那一夜`
  - `rightCaption: 立政殿内廷｜那一夜`
  - `bodyHasOld: false`
  - `bodyHasNew: true`
- Screenshot inspection confirmed:
  - the new kicker fits cleanly on both the left opening-story card and the right scene card caption;
  - the intro layout, tabs, and bottom action buttons remained aligned at `1600x960`;
  - the local browser now reflects fresh asset changes instead of stale cached files.

Notes:
- Checked `.gitignore` this round; current rules still cover the generated validation artifacts, so no `.gitignore` change was needed.

Remaining Ace Attorney gap list:
- Keep rewriting case-intro source labels, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of scene pressure.
- Continue screenshot-first QA on case-intro source panels, scene-card labels, opening kickers, top-bar tags, pressure labels, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 120 result

Implemented:
- Kept this round limited to one visible home-screen label in `game/app.js`.
- Changed the preview kicker on the home “continue” card from `当前继续` to `上回停在这里`.
- Left continue-case logic, menu buttons, and case preview content untouched.

Why this round:
- After the recent case-intro passes, the home screen still had one very obvious interface-style label on a high-frequency surface.
- `当前继续` was clear but cold; `上回停在这里` keeps the same meaning while sounding more like the player is resuming a suspended case, not reading a system panel.
- This was a safe small-round target because it is display-only, easy to validate on one fresh home screenshot, and does not reopen any settled interaction work.

Verified:
- `git fetch origin main`
- confirmed `HEAD` and `origin/main` both pointed to `c12d6b81232ec68a3615f8a040935007ca3aa548` before this round's commit
- `npm run check:js`
- `git diff --check`
- Used the in-app browser at `http://127.0.0.1:8788/game/` with the cache-busted local entry from the previous round
- Captured a fresh screenshot:
  - `output/home-preview-kicker-current.png`
- Live DOM capture confirmed:
  - `previewKicker: 上回停在这里`
  - `bodyHasOld: false`
  - `bodyHasNew: true`
- Screenshot inspection confirmed:
  - the new kicker fits cleanly inside the home preview card;
  - the card headline, summary text, and menu buttons remained aligned at `1600x960`;
  - no new clipping, overlap, or spacing regression appeared on the home screen.

Notes:
- Checked `.gitignore` this round; current rules still cover the generated validation artifacts, so no `.gitignore` change was needed.

Remaining Ace Attorney gap list:
- Keep rewriting case-intro source labels, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of scene pressure.
- Continue screenshot-first QA on home preview labels, case-intro source panels, scene-card labels, opening kickers, top-bar tags, pressure labels, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 121 result

Implemented:
- Kept this round limited to one visible hero label on the home menu in `game/app.js`.
- Changed the home hero kicker from `宫廷法庭推理` to `大周疑案`.
- Left the top-bar brand subtitle, menu buttons, and continue-card content untouched.

Why this round:
- The latest verified home screenshot still had one prominent genre-style phrase above the title.
- That phrase explained the product category, but it did not help the player enter the fiction. `大周疑案` keeps the same broad framing while sounding more like the world of the game than a store-page label.
- This was a safe small-round target because it is display-only, highly visible, and easy to verify on one fresh home screenshot.

Verified:
- `git fetch origin main`
- confirmed `HEAD` and `origin/main` both pointed to `dbfa66de8885b28825589be704d9029c35f64490` before this round's commit
- `npm run check:js`
- `git diff --check`
- Used the in-app browser at `http://127.0.0.1:8788/game/` with the cache-busted local entry from the earlier round
- Captured a fresh screenshot:
  - `output/home-hero-kicker-current.png`
- Live DOM capture confirmed:
  - `heroKicker: 大周疑案`
  - `bodyHasNew: true`
- Note:
  - `bodyHasOld: true` still appeared because the top-bar brand subtitle intentionally remains `宫廷法庭推理` in this round; this pass only changed the large home hero label.
- Screenshot inspection confirmed:
  - the new hero kicker fits cleanly above the title;
  - the H1, summary copy, stat tags, continue card, and right-side menu buttons remained aligned at `1600x960`;
  - no new clipping, overlap, or spacing regression appeared on the home screen.

Notes:
- Checked `.gitignore` this round; current rules still cover the generated validation artifacts, so no `.gitignore` change was needed.

Remaining Ace Attorney gap list:
- Keep rewriting case-intro source labels, evidence summaries, late-case prompts, and remaining top-level UI labels that still sound like neutral interface metadata instead of scene pressure.
- Continue screenshot-first QA on home hero labels, home preview labels, case-intro source panels, scene-card labels, opening kickers, top-bar tags, pressure labels, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 116 result

Implemented:
- Kept this round limited to one sentence in the case-intro source detail panel.
- Changed the footer line in `game/app.js` from `接住这一页，庭上先心虚的人就快坐不住了。` to `这一页一露到庭上，先心虚的人就该坐不住了。`
- Left the source tabs, case intro flow, and evidence logic untouched.

Why this round:
- The latest verified case-intro screenshot still exposed a line that directly instructed the player what to do.
- That wording carried the right dramatic meaning, but it still sounded like the interface nudging the player instead of the案情 itself在发力。
- This was a good small-round target because it is visible on the first case landing screen, easy to verify in one fresh screenshot, and does not touch any already-stable layout or interaction behavior.

Verified:
- `git fetch origin main`
- confirmed `HEAD` and `origin/main` both pointed to `b3cf083fefd69e990e5d1c5eb5348b042e70f445` before this round's commit
- `npm run check:js`
- `git diff --check`
- Used the in-app browser at `http://127.0.0.1:8788/game/` and reopened the case-intro screen from the persisted case-1 progress snapshot
- Captured a fresh screenshot:
  - `output/case-source-footer-current.png`
- Live DOM capture confirmed:
  - `sourceTitle: 宫门前的哭声`
  - `sourceFooter: 这一页一露到庭上，先心虚的人就该坐不住了。`
  - `bodyHasOldText: false`
- Screenshot inspection confirmed:
  - the rewritten line fits cleanly in the right-side source detail card;
  - no new overflow, clipping, or panel misalignment appeared at `1600x960`;
  - the source tabs and bottom action buttons remained stable.

Notes:
- Checked `.gitignore` this round; current rules still cover the generated validation artifacts, so no `.gitignore` change was needed.

Remaining Ace Attorney gap list:
- Keep rewriting case-intro source notes, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of scene pressure.
- Continue screenshot-first QA on case-intro source cards, top-bar tags, pressure labels, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 115 result

Implemented:
- Kept this round limited to one global top-bar status label in `game/app.js`.
- Changed the non-home header tag from `信誉 ${progress.credibility}/5` to `庭势 ${progress.credibility}/5`.
- Left the underlying credibility number, meter, and trial-state logic untouched.

Why this round:
- The latest verified courtroom screenshot already showed `庭上风向` on the right meter, but the top status bar still exposed `信誉 5/5`, which read more like a rules HUD than an in-world courtroom state.
- This was the next obvious high-frequency mismatch because the tag appears across案件页、调查页、庭审页顶部，而且一直跟着玩家。
- It was a safe small-round target because the change is display-only, easy to verify in a fresh screenshot, and does not reopen any previously stabilized layout or interaction issues.

Verified:
- `git fetch origin main`
- confirmed `HEAD` and `origin/main` both pointed to `ea51f43e95400da7367d59ad1df3e7de2873e99c` before this round's commit
- `npm run check:js`
- `git diff --check`
- Used the in-app browser at `http://127.0.0.1:8788/game/` with a reproducible local save snapshot for case 1 court-ready progress
- Captured a fresh screenshot:
  - `output/case-status-tag-current.png`
- Live DOM capture confirmed the top bar tags now render as:
  - `皇后宝座的缺口`
  - `庭势 5/5`
  - `证物 8/8`
- Screenshot inspection confirmed:
  - the new top-bar label fits cleanly beside the case title and evidence count;
  - the top actions (`札记` / `设置`) remain aligned;
  - no new clipping, overlap, or crowding appeared in the top bar at `1600x960`.

Notes:
- Checked `.gitignore` this round; current rules still cover the generated validation artifacts, so no `.gitignore` change was needed.

Remaining Ace Attorney gap list:
- Keep rewriting testimony-side helper text, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of escalating courtroom pressure.
- Continue screenshot-first QA on top-bar tags, pressure labels, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 112 result

Implemented:
- Kept this round limited to one small but high-frequency courtroom line: the hint text at the bottom of the testimony dialogue box.
- Rewrote the trial dialogue advance hints in `game/app.js` so they no longer read like system prompts such as `证词尚未说完`.
- Scope stayed narrow: no changes to dialogue advancement behavior, pointer navigation, record interaction, or layout structure.

Why this round:
- After the pressure-label pass, the next obvious system-like phrase still visible in the latest trial screenshot was the dialogue-box footer hint.
- The old wording explained interface state correctly, but it still sounded like the game UI describing itself rather than the player reading pressure off the witness.
- This was a good small-round target because the line appears constantly during court and can be validated cleanly across three statement positions with the same reproducible trial snapshot.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran an escalated local Playwright verification at `1600x960` using the same reproducible court-ready local save snapshot as recent trial-page checks
- Captured a fresh screenshot:
  - `output/trial-dialogue-hint-current.png`
- Live DOM capture confirmed the three dialogue footer hints now render as:
  - `先让他往下说。下一句也许就会自己露风。`
  - `他的话还没说尽，这一句也还来得及回头咬住。`
  - `这句话还悬在案上。现在可以逼问，也可以让案卷开口。`
- Screenshot inspection confirmed:
  - the revised hint fits inside the dialogue footer bar;
  - the dialogue box and right panel remain aligned;
  - no new clipping or overflow appeared after the copy change.

Remaining Ace Attorney gap list:
- Keep rewriting testimony-side helper text, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of escalating courtroom pressure.
- Continue screenshot-first QA on dialogue hints, pressure labels, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 113 result

Implemented:
- Kept this round limited to one small readability pass on testimony titles in court-facing UI.
- Added `testimonyTitleForDisplay()` in `game/app.js` to strip structural prefixes like `证词一：`.
- Applied that display cleanup to the trial scene title, the trial header, and the testimony interlude surface.

Why this round:
- The latest verified courtroom screenshot still exposed a very visible structural label:
  - `证词一：表面原因`
- This was understandable, but for a normal player it still read more like an outline heading than a piece of live courtroom flow.
- It was a good small-round target because the change is display-only, easy to verify visually, and affects multiple high-frequency surfaces without touching any trial logic.

Verified:
- `npm run check:js`
- `git diff --check`
- Ran an escalated local Playwright verification at `1600x960` using the same reproducible court-ready local save snapshot as recent trial-page checks
- Captured a fresh screenshot:
  - `output/trial-title-clean-current.png`
- Live DOM capture confirmed:
  - `sceneTitle: 表面原因`
  - `headerTitle: 表面原因`
- Screenshot inspection confirmed:
  - the prefix `证词一：` no longer appears in the courtroom title surfaces;
  - the shortened titles fit cleanly in both the top header and the left scene label;
  - no new clipping, overlap, or spacing drift appeared.

Remaining Ace Attorney gap list:
- Keep rewriting testimony-side helper text, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of escalating courtroom pressure.
- Continue screenshot-first QA on dialogue hints, pressure labels, testimony titles, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.

## 2026-06-23 iteration 114 result

Implemented:
- Kept this round narrowed to one courtroom high-frequency label on the right panel meter.
- Changed the meter heading in `game/app.js` from `法庭信誉` to `庭上风向`.
- Left the credibility logic, thresholds, and bar rendering untouched.

Why this round:
- The latest verified courtroom screenshots had already cleaned up the testimony title and footer hint, but the meter heading still read like a visible system term.
- For a normal player, `法庭信誉` is understandable yet still too much like a rules label; `庭上风向` keeps the same gameplay meaning while sounding closer to live courtroom pressure.
- This was a safe small-round target because it is display-only and easy to verify with one fresh trial screenshot.

Verified:
- `git fetch origin main`
- confirmed `HEAD` and `origin/main` both pointed to `e70888c3a77418db3348feead0e69b2801591f46` before this round's commit
- `npm run check:js`
- `git diff --check`
- Used the in-app browser at `http://127.0.0.1:8788/game/` with a reproducible local save snapshot for case 1 court-ready state
- Captured a fresh screenshot:
  - `output/trial-meter-heading-current.png`
- Live DOM capture confirmed the meter now renders as:
  - `庭上风向 / 还压得住`
- Screenshot inspection confirmed:
  - the new heading fits cleanly in the right panel meter;
  - the right panel, statement list, and action buttons stayed aligned;
  - no new clipping, overlap, or layout regression appeared in this pass.

Notes:
- Checked `.gitignore` this round; current screenshot/test artifact rules already covered the generated validation files, so no `.gitignore` change was needed.

Remaining Ace Attorney gap list:
- Keep rewriting testimony-side helper text, evidence summaries, and late-case prompts that still sound like neutral interface metadata instead of escalating courtroom pressure.
- Continue screenshot-first QA on pressure labels, trial headers, statement cards, record drawer entries, and evidence detail panels.
- Do not reopen already-fixed `举证` button, hotspot placement, or desktop no-scroll layout unless a fresh screenshot shows a concrete regression.
