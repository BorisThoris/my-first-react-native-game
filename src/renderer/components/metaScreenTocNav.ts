import type { MouseEvent, RefObject } from 'react';

/** TOC `href="#id"` targets live in the meta shell `.body` scrollport, not the document root. */
export function handleMetaBodyTocLinkClick(
    bodyRef: RefObject<HTMLElement | null>,
    event: MouseEvent<HTMLAnchorElement>
): void {
    const href = event.currentTarget.getAttribute('href');
    if (href == null || !href.startsWith('#')) {
        return;
    }
    const id = href.slice(1);
    if (!id) {
        return;
    }
    const host = bodyRef.current;
    if (!host) {
        return;
    }
    const target = host.querySelector(`#${CSS.escape(id)}`);
    if (!(target instanceof HTMLElement)) {
        return;
    }
    event.preventDefault();
    const pad = 8;
    const targetTop =
        target.getBoundingClientRect().top - host.getBoundingClientRect().top + host.scrollTop;
    host.scrollTop = Math.max(0, targetTop - pad);
    window.history.replaceState(null, '', href);
}
