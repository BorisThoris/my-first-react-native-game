import type { Page } from '@playwright/test';

const MEMORIZE_LABEL_RE_SRC = '^Tile (.+), row (\\d+), column (\\d+)$';

/** Two pair keys → two grid positions each (memorize-phase button aria-labels). */
export type MemorizePairPositions = Record<string, { row: number; col: number }[]>;

/**
 * Reads the level-1 memorize map from `Tile {label}, row R, column C` aria-labels on buttons.
 * Only reliable while memorize-phase labels are present (not after transition to hidden-tile labels).
 */
export async function readMemorizeSnapshot(page: Page): Promise<MemorizePairPositions | null> {
    return page.evaluate((reSrc) => {
        const re = new RegExp(reSrc, 'i');
        const record: Record<string, { row: number; col: number }[]> = {};
        for (const el of document.querySelectorAll('button')) {
            const al = el.getAttribute('aria-label');
            if (!al) {
                continue;
            }
            const m = al.match(re);
            if (!m) {
                continue;
            }
            const key = m[1].trim();
            const row = Number(m[2]);
            const col = Number(m[3]);
            if (!record[key]) {
                record[key] = [];
            }
            record[key].push({ row, col });
        }
        const keys = Object.keys(record);
        if (keys.length >= 2 && keys.every((k) => record[k].length === 2)) {
            return record;
        }
        return null;
    }, MEMORIZE_LABEL_RE_SRC);
}

/**
 * WebGL boards expose no memorize `button` nodes — pair layout comes from DEV-only `data-e2e-pair-positions`
 * on `tile-board-frame` (see `TileBoard.tsx`).
 */
export async function readDevPairPositionsFromFrame(page: Page): Promise<MemorizePairPositions | null> {
    const raw = await page.getByTestId('tile-board-frame').getAttribute('data-e2e-pair-positions');
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw) as MemorizePairPositions;
    } catch {
        return null;
    }
}
