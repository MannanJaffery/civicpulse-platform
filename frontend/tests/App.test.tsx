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
    expect(screen.getByText(/Submit Complaint/i)).toBeDefined();
    expect(screen.getByText(/Operations Dashboard/i)).toBeDefined();
    expect(screen.getByText(/Live Stats/i)).toBeDefined();
  });

  it('renders introductory badge elements', () => {
    render(<App />);
    expect(screen.getByText(/React 18 \+ Vite/i)).toBeDefined();
  });
});
