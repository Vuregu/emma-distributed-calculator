import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

let calculationQueue: Queue | null = null;

export const getCalculationQueue = () => {
    if (calculationQueue) {
        return calculationQueue;
    }

    const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
    const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
    const REDIS_USERNAME = process.env.REDIS_USERNAME || undefined;
    const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
    const REDIS_TLS = process.env.REDIS_TLS || undefined;

    const connection = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        username: REDIS_USERNAME,
        password: REDIS_PASSWORD,
        tls: REDIS_TLS ? {} : undefined,
        maxRetriesPerRequest: null,
    });

    calculationQueue = new Queue('calculation-queue', {
        connection,
    });

    return calculationQueue;
};
