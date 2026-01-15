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
    PrismaPg: vi.fn(),
    Pool: vi.fn(),
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

        // Check if status updated to PROCESSING first
        expect(mockUpdate).toHaveBeenNthCalledWith(1, expect.objectContaining({
            where: { id: 'job-1' },
            data: { status: 'PROCESSING' }
        }));

        // Check socket emission for PROCESSING
        expect(mockEmit).toHaveBeenCalledWith('job_update', expect.objectContaining({
            jobId: 'job-1',
            status: 'PROCESSING'
        }));

        // Check if calculated result (5+3=8) is updated in DB
        expect(mockUpdate).toHaveBeenNthCalledWith(2, expect.objectContaining({
            where: { id: 'job-1' },
            data: expect.objectContaining({
                status: 'COMPLETED',
                result: 8,
                resultInsight: 'Mock Insight'
            })
        }));

        // Check socket emission for COMPLETED
        expect(mockEmit).toHaveBeenCalledWith('job_update', expect.objectContaining({
            jobId: 'job-1',
            status: 'COMPLETED',
            result: 8
        }));
    });

    it('should process SUBTRACT operation correctly', async () => {
        const mockJob = {
            data: {
                jobId: 'job-sub',
                jobGroupId: 'group-1',
                a: 10,
                b: 4,
                operation: 'SUBTRACT',
            },
        } as unknown as Job;

        await processJob(mockJob);

        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ result: 6 })
        }));
    });

    it('should process MULTIPLY operation correctly', async () => {
        const mockJob = {
            data: {
                jobId: 'job-mul',
                jobGroupId: 'group-1',
                a: 6,
                b: 7,
                operation: 'MULTIPLY',
            },
        } as unknown as Job;

        await processJob(mockJob);

        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ result: 42 })
        }));
    });

    it('should process DIVIDE operation correctly', async () => {
        const mockJob = {
            data: {
                jobId: 'job-div',
                jobGroupId: 'group-1',
                a: 20,
                b: 5,
                operation: 'DIVIDE',
            },
        } as unknown as Job;

        await processJob(mockJob);

        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ result: 4 })
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

    it('should reset result to 0 for unknown operation', async () => {
        const mockJob = {
            data: {
                jobId: 'job-unknown',
                jobGroupId: 'group-1',
                a: 10,
                b: 5,
                operation: 'UNKNOWN' as 'ADD',
            },
        } as unknown as Job;

        await processJob(mockJob);

        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ result: 0 })
        }));
    });

    it('should handle errors gracefully', async () => {
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

        // Check if it tried to set status to FAILED
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'job-3' },
            data: { status: 'FAILED' }
        }));

        expect(mockEmit).toHaveBeenCalledWith('job_update', expect.objectContaining({
            jobId: 'job-3',
            status: 'FAILED'
        }));
    });
});
