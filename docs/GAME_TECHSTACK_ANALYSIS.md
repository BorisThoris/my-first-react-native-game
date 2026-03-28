# Memory Dungeon: Game and Tech Stack Analysis

_Analyzed from the current source tree on 2026-03-28. This document describes the implemented project, not just the aspirational design docs in `game.md` and `technical.md`._

## Executive Summary

This project is a cross-platform memory game called **Memory Dungeon**. Its core idea is strong: combine a classic memory/tile-matching loop with procedural dungeon progression, special rooms, collectible rewards, and lightweight roguelike run structure.

In its current form, the game is already more than a prototype. It has:

- a playable dungeon loop,
- procedural floor and room generation,
- multiple room types,
- multiple memory minigame variants,
- a reward/inventory/progression layer,
- helper abilities tied to streaks,
- Android and web support through Expo.

The main limitation is not lack of features, but **system divergence**. The project currently contains multiple overlapping type systems and reward models (`gameTypes`, `itemTypes`, `collectibleTypes`), and the implementation is split between older gameplay code and newer data-rich systems. The result is a codebase with solid direction and a lot of content scaffolding, but with meaningful integration debt.

## What the Game Is Right Now

### Genre and Core Fantasy

The game is a **single-player roguelike memory game**. The player explores a dungeon floor by floor, selects rooms from a dungeon map, completes memory challenges, earns points and collectibles, and tries to survive long enough to reach new floors.

There is no combat system, narrative campaign, or backend-driven metagame at the moment. The "roguelike" structure comes from:

- procedural room generation,
- floor advancement,
- room variety,
- one-run state,
- limited lives,
- resource use through keys, bombs, points, and helper abilities,
- rewards that shape the run.

### Current Gameplay Loop

The playable loop is:

1. Start a new run.
2. Generate floor 1.
3. View the dungeon map and choose an available room.
4. Complete a memory challenge or special room interaction.
5. Gain points, streak progress, helpers, and sometimes collectibles.
6. Clear the boss room to generate the next floor.
7. Continue until defeat or victory.

This is already a usable core loop, although the surrounding systems are at different levels of completeness.

### Room Types Implemented

The project defines these room types:

- `memory-chamber`
- `boss`
- `treasure`
- `trap`
- `shop`
- `secret`
- `curse`
- `challenge`
- `library`
- `cursed-room`
- `devil-room`
- `angel-room`

What is meaningfully implemented today:

- `memory-chamber`: standard memory gameplay
- `boss`: larger/harder memory room
- `treasure`: memory room with item reward
- `shop`: item purchase screen
- `secret`: memory room with item/key/bomb rewards
- `challenge`: timed memory room with better rewards
- `library`: memory room followed by choosing a knowledge-themed reward
- `devil-room`: memory room that unlocks a life-for-power trade
- `angel-room`: memory room that unlocks a free blessing

What is mostly declared but not fully realized:

- `trap`
- `curse`
- `cursed-room`

### Memory Minigames Implemented

The game supports five minigame types:

- `classic-pairs`
- `sequence-memory`
- `pattern-memory`
- `color-memory`
- `number-memory`

This is a real design strength. The room generator can assign different minigame types based on room type and difficulty, which gives the project a broader design ceiling than a pure matching game.

That said, the integration is uneven:

- `ClassicPairs` is the most fully integrated with room tile state, matching logic, streaks, lives, and cheat preview.
- `SequenceMemory`, `PatternMemory`, `ColorMemory`, and `NumberMemory` exist and are playable, but they are much more self-contained and do not integrate as deeply with the broader run systems.
- Some helper and timer interactions are clearly intended for these modes but are not fully wired through the component boundaries.

## Architecture Overview

### App Shell and Navigation

The project uses **Expo Router** as the main app entry (`package.json` sets `main` to `expo-router/entry`), with routes under `app/`.

Main routes:

- `app/index.tsx`
- `app/DungeonExplorer/index.tsx`
- `app/three/index.tsx`

There is also a **custom web entry path**:

- `web/index.js`
- `App.js`

This creates an important architectural wrinkle:

- native appears to rely on Expo Router,
- web also has a direct `GameController` entry via `App.js`,
- there is now duplicated responsibility for app bootstrapping.

