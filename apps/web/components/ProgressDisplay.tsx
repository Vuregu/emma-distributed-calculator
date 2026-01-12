'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { JobResult } from '@repo/types';
import { JobCard } from './JobCard';

interface ProgressDisplayProps {
    jobGroupId: string;
    initialJobs?: any[]; // Pass initial DB state if available
}

export function ProgressDisplay({ jobGroupId, initialJobs = [] }: ProgressDisplayProps) {
    // We map jobs by ID or Type. Type is easier for the UI grid.
    // Let's assume we know there are 4 types.
    const [jobs, setJobs] = useState<Record<string, any>>({}); // Map type -> Job Data

    useEffect(() => {
        // Initialize state from initialJobs
        const validJobs = initialJobs.reduce((acc, job) => {
            acc[job.type] = job;
            return acc;
        }, {} as Record<string, any>);
        setJobs(prev => ({ ...prev, ...validJobs }));
    }, [initialJobs]);

    useEffect(() => {
        const socket = io('http://localhost:3001'); // Worker URL

        socket.emit('join_job_group', jobGroupId);

        socket.on('job_update', (updatedJob: any) => {
            // We need to know the TYPE to update the correct card, 
            // but the update might only have ID.
            // Ideally the update has ID, and we match it to our list.
            // But for simplicity, let's just refetch or assume we can match by ID if we stored it.

            // To make this robust:
            // 1. We should have a list of all 4 job IDs mapped to types.
            // 2. OR just list the cards by ID? But user wants "ADD, SUBTRACT..." labels.

            // Let's update state by matching ID.
            setJobs(prev => {
                const next = { ...prev };
                for (const type in next) {
                    if (next[type].id === updatedJob.jobId) {
                        next[type] = { ...next[type], ...updatedJob };
                    }
                }
                // If we didn't search by ID, we might miss it if we only have types?
                // The update handles status, result, insight.
                return next;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [jobGroupId]);

    const operations = ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {operations.map(op => {
                const job = jobs[op];
                return (
                    <JobCard
                        key={op}
                        type={op}
                        status={job?.status || 'PENDING'}
                        result={job?.result}
                        resultInsight={job?.resultInsight}
                    />
                );
            })}
        </div>
    );
}
