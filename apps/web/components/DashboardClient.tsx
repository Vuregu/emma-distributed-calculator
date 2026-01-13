'use client';

import { useState } from 'react';
import { InputForm } from './InputForm';
import { ProgressDisplay } from './ProgressDisplay';
import { HistoryTable } from './HistoryTable';

interface DashboardClientProps {
    initialHistory: any[];
}

export function DashboardClient({ initialHistory }: DashboardClientProps) {
    const [history, setHistory] = useState<any[]>(initialHistory);
    const [activeJobGroupId, setActiveJobGroupId] = useState<string | null>(null);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);

    // Merge new runs into history locally? Or just refetch? 
    // Simplicity: InputForm submission sets active ID.
    // If we select history, we set active ID and active Jobs.

    const handleJobStarted = (id: string, jobs?: any[], a?: number, b?: number) => {
        setActiveJobGroupId(id);
        if (jobs) {
            setActiveJobs(jobs);

            // If we have input params, it means it's a new job from InputForm. 
            // Add to history.
            if (a !== undefined && b !== undefined) {
                const newHistoryItem = {
                    id,
                    createdAt: new Date(), // Now
                    a,
                    b,
                    jobs
                };
                setHistory(prev => [newHistoryItem, ...prev]);
            }
        } else {
            setActiveJobs([]);
        }
    };

    const handleJobUpdate = (jobGroupId: string, updatedJob: any) => {
        setHistory(prev => prev.map(group => {
            if (group.id === jobGroupId) {
                const updatedJobs = group.jobs.map((job: any) => {
                    if (job.id === updatedJob.jobId) {
                        return { ...job, ...updatedJob };
                    }
                    return job;
                });
                return { ...group, jobs: updatedJobs };
            }
            return group;
        }));
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
                                jobGroupId={activeJobGroupId}
                                initialJobs={activeJobs}
                                onJobUpdate={handleJobUpdate}
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
