import { describe, expect, it, vi } from 'vitest';
import {
    createRafCoalescedViewportNotifier,
    screenPointToWorld,
    type TileBoardScreenPoint
} from './tileBoardViewport';

describe('tileBoardViewport', () => {
    it('screenPointToWorld scales linearly with viewport dimensions (stable normalized ray)', () => {
        const point: TileBoardScreenPoint = { clientX: 110, clientY: 90 };
        const rect = { left: 10, top: 20, width: 200, height: 100 };

        const a = screenPointToWorld(point, rect, 400, 300);
        const b = screenPointToWorld(point, rect, 800, 600);

        expect(a.panX / 400).toBeCloseTo(b.panX / 800, 8);
        expect(a.panY / 300).toBeCloseTo(b.panY / 600, 8);
    });

    it('createRafCoalescedViewportNotifier coalesces bursts to one flush per animation frame', () => {
        const rafQueue: FrameRequestCallback[] = [];
        let nextRafId = 1;
        vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback): number => {
            rafQueue.push(cb);
            return nextRafId++;
        });
        vi.stubGlobal('cancelAnimationFrame', vi.fn());

        const flushed: Array<{ w: number; h: number }> = [];
        const n = createRafCoalescedViewportNotifier((w, h) => {
            flushed.push({ w, h });
        });

        n.schedule(100, 50);
        n.schedule(200, 60);
        n.schedule(300, 70);

        expect(flushed).toHaveLength(0);
        expect(rafQueue).toHaveLength(1);

        rafQueue[0]!(0);

        expect(flushed).toEqual([{ w: 300, h: 70 }]);

        vi.unstubAllGlobals();
    });
});
