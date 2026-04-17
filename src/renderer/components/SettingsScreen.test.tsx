import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDefaultSaveData } from '../../shared/save-data';
import { useAppStore } from '../store/useAppStore';
import SettingsScreen from './SettingsScreen';

vi.mock('../hooks/useViewportSize', () => ({
    useViewportSize: () => ({ width: 1280, height: 800 })
}));

describe('SettingsScreen', () => {
    beforeEach(() => {
        const saveData = createDefaultSaveData();
        useAppStore.setState({
            hydrated: true,
            saveData,
            settings: saveData.settings,
            closeSettings: vi.fn(),
            updateSettings: vi.fn().mockResolvedValue(undefined)
        });
    });

    it('opens a confirmation when Back is pressed with a dirty draft', async () => {
        const user = userEvent.setup();
        render(<SettingsScreen presentation="page" />);

        await user.click(screen.getByRole('button', { name: /accessibility/i }));
        const reduceMotion = screen.getByRole('checkbox', { name: /reduce motion/i });
        await user.click(reduceMotion);

        await user.click(screen.getByRole('button', { name: 'Back' }));

        expect(screen.getByTestId('settings-unsaved-back-modal')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Discard' }));

        expect(useAppStore.getState().closeSettings).toHaveBeenCalled();
    });
});
