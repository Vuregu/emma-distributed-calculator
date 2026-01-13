import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMathInsight } from './llm';

// Mock OpenAI
const { mockCreate } = vi.hoisted(() => ({
    mockCreate: vi.fn(),
}));

vi.mock('openai', () => {
    return {
        default: vi.fn().mockImplementation(function () {
            return {
                chat: {
                    completions: {
                        create: mockCreate
                    }
                }
            };
        })
    };
});

describe('getMathInsight', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset env var mock per test if needed, but here we assume it's set or we mock it
        process.env.OPENAI_API_KEY = 'test-key';
    });

    it('should return insight from OpenAI', async () => {
        mockCreate.mockResolvedValueOnce({
            choices: [{ message: { content: 'Interesting fact about 42' } }]
        });

        const result = await getMathInsight(42);
        expect(result).toBe('Interesting fact about 42');
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            messages: expect.arrayContaining([
                expect.objectContaining({ content: 'The number is 42.' })
            ])
        }));
    });

    it('should handle API errors gracefully', async () => {
        mockCreate.mockRejectedValueOnce(new Error('API Error'));
        const result = await getMathInsight(10);
        expect(result).toBe('Insight generation failed.');
    });

    it('should skip if no API key present', async () => {
        const originalKey = process.env.OPENAI_API_KEY;
        delete process.env.OPENAI_API_KEY;

        const result = await getMathInsight(100);
        expect(result).toBe('Calculated successfully.');

        process.env.OPENAI_API_KEY = originalKey;
    });
});
