# RDUI-002: Card presentation (tier chrome, density)

> **Status:** Shipped — tier chrome updates in [`RelicDraftOffer.module.css`](../../../../src/renderer/components/RelicDraftOffer.module.css); grayscale check remains manual (see [QA checklist](../05-ui-ultra-refinement.md#qa-checklist-manual)).

**Epic:** [UI ultra-refinement § P2](../05-ui-ultra-refinement.md#p2--card-presentation)

## Problem

Baseline rarity styling exists in `RelicDraftOffer.module.css`, but tier legibility can still rely too much on color. [Visual language](../01-visual-language.md) calls for stronger non-color cues (border weight, pattern, glow). Phone vs desktop density is not explicitly tuned.

## Proposed work

- Strengthen **common / uncommon / rare** differentiation: rune strip density, border weight, glow—keep visible body text **effect-only** (no “Rare ·” prefix on card face).
- Optional **compact vs comfort** layout via CSS (container queries or breakpoints) consistent with project patterns.
- Optional `sr-only` rarity line only if it improves parity with `aria-label` without triple announcement.

## Files

| Action | Path |
|--------|------|
| Edit | `src/renderer/components/RelicDraftOffer.module.css` |
| Edit | `src/renderer/components/RelicDraftOfferPanel.tsx` (structure only if needed for density) |
| Read-only | `src/shared/relics.ts` (`getRelicDraftRow`, rarities), [01-visual-language](../01-visual-language.md) |

## Acceptance

Side-by-side screenshot: common / uncommon / rare are distinguishable with color simulated to grayscale (patterns + weight still differ).

## Category

**ui**

## Priority

**P2**
