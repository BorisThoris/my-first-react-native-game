import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
            // Vendored notifications + zustand: force one React for Vitest + Vite.
            react: path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
            zustand: path.resolve(__dirname, 'node_modules/zustand'),
            '@cross-repo-libs/notifications/styles.css': path.resolve(
                __dirname,
                'packages/notifications/src/notification-host.css'
            ),
            '@cross-repo-libs/notifications': path.resolve(
                __dirname,
                'packages/notifications/src/index.ts'
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
        sourcemap: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                logoSandbox: path.resolve(__dirname, 'logo-sandbox.html')
            }
        }
    }
});
