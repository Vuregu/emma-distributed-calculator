import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardLayout from './layout';

// Mock auth
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

// Mock LogoutButton
vi.mock('@/components/LogoutButton', () => ({
    LogoutButton: () => <button>Sign Out</button>,
}));

import { auth } from '@/auth';

describe('DashboardLayout', () => {
    it('renders header with user email and logout button', async () => {
        // Mock session
        vi.mocked(auth).mockResolvedValue({
            user: { email: 'test@example.com' },
        } as any);

        // Since it's an RSC, we can await it directly in test environment
        // NOTE: In real Next.js integration tests, this is different, but for unit testing RSC logic:
        const jsx = await DashboardLayout({ children: <div>Child Content</div> });
        render(jsx);

        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('Emma Worker')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('handles missing user email gracefully', async () => {
        vi.mocked(auth).mockResolvedValue({
            user: {},
        } as any);

        const jsx = await DashboardLayout({ children: <div>Child Content</div> });
        render(jsx);

        expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
});
