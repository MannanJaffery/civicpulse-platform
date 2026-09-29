import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

vi.mock('../src/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/api/client')>();
  return {
    ...actual,
    getReady: vi.fn().mockResolvedValue({ status: 'ready', database: 'connected', cache: 'connected' }),
    getHealth: vi.fn().mockResolvedValue({ status: 'ok' }),
  };
});

describe('App Component', () => {
  it('renders application title', () => {
    render(<App />);
    expect(screen.getByText(/CivicPulse Platform/i)).toBeDefined();
  });

  it('renders navigation tabs', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Submit Complaint/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Operations Dashboard/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Live Stats/i })).toBeDefined();
  });

  it('renders Submit view by default', () => {
    render(<App />);
    expect(screen.getByLabelText(/Complaint Description/i)).toBeDefined();
  });
});
