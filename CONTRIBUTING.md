# Contributing

Use **Node 22.x**; match [`.node-version`](./.node-version) when you can. Project `engines` and [`.yarnrc`](./.yarnrc) are set so you do not need `YARN_IGNORE_ENGINES` in your shell for normal Yarn commands.

## Mechanics encyclopedia & Codex

Player-facing reference copy for relics, mutators, modes, and Codex articles lives in **`src/shared/mechanics-encyclopedia.ts`**. The UI imports it through **`src/shared/game-catalog.ts`** (barrel) alongside achievements.

When you change gameplay in a way players should see in the Codex:

1. Add or update entries in **`mechanics-encyclopedia.ts`** (including new **`RelicId`** / **`MutatorId`** keys in the catalogs — TypeScript enforces completeness).
2. Bump **`ENCYCLOPEDIA_VERSION`** when the text set meaningfully changes (adds, removals, rewrites).
3. Run **`yarn typecheck`** and **`yarn test`**.

4. Regenerate the mechanics catalog machine snapshot: **`yarn docs:mechanics-appendix`** (updates `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.auto-appendix.md`).

Optional: extend **`src/shared/mechanics-encyclopedia.test.ts`** if you add new topic arrays that must keep unique `id`s.
