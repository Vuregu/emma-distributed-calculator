import { Worker, Job } from 'bullmq';
import { redisConnection } from './redis';
import { PrismaClient } from '@repo/database';
import { getMathInsight } from './llm';
import { getSocketIO } from './socket';
import { JobPayload, JobResult } from '@repo/types';

const prisma = new PrismaClient();

export const processJob = async (job: Job<JobPayload>) => {
    const { jobId, jobGroupId, a, b, operation } = job.data;
    const io = getSocketIO();

    try {
        console.log(`Processing job ${jobId}: ${a} ${operation} ${b}`);

        // Update status to PROCESSING
        await prisma.job.update({
            where: { id: jobId },
            data: { status: 'PROCESSING' }
        });

        io.to(jobGroupId).emit('job_update', {
            jobId,
            type: operation,
            status: 'PROCESSING'
        });

        // Simulate processing delay (configurable)
        const delay = process.env.JOB_PROCESS_DELAY ? parseInt(process.env.JOB_PROCESS_DELAY) : 3000;
        await new Promise(resolve => setTimeout(resolve, delay));

        // 1. Deterministic Calculation
        let result: number;
        switch (operation) {
            case 'ADD': result = a + b; break;
            case 'SUBTRACT': result = a - b; break;
            case 'MULTIPLY': result = a * b; break;
            case 'DIVIDE': result = b !== 0 ? a / b : 0; break; // handle div by zero gracefully
            default: result = 0;
        }

        // 2. Hybrid Insight
        const resultInsight = await getMathInsight(result);

        // Update DB
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: 'COMPLETED',
                result,
                resultInsight
            }
        });

        // Emit Complete
        const jobResult: JobResult = {
            jobId,
            type: operation,
            result,
            resultInsight,
            status: 'COMPLETED'
        };

        io.to(jobGroupId).emit('job_update', jobResult);
        console.log(`Job ${jobId} completed. Result: ${result}`);

    } catch (error) {
        console.error(`Job ${jobId} failed:`, error);
        await prisma.job.update({
            where: { id: jobId },
            data: { status: 'FAILED' }
        });
        io.to(jobGroupId).emit('job_update', {
            jobId,
            type: operation,
            status: 'FAILED'
        });
        throw error;
    }
};

export const startWorker = () => {
    const worker = new Worker('calculation-queue', processJob, {
        connection: redisConnection,
        concurrency: 4 // Allow 4 parallel jobs
    });

    worker.on('completed', (job) => {
        console.log(`${job.id} has completed!`);
    });

    worker.on('failed', (job, err) => {
        if (job) {
            console.log(`${job.id} has failed with ${err.message}`);
        }
    });
};
