import React from 'react';
import { Mail, AlertTriangle, Clock, Calendar as CalendarIcon, ArrowRight, ShieldCheck, Sparkles, Send } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { PriorityBadge } from '../components/PriorityBadge';
import { ParsedEmail, AlertSummary, CareerAlert } from '../types';

interface DashboardProps {
  summary: AlertSummary | null;
  recentEmails: ParsedEmail[];
  recentAlerts: CareerAlert[];
  onSelectEmail: (email: ParsedEmail) => void;
  onNavigate: (tab: string) => void;
  onTriggerScan: () => void;
  isScanning: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary,
  recentEmails,
  recentAlerts,
  onSelectEmail,
  onNavigate,
  onTriggerScan,
  isScanning
}) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Career Intelligence Dashboard</h1>
          <p className="page-subtitle">Real-time AI monitoring for placements, internships, and interview schedules</p>
        </div>
        <button onClick={onTriggerScan} disabled={isScanning} className="btn-primary">
          <Sparkles style={{ width: '16px', height: '16px' }} />
          {isScanning ? 'Scanning Gmail...' : 'Run Career AI Scan'}
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid-stats">
        <StatCard
          title="Emails Analyzed"
          value={summary?.total_emails_analyzed ?? 0}
          icon={Mail}
          iconColor="#6366f1"
          subtext="Gmail inbox monitoring active"
        />
        <StatCard
          title="High Priority Alerts"
          value={summary?.high_priority_count ?? 0}
          icon={AlertTriangle}
          iconColor="#ef4444"
          subtext="Placements & interviews"
        />
        <StatCard
          title="Upcoming Deadlines"
          value={summary?.upcoming_deadlines_count ?? 0}
          icon={Clock}
          iconColor="#f59e0b"
          subtext="Registration windows"
        />
        <StatCard
          title="Upcoming Interviews"
          value={summary?.upcoming_interviews_count ?? 0}
          icon={CalendarIcon}
          iconColor="#10b981"
          subtext="Assessments & technical rounds"
        />
      </div>

      {/* 2-Column Main Section */}
      <div className="grid-two-col">
        {/* Left Column: High Priority Feeds & Recent Emails */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                <h3 style={{ fontSize: '1.1rem' }}>High Priority Career Alerts</h3>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                View All <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {recentAlerts.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic' }}>No high priority alerts detected yet. Run an email scan to import career opportunities.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {recentAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <PriorityBadge priority={alert.priority} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{alert.company || 'Placement Drive'}</span>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>• {alert.role}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{alert.summary}</p>
                      {alert.deadline && (
                        <span style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 600, marginTop: '0.3rem', display: 'block' }}>
                          ⏰ Deadline: {alert.deadline}
                        </span>
                      )}
                    </div>
                    {alert.whatsapp_sent && (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                        WhatsApp Sent
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Extracted Emails List */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Recent Processed Emails</h3>
              <button
                onClick={() => onNavigate('emails')}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                View Explorer <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentEmails.slice(0, 5).map((email) => (
                <div
                  key={email.id}
                  onClick={() => onSelectEmail(email)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      {email.analysis && <PriorityBadge priority={email.analysis.priority} />}
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {email.subject}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      From: {email.sender_name || email.sender}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {email.analysis?.company || 'Analyzed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Status & Action Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Automation Pipeline Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>Gmail Fetcher</span>
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Active</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>Gemini AI Engine</span>
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Active</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>Meta WhatsApp Cloud</span>
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Active</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>Google Calendar Sync</span>
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Active</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <h4 style={{ fontSize: '1rem', color: '#a5b4fc', marginBottom: '0.4rem' }}>WhatsApp Instant Alerts</h4>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '1rem', lineHeight: '1.5' }}>
              High-priority placement drives & interview dates are automatically dispatched to your WhatsApp phone number.
            </p>
            <button onClick={() => onNavigate('settings')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Configure Alert Toggles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
