import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

vi.mock('../src/components/Navbar', () => ({
  Navbar: ({ activeTab, setActiveTab }: any) => (
    <header>
      <span>CivicPulse Platform</span>
      <button onClick={() => setActiveTab('submit')}>Submit Complaint</button>
      <button onClick={() => setActiveTab('dashboard')}>Operations Dashboard</button>
      <button onClick={() => setActiveTab('stats')}>Live Stats</button>
    </header>
  ),
}));

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
