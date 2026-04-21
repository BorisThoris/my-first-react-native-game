import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createDailyRun, createNewRun, finishMemorizePhase } from '../../shared/game';
import GameplayHudBar from './GameplayHudBar';

describe('GameplayHudBar', () => {
    it('shows endless archetype, featured objective, and favor progress on scheduled endless floors', () => {
        const run = {
            ...finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false })),
            relicFavorProgress: 2
        };

        render(
            <GameplayHudBar
                cameraViewportMode={false}
                gauntletRemainingMs={null}
                politeHudAnnouncement=""
                run={run}
            />
        );

        expect(screen.getByTestId('hud-endless-archetype').textContent).toContain('Survey Hall');
        expect(screen.getByTestId('hud-featured-objective').textContent).toContain('Flip par');
        expect(screen.getByTestId('hud-favor-progress').textContent).toContain('2/3');
    });

    it('does not show favor UI on non-endless runs', () => {
        const run = finishMemorizePhase(createDailyRun(0, { echoFeedbackEnabled: false }));

        render(
            <GameplayHudBar
                cameraViewportMode={false}
                gauntletRemainingMs={null}
                politeHudAnnouncement=""
                run={run}
            />
        );

        expect(screen.queryByTestId('hud-endless-archetype')).toBeNull();
        expect(screen.queryByTestId('hud-featured-objective')).toBeNull();
        expect(screen.queryByTestId('hud-favor-progress')).toBeNull();
    });
});
