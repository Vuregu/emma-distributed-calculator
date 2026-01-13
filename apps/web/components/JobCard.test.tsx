import { render, screen } from '@testing-library/react';
import { JobCard } from './JobCard';
import { describe, it, expect, vi } from 'vitest';

// Mock InsightCard to be safe
vi.mock('./InsightCard', () => ({
    InsightCard: () => <div data-testid="insight-card">Insight</div>
}));

describe('JobCard', () => {
    it('renders status correctly', () => {
        render(<JobCard type="ADD" status="PENDING" />);
        expect(screen.getByText('ADD')).toBeInTheDocument();
        expect(screen.getByText('PENDING')).toBeInTheDocument();
    });

    it('renders result when completed', () => {
        render(<JobCard type="MULTIPLY" status="COMPLETED" result={42} />);
        expect(screen.getByText('42.00')).toBeInTheDocument();
    });
});
