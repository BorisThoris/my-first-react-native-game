import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

/**
 * WAI-ARIA toolbar pattern (vertical): one tab stop per toolbar; ArrowUp/ArrowDown/Home/End move focus.
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
 */

const FOCUSABLE = 'button:not([disabled])';

export const getToolbarButtons = (root: HTMLElement): HTMLButtonElement[] =>
    Array.from(root.querySelectorAll<HTMLButtonElement>(FOCUSABLE));

/** Set tabindex so only `active` (or first) is in tab order. */
export const syncVerticalToolbarTabIndices = (root: HTMLElement | null, active?: HTMLElement | null): void => {
    if (!root) {
        return;
    }
    const buttons = getToolbarButtons(root);
    if (buttons.length === 0) {
        return;
    }
    const preferred =
        active && buttons.includes(active as HTMLButtonElement) ? (active as HTMLButtonElement) : buttons[0];
    buttons.forEach((b) => {
        b.tabIndex = b === preferred ? 0 : -1;
    });
};

export const handleVerticalToolbarKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    const root = event.currentTarget;
    const buttons = getToolbarButtons(root);
    if (buttons.length === 0) {
        return;
    }
    const key = event.key;
    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') {
        return;
    }
    const current = document.activeElement;
    const idx = current instanceof HTMLButtonElement ? buttons.indexOf(current) : -1;
    let next = idx;
    if (key === 'Home') {
        next = 0;
    } else if (key === 'End') {
        next = buttons.length - 1;
    } else if (key === 'ArrowDown') {
        next = idx < 0 ? 0 : Math.min(buttons.length - 1, idx + 1);
    } else {
        next = idx < 0 ? buttons.length - 1 : Math.max(0, idx - 1);
    }
    if (next === idx && idx >= 0) {
        return;
    }
    event.preventDefault();
    const target = buttons[next];
    target?.focus();
    syncVerticalToolbarTabIndices(root, target);
};
