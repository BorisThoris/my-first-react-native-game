# Pass 3: Powers And Action Buttons

## Status
Completed theory recommendation on 2026-05-03.

## Purpose
Make player actions visible, coherent, and expandable without turning the play screen into a pile of buttons.

Pass 5 defined player-facing archetypes. Pass 3 defines how actions should express those archetypes: not by making every build a separate toolbar, but by giving each action clear cost, target, timing, consequence, and build role.

## Current Anchors
- `src/shared/board-powers.ts`
- `src/shared/game.ts`
- `src/renderer/components/GameLeftToolbar.tsx`
- `src/shared/power-verbs.ts`
- `src/shared/mechanics-encyclopedia.ts`

## Recommendation
Use a core dock plus contextual actions model.

- Core dock: common powers that can be used across many floors and builds.
- Contextual actions: phase-specific, card-specific, modal-specific, route-specific, or rare actions.
- Passive resources: do not become buttons unless the player actively spends, targets, or arms them.

This keeps mobile readable while preserving discoverability for the actions that matter most during play.

## Action Taxonomy
| Family | Meaning | Current Examples | Surface |
| --- | --- | --- | --- |
| Immediate | Fires on button press and changes the board now. | Full shuffle, flash pair. | Core dock if broadly useful; contextual if mode-only. |
| Armed tile | Button arms a mode, then the player targets a tile. | Destroy, peek, stray remove. | Core dock, with active state and target preview. |
| Structured target | Button opens/selects a constrained target set. | Row shuffle. | Core dock cluster or popover. |
| Planning | Changes the player's mental map without revealing or resolving. | Pin. | Core dock; Perfect Memory-safe when only marking. |
| Resolve-window | Appears only during a pending resolve state. | Undo, gambit. | Contextual resolve strip, not permanent dock. |
| Card-triggered | Exists because a revealed/interactable card allows it. | Exit, shop, room, lever, future special cards. | On-card prompt or board-adjacent contextual panel. |
| Between-floor | Happens in route, relic, shop, or floor-clear flow. | Route choice, wagers, relic services. | Modal/screen action, not gameplay dock. |
| Passive/resource | Modifies rules or stores value without direct targeting. | Guard, Favor, keys, relic effects, mutators. | HUD/status/tooltip unless actively spent. |

## Current Action Audit
| Action | Family | Role | Cost/Limit | Perfect Impact | Archetype Fit | Placement Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Pin | Planning | Mark remembered tiles without revealing. | Slot cap and possible contract cap. | Allowed. | The Seer, The Warden, The Slayer. | Core dock. Needs stronger success feedback. |
| Peek | Armed tile | Verify one hidden tile or route family. | Charge. | Locks Perfect Memory. | The Seer, The Gambit, The Slayer. | Core dock. Needs target preview and fair-information language. |
| Full shuffle | Immediate | Reset hidden positions when the read is broken. | Charge; contract can disable. | Locks Perfect Memory. | The Saboteur, The Warden. | Core dock. Needs clearer "breaks spatial memory" warning. |
| Row shuffle | Structured target | Local control without losing the whole board. | Charge or first-free relic. | Locks Perfect Memory. | The Saboteur, The Gambit. | Core dock cluster. Good candidate for richer row previews. |
| Destroy | Armed tile | Remove a fully hidden pair for no score. | Charge; contract can disable. | Locks Perfect Memory. | The Saboteur, The Slayer, The Vaultbreaker as anti-synergy. | Core dock. Must always state reward forfeits. |
| Stray remove | Armed tile | Remove one allowed hidden tile to reduce overload. | Charge. | Locks Perfect Memory. | The Seer, The Saboteur. | Core dock for now. Needs clearer fantasy than "cleanup." |
| Flash pair | Immediate | Brief temporary pair reveal. | Charge; mode/path limited. | Locks Perfect Memory. | The Seer, tutorial/practice support. | Contextual or optional dock. Not core unless broadly available. |
| Undo | Resolve-window | Cancel a resolving flip before it commits. | Per-floor use. | Locks Perfect Memory. | The Warden, The Catalyst. | Contextual resolve strip only. |
| Gambit | Resolve-window | Take a third-flip rescue risk. | Per-floor chance. | Locks Perfect Memory. | The Gambit, The Catalyst. | Contextual resolve strip only. |
| Wild match | Card/rule-triggered | Special joker pairing. | Board/rule-dependent. | Locks Perfect Memory. | The Gambit, The Seer. | Board/card prompt, not permanent dock. |
| Exit/shop/room activation | Card-triggered | Use discovered dungeon utility. | Card state and floor rules. | Depends on action. | Vaultbreaker, Slayer, Gambit, Seer. | On-card prompt or contextual panel. |
| Route wager | Between-floor | Risk future objective for Favor. | Streak and route state. | Not a board power by itself. | The Gambit, The Vaultbreaker. | Route/floor-clear screen, not dock. |