This is functional as an experiment, but it increases maintenance cost and already contributes to one of the current TypeScript path/casing issues.

### State Management

The project uses **Zustand** with two main stores:

- `stores/dungeonStore.ts`
- `stores/gameStore.ts`

Their responsibilities are well separated conceptually:

- `dungeonStore` manages run structure: floors, rooms, entry/exit, room completion, floor generation, and map-level interactives.
- `gameStore` manages room gameplay and player state: lives, points, streak, tile state, helpers, inventory-ish data, shop items, and consumable/resource counts.

This split is one of the codebase's better architectural decisions. The problem is not store ownership, but type consistency inside and between the stores.

### UI Composition

The main controller is `app/DungeonExplorer/GameController.tsx`.

It switches between:

- `components/dungeon/DungeonMap.tsx` while exploring
- `components/dungeon/RoomView.tsx` or `components/dungeon/special/*` while inside a room

Persistent overlays/panels include:

- `components/ui/PlayerStats.tsx`
- `components/debug/DebugPanel.tsx`
- `components/ui/StreakCelebration.tsx`
- `components/inventory/InventoryScreen.tsx`
- `components/progression/ProgressionScreen.tsx`

This means the project already has a real "game shell", not just isolated screens.

## Core Gameplay Systems

### 1. Dungeon Generation

Floor generation is handled by `algorithms/dungeonGenerator.ts`.

Current behavior:

- room count scales upward by floor,
- each floor starts with at least one memory chamber,
- special rooms may be inserted,
- each floor ends with a boss room,
- clearing the boss generates the next floor.

This is a clean and scalable starting structure. It is closer to a room-select roguelike map than a spatial dungeon crawler, but that fits the project's memory-first design.

### 2. Room Generation

`algorithms/roomGenerator.ts` builds individual rooms:

- chooses grid size from room type and difficulty,
- creates tile pairs,
- shuffles tiles,
- sets room metadata,
- assigns a memory minigame type.

This file is important because it contains the project's main difficulty model:

- larger grids,
- room-specific symbol pools,
- different minigame selection by difficulty.

The design intent here is strong. It gives the project a good content scaling backbone.

### 3. Special Room Generation

`algorithms/specialRoomGenerator.ts` defines:

- weighted special room probabilities,
- minimum-floor rules,
- simple requirements based on keys, bombs, and completed rooms,
- special room reward payloads,
- room-specific properties like timed challenges and devil/angel offers.

This system is ambitious and points toward a richer roguelike structure. The main issue is that it is only partially synchronized with actual runtime state and reward application.

### 4. Tile Matching and Room State

Classic room state is handled across:

- `hooks/useRoomState.ts`
- `hooks/useTileMatching.ts`
- `utils/roomState.ts`
- `utils/tileMatching.ts`
- `components/memory/TileGrid.tsx`
- `components/memory/Tile.tsx`

The flow is straightforward:

- room tiles load into `gameStore`,
- flipped and matched tiles are tracked in store state,
- match checks affect lives, points, and streak,
- room state can be saved back into the dungeon room object.

This is one of the most coherent gameplay paths in the codebase.

### 5. Helpers and Streak Economy

The helper system is a notable differentiator.

Helpers include:

- extra life
- tile flip
- hint
- time extension

They are unlocked or granted by streak milestones and room completion thresholds. The helper UI is in `components/ui/HelperPanel.tsx`, and room-specific helper rules come from `utils/helperConfig.ts`.

This is a good idea because it gives the memory gameplay a layer of tactical recovery and reward for strong play.

Current caveat:

- some helpers are visually/UI integrated better than they are mechanically integrated,
- time extension especially is only partially connected to room-specific timers.

### 6. Rewards, Inventory, and Progression

The game has **two overlapping reward stacks**:

1. an older item/shop model built around `types/itemTypes.ts` and `data/itemDatabase.ts`
2. a newer collectible model built around `types/collectibleTypes.ts` and the `collectibleDatabase`, `acquisitionSystem`, `shopSystem`, and `progressionSystem`

This second system is far more ambitious and includes:

- items
- consumables
- equipment
- trinkets
- abilities
- skills
- tomes
- relics
- milestone progression
- richer shop generation

