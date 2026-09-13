import { 
  ParsedEmail, 
  CareerAlert, 
  SystemDiagnostics, 
  UserSettings, 
  AlertSummary 
} from '../types';

const API_BASE = '/api/v1';

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock_dev_token', // Replace with real Firebase auth token when signed in
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth & Profile
  getUserProfile: () => fetchJson<{ uid: string; email?: string; name?: string }>('/auth/me'),

  // Gmail & Scan
  getGmailAuthUrl: () => fetchJson<{ auth_url: string }>('/gmail/auth-url'),
  gmailOauthCallback: (code: string) => fetchJson<{ success: boolean; message?: string }>(`/gmail/oauth-callback?code=${encodeURIComponent(code)}`, {
    method: 'POST',
  }),
  scanEmails: (maxEmails = 10) => fetchJson<{ success: boolean; processed_count: number; alerts_generated: number }>('/gmail/scan', {
    method: 'POST',
    body: JSON.stringify({ max_emails: maxEmails }),
  }),

  // Emails Explorer
  getEmails: (category?: string, priority?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);
    return fetchJson<ParsedEmail[]>(`/emails?${params.toString()}`);
  },
  getEmailDetail: (emailId: string) => fetchJson<ParsedEmail>(`/emails/${emailId}`),
  reanalyzeEmail: (emailId: string) => fetchJson<ParsedEmail>(`/emails/${emailId}/re-analyze`, { method: 'POST' }),
  markHandled: (emailId: string) => fetchJson<{ success: boolean }>(`/emails/${emailId}/mark-handled`, { method: 'POST' }),

  // Alerts
  getAlerts: (priority?: string) => fetchJson<CareerAlert[]>(`/alerts${priority ? `?priority=${priority}` : ''}`),
  getAlertSummary: () => fetchJson<AlertSummary>('/alerts/summary'),

  // WhatsApp
  sendTestWhatsApp: (phone?: string, alertId?: string) => fetchJson<{ success: boolean; message_id?: string; status?: string }>('/whatsapp/send-test', {
    method: 'POST',
    body: JSON.stringify({ phone_number: phone, alert_id: alertId }),
  }),

  // Calendar
  createCalendarEvent: (eventData: { email_id: string; title: string; description: string; start_time: string; location_or_link?: string }) => 
    fetchJson<{ success: boolean; event_id?: string; html_link?: string }>('/calendar/create-event', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  // Analytics
  getAnalytics: () => fetchJson<any>('/analytics'),

  // Settings
  getSettings: () => fetchJson<UserSettings>('/settings'),
  updateSettings: (settings: UserSettings) => fetchJson<UserSettings>('/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  }),

  // Integrations Diagnostics
  getIntegrationsStatus: () => fetchJson<SystemDiagnostics>('/integrations'),
};