## Core Dock Rules
The core dock should hold actions that are:

- usable across many floors,
- understandable as verbs,
- relevant to more than one archetype,
- targetable or spendable during active play,
- important enough that hiding them would hurt learning.

Current core dock candidates:

- Pin.
- Peek.
- Full shuffle.
- Row shuffle.
- Destroy.
- Stray remove.

Conditional dock candidates:

- Flash pair, only when the current mode/run actually grants it often enough.

Do not promote these to permanent dock buttons:

- Undo and gambit; they belong to resolve-window UI.
- Exit, shop, room, lever, and route card actions; they belong to card/context UI.
- Guard, Favor, keys, relic triggers, mutators, and objective streaks; they are resources or rule state until actively spent.

## Light Future-Action Guidelines
The contract is intentionally light for prototypes, but shipping player-facing actions should answer:

- Verb: what does the player think they are doing?
- Timing: when can this be used?
- Target: what does it target, and how is the valid target previewed?
- Cost: what charge, resource, score, reward, objective, or future opportunity is spent?
- Consequence: what happens immediately and what is forfeited?
- Perfect impact: does it lock Perfect Memory or remain safe like pin?
- Archetype role: which build fantasy does it support or pressure?
- Mobile placement: core dock, contextual strip, card prompt, modal, or HUD-only state.

Prototype-only actions may skip polish, but they should still have a temporary disabled reason and a clear dev/test label so they do not leak as confusing player-facing UI.

## Archetype Mapping
| Archetype | Primary Actions | Secondary Actions | Needed Feedback |
| --- | --- | --- | --- |
| The Warden | Pin, undo, guard-adjacent card prompts. | Peek, row shuffle. | Show prevented danger and survival value. |
| The Saboteur | Destroy, row shuffle, full shuffle, stray remove. | Trap/lever card actions. | Show disarm value and reward forfeits. |
| The Vaultbreaker | Shop/room/card prompts, key/lock interactions. | Peek, pin, avoid destroy. | Show extracted value and lost cache value. |
| The Slayer | Banked destroy, peek, pin, boss/elite prompts. | Guard, shard spend, route prep. | Show pre-boss prep and boss payoff. |
| The Gambit | Wagers, gambit, route prompts. | Peek, guard, row shuffle. | Show risk before acceptance and result after. |
| The Seer | Pin, peek, stray remove. | Flash, chapter/route preview. | Show fair information without implying solved board. |
| The Catalyst | Shard spend, gambit, clean-play prompts. | Guard and parasite answer triggers. | Show engine state and why momentum changed. |

## Placement Rules
- Core dock is for repeatable active-play verbs.
- Context strips are for temporary windows such as resolving, targeting, or card activation.
- Modals/screens are for between-floor decisions such as relics, routes, shops, and wagers.
- HUD is for passive resources and warnings.
- Tooltips/teaching panels explain role and cost, but should not be the only place an action's consequence is visible.

## Target Preview Rules
Future action UI should show valid targets before the player commits whenever the target is not obvious.

- Armed tile powers need tile eligibility preview.
- Row shuffle needs row eligibility and cost/free-state preview.
- Destroy needs reward-forfeit preview for findables, route rewards, caches, or special card value.
- Peek needs information scope preview: tile identity, family label, route family, or temporary reveal.
- Stray remove needs invalid-target explanation for decoys, anchors, final wards, and protected route cards.
- Card actions need clear "activate", "claim", "open", "spend key", or "enter shop" language.

## Perfect-Impact Language
The current distinction is good: pin is allowed; most active powers lock Perfect Memory. The presentation should be sharper.

- Button tooltip: short impact line.
- Teaching panel: full rule explanation.
- Floor clear: if a power blocked Perfect Memory, name the first blocker.
- Codex: keep the difference between perfect floor score and Perfect Memory achievement explicit.

Recommended copy pattern:

- Pin: "Perfect Memory-safe."
- Peek/destroy/shuffle/stray/flash/undo/gambit/wild: "Assist used: Perfect Memory locked."
- Destroy: add "No match score; forfeits pickups/rewards on that pair."
- Shuffle: add "Breaks current spatial read."

## Output
Pass 3 recommends a core dock plus contextual actions model. Future action work should improve target previews, consequence copy, perfect-impact visibility, and archetype-aware teaching before adding more permanent buttons.
