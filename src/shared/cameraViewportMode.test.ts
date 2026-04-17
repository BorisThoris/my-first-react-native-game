import { describe, expect, it } from 'vitest';
import {
    deriveCameraViewportMode,
    latchPhoneWidthForMobileCamera,
    MOBILE_CAMERA_WIDTH_BREAKPOINT,
    MOBILE_CAMERA_WIDTH_HYSTERESIS_PX
} from './cameraViewportMode';

describe('latchPhoneWidthForMobileCamera', () => {
    it('uses hysteresis when leaving the narrow bucket', () => {
        let latched = latchPhoneWidthForMobileCamera(MOBILE_CAMERA_WIDTH_BREAKPOINT, false);
        expect(latched).toBe(true);
        latched = latchPhoneWidthForMobileCamera(MOBILE_CAMERA_WIDTH_BREAKPOINT + 10, latched);
        expect(latched).toBe(true);
        latched = latchPhoneWidthForMobileCamera(
            MOBILE_CAMERA_WIDTH_BREAKPOINT + MOBILE_CAMERA_WIDTH_HYSTERESIS_PX + 1,
            latched
        );
        expect(latched).toBe(false);
    });
});

describe('deriveCameraViewportMode', () => {
    it('auto follows viewport flag', () => {
        expect(deriveCameraViewportMode('auto', true)).toBe(true);
        expect(deriveCameraViewportMode('auto', false)).toBe(false);
    });

    it('always forces mobile camera on', () => {
        expect(deriveCameraViewportMode('always', false)).toBe(true);
        expect(deriveCameraViewportMode('always', true)).toBe(true);
    });

    it('never forces mobile camera off', () => {
        expect(deriveCameraViewportMode('never', true)).toBe(false);
        expect(deriveCameraViewportMode('never', false)).toBe(false);
    });
});
