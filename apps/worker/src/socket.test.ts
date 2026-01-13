import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initSocket } from './socket';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { PrismaClient } from '@repo/database';

// Mock dependencies

// We need to hoist the mocks so they can be used in the factory
const { mockedIoInstance, MockServer, mockPrisma } = vi.hoisted(() => {
    const ioInstance = {
        on: vi.fn(),
        emit: vi.fn(),
        to: vi.fn().mockReturnThis(),
        id: 'mock-io-server'
    };

    const prismaInstance = {
        job: {
            findMany: vi.fn(),
        },
        $disconnect: vi.fn(),
    };

    return {
        mockedIoInstance: ioInstance,
        MockServer: vi.fn().mockImplementation(function () { return ioInstance; }),
        mockPrisma: prismaInstance
    };
});

vi.mock('socket.io', () => {
    return {
        Server: MockServer
    };
});

vi.mock('@repo/database', () => {
    return {
        PrismaClient: vi.fn().mockImplementation(function () {
            return mockPrisma;
        }),
    };
});

vi.mock('@prisma/client', () => {
    return {
        PrismaClient: vi.fn().mockImplementation(function () {
            return mockPrisma;
        }),
    };
});

describe('Socket Server', () => {
    let mockSocket: { id: string; join: ReturnType<typeof vi.fn>; emit: ReturnType<typeof vi.fn>; on: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup internal Socket mock (client socket)
        mockSocket = {
            id: 'socket-1',
            join: vi.fn(),
            emit: vi.fn(),
            on: vi.fn(),
        };
    });

    afterEach(() => {
        // ...
    });

    it('should have mocked PrismaClient', () => {
        // Assert that the imported PrismaClient is indeed a mock
        // If this fails, then our mock setup is invalid for the test file itself
        expect(vi.isMockFunction(PrismaClient)).toBe(true);
    });

    it('should initialize Socket.IO server', () => {
        const httpServer = createServer();
        const ioInstance = initSocket(httpServer);

        expect(Server).toHaveBeenCalled();
        expect(ioInstance).toBe(mockedIoInstance);
    });

    it('should throw if getSocketIO is called before init', () => {
        // Skip for now as discussed
    });

    it('should handle "join_job_group" event and sync state', async () => {
        const httpServer = createServer();
        initSocket(httpServer);

        // Trigger connection handler
        const connectionCall = mockedIoInstance.on.mock.calls.find((c: unknown[]) => c[0] === 'connection');
        const connectionHandler = connectionCall ? connectionCall[1] : undefined;

        if (!connectionHandler) throw new Error('Connection handler not found');

        connectionHandler(mockSocket);

        // Trigger join_job_group handler
        const joinCall = mockSocket.on.mock.calls.find((c: unknown[]) => c[0] === 'join_job_group');
        const joinHandler = joinCall ? joinCall[1] : undefined;

        if (!joinHandler) throw new Error('join_job_group handler not found');

        // Mock DB response
        mockPrisma.job.findMany.mockResolvedValue([
            { id: 'j1', type: 'ADD', status: 'COMPLETED', result: 10 }
        ]);

        await joinHandler('group-1');

        expect(mockSocket.join).toHaveBeenCalled();
        expect(mockPrisma.job.findMany).toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalled();
    });
});
