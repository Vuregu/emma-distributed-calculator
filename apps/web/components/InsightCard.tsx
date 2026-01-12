export function InsightCard({ insight }: { insight: string }) {
    if (!insight) return null;
    return (
        <div className="mt-2 p-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 border border-purple-200/60 dark:border-purple-700/60 rounded-lg text-sm text-gray-800 dark:text-gray-100 shadow-sm">
            <span className="font-semibold block mb-1 text-purple-700 dark:text-purple-300">✨ Insight:</span>
            {insight}
        </div>
    );
}
