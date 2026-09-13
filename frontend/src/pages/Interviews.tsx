import React from 'react';
import { Calendar as CalendarIcon, Video, MapPin, CalendarPlus, ExternalLink } from 'lucide-react';
import { ParsedEmail } from '../types';

interface InterviewsProps {
  emails: ParsedEmail[];
  onSelectEmail: (email: ParsedEmail) => void;
  onCreateCalendar: (emailId: string) => void;
}

export const Interviews: React.FC<InterviewsProps> = ({ emails, onSelectEmail, onCreateCalendar }) => {
  const emailsWithInterviews = emails.filter((e) => e.analysis && e.analysis.interview_date);

  return (
    <div>
      <h1 className="page-title">Interviews & Assessments Hub</h1>
      <p className="page-subtitle">Schedule view of technical interviews, online assessments (OA), and round schedules</p>

      {emailsWithInterviews.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
          <CalendarIcon style={{ width: '48px', height: '48px', color: '#10b981', margin: '0 auto 1rem' }} />
          <h3>No Upcoming Interviews</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>When companies invite you to interviews or online assessments, they will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {emailsWithInterviews.map((email) => {
            const analysis = email.analysis!;
            const isOnline = (analysis.interview_location_link || '').includes('http') || (analysis.interview_location_link || '').includes('meet');
            return (
              <div key={email.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid #10b981' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      INTERVIEW SCHEDULED
                    </span>
                    {email.calendar_event_id && (
                      <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>In Calendar</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.15rem' }}>{analysis.company || 'Company'}</h3>
                  <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>{analysis.role || 'Software Engineering'}</span>
                </div>

                {/* Date & Time Box */}
                <div style={{ background: '#090d16', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fcd34d', fontWeight: 700, fontSize: '0.95rem' }}>
                    <CalendarIcon style={{ width: '16px', height: '16px' }} />
                    {analysis.interview_date} {analysis.interview_time ? `at ${analysis.interview_time}` : ''}
                  </div>
                  
                  {analysis.interview_location_link && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd', fontSize: '0.82rem', marginTop: '0.4rem' }}>
                      {isOnline ? <Video style={{ width: '14px', height: '14px' }} /> : <MapPin style={{ width: '14px', height: '14px' }} />}
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{analysis.interview_location_link}</span>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>{analysis.summary}</p>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-glass)' }}>
                  <button
                    onClick={() => onCreateCalendar(email.id)}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
                  >
                    <CalendarPlus style={{ width: '14px', height: '14px' }} /> Sync to Calendar
                  </button>

                  <button
                    onClick={() => onSelectEmail(email)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
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
