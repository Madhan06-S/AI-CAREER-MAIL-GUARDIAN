import React, { useState } from 'react';
import { Mail, Search, Filter, ExternalLink, CheckCircle } from 'lucide-react';
import { ParsedEmail, CategoryType, PriorityType } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';

interface EmailsProps {
  emails: ParsedEmail[];
  onSelectEmail: (email: ParsedEmail) => void;
  searchQuery: string;
}

export const Emails: React.FC<EmailsProps> = ({ emails, onSelectEmail, searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  const filteredEmails = emails.filter((e) => {
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch = 
      e.subject.toLowerCase().includes(queryLower) ||
      e.sender.toLowerCase().includes(queryLower) ||
      (e.analysis?.company || '').toLowerCase().includes(queryLower) ||
      (e.analysis?.role || '').toLowerCase().includes(queryLower) ||
      (e.analysis?.summary || '').toLowerCase().includes(queryLower);

    const matchesCategory = selectedCategory === 'ALL' || (e.analysis && e.analysis.category === selectedCategory);
    const matchesPriority = selectedPriority === 'ALL' || (e.analysis && e.analysis.priority === selectedPriority);

    return matchesSearch && matchesCategory && matchesPriority;
  });

  return (
    <div>
      <h1 className="page-title">Emails Explorer</h1>
      <p className="page-subtitle">Inspect raw Gmail content alongside structured Gemini AI career extractions</p>

      {/* Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#111827', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          {['ALL', 'PLACEMENT', 'INTERNSHIP', 'JOB_BOARD', 'GENERAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                background: selectedCategory === cat ? '#1f293d' : 'transparent',
                color: selectedCategory === cat ? '#818cf8' : '#9ca3af',
                fontWeight: selectedCategory === cat ? 600 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter style={{ width: '16px', height: '16px', color: '#6b7280' }} />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            style={{
              background: '#111827',
              color: '#f9fafb',
              border: '1px solid var(--border-glass)',
              borderRadius: '6px',
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">🔴 HIGH Priority</option>
            <option value="MEDIUM">🟠 MEDIUM Priority</option>
            <option value="LOW">🟢 LOW Priority</option>
          </select>
        </div>
      </div>

      {/* Email Table/Grid */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-glass)', color: '#9ca3af', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Priority</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Company / Subject</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Category</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Deadline / Interview</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmails.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                  No career emails match your selected filters.
                </td>
              </tr>
            ) : (
              filteredEmails.map((email) => (
                <tr
                  key={email.id}
                  onClick={() => onSelectEmail(email)}
                  style={{
                    borderBottom: '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {email.analysis && <PriorityBadge priority={email.analysis.priority} />}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#fff' }}>
                      {email.analysis?.company || email.sender_name || 'Email'}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#9ca3af', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '360px' }}>
                      {email.subject}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {email.analysis && <span className="badge-category">{email.analysis.category}</span>}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {email.analysis?.deadline ? (
                      <span style={{ color: '#fca5a5', fontWeight: 600 }}>⏰ {email.analysis.deadline}</span>
                    ) : email.analysis?.interview_date ? (
                      <span style={{ color: '#fcd34d', fontWeight: 600 }}>🎯 {email.analysis.interview_date}</span>
                    ) : (
                      <span style={{ color: '#6b7280' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {email.marked_handled ? (
                      <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle style={{ width: '14px', height: '14px' }} /> Handled
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#f59e0b' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmail(email);
                      }}
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      View AI Breakdown
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
