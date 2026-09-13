import React from 'react';
import { Calendar as CalendarIcon, Clock, Video, MapPin, Sparkles } from 'lucide-react';
import { ParsedEmail } from '../types';

interface CalendarViewProps {
  emails: ParsedEmail[];
  onSelectEmail: (email: ParsedEmail) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ emails, onSelectEmail }) => {
  const events = emails
    .filter((e) => e.analysis && (e.analysis.interview_date || e.analysis.deadline))
    .map((e) => {
      const a = e.analysis!;
      return {
        email: e,
        company: a.company || 'Company',
        role: a.role || 'Position',
        type: a.interview_date ? 'INTERVIEW' : 'DEADLINE',
        dateStr: a.interview_date || a.deadline || 'Upcoming',
        timeStr: a.interview_time || '',
        location: a.interview_location_link || a.location || ''
      };
    });

  return (
    <div>
      <h1 className="page-title">Unified Recruitment Calendar</h1>
      <p className="page-subtitle">Schedule overview of upcoming interview slots, test dates, and application cutoffs</p>

      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles style={{ width: '20px', height: '20px', color: '#818cf8' }} />
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Direct Google Calendar Synchronization Enabled</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Connected to User OAuth</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {events.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
            <CalendarIcon style={{ width: '48px', height: '48px', color: '#6366f1', margin: '0 auto 1rem' }} />
            <h3>No Scheduled Events</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Scan emails to automatically populate interview and deadline dates.</p>
          </div>
        ) : (
          events.map((evt, idx) => (
            <div
              key={idx}
              className="glass-card"
              onClick={() => onSelectEmail(evt.email)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderLeft: `4px solid ${evt.type === 'INTERVIEW' ? '#10b981' : '#f59e0b'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: evt.type === 'INTERVIEW' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: evt.type === 'INTERVIEW' ? '#10b981' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {evt.type === 'INTERVIEW' ? <CalendarIcon style={{ width: '20px', height: '20px' }} /> : <Clock style={{ width: '20px', height: '20px' }} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: evt.type === 'INTERVIEW' ? '#10b981' : '#f59e0b', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      {evt.type}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{evt.company}</span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>• {evt.role}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>
                    📅 {evt.dateStr} {evt.timeStr ? `at ${evt.timeStr}` : ''}
                  </span>
                </div>
              </div>

              <button className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                View Email Context
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
