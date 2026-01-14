import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RootLayout from './layout';

vi.mock('next/font/local', () => ({
    default: () => ({
        variable: 'mock-font-variable',
    }),
}));

describe('RootLayout', () => {
    it('renders children correctly', () => {
        render(
            <RootLayout>
                <div data-testid="test-child">Test Content</div>
            </RootLayout>
        );
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders without crashing', () => {
        render(
            <RootLayout>
                <div>Content</div>
            </RootLayout>
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
    });
});
