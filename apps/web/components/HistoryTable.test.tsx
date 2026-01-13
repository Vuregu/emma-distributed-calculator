import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryTable } from './HistoryTable';
import { describe, it, expect, vi } from 'vitest';

vi.mock('date-fns', () => ({
    formatDistanceToNow: vi.fn(() => '5 mins ago'),
}));

vi.mock('@/lib/utils', () => ({
    cn: (...args: any[]) => args.join(' '),
}));

describe('HistoryTable', () => {
    const mockSelect = vi.fn();

    it('renders empty state correctly', () => {
        render(<HistoryTable history={[]} onSelect={mockSelect} />);
        expect(screen.getByText('No history available yet. Start a job to populate this list.')).toBeInTheDocument();
        expect(screen.getByText('0 items')).toBeInTheDocument();
    });

    it('renders history items', () => {
        const history = [
            {
                id: 'group-1',
                createdAt: new Date(),
                a: 10,
                b: 5,
                userId: 'user-1',
                jobs: [
                    { id: 'j1', status: 'COMPLETED', type: 'ADD', result: 15, resultInsight: null, jobGroupId: 'group-1' },
                    { id: 'j2', status: 'COMPLETED', type: 'SUBTRACT', result: 5, resultInsight: null, jobGroupId: 'group-1' }
                ]
            }
        ];

        render(<HistoryTable history={history} onSelect={mockSelect} />);
        expect(screen.getByText('A: 10')).toBeInTheDocument();
        expect(screen.getByText('B: 5')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('5 mins ago')).toBeInTheDocument();
    });

    it('calls onSelect when View Details clicked', () => {
        const history = [
            {
                id: 'group-1',
                createdAt: new Date(),
                a: 10,
                b: 5,
                userId: 'user-1',
                jobs: []
            }
        ];
        render(<HistoryTable history={history} onSelect={mockSelect} />);

        // Find button in the row
        const btn = screen.getByText('View Details');
        fireEvent.click(btn);

        expect(mockSelect).toHaveBeenCalledWith('group-1', []);
    });
});
