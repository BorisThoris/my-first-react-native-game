# Ideas audits & shortlists (Wave 0 specs)

## Assist economy (research)

**Current knobs:** shuffle charges, destroy bank (clean floors), pins (3), grace first miss, guards, shards → life.  
**Update (Phase H shipped):** **Peek** (charged, playing-only, no flips open), **undo** (one/floor, only while `resolving` before the timer), **gambit** third flip, and **wild** joker are implemented behind the same power bar / menu flows; all set `powersUsedThisRun` where applicable so perfect-clear achievements stay honest.  
**Not adding (creep guard):** unlimited hints, deep per-flip undo stacks, paid shuffle refresh mid-floor.

## Rule variants (one-pager)

**In scope:** single flip phase, two tiles face-up resolve, pairs remove — standard concentration roguelite hybrid.  
**Out of scope for now:** alternating single-flip turns, two-deck modes, PvP simultaneous flip. Mark “future mode” if prototypes appear.

## Mutators v1 shortlist (locked)

Daily seed → deterministic mutator index → table in `mutators.ts`. First three shipped mutators: **glass_floor**, **sticky_fingers**, **score_parasite**; plus **category_letters**, **short_memorize** for variety.

## Undo vs ghost

**Ghost:** `flipHistory` + flip count on game over + collapsible **flip timeline** on the game-over screen.  
**Undo:** one cancel per floor during the resolve window only; still marks `powersUsedThisRun` when used so it cannot silently preserve perfect-clear runs.

## Power UI

Ship **horizontal icon bar** (shuffle / pin / destroy) in `GameScreen`. Radial / OBSIDIAN-style menu deferred until mobile playtest demands it.
