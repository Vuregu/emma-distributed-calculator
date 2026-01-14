import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RegisterPage from './page';

// Mock server actions and hooks
vi.mock('@/lib/actions', () => ({
    register: vi.fn(),
}));

vi.mock('react-dom', () => ({
    ...vi.importActual('react-dom'),
    useFormState: () => [null, vi.fn()],
    useFormStatus: () => ({ pending: false }),
}));

describe('RegisterPage', () => {
    it('renders register form correctly', () => {
        render(<RegisterPage />);

        expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('renders link to login page', () => {
        render(<RegisterPage />);
        const loginLink = screen.getByRole('link', { name: /sign in/i });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');
    });
});
