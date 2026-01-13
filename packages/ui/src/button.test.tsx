import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
    it('renders children correctly', () => {
        render(<Button appName="test">Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button appName="test" onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('triggers alert by default when onClick is not provided', () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });
        render(<Button appName="test-app">Click me</Button>);
        fireEvent.click(screen.getByText('Click me'));
        expect(alertMock).toHaveBeenCalledWith('Hello from your test-app app!');
        alertMock.mockRestore();
    });
});