From a game-design perspective, this is excellent groundwork. From an engineering perspective, it is the largest source of structural complexity in the repo.

## Tech Stack Analysis

| Layer | Current Stack |
| --- | --- |
| UI runtime | React 18 |
| Native framework | React Native 0.74.5 |
| App platform | Expo SDK 51 |
| Navigation | Expo Router 3 |
| State | Zustand 5 |
| Web target | React Native Web |
| Native platform checked in | Android |
| Desktop ambition | Electron scripts and builder config |
| Language mix | TypeScript + JavaScript |
| Linting | ESLint 9 + Prettier |
| Tests | Jest preset configured, but no actual tests found |

### Frontend Stack

The project is fundamentally a **frontend-only game client**. There is:

- no backend,
- no API layer,
- no online storage,
- no authentication,
- no analytics service,
- no multiplayer infrastructure.

That means the current app is best understood as a local/offline game shell.

### Cross-Platform Strategy

The project is targeting:

- Android
- web
- Electron/desktop (at least conceptually)

This is a reasonable fit for Expo and React Native Web, but the multi-platform surface is ahead of its operational maturity:

- Android is scaffolded and plausible.
- Web is present, but the entry architecture is split.
- Electron is referenced in scripts, but `main.js` is not present in the repo.
- The Three.js demo route references packages not declared in `package.json`.

### Tooling

TypeScript is configured in strict mode, which is a good choice. The problem is that the codebase currently does not satisfy it.

ESLint and Prettier are configured, but the ESLint config primarily targets `js/jsx`, so it does not give strong coverage over the actual `ts/tsx` gameplay code.

Jest is configured through `jest-expo`, but there are no test files in the repository.

## Strengths

### Strong Core Concept

The game idea is clear, differentiated, and easy to expand. "Roguelike memory dungeon" is a better design hook than a generic memory game.

### Good Store Separation

Separating run/dungeon state from room/gameplay state is the right architectural move. That makes future persistence and debugging easier.

### Broad Content Foundation

The project already contains:

- multiple room types,
- multiple minigame types,
- helper mechanics,
- special-room reward flows,
- a deep collectible system design.

That is a strong content foundation for continued development.

### Source Layout Is Understandable

The repo structure is fairly intuitive:

- `app/` for routing and controller entry
- `components/` for UI/gameplay units
- `stores/` for state
- `algorithms/` for generation logic
- `data/` for content definitions
- `types/` for domain models

This makes the project easy to reason about despite the model drift.

## Current Gaps and Risks

### 1. The Domain Model Is Split Across Multiple Systems

This is the single biggest technical issue.

There are overlapping definitions for:

- player stats,
- items,
- rewards,
- effects,
- shop items,
- collectible acquisition.

Key symptom:

- the store logic still mixes old item shapes and newer collectible shapes,
- some code expects `effect`,
- some expects `effects`,
- some expects `Partial<PlayerStats>`,
- some expects arrays of structured effect objects.

This is why the current TypeScript run fails in so many places.

### 2. The "Rich" Collectible Layer Is Not Fully Integrated Into Gameplay

The collectible, acquisition, shop, and progression systems are much more sophisticated than the main run loop currently uses.

At runtime, the game still relies heavily on simpler item flows:

- special rooms mostly use `itemDatabase`,
- `GameController` initializes shop items via `initializeShopItems`,
- `useItemEffects` is a placeholder hook with no implementation,
- many collectible effects are defined but not actually applied to gameplay.

This means the data layer is ahead of the actual mechanics.

### 3. Player UI and Run State Are Not Fully Synchronized

Examples from the current code:

- `PlayerStats` displays `playerStats.currentFloor`, but floor advancement is tracked in `dungeonStore`, not clearly synchronized back to `gameStore`.
- `PlayerStats` displays `playerStats.totalScore`, but the store tracks `points`, not `totalScore`.

So some HUD values are conceptually correct but technically out of sync or invalid.

### 4. The Interactive Map System Is Only Partially Alive

The project includes:

- interactive generation,
- interactive types,
- interactive UI,
- resource-gated interactions with keys and bombs.

But currently:

