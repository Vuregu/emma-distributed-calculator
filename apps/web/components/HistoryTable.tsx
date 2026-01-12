import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button'; // shadcn

interface HistoryTableProps {
    history: any[];
    onSelect: (jobGroupId: string, jobs: any[]) => void;
}

export function HistoryTable({ history, onSelect }: HistoryTableProps) {
    return (
        <div className="mt-12 rounded-xl border border-border overflow-hidden bg-card/75 backdrop-blur-md shadow-md transition-all hover:shadow-lg">
            <div className="p-6 border-b border-border/50 bg-muted/40 flex items-center justify-between">
                <h3 className="font-semibold text-lg tracking-tight">Calculation History</h3>
                <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-full border border-border/60">
                    {history.length} items
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground font-medium uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-5 font-semibold">Date</th>
                            <th className="p-5 font-semibold">Input Params</th>
                            <th className="p-5 font-semibold">Status</th>
                            <th className="p-5 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {history.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                                    No history available yet. Start a job to populate this list.
                                </td>
                            </tr>
                        )}
                        {history.map((group) => {
                            const isCompleted = group.jobs.every((j: any) => j.status === 'COMPLETED');
                            const status = isCompleted ? 'Completed' : 'Processing/Failed';

                            return (
                                <tr key={group.id} className="group hover:bg-accent/40 transition-colors duration-200">
                                    <td className="p-5 text-muted-foreground font-medium">
                                        {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
                                    </td>
                                    <td className="p-5 font-mono text-xs md:text-sm text-foreground/80">
                                        <span className="bg-background/80 px-2 py-1 rounded border border-border/50">
                                            A: {group.a}
                                        </span>
                                        <span className="mx-2 text-muted-foreground">&</span>
                                        <span className="bg-background/80 px-2 py-1 rounded border border-border/50">
                                            B: {group.b}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border theme-transition",
                                            isCompleted
                                                ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                                                : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20")}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5",
                                                isCompleted ? "bg-green-500" : "bg-yellow-500 animate-pulse")} />
                                            {status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" onClick={() => onSelect(group.id, group.jobs)}
                                            className="hover:bg-primary/10 hover:text-primary transition-colors">
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Helper for classnames if utils not imported (but it should be)
import { cn } from '@/lib/utils';
