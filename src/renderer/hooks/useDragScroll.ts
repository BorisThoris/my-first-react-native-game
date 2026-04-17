import {
    useCallback,
    type KeyboardEvent as ReactKeyboardEvent,
    type PointerEvent as ReactPointerEvent,
    type RefObject
} from 'react';

/** Pixels of horizontal movement before a library mode card press becomes a drag (preserves tap-to-run). */
const LIBRARY_CARD_DRAG_SLOP_PX = 7;

function suppressNextDocumentClick(): void {
    const handler = (e: MouseEvent): void => {
        e.preventDefault();
        e.stopImmediatePropagation();
        document.removeEventListener('click', handler, true);
    };
    document.addEventListener('click', handler, true);
}

/**
 * Pointer-drag horizontal scrolling for overflow-x containers (desktop parity with touch swipe).
 *
 * Keyboard: `tabIndex={0}` plus capture-phase Arrow/Page/Home/End on the scroller (including when
 * focus is on nested controls). Skips when the event targets editable fields.
 *
 * - Skips drag when the pointer targets form controls, links, or Gauntlet duration buttons.
 * - Library mode rows are `<button>` inside `[data-library-card-cell]` (stable; CSS module class names are
 *   hashed and must not be used in `closest()`). Those presses use a movement slop so a tap still fires
 *   `click`, while a drag scrolls the tray. Gauntlet preset buttons live under `[data-gauntlet-presets]`.
 * - Other non-interactive surfaces inside the scroller drag immediately (legacy behavior).
 *
 * **Modals:** When an `aria-modal="true"` dialog is mounted (e.g. gameplay `OverlayModal`), pointer and keyboard
 * scrolling here is skipped so background trays do not steal focus from the modal surface. Wheel/trackpad on
 * the page behind a full-screen scrim is contained via `overscroll-behavior` + backdrop wheel handling on
 * the modal (see `OverlayModal.module.css`).
 *
 * **Reduced motion:** Arrow/Page scrolling uses `behavior: 'smooth'` only when
 * `prefers-reduced-motion: no-match` / reduce-motion is off (see handlers below).
 */
function isModalDialogActive(): boolean {
    if (typeof document === 'undefined') {
        return false;
    }
    return document.querySelector('[role="dialog"][aria-modal="true"]') != null;
}

