'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { InputForm } from './InputForm';
import { ProgressDisplay } from './ProgressDisplay';
import { HistoryTable } from './HistoryTable';
import { Job, JobGroup } from '@repo/database';
import { JobResult } from '@repo/types';
import { authorizeSocketConnection } from '../lib/actions';

interface DashboardClientProps {
    initialHistory: (JobGroup & { jobs: Job[] })[];
    userId: string;
}

export function DashboardClient({ initialHistory, userId }: DashboardClientProps) {
    const [history, setHistory] = useState<(JobGroup & { jobs: Job[] })[]>(initialHistory);
    const [activeJobGroupId, setActiveJobGroupId] = useState<string | null>(null);

    // Derive active group and jobs directly from history
    const activeGroup = history.find(g => g.id === activeJobGroupId);
    const activeJobs = activeGroup?.jobs || [];

    useEffect(() => {
        if (!activeJobGroupId) return;

        let socket: ReturnType<typeof io> | null = null;

        const connect = async () => {
            try {
                const token = await authorizeSocketConnection(activeJobGroupId);

                const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:3001';
                socket = io(workerUrl);

                socket.emit('join_job_group', { jobGroupId: activeJobGroupId, token });

                socket.on('job_update', (data: JobResult) => {
                    setHistory(prev => prev.map(group => {
                        if (group.id !== activeJobGroupId) return group;

                        const jobs = group.jobs;
                        const jobIndex = jobs.findIndex(j => j.id === data.jobId);

                        if (jobIndex === -1) return group;

                        const updatedJobs = jobs.map(job =>
                            job.id === data.jobId ? {
                                ...job,
                                status: data.status,
                                result: data.result ?? null,
                                resultInsight: data.resultInsight ?? null
                            } : job
                        );

                        return { ...group, jobs: updatedJobs };
                    }));
                });
            } catch (error) {
                console.error("Failed to authorize socket connection:", error);
            }
        };

        connect();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [activeJobGroupId]);

    const handleJobStarted = (id: string, jobs?: Job[], a?: number, b?: number) => {
        setActiveJobGroupId(id);

        // If we have input params, it means it's a new job from InputForm. 
        // Add to history.
        if (jobs && a !== undefined && b !== undefined) {
            const newHistoryItem = {
                id,
                createdAt: new Date(), // Now
                a,
                b,
                userId,
                jobs
            };
            setHistory(prev => [newHistoryItem, ...prev]);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-2">
                        Emma's Calculator Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Manage your distributed calculation jobs efficiently.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <InputForm onJobStarted={handleJobStarted} />
                </div>

                <div className="lg:col-span-2 space-y-8">
                    {activeJobGroupId ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold tracking-tight">
                                    Active Group Details
                                </h2>
                                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                    {activeJobGroupId}
                                </span>
                            </div>
                            <ProgressDisplay
                                jobs={activeJobs}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-muted-foreground/25 bg-muted/50 text-center">
                            <p className="text-muted-foreground text-lg">Select a job from history or start a new one to view details.</p>
                        </div>
                    )}

                    <HistoryTable history={history} onSelect={handleJobStarted} />
                </div>
            </div>
        </div>
    );
}
