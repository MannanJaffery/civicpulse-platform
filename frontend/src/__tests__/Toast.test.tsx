import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../../src/components/Toast';

describe('Toast Component', () => {
  it('renders success toast with title and message', () => {
    const handleClose = vi.fn();
    render(
      <Toast
        id="toast-1"
        type="success"
        title="Status Updated"
        message="Complaint marked as in progress"
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Status Updated')).toBeDefined();
    expect(screen.getByText('Complaint marked as in progress')).toBeDefined();
  });

  it('triggers onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Toast
        id="toast-2"
        type="error"
        title="Conflict Error"
        message="Invalid transition from resolved to open"
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByLabelText('Dismiss notification');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledWith('toast-2');
  });
});
