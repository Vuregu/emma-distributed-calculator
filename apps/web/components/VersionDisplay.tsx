export function VersionDisplay() {
    // If not set/local, fallback to "dev"
    const version = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';

    return (
        <div className="text-xs text-muted-foreground font-mono px-4 py-2 hover:text-foreground transition-colors">
            v{version}
        </div>
    );
}
