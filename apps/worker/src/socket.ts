import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

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

        socket.on('join_job_group', (jobGroupId: string) => {
            console.log(`Socket ${socket.id} joining room ${jobGroupId}`);
            socket.join(jobGroupId);
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
