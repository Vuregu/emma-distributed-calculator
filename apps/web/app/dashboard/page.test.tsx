import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './page';
import { redirect } from 'next/navigation';

// Mock dependencies
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
    prisma: {
        jobGroup: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

vi.mock('@/components/DashboardClient', () => ({
    DashboardClient: ({ userId }: { userId: string }) => <div>Dashboard Client: {userId}</div>,
}));

import { auth } from '@/auth';
import { prisma } from '@/lib/db';

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login if no session', async () => {
        vi.mocked(auth).mockResolvedValue(null);

        try {
            await DashboardPage();
        } catch (e) {
            // redirect throws an error in Next.js, so we catch it
        }

        expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('renders dashboard client with history if authenticated', async () => {
        const mockUser = { id: 'user-123', email: 'test@example.com' };
        vi.mocked(auth).mockResolvedValue({ user: mockUser } as any);

        const mockHistory = [{ id: 'group-1', jobs: [] }];
        vi.mocked(prisma.jobGroup.findMany).mockResolvedValue(mockHistory as any);

        const jsx = await DashboardPage();
        render(jsx);

        expect(screen.getByText(`Dashboard Client: ${mockUser.id}`)).toBeInTheDocument();
        expect(prisma.jobGroup.findMany).toHaveBeenCalledWith({
            where: { userId: mockUser.id },
            include: { jobs: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    });
});
