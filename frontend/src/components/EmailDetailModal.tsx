import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Briefcase, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  Send, 
  CalendarPlus, 
  CheckCircle, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ParsedEmail } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { api } from '../services/api';

interface EmailDetailModalProps {
  email: ParsedEmail | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ email, onClose, onUpdate }) => {
  if (!email) return null;

  const [activeTab, setActiveTab] = useState<'analysis' | 'original'>('analysis');
  const [waSending, setWaSending] = useState(false);
  const [waStatus, setWaStatus] = useState<string | null>(null);
  const [calCreating, setCalCreating] = useState(false);
  const [calStatus, setCalStatus] = useState<string | null>(null);

  const analysis = email.analysis;

  const handleSendWhatsApp = async () => {
    setWaSending(true);
    setWaStatus(null);
    try {
      const res = await api.sendTestWhatsApp(undefined, email.id);
      if (res.success) {
        setWaStatus('✅ WhatsApp alert sent successfully!');
      } else {
        setWaStatus('❌ WhatsApp send failed.');
      }
    } catch (e: any) {
      setWaStatus(`❌ ${e.message || 'Dispatch error'}`);
    } finally {
      setWaSending(false);
    }
  };

  const handleCreateCalendarEvent = async () => {
    if (!analysis) return;
    setCalCreating(true);
    setCalStatus(null);
    try {
      const res = await api.createCalendarEvent({
        email_id: email.id,
        title: `${analysis.company || 'Recruitment'} - ${analysis.role || 'Interview Schedule'}`,
        description: `Extracted by AI Career Mail Guardian.\n\nSummary:\n${analysis.summary}\n\nAction Required:\n${analysis.action_required || 'N/A'}`,
        start_time: analysis.interview_date || analysis.deadline || new Date().toISOString(),
        location_or_link: analysis.interview_location_link || analysis.location
      });
      if (res.success) {
        setCalStatus('✅ Event added to Google Calendar!');
      } else {
        setCalStatus('❌ Calendar creation failed.');
      }
    } catch (e: any) {
      setCalStatus(`❌ ${e.message || 'Calendar error'}`);
    } finally {
      setCalCreating(false);
    }
  };

  const handleMarkHandled = async () => {
    try {
      await api.markHandled(email.id);
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              {analysis && <PriorityBadge priority={analysis.priority} />}
              {analysis && <span className="badge-category">{analysis.category}</span>}
            </div>
            <h2 style={{ fontSize: '1.25rem', lineHeight: '1.3' }}>{email.subject}</h2>
            <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>From: {email.sender_name || email.sender}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X style={{ width: '22px', height: '22px' }} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => setActiveTab('analysis')}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'analysis' ? '2px solid #6366f1' : 'none',
              color: activeTab === 'analysis' ? '#818cf8' : '#9ca3af',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Sparkles style={{ width: '16px', height: '16px' }} />
            AI Extraction Analysis
          </button>
          <button
            onClick={() => setActiveTab('original')}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'original' ? '2px solid #6366f1' : 'none',
              color: activeTab === 'original' ? '#818cf8' : '#9ca3af',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cleaned Original Email
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'analysis' && analysis ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Why Important & Action */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '10px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a5b4fc', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <ShieldAlert style={{ width: '16px', height: '16px' }} />
                WHY IMPORTANT (AI EXPLANATION)
              </div>
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '0.75rem' }}>{analysis.urgency_reason}</p>
              
              {analysis.action_required && (
                <div style={{ borderTop: '1px solid rgba(99, 102, 241, 0.2)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>RECOMMENDED ACTION:</span>
                  <p style={{ fontSize: '0.88rem', color: '#fef08a', fontWeight: 600, marginTop: '0.1rem' }}>{analysis.action_required}</p>
                </div>
              )}
            </div>

            {/* Structured Property Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Building2 style={{ width: '14px', height: '14px', color: '#818cf8' }} /> COMPANY
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem', display: 'block' }}>{analysis.company || 'Not Specified'}</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Briefcase style={{ width: '14px', height: '14px', color: '#818cf8' }} /> ROLE / POSITION
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem', display: 'block' }}>{analysis.role || 'Not Specified'}</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock style={{ width: '14px', height: '14px', color: '#ef4444' }} /> DEADLINE
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fca5a5', marginTop: '0.2rem', display: 'block' }}>{analysis.deadline || 'No Immediate Deadline'}</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CalendarIcon style={{ width: '14px', height: '14px', color: '#f59e0b' }} /> INTERVIEW DATE / TIME
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fcd34d', marginTop: '0.2rem', display: 'block' }}>
                  {analysis.interview_date ? `${analysis.interview_date} ${analysis.interview_time || ''}` : 'None Scheduled'}
                </span>
              </div>

              {analysis.salary_stipend && (
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <DollarSign style={{ width: '14px', height: '14px', color: '#10b981' }} /> SALARY / STIPEND
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6ee7b7', marginTop: '0.2rem', display: 'block' }}>{analysis.salary_stipend}</span>
                </div>
              )}

              {analysis.location && (
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin style={{ width: '14px', height: '14px', color: '#3b82f6' }} /> LOCATION
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#93c5fd', marginTop: '0.2rem', display: 'block' }}>{analysis.location}</span>
                </div>
              )}
            </div>

            {/* Eligibility & Skills */}
            {analysis.eligibility.length > 0 && (
              <div>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>ELIGIBILITY CRITERIA</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {analysis.eligibility.map((item, idx) => (
                    <span key={idx} style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="glass-card">
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>AI SUMMARY</span>
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.6' }}>{analysis.summary}</p>
            </div>

            {/* Action Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
              {analysis.application_url && (
                <a
                  href={analysis.application_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalLink style={{ width: '16px', height: '16px' }} />
                  Apply Now
                </a>
              )}

              <button
                onClick={handleSendWhatsApp}
                disabled={waSending}
                className="btn-secondary"
                style={{ color: '#25D366' }}
              >
                <Send style={{ width: '16px', height: '16px' }} />
                {waSending ? 'Sending Alert...' : 'Send WhatsApp Alert'}
              </button>

              <button
                onClick={handleCreateCalendarEvent}
                disabled={calCreating}
                className="btn-secondary"
                style={{ color: '#60a5fa' }}
              >
                <CalendarPlus style={{ width: '16px', height: '16px' }} />
                {calCreating ? 'Creating Event...' : 'Add to Calendar'}
              </button>

              <button
                onClick={handleMarkHandled}
                className="btn-secondary"
              >
                <CheckCircle style={{ width: '16px', height: '16px', color: email.marked_handled ? '#10b981' : '#6b7280' }} />
                {email.marked_handled ? 'Handled' : 'Mark as Handled'}
              </button>
            </div>

            {waStatus && <span style={{ fontSize: '0.82rem', color: '#10b981', display: 'block' }}>{waStatus}</span>}
            {calStatus && <span style={{ fontSize: '0.82rem', color: '#60a5fa', display: 'block' }}>{calStatus}</span>}
          </div>
        ) : (
          <div style={{ background: '#090d16', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {email.cleaned_body || email.raw_body}
          </div>
        )}
      </div>
    </div>
  );
};
