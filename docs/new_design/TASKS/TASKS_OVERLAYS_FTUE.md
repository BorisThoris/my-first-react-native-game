# Tasks: In-run overlays, FTUE, toasts (`OVR-*`)

**Research pass:** `GameScreen` pause / floor / relic `OverlayModal`; `SettingsScreen` modal; `App` inventory/codex overlay; FTUE banner; toast rail + score pops; distraction HUD; z-index ladder.

**Finding:** Two modal families (**OverlayModal** vs **Settings** `shellModal**); achievements share rail with score pops; distraction is numeric tick only; `suppressStatusOverlays` when meta over gameplay.

**Cross-links:** `TASKS_HUD_PARITY.md` (HUD-020 distraction), `TASKS_CARDS_VFX_PARITY.md` (celebration), `PLAYING_ENDPRODUCT/06-interactions.md` (`PLAY-008`), `MOTION_AND_STATE_SPEC.md`, `REFERENCE_VS_SCENARIOS.md`.

---

## Task table

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| OVR-001 | P1 | Unify modal visual system | Shared frame tokens: OverlayModal + in-run Settings. | Theme vars; design review. | DS-010 |
| OVR-002 | P1 | Ornament pause / floor clear | Header plates per SCREEN_SPEC / reference. | reduceMotion: no janky motion. | META-003 |
| OVR-003 | P2 | Modal motion spec | Enter/exit from MOTION_AND_STATE_SPEC. | `data-reduce-motion` gates. | — |
| OVR-004 | P1 | Achievement surface split | Dedicated ribbon/modal vs generic toast. | `aria-live` policy (A11Y-005). | — |
| OVR-005 | P2 | Score pop stacking | Max concurrent, collision with achievements. | Readable on mobile. | OVR-004 |
| OVR-006 | P2 | Powers FTUE polish | Placement/hierarchy vs gameplay shell (`PLAY-*` pack); optional board markers. | Product |
| OVR-007 | P2 | Distraction channel fidelity | Channel chrome; contrast; intent doc. | Still off when reduceMotion. | HUD-020 |
| OVR-009 | P1 | `suppressStatusOverlays` tests | Matrix: pause + inventory/settings open. | Playwright or unit. | NAV-010 |
| OVR-010 | P1 | Focus management parity | OverlayModal vs Settings modal: trap + return. | Keyboard audit. | A11Y-004 |
| OVR-011 | P2 | SR copy audit | Floor/relic/pause headings vs `ScreenTitle`. | a11y review. | — |
| OVR-012 | P2 | Relic tier presentation | Match reference 05–07 family. | Visual baselines. | OVR-002 |
| OVR-013 | P2 | Playwright visual scenarios | Pause, run settings, floor, toasts, mobile camera. | REFERENCE_VS_SCENARIOS IDs. | QA-001 |
| OVR-014 | P2 | Unlock during levelComplete | **Done:** `GameScreen` queues achievement toasts while the floor-cleared `OverlayModal` is up; emits after dismiss / continue (store clears `newlyUnlockedAchievements` on continue). | UX decision. | OVR-004 |
| OVR-015 | P1 | Backdrop without blur | reduceMotion: contrast still passes. | OverlayModal + settings checked. | — |
