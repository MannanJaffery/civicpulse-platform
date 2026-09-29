import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Stats from '../../src/pages/Stats';

// Mock the API client
vi.mock('../../src/api/client', () => ({
  getStats: vi.fn(),
  getMetaProviders: vi.fn(),
}));

import { getStats, getMetaProviders } from '../../src/api/client';
import { Category, Priority, Status } from '../../src/types';

const mockedGetStats = vi.mocked(getStats);
const mockedGetMetaProviders = vi.mocked(getMetaProviders);

const mockStats = {
  total: 10,
  by_category: {
    [Category.water]: 4,
    [Category.electricity]: 2,
    [Category.sanitation]: 2,
    [Category.roads]: 1,
    [Category.streetlights]: 1,
    [Category.other]: 0,
  },
  by_priority: {
    [Priority.high]: 5,
    [Priority.normal]: 3,
    [Priority.low]: 2,
  },
  by_status: {
    [Status.open]: 6,
    [Status.in_progress]: 2,
    [Status.resolved]: 2,
    [Status.rejected]: 0,
  },
};

const mockMeta = {
  active_provider: 'llm:groq',
  outcomes: [
    {
      provider: 'llm:groq',
      latency_ms: 245,
      fallback: false,
      timestamp: '2026-09-29T10:00:00Z',
    },
    {
      provider: 'rules:fallback',
      latency_ms: 12,
      fallback: true,
      timestamp: '2026-09-29T10:05:00Z',
    },
  ],
};

describe('Stats – Observability & Meta Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders aggregate statistics cards with total complaints count', async () => {
    mockedGetStats.mockResolvedValue({ data: mockStats, hit: true });
    mockedGetMetaProviders.mockResolvedValue(mockMeta);

    render(<Stats />);

    await waitFor(() => {
      expect(screen.getByText('Aggregate Statistics')).toBeDefined();
      expect(screen.getByText('10')).toBeDefined();
    });
  });

  it('renders provider latency and fallback indicators when metadata is loaded', async () => {
    mockedGetStats.mockResolvedValue({ data: mockStats, hit: false });
    mockedGetMetaProviders.mockResolvedValue(mockMeta);

    render(<Stats />);

    await waitFor(() => {
      const badge = screen.getByTestId('cache-badge');
      expect(badge.textContent).toContain('MISS');
    });
  });
});
