import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

let calculationQueue: Queue | null = null;

export const getCalculationQueue = () => {
    if (calculationQueue) {
        return calculationQueue;
    }

    const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
    const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

    const connection = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        maxRetriesPerRequest: null,
    });

    calculationQueue = new Queue('calculation-queue', {
        connection,
    });

    return calculationQueue;
};
