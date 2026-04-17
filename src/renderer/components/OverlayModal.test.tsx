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
});
