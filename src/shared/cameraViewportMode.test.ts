import { describe, expect, it } from 'vitest';
import { deriveCameraViewportMode } from './cameraViewportMode';

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
