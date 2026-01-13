import { render, screen } from '@testing-library/react';
import { InsightCard } from './InsightCard';
import { describe, it, expect } from 'vitest';

describe('InsightCard', () => {
    it('renders insight when provided', () => {
        render(<InsightCard insight="Interesting fact." />);
        expect(screen.getByText('Interesting fact.')).toBeInTheDocument();
        expect(screen.getByText(/Insight:/)).toBeInTheDocument();
    });

    it('renders nothing when insight is missing', () => {
        const { container } = render(<InsightCard insight="" />);
        expect(container).toBeEmptyDOMElement();
    });
});
