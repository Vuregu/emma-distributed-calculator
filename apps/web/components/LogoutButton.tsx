'use client';

import { signOutAction } from '@/lib/actions';

export function LogoutButton() {
    return (
        <button
            onClick={() => signOutAction()}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
            Sign Out
        </button>
    );
}
