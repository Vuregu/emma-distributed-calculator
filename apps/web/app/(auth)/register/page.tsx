'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { register } from '@/lib/actions';
import { Button } from '@/components/ui/button';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button disabled={pending}>
            {pending ? 'Registering...' : 'Register'}
        </Button>
    );
}

export default function RegisterPage() {
    const [errorMessage, formAction] = useFormState(register, undefined);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form action={formAction} className="flex w-full max-w-sm flex-col gap-4 p-4 border rounded-lg shadow-md">
                <h1 className="text-2xl font-bold">Register</h1>

                <label htmlFor="name" className="block text-sm font-medium">Name</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Emma Worker"
                    className="border p-2 rounded"
                    required
                />

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
                <p className="text-sm">Already have an account? <a href="/login" className="underline">Sign in</a></p>

                {errorMessage && (
                    <p className="text-sm text-red-500">{errorMessage}</p>
                )}
            </form>
        </div>
    );
}
