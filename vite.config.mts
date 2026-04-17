import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const boardWebglPerfSample = path.resolve(__dirname, 'src/renderer/dev/boardWebglPerfSample.ts');
const boardWebglPerfSampleStub = path.resolve(__dirname, 'src/renderer/dev/boardWebglPerfSample.stub.ts');

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
            ...(mode === 'production'
                ? {
                      /* Dev perf harness: swap to no-op so prod bundle omits sampling logic. */
                      [boardWebglPerfSample]: boardWebglPerfSampleStub
                  }
                : {}),
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
        restoreMocks: true,
        clearMocks: true,
        /* Windows / sandbox: fork pool teardown can throw EPERM on process.kill; threads avoid it. */
        pool: 'threads',
        include: [
            'src/**/*.{test,spec}.{ts,tsx}',
            'packages/notifications/src/**/*.{test,spec}.{ts,tsx}'
        ]
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
}));
