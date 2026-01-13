import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
    it('should merge class names correctly', () => {
        expect(cn('w-full', 'h-full')).toBe('w-full h-full');
    });

    it('should handle conditional classes', () => {
        const isActive = true;
        expect(cn('btn', isActive && 'btn-active')).toBe('btn btn-active');
    });

    it('should merge tailwind conflicts', () => {
        expect(cn('p-4', 'p-8')).toBe('p-8');
    });
});
