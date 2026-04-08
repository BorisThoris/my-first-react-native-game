# Gameplay tasks: mode tweaks

Source: [M-01–M-03](../gameplay-depth/05-app-specific-idea-backlog.md#m--mode-tweaks)

---

## GP-M01 — Daily mutator variety

### Status
Backlog

### Priority
Medium

### Objective
Expand or rotate `DAILY_MUTATOR_TABLE` so dailies are not limited to the same three ids forever; keep **determinism** from date/seed.

### Spec reference
Backlog **M-01**.

### Affected areas
- `src/shared/mutators.ts` — `DAILY_MUTATOR_TABLE`.
- `src/shared/rng.ts` — `deriveDailyMutatorIndex` if table length or weekly rotation changes.
- `createDailyRun` in `game.ts`.
- Tests: same date → same mutator; `GameScreen` daily label still correct.

### Acceptance criteria
- Document policy: expanded table vs weekly subset.
- No duplicate mutator pick if table grows and algorithm changes.

### Dependencies
None.

### Out of scope
Multiple mutators per daily (separate task if desired).

---

## GP-M02 — Wild run mutator pack

### Status
Backlog

### Priority
Low

### Objective
`createWildRun` passes a non-empty `activeMutators` array so Wild mode is **rules-dense** on top of wild joker / stray charges.

### Spec reference
Backlog **M-02**.

### Affected areas
- `src/shared/game.ts` — `createWildRun`.
- Balance pass: avoid unwinnable gen with wild + sticky + short memorize (playtest).

### Acceptance criteria
- Wild start uses agreed mutator list; documented in `MUTATORS.md` or Wild mode doc.
- Achievements / practice flags unchanged unless product says otherwise.

### Dependencies
None (orthogonal to GP-F01).

### Out of scope
Player-selectable wild mutator mix (could be follow-up).

---

## GP-M03 — Meditation: pick focus mutator

### Status
Backlog

### Priority
Low

### Objective
Before starting meditation run, UI offers **one** mutator for the session (`CreateRunOptions.activeMutators`).

### Spec reference
Backlog **M-03**.

### Affected areas
- `src/renderer/store/useAppStore.ts` — `startMeditationRun` flow (or new thunk).
- Mode select / meditation entry UI component.
- `createMeditationRun` signature options if needed.

### Acceptance criteria
- Chosen mutator appears in HUD and export payload.
- Cancel/back returns without mutating save incorrectly.

### Dependencies
UI shell from meta tasks (coordinate with `docs/new_design/TASKS/` if modal reuse needed).

### Out of scope
Full meditation curriculum or lesson content.
