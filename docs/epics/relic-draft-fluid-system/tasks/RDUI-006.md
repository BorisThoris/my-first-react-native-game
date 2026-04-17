# RDUI-006: Input (arrows, no-dismiss, REF-010 alignment)

> **Status:** Shipped — arrow/Home/End roving + Escape comment in [`RelicDraftOfferPanel.tsx`](../../../../src/renderer/components/RelicDraftOfferPanel.tsx); `KeyP` pause blocked — [`GameScreen.test.tsx`](../../../../src/renderer/components/GameScreen.test.tsx).

**Epic:** [UI ultra-refinement § P6](../05-ui-ultra-refinement.md#p6--input)

## Problem

Options are three `<button>` elements in DOM order; there is no arrow-key roving or documented **no-dismiss** rule for Escape. Global shortcuts (pause) must stay consistent with [`REF-010`](../../../refinement-tasks/REF-010.md) when `relicOffer` is active.

## Proposed work

- Implement **ArrowLeft/ArrowRight** (or **roving tabindex**) between the three options while the relic overlay is open; **Enter/Space** activates focused card.
- Document product decision: **Escape does not cancel** the draft (or implement only if design approves skipping pick)—note in task PR / QA doc so false bugs are not filed.
- Verify `P` / pause and other handlers do not conflict; extend tests or docs per REF-010 matrix.

## Files

| Action | Path |
|--------|------|
| Edit | `src/renderer/components/RelicDraftOfferPanel.tsx` (keyboard handlers) |
| Edit | `src/renderer/components/GameScreen.tsx` or keyboard layer if centralized |
| Read-only | [`REF-010`](../../../refinement-tasks/REF-010.md), `src/renderer/keyboard/` |

## Acceptance

Keyboard-only user can move focus across options and activate with Enter/Space; behavior matches documented matrix.

## Category

**a11y**

## Priority

**P1**
