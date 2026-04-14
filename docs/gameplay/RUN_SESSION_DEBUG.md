# Run session: timers and debugging

**Audience:** engineers debugging “wrong phase,” pause, or HUD countdown quirks.

## Model

- **Pure rules** (`src/shared/game.ts`): `RunStatus`, `finishMemorizePhase`, `pauseRun`, `resumeRun`, `resolveBoardTurn`, etc.
- **Wall-clock** (`src/renderer/store/useAppStore.ts`): schedules `setInterval` / `requestAnimationFrame` style updates that decrement `timerState.memorizeRemainingMs`, `resolveRemainingMs`, and compare `gauntletDeadlineMs` to `Date.now()`.

When investigating desync, inspect **both**: the `run` object after a `game.ts` transition and the store’s timer fields **after** the next tick.

## Gauntlet expiry

Checked on `pressTile` and via a **short interval** while gauntlet is active (see `useAppStore` subscription). If the HUD shows time left but the run ends, compare `gauntletDeadlineMs` with the store interval path.

**Restart:** `createGauntletRun` uses `gauntletSessionDurationMs` from the previous run (fallback **10 minutes**) so **5 / 10 / 15** menu presets survive **Restart run**.

## Undo

`cancelResolvingWithUndo` is authoritative in `game.ts`; the toolbar shows `undoUsesThisFloor`. Rapid presses should be bounded by sim guards—if not, capture a replay with `run` + timer state.
