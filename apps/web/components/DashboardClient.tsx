'use client';

import { useState } from 'react';
import { InputForm } from './InputForm';
import { ProgressDisplay } from './ProgressDisplay';
import { HistoryTable } from './HistoryTable';

interface DashboardClientProps {
    initialHistory: any[];
}

export function DashboardClient({ initialHistory }: DashboardClientProps) {
    const [activeJobGroupId, setActiveJobGroupId] = useState<string | null>(null);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);

    // Merge new runs into history locally? Or just refetch? 
    // Simplicity: InputForm submission sets active ID.
    // If we select history, we set active ID and active Jobs.

    const handleJobStarted = (id: string, jobs?: any[]) => {
        setActiveJobGroupId(id);
        if (jobs) {
            setActiveJobs(jobs);
        } else {
            setActiveJobs([]);
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
                            <ProgressDisplay jobGroupId={activeJobGroupId} initialJobs={activeJobs} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-muted-foreground/25 bg-muted/50 text-center">
                            <p className="text-muted-foreground text-lg">Select a job from history or start a new one to view details.</p>
                        </div>
                    )}

                    <HistoryTable history={initialHistory} onSelect={handleJobStarted} />
                </div>
            </div>
        </div>
    );
}
