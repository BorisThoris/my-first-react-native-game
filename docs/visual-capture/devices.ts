/**
 * Folder slugs under `docs/visual-capture/<deviceId>/<orientation>/`.
 * Widths, heights, and `useCoarsePointer` are defined in
 * [`e2e/visualInventoryDevices.ts`](../../e2e/visualInventoryDevices.ts).
 */
export const VISUAL_CAPTURE_DEVICE_IDS = [
    'iphone-se',
    'iphone-14-pro',
    'pixel-7',
    'phone-large',
    'ipad-11',
    'laptop-1366',
    'desktop-1280',
    'desktop-1440'
] as const;

export type VisualCaptureDeviceId = (typeof VISUAL_CAPTURE_DEVICE_IDS)[number];
