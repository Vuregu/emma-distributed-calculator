import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { VersionDisplay } from './VersionDisplay';

describe('VersionDisplay', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
        vi.resetModules();
    });

    it('renders "vdev" when NEXT_PUBLIC_APP_VERSION is undefined', () => {
        // Ensure env var is undefined
        delete process.env.NEXT_PUBLIC_APP_VERSION;

        render(<VersionDisplay />);

        expect(screen.getByText('vdev')).toBeDefined();
    });

    it('renders the specific version when NEXT_PUBLIC_APP_VERSION is set', () => {
        // Mock env var
        process.env.NEXT_PUBLIC_APP_VERSION = '24.01.14.1200';

        render(<VersionDisplay />);

        expect(screen.getByText('v24.01.14.1200')).toBeDefined();
    });
});
