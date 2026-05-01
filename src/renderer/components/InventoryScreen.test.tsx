import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createNewRun } from '../../shared/game-core';
import InventoryScreen from './InventoryScreen';

vi.mock('zustand/react/shallow', () => ({
    useShallow: <T,>(fn: T) => fn
}));

const closeSubscreen = vi.fn();
const run = { ...createNewRun(0), dungeonKeys: { iron: 1 }, dungeonMasterKeys: 1 };

vi.mock('../store/useAppStore', () => ({
    useAppStore: Object.assign(
        (selector: (state: unknown) => unknown) =>
            selector({
                closeSubscreen,
                run,
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
});
