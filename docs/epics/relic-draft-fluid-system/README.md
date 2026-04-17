# Epic: Relic draft fluid system

End-to-end milestone relic selection: **Borderlands-style rarity visuals** (color/glow, no on-card rarity words), **Noita-style multi-pick** (optional extra selections per shrine visit with deterministic rerolls), and **pluggable bonus-pick hooks**.

## Code map

| Area | Files |
|------|--------|
| Draft weights & RNG | [`src/shared/relics.ts`](../../../src/shared/relics.ts), [`src/shared/weightedPick.ts`](../../../src/shared/weightedPick.ts) |
| Offer state & advance | [`src/shared/game.ts`](../../../src/shared/game.ts) — `computeRelicOfferPickBudget`, `openRelicOffer`, `completeRelicPickAndAdvance` / pick flow, `advanceToNextLevel` |
| Run shape | [`src/shared/contracts.ts`](../../../src/shared/contracts.ts) — `relicOffer`, `bonusRelicPicksNextOffer`, `metaRelicDraftExtraPerMilestone` (from save via `metaRelicDraftExtraPerMilestoneFromSave` in [`save-data.ts`](../../../src/shared/save-data.ts)) |
| Store | [`src/renderer/store/useAppStore.ts`](../../../src/renderer/store/useAppStore.ts) — `pickRelic`, `continueToNextLevel` |
| UI | [`RelicDraftOfferPanel.tsx`](../../../src/renderer/components/RelicDraftOfferPanel.tsx), [`RelicDraftOffer.module.css`](../../../src/renderer/components/RelicDraftOffer.module.css), [`GameScreen.tsx`](../../../src/renderer/components/GameScreen.tsx) |

## Doc index

1. [Visual language](./01-visual-language.md) — rarity bands, motion, a11y
2. [State machine](./02-state-machine.md) — `picksRemaining`, `pickRound`, `relicTiersClaimed`
3. [Bonus sources](./03-bonus-sources.md) — shipped: Daily, `generous_shrine`, meta unlock, Scholar contract, `shrine_echo` / `grantBonusRelicPickNextOffer`; see `computeRelicOfferPickBudget`
4. [Pickup matrix](./04-pickup-matrix.md) — `RelicId` × draft tier × summary
5. [UI ultra-refinement](./05-ui-ultra-refinement.md) — phased presentation polish: hierarchy, multi-pick UX, motion, responsive, a11y, copy centralization, QA

Per-phase task backlog (RDUI-001–008): [`tasks/`](./tasks/) — all **complete** in code; see each task file’s `Status` line.

## Related

- [`docs/RELIC_ROSTER.md`](../../RELIC_ROSTER.md) — effect descriptions
- [`docs/BALANCE_NOTES.md`](../../BALANCE_NOTES.md) — cadence + weights
- [`docs/gameplay/epic-relics.md`](../../gameplay/epic-relics.md) — high-level epic status
