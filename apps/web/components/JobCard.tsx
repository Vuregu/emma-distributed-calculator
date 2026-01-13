import { JobResult } from '@repo/types';
import { InsightCard } from './InsightCard';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
// Wait, I saw Card usage in my failed replace attempt but the original file used div. 
// I will revert to using div to be safe as I didn't check for Card component existence.
// Actually, the previous view of ProgressDisplay used div. 
// The original JobCard used div.
// I'll stick to div to avoid missing dependencies.

interface JobCardProps {
    type: string;
    status: string;
    result?: number | null;
    resultInsight?: string | null;
}

export function JobCard({ type, status, result, resultInsight }: JobCardProps) {
    const isCompleted = status === 'COMPLETED';
    const isFailed = status === 'FAILED';
    const isProcessing = status === 'PROCESSING';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-600 text-white border-green-700 shadow-sm';
            case 'FAILED': return 'bg-red-600 text-white border-red-700 shadow-sm';
            case 'PROCESSING': return 'bg-blue-600 text-white border-blue-700 shadow-sm animate-pulse';
            default: return 'bg-secondary text-secondary-foreground border-border';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="w-5 h-5 text-white" />;
            case 'FAILED': return <XCircle className="w-5 h-5 text-white" />;
            case 'PROCESSING': return <Loader2 className="w-5 h-5 text-white animate-spin" />;
            default: return <Clock className="w-5 h-5 text-muted-foreground" />;
        }
    };

    return (
        <div className={cn(
            "p-5 border rounded-xl shadow-sm transition-all duration-300 group backdrop-blur-sm bg-card/80 hover:bg-card/90 border-border",
            "hover:shadow-md hover:-translate-y-1"
        )}>
            <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-lg tracking-tight group-hover:text-primary transition-colors">{type}</span>
                <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                </div>
            </div>

            <div className={`transition-all duration-500 ${result !== undefined || result === 0 ? 'opacity-100' : 'opacity-50 blur-[1px]'}`}>
                {result !== undefined && result !== null ? (
                    <div className="mb-4">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Result</span>
                        <div className="text-3xl font-mono font-bold text-foreground mt-1">
                            {typeof result === 'number' ? result.toFixed(2) : result}
                        </div>
                    </div>
                ) : (
                    <div className="mb-4">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Result</span>
                        <div className="text-3xl font-mono font-bold text-muted-foreground/30 mt-1">
                            ---
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusColor(status)}`}>
                    {status}
                </span>
            </div>

            {resultInsight && (
                <div className="mt-4 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-bottom-2">
                    <InsightCard insight={resultInsight} />
                </div>
            )}
        </div>
    );
}
