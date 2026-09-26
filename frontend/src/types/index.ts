export enum Category {
  water = 'water',
  electricity = 'electricity',
  sanitation = 'sanitation',
  roads = 'roads',
  streetlights = 'streetlights',
  other = 'other',
}

export enum Priority {
  high = 'high',
  normal = 'normal',
  low = 'low',
}

export enum Status {
  open = 'open',
  in_progress = 'in_progress',
  resolved = 'resolved',
  rejected = 'rejected',
}

export interface Complaint {
  id: string;
  text: string;
  location: string;
  reporter_contact?: string | null;
  category: Category;
  priority: Priority;
  status: Status;
  ai_summary?: string | null;
  triaged_by: string;
  triage_latency_ms: number;
  created_at: string;
  updated_at: string;
}

export interface TriageResult {
  category: Category;
  priority: Priority;
  summary: string;
  confidence: number;
}

export interface StatsResponse {
  total: number;
  by_category: Record<Category, number>;
  by_priority: Record<Priority, number>;
  by_status: Record<Status, number>;
}

export interface ApiError {
  detail: string;
}

export interface FieldError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ValidationError {
  detail: FieldError[];
}
