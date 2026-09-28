import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

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
