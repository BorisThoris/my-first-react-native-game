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

const originalMatchMedia = window.matchMedia;
const originalVisualViewport = window.visualViewport;
const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;

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
        expect(screen.getByRole('button', { name: /play arcade/i })).toBeInTheDocument();
        expect(screen.queryByRole('dialog', { name: /startup relic intro/i })).not.toBeInTheDocument();
    }, { timeout: 3000 });
};

describe('desktop app flow', () => {
    beforeEach(() => {
        window.localStorage.clear();
        window.matchMedia = originalMatchMedia;
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth, writable: true });
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalInnerHeight, writable: true });
        Object.defineProperty(window, 'visualViewport', {
            configurable: true,
            value: originalVisualViewport
        });
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
        expect(await screen.findByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
        expect(screen.queryByLabelText(/ui scale/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/debug tools/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('checkbox', { name: /reduce motion/i })).not.toBeInTheDocument();
        expect(screen.getByLabelText(/volume/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^close$/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^back$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled();

        fireEvent.change(screen.getByLabelText(/volume/i), { target: { value: '0.45' } });
        expect(screen.getByRole('button', { name: /^save$/i })).toBeEnabled();
        await user.click(screen.getByRole('button', { name: /^save$/i }));

        await waitFor(() => {
            expect(window.localStorage.getItem('memory-dungeon-save-data')).not.toBeNull();
        });
        expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
        expect(screen.queryByRole('dialog', { name: /startup relic intro/i })).not.toBeInTheDocument();

        const rawSave = window.localStorage.getItem('memory-dungeon-save-data');
        expect(rawSave).not.toBeNull();

        const parsed = JSON.parse(rawSave ?? '{}') as ReturnType<typeof createDefaultSaveData>;
        expect(parsed.settings.masterVolume).toBe(0.45);
        expect(parsed.settings.reduceMotion).toBe(false);

        await user.click(screen.getByRole('button', { name: /^back$/i }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /play arcade/i })).toBeInTheDocument();
        });
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

    it('opens run settings as a modal over the board', async () => {
        const user = userEvent.setup();

        renderApp();

        await dismissStartupIntro(user);
        await user.click(await screen.findByRole('button', { name: /play arcade/i }));
        expect(await screen.findByRole('heading', { name: /level 1/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /settings/i }));

        const dialog = await screen.findByRole('dialog', { name: /run settings/i });
        expect(dialog).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /level 1/i })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: /run paused/i })).not.toBeInTheDocument();
        expect(within(dialog).queryByLabelText(/ui scale/i)).not.toBeInTheDocument();
        expect(within(dialog).queryByText(/debug tools/i)).not.toBeInTheDocument();
        expect(within(dialog).queryByRole('checkbox', { name: /reduce motion/i })).not.toBeInTheDocument();
        expect(within(dialog).getByLabelText(/volume/i)).toBeInTheDocument();
        expect(within(dialog).queryByRole('button', { name: /^close$/i })).not.toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: /^back$/i })).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: /^save$/i })).toBeDisabled();

        fireEvent.change(within(dialog).getByLabelText(/volume/i), { target: { value: '0.35' } });
        expect(within(dialog).getByRole('button', { name: /^save$/i })).toBeEnabled();
        await user.click(within(dialog).getByRole('button', { name: /^save$/i }));

        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: /run settings/i })).toBeInTheDocument();
        });

        await user.click(within(dialog).getByRole('button', { name: /^back$/i }));

        await waitFor(() => {
            expect(screen.queryByRole('dialog', { name: /run settings/i })).not.toBeInTheDocument();
        });
        expect(screen.getByRole('heading', { name: /level 1/i })).toBeInTheDocument();
    });

    it('shows the Fit board control in the gameplay camera viewport', async () => {
        const user = userEvent.setup();

        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390, writable: true });
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844, writable: true });
        Object.defineProperty(window, 'visualViewport', {
            configurable: true,
            value: {
                width: 390,
                height: 844,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            }
        });
        window.matchMedia = vi.fn((query: string) => ({
            matches: query.includes('pointer: coarse'),
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
            onchange: null
        })) as typeof window.matchMedia;

        renderApp();

        await dismissStartupIntro(user);
        await user.click(await screen.findByRole('button', { name: /play arcade/i }));

        expect(await screen.findByRole('button', { name: /fit board/i })).toBeInTheDocument();
    });

    it('shows the Fit board control on desktop gameplay too', async () => {
        const user = userEvent.setup();

        renderApp();

        await dismissStartupIntro(user);
        await user.click(await screen.findByRole('button', { name: /play arcade/i }));

        expect(await screen.findByRole('button', { name: /fit board/i })).toBeInTheDocument();
    });
});
