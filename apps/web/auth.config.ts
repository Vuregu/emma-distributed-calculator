import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    providers: [
        // Added later in auth.ts
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register' || nextUrl.pathname === '/';

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return Response.redirect(new URL('/', nextUrl)); // Redirect unauthenticated users to home
            } else if (isLoggedIn && isOnAuthPage) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
} satisfies NextAuthConfig;
