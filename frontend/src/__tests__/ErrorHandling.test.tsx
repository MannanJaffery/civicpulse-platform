import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitComplaint, apiClient } from '../api/client';
import { AxiosError, AxiosHeaders } from 'axios';

describe('Frontend API Client – Error Handling & Edge Cases', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles field-level validation errors gracefully', async () => {
    const axiosError = new AxiosError(
      'Request failed with status code 400',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          errors: [
            { field: 'text', message: 'Text too short (min 10 chars)' },
            { field: 'location', message: 'Location required' },
          ],
        },
      }
    );

    vi.spyOn(apiClient, 'post').mockRejectedValue(axiosError);

    try {
      await submitComplaint({ text: 'short', location: 'ab' });
    } catch (err: any) {
      expect(err.status).toBe(400);
      expect(err.message).toContain('Text too short');
    }
  });

  it('handles HTTP 429 rate limit errors with Retry-After', async () => {
    const rateLimitError = new AxiosError(
      'Request failed with status code 429',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 429,
        statusText: 'Too Many Requests',
        headers: { 'retry-after': '30' },
        config: { headers: new AxiosHeaders() },
        data: { detail: 'Rate limit exceeded: 5 requests per minute' },
      }
    );

    vi.spyOn(apiClient, 'post').mockRejectedValue(rateLimitError);

    try {
      await submitComplaint({ text: 'Burst pipe flooding street 10', location: 'Sector F-8/2' });
    } catch (err: any) {
      expect(err.status).toBe(429);
      expect(err.retryAfter).toBe('30');
      expect(err.message).toContain('Rate limit exceeded');
    }
  });
});
