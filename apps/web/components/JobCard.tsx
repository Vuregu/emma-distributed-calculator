import { JobResult } from '@repo/types';
import { InsightCard } from './InsightCard';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface JobCardProps {
    type: string;
    // job: JobResult | null; // Removed unused prop
    status: string;
    result?: number | null;
    resultInsight?: string | null;
}

export function JobCard({ type, status, result, resultInsight }: JobCardProps) {
    const isCompleted = status === 'COMPLETED';
    const isFailed = status === 'FAILED';
    const isProcessing = status === 'PROCESSING';

    const statusBorderColor = isCompleted ? 'border-green-500/20' :
        isFailed ? 'border-red-500/20' :
            isProcessing ? 'border-blue-500/20' : 'border-border';

    const statusBg = isCompleted ? 'bg-green-500/20 hover:bg-green-500/30 border-green-500/40' :
        isFailed ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500/40' :
            isProcessing ? 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40' : 'bg-card/80 hover:bg-card/90 border-border';

    return (
        <div className={cn(
            "p-5 border rounded-xl shadow-sm transition-all duration-300 group backdrop-blur-sm",
            "hover:shadow-md hover:-translate-y-1",
            // statusBorderColor, // Removed as it is now part of statusBg logic or fixed
            statusBg
        )}>
            <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">{type}</span>
                <div className="flex items-center gap-2">
                    {status === 'PROCESSING' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                    {status === 'COMPLETED' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {status === 'FAILED' && <XCircle className="h-5 w-5 text-red-500" />}
                    {status === 'PENDING' && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Waiting</span>}
                </div>
            </div>

            {status === 'COMPLETED' && result !== undefined && (
                <div className="mb-4">
                    <span className="text-sm text-muted-foreground">Result</span>
                    <div className="text-3xl font-mono font-bold text-foreground mt-1">
                        {result}
                    </div>
                </div>
            )}

            {resultInsight && (
                <div className="pt-3 border-t border-border/50">
                    <InsightCard insight={resultInsight} />
                </div>
            )}
        </div>
    );
}
