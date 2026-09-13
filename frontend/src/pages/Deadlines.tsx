import React from 'react';
import { Clock, Building2, ExternalLink, CalendarPlus } from 'lucide-react';
import { ParsedEmail } from '../types';

interface DeadlinesProps {
  emails: ParsedEmail[];
  onSelectEmail: (email: ParsedEmail) => void;
  onCreateCalendar: (emailId: string) => void;
}

export const Deadlines: React.FC<DeadlinesProps> = ({ emails, onSelectEmail, onCreateCalendar }) => {
  const emailsWithDeadlines = emails.filter((e) => e.analysis && e.analysis.deadline);

  return (
    <div>
      <h1 className="page-title">Application Deadlines Timeline</h1>
      <p className="page-subtitle">Track registration windows, portal cutoff times, and deadline countdowns</p>

      {emailsWithDeadlines.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
          <Clock style={{ width: '48px', height: '48px', color: '#6366f1', margin: '0 auto 1rem' }} />
          <h3>No Pending Deadlines Detected</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Scan recent emails to automatically extract application and placement deadlines.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {emailsWithDeadlines.map((email) => {
            const analysis = email.analysis!;
            return (
              <div key={email.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    flexShrink: 0
                  }}>
                    <Clock style={{ width: '22px', height: '22px' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{analysis.company || 'Recruitment Drive'}</span>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>• {analysis.role || 'Position'}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 600, display: 'block' }}>
                      ⏰ Deadline: {analysis.deadline}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.1rem', display: 'block' }}>
                      Subject: {email.subject}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {analysis.application_url && (
                    <a
                      href={analysis.application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                      style={{ textDecoration: 'none', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      <ExternalLink style={{ width: '14px', height: '14px' }} /> Apply
                    </a>
                  )}

                  <button
                    onClick={() => onCreateCalendar(email.id)}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#60a5fa' }}
                  >
                    <CalendarPlus style={{ width: '14px', height: '14px' }} /> Remind Me
                  </button>

                  <button
                    onClick={() => onSelectEmail(email)}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    Details
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
