import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ProgressDisplay } from './ProgressDisplay';
import { io } from 'socket.io-client';

// Mock socket.io-client
const { mockSocket, socketCallbacks } = vi.hoisted(() => {
    const callbacks: Record<string, Function> = {};
    const socket = {
        emit: vi.fn(),
        on: vi.fn().mockImplementation((event: string, callback: Function) => {
            callbacks[event] = callback;
        }),
        disconnect: vi.fn(),
    };
    return { mockSocket: socket, socketCallbacks: callbacks };
});

vi.mock('socket.io-client', () => ({
    io: vi.fn(() => mockSocket),
}));

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
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset callbacks manually or via mock
        for (const key in socketCallbacks) delete socketCallbacks[key];

        mockSocket.emit.mockReset();
        mockSocket.on.mockReset().mockImplementation((event: string, callback: Function) => {
            socketCallbacks[event] = callback;
        });
        mockSocket.disconnect.mockReset();
    });

    it('initializes socket and joins room on mount', () => {
        render(<ProgressDisplay jobGroupId="group-1" />);

        expect(io).toHaveBeenCalledWith('http://localhost:3001');
        expect(mockSocket.emit).toHaveBeenCalledWith('join_job_group', 'group-1');
        expect(socketCallbacks['job_update']).toBeDefined();
    });

    it('renders initial jobs correctly', () => {
        const initialJobs = [
            { id: '1', type: 'ADD', status: 'COMPLETED', result: 10 }
        ];

        render(<ProgressDisplay jobGroupId="group-1" initialJobs={initialJobs} />);

        expect(screen.getByTestId('job-card-ADD')).toHaveTextContent('ADD: COMPLETED -> 10');
        expect(screen.getByTestId('job-card-SUBTRACT')).toHaveTextContent('SUBTRACT: PENDING');
    });

    it('updates state on socket job_update event', async () => {
        render(<ProgressDisplay jobGroupId="group-1" />);

        const updateCallback = socketCallbacks['job_update'];
        expect(updateCallback).toBeDefined();

        act(() => {
            if (updateCallback) {
                updateCallback({ type: 'MULTIPLY', status: 'COMPLETED', result: 50 });
            }
        });

        await waitFor(() => {
            expect(screen.getByTestId('job-card-MULTIPLY')).toHaveTextContent('MULTIPLY: COMPLETED -> 50');
        });
    });

    it('calls onJobUpdate prop when update received', () => {
        const onUpdateSpy = vi.fn();
        render(<ProgressDisplay jobGroupId="group-1" onJobUpdate={onUpdateSpy} />);

        const updateCallback = socketCallbacks['job_update'];
        expect(updateCallback).toBeDefined();

        act(() => {
            if (updateCallback) {
                updateCallback({ jobId: 'j1', type: 'ADD', status: 'COMPLETED' });
            }
        });

        expect(onUpdateSpy).toHaveBeenCalledWith('group-1', { jobId: 'j1', type: 'ADD', status: 'COMPLETED' });
    });

    it('disconnects socket on unmount', () => {
        const { unmount } = render(<ProgressDisplay jobGroupId="group-1" />);
        unmount();
        expect(mockSocket.disconnect).toHaveBeenCalled();
    });
});
