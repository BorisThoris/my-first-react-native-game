import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import OverlayModal from './OverlayModal';
import { getOverlayDecisionPolicyRows } from '../../shared/overlay-decision-policy';

describe('OverlayModal (REF-061)', () => {
    it('Tab cycles only between modal actions while the dialog is open', async () => {
        const user = userEvent.setup();
        render(
            <OverlayModal
                actions={[
                    { label: 'Continue', onClick: () => {} },
                    { label: 'Quit', onClick: () => {} }
                ]}
                testId="unit-modal"
                title="Paused"
            />
        );

        const continueBtn = screen.getByRole('button', { name: 'Continue' });
        const quitBtn = screen.getByRole('button', { name: 'Quit' });
        continueBtn.focus();
        expect(document.activeElement).toBe(continueBtn);

        await user.tab();
        expect(document.activeElement).toBe(quitBtn);

        await user.tab();
        expect(document.activeElement).toBe(continueBtn);
    });

    it('REG-008 exposes mobile-safe scroll body and sticky action footer hooks', () => {
        render(
            <OverlayModal
                actions={[
                    { label: 'Confirm', onClick: () => {} },
                    { label: 'Cancel', onClick: () => {}, variant: 'secondary' }
                ]}
                testId="unit-modal"
                title="Floor cleared"
            >
                <p>Detailed reward, objective, relic, and shop text can scroll inside the controlled modal body.</p>
            </OverlayModal>
        );

        expect(screen.getByTestId('overlay-modal-body')).toHaveTextContent('Detailed reward');
        expect(screen.getByTestId('overlay-modal-actions')).toHaveTextContent('Confirm');
        expect(screen.getByTestId('unit-modal')).toHaveAttribute('data-overlay-size', 'decision');
    });

    it('REG-097 exposes decision sheet policy for keyboard and one-hand paths', () => {
        render(
            <OverlayModal
                actions={[
                    { label: 'Resume', onClick: () => {} },
                    { label: 'Main Menu', onClick: () => {}, variant: 'secondary' }
                ]}
                testId="unit-modal"
                title="Run paused"
            />
        );

        expect(getOverlayDecisionPolicyRows().map((row) => row.modalKind)).toEqual(['alert', 'decision', 'sheet']);
        expect(screen.getByTestId('unit-modal')).toHaveAttribute('data-keyboard-contract', 'Tab trap + initial focus + focus restore');
        expect(screen.getByTestId('unit-modal')).toHaveAttribute('data-one-hand-placement', 'sticky action rail / mobile bottom-safe area');
    });
});
