import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { createDefaultSaveData } from '../shared/save-data';
import { useAppStore } from './store/useAppStore';

const resetStore = (): void => {
    const saveData = createDefaultSaveData();

    act(() => {
        useAppStore.setState({
            hydrated: false,
            hydrating: false,
            steamConnected: false,
            view: 'boot',
            settingsReturnView: 'menu',
            saveData,
            settings: saveData.settings,
            run: null,
            newlyUnlockedAchievements: []
        });
    });
};

describe('desktop app flow', () => {
    beforeEach(() => {
        window.localStorage.clear();
        resetStore();
    });

    it('hydrates to the main menu and starts an arcade run', async () => {
        const user = userEvent.setup();

        render(<App />);

        await user.click(await screen.findByRole('button', { name: /play arcade/i }));

        expect(await screen.findByRole('heading', { name: /level 1/i })).toBeInTheDocument();
        expect(screen.getByText(/pairs remaining/i)).toBeInTheDocument();
    });

    it('opens settings and persists changes through the desktop fallback bridge', async () => {
        const user = userEvent.setup();

        render(<App />);

        await user.click(await screen.findByRole('button', { name: /settings/i }));
        expect(await screen.findByRole('heading', { name: /tune the run for steam desktop play/i })).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/ui scale/i), { target: { value: '1.15' } });
        await user.click(screen.getByRole('checkbox', { name: /reduce hover lift/i }));
        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /play arcade/i })).toBeInTheDocument();
        });

        const rawSave = window.localStorage.getItem('memory-dungeon-save-data');
        expect(rawSave).not.toBeNull();

        const parsed = JSON.parse(rawSave ?? '{}') as ReturnType<typeof createDefaultSaveData>;
        expect(parsed.settings.uiScale).toBe(1.15);
        expect(parsed.settings.reduceMotion).toBe(true);
    });

    it('dismisses the how-to panel and persists the onboarding flag', async () => {
        const user = userEvent.setup();

        render(<App />);

        expect(await screen.findByRole('heading', { name: /memorize fast, play clean, protect the streak/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /dismiss/i }));

        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /memorize fast, play clean, protect the streak/i })).not.toBeInTheDocument();
        });

        const rawSave = window.localStorage.getItem('memory-dungeon-save-data');
        expect(rawSave).not.toBeNull();

        const parsed = JSON.parse(rawSave ?? '{}') as ReturnType<typeof createDefaultSaveData>;
        expect(parsed.onboardingDismissed).toBe(true);
    });

    it('pauses and resumes the run with the on-screen controls', async () => {
        const user = userEvent.setup();

        render(<App />);

        await user.click(await screen.findByRole('button', { name: /play arcade/i }));
        expect(await screen.findByRole('heading', { name: /level 1/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /pause/i }));
        const modalTitle = await screen.findByRole('heading', { name: /run paused/i });
        expect(modalTitle).toBeInTheDocument();

        const modal = modalTitle.closest('section');
        expect(modal).not.toBeNull();

        await user.click(within(modal as HTMLElement).getByRole('button', { name: /resume/i }));

        await waitFor(() => {
            expect(screen.queryByText(/run paused/i)).not.toBeInTheDocument();
        });
    });
});
