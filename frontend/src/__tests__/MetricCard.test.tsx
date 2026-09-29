import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../../src/components/MetricCard';
import { Activity } from 'lucide-react';

describe('MetricCard Component', () => {
  it('renders title, value, subtitle and badge', () => {
    render(
      <MetricCard
        icon={<Activity className="w-4 h-4" />}
        title="Active Complaints"
        subtitle="Open and In Progress"
        value={42}
        badgeText="+12% today"
        badgeType="warning"
      />
    );

    expect(screen.getByText('Active Complaints')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('Open and In Progress')).toBeDefined();
    expect(screen.getByText('+12% today')).toBeDefined();
  });
});
