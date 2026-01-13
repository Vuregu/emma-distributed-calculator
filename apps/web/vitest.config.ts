import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'], // We might need a setup file later for jest-dom
        alias: {
            '@': path.resolve(__dirname, './'),
        },
        exclude: ['**/node_modules/**', '**/dist/**'],
    },
});
