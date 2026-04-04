const FLIP_DURATION_MS = 600;
const STAGGER_MS = 32;

/** Upper bound for 3D ease-out: matches worst-case staggered FLIP on this board. */
export function computeShuffleMotionBudgetMs(tileCount: number): number {
    const n = Math.max(1, tileCount);
    if (n <= 1) {
        return FLIP_DURATION_MS + 200;
    }
    return (n - 1) * STAGGER_MS + FLIP_DURATION_MS + 160;
}
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function captureTileRects(root: HTMLElement): Map<string, DOMRect> {
    const map = new Map<string, DOMRect>();
    root.querySelectorAll<HTMLElement>('[data-tile-id]').forEach((el) => {
        const id = el.dataset.tileId;
        if (id) {
            map.set(id, el.getBoundingClientRect());
        }
    });
    return map;
}

function findTileElement(root: HTMLElement, id: string): HTMLElement | null {
    for (const el of root.querySelectorAll<HTMLElement>('[data-tile-id]')) {
        if (el.dataset.tileId === id) {
            return el;
        }
    }
    return null;
}

/**
 * FLIP: tiles appear at new grid slots; invert with translate then animate to rest.
 * Stagger by destination reading order (top-to-bottom, left-to-right).
 */
export function runShuffleFlipFromRects(root: HTMLElement, before: Map<string, DOMRect>): Promise<void> {
    type Entry = { delay: number; dx: number; dy: number; el: HTMLElement };
    const entries: Entry[] = [];

    for (const [id, beforeRect] of before) {
        const el = findTileElement(root, id);
        if (!el) {
            continue;
        }
        const after = el.getBoundingClientRect();
        const dx = beforeRect.left - after.left;
        const dy = beforeRect.top - after.top;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
            continue;
        }
        entries.push({ delay: 0, dx, dy, el });
    }

    entries.sort((a, b) => {
        const ar = a.el.getBoundingClientRect();
        const br = b.el.getBoundingClientRect();
        if (Math.abs(ar.top - br.top) > 2) {
            return ar.top - br.top;
        }
        return ar.left - br.left;
    });
    entries.forEach((entry, index) => {
        entry.delay = index * STAGGER_MS;
    });

    if (entries.length === 0) {
        return Promise.resolve();
    }

    for (const { dx, dy, el } of entries) {
        el.style.transition = 'none';
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.zIndex = '2';
    }

    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const maxDelay = entries.reduce((max, e) => Math.max(max, e.delay), 0);
                for (const { delay, el } of entries) {
                    el.style.transition = `transform ${FLIP_DURATION_MS}ms ${EASING} ${delay}ms`;
                    el.style.transform = '';
                }
                const cleanupMs = maxDelay + FLIP_DURATION_MS + 80;
                window.setTimeout(() => {
                    for (const { el } of entries) {
                        el.style.transition = '';
                        el.style.transform = '';
                        el.style.zIndex = '';
                    }
                    resolve();
                }, cleanupMs);
            });
        });
    });
}
