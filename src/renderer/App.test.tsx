import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('./components/MainMenuBackground', () => ({
    default: () => <div aria-hidden="true" data-testid="menu-background" />
}));

import App from './App';
import { createDefaultSaveData } from '../shared/save-data';
import { PlatformTiltProvider } from './platformTilt/PlatformTiltProvider';
import { useAppStore } from './store/useAppStore';

const renderApp = (): ReturnType<typeof render> =>
    render(
        <PlatformTiltProvider>
            <App />
        </PlatformTiltProvider>
    );

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

const dismissStartupIntro = async (user: ReturnType<typeof userEvent.setup>): Promise<void> => {
    await user.click(await screen.findByRole('dialog', { name: /startup relic intro/i }));
    await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /startup relic intro/i })).not.toBeInTheDocument();
    });
};

describe('desktop app flow', () => {
    beforeEach(() => {
        window.localStorage.clear();
        resetStore();
    });

    it('gates menu interaction behind the startup intro and starts an arcade run after skip', async () => {
        const user = userEvent.setup();

        renderApp();

        expect(screen.queryByRole('button', { name: /play arcade/i })).not.toBeInTheDocument();

        await dismissStartupIntro(user);
        await user.click(await screen.findByRole('button', { name: /play arcade/i }));

        expect(await screen.findByRole('heading', { name: /level 1/i })).toBeInTheDocument();
        expect(screen.getByRole('group', { name: /run stats/i })).toBeInTheDocument();
    });

    it('turns off the app-level ambient grid while the menu or game Pixi background is active', async () => {
        const user = userEvent.setup();
        const { container } = renderApp();

        await dismissStartupIntro(user);
        await screen.findByRole('button', { name: /play arcade/i });

        expect(container.firstElementChild).toHaveAttribute('data-view', 'menu');
        expect(container.firstElementChild).toHaveAttribute('data-ambient-grid', 'off');

        await user.click(screen.getByRole('button', { name: /play arcade/i }));
        await screen.findByRole('heading', { name: /level 1/i });
        expect(container.firstElementChild).toHaveAttribute('data-view', 'playing');
        expect(container.firstElementChild).toHaveAttribute('data-ambient-grid', 'off');
    });

    it('opens settings and persists changes through the desktop fallback bridge', async () => {
        const user = userEvent.setup();

        renderApp();

        await dismissStartupIntro(user);
        await user.click(await screen.findByRole('button', { name: /settings/i }));
        expect(await screen.findByRole('heading', { name: /tune the run for steam desktop play/i })).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/ui scale/i), { target: { value: '1.15' } });
        await user.click(screen.getByRole('checkbox', { name: /reduce hover lift/i }));
        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /play arcade/i })).toBeInTheDocument();
        });
        expect(screen.queryByRole('dialog', { name: /startup relic intro/i })).not.toBeInTheDocument();

        const rawSave = window.localStorage.getItem('memory-dungeon-save-data');
        expect(rawSave).not.toBeNull();

        const parsed = JSON.parse(rawSave ?? '{}') as ReturnType<typeof createDefaultSaveData>;
        expect(parsed.settings.uiScale).toBe(1.15);
        expect(parsed.settings.reduceMotion).toBe(true);
    });

    it('dismisses the how-to panel and persists the onboarding flag', async () => {
        const user = userEvent.setup();

        renderApp();

        await dismissStartupIntro(user);
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

        renderApp();

        await dismissStartupIntro(user);
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
