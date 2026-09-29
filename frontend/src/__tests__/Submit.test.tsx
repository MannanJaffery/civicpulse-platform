import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Submit from '../../src/pages/Submit';

// Mock the API client
vi.mock('../../src/api/client', () => ({
  submitComplaint: vi.fn(),
}));

import { submitComplaint } from '../../src/api/client';

describe('Submit – Client-side Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation error when complaint text is too short', async () => {
    render(<Submit />);
    const textarea = screen.getByLabelText(/Complaint Description/i);
    const locationInput = screen.getByLabelText(/Location/i);
    const button = screen.getByRole('button', { name: /Submit/i });

    fireEvent.change(textarea, { target: { value: 'short' } });
    fireEvent.change(locationInput, { target: { value: 'Street 12' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/between 10 and 2000 characters/i)).toBeDefined();
    });
    expect(submitComplaint).not.toHaveBeenCalled();
  });

  it('shows validation error when location is too short', async () => {
    render(<Submit />);
    const textarea = screen.getByLabelText(/Complaint Description/i);
    const locationInput = screen.getByLabelText(/Location/i);
    const button = screen.getByRole('button', { name: /Submit/i });

    fireEvent.change(textarea, { target: { value: 'This is a valid complaint description text.' } });
    fireEvent.change(locationInput, { target: { value: 'AB' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/between 3 and 200 characters/i)).toBeDefined();
    });
    expect(submitComplaint).not.toHaveBeenCalled();
  });
});
