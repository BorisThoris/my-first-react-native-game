import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { PlatformTiltProvider } from './platformTilt/PlatformTiltProvider';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PlatformTiltProvider>
            <App />
        </PlatformTiltProvider>
    </StrictMode>
);
