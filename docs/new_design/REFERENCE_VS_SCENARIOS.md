# Reference panels vs Playwright visual scenarios

Maps major **reference still** areas to **`e2e/visualScenarioSteps.ts`** scenarios (fileBase / capture name). Reference filenames assume `docs/ENDPRODUCTIMAGE*.png` match the product’s final mockups.

| Reference area (typical still) | Scenario `name` | `fileBase` prefix |
|-------------------------------|-------------------|-------------------|
| Startup / relic intro overlay | startup intro visible | `00-startup-intro` |
| Main menu hero + CTAs | main menu | `01-main-menu` |
| Choose Your Path / mode cards | choose your path | `01a-choose-your-path` |
| Collection | collection screen | `01b-collection` |
| Inventory (no run) | inventory with no active run | `01c-inventory-empty` |
| Inventory (in run) | inventory during a run | `01d-inventory-active` |
| Codex (in run) | codex during a run | `01e-codex` |
| Main menu + How To Play | main menu with How To Play | `02-main-menu-howto` |
| Settings shell | settings page | `03-settings-page` |
| Level 1 board + HUD | game playing (level 1) | `04-game-playing` |
| Pause modal | pause modal | `05-pause-modal` |
| Run settings modal | run settings modal (in-game) | `06-run-settings-modal` |
| Floor cleared | floor cleared modal | `07-floor-cleared-modal` |
| Game over | game over screen | `08-game-over` |

## Viewports
Scenarios run per project in `e2e/visual-screens.mobile.spec.ts` and `e2e/visual-screens.standard.spec.ts` (see `MOBILE_VISUAL_VIEWPORTS` and `STANDARD_VISUAL_VIEWPORTS` in `e2e/visualScreenHelpers.ts`).

## Gaps
- Reference **profile / social strips** have no dedicated scenario; see TASK-016 / TASK-017 and [CURRENT_VS_TARGET_GAP_ANALYSIS.md](CURRENT_VS_TARGET_GAP_ANALYSIS.md).
- **Pixel diff automation** is out of scope unless the team adds a separate tool.
