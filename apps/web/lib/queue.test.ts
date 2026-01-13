import { describe, it, expect } from 'vitest';
import { getCalculationQueue } from './queue';

describe('queue', () => {
    it('should export a calculationQueue instance via getter', () => {
        const queue = getCalculationQueue();
        expect(queue).toBeDefined();
        expect(queue.name).toBe('calculation-queue');
    });
});
