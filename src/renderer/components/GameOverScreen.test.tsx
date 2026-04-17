import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { RunState } from '../../shared/contracts';
import { createNewRun, createRunSummary, finishMemorizePhase } from '../../shared/game';
import GameOverScreen from './GameOverScreen';

vi.mock('./MainMenuBackground', () => ({ default: () => null }));
vi.mock('../hooks/useViewportSize', () => ({
    useViewportSize: () => ({ width: 1280, height: 800 })
}));
vi.mock('../platformTilt/usePlatformTiltField', () => ({
    usePlatformTiltField: () => ({ tiltRef: { current: null } })
}));
vi.mock('zustand/react/shallow', () => ({
    useShallow: <T,>(fn: T) => fn
}));
vi.mock('../store/useAppStore', () => ({
    useAppStore: (selector: (s: never) => unknown) =>
        selector({
            goToMenu: vi.fn(),
            restartRun: vi.fn(),
            settings: {
                reduceMotion: true,
                graphicsQuality: 'high',
                uiScale: 1
            }
        } as never)
}));

const gameOverRunFixture = (): RunState => {
    let run = finishMemorizePhase(createNewRun(100, { practiceMode: true, runSeed: 0xabc }));
    run = { ...run, status: 'gameOver', lives: 0 };
    return createRunSummary(run, []);
};

describe('GameOverScreen (REF-031)', () => {
    it('exposes a single page title and polite run summary for assistive tech', () => {
        render(<GameOverScreen run={gameOverRunFixture()} />);

        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
        expect(screen.getByRole('heading', { level: 1, name: 'Expedition Over' })).toBeInTheDocument();

        const polite = screen.getByLabelText('Run summary announcement');
        expect(polite).toHaveAttribute('aria-live', 'polite');
        expect(polite).toHaveTextContent(/Expedition complete/);

        expect(screen.getByRole('button', { name: 'Play Again — start a new run after this expedition' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Return to the main menu' })).toBeInTheDocument();
    });

    it('uses a second-level heading for unlocked achievements', () => {
        const run = gameOverRunFixture();
        const withAchievement: RunState = {
            ...run,
            lastRunSummary: run.lastRunSummary
                ? {
                      ...run.lastRunSummary,
                      unlockedAchievements: ['ACH_FIRST_CLEAR']
                  }
                : null
        };
        render(<GameOverScreen run={withAchievement} />);

        expect(screen.getByRole('heading', { level: 2, name: 'New archive entries' })).toBeInTheDocument();
    });
});
