export type PriorityType = 'HIGH' | 'MEDIUM' | 'LOW';
export type CategoryType = 'PLACEMENT' | 'INTERNSHIP' | 'JOB_BOARD' | 'GENERAL';

export interface StructuredEmailAnalysis {
  priority: PriorityType;
  category: CategoryType;
  company?: string;
  role?: string;
  job_type?: string;
  eligibility: string[];
  salary_stipend?: string;
  location?: string;
  deadline?: string;
  interview_date?: string;
  interview_time?: string;
  interview_location_link?: string;
  required_skills: string[];
  application_url?: string;
  action_required?: string;
  urgency_reason?: string;
  summary: string;
  confidence: number;
}

export interface ParsedEmail {
  id: string;
  thread_id?: string;
  sender: string;
  sender_name?: string;
  recipient: string;
  subject: string;
  snippet: string;
  raw_body: string;
  cleaned_body: string;
  received_at: string;
  is_processed: boolean;
  analysis?: StructuredEmailAnalysis;
  marked_handled?: boolean;
  calendar_event_id?: string;
}

export interface CareerAlert {
  id: string;
  email_id: string;
  priority: PriorityType;
  category: CategoryType;
  company?: string;
  role?: string;
  deadline?: string;
  interview_date?: string;
  interview_time?: string;
  interview_location_link?: string;
  action_required?: string;
  urgency_reason?: string;
  summary: string;
  whatsapp_sent: boolean;
  whatsapp_status?: string;
  calendar_event_id?: string;
  created_at: string;
}

export interface IntegrationStatus {
  service: string;
  connected: boolean;
  details: string;
  auth_url?: string;
}

export interface SystemDiagnostics {
  app_env: string;
  use_mock_services: boolean;
  integrations: IntegrationStatus[];
}

export interface UserSettings {
  whatsapp_enabled: boolean;
  min_priority_threshold: PriorityType;
  auto_create_calendar_events: boolean;
  scan_frequency_minutes: number;
  recipient_phone?: string;
}

export interface AlertSummary {
  total_emails_analyzed: number;
  high_priority_count: number;
  medium_priority_count: number;
  low_priority_count: number;
  upcoming_deadlines_count: number;
  upcoming_interviews_count: number;
  total_alerts: number;
}
