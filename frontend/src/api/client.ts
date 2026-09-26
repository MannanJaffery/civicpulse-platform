import { Complaint, Category, Priority, Status, StatsResponse } from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockComplaints: Complaint[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    text: 'Burst water main flooding Street 12 since fajr, water entering ground floors',
    location: 'Street 12',
    reporter_contact: '555-0100',
    category: Category.water,
    priority: Priority.high,
    status: Status.open,
    ai_summary: 'Burst water main flooding ground floors on Street 12',
    triaged_by: 'llm:groq',
    triage_latency_ms: 1200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const submitComplaint = async (data: Partial<Complaint>): Promise<Complaint> => {
  await delay(1500);
  
  const newComplaint: Complaint = {
    id: crypto.randomUUID(),
    text: data.text || '',
    location: data.location || '',
    reporter_contact: data.reporter_contact,
    category: data.category || Category.other,
    priority: data.priority || Priority.normal,
    status: Status.open,
    ai_summary: 'AI generated summary for complaint',
    triaged_by: 'llm:groq',
    triage_latency_ms: 1000 + Math.random() * 500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  mockComplaints.push(newComplaint);
  return newComplaint;
};

export const getComplaints = async (filters?: { category?: Category; priority?: Priority; status?: Status; page?: number; page_size?: number }): Promise<{ data: Complaint[]; total: number }> => {
  await delay(1500);

  let filtered = [...mockComplaints];

  if (filters) {
    if (filters.category !== undefined) {
      filtered = filtered.filter((c) => c.category === filters.category);
    }
    if (filters.priority !== undefined) {
      filtered = filtered.filter((c) => c.priority === filters.priority);
    }
    if (filters.status !== undefined) {
      filtered = filtered.filter((c) => c.status === filters.status);
    }

    if (filters.page && filters.page_size) {
      const start = (filters.page - 1) * filters.page_size;
      filtered = filtered.slice(start, start + filters.page_size);
    }
  }

  return {
    data: filtered,
    total: mockComplaints.length,
  };
};

export const updateStatus = async (id: string, newStatus: Status): Promise<Complaint> => {
  await delay(1500);
  
  const complaint = mockComplaints.find(c => c.id === id);
  if (!complaint) {
    throw new Error('Complaint not found');
  }

  // Domain rules
  // Status state machine. open → in_progress → resolved; open → rejected; in_progress → rejected. 
  // resolved and rejected are terminal. Everything else is 409.
  const validTransitions: Record<Status, Status[]> = {
    [Status.open]: [Status.in_progress, Status.rejected],
    [Status.in_progress]: [Status.resolved, Status.rejected],
    [Status.resolved]: [],
    [Status.rejected]: [],
  };

  if (!validTransitions[complaint.status].includes(newStatus)) {
    // 409 Conflict error
    const error = new Error(`Invalid status transition from ${complaint.status} to ${newStatus}`);
    (error as any).status = 409;
    throw error;
  }

  complaint.status = newStatus;
  complaint.updated_at = new Date().toISOString();
  
  return { ...complaint };
};

export const getStats = async (): Promise<{ data: StatsResponse; hit: boolean }> => {
  await delay(1500);
  
  const stats: StatsResponse = {
    total: mockComplaints.length,
    by_category: {
      [Category.water]: mockComplaints.filter(c => c.category === Category.water).length,
      [Category.electricity]: mockComplaints.filter(c => c.category === Category.electricity).length,
      [Category.sanitation]: mockComplaints.filter(c => c.category === Category.sanitation).length,
      [Category.roads]: mockComplaints.filter(c => c.category === Category.roads).length,
      [Category.streetlights]: mockComplaints.filter(c => c.category === Category.streetlights).length,
      [Category.other]: mockComplaints.filter(c => c.category === Category.other).length,
    },
    by_priority: {
      [Priority.high]: mockComplaints.filter(c => c.priority === Priority.high).length,
      [Priority.normal]: mockComplaints.filter(c => c.priority === Priority.normal).length,
      [Priority.low]: mockComplaints.filter(c => c.priority === Priority.low).length,
    },
    by_status: {
      [Status.open]: mockComplaints.filter(c => c.status === Status.open).length,
      [Status.in_progress]: mockComplaints.filter(c => c.status === Status.in_progress).length,
      [Status.resolved]: mockComplaints.filter(c => c.status === Status.resolved).length,
      [Status.rejected]: mockComplaints.filter(c => c.status === Status.rejected).length,
    }
  };

  const hit = Math.random() > 0.5;

  return {
    data: stats,
    hit, // Represents X-Cache header
  };
};
