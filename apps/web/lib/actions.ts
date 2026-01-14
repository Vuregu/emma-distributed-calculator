'use server';

import { signIn, signOut, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function signOutAction() {
    await signOut();
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', Object.fromEntries(formData));
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function register(
    prevState: string | undefined,
    formData: FormData,
) {
    const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
    });

    const parsed = schema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
        return 'Invalid fields';
    }

    const { email, password, name } = parsed.data;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return 'User already exists.';

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
    } catch {
        return 'Failed to create user.';
    }

    try {
        await signIn('credentials', { email, password });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Something went wrong logging in after register.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

/**
 * Authorizes a user to connect to a specific job group's socket room.
 * Returns a short-lived JWT signed with NEXTAUTH_SECRET.
 * The token contains the jobGroupId, which the worker will verify.
 */
export async function authorizeSocketConnection(jobGroupId: string) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error('Unauthorized');
    }

    // Verify ownership of the job group
    const jobGroup = await prisma.jobGroup.findFirst({
        where: {
            id: jobGroupId,
            userId: userId
        }
    });

    if (!jobGroup) {
        throw new Error('Forbidden: You do not own this job group');
    }

    if (!process.env.NEXTAUTH_SECRET) {
        throw new Error('Server configuration error: NEXTAUTH_SECRET is missing');
    }

    // Sign a short-lived token (e.g., 30 seconds) just for the handshake
    const token = jwt.sign(
        { jobGroupId },
        process.env.NEXTAUTH_SECRET,
        { expiresIn: '30s' }
    );

    return token;
}
