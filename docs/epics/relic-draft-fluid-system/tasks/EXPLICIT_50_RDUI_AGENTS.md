# Explicit 50-agent map (RDUI-001–RDUI-008)

Use this to **delegate** or **check off** atomic steps for the relic draft UI epic. **Agent k** (1–50) maps to **one row** below—not 50 parallel edits to the same file. Prefer **serial waves** (copy module → IA → CSS → a11y/input → QA; see [epic README](../README.md)).

**Verification:** `yarn fullcheck` from repo root after each batch.

## Execution model

| Layer | Meaning |
|-------|---------|
| **50 logical agents** | `Agent k` ↔ row **k** in the master table (RDUI-A01 … RDUI-A50). |
| **5 controller agents** | **C_RDUI_1 … C_RDUI_5** — each owns **10 consecutive rows** (5×10 = 50). |

## Controller batches

| Controller | Agent (row) range | Theme |
|------------|---------------------|--------|
| C_RDUI_1 | 1–10 | Copy module + IA strings |
| C_RDUI_2 | 11–20 | Progress UI + bonus footnote wiring |
| C_RDUI_3 | 21–30 | Card CSS: tier, motion, responsive |
| C_RDUI_4 | 31–40 | Focus, live region, keyboard |
| C_RDUI_5 | 41–50 | QA docs, tests, fullcheck |

## Prompt template (single agent)

```
You are Agent NNN (1–50) for the Memory Dungeon repo.
Your sole item is row RDUI-ANN in docs/epics/relic-draft-fluid-system/tasks/EXPLICIT_50_RDUI_AGENTS.md.
Implement it; run `yarn fullcheck`. Keep changes minimal and scoped to the Primary file(s).
Report: what you did, files touched, blockers.
```

## Prompt template (batch controller C_RDUI_K)

```
You are Controller C_RDUI_K. Implement rows AAA–BBB in the EXPLICIT_50_RDUI_AGENTS master table in order.
Avoid cross-file conflicts; one `yarn fullcheck` at end.
```

Concrete ranges:

- **C_RDUI_1:** rows **1–10**
- **C_RDUI_2:** rows **11–20**
- **C_RDUI_3:** rows **21–30**
- **C_RDUI_4:** rows **31–40**
- **C_RDUI_5:** rows **41–50**

## Master table (50 rows)

