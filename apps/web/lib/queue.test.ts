import { describe, it, expect } from 'vitest';
import { calculationQueue } from './queue';

describe('queue', () => {
    it('should export a calculationQueue instance', () => {
        expect(calculationQueue).toBeDefined();
        expect(calculationQueue.name).toBe('calculation-queue');
    });
});
