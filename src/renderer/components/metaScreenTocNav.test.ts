import type { MouseEvent } from 'react';
import type { RefObject } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { handleMetaBodyTocLinkClick } from './metaScreenTocNav';

describe('handleMetaBodyTocLinkClick', () => {
    it('sets host scrollTop from target position and updates the hash', () => {
        vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

        const host = document.createElement('div');
        const target = document.createElement('div');
        target.id = 'codex-core';
        host.appendChild(target);

        let scrollTop = 0;
        Object.defineProperty(host, 'scrollTop', {
            configurable: true,
            get: (): number => scrollTop,
            set: (v: number): void => {
                scrollTop = v;
            }
        });

        vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect);
        vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top: 500 } as DOMRect);

        const ref: RefObject<HTMLElement | null> = { current: host };
        const a = document.createElement('a');
        a.setAttribute('href', '#codex-core');
        const ev = {
            preventDefault: vi.fn(),
            currentTarget: a
        } as unknown as MouseEvent<HTMLAnchorElement>;

        handleMetaBodyTocLinkClick(ref, ev);

        expect(ev.preventDefault).toHaveBeenCalled();
        expect(scrollTop).toBe(500 - 100 - 8);
        expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '#codex-core');
    });
});
