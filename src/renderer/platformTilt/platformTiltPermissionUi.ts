import type { MotionPermissionState } from './platformTiltTypes';

type MotionPermissionCopyContext = 'board' | 'intro';

export function shouldOfferDeviceMotionPermission(params: {
    touchPrimary: boolean;
    motionParallaxSuppressed: boolean;
    permission: MotionPermissionState;
}): boolean {
    if (!params.touchPrimary || params.motionParallaxSuppressed) {
        return false;
    }

    return params.permission === 'prompt' || params.permission === 'denied';
}

/**
 * Labels for the motion-permission chip / CTA. `denied` uses retry-oriented copy.
 */
export function getMotionPermissionButtonLabels(
    permission: MotionPermissionState,
    context: MotionPermissionCopyContext = 'board'
): { ariaLabel: string; buttonText: string } {
    if (permission === 'denied') {
        return {
            buttonText: 'Try again',
            ariaLabel:
                context === 'intro'
                    ? 'Request device motion permission again for this intro'
                    : 'Request device motion permission again for parallax on the board'
        };
    }

    return {
        buttonText: 'Enable motion',
        ariaLabel:
            context === 'intro'
                ? 'Enable device motion for this intro'
                : 'Enable device motion for parallax on the board'
    };
}
