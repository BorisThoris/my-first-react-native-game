# HTML UI Layer Redesign Tasks

## UIL-001 Gameplay Chrome Reset
Replace the monolithic gameplay HUD deck with separated top chrome islands.

Acceptance:
- Left island: floor/run identity.
- Center island: score as the strongest visual element.
- Right island: lives, shards, timer/resources.
- Mutators and secondary stats sit in a quieter ribbon.
- Desktop board remains full-bleed behind all chrome.

## UIL-002 Action Dock And Rail System
Normalize gameplay controls as icon-first HTML chrome.

Acceptance:
- Utility actions and board powers are visually grouped.
- Dock does not obscure central cards on initial render.
- Tooltips/flyout labels are readable and do not resize controls.
- Existing `data-testid` hooks remain stable.

## UIL-003 Shared Chrome Primitives
Extract reusable frame/button/status primitives into `src/renderer/ui`.

Acceptance:
- At least gameplay HUD and action dock consume shared primitives or shared CSS tokens.
- New primitives are presentational and do not own game state.
- Focus, hover, disabled, active, and reduced-motion states are defined.

## UIL-004 Overlay Layer Unification
Bring pause, floor clear, relic draft, FTUE, toasts, and transient callouts under one visual z-index model.

Acceptance:
- Modal readability improves on active board backgrounds.
- Inert/focus behavior remains valid.
- Toasts and floaters do not conflict with HUD or dock.

## UIL-005 Meta Surface Rollout
Apply the same HTML chrome language to main menu, choose path, inventory, codex, collection, settings, and game over.

Acceptance:
- Shared visual primitives are reused.
- Meta pages feel like the same product as gameplay.
- Existing navigation and return-view behavior is unchanged unless explicitly planned.

## UIL-006 Evidence And Cleanup
Refresh visual evidence and remove dead one-off styling.

Acceptance:
- Focused unit tests, typecheck, and key Playwright layout tests pass.
- `docs/reference-comparison` and `docs/new_design` references are updated when screenshots are refreshed.
- Legacy CSS that no longer affects reachable markup is deleted.
