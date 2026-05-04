import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNewRun } from '../../shared/game-core';
import InventoryScreen from './InventoryScreen';

vi.mock('zustand/react/shallow', () => ({
    useShallow: <T,>(fn: T) => fn
}));

const closeSubscreen = vi.fn();
let currentRun = {
    ...createNewRun(0),
    dungeonKeys: { iron: 1 },
    dungeonMasterKeys: 1,
    relicIds: ['peek_charge_plus_one', 'pin_cap_plus_one', 'stray_charge_plus_one']
};

beforeEach(() => {
    currentRun = {
        ...createNewRun(0),
        dungeonKeys: { iron: 1 },
        dungeonMasterKeys: 1,
        relicIds: ['peek_charge_plus_one', 'pin_cap_plus_one', 'stray_charge_plus_one']
    };
});

vi.mock('../store/useAppStore', () => ({
    useAppStore: Object.assign(
        (selector: (state: unknown) => unknown) =>
            selector({
                closeSubscreen,
                run: currentRun,
                settings: { masterVolume: 0, sfxVolume: 0 },
                saveData: { unlocks: [] }
            }),
        {
            getState: () => ({ saveData: { unlocks: [] } })
        }
    )
}));

vi.mock('../audio/uiSfx', () => ({
    playUiBackSfx: vi.fn(),
    resumeUiSfxContext: vi.fn(),
    uiSfxGainFromSettings: () => 0
}));

describe('InventoryScreen REG-079 run inventory model', () => {
    it('shows active relic archetype as the run build identity', () => {
        render(<InventoryScreen />);

        expect(screen.getByTestId('inventory-build-identity')).toHaveTextContent('The Seer');
        expect(screen.getByTestId('inventory-build-identity')).toHaveTextContent('peek, pin, read');
        expect(screen.getByTestId('inventory-build-identity')).toHaveTextContent('Peek charge');
    });

    it('shows run-scoped loadout and consumable stack rules', () => {
        render(<InventoryScreen />);

        expect(screen.getByRole('heading', { name: 'Run consumables and loadout' })).toBeInTheDocument();
        expect(screen.getByText(/Mid-run mutable/)).toBeInTheDocument();
        expect(screen.getByText(/Shuffle charge:/)).toBeInTheDocument();
        expect(screen.getByText(/Dungeon key:/)).toBeInTheDocument();
        expect(screen.getByText(/Master key:/)).toBeInTheDocument();
        expect(screen.getByText(/Loadout slots/)).toBeInTheDocument();
        expect(screen.getByTestId('inventory-prep-strip')).toHaveTextContent(/Run prep snapshot/);
        expect(screen.getByTestId('inventory-prep-strip')).toHaveTextContent(/Mutable windows/);
    });

    it('does not invent a build identity before the first relic', () => {
        currentRun = { ...createNewRun(0), dungeonKeys: { iron: 1 }, dungeonMasterKeys: 1 };
        render(<InventoryScreen />);

        expect(screen.getByTestId('inventory-meta-frame-build')).toHaveTextContent('First relic still ahead');
        expect(screen.queryByTestId('inventory-build-identity')).toBeNull();
    });
});
