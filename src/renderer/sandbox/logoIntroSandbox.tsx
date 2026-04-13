import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import StartupIntro from '../components/StartupIntro';
import { PlatformTiltProvider } from '../platformTilt/PlatformTiltProvider';
import { RENDERER_THEME } from '../styles/theme';
import '../styles/global.css';

const html = document.documentElement;
for (const [key, value] of Object.entries(RENDERER_THEME.cssVars)) {
    html.style.setProperty(key, value);
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PlatformTiltProvider>
            <StartupIntro onComplete={() => {}} reduceMotion={false} />
        </PlatformTiltProvider>
    </StrictMode>
);
