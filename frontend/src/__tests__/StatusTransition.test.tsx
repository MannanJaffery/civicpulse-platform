import { describe, it, expect } from 'vitest';
import { updateStatus, submitComplaint } from '../../src/api/client';
import { Status } from '../../src/types';

describe('updateStatus – 409 Conflict on Invalid Transitions', () => {
  it('throws error with verbatim message for resolved -> open transition', async () => {
    const complaint = await submitComplaint({
      text: 'Testing status transitions',
      location: 'Test Location',
    });

    // open -> in_progress
    await updateStatus(complaint.id, Status.in_progress);
    // in_progress -> resolved
    await updateStatus(complaint.id, Status.resolved);

    // resolved -> open should throw 409
    try {
      await updateStatus(complaint.id, Status.open);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.status).toBe(409);
      expect(err.message).toContain('Invalid status transition from resolved to open');
    }
  }, 15000);

  it('throws error with verbatim message for rejected -> in_progress transition', async () => {
    const complaint = await submitComplaint({
      text: 'Another test for transitions',
      location: 'Test Location 2',
    });

    // open -> rejected
    await updateStatus(complaint.id, Status.rejected);

    // rejected -> in_progress should throw 409
    try {
      await updateStatus(complaint.id, Status.in_progress);
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err.status).toBe(409);
      expect(err.message).toContain('Invalid status transition from rejected to in_progress');
    }
  }, 15000);
});