export function useDragScroll(scrollerRef: RefObject<HTMLElement | null>): {
    onPointerDownCapture: (event: ReactPointerEvent<HTMLElement>) => void;
    /** Capture phase so Arrow keys work while focus is on nested tiles (e.g. library `<button>`s). */
    onKeyDownCapture: (event: ReactKeyboardEvent<HTMLElement>) => void;
    tabIndex: 0;
} {
    const onKeyDownCapture = useCallback(
        (event: ReactKeyboardEvent<HTMLElement>) => {
            if (isModalDialogActive()) {
                return;
            }
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
            const { key } = event;
            if (
                key !== 'ArrowLeft' &&
                key !== 'ArrowRight' &&
                key !== 'Home' &&
                key !== 'End' &&
                key !== 'PageUp' &&
                key !== 'PageDown'
            ) {
                return;
            }
            const t = event.target;
            if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) {
                return;
            }
            if (t instanceof HTMLElement && t.isContentEditable) {
                return;
            }

            const el = scrollerRef.current;
            if (!el) {
                return;
            }
            const w = el.clientWidth;
            if (w <= 0) {
                return;
            }
            const maxLeft = Math.max(0, el.scrollWidth - w);
            if (maxLeft <= 0) {
                return;
            }

            const smoothOk =
                typeof window !== 'undefined' &&
                typeof window.matchMedia === 'function' &&
                !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const behavior: ScrollBehavior = smoothOk ? 'smooth' : 'auto';

            event.preventDefault();
            switch (key) {
                case 'ArrowLeft':
                case 'PageUp':
                    el.scrollBy({ left: -w, behavior });
                    break;
                case 'ArrowRight':
                case 'PageDown':
                    el.scrollBy({ left: w, behavior });
                    break;
                case 'Home':
                    el.scrollTo({ left: 0, behavior });
                    break;
                case 'End':
                    el.scrollTo({ left: maxLeft, behavior });
                    break;
            }
        },
        [scrollerRef]
    );

    const onPointerDownCapture = useCallback(
        (event: ReactPointerEvent<HTMLElement>) => {
            if (isModalDialogActive()) {
                return;
            }
            if (event.button !== 0) {
                return;
            }
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            if (target.closest('input, textarea, select, a')) {
                return;
            }
            if (target.closest('[data-gauntlet-presets] button')) {
                return;
            }

            const el = scrollerRef.current;
            if (!el) {
                return;
            }

            if (target.closest('[data-library-card-cell] button')) {
                startLibraryCardDrag(event, el);
                return;
            }

            if (target.closest('button, [role="button"]')) {
                return;
            }

            const startX = event.clientX;
            const startScroll = el.scrollLeft;
            const pointerId = event.pointerId;
            try {
                el.setPointerCapture(pointerId);
            } catch {
                return;
            }
            const onMove = (ev: PointerEvent): void => {
                if (ev.pointerId !== pointerId) {
                    return;
                }
                el.scrollLeft = startScroll - (ev.clientX - startX);
            };
            const onEnd = (): void => {
                el.removeEventListener('pointermove', onMove);
                el.removeEventListener('pointerup', onEnd);
                el.removeEventListener('pointercancel', onEnd);
                try {
                    el.releasePointerCapture(pointerId);
                } catch {
                    /* ignore */
                }
            };
            el.addEventListener('pointermove', onMove);
            el.addEventListener('pointerup', onEnd);
            el.addEventListener('pointercancel', onEnd);
        },
        [scrollerRef]
    );

    return { onPointerDownCapture, onKeyDownCapture, tabIndex: 0 as const };
}

function startLibraryCardDrag(event: ReactPointerEvent<HTMLElement>, el: HTMLElement): void {
    const startX = event.clientX;
    const startScroll = el.scrollLeft;
    const pointerId = event.pointerId;
    let dragging = false;

    const cleanupWindow = (): void => {
        window.removeEventListener('pointermove', onWindowMove);
        window.removeEventListener('pointerup', onWindowUpEarly);
        window.removeEventListener('pointercancel', onWindowUpEarly);
    };

    const onWindowMove = (ev: PointerEvent): void => {
        if (ev.pointerId !== pointerId) {
            return;
        }
        const dx = ev.clientX - startX;
        if (!dragging) {
            if (Math.abs(dx) < LIBRARY_CARD_DRAG_SLOP_PX) {
                return;
            }
            dragging = true;
            cleanupWindow();
            try {
                el.setPointerCapture(pointerId);
            } catch {
                return;
            }

            const onElMove = (e2: PointerEvent): void => {
                if (e2.pointerId !== pointerId) {
                    return;
                }
                el.scrollLeft = startScroll - (e2.clientX - startX);
            };
            const onElEnd = (e2: PointerEvent): void => {
                if (e2.pointerId !== pointerId) {
                    return;
                }
                el.removeEventListener('pointermove', onElMove);
                el.removeEventListener('pointerup', onElEnd);
                el.removeEventListener('pointercancel', onElEnd);
                try {
                    el.releasePointerCapture(pointerId);
                } catch {
                    /* ignore */
                }
                suppressNextDocumentClick();
            };
            el.addEventListener('pointermove', onElMove);
            el.addEventListener('pointerup', onElEnd);
            el.addEventListener('pointercancel', onElEnd);
            el.scrollLeft = startScroll - dx;
            return;
        }
    };

    const onWindowUpEarly = (ev: PointerEvent): void => {
        if (ev.pointerId !== pointerId) {
            return;
        }
        cleanupWindow();
    };

    window.addEventListener('pointermove', onWindowMove);
    window.addEventListener('pointerup', onWindowUpEarly);
    window.addEventListener('pointercancel', onWindowUpEarly);
}
