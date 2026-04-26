# Windows packaged build — manual smoke (REG-060)

This document is the **offline, repo-shippable** part of [REG-060](../../tasks/refined-experience-gaps/REG-060-steam-package-installer-and-runtime-smoke.md). Completing it does **not** mark REG-060 as done in the state index: full acceptance still requires a **real Windows x64** run with a **packaged** build and, where applicable, the Steam client ([REG_BLOCKERS_AND_DEFERRALS.md](../agent/REG_BLOCKERS_AND_DEFERRALS.md)).

## Prereqs

- Build: `yarn package:dir` (unpacked) or `yarn package:win` (installer), from a dev machine with the full Electron toolchain.
- Test on **Windows 10/11 x64** (not WSL-for-GUI as a substitute for release sign-off).
- Optional: Steam client installed; optional: Steam offline or no client to verify graceful paths.

## Checklist

1. **First launch**  
   - App window opens; no white-screen crash.  
   - Main menu or startup flow is reachable (startup intro, if any, can be dismissed per product rules).

2. **Steam**  
   - With Steam **running**: no fatal error; behavior matches [src/main/steam.ts](../../src/main/steam.ts) contract (e.g. optional features).  
   - With Steam **absent** or **offline**: app remains usable; message or silent degrade is **non-fatal** (per REG-060 target experience).

3. **Persistence**  
   - Change a setting; restart app; setting persists.  
   - If applicable, start a run, exit, relaunch; save/progress path matches [REG-040](../../tasks/refined-experience-gaps/REG-040-save-failure-recovery-and-local-data-trust.md) expectations for local trust.

4. **Audio**  
   - UI/game audio plays when expected; no hard crash on first SFX/BGM (autoplay / context resume).

5. **Display**  
   - Windowed and/or fullscreen: no broken exclusive-fullscreen that traps input; game remains playable.

6. **Preload / IPC**  
   - Features that go through [src/preload/index.ts](../../src/preload/index.ts) and [src/main/ipc.ts](../../src/main/ipc.ts) work in **packaged** build (not only `yarn dev`).

7. **Install / upgrade sanity**  
   - Clean install: no duplicate shortcuts confusion (installer build).  
   - Upgrade over prior install: save data not wiped unintentionally (document path under `%APPDATA%` or as implemented).

8. **Record**  
   - Note build id (version), date, tester, Steam on/off, pass/fail per row; attach logs if a step fails.

## Not covered here

- Full certification, anti-cheat, or server-backed features (see REG-052 deferral).  
- Final store page media (REG-061).
