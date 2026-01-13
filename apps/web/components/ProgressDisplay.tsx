'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { JobCard } from './JobCard';
import { Progress } from './ui/progress';

interface ProgressDisplayProps {
    jobGroupId: string;
    initialJobs?: any[]; // Pass initial DB state if available
    onJobUpdate?: (jobGroupId: string, updatedJob: any) => void;
}

const EMPTY_JOBS: any[] = [];

const OPERATIONS = ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'];

export function ProgressDisplay({ jobGroupId, initialJobs = EMPTY_JOBS, onJobUpdate }: ProgressDisplayProps) {
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
        const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:3001';
        const socket = io(workerUrl); // Worker URL

        socket.emit('join_job_group', jobGroupId);

        socket.on('job_update', (updatedJob: any) => {
            console.log("Socket Update Received:", updatedJob);

            // Notify parent to update history/state
            if (onJobUpdate) {
                onJobUpdate(jobGroupId, updatedJob);
            }

            setJobs(prev => {
                const next = { ...prev };
                const type = updatedJob.type;

                // 1. Try to match by type directly if it exists in the payload or is a valid operation
                if (type && (next[type] || OPERATIONS.includes(type))) {
                    next[type] = { ...(next[type] || {}), ...updatedJob };
                }
                // 2. Fallback: Search all types for matching jobId
                else {
                    for (const t in next) {
                        if (next[t].id === updatedJob.jobId) {
                            next[t] = { ...next[t], ...updatedJob };
                            break;
                        }
                    }
                }
                return next;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [jobGroupId]);

    const totalJobs = OPERATIONS.length;
    const completedJobs = Object.values(jobs).filter(j => j.status === 'COMPLETED' || j.status === 'FAILED').length;
    const progress = (completedJobs / totalJobs) * 100;

    return (
        <div className="space-y-6 mt-8">
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>Overall Progress</span>
                    <span>{Math.round(progress)}% ({completedJobs}/{totalJobs})</span>
                </div>
                <Progress value={progress} className="h-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OPERATIONS.map(op => {
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
        </div>
    );
}
