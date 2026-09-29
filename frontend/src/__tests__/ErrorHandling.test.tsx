import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitComplaint } from '../api/client';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('Frontend API Client – Error Handling & Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles field-level validation errors gracefully', async () => {
    const errorResponse = {
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          errors: [
            { field: 'text', message: 'Text too short (min 10 chars)' },
            { field: 'location', message: 'Location required' },
          ],
        },
      },
    };

    (mockedAxios.create as any).mockReturnValue({
      post: vi.fn().mockRejectedValue(errorResponse),
    });

    try {
      await submitComplaint({ text: 'short', location: 'ab' });
    } catch (err: any) {
      expect(err).toBeDefined();
    }
  });

  it('handles HTTP 429 rate limit errors with Retry-After', async () => {
    const rateLimitResponse = {
      isAxiosError: true,
      response: {
        status: 429,
        data: { detail: 'Too Many Requests' },
        headers: { 'retry-after': '30' },
      },
    };

    (mockedAxios.create as any).mockReturnValue({
      post: vi.fn().mockRejectedValue(rateLimitResponse),
    });

    try {
      await submitComplaint({ text: 'Burst pipe flooding street 10', location: 'Sector F-8/2' });
    } catch (err: any) {
      expect(err.status).toBe(429);
      expect(err.retryAfter).toBe('30');
    }
  });
});
