import { MODAL_PROGRAMMATIC_FOCUS_OPTIONS } from './focusables';

const stack: Array<HTMLElement | null> = [];

/**
 * Call on modal open (after mount). Pairs with {@link popModalFocusSnapshot} on unmount.
 * Nested modals stack in LIFO order so each close restores the prior opener.
 */
export const pushModalFocusSnapshot = (): void => {
    const el = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    stack.push(el);
};

const isSafeRestoreTarget = (el: HTMLElement | null): el is HTMLElement => {
    if (!el) {
        return false;
    }
    if (el === document.body) {
        return false;
    }
    return document.contains(el);
};

/** Restore focus from the last {@link pushModalFocusSnapshot} (typically in modal useEffect cleanup). */
export const popModalFocusSnapshot = (): void => {
    const el = stack.pop() ?? null;
    if (isSafeRestoreTarget(el)) {
        el.focus(MODAL_PROGRAMMATIC_FOCUS_OPTIONS);
    }
};
