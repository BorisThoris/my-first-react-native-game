# RDUI-007: Copy centralization (`relicDraftOffer.ts`)

> **Status:** Shipped — [`relicDraftOffer.ts`](../../../../src/renderer/copy/relicDraftOffer.ts) + [`relicDraftOffer.test.ts`](../../../../src/renderer/copy/relicDraftOffer.test.ts); `GameScreen` imports copy only.

**Epic:** [UI ultra-refinement § P7](../05-ui-ultra-refinement.md#p7--copy-centralization)

## Problem

Relic-offer titles, subtitles, and `RELIC_LABELS` live inline in `GameScreen.tsx`, which complicates edits, review, and future i18n.

## Proposed work

- Add `src/renderer/copy/relicDraftOffer.ts` (mirror style of [`gameOverScreen.ts`](../../../../src/renderer/copy/gameOverScreen.ts), [`inventoryScreen.ts`](../../../../src/renderer/copy/inventoryScreen.ts)).
- Move user-facing strings: offer title/subtitle helpers, progress/chip copy if added in RDUI-001, and relic effect lines for the draft panel.
- Import from `GameScreen.tsx` / `RelicDraftOfferPanel` props as appropriate; keep exports typed (`RelicId` keys).

## Files

| Action | Path |
|--------|------|
| Add | `src/renderer/copy/relicDraftOffer.ts` |
| Edit | `src/renderer/components/GameScreen.tsx` |
| Edit | `src/renderer/components/RelicDraftOfferPanel.tsx` if panel receives copy via props |

## Acceptance

No long user-facing strings for this flow remain inline in `GameScreen.tsx` except re-exports or one-line wiring.

## Category

**copy**

## Priority

**P2**
