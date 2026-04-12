import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@cross-repo-libs/notifications/styles.css': path.resolve(
                __dirname,
                '../cross-repo-libs/packages/notifications/src/notification-host.css'
            ),
            '@cross-repo-libs/notifications': path.resolve(
                __dirname,
                '../cross-repo-libs/packages/notifications/src/index.ts'
            )
        }
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        watch: {
            ignored: ['**/output/**', '**/release/**', '**/dist/**', '**/dist-electron/**']
        }
    },
    test: {
        environment: 'happy-dom',
        setupFiles: './vitest.setup.ts',
        include: ['src/**/*.{test,spec}.{ts,tsx}']
    },
    build: {
        outDir: 'dist',
        sourcemap: true
    }
});
