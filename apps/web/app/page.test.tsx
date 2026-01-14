import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './page';

// Mock next/link since it's used in the component
vi.mock('next/link', () => ({
    default: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
}));

describe('Home Page', () => {
    it('renders the main heading', () => {
        render(<Home />);
        expect(screen.getByText(/Emma's Distributed Calculator App/i)).toBeInTheDocument();
        expect(screen.getByText(/Empowering your workforce/i)).toBeInTheDocument();
    });

    it('renders login and register buttons', () => {
        render(<Home />);
        const loginLink = screen.getByRole('link', { name: /login/i });
        const registerLink = screen.getByRole('link', { name: /register/i });

        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');

        expect(registerLink).toBeInTheDocument();
        expect(registerLink).toHaveAttribute('href', '/register');
    });
});
