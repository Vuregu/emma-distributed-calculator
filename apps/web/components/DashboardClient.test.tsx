import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { DashboardClient } from './DashboardClient';
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
vi.mock('./InputForm', () => ({
    InputForm: ({ onJobStarted }: any) => (
        <button data-testid="start-job-btn" onClick={() => onJobStarted('group-1', [{ id: 'job-1', status: 'PENDING', type: 'ADD', result: null, resultInsight: null, jobGroupId: 'group-1' }], 10, 5)}>
            Start Job
        </button>
    )
}));

vi.mock('./ProgressDisplay', () => ({
    ProgressDisplay: ({ jobs }: any) => (
        <div data-testid="progress-display">
            {jobs.map((j: any) => <div key={j.id} data-testid={`job-${j.id}`}>{j.status}</div>)}
        </div>
    )
}));

vi.mock('./HistoryTable', () => ({
    HistoryTable: ({ history, onSelect }: any) => (
        <div>
            <div data-testid="history-list">
                {history.map((h: any) => (
                    <div key={h.id} onClick={() => onSelect(h.id, h.jobs)} data-testid={`history-item-${h.id}`}>
                        {h.id}
                    </div>
                ))}
            </div>
        </div>
    )
}));

describe('DashboardClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        for (const key in socketCallbacks) delete socketCallbacks[key];
        mockSocket.emit.mockReset();
        mockSocket.on.mockReset().mockImplementation((event: string, callback: Function) => {
            socketCallbacks[event] = callback;
        });
    });

    it('renders correctly with initial history', () => {
        const history = [{
            id: 'old-1',
            jobs: [],
            createdAt: new Date(),
            a: 1,
            b: 2,
            userId: 'user-1'
        }];
        render(<DashboardClient initialHistory={history} userId="user-1" />);

        expect(screen.getByText("Emma's Calculator Dashboard")).toBeInTheDocument();
        expect(screen.getByTestId('history-item-old-1')).toBeInTheDocument();
        expect(screen.queryByTestId('progress-display')).not.toBeInTheDocument();
    });

    it('connects to socket when a new job starts', async () => {
        render(<DashboardClient initialHistory={[]} userId="user-1" />);

        fireEvent.click(screen.getByTestId('start-job-btn'));

        expect(screen.getByTestId('progress-display')).toBeInTheDocument();

        expect(io).toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalledWith('join_job_group', 'group-1');
    });

    it('updates history and UI when socket receives job update', async () => {
        render(<DashboardClient initialHistory={[]} userId="user-1" />);

        // Start job (sets history and active group)
        fireEvent.click(screen.getByTestId('start-job-btn'));

        // Initial state
        expect(screen.getByTestId('job-job-1')).toHaveTextContent('PENDING');

        // Simulate socket update
        const updateCallback = socketCallbacks['job_update'];
        expect(updateCallback).toBeDefined();

        act(() => {
            if (updateCallback) {
                // Sending jobId as per updated implementation
                updateCallback({ jobId: 'job-1', status: 'COMPLETED', result: 100 });
            }
        });

        // Computed activeJobs should now reflect the update
        await waitFor(() => {
            expect(screen.getByTestId('job-job-1')).toHaveTextContent('COMPLETED');
        });
    });

    it('handles selecting history item', () => {
        const history = [{
            id: 'group-old',
            jobs: [{
                id: 'job-old-1',
                status: 'COMPLETED',
                type: 'ADD',
                result: 10,
                resultInsight: null,
                jobGroupId: 'group-old'
            }],
            createdAt: new Date(),
            a: 5,
            b: 10,
            userId: 'user-1'
        }];
        render(<DashboardClient initialHistory={history} userId="user-1" />);

        fireEvent.click(screen.getByTestId('history-item-group-old'));

        expect(screen.getByTestId('progress-display')).toBeInTheDocument();
        expect(screen.getByTestId('job-job-old-1')).toHaveTextContent('COMPLETED');

        expect(mockSocket.emit).toHaveBeenCalledWith('join_job_group', 'group-old');
    });
    it('disconnects socket when active group updates or component unmounts', async () => {
        const { unmount } = render(<DashboardClient initialHistory={[]} userId="user-1" />);

        fireEvent.click(screen.getByTestId('start-job-btn'));
        expect(io).toHaveBeenCalledTimes(1);
        expect(mockSocket.disconnect).not.toHaveBeenCalled();

        // Switch group (simulate by unmounting or potentially starting new job if logic supports it,
        // but simple unmount is cleaner for testing useEfffect cleanup)
        unmount();

        expect(mockSocket.disconnect).toHaveBeenCalled();
    });
});

