# Dev legacy shims

## `tileStepLegacy`

Opt-in A/B for tile bezel animation scheduling (`localStorage.tileStepLegacy = '1'` in dev). Consolidated scene-level stepping is the default; this path registers per-tile `useFrame` drivers for comparison only. Not used in production bundles.
