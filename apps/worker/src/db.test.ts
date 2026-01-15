import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 1. Mock the dependencies BEFORE importing the module under test
const MockPrismaPg = vi.fn();
const MockPrismaClient = vi.fn();

vi.mock('@repo/database', () => {
    return {
        PrismaPg: MockPrismaPg,
        PrismaClient: MockPrismaClient,
    };
});

describe('apps/worker/src/db', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        process.env = { ...originalEnv };
        process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should instantiate PrismaPg with defaults (no SSL) when DATABASE_SSL is not true', async () => {
        delete process.env.DATABASE_SSL;

        await import('./db.js');

        expect(MockPrismaPg).toHaveBeenCalledWith({
            connectionString: 'postgres://test:test@localhost:5432/test',
            ssl: undefined,
        });

        // Also verify PrismaClient instantiation
        const adapterInstance = MockPrismaPg.mock.instances[0];
        expect(MockPrismaClient).toHaveBeenCalledWith({
            adapter: adapterInstance,
        });
    });

    it('should instantiate PrismaPg with SSL config when DATABASE_SSL is "true"', async () => {
        process.env.DATABASE_SSL = 'true';

        await import('./db.js');

        expect(MockPrismaPg).toHaveBeenCalledWith({
            connectionString: 'postgres://test:test@localhost:5432/test',
            ssl: { rejectUnauthorized: false },
        });
    });

    it('should export the prisma instance', async () => {
        const { prisma } = await import('./db.js');
        expect(prisma).toBe(MockPrismaClient.mock.instances[0]);
    });
});
