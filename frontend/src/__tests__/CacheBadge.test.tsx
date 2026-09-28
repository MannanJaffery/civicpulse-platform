import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Stats from '../../src/pages/Stats';

// Mock the API client
vi.mock('../../src/api/client', () => ({
  getStats: vi.fn(),
}));

import { getStats } from '../../src/api/client';
import { Category, Priority, Status } from '../../src/types';

const mockedGetStats = vi.mocked(getStats);

const mockStats = {
  total: 5,
  by_category: {
    [Category.water]: 2,
    [Category.electricity]: 1,
    [Category.sanitation]: 0,
    [Category.roads]: 1,
    [Category.streetlights]: 0,
    [Category.other]: 1,
  },
  by_priority: {
    [Priority.high]: 2,
    [Priority.normal]: 2,
    [Priority.low]: 1,
  },
  by_status: {
    [Status.open]: 3,
    [Status.in_progress]: 1,
    [Status.resolved]: 1,
    [Status.rejected]: 0,
  },
};

describe('Stats – X-Cache Badge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders X-Cache: HIT badge when cache hit is true', async () => {
    mockedGetStats.mockResolvedValue({ data: mockStats, hit: true });

    render(<Stats />);

    await waitFor(() => {
      const badge = screen.getByTestId('cache-badge');
      expect(badge.textContent).toContain('HIT');
    });
  });

  it('renders X-Cache: MISS badge when cache hit is false', async () => {
    mockedGetStats.mockResolvedValue({ data: mockStats, hit: false });

    render(<Stats />);

    await waitFor(() => {
      const badge = screen.getByTestId('cache-badge');
      expect(badge.textContent).toContain('MISS');
    });
  });
});
