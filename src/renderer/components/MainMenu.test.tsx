import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultSaveData } from '../../shared/save-data';
import MainMenu from './MainMenu';

vi.mock('./MainMenuBackground', () => ({ default: () => null }));
vi.mock('../hooks/useViewportSize', () => ({
    useViewportSize: () => ({ width: 640, height: 390 })
}));
vi.mock('../hooks/useFitShellZoom', () => ({
    useFitShellZoom: () => ({ fitZoom: 1 })
}));
vi.mock('../platformTilt/usePlatformTiltField', () => ({
    usePlatformTiltField: () => ({ tiltRef: { current: null } })
}));
vi.mock('../desktop-client', () => ({
    desktopClient: { quitApp: vi.fn() }
}));
vi.mock('../audio/uiSfx', () => ({
    playMenuOpenSfx: vi.fn(),
    playUiBackSfx: vi.fn(),
    playUiClickSfx: vi.fn(),
    resumeUiSfxContext: vi.fn(),
    uiSfxGainFromSettings: () => 0
}));
vi.mock('zustand/react/shallow', () => ({
    useShallow: <T,>(fn: T) => fn
}));
vi.mock('../store/useAppStore', () => ({
    useAppStore: (selector: (state: unknown) => unknown) =>
        selector({
            achievementBridgeNotice: null,
            clearAchievementBridgeNotice: vi.fn(),
            persistenceWriteNotice: null,
            clearPersistenceWriteNotice: vi.fn()
        })
}));

describe('MainMenu REG-009 mobile landscape density', () => {
    it('keeps Play dominant and secondary actions in a compact group', () => {
        render(
            <MainMenu
                bestScore={0}
                lastRunSummary={null}
                onDismissHowToPlay={async () => undefined}
                onOpenCodex={vi.fn()}
                onOpenCollection={vi.fn()}
                onOpenInventory={vi.fn()}
                onOpenSettings={vi.fn()}
                onPlay={vi.fn()}
                reduceMotion
                saveData={createDefaultSaveData()}
                showHowToPlay={false}
                steamConnected={false}
            />
        );

        expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Collection' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
        expect(screen.getByTestId('main-menu-hub-quality-strip')).toHaveTextContent(/Trust/i);
        expect(screen.getByTestId('main-menu-profile-strip')).toHaveTextContent(/Single-device save/i);
    });
});
