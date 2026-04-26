import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultSaveData } from '../../shared/save-data';
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
    useDragScroll: () => ({ onPointerDownCapture: vi.fn() })
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
    it('surfaces selected mode, start action, browse/search state, and locked explanation above fold', () => {
        render(<ChooseYourPathScreen />);

        const discovery = screen.getByTestId('choose-path-discovery-strip');
        expect(discovery).toHaveTextContent(/Selected: Classic Run/);
        expect(discovery).toHaveTextContent(/Start selected/);
        expect(discovery).toHaveTextContent(/playable mode/);
        expect(discovery).toHaveTextContent(/Page 1 of/);
        expect(screen.getByText(/Planned post-v1 mode/)).toBeInTheDocument();
    });
});
