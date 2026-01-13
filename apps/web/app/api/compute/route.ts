import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { calculationQueue } from '@/lib/queue';
import { Job } from '@repo/database';
import { JobPayload } from '@repo/types';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
    a: z.number(),
    b: z.number(),
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { a, b } = schema.parse(body);

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) throw new Error("User not found");

        // Create JobGroup
        const jobGroup = await prisma.jobGroup.create({
            data: {
                a,
                b,
                userId: user.id
            }
        });

        const operations = ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'] as const;

        // Create jobs in transaction to get IDs for queue payloads
        const createdJobs = await prisma.$transaction(
            operations.map(op => prisma.job.create({
                data: {
                    type: op,
                    status: 'PENDING',
                    jobGroupId: jobGroup.id
                }
            }))
        );

        // Add to BullMQ
        const queuePromises = createdJobs.map((job: Job) => {
            const payload: JobPayload = {
                jobGroupId: jobGroup.id,
                jobId: job.id,
                a,
                b,
                operation: job.type as JobPayload['operation']
            };
            return calculationQueue.add('compute', payload);
        });

        await Promise.all(queuePromises);

        return NextResponse.json({
            jobGroupId: jobGroup.id,
            jobs: createdJobs
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
