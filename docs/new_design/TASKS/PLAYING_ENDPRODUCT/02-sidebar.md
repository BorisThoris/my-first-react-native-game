# 02 — Sidebar (`PLAY-001`, `PLAY-002`)

**`PLAY-*` IDs:** **PLAY-001** (P1), **PLAY-002** (P2)

## Current delta vs `ENDPRODUCTIMAGE.png`

From [`CURRENT_VS_ENDPRODUCT.md`](../../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) **§4**:

- **Sidebar composition:** Reference shows a **collapsed medallion rail plus an expanded labeled flyout**. Live parity output **`sidebar-menu.png`** (under `test-results/endproduct-parity/` after **PLAY-010** commands) captures **only the collapsed rail** — functionally aligned but more utility-oriented than the mock; flyout composition may remain **reference-only** until product scopes it.

| ID | Title | Delta vs reference | Acceptance criteria |
|----|--------|-------------------|---------------------|
| PLAY-001 | Sidebar IA and flyout parity | Reference board shows collapsed rail + expanded flyout; live has collapsed rail only | Product records whether flyout stays reference-only or ships; docs and captures make that explicit |
| PLAY-002 | Sidebar medallion and icon family | Live rail works but reads lighter than mock medallion stack | Icon / medallion treatment moves closer to reference or delta documented as intentional |

## Required end state

- Scope for **expanded flyout** is explicit (ship vs reference-only).
- Rail reads **premium / medallion-led** when product keeps collapsed-only ([`GAMEPLAY_ENDPRODUCT_TARGET_BRIEF.md`](../../../wip-assets/GAMEPLAY_ENDPRODUCT_TARGET_BRIEF.md) sidebar section).

## Dependencies

- **PLAY-010** (evidence).
- Authoritative rows: **`SIDE-*`** in [`../TASKS_SIDEBAR_PARITY.md`](../TASKS_SIDEBAR_PARITY.md).

## Primary runtime files

- [`GameLeftToolbar.tsx`](../../../../src/renderer/components/GameLeftToolbar.tsx)
- [`GameScreen.module.css`](../../../../src/renderer/components/GameScreen.module.css)
- [`src/renderer/assets/ui/icons/`](../../../../src/renderer/assets/ui/icons/)

## Evidence artifacts

- `sidebar-menu.png` (parity set); regenerate via **PLAY-010** commands.

## Cross-links

- [`../TASKS_SIDEBAR_PARITY.md`](../TASKS_SIDEBAR_PARITY.md) (`SIDE-*`)
- [`../TASKS_ARCHIVE_PARITY.md`](../TASKS_ARCHIVE_PARITY.md) — completed sidebar rows
