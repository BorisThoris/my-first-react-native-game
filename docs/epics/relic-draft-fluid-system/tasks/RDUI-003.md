# RDUI-003: Multi-pick flow (focus, live region)

> **Status:** Shipped — focus + polite live region in [`RelicDraftOfferPanel.tsx`](../../../../src/renderer/components/RelicDraftOfferPanel.tsx); SR round-trip manual per [QA](../05-ui-ultra-refinement.md#qa-checklist-manual).

**Epic:** [UI ultra-refinement § P3](../05-ui-ultra-refinement.md#p3--multi-pick-flow)

## Problem

When a pick does not close the offer, options reroll and DOM nodes swap. Focus can land on a removed control, and screen-reader users get no explicit cue that **round** / `pickRound` advanced.

## Proposed work

- On `pickRelic` completion while `relicOffer` remains: move **focus** to the first card of the new trio (or equivalent first interactive in the panel).
- Add a **polite** live-region announcement when `pickRound` increments (e.g. “New relic choices”), reusing or mirroring [`useHudPoliteLiveAnnouncement`](../../../../src/renderer/hooks/useHudPoliteLiveAnnouncement.ts) patterns.
- Ensure no focus trap regression with [`OverlayModal`](../../../../src/renderer/components/OverlayModal.tsx) focus management.

## Files

| Action | Path |
|--------|------|
| Edit | `src/renderer/components/RelicDraftOfferPanel.tsx` |
| Edit | `src/renderer/components/GameScreen.tsx` or `useAppStore` pick path (where post-pick focus is triggered) |
| Read-only | `src/renderer/store/useAppStore.ts` (`pickRelic`), [02-state-machine](../02-state-machine.md) |

## Acceptance

VoiceOver/NVDA: multi-pick visit announces round change; focus is never stuck on a removed node.

## Category

**a11y**

## Priority

**P1**
