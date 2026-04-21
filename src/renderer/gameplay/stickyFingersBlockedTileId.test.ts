import { describe, expect, it } from 'vitest';
import { getStickyBlockedTileId } from './stickyFingersBlockedTileId';

describe('getStickyBlockedTileId', () => {
    const tiles = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

    it('returns null without sticky_fingers mutator', () => {
        expect(
            getStickyBlockedTileId({
                activeMutators: [],
                flippedTileIds: [],
                stickyBlockIndex: 1,
                tiles
            })
        ).toBeNull();
    });

    it('returns null while a pair flip is in progress', () => {
        expect(
            getStickyBlockedTileId({
                activeMutators: ['sticky_fingers'],
                flippedTileIds: ['x'],
                stickyBlockIndex: 1,
                tiles
            })
        ).toBeNull();
    });

    it('returns null when stickyBlockIndex is unset', () => {
        expect(
            getStickyBlockedTileId({
                activeMutators: ['sticky_fingers'],
                flippedTileIds: [],
                stickyBlockIndex: null,
                tiles
            })
        ).toBeNull();
    });

    it('returns the tile id at stickyBlockIndex when starting a new pair', () => {
        expect(
            getStickyBlockedTileId({
                activeMutators: ['sticky_fingers'],
                flippedTileIds: [],
                stickyBlockIndex: 1,
                tiles
            })
        ).toBe('b');
    });

    it('returns null when index is out of range', () => {
        expect(
            getStickyBlockedTileId({
                activeMutators: ['sticky_fingers'],
                flippedTileIds: [],
                stickyBlockIndex: 99,
                tiles
            })
        ).toBeNull();
    });
});
