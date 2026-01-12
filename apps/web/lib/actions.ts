'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
// import { PrismaClient } from '@repo/database';

// const prisma = new PrismaClient();

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
    } catch (e) {
        return 'Failed to create user.';
    }

    // Auto login after register? Or redirect to login?
    // Start with redirect to login or just call signIn?
    // Let's redirect manually or let the UI handle it.
    // Actually, calling signIn here works too.
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
