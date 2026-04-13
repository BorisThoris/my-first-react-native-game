import { NotificationHost } from '@cross-repo-libs/notifications';
import '@cross-repo-libs/notifications/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { PlatformTiltProvider } from './platformTilt/PlatformTiltProvider';
import { RENDERER_THEME } from './styles/theme';
import './styles/global.css';
import './styles/notificationsGame.css';

const html = document.documentElement;
for (const [key, value] of Object.entries(RENDERER_THEME.cssVars)) {
    html.style.setProperty(key, value);
}

createRoot(document.getElementById('root')!).render(
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
