import { useEffect, useState } from 'react';

export interface ViewportSize {
    width: number;
    height: number;
}

const readViewportSize = (): ViewportSize => {
    if (typeof window === 'undefined') {
        return { width: 1280, height: 800 };
    }

    const viewport = window.visualViewport;

    return {
        width: Math.round(viewport?.width ?? window.innerWidth),
        height: Math.round(viewport?.height ?? window.innerHeight)
    };
};

export const useViewportSize = (): ViewportSize => {
    const [viewportSize, setViewportSize] = useState(readViewportSize);

    useEffect(() => {
        const updateViewportSize = (): void => {
            setViewportSize(readViewportSize());
        };

        updateViewportSize();

        window.addEventListener('resize', updateViewportSize);
        window.addEventListener('orientationchange', updateViewportSize);
        window.visualViewport?.addEventListener('resize', updateViewportSize);

        return () => {
            window.removeEventListener('resize', updateViewportSize);
            window.removeEventListener('orientationchange', updateViewportSize);
            window.visualViewport?.removeEventListener('resize', updateViewportSize);
        };
    }, []);

    return viewportSize;
};
