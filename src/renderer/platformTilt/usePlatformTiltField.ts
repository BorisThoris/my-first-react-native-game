import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from 'react';
import { applyDeadzoneTilt, dampTilt, zeroTilt } from './platformTiltMotion';
import { usePlatformTiltContext } from './PlatformTiltProvider';
import type { MotionPermissionState, TiltSource, TiltVector } from './platformTiltTypes';

const FIELD_DAMP = 18;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const normalizePointerInRect = (clientX: number, clientY: number, rect: DOMRect): TiltVector => {
    const x = clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const y = clamp(((clientY - rect.top) / rect.height) * 2 - 1, -1, 1);

    return applyDeadzoneTilt({ x, y });
};

export interface UsePlatformTiltFieldOptions {
    enabled: boolean;
    reduceMotion: boolean;
    surfaceRef: RefObject<HTMLElement | null>;
    /** Scales written CSS vars and tiltRef output. */
    strength?: number;
}

export interface UsePlatformTiltFieldResult {
    tiltRef: MutableRefObject<TiltVector>;
    sourceRef: MutableRefObject<TiltSource>;
    permission: MotionPermissionState;
    requestMotionPermission: () => Promise<void>;
}

export const usePlatformTiltField = ({
    enabled,
    reduceMotion,
    surfaceRef,
    strength: strengthProp = 1
}: UsePlatformTiltFieldOptions): UsePlatformTiltFieldResult => {
    const { gyroTiltRef, permission, requestMotionPermission } = usePlatformTiltContext();
    const tiltRef = useRef<TiltVector>(zeroTilt());
    const sourceRef = useRef<TiltSource>('none');
    const insiderRef = useRef(false);
    const mouseDrivingRef = useRef(false);
    const pointerTargetRef = useRef<TiltVector>(zeroTilt());
    const lastFrameRef = useRef<number | null>(null);

    const strength = strengthProp;

    const shouldUseGyro = (): boolean => {
        if (typeof window === 'undefined') {
            return false;
        }

        const fine = window.matchMedia('(pointer: fine)').matches;
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        const hybrid = fine && coarse;
        const coarseOnly = coarse && !fine;

        if (coarseOnly) {
            return true;
        }

        if (hybrid) {
            return !insiderRef.current || !mouseDrivingRef.current;
        }

        return !insiderRef.current;
    };

    useEffect(() => {
        const el = surfaceRef.current;

        if (!el) {
            return;
        }

        const onEnter = (event: PointerEvent): void => {
            insiderRef.current = true;

            if (event.pointerType === 'mouse') {
                mouseDrivingRef.current = true;
            }
        };

        const onLeave = (): void => {
            insiderRef.current = false;
            mouseDrivingRef.current = false;
            pointerTargetRef.current = zeroTilt();
        };

        const onMove = (event: PointerEvent): void => {
            if (!insiderRef.current) {
                return;
            }

            if (event.pointerType === 'mouse') {
                mouseDrivingRef.current = true;
            } else if (event.pointerType === 'touch' || event.pointerType === 'pen') {
                mouseDrivingRef.current = false;
            }

            const rect = el.getBoundingClientRect();

            if (rect.width <= 0 || rect.height <= 0) {
                return;
            }

            pointerTargetRef.current = normalizePointerInRect(event.clientX, event.clientY, rect);
        };

        el.addEventListener('pointerenter', onEnter);
        el.addEventListener('pointerleave', onLeave);
        el.addEventListener('pointermove', onMove);

        return () => {
            el.removeEventListener('pointerenter', onEnter);
            el.removeEventListener('pointerleave', onLeave);
            el.removeEventListener('pointermove', onMove);
            insiderRef.current = false;
            mouseDrivingRef.current = false;
        };
    }, [surfaceRef]);

    useEffect(() => {
        if (!enabled || reduceMotion) {
            tiltRef.current = zeroTilt();
            sourceRef.current = 'none';
            lastFrameRef.current = null;

            const el = surfaceRef.current;

            if (el) {
                el.style.removeProperty('--tilt-x');
                el.style.removeProperty('--tilt-y');
            }

            return;
        }

        let frameId = 0;

        const tick = (now: number): void => {
            const last = lastFrameRef.current ?? now;
            const dt = Math.min(0.05, (now - last) / 1000);

            lastFrameRef.current = now;

            const useGyro = shouldUseGyro();
            const target = useGyro ? gyroTiltRef.current : pointerTargetRef.current;

            if (useGyro) {
                sourceRef.current = 'gyro';
            } else if (insiderRef.current) {
                sourceRef.current = 'pointer';
            } else {
                sourceRef.current = 'none';
            }

            const effectiveTarget = useGyro || insiderRef.current ? target : zeroTilt();

            tiltRef.current = dampTilt(tiltRef.current, effectiveTarget, FIELD_DAMP, dt);

            const sx = (tiltRef.current.x * strength).toFixed(4);
            const sy = (tiltRef.current.y * strength).toFixed(4);
            const node = surfaceRef.current;

            if (node) {
                node.style.setProperty('--tilt-x', sx);
                node.style.setProperty('--tilt-y', sy);
            }

            frameId = window.requestAnimationFrame(tick);
        };

        frameId = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(frameId);
            lastFrameRef.current = null;
            const el = surfaceRef.current;

            if (el) {
                el.style.removeProperty('--tilt-x');
                el.style.removeProperty('--tilt-y');
            }
        };
    }, [enabled, reduceMotion, strength, surfaceRef, gyroTiltRef]);

    return useMemo(
        () => ({
            tiltRef,
            sourceRef,
            permission,
            requestMotionPermission
        }),
        [permission, requestMotionPermission]
    );
};
