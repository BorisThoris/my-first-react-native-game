import { describe, expect, it } from 'vitest';
import { computeFitShellZoomFactor } from './useFitShellZoom';

/** Documents unwrap math used in `useFitShellZoom` (zoomed box → intrinsic). */
const intrinsicFromZoomed = (size: number, appliedZoom: number): number => Math.max(2, size / Math.max(0.02, appliedZoom));

describe('computeFitShellZoomFactor', () => {
    it('returns 1 when content fits', () => {
        expect(
            computeFitShellZoomFactor({
                contentHeight: 400,
                contentWidth: 600,
                padding: 14,
                viewportHeight: 800,
                viewportWidth: 1000
            })
        ).toBe(1);
    });

    it('scales down when content is taller than available height', () => {
        const z = computeFitShellZoomFactor({
            contentHeight: 1000,
            contentWidth: 800,
            padding: 12,
            viewportHeight: 600,
            viewportWidth: 900
        });
        expect(z).toBeLessThan(1);
        expect(z).toBeCloseTo(576 / 1000, 2);
    });

    it('scales down for dead-zone width (900) with short height', () => {
        const z = computeFitShellZoomFactor({
            contentHeight: 900,
            contentWidth: 850,
            padding: 12,
            viewportHeight: 700,
            viewportWidth: 900
        });
        expect(z).toBeLessThan(1);
        const availH = 700 - 24;
        expect(z).toBeLessThanOrEqual(availH / 900 + 0.002);
    });

    it('returns 1 for degenerate content size', () => {
        expect(
            computeFitShellZoomFactor({
                contentHeight: 1,
                contentWidth: 100,
                viewportHeight: 600,
                viewportWidth: 800
            })
        ).toBe(1);
    });

    it('unwraps zoomed layout height before comparing to viewport', () => {
        const appliedZoom = 0.5;
        const hAtZoom = 400;
        const intrinsicH = intrinsicFromZoomed(hAtZoom, appliedZoom);
        expect(intrinsicH).toBe(800);
        const z = computeFitShellZoomFactor({
            contentHeight: intrinsicH,
            contentWidth: 900,
            padding: 0,
            viewportHeight: 720,
            viewportWidth: 1280
        });
        expect(z).toBeCloseTo(720 / 800, 3);
    });
});
