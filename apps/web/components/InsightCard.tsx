export function InsightCard({ insight }: { insight: string }) {
    if (!insight) return null;
    return (
        <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-md text-sm text-indigo-800 dark:text-indigo-200">
            <span className="font-semibold block mb-1">✨ Insight:</span>
            {insight}
        </div>
    );
}
