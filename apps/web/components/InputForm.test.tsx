import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InputForm } from './InputForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('InputForm', () => {
    const mockOnJobStarted = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('renders input fields', () => {
        render(<InputForm onJobStarted={mockOnJobStarted} />);
        expect(screen.getByLabelText('Value A')).toBeInTheDocument();
        expect(screen.getByLabelText('Value B')).toBeInTheDocument();
        expect(screen.getByText('Start Computation')).toBeInTheDocument();
    });

    it('submits form and calls callback', async () => {
        const mockResponse = {
            jobGroupId: 'group-123',
            jobs: [],
        };
        (global.fetch as any).mockResolvedValue({
            json: async () => mockResponse,
            ok: true,
        });

        render(<InputForm onJobStarted={mockOnJobStarted} />);

        fireEvent.change(screen.getByLabelText('Value A'), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText('Value B'), { target: { value: '5' } });

        fireEvent.click(screen.getByText('Start Computation'));

        expect(screen.getByText('Dispatching...')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockOnJobStarted).toHaveBeenCalledWith('group-123', [], 10, 5);
        });
    });
});
