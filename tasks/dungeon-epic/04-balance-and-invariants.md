# Dungeon Balance And Invariants

## Determinism
- Any floor-generation change must be seeded by existing run seed/rules version inputs.
- Any new RNG domain must use a named seed string and be covered by deterministic repeat tests.
- Route, node, board, enemy, reward, and event choices must be reproducible locally.

## Completion Rules
- `isBoardComplete` remains the source of truth for board completion.
- Completion must ignore resolved utility singletons as appropriate and preserve special decoy rules.
- Floor-clear cleanup may mark remaining hazards defeated, but must not create extra unearned score unless explicitly designed.
- Exit gating must remain explicit through `dungeonExitActivated`, keys, levers, or objective status.

## Softlock Rules
- Every generated real pair must be clearable by match, wild route, or explicit removal.
- No objective may require a tile that can be removed before the objective observes it unless the removal is a valid completion path.
- Enemy, trap, shuffle, and destroy effects must not orphan single tiles.
- Locked exits must always have a reachable key/lever/master-key route or a clear locked-state explanation.

## Economy Boundaries
- Rewards must support progression without requiring perfect play.
- Shops/rest/services must be useful without becoming mandatory.
- Boss/elite rewards should feel meaningful but not dominate every build.
- Any new currency sink/source needs balance simulation coverage.

## Rules Versioning
- Bump `GAME_RULES_VERSION` when generation, scoring, or resolution behavior changes in a replay-affecting way.
- Bump save/schema version only when persisted shape changes.
- Add migration tests for any persisted field changes.

## UI And Accessibility
- Every shipped dungeon mechanic needs player-facing copy in the board/HUD/Codex path.
- Visual telegraphs need non-color-only cues.
- Reduced motion must preserve information.
- Mobile and controller paths must be accepted, not treated as secondary.

## Forbidden Patterns
- Hidden lethal mechanics with no prior readable rule.
- Random effects that cannot be replayed from seed.
- Mechanics that require online validation.
- Board effects that mutate state outside the shared rules layer.
- UI-only objective completion.

