import { describe, expect, it } from 'vitest';
import { createNewRun, finishMemorizePhase } from './game-core';
import { flipTile } from './turn-resolution';
import { getPlayableOnboardingStep } from './playable-onboarding';

describe('REG-026 playable onboarding', () => {
    it('guides a fresh first floor by actual board state and target tiles', () => {
        const run = finishMemorizePhase(createNewRun(0));
        const first = getPlayableOnboardingStep(run, { onboardingDismissed: false, powersFtueSeen: false });

        expect(first?.id).toBe('first_match');
        expect(first?.targetTileIds).toHaveLength(2);

        const afterOneFlip = flipTile(run, first!.targetTileIds[0]!);
        const second = getPlayableOnboardingStep(afterOneFlip, { onboardingDismissed: false, powersFtueSeen: false });
        expect(second?.id).toBe('first_match');
        expect(second?.targetTileIds).toContain(first!.targetTileIds[1]);
    });

    it('stops appearing for completed onboarding profiles and after the guided floor', () => {
        const run = finishMemorizePhase(createNewRun(0));
        expect(getPlayableOnboardingStep(run, { onboardingDismissed: true, powersFtueSeen: false })).toBeNull();
        expect(getPlayableOnboardingStep(run, { onboardingDismissed: false, powersFtueSeen: true })).toBeNull();

        const laterRun = {
            ...run,
            board: run.board ? { ...run.board, level: 3 } : null
        };
        expect(getPlayableOnboardingStep(laterRun, { onboardingDismissed: false, powersFtueSeen: false })).toBeNull();
    });
});
