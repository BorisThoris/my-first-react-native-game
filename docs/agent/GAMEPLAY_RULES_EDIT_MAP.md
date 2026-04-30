# Gameplay Rules Edit Map

Use focused gameplay rule modules for new work. Avoid importing from `src/shared/game.ts` in new code; it remains as the legacy backing module while the rules layer is being split.

| Task | Edit first | Usually test |
|------|------------|--------------|
| Add or tune a dungeon card, exit, room, trap, boss, objective | `src/shared/dungeon-rules.ts` | `yarn vitest run src/shared/game.test.ts -t "dungeon cards"` |
| Add or tune a board power | `src/shared/board-powers.ts` | `yarn vitest run src/shared/game.test.ts -t "board powers"` |
| Change flip/match/mismatch resolution | `src/shared/turn-resolution.ts` | `yarn vitest run src/shared/game.test.ts -t "game rules|gambit third flip"` |
| Change board generation, findables, fairness, completion | `src/shared/board-generation.ts` | `yarn vitest run src/shared/game.test.ts src/shared/softlock-fairness.test.ts` |
| Change route choices, gateways, side rooms | `src/shared/route-rules.ts` | `yarn vitest run src/shared/game.test.ts -t "REG-017 route choices"` |
| Change shop offers, pricing, rerolls, purchases | `src/shared/shop-rules.ts` | `yarn vitest run src/shared/game.test.ts -t "REG-015 run shop wallet"` |
| Change endless wagers, relic offers, Favor progression | `src/shared/objective-rules.ts` | `yarn vitest run src/shared/game.test.ts -t "endless chapters and featured objectives|relic"` |
| Build deterministic test runs/boards | `src/shared/test/game-fixtures.ts` | Reuse fixtures instead of adding local ad hoc builders |

Default final gate for gameplay rule work:

```powershell
yarn typecheck
yarn test src/shared/game.test.ts
yarn sim:endless --floors=1000 --seed=42001
```

