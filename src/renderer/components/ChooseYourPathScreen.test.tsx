import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ChooseYourPathScreen from './ChooseYourPathScreen';

const viewportSnapshot = { width: 390, height: 844 };

vi.mock('./MainMenuBackground', () => ({ default: () => null }));
vi.mock('../hooks/useViewportSize', () => ({
    useViewportSize: () => viewportSnapshot
}));
vi.mock('../hooks/useFitShellZoom', () => ({
    useFitShellZoom: () => ({ fitZoom: 1 })
}));
vi.mock('../hooks/useDragScroll', () => ({
    useDragScroll: () => ({
        onPointerDownCapture: vi.fn(),
        onKeyDownCapture: vi.fn(),
        tabIndex: 0 as const
    })
}));
vi.mock('../desktop-client', () => ({
    desktopClient: { quitApp: vi.fn() }
}));
vi.mock('../audio/uiSfx', () => ({
    playMenuOpenSfx: vi.fn(),
    playUiBackSfx: vi.fn(),
    playUiClickSfx: vi.fn(),
    playUiConfirmSfx: vi.fn(),
    playUiCounterSfx: vi.fn(),
    resumeUiSfxContext: vi.fn(),
    uiSfxGainFromSettings: () => 0
}));
vi.mock('zustand/react/shallow', () => ({
    useShallow: <T,>(fn: T) => fn
}));
vi.mock('../store/useAppStore', async () => {
    const { createDefaultSaveData } = await import('../../shared/save-data');
    const saveData = createDefaultSaveData();
    const state = {
        closeSubscreen: vi.fn(),
        openSettings: vi.fn(),
        saveData,
        settings: saveData.settings,
        startDailyRun: vi.fn(),
        startDungeonShowcaseRun: vi.fn(),
        startGauntletRun: vi.fn(),
        startMeditationRun: vi.fn(),
        startMeditationRunWithMutators: vi.fn(),
        startPinVowRun: vi.fn(),
        startPracticeRun: vi.fn(),
        startPuzzleRun: vi.fn(),
        startRun: vi.fn(),
        startScholarContractRun: vi.fn(),
        startWildRun: vi.fn()
    };
    return {
        useAppStore: (selector: (s: typeof state) => unknown) => selector(state)
    };
});

describe('ChooseYourPathScreen REG-010 discoverability', () => {
    it('defaults to a Classic Run launcher with browse content open', () => {
        render(<ChooseYourPathScreen />);

        const launcher = screen.getByTestId('choose-path-launcher');
        expect(launcher).toHaveTextContent(/Classic Run/);
        expect(launcher).toHaveTextContent(/clean dungeon descent/i);
        expect(screen.getByRole('button', { name: /start run/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /hide modes/i })).toBeInTheDocument();
        expect(screen.getByTestId('choose-path-more-modes')).toBeInTheDocument();
        expect(screen.getByTestId('choose-path-offline-note')).toBeInTheDocument();
        expect(screen.getByText(/Endless Mode/)).toBeInTheDocument();
    });

    it('shows browse/search/page and locked-mode copy by default', () => {
        render(<ChooseYourPathScreen />);

        const library = screen.getByTestId('choose-path-more-modes');
        expect(library).toHaveTextContent(/Daily Challenge/);
        expect(library).toHaveTextContent(/Dungeon Showcase/);
        expect(library).toHaveTextContent(/Endless Mode/);
        expect(library).toHaveTextContent(/Locked/);
        expect(screen.getByRole('button', { name: /search modes/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /page 1 of/i })).toBeInTheDocument();
        const offlineNote = screen.getByTestId('choose-path-offline-note');
        expect(offlineNote).toHaveTextContent(/Offline-first/);
        expect(offlineNote).toHaveTextContent(/Profile/);
    });

    it('explains the dungeon showcase from Browse modes', async () => {
        const user = userEvent.setup();
        render(<ChooseYourPathScreen />);

        await user.click(screen.getByTestId('choose-path-dungeon-showcase'));

        expect(screen.getByText(/Dungeon preview/i)).toBeInTheDocument();
        expect(screen.getByText(/patrols, route exits, trap vocabulary/i)).toBeInTheDocument();
        expect(screen.getByText(/disables achievements/i)).toBeInTheDocument();
    });
});
