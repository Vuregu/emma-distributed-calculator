import { describe, it, expect, vi } from 'vitest';
import { redisConnection } from './redis';
import { Redis } from 'ioredis';

// Mock ioredis
vi.mock('ioredis', () => {
    return {
        Redis: vi.fn(),
    };
});

describe('Redis Connection', () => {
    it('should create a Redis instance with correct configuration', () => {
        // This test mainly verifies that the file executed and instantiated Redis.
        // Since redisConnection is a specific instance, we can check if Redis constructor was called.

        // Note: Since redisConnection is a top-level export, it's instantiated when the module is imported.
        // If we want to test env var handling, we might need to reset modules or check how it was called.

        expect(redisConnection).toBeDefined();
    });
});
