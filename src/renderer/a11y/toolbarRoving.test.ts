import { describe, expect, it } from 'vitest';
import {
    popVerticalToolbarRovingPause,
    pushVerticalToolbarRovingPause,
    syncVerticalToolbarTabIndices
} from './toolbarRoving';

describe('toolbarRoving (REF-061)', () => {
    it('pushVerticalToolbarRovingPause removes toolbar buttons from tab order; pop restores roving', () => {
        document.body.innerHTML = `
            <div role="toolbar" data-testid="tb">
                <button type="button">a</button>
                <button type="button">b</button>
            </div>
        `;
        const toolbar = document.querySelector<HTMLElement>('[data-testid="tb"]')!;
        const buttons = toolbar.querySelectorAll('button');
        syncVerticalToolbarTabIndices(toolbar);
        expect(buttons[0]!.tabIndex).toBe(0);
        expect(buttons[1]!.tabIndex).toBe(-1);

        pushVerticalToolbarRovingPause();
        expect(buttons[0]!.tabIndex).toBe(-1);
        expect(buttons[1]!.tabIndex).toBe(-1);

        popVerticalToolbarRovingPause();
        expect(buttons[0]!.tabIndex).toBe(0);
        expect(buttons[1]!.tabIndex).toBe(-1);
    });
});
