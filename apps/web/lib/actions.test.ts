import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate, register, authorizeSocketConnection } from './actions';
import { signIn, auth } from '@/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(),
    }
}));

vi.mock('next-auth', () => ({
    AuthError: class AuthError extends Error {
        type: string;
        constructor(type: string) {
            super(type);
            this.type = type;
        }
    }
}));

vi.mock('@/auth', () => ({
    signIn: vi.fn(),
    auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        jobGroup: {
            findFirst: vi.fn(),
        },
    },
}));

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(),
    },
}));

describe('Actions', () => {
    describe('authenticate', () => {
        it('should call signIn with credentials', async () => {
            const formData = new FormData();
            formData.append('email', 'test@example.com');
            formData.append('password', 'password123');

            await authenticate(undefined, formData);

            expect(signIn).toHaveBeenCalledWith('credentials', {
                email: 'test@example.com',
                password: 'password123',
            });
        });

        it('should return "Invalid credentials." on CredentialsSignin error', async () => {
            const error = new AuthError('CredentialsSignin');
            error.type = 'CredentialsSignin';
            vi.mocked(signIn).mockRejectedValueOnce(error);

            const formData = new FormData();
            const result = await authenticate(undefined, formData);

            expect(result).toBe('Invalid credentials.');
        });

        it('should return "Something went wrong." on other AuthErrors', async () => {
            const error = new AuthError('OtherError');
            error.type = 'CallbackRouteError'; // Example other type
            vi.mocked(signIn).mockRejectedValueOnce(error);

            const formData = new FormData();
            const result = await authenticate(undefined, formData);

            expect(result).toBe('Something went wrong.');
        });

        it('should throw non-AuthError errors', async () => {
            const error = new Error('Random error');
            vi.mocked(signIn).mockRejectedValueOnce(error);

            const formData = new FormData();
            await expect(authenticate(undefined, formData)).rejects.toThrow('Random error');
        });
    });

    describe('register', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('should return "Invalid fields" for invalid input', async () => {
            const formData = new FormData();
            formData.append('email', 'invalid-email');

            const result = await register(undefined, formData);

            expect(result).toBe('Invalid fields');
        });

        it('should return "User already exists." if email is taken', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ id: '1', email: 'test@example.com' } as any);

            const formData = new FormData();
            formData.append('name', 'Test User');
            formData.append('email', 'test@example.com');
            formData.append('password', 'password123');

            const result = await register(undefined, formData);

            expect(result).toBe('User already exists.');
        });

        it('should create user and sign in on success', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
            vi.mocked(bcrypt.hash).mockResolvedValueOnce('hashed_password' as any);
            vi.mocked(signIn).mockResolvedValueOnce(undefined);

            const formData = new FormData();
            formData.append('name', 'Test User');
            formData.append('email', 'new@example.com');
            formData.append('password', 'password123');

            await register(undefined, formData);

            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'new@example.com',
                    password: 'hashed_password',
                    name: 'Test User',
                }
            });
            expect(signIn).toHaveBeenCalledWith('credentials', {
                email: 'new@example.com',
                password: 'password123',
            });
        });

        it('should return "Failed to create user." on DB error', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
            vi.mocked(bcrypt.hash).mockRejectedValueOnce(new Error('DB Error'));

            const formData = new FormData();
            formData.append('name', 'Test User');
            formData.append('email', 'new@example.com');
            formData.append('password', 'password123');

            const result = await register(undefined, formData);

            expect(result).toBe('Failed to create user.');
        });

        it('should return error message if signIn fails after registration', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
            vi.mocked(bcrypt.hash).mockResolvedValueOnce('hashed_password' as any);

            const error = new AuthError('CredentialsSignin');
            error.type = 'CredentialsSignin';
            vi.mocked(signIn).mockRejectedValueOnce(error);

            const formData = new FormData();
            formData.append('name', 'Test User');
            formData.append('email', 'new@example.com');
            formData.append('password', 'password123');

            const result = await register(undefined, formData);

            expect(result).toBe('Something went wrong logging in after register.');
        });
    });

    describe('authorizeSocketConnection', () => {
        beforeEach(() => {
            vi.clearAllMocks();
            process.env.NEXTAUTH_SECRET = 'test-secret';
        });

        afterEach(() => {
            delete process.env.NEXTAUTH_SECRET;
        });

        it('should return a signed token if user owns the job group', async () => {
            vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
            vi.mocked(prisma.jobGroup.findFirst).mockResolvedValueOnce({ id: 'group-1', userId: 'user-1' } as any);
            vi.mocked(jwt.sign).mockImplementationOnce(() => 'mocked-token' as any);

            const token = await authorizeSocketConnection('group-1');

            expect(token).toBe('mocked-token');
            expect(jwt.sign).toHaveBeenCalledWith(
                { jobGroupId: 'group-1' },
                'test-secret',
                { expiresIn: '30s' }
            );
        });

        it('should throw "Unauthorized" if user is not logged in', async () => {
            vi.mocked(auth).mockResolvedValueOnce(null);

            await expect(authorizeSocketConnection('group-1'))
                .rejects.toThrow('Unauthorized');
        });

        it('should throw "Forbidden" if user does not own the job group', async () => {
            vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
            vi.mocked(prisma.jobGroup.findFirst).mockResolvedValueOnce(null);

            await expect(authorizeSocketConnection('group-1'))
                .rejects.toThrow('Forbidden: You do not own this job group');
        });

        it('should throw if NEXTAUTH_SECRET is is missing', async () => {
            vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
            vi.mocked(prisma.jobGroup.findFirst).mockResolvedValueOnce({ id: 'group-1', userId: 'user-1' } as any);
            delete process.env.NEXTAUTH_SECRET;

            await expect(authorizeSocketConnection('group-1'))
                .rejects.toThrow('Server configuration error');
        });
    });
});
