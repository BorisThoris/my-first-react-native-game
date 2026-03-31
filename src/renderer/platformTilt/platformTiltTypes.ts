export interface TiltVector {
    x: number;
    y: number;
}

export type TiltSource = 'pointer' | 'gyro' | 'none';

/** Runtime-only; not persisted. */
export type MotionPermissionState = 'unsupported' | 'prompt' | 'granted' | 'denied';
