/**
 * PERF spike notes (TileBoardScene draw path) — not imported by production UI.
 *
 * Audit (manual, Chromium devtools):
 * - Performance → enable “Screenshots” + WebGL; record while shuffling a 48+ tile board on medium quality.
 * - Note draw calls, GPU time, and JS `useFrame` cost (`perfBoard` / `perfBoardVerbose` localStorage).
 *
 * InstancedMesh prototype (future):
 * - Candidate: invisible pick slabs (`mesh` per tile in TileBezel) → one InstancedMesh with per-tile
 *   instanceMatrix + userData map from instanceId → tileId (raycast instanceId path).
 * - Rim / hover rings share materials but not meshes today; merging would need atlas or multi-material
 *   instancing — high effort; validate draw-call count first.
 *
 * Outcome for now: per-tile meshes remain; revisit if boardSceneDrawCalls > ~200 on target hardware.
 */
export const BOARD_DRAW_CALL_SPIKE_VERSION = 1;
