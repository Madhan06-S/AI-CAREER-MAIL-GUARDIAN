import React from 'react';
import { AlertOctagon, Send, CalendarPlus, ExternalLink, ShieldCheck } from 'lucide-react';
import { CareerAlert, ParsedEmail } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';

interface PriorityAlertsProps {
  alerts: CareerAlert[];
  emails: ParsedEmail[];
  onSelectEmail: (email: ParsedEmail) => void;
  onSendWhatsApp: (alertId: string) => void;
  onCreateCalendar: (emailId: string) => void;
}

export const PriorityAlerts: React.FC<PriorityAlertsProps> = ({
  alerts,
  emails,
  onSelectEmail,
  onSendWhatsApp,
  onCreateCalendar
}) => {
  return (
    <div>
      <h1 className="page-title">High Priority Career Alerts</h1>
      <p className="page-subtitle">Action-oriented feed for critical placement recruitment drives, interview invitations, and impending deadlines</p>

      {alerts.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertOctagon style={{ width: '48px', height: '48px', color: '#10b981', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Urgent Alerts Pending</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>All high priority recruitment notifications have been handled or no urgent alerts match current criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {alerts.map((alert) => {
            const correspondingEmail = emails.find((e) => e.id === alert.email_id);
            return (
              <div
                key={alert.id}
                className="glass-card"
                style={{
                  borderLeft: `4px solid ${alert.priority === 'HIGH' ? '#ef4444' : '#f59e0b'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <PriorityBadge priority={alert.priority} />
                      <span className="badge-category">{alert.category}</span>
                      {alert.whatsapp_sent && (
                        <span style={{ fontSize: '0.75rem', color: '#25D366', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                          <ShieldCheck style={{ width: '14px', height: '14px' }} /> WhatsApp Dispatched
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.2rem' }}>{alert.company || 'Recruitment Drive'} — {alert.role || 'Position'}</h3>
                  </div>

                  {correspondingEmail && (
                    <button
                      onClick={() => onSelectEmail(correspondingEmail)}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      View Original Email
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.5' }}>{alert.summary}</p>

                {/* Urgency Reason & Action Box */}
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 700, textTransform: 'uppercase' }}>WHY IMPORTANT:</span>
                  <p style={{ fontSize: '0.88rem', color: '#fecdd3', marginTop: '0.2rem' }}>{alert.urgency_reason}</p>
                  
                  {alert.action_required && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>RECOMMENDED ACTION:</span>
                      <p style={{ fontSize: '0.88rem', color: '#fef08a', fontWeight: 600, marginTop: '0.1rem' }}>{alert.action_required}</p>
                    </div>
                  )}
                </div>

                {/* Info Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  {alert.deadline && <span>⏰ Deadline: <strong style={{ color: '#fca5a5' }}>{alert.deadline}</strong></span>}
                  {alert.interview_date && <span>🎯 Interview: <strong style={{ color: '#fcd34d' }}>{alert.interview_date} {alert.interview_time || ''}</strong></span>}
                  {alert.interview_location_link && <span>📍 Location: <strong style={{ color: '#93c5fd' }}>{alert.interview_location_link}</strong></span>}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.85rem' }}>
                  <button
                    onClick={() => onSendWhatsApp(alert.id)}
                    className="btn-secondary"
                    style={{ color: '#25D366', fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                  >
                    <Send style={{ width: '14px', height: '14px' }} /> Resend WhatsApp Alert
                  </button>

                  <button
                    onClick={() => onCreateCalendar(alert.email_id)}
                    className="btn-secondary"
                    style={{ color: '#60a5fa', fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                  >
                    <CalendarPlus style={{ width: '14px', height: '14px' }} /> Add to Calendar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
