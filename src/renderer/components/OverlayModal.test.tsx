import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import OverlayModal from './OverlayModal';

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
});
