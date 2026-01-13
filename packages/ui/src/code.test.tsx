import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Code } from './code';

describe('Code', () => {
    it('renders code content', () => {
        render(<Code>console.log("hello")</Code>);
        expect(screen.getByText('console.log("hello")')).toBeInTheDocument();
    });
});
