'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button disabled={pending}>
            {pending ? 'Signing in...' : 'Sign in'}
        </Button>
    );
}

export default function LoginPage() {
    const [errorMessage, formAction] = useFormState(authenticate, undefined);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form action={formAction} className="flex w-full max-w-sm flex-col gap-4 p-4 border rounded-lg shadow-md">
                <h1 className="text-2xl font-bold">Sign In</h1>

                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="user@example.com"
                    className="border p-2 rounded"
                    required
                />

                <label htmlFor="password" className="block text-sm font-medium">Password</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    className="border p-2 rounded"
                    required
                    minLength={6}
                />

                <SubmitButton />
                <p className="text-sm">Don't have an account? <a href="/register" className="underline">Register</a></p>

                {errorMessage && (
                    <p className="text-sm text-red-500">{errorMessage}</p>
                )}
            </form>
        </div>
    );
}
