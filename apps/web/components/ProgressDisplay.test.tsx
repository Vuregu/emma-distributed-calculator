import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ProgressDisplay } from './ProgressDisplay';

// Mock child components
vi.mock('./JobCard', () => ({
    JobCard: ({ type, status, result }: any) => (
        <div data-testid={`job-card-${type}`}>
            {type}: {status} {result && `-> ${result}`}
        </div>
    )
}));

vi.mock('./ui/progress', () => ({
    Progress: ({ value }: any) => <div data-testid="progress-bar" data-value={value} />
}));

describe('ProgressDisplay', () => {
    it('renders jobs correctly', () => {
        const jobs = [
            { id: '1', type: 'ADD', status: 'COMPLETED', result: 10, jobGroupId: 'group-1', resultInsight: null },
            { id: '2', type: 'SUBTRACT', status: 'PENDING', result: null, jobGroupId: 'group-1', resultInsight: null }
        ];

        render(<ProgressDisplay jobs={jobs} />);

        expect(screen.getByTestId('job-card-ADD')).toHaveTextContent('ADD: COMPLETED -> 10');
        expect(screen.getByTestId('job-card-SUBTRACT')).toHaveTextContent('SUBTRACT: PENDING');
    });

    it('calculates progress correctly', () => {
        // 1 completed out of 4 operations (ADD, SUBTRACT, MULTIPLY, DIVIDE)
        const jobs = [
            { id: '1', type: 'ADD', status: 'COMPLETED', jobGroupId: 'group-1', result: 10, resultInsight: null }
        ];

        render(<ProgressDisplay jobs={jobs} />);

        // 1/4 = 25%
        expect(screen.getByText(/25%/)).toBeInTheDocument();
        expect(screen.getByTestId('progress-bar')).toHaveAttribute('data-value', '25');
    });
});
