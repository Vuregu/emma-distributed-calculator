'use client';

import { JobCard } from './JobCard';
import { Progress } from './ui/progress';
import { Job } from '@repo/database';

interface ProgressDisplayProps {
    jobs: Job[];
}

const OPERATIONS = ['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'];

export function ProgressDisplay({ jobs }: ProgressDisplayProps) {
    const totalJobs = OPERATIONS.length;
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'FAILED').length;
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
                    const job = jobs.find(j => j.type === op);
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
