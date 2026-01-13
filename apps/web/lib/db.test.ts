import { describe, it, expect } from 'vitest';
import { prisma } from './db';

describe('db', () => {
    it('should export a prisma instance', () => {
        expect(prisma).toBeDefined();
        // We don't necessarily want to test the connection here as it might require a real DB
        // but we can check if it has the expected methods
        expect(prisma.job).toBeDefined();
        expect(prisma.user).toBeDefined();
    });
});
