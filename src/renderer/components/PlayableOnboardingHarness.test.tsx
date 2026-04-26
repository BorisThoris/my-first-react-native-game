import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createNewRun, finishMemorizePhase } from '../../shared/game';
import { getPlayableOnboardingStep } from '../../shared/playable-onboarding';
import { createDefaultSaveData } from '../../shared/save-data';

describe('REG-026 playable onboarding harness', () => {
    it('derives prompt targets from actual first-run board actions', () => {
        const save = createDefaultSaveData();
        const run = finishMemorizePhase(createNewRun(0));
        const step = getPlayableOnboardingStep(run, save);

        render(
            <div data-testid="onboarding-harness" data-targets={step?.targetTileIds.join(',') ?? ''}>
                <strong>{step?.title}</strong>
                <span>{step?.prompt}</span>
            </div>
        );

        expect(screen.getByTestId('onboarding-harness')).toHaveAttribute('data-targets');
        expect(screen.getAllByText(/Make your first match/i)).toHaveLength(2);
    });
});
