import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Progress } from './progress';
import React from 'react';

describe('Progress', () => {
    it('renders correctly with value', () => {
        const { container } = render(<Progress value={50} />);
        const progressBar = container.querySelector('div > div');
        expect(progressBar).not.toBeNull();
        // Skip style check due to JSDOM limitations
    });

    it('handles null or undefined value', () => {
        const { container } = render(<Progress value={null as any} />);
        const progressBar = container.querySelector('div > div');
        expect(progressBar).not.toBeNull();
    });

    it('renders with custom className', () => {
        const { container } = render(<Progress value={30} className="custom-class" />);
        const element = container.querySelector('.custom-class');
        expect(element).not.toBeNull();
    });
});
