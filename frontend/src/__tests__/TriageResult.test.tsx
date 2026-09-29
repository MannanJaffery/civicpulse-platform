import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Submit from '../../src/pages/Submit';
import { Category, Priority, Status } from '../../src/types';

// Mock the API client
vi.mock('../../src/api/client', () => ({
  submitComplaint: vi.fn(),
}));

import { submitComplaint } from '../../src/api/client';

const mockedSubmit = vi.mocked(submitComplaint);

describe('Submit – Triage Result Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays triage result and provider tag after successful submission', async () => {
    mockedSubmit.mockResolvedValue({
      id: 'test-id-123',
      text: 'Pothole on main road causing hazard',
      location: 'Street 12',
      category: Category.roads,
      priority: Priority.high,
      status: Status.open,
      ai_summary: 'Hazardous pothole reported on Street 12',
      triaged_by: 'llm:groq',
      triage_latency_ms: 1100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    render(<Submit />);
    const textarea = screen.getByLabelText(/Complaint Description/i);
    const locationInput = screen.getByLabelText(/Location/i);
    const button = screen.getByRole('button', { name: /Submit/i });

    fireEvent.change(textarea, { target: { value: 'Pothole on main road causing hazard.' } });
    fireEvent.change(locationInput, { target: { value: 'Street 12' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Triage Result/i)).toBeDefined();
    });

    expect(screen.getByText(/roads/)).toBeDefined();
    expect(screen.getByText(/high/)).toBeDefined();
    expect(screen.getByText(/Hazardous pothole reported on Street 12/)).toBeDefined();
    expect(screen.getByText(/llm:groq/)).toBeDefined();
  });
});
