# Settings: reference controls vs live model

## Purpose
Satisfy [TASK-015](TASKS/TASK-015-settings-schema-for-reference-controls.md): every control shown in reference comps is classified as **implemented**, **deferred (honest UI)**, or **out of scope**.

## Live `Settings` fields (summary)
See `src/shared/contracts.ts` and `DEFAULT_SETTINGS` in `src/shared/save-data.ts`. Live controls include volumes, display mode, UI scale, reduce motion, board presentation, resolve delay, shuffle strength, focus assist, echo feedback, distraction channel, shuffle score tax, debug flags, etc.

## Reference-only rows (UI today)
Rendered under **Settings → Controls → “Future tuning (not wired)”** in `SettingsScreen.tsx`:

| Control (reference) | Live behavior | Notes |
|---------------------|---------------|--------|
| Difficulty | Disabled placeholder buttons | Copy states no live setting; balance curve is fixed. |
| Timer Mode | Disabled placeholder | Not connected to save or rules. |
| Max Lives | Disabled placeholder | Lives follow game rules (`MAX_LIVES` etc.). |
| Card Theme | Disabled placeholder | Asset slots only; no theme picker in schema. |

## Honesty rule
If a future build wires any of the above, add the field to `Settings`, migrate save data, and **remove** the disabled placeholder row for that control.

## Related
- [CURRENT_VS_TARGET_GAP_ANALYSIS.md](CURRENT_VS_TARGET_GAP_ANALYSIS.md) — Settings mapping
- [TASK-006](TASKS/TASK-006-settings-shell.md) — shell landed
