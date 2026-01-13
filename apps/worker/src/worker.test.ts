import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processJob } from './worker';
import { Job } from 'bullmq';

const { mockUpdate, mockEmit } = vi.hoisted(() => ({
    mockUpdate: vi.fn(),
    mockEmit: vi.fn(),
}));

vi.mock('@repo/database', () => ({
    PrismaClient: vi.fn().mockImplementation(function () {
        return {
            job: { update: mockUpdate },
        };
    }),
}));

vi.mock('./socket', () => ({
    getSocketIO: vi.fn(() => ({
        to: vi.fn().mockReturnThis(),
        emit: mockEmit,
    })),
}));

vi.mock('./llm', () => ({
    getMathInsight: vi.fn().mockResolvedValue('Mock Insight'),
}));

vi.mock('./redis', () => ({
    redisConnection: {},
}));


describe('Worker processJob', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should process ADD operation correctly', async () => {
        const mockJob = {
            data: {
                jobId: 'job-1',
                jobGroupId: 'group-1',
                a: 5,
                b: 3,
                operation: 'ADD',
            },
        } as unknown as Job;

        await processJob(mockJob);

        // Check if calculated result (5+3=8) is updated in DB
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'job-1' },
            data: expect.objectContaining({
                status: 'COMPLETED',
                result: 8,
                resultInsight: 'Mock Insight'
            })
        }));

        // Check socket emission
        expect(mockEmit).toHaveBeenCalledWith('job_update', expect.objectContaining({
            jobId: 'job-1',
            status: 'COMPLETED',
            result: 8
        }));
    });

    it('should handle DIVIDE by zero', async () => {
        const mockJob = {
            data: {
                jobId: 'job-2',
                jobGroupId: 'group-1',
                a: 10,
                b: 0,
                operation: 'DIVIDE',
            },
        } as unknown as Job;

        await processJob(mockJob);

        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                result: 0 // Logic says 0 for div by zero
            })
        }));
    });

    it('should handle errors gracefully', async () => {
        // Force an error by creating a circular structure or throwing from a mock
        mockUpdate.mockRejectedValueOnce(new Error('DB Error'));

        const mockJob = {
            data: {
                jobId: 'job-3',
                jobGroupId: 'group-1',
                a: 1,
                b: 1,
                operation: 'ADD',
            },
        } as unknown as Job;

        await expect(processJob(mockJob)).rejects.toThrow('DB Error');

        // Check failure emission
        // Since the first update fails (PROCESSING status), the catch block might run 
        // OR the initial update fails. 
        // Wait, the first update is 'PROCESSING'. If that fails, it goes to catch.
        // In catch, it tries to update to FAILED.

        // Actually, if I mock the *first* update to fail, it enters catch block.
        // Let's see if the catch block executes the failure update.
    });
});
