import { describe, it, expect } from 'vitest';
import { getComplaints, submitComplaint } from '../../src/api/client';
import { Category, Priority, Status } from '../../src/types';

describe('API Client – Query Construction & Filtering', () => {
  it('correctly filters complaints by category, priority, and status', async () => {
    // Seed data
    await submitComplaint({
      text: 'Water main burst flooding street',
      location: 'Main St',
      category: Category.water,
      priority: Priority.high,
    });

    const result = await getComplaints({
      category: Category.water,
      priority: Priority.high,
      status: Status.open,
    });

    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    result.data.forEach((c) => {
      expect(c.category).toBe(Category.water);
      expect(c.priority).toBe(Priority.high);
      expect(c.status).toBe(Status.open);
    });
  });

  it('handles pagination parameters correctly', async () => {
    const page1 = await getComplaints({ page: 1, page_size: 1 });
    expect(page1.data.length).toBeLessThanOrEqual(1);
  });
});
