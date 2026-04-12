import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

export interface UseFitShellZoomArgs {
    /** Element whose intrinsic `offsetWidth` / `offsetHeight` define the unscaled shell size. */
    measureRef: RefObject<HTMLElement | null>;
    viewportWidth: number;
    viewportHeight: number;
    /** Inset from each edge when comparing to the viewport (CSS px). */
    padding?: number;
    /** Disable fit zoom entirely when the shell should not scale (caller applies zoom: 1). */
    enabled?: boolean;
    /** Re-run fit measurement when shell content changes without a viewport resize (e.g. tab/category switch). */
    recomputeKey?: unknown;
}

export interface ComputeFitShellZoomFactorArgs {
    viewportWidth: number;
    viewportHeight: number;
    contentWidth: number;
    contentHeight: number;
    padding?: number;
}

/**
 * Pure zoom factor for unit tests and documentation (same math as the hook).
 * Returns a value in (0, 1] capped at 1 when the content already fits.
 */
export function computeFitShellZoomFactor({
    viewportWidth,
    viewportHeight,
    contentWidth,
    contentHeight,
    padding = 14
}: ComputeFitShellZoomFactorArgs): number {
    if (viewportWidth < 1 || viewportHeight < 1 || contentWidth < 2 || contentHeight < 2) {
        return 1;
    }
    const availW = Math.max(1, viewportWidth - padding * 2);
    const availH = Math.max(1, viewportHeight - padding * 2);
    const raw = Math.min(1, availW / contentWidth, availH / contentHeight);
    return Math.round(raw * 1000) / 1000;
}

/**
 * Uniform zoom so a meta shell fits the viewport without scrolling (Chromium / Electron primary).
 * Apply `style={{ zoom: fitZoom }}` on the **first child** of `measureRef` (wrapper has no zoom).
 *
 * Measured `offsetWidth` / `offsetHeight` on the wrapper already reflect the **current** zoom.
 * Dividing by the **currently applied** zoom (from the zoomed child’s inline style when present)
 * recovers ~intrinsic size. We intentionally **do not** use ResizeObserver on the shell wrapper:
 * zoom changes the box size, so observing it caused a slow shrink loop until zoom bottomed out.
 */
export function useFitShellZoom({
    measureRef,
    viewportWidth,
    viewportHeight,
    padding = 14,
    enabled = true,
    recomputeKey
}: UseFitShellZoomArgs): { fitZoom: number } {
    const [fitZoom, setFitZoom] = useState(1);
    const appliedZoomRef = useRef(1);

    useLayoutEffect(() => {
        if (!enabled) {
            /* Fit disabled: snap zoom back to 1 when toggled off (ResizeObserver path is inactive). */
            appliedZoomRef.current = 1;
            // eslint-disable-next-line react-hooks/set-state-in-effect -- sync reset before return; no external subscription
            setFitZoom(1);
            return;
        }

        const el = measureRef.current;
        if (!el || viewportWidth < 1 || viewportHeight < 1) {
            return;
        }

        let raf = 0;
        let delayed = 0;
        let cancelled = false;

        const recompute = (): void => {
            const node = measureRef.current;
            if (!node || cancelled) {
                return;
            }
            const inner = node.firstElementChild instanceof HTMLElement ? node.firstElementChild : null;
            const parsedZoom = inner?.style?.zoom ? Number.parseFloat(inner.style.zoom) : Number.NaN;
            const s =
                Number.isFinite(parsedZoom) && parsedZoom >= 0.02
                    ? parsedZoom
                    : Math.max(0.02, appliedZoomRef.current);
            const wAtZoom = node.offsetWidth;
            const hAtZoom = node.offsetHeight;
            if (wAtZoom < 2 || hAtZoom < 2) {
                return;
            }
            const intrinsicW = Math.max(2, wAtZoom / s);
            const intrinsicH = Math.max(2, hAtZoom / s);
            const next = computeFitShellZoomFactor({
                viewportWidth,
                viewportHeight,
                contentWidth: intrinsicW,
                contentHeight: intrinsicH,
                padding
            });
            setFitZoom((prev) => {
                if (Math.abs(prev - next) < 0.004) {
                    appliedZoomRef.current = prev;
                    return prev;
                }
                appliedZoomRef.current = next;
                return next;
            });
        };

        /** Double rAF: run after layout + fonts/paint for stable box metrics. */
        const schedule = (): void => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                requestAnimationFrame(recompute);
            });
        };

        schedule();

        const fontsDone = document.fonts?.ready?.then(() => {
            if (!cancelled) {
                schedule();
            }
        });

        delayed = window.setTimeout(() => {
            if (!cancelled) {
                schedule();
            }
        }, 420);

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            window.clearTimeout(delayed);
            void fontsDone;
        };
    }, [measureRef, viewportWidth, viewportHeight, padding, enabled, recomputeKey]);

    return { fitZoom };
}
