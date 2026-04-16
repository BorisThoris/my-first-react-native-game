import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GameplayHudBar from '../components/GameplayHudBar';
import {
    GAMEPLAY_HUD_FIXTURE_IDS,
    gameplayHudBarFixturePropsById,
    hudFixturePropsDaily,
    hudFixturePropsGauntlet,
    hudFixturePropsMultiMutator,
    hudFixturePropsScholar
} from './hudFixtures';

describe('hudFixtures (HUD-016)', () => {
    it('exports stable fixture ids', () => {
        expect(GAMEPLAY_HUD_FIXTURE_IDS).toEqual(['daily', 'gauntlet', 'scholar', 'multiMutator']);
    });

    it.each(GAMEPLAY_HUD_FIXTURE_IDS)('renders HUD for fixture %s', (id) => {
        render(<GameplayHudBar {...gameplayHudBarFixturePropsById[id]} />);
        expect(screen.getByTestId('game-hud')).toBeInTheDocument();
    });

    it('daily fixture shows daily strip, parasite progress, and ward readout', () => {
        render(<GameplayHudBar {...hudFixturePropsDaily} />);
        expect(screen.getByText('20260414')).toBeInTheDocument();
        expect(screen.getByText('2 / 4 floors')).toBeInTheDocument();
        expect(screen.getByTestId('hud-parasite-ward')).toHaveTextContent('Ward ×1');
    });

    it('gauntlet fixture shows timer rail', () => {
        render(<GameplayHudBar {...hudFixturePropsGauntlet} />);
        expect(screen.getByTestId('hud-chip-gauntlet')).toBeInTheDocument();
        expect(screen.getByText('245s')).toBeInTheDocument();
    });

    it('scholar fixture shows scholar chip', () => {
        render(<GameplayHudBar {...hudFixturePropsScholar} />);
        expect(screen.getByTestId('hud-chip-scholar')).toBeInTheDocument();
    });

    it('multi-mutator fixture shows several mutator chips and findables rail', () => {
        render(<GameplayHudBar {...hudFixturePropsMultiMutator} />);
        expect(screen.getByTestId('hud-mutator-chip-short_memorize')).toBeInTheDocument();
        expect(screen.getByTestId('hud-mutator-chip-n_back_anchor')).toBeInTheDocument();
        expect(screen.getByTestId('hud-mutator-chip-findables_floor')).toBeInTheDocument();
        expect(screen.getByTestId('hud-findables-claimed')).toHaveTextContent('2/2');
        expect(screen.getByTestId('hud-chip-shuffle-tax')).toBeInTheDocument();
    });
});
