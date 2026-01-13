import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { PrismaClient, Job } from '@repo/database';

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

        socket.on('join_job_group', async (jobGroupId: string) => {
            console.log(`Socket ${socket.id} joining room ${jobGroupId}`);
            socket.join(jobGroupId);

            // Send current state immediately
            try {
                const prisma = new PrismaClient();
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
                await prisma.$disconnect();
            } catch (err) {
                console.error("Error syncing state:", err);
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