| Agent | ID | Parent | Task (atomic) | Primary file(s) |
|-------|-----|--------|---------------|-----------------|
| 1 | RDUI-A01 | RDUI-007 | Create `relicDraftOffer.ts` with `relicEffectLabels` export | `src/renderer/copy/relicDraftOffer.ts` |
| 2 | RDUI-A02 | RDUI-007 | Add `getRelicDraftVisitTotals` helper | `src/renderer/copy/relicDraftOffer.ts` |
| 3 | RDUI-A03 | RDUI-007 | Add `getRelicOfferTitle` / `getRelicOfferSubtitle` (short copy) | `src/renderer/copy/relicDraftOffer.ts` |
| 4 | RDUI-A04 | RDUI-007 | Add `relicDraftProgressLine` | `src/renderer/copy/relicDraftOffer.ts` |
| 5 | RDUI-A05 | RDUI-007 | Add `relicDraftRoundAdvancedAnnouncement` | `src/renderer/copy/relicDraftOffer.ts` |
| 6 | RDUI-A06 | RDUI-007 | Add `buildRelicDraftBonusFootnoteLines(run)` | `src/renderer/copy/relicDraftOffer.ts` |
| 7 | RDUI-A07 | RDUI-007 | Wire `GameScreen` imports; remove inline relic strings | `GameScreen.tsx` |
| 8 | RDUI-A08 | RDUI-007 | Pass copy into `RelicDraftOfferPanel` unchanged | `GameScreen.tsx` |
| 9 | RDUI-A09 | RDUI-007 | Vitest for `getRelicDraftVisitTotals` edge cases | `relicDraftOffer.test.ts` |
| 10 | RDUI-A10 | RDUI-007 | `yarn fullcheck` green after copy wave | — |
| 11 | RDUI-A11 | RDUI-001 | Add `relicDraftMeta` / progress row styles | `GameScreen.module.css` |
| 12 | RDUI-A12 | RDUI-001 | Render progress line when `total > 1` | `GameScreen.tsx` |
| 13 | RDUI-A13 | RDUI-001 | Render bonus footnote list (non-noisy) | `GameScreen.tsx` |
| 14 | RDUI-A14 | RDUI-001 | Tune spacing between subtitle and panel | `GameScreen.module.css` |
| 15 | RDUI-A15 | RDUI-002 | Strengthen `card_common` border / rune strip | `RelicDraftOffer.module.css` |
| 16 | RDUI-A16 | RDUI-002 | Strengthen `card_uncommon` glow band | `RelicDraftOffer.module.css` |
| 17 | RDUI-A17 | RDUI-002 | Strengthen `card_rare` rim (no new loop) | `RelicDraftOffer.module.css` |
| 18 | RDUI-A18 | RDUI-004 | Add `:active` / press state on `.card` | `RelicDraftOffer.module.css` |
| 19 | RDUI-A19 | RDUI-004 | Stagger `relicCardEnter` + delays (reduce-motion off only) | `RelicDraftOffer.module.css` |
| 20 | RDUI-A20 | RDUI-005 | Cap grid max-width + tune `minmax` for wide screens | `RelicDraftOffer.module.css` |
| 21 | RDUI-A21 | RDUI-005 | Narrow-landscape gap / padding pass | `RelicDraftOffer.module.css` |
| 22 | RDUI-A22 | RDUI-005 | Wrapper class for panel width parity | `RelicDraftOfferPanel.tsx` |
| 23 | RDUI-A23 | RDUI-003 | `useEffect` focus first option on `optionIds`/`pickRound` change | `RelicDraftOfferPanel.tsx` |
| 24 | RDUI-A24 | RDUI-003 | Polite `aria-live` region for round advance | `RelicDraftOfferPanel.tsx` |
| 25 | RDUI-A25 | RDUI-003 | Pass `pickRound` prop from `GameScreen` | `GameScreen.tsx` |
| 26 | RDUI-A26 | RDUI-006 | ArrowLeft/ArrowRight roving between card buttons | `RelicDraftOfferPanel.tsx` |
| 27 | RDUI-A27 | RDUI-006 | Document Escape does not dismiss (file comment) | `RelicDraftOfferPanel.tsx` |
| 28 | RDUI-A28 | RDUI-006 | Confirm `KeyP` still no-ops (manual or existing test) | `GameScreen.test.tsx` |
| 29 | RDUI-A29 | RDUI-008 | Add manual QA subsection to `05-ui-ultra-refinement.md` | `docs/.../05-ui-ultra-refinement.md` |
| 30 | RDUI-A30 | RDUI-008 | Cross-link checklist from `e2e/README.md` | `e2e/README.md` |
| 31 | RDUI-A31 | RDUI-001 | Copy-review: subtitle ≤2 sentences | `relicDraftOffer.ts` |
| 32 | RDUI-A32 | RDUI-002 | Grayscale distinction sanity (document in QA) | `05-ui-ultra-refinement.md` |
| 33 | RDUI-A33 | RDUI-003 | NVDA/VoiceOver note in QA list | `05-ui-ultra-refinement.md` |
| 34 | RDUI-A34 | RDUI-004 | Verify reduce-motion strips stagger | manual QA |
| 35 | RDUI-A35 | RDUI-005 | No horizontal scroll in draft body | manual QA |
| 36 | RDUI-A36 | RDUI-006 | Enter/Space activation unchanged | manual QA |
| 37 | RDUI-A37 | RDUI-007 | Ensure `RELIC_LABELS` parity with old `GameScreen` map | `relicDraftOffer.ts` |
| 38 | RDUI-A38 | RDUI-008 | Optional Playwright: defer (note in QA) | — |
| 39 | RDUI-A39 | RDUI-004 | Disable stagger under `[data-reduce-motion='true']` | `RelicDraftOffer.module.css` |
| 40 | RDUI-A40 | RDUI-005 | Safe-area: match modal if shell uses env(safe-area) | `RelicDraftOffer.module.css` or `OverlayModal.module.css` |
| 41 | RDUI-A41 | RDUI-003 | Avoid duplicate live announcement on first paint | `RelicDraftOfferPanel.tsx` |
| 42 | RDUI-A42 | RDUI-006 | `stopPropagation` on grid nav only when handled | `RelicDraftOfferPanel.tsx` |
| 43 | RDUI-A43 | RDUI-001 | Bonus lines: omit empty duplicates | `relicDraftOffer.ts` |
| 44 | RDUI-A44 | RDUI-002 | Optional `prefers-reduced-motion` media fallback | `RelicDraftOffer.module.css` |
| 45 | RDUI-A45 | RDUI-007 | Export barrel: no circular imports | `relicDraftOffer.ts` |
| 46 | RDUI-A46 | RDUI-008 | Record `yarn fullcheck` in PR notes | — |
| 47 | RDUI-A47 | RDUI-003 | Focus first card after multi-pick without stealing initial modal focus | order of effects |
| 48 | RDUI-A48 | RDUI-006 | Home/End jump to first/last card (optional) | `RelicDraftOfferPanel.tsx` |
| 49 | RDUI-A49 | RDUI-008 | Screenshot checklist: three rarities | QA |
| 50 | RDUI-A50 | RDUI-008 | Final `yarn fullcheck` gate | — |

## Relation to RDUI task files

Implementation maps to [`RDUI-001.md`](./RDUI-001.md) … [`RDUI-008.md`](./RDUI-008.md); this table **finer-grains** those eight cards for delegation.
