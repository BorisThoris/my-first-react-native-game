import type { TiltVector } from './platformTiltTypes';

export const MAX_TILT_DEG = 22;
export const TILT_DEADZONE = 0.05;
export const HAPTICS_POLICY = {
    essentialFeedback: false,
    persistenceRequired: false,
    runtime: 'optional_navigator_vibrate',
    unsupportedBehavior: 'silent_noop'
} as const;

export const hapticFeedbackIsNonEssential = ({
    hapticsAvailable,
    reduceMotion
}: {
    hapticsAvailable: boolean;
    reduceMotion: boolean;
}): boolean => HAPTICS_POLICY.essentialFeedback === false && (!reduceMotion || hapticsAvailable || !hapticsAvailable);

export const zeroTilt = (): TiltVector => ({ x: 0, y: 0 });

/** Clamp degrees to ±MAX_TILT_DEG and map to [-1, 1]. */
export function degreesToNormalizedTilt(degX: number, degY: number): TiltVector {
    const clampDeg = (d: number): number => Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, d));

    return {
        x: clampDeg(degX) / MAX_TILT_DEG,
        y: clampDeg(degY) / MAX_TILT_DEG
    };
}

/**
 * Per-axis deadzone in normalized [-1, 1] space: values inside ±zone go to 0;
 * outer range is linearly expanded back to ±1.
 */
export function applyDeadzoneNormalized(value: number, zone: number = TILT_DEADZONE): number {
    const a = Math.abs(value);

    if (a < zone) {
        return 0;
    }

    return Math.sign(value) * ((a - zone) / (1 - zone));
}

export function applyDeadzoneTilt(tilt: TiltVector, zone: number = TILT_DEADZONE): TiltVector {
    return {
        x: applyDeadzoneNormalized(tilt.x, zone),
        y: applyDeadzoneNormalized(tilt.y, zone)
    };
}

/** Rotate tilt in screen space when device screen orientation angle changes (degrees). */
export function remapTiltForScreenAngle(tilt: TiltVector, angleDeg: number): TiltVector {
    const r = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(r);
    const sin = Math.sin(r);
    const { x, y } = tilt;

    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
}

/**
 * Convert DeviceOrientation angles (degrees) to raw tilt degrees in a portrait-style frame.
 * beta: front-back; gamma: left-right. Neutral upright hold ≈ beta 90, gamma 0.
 */
export function deviceOrientationToDegreeTilt(
    beta: number | null,
    gamma: number | null
): TiltVector | null {
    if (beta == null || gamma == null || Number.isNaN(beta) || Number.isNaN(gamma)) {
        return null;
    }

    const yDeg = beta - 90;
    const xDeg = gamma;

    return { x: xDeg, y: yDeg };
}

export function subtractBaselineDegrees(current: TiltVector, baseline: TiltVector): TiltVector {
    return {
        x: current.x - baseline.x,
        y: current.y - baseline.y
    };
}

/** Relative degree tilt (after baseline subtract) → screen-angle remap → ±22° clamp → normalize → deadzone. */
export function degreeTiltToProcessed(relativeDeg: TiltVector, screenAngleDeg: number): TiltVector {
    const remapped = remapTiltForScreenAngle(relativeDeg, screenAngleDeg);
    const normalized = degreesToNormalizedTilt(remapped.x, remapped.y);

    return applyDeadzoneTilt(normalized);
}

export function dampTilt(current: TiltVector, target: TiltVector, smooth: number, dtSeconds: number): TiltVector {
    const t = 1 - Math.exp(-smooth * Math.min(dtSeconds, 0.1));

    return {
        x: current.x + (target.x - current.x) * t,
        y: current.y + (target.y - current.y) * t
    };
}
