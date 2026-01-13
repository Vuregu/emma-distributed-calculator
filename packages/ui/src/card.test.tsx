import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './card';

describe('Card', () => {
    it('renders title and children', () => {
        render(
            <Card title="Test Card" href="example">
                Card Content
            </Card>
        );
        expect(screen.getByText('Test Card')).toBeInTheDocument();
        expect(screen.getByText('Card Content')).toBeInTheDocument();

        const link = screen.getByRole('link');
        expect(link.getAttribute('href')).toContain('example?utm_source=create-turbo');
    });
});
