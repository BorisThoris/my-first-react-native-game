import { type RefObject, useLayoutEffect, useState } from 'react';

export interface UseFitShellZoomArgs {
    /** Element whose intrinsic `offsetWidth` / `offsetHeight` define the unscaled shell size. */
    measureRef: RefObject<HTMLElement | null>;
    viewportWidth: number;
    viewportHeight: number;
    /** Inset from each edge when comparing to the viewport (CSS px). */
    padding?: number;
}

/**
 * Uniform zoom so a meta shell fits the viewport without scrolling (Chromium / Electron primary).
 * Parent applies `style={{ zoom: fitZoom }}` around `measureRef`’s subtree.
 */
export function useFitShellZoom({
    measureRef,
    viewportWidth,
    viewportHeight,
    padding = 14
}: UseFitShellZoomArgs): { fitZoom: number } {
    const [fitZoom, setFitZoom] = useState(1);

    useLayoutEffect(() => {
        const el = measureRef.current;
        if (!el || viewportWidth < 1 || viewportHeight < 1) {
            return;
        }

        let raf = 0;

        const recompute = (): void => {
            const node = measureRef.current;
            if (!node) {
                return;
            }
            const inner = node.firstElementChild instanceof HTMLElement ? node.firstElementChild : null;
            const w = inner ? Math.max(inner.scrollWidth, inner.offsetWidth) : node.offsetWidth;
            const h = inner ? Math.max(inner.scrollHeight, inner.offsetHeight) : node.offsetHeight;
            if (w < 2 || h < 2) {
                return;
            }
            const availW = Math.max(1, viewportWidth - padding * 2);
            const availH = Math.max(1, viewportHeight - padding * 2);
            const raw = Math.min(1, availW / w, availH / h);
            const next = Math.round(raw * 1000) / 1000;
            setFitZoom((prev) => (Math.abs(prev - next) < 0.003 ? prev : next));
        };

        const schedule = (): void => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(recompute);
        };

        schedule();
        const ro = new ResizeObserver(schedule);
        ro.observe(el);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, [measureRef, viewportWidth, viewportHeight, padding]);

    return { fitZoom };
}
