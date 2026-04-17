# RDUI-004: Motion (stagger, active state)

> **Status:** Shipped — `relicCardEnter` stagger + `:active` in [`RelicDraftOffer.module.css`](../../../../src/renderer/components/RelicDraftOffer.module.css); gated by `data-reduce-motion` + `prefers-reduced-motion`.

**Epic:** [UI ultra-refinement § P4](../05-ui-ultra-refinement.md#p4--motion)

## Problem

Cards appear statically; there is no staggered entrance hierarchy. Pressed/active feedback is weaker than hover/focus. Rare sheen already exists—new motion must stay behind **`[data-reduce-motion='false']`**.

## Proposed work

- **Entrance:** stagger card appearance only when `data-reduce-motion` is false; instant or simple fade when reduced.
- **Interaction:** `:active` / press styling on `.card` buttons; optional subtle scale within comfort limits.
- Do **not** add looping motion to common/uncommon; leave rare sheen as implemented in `RelicDraftOffer.module.css`.

## Files

| Action | Path |
|--------|------|
| Edit | `src/renderer/components/RelicDraftOffer.module.css` |
| Edit | `src/renderer/components/RelicDraftOfferPanel.tsx` (wrapper hooks for stagger keys if needed) |

## Acceptance

With reduce motion **on**, no stagger and no new animations beyond existing rare sheen off-state.

## Category

**ui**

## Priority

**P2**
