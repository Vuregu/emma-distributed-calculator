
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createServer } from "http";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import { Server, Socket as ServerSocket } from "socket.io";
import { initSocket } from "./socket";
import jwt from 'jsonwebtoken';

// Mock Prisma
vi.mock("@repo/database", () => {
    const mockFindMany = vi.fn();
    return {
        PrismaClient: vi.fn().mockImplementation(function () {
            return {
                job: {
                    findMany: mockFindMany
                },
            };
        }),
        PrismaPg: vi.fn(),
        Pool: vi.fn(),
    };
});

describe("Socket Server", () => {
    let io: Server;
    let serverSocket: ServerSocket;
    let clientSocket: ClientSocket;
    let httpServer: ReturnType<typeof createServer>;
    const TEST_PORT = 4321;
    const TEST_SECRET = "test-secret";

    beforeAll(async () => {
        // Mock env secret
        process.env.NEXTAUTH_SECRET = TEST_SECRET;

        httpServer = createServer();
        io = initSocket(httpServer);

        await new Promise<void>((resolve) => {
            httpServer.listen(TEST_PORT, () => {
                clientSocket = Client(`http://localhost:${TEST_PORT}`);
                io.on("connection", (socket) => {
                    serverSocket = socket;
                });
                clientSocket.on("connect", resolve);
            });
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.close();
        httpServer.close();
        delete process.env.NEXTAUTH_SECRET;
    });

    it("should allow joining with a valid token for the correct job group", async () => {
        const jobGroupId = "group-123";
        const token = jwt.sign({ jobGroupId }, TEST_SECRET, { expiresIn: '1m' });

        // Internal emit to trigger the handler
        clientSocket.emit("join_job_group", { jobGroupId, token });

        // Wait to verify room join
        await new Promise((resolve) => setTimeout(resolve, 100));

        const rooms = io.sockets.adapter.rooms;
        expect(rooms.get(jobGroupId)?.has(serverSocket.id)).toBe(true);
    });

    it("should reject joining with an invalid token", async () => {
        const jobGroupId = "group-bad-token";
        const token = "invalid-token";

        clientSocket.emit("join_job_group", { jobGroupId, token });

        await new Promise((resolve) => setTimeout(resolve, 100));

        const rooms = io.sockets.adapter.rooms;
        expect(rooms.get(jobGroupId)).toBeUndefined();
    });

    it("should reject joining if token is for a different job group", async () => {
        const jobGroupId = "group-target";
        const token = jwt.sign({ jobGroupId: "group-other" }, TEST_SECRET, { expiresIn: '1m' });

        clientSocket.emit("join_job_group", { jobGroupId, token });

        await new Promise((resolve) => setTimeout(resolve, 100));

        const rooms = io.sockets.adapter.rooms;
        expect(rooms.get(jobGroupId)).toBeUndefined();
    });
});
