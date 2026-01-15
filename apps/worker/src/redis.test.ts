import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock ioredis
vi.mock('ioredis', () => {
    return {
        Redis: vi.fn(),
    };
});

// Import the mock to check calls
import { Redis } from 'ioredis';

describe('Redis Connection', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should create a Redis instance with defaults (no TLS) when REDIS_TLS is not true', async () => {
        delete process.env.REDIS_TLS;

        await import('./redis.js');

        expect(Redis).toHaveBeenCalledWith(expect.objectContaining({
            tls: undefined,
        }));
    });

    it('should create a Redis instance with TLS config when REDIS_TLS is "true"', async () => {
        process.env.REDIS_TLS = 'true';

        await import('./redis.js');

        expect(Redis).toHaveBeenCalledWith(expect.objectContaining({
            tls: {},
        }));
    });
});
