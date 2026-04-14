# Epic: Game modes and run lifecycle

## Scope

`GameMode`: `endless`, `daily`, `puzzle`, `gauntlet`, `meditation` — plus **flagged** variants that still use `endless` (`practiceMode`, `wildMenuRun`, scholar contract, pin vow, etc.).

## Implementation status

| Mode / entry | Status | Notes |
|--------------|--------|--------|
| Endless / “Classic” | **Shippable** | `startRun`; floor mutator schedule when rules version allows. |
| Daily | **Shippable** | `createDailyRun`; UTC date key; one mutator from daily table; save merge on complete. |
| Puzzle | **Functional** | `BUILTIN_PUZZLES` only (`starter_pairs`, `mirror_craft`); tiny set; see core epic for fixed-board objective gaps. |
| Gauntlet | **Functional** | Run-wide deadline; **5 / 10 / 15** minute starts from main menu; `gauntletSessionDurationMs` preserves preset across **restart**; HUD integrated. |
| Meditation | **Functional** | Longer memorize; calmer framing; optional mutators from menu. |
| Practice / Scholar / Pin Vow / Wild | **Functional** | Use `endless` + flags; separate menu handlers in `App.tsx` / `MainMenu`. |
| Choose Your Path | **Shippable** | Classic + Daily; **“Endless Mode” product card locked** — codex explains future ruleset (`VISUAL_ENDLESS_MODE_LOCKED` in `mechanics-encyclopedia.ts`, re-exported via `game-catalog.ts`). |
| Run export / import | **Functional** | `run-export.ts` v1; Game Over copy; import modal; **restart from import** may not replay identical seed in all branches — edge case. |
| Puzzle import | **Functional** | **Import puzzle JSON** (file picker) → `parsePuzzleImportJson` / `startPuzzleRunFromImport`; ids like `import:…`; in-memory tile cache for **restart** until page reload. Shipping puzzles still live in `builtin-puzzles` — see `docs/PUZZLE_CONTRIBUTING.md`. |

## Rough edges

- **Naming:** “Endless” in code vs “Classic Run” in UI vs locked “Endless Mode” — documented in catalog but still a onboarding hurdle.
- **Import replay:** Treat as **best-effort** until restart paths are unified.

## Primary code

- `src/shared/game.ts` — `createNewRun`, `createDailyRun`, `createPuzzleRun`, `createGauntletRun`, `createMeditationRun`, `createRunFromExportPayload`, etc.
- `src/shared/builtin-puzzles.ts`
- `src/shared/run-export.ts`
- `src/shared/puzzle-import.ts` — JSON validation for user puzzle files
- `src/renderer/App.tsx`, `MainMenu.tsx`, `ChooseYourPathScreen.tsx`, `GameOverScreen.tsx`
- `src/renderer/store/useAppStore.ts` — start/restart/import

## Refinement

**Shippable** for classic/daily/gauntlet/meditation shells and **ad-hoc puzzle JSON** playtests. **Functional** for puzzle library size and export replay guarantees.

## Tasks (polish backlog)

Tracked in rollup: [GAMEPLAY_POLISH_AND_GAPS.md](./GAMEPLAY_POLISH_AND_GAPS.md) §5.

- [x] User-imported puzzle files: **client-side validation** (`parsePuzzleImportJson`) + menu UX; [PUZZLE_CONTRIBUTING.md](../PUZZLE_CONTRIBUTING.md) remains the pipeline for **shipping** builtins.
- [ ] Hardening optional: size limits, copy for “unsaved import,” persistence across reload if product requires it.
- [ ] Unify import/export **restart** paths so “replay from export” matches player expectations (document limits until fixed).
- [ ] UX copy pass: endless vs classic vs locked “Endless Mode” — align menu, codex, and [GAMEPLAY_MECHANICS_CATALOG](./GAMEPLAY_MECHANICS_CATALOG.md) terminology.
- [ ] Set target for puzzle library size (or document v1 scope vs backlog).
