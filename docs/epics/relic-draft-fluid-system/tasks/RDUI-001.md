# RDUI-001: Information architecture (progress, header, optional bonus row)

> **Status:** Shipped — progress line, short title/subtitle, bonus footnotes in [`GameScreen.tsx`](../../../../src/renderer/components/GameScreen.tsx) + [`relicDraftOffer.ts`](../../../../src/renderer/copy/relicDraftOffer.ts); covered by [`GameScreen.test.tsx`](../../../../src/renderer/components/GameScreen.test.tsx).

**Epic:** [UI ultra-refinement § P1](../05-ui-ultra-refinement.md#p1--information-architecture)

## Problem

The relic draft uses long title/subtitle strings in `GameScreen` and does not expose a dedicated **progress** affordance for multi-pick visits. Players infer remaining picks only from prose. When bonuses stack (Scholar, Daily, meta, mutators), **why** this visit grants extra picks is invisible in the overlay.

## Proposed work

- Add a scannable **progress** line or chip (e.g. “Pick 2 of 3 this visit” or “2 choices remaining”) derived from `run.relicOffer.picksRemaining` and total visit budget (compute display-only if full budget is not on `RunState`; document the approach in code comments).
- **Shorten or split** `getRelicOfferTitle` / `getRelicOfferSubtitle`: title = draft tier + visit framing; subtitle = immediate apply + reroll between picks in ≤2 short sentences.
- **Optional:** non-noisy chips or a footnote for bonus provenance when relevant; align copy with [Bonus sources](../03-bonus-sources.md) without duplicating formulas.

## Files

| Action | Path |
|--------|------|
| Edit | `src/renderer/components/GameScreen.tsx` |
| Edit | `src/renderer/components/OverlayModal.tsx` or modal CSS only if new slot is needed |
| Read-only | `src/shared/contracts.ts` (`relicOffer` shape), [03-bonus-sources](../03-bonus-sources.md) |

## Acceptance

A new player with multi-pick can state how many picks remain without reading the long subtitle; bonus provenance is optional but not misleading.

## Category

**ui**

## Priority

**P1**
