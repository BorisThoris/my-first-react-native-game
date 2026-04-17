import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GameplayHudBar from '../components/GameplayHudBar';
import {
    GAMEPLAY_HUD_FIXTURE_IDS,
    gameplayHudBarFixturePropsById,
    type GameplayHudBarFixtureId
} from './hudFixtures';

describe('hudFixtures', () => {
    it('every fixture id maps to props that render GameplayHudBar', () => {
        for (const id of GAMEPLAY_HUD_FIXTURE_IDS) {
            const props = gameplayHudBarFixturePropsById[id as GameplayHudBarFixtureId];
            const { unmount } = render(<GameplayHudBar {...props} />);
            expect(screen.getByTestId('hud-polite-live-region')).toBeInTheDocument();
            unmount();
        }
    });
});
