import type { VisualOrientation, VisualViewport } from './visualScreenHelpers';

export type InventoryDeviceSlot = VisualViewport & {
    /** Emulate coarse pointer (touch) for layout that keys off pointer media. */
    useCoarsePointer?: boolean;
};

const slot = (
    deviceId: string,
    orientation: VisualOrientation,
    width: number,
    height: number,
    useCoarsePointer: boolean
): InventoryDeviceSlot => ({
    deviceId,
    height,
    id: `${deviceId}-${orientation}`,
    orientation,
    useCoarsePointer,
    width
});

/**
 * Canonical portrait sizes; landscape is always swapped dimensions.
 * Used by `visual-inventory-capture.spec.ts` only.
 */
export const INVENTORY_DEVICE_SLOTS: ReadonlyArray<InventoryDeviceSlot> = [
    slot('iphone-se', 'portrait', 375, 667, true),
    slot('iphone-se', 'landscape', 667, 375, true),
    slot('iphone-14-pro', 'portrait', 390, 844, true),
    slot('iphone-14-pro', 'landscape', 844, 390, true),
    slot('pixel-7', 'portrait', 393, 851, true),
    slot('pixel-7', 'landscape', 851, 393, true),
    slot('phone-large', 'portrait', 430, 932, true),
    slot('phone-large', 'landscape', 932, 430, true),
    slot('ipad-11', 'portrait', 820, 1180, true),
    slot('ipad-11', 'landscape', 1180, 820, true),
    slot('laptop-1366', 'portrait', 768, 1366, false),
    slot('laptop-1366', 'landscape', 1366, 768, false),
    slot('desktop-1280', 'portrait', 720, 1280, false),
    slot('desktop-1280', 'landscape', 1280, 720, false),
    slot('desktop-1440', 'portrait', 900, 1440, false),
    slot('desktop-1440', 'landscape', 1440, 900, false)
];
