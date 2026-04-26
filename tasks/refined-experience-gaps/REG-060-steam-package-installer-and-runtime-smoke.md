# REG-060: Steam Package Installer And Runtime Smoke

## Status
Blocked

## Priority
P1

## Area
QA

## Evidence
- `package.json`
- `steam_appid.txt`
- `src/main/index.ts`
- `src/main/steam.ts`
- `src/preload/index.ts`
- `src/main/ipc.ts`

## Problem
The app is Windows-first and Steam-oriented, but packaged runtime behavior can differ from Vite/Electron dev: Steam DLL availability, save paths, display mode, audio autoplay, overlay, installer, and preload IPC all need release smoke coverage.

## Target Experience
A packaged build should launch, save, play audio, connect or gracefully disconnect from Steam, unlock achievements locally, and uninstall/install without data confusion.

## Suggested Implementation
- Define a Windows package smoke checklist for `package:dir` and `package:win`.
- Test first launch, settings save, run completion, achievement unlock, Steam unavailable, display mode, audio, and app restart.
- Verify `DesktopApi` and `IPC_CHANNELS` behave in packaged preload.
- Document where saves live and how reset/export interacts with packaged builds.
- Keep Steam-specific behavior non-blocking when Steam is absent.

## Acceptance Criteria
- Packaged app launches from clean install.
- Steam unavailable state is clear and non-fatal.
- Saves and settings persist across restart.
- Audio and display mode work in packaged runtime.

## Verification
- **Offline checklist (doc-only; does not close REG-060):** [docs/qa/steam-package-smoke-checklist.md](../../docs/qa/steam-package-smoke-checklist.md)
- Run `yarn package:dir` or `yarn package:win` when implementation begins.
- Execute the manual smoke checklist on **Windows** (packaged build).
- Record Steam connected and disconnected outcomes.

## Cross-links
- `REG-032-save-profile-cloud-release-shell.md`
- `REG-039-achievement-surface-steam-offline-recovery.md`
- `REG-040-save-failure-recovery-and-local-data-trust.md`
