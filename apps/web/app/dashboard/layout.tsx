import { LogoutButton } from '@/components/LogoutButton';
import { VersionDisplay } from '@/components/VersionDisplay';
import { auth } from '@/auth';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="font-semibold text-lg tracking-tight">
                            Emma Worker
                        </div>
                        <VersionDisplay />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            {session?.user?.email}
                        </span>
                        <LogoutButton />
                    </div>
                </div>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
}
