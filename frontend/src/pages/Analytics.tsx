import React, { useEffect, useState } from 'react';
import { BarChart2, PieChart, Building2, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then((res) => setData(res))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ color: '#9ca3af', padding: '2rem' }}>Loading career analytics...</div>;
  }

  return (
    <div>
      <h1 className="page-title">Career & Placement Analytics</h1>
      <p className="page-subtitle">Metrics on campus recruitment drives, company distribution, and application opportunities</p>

      {/* Top Cards */}
      <div className="grid-stats">
        <div className="glass-card">
          <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Placement Drives</span>
          <h2 style={{ fontSize: '1.75rem', color: '#ef4444', marginTop: '0.2rem' }}>{data?.placement_emails_month ?? 0}</h2>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>On-campus drives detected</span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Internship Opportunities</span>
          <h2 style={{ fontSize: '1.75rem', color: '#f59e0b', marginTop: '0.2rem' }}>{data?.internship_opportunities ?? 0}</h2>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Software & tech roles</span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Job Board Listings</span>
          <h2 style={{ fontSize: '1.75rem', color: '#3b82f6', marginTop: '0.2rem' }}>{data?.job_board_opportunities ?? 0}</h2>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Internshala & LinkedIn</span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Companies Detected</span>
          <h2 style={{ fontSize: '1.75rem', color: '#10b981', marginTop: '0.2rem' }}>{data?.total_companies_detected ?? 0}</h2>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Unique recruiting entities</span>
        </div>
      </div>

      <div className="grid-two-col">
        {/* Category Distribution Bar Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <BarChart2 style={{ width: '20px', height: '20px', color: '#818cf8' }} />
            <h3 style={{ fontSize: '1.1rem' }}>Opportunities by Category</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(data?.categories_distribution || []).map((cat: any, idx: number) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{cat.category}</span>
                  <span style={{ color: '#9ca3af' }}>{cat.count} emails</span>
                </div>
                <div style={{ height: '8px', background: '#1f293d', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (cat.count / Math.max(1, data?.total_companies_detected || 1)) * 100)}%`,
                    background: cat.color,
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Companies Detected */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Building2 style={{ width: '20px', height: '20px', color: '#10b981' }} />
            <h3 style={{ fontSize: '1.1rem' }}>Top Recruiting Companies</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(data?.top_companies || []).length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No companies detected yet.</p>
            ) : (
              (data?.top_companies || []).map((c: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#090d16', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                  <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{c.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                    {c.count} {c.count === 1 ? 'drive' : 'drives'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
