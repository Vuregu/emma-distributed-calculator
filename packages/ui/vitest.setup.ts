import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock console.error and console.warn to reduce bloat in tests
vi.spyOn(console, 'error').mockImplementation(() => { });
vi.spyOn(console, 'warn').mockImplementation(() => { });
