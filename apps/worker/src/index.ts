import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { initSocket } from './socket';
import { startWorker } from './worker';

const PORT = process.env.PORT || 3001;

const httpServer = createServer((req, res) => {
    res.writeHead(200);
    res.end('Worker Service Running');
});

// Initialize Socket.io
initSocket(httpServer);

// Start BullMQ Worker
startWorker();

httpServer.listen(PORT, () => {
    console.log(`Worker service (HTTP+Socket) listening on port ${PORT}`);
});
