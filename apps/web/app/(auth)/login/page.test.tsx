import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './page';

// Mock server actions and hooks
vi.mock('@/lib/actions', () => ({
    authenticate: vi.fn(),
}));

vi.mock('react-dom', () => ({
    ...vi.importActual('react-dom'),
    useFormState: () => [null, vi.fn()],
    useFormStatus: () => ({ pending: false }),
}));

describe('LoginPage', () => {
    it('renders login form correctly', () => {
        render(<LoginPage />);

        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders link to register page', () => {
        render(<LoginPage />);
        const registerLink = screen.getByRole('link', { name: /register/i });
        expect(registerLink).toBeInTheDocument();
        expect(registerLink).toHaveAttribute('href', '/register');
    });
});
