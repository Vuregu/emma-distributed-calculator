export function VersionDisplay() {
    // If not set/local, fallback to "dev"
    const version = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';

    return (
        <div className="text-xs text-muted-foreground/40 font-mono px-4 py-2 opacity-50 hover:opacity-100 transition-opacity">
            v{version}
        </div>
    );
}
