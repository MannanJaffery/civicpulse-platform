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

export interface ComplaintCreateRequest {
  text: string;
  location: string;
  reporter_contact?: string | null;
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

export type ComplaintResponseDTO = Complaint;

export interface PaginatedComplaintsResponse {
  items: Complaint[];
  total: number;
  page: number;
  page_size: number;
}

export interface StatusUpdateRequest {
  status: Status | string;
}

export interface StatsResponse {
  total: number;
  by_category: Record<Category, number>;
  by_priority: Record<Priority, number>;
  by_status: Record<Status, number>;
}

export type StatsResponseDTO = StatsResponse;

export interface TriageOutcome {
  provider: string;
  latency_ms: number;
  fallback: boolean;
  timestamp: string;
}

export interface ProvidersMetaResponse {
  active_provider: string;
  outcomes: TriageOutcome[];
}

export interface HealthResponse {
  status: string;
  process: string;
}

export interface ReadyResponse {
  status: string;
  database?: string;
  cache?: string;
  failed_dependencies?: string[];
  detail?: string;
}

export interface FieldError {
  field: string;
  message: string;
  type: string;
}

export interface ApiErrorResponse {
  detail: string;
  errors?: FieldError[];
}
