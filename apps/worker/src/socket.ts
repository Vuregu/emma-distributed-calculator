import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Job } from '@repo/database';
import { prisma } from './db';
import jwt from 'jsonwebtoken';

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // allow all for dev
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join_job_group', async (data: { jobGroupId: string; token: string }) => {
            const { jobGroupId, token } = data;

            try {
                if (!process.env.NEXTAUTH_SECRET) {
                    console.error("NEXTAUTH_SECRET is missing in worker environment");
                    return;
                }

                // Verify the token
                const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET) as { jobGroupId: string };

                // Ensure the token is for the requested group
                if (decoded.jobGroupId !== jobGroupId) {
                    console.warn(`Socket ${socket.id} attempted to join ${jobGroupId} with token for ${decoded.jobGroupId}`);
                    return;
                }

                console.log(`Socket ${socket.id} authorized for room ${jobGroupId}`);
                socket.join(jobGroupId);

                // Send current state immediately
                try {
                    const jobs = await prisma.job.findMany({
                        where: { jobGroupId }
                    });

                    jobs.forEach((job: Job) => {
                        socket.emit('job_update', {
                            jobId: job.id,
                            type: job.type,
                            status: job.status,
                            result: job.result,
                            resultInsight: job.resultInsight
                        });
                    });
                } catch (err) {
                    console.error("Error syncing state:", err);
                }
            } catch (err) {
                console.error(`Socket ${socket.id} failed authorization for ${jobGroupId}:`, err);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getSocketIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
