import { NotificationHost } from '@cross-repo-libs/notifications';
import '@cross-repo-libs/notifications/styles.css';
import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';
import { PlatformTiltProvider } from './platformTilt/PlatformTiltProvider';
import { RENDERER_THEME } from './styles/theme';
import './styles/global.css';
import './styles/notificationsGame.css';

export type RendererShellPlatform = 'web';

/** Theme tokens on `:root` — shared by web bootstrap and any native shell that reuses the DOM theme bridge. */
export const applyRendererThemeToDocument = (): void => {
    const html = document.documentElement;
    for (const [key, value] of Object.entries(RENDERER_THEME.cssVars)) {
        html.style.setProperty(key, value);
    }
};

export const mountRendererApp = (rootElement: HTMLElement): Root => {
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <PlatformTiltProvider>
                <NotificationHost
                    labels={{
                        closeAriaLabel: 'Dismiss tip',
                        regionAriaLabel: 'Memory Dungeon tips'
                    }}
                >
                    <App />
                </NotificationHost>
            </PlatformTiltProvider>
        </StrictMode>
    );
    return root;
};

/** Web entry: theme CSS variables + React root (single place for shell side effects). */
export const bootstrapWebRenderer = (): void => {
    applyRendererThemeToDocument();
    mountRendererApp(document.getElementById('root')!);
};
