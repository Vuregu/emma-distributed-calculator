import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Define mocks using vi.hoisted to ensure they are available
const mocks = vi.hoisted(() => {
    return {
        auth: vi.fn(),
        prisma: {
            user: {
                findUnique: vi.fn(),
            },
            jobGroup: {
                create: vi.fn(),
            },
            job: {
                create: vi.fn(),
            },
            $transaction: vi.fn((promises) => Promise.all(promises)),
        },
        queue: {
            add: vi.fn(),
        },
        nextResponse: {
            json: vi.fn((body, init) => ({
                json: async () => body,
                status: init?.status || 200,
            }))
        },
        zod: {
            object: vi.fn(() => ({
                parse: vi.fn((data) => data)
            })),
            number: vi.fn(),
        }
    };
});

// Mock dependencies
vi.mock('@/auth', () => ({
    auth: mocks.auth,
}));

vi.mock('@/lib/db', () => ({
    prisma: mocks.prisma,
}));

vi.mock('next/server', () => ({
    NextResponse: mocks.nextResponse
}));

vi.mock('@/lib/queue', () => ({
    calculationQueue: mocks.queue,
}));

vi.mock('zod', () => ({
    z: mocks.zod
}));

describe('POST /api/compute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 if not authenticated', async () => {
        mocks.auth.mockResolvedValueOnce(null);

        const req = {
            json: async () => ({ a: 1, b: 2 }),
        } as any;

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if input is invalid', async () => {
        mocks.auth.mockResolvedValueOnce({ user: { email: 'test@example.com' } } as any);
        // Mock zod to throw error for this test?
        // Actually, logic is: schema.parse(body).
        // My mocked schema.parse returns data.
        // So it won't throw.
        // But the original code relied on schema.parse throwing for invalid input?
        // Original test: "should return 400 if input is invalid".
        // It sent { a: 'invalid' }.
        // If I mock zod, I must make it throw for this case.

        mocks.zod.object.mockReturnValueOnce({
            parse: vi.fn().mockImplementation(() => { throw new Error('ZodError'); })
        });

        const req = {
            json: async () => ({ a: 'invalid', b: 2 }),
        } as any;

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request');
    });

    it('should return 400 if user not found', async () => {
        mocks.auth.mockResolvedValueOnce({ user: { email: 'test@example.com' } } as any);

        // Ensure regular zod mock behavior for this test
        mocks.zod.object.mockReturnValue({ parse: vi.fn((d) => d) });

        mocks.prisma.user.findUnique.mockResolvedValueOnce(null);

        const req = {
            json: async () => ({ a: 5, b: 10 }),
        } as any;

        const response = await POST(req);

        expect(response.status).toBe(400); // Because it throws Error("User not found") caught in catch block
    });

    it('should create job group, jobs, and add to queue on success', async () => {
        mocks.auth.mockResolvedValueOnce({ user: { email: 'test@example.com' } } as any);

        // Ensure regular zod mock behavior
        mocks.zod.object.mockReturnValue({ parse: vi.fn((d) => d) });

        mocks.prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1' } as any);
        mocks.prisma.jobGroup.create.mockResolvedValueOnce({ id: 'group-1' } as any);

        // Mock transaction result - one for each operation
        const mockJobs = [
            { id: 'job-1', type: 'ADD' },
            { id: 'job-2', type: 'SUBTRACT' },
            { id: 'job-3', type: 'MULTIPLY' },
            { id: 'job-4', type: 'DIVIDE' }
        ];

        mocks.prisma.$transaction.mockResolvedValueOnce(mockJobs as any);

        const req = {
            json: async () => ({ a: 10, b: 5 }),
        } as any;

        const response = await POST(req);
        const data = await response.json();

        expect(mocks.prisma.jobGroup.create).toHaveBeenCalledWith({
            data: { a: 10, b: 5, userId: 'user-1' }
        });

        expect(mocks.queue.add).toHaveBeenCalledTimes(4);
        expect(mocks.queue.add).toHaveBeenCalledWith('compute', expect.objectContaining({
            jobGroupId: 'group-1',
            jobId: 'job-1',
            a: 10,
            b: 5,
            operation: 'ADD'
        }));

        expect(data.jobGroupId).toBe('group-1');
        expect(data.jobs).toHaveLength(4);
    });
});
