import { describe, expect, it } from 'vitest';
import { getMotionPermissionButtonLabels, shouldOfferDeviceMotionPermission } from './platformTiltPermissionUi';

describe('shouldOfferDeviceMotionPermission', () => {
    it('is false when touch is not primary', () => {
        expect(
            shouldOfferDeviceMotionPermission({
                motionParallaxSuppressed: false,
                permission: 'prompt',
                touchPrimary: false
            })
        ).toBe(false);
    });

    it('is false when parallax is suppressed (reduce motion)', () => {
        expect(
            shouldOfferDeviceMotionPermission({
                motionParallaxSuppressed: true,
                permission: 'prompt',
                touchPrimary: true
            })
        ).toBe(false);
    });

    it('is true for prompt or denied on touch when motion is allowed', () => {
        expect(
            shouldOfferDeviceMotionPermission({
                motionParallaxSuppressed: false,
                permission: 'prompt',
                touchPrimary: true
            })
        ).toBe(true);
        expect(
            shouldOfferDeviceMotionPermission({
                motionParallaxSuppressed: false,
                permission: 'denied',
                touchPrimary: true
            })
        ).toBe(true);
    });

    it('is false when permission is granted or unsupported', () => {
        expect(
            shouldOfferDeviceMotionPermission({
                motionParallaxSuppressed: false,
                permission: 'granted',
                touchPrimary: true
            })
        ).toBe(false);
        expect(
            shouldOfferDeviceMotionPermission({
                motionParallaxSuppressed: false,
                permission: 'unsupported',
                touchPrimary: true
            })
        ).toBe(false);
    });
});

describe('getMotionPermissionButtonLabels', () => {
    it('uses first-time copy for prompt', () => {
        expect(getMotionPermissionButtonLabels('prompt', 'board').buttonText).toBe('Enable motion');
        expect(getMotionPermissionButtonLabels('prompt', 'intro').ariaLabel).toMatch(/intro/i);
    });

    it('uses retry copy for denied', () => {
        const board = getMotionPermissionButtonLabels('denied', 'board');
        expect(board.buttonText).toBe('Try again');
        expect(board.ariaLabel).toMatch(/again/i);
    });
});
