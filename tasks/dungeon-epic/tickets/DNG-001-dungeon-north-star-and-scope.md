# DNG-001: Dungeon north star and scope

## Status
Done

## Priority
P0

## Subsystem
Foundation and contracts

## Depends on
- `tasks/dungeon-epic/README.md`
- `tasks/refined-experience-gaps/REG-068-complete-product-definition-of-done.md`

## Current repo context
Dungeon systems already exist across board generation, route nodes, shops, rooms, events, relics, objectives, and enemy hazards. The missing piece is a single implementation scope that prevents every future ticket from redefining what a "complete dungeon experience" means.

## Problem
Without a locked north star, future runs can overbuild one subsystem while leaving the end-to-end run shallow or inconsistent.

## Target experience
The player experiences a readable offline dungeon descent: route decisions, encounter floors, enemies, traps, rooms, rewards, bosses, and post-run history form one coherent loop.

## Implementation notes
- Convert `README.md` and `01-experience-pillars.md` into source-of-truth project language.
- Add cross-links from relevant tickets when work starts.
- Keep online services out of scope unless explicitly delegated to `REG-052`.

## Execution rules
- Treat `tasks/dungeon-epic/README.md`, `01-experience-pillars.md`, and `04-balance-and-invariants.md` as the dungeon epic source of truth.
- Keep implementation local/offline-first; no future dungeon ticket may require mandatory online services.
- Preserve deterministic rules. Any generation, scoring, combat, or route behavior change must decide whether `GAME_RULES_VERSION` is affected.
- Keep the board as the primary dungeon encounter surface. Menus, overlays, and Codex support the board instead of replacing it.
- Do not require final licensed art/audio to complete gameplay tickets; use placeholder contracts and follow `REG-113`.
- Before adding new state fields, cite `05-state-contract-audit.md` and decide owner/lifecycle/persistence/test coverage.
- Before adding new mechanics, check completion and softlock risk through `DNG-005`.

## Acceptance criteria
- Scope boundaries are cited in each new DNG ticket touched by future work.
- No ticket requires final licensed art or online services.
- The epic has a clear "done" bar that can be tested through local play.

## Tests and verification
- Markdown link check by manual review or script if available.
- Future implementation tickets cite this file in their cross-links.

## Risks and edge cases
- Risk: scope grows into a full new game. Mitigation: enforce ticket-level acceptance and ledger updates.

## Cross-links
- `../README.md`
- `../01-experience-pillars.md`
- `../../refined-experience-gaps/REG-052-leaderboards-trust-model-and-online-deferral.md`

## Future handoff notes
Treat this as the first file to reread before large mechanics changes. `DNG-001` is complete as a scope-locking ticket; future work should cite it rather than reopening it unless product scope changes.