- generated interactives start hidden,
- hidden interactives are not rendered,
- later floors do not appear to generate new interactive sets,
- rewarded item IDs are logged rather than resolved into actual inventory items.

So the system exists architecturally, but not yet as a fully visible game feature.

### 5. Some Platform Paths Are Experimental or Incomplete

Examples:

- the web entry path is split between Expo Router and a custom `App.js` loader,
- the Three.js route imports `expo-gl`, `expo-three`, and `three`, but these are not listed in dependencies,
- Electron scripts reference `main.js`, which is not present.

This suggests the repo is carrying several platform experiments simultaneously.

### 6. The Codebase Does Not Currently Type-Check

Running `npx tsc --noEmit` fails across multiple categories:

- room generator typing
- collectible/item type mismatches
- duplicate store keys
- missing Three.js dependencies/types
- invalid UI property references
- enum/category mismatches
- web/App casing conflict

This confirms that the implementation drift is not just stylistic; it is structurally real.

### 7. Testing and Validation Are Minimal

There are currently no tests in the repo, despite Jest being configured.

`yarn lint` currently fails only on CRLF formatting in the JS entry files, but that result is misleading because the ESLint setup does not deeply validate the TypeScript-heavy gameplay code.

## Source-of-Truth Assessment

The repo currently has three different "truth layers":

1. **Design truth**: `game.md`, `technical.md`, and `docs/COLLECTIBLE_SYSTEM.md`
2. **Runtime truth**: the actual React components, stores, and algorithms
3. **Type truth**: the TypeScript model across `types/`

Right now, those layers do not fully agree.

The runtime game is closer to:

- a playable dungeon memory game,
- with selectively integrated special rooms,
- and a much larger future-facing collectible/progression design sitting beside it.

That is not a bad place to be, but it does mean the project needs consolidation more than raw feature addition.

## Recommended Technical Priorities

### 1. Choose One Canonical Data Model

Unify:

- `types/gameTypes.ts`
- `types/itemTypes.ts`
- `types/collectibleTypes.ts`

The project needs one authoritative definition for:

- player stats,
- inventory items,
- effects,
- shop items,
- reward application.

### 2. Make the Current Game Compile Cleanly

Before adding more content, get `npx tsc --noEmit` to zero errors. This will force alignment across:

- stores,
- room generators,
- special rooms,
- UI expectations,
- platform entry files.

### 3. Decide What the Real Platform Surface Is

Pick a clear direction for:

- Expo Router vs custom web entry
- whether the Three.js route is supported
- whether Electron is actually a target right now

If a path is experimental, isolate it or remove it until it is ready.

### 4. Finish One Reward/Progression Pipeline End to End

The repo should not keep both a basic and advanced collectible system partially active forever.

The best next step is:

- use one shop system,
- use one acquisition flow,
- use one item effect application path,
- make special rooms feed the same reward pipeline.

### 5. Add Persistence

For a roguelike structure, save/load is high leverage. The current project already has enough state complexity that persistence would meaningfully improve both player experience and architecture discipline.

### 6. Add Targeted Tests

The highest-value first tests would be:

- floor generation
- special-room eligibility
- room completion reward application
- `gameStore` matching/streak/life logic

## Verification Snapshot

The analysis above was checked against the current code and these commands:

### `yarn lint`

Result:

- fails on formatting only in `App.js` and `web/index.js`
- does not provide deep confidence for the TypeScript gameplay code

### `npx tsc --noEmit`

Result:

- fails with many type errors across stores, generation algorithms, special rooms, the collectible system, and platform-specific files

Conclusion:

- the project is **feature-rich but structurally inconsistent**
- the next major engineering win is consolidation, not more surface area

## Final Assessment

This is a promising and genuinely interesting game project.

From a **game-design** perspective, it already has a compelling loop and a strong expansion path.

From a **software-engineering** perspective, it is in the classic middle state where the project grew faster than its domain model. The codebase is no longer a toy, but it needs unification work before the more ambitious systems can pay off cleanly.

If the next phase focuses on:

- model consolidation,
- compile health,
- one coherent reward pipeline,
- and a clearer platform target,

then this project can move from "large prototype with good ideas" to "stable game foundation with room to scale."
