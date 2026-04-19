# Tasks: Meta screens & shell chrome (`META-*`)

**Sweep (P2/P3):** META-002 Game Over cathedral plate; META-004–007 in-page TOC + anchors on Codex / Collection / Inventory + catalog IA table.

**Research pass:** Parallel audit of `MainMenu`, `ChooseYourPathScreen`, `SettingsScreen`, `GameOverScreen`, `CodexScreen`, `InventoryScreen`, `CollectionScreen`, `MetaScreen`, `OverlayModal` usage patterns, `StartupIntro`, `MainMenuBackground` (Pixi), `Panel` / `UiButton` — excluding `GameScreen` / `TileBoard` internals.

**Finding:** Strong environment on **MainMenu** (Pixi + scene PNG) and **mode posters** on Choose Path; **Codex / Collection / Inventory / Choose Path** use **`.shellMetaStage`** dim wash (**`META-001`**); **page Settings** uses modal shell; **GameOver** uses Pixi + scrim but no hero plate like MainMenu; **OverlayModal** is shared chrome for pause / floor / relic.

**Cross-links:** `TASKS_OVERLAYS_FTUE.md` (OVR-001–003 overlap META-009), `TASKS_SIDEBAR_PARITY.md`, `PLAYING_ENDPRODUCT/README.md` (in-`GameScreen` `PLAY-*` vs `ENDPRODUCTIMAGE.png`), `CURRENT_VS_TARGET_GAP_ANALYSIS.md` (main menu / mode select / profile–social deferrals), `TASK-018` (mode poster art).

**REF-015 (partial, 2026):** Menu-path **Inventory** relic/mutator bands now share **`MetaScreen.module.css`** catalog row tokens (`.archiveCatalogRow` / `.archiveCatalogGrid`) and **`MetaFrame`** framing with **Collection**’s archive language; full **META-006** / **META-007** (tier art, slot grid, charge pips) remains separate backlog.

---

## Task table

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| META-002 | P0 | GameOver scene parity | Reuse or add defeat/archive plate like MainMenu depth. | Visual review vs ENDPRODUCT; `ASSET_SOURCES` if new file. | — |
| META-003 | P0 | Meta frame system | SVG/9-slice or `MetaFrame` wrapper for “forged gold” meta surfaces without forking `Panel` forever. | Spec in COMPONENT_CATALOG; used on ≥1 screen. | — |
| META-004 | P1 | MainMenu illustrated CTAs | Card/poster thumbnails for primary nav (Play, Collection, …) where IA allows. | Matches mode-card language; responsive. | META-001, art |
| META-005 | P1 | Codex chrome + IA | **Done:** Tab rail (All / Guides / Tables) + filtered TOC + in-page anchors; filter + `<details>` sections (`CodexScreen`). | Keyboard: tab buttons + TOC links. | META-003 |
| META-006 | P1 | Collection tier visuals | Locked/unlocked art, medallions beyond CSS boxes. | Performance OK on large lists. | META-003 |
| META-007 | P1 | Inventory loadout board | Slot grid, relic icons, charge pips; empty state illustration from menu. | Menu + in-run paths. | META-003 |
| META-008 | P1 | Settings page atmosphere | Sidebar/header ornament without hurting density. | Modal + page modes consistent. | META-003 |
| META-009 | P1 | OverlayModal fantasy pass | Distinct treatments pause vs relic vs floor clear (see also OVR-002). | a11y preserved. | META-003, OVR-010 |
| META-010 | P2 | In-game Codex/Inventory framing | **Done:** “Desk/grimoire” shell — `App.tsx` wraps in-run Codex/Inventory in `modalOverlayDesk` + `modalInnerDesk` (`MetaScreen.module.css`); `shellInRunModal` clears redundant wash; Codex `data-codex-context` + `.codexInRunShell` cue. | Z-index 22 on overlay only (OVR-008). | META-001, META-003 |
| META-011 | P2 | ChooseYourPath polish | Stronger card frames, hover gilt, typography lockup; **Classic** stats row (best score / best floor numerals vs reference). | Visual + mobile crop. | META-003 |
| META-012 | P2 | MainMenu meta strip | **Done:** `MetaFrame` + gold-rim plate on Build / Best / Daily / Steam row (`MainMenu.module.css` `.metaPlaqueFrame`). | Copy + design sign-off. | META-003 |
| META-013 | P2 | StartupIntro → menu handoff | Color/motion curve matches first MainMenu frame. | reduceMotion path. | META-004 opt |
| META-014 | P2 | WIP asset graduation | Process: `wip/EndproductWipSvgs.tsx` → `UI_ART` / naming. | `ASSET_SOURCES` + checklist. | Art |
| META-015 | P2 | Meta motion contract | Document reduce-motion for tilt, Panel blur, intro. | Single doc section. | — |
| META-016 | P2 | Meta visual e2e | Scenarios: menu, mode select, codex/inventory over gameplay, settings modal, pause. | CI or documented manual matrix. | harness |

---

## Split option (META-009)

For finer tracking: **META-009a** pause, **META-009b** relic, **META-009c** floor cleared — each with own screenshot baseline.
