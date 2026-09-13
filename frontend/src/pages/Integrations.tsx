import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { SystemDiagnostics } from '../types';
import { api } from '../services/api';

export const Integrations: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [gmailTesting, setGmailTesting] = useState(false);
  const [gmailTestResult, setGmailTestResult] = useState<string | null>(null);

  const fetchStatus = () => {
    setLoading(true);
    api.getIntegrationsStatus()
      .then((d) => setDiagnostics(d))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestGmail = async () => {
    setGmailTesting(true);
    setGmailTestResult(null);
    try {
      const res = await api.testGmailConnection();
      if (res.success) {
        setGmailTestResult('✓ Gmail API connection verified (Live Profile Check HTTP 200)');
      } else {
        setGmailTestResult(`❌ Gmail API test failed: ${res.error || 'HTTP ' + res.http_status}`);
      }
    } catch (e: any) {
      setGmailTestResult(`❌ Gmail test error: ${e.message}`);
    } finally {
      setGmailTesting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Integration Diagnostics & Health</h1>
          <p className="page-subtitle">Connection status for Gmail API, Gemini AI, Firestore, WhatsApp Cloud, and Google Calendar</p>
        </div>
        <button onClick={fetchStatus} disabled={loading} className="btn-secondary">
          <RefreshCw style={{ width: '16px', height: '16px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh Diagnostics
        </button>
      </div>

      {diagnostics?.use_mock_services && (
        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle style={{ width: '22px', height: '22px', color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <span style={{ fontWeight: 700, color: '#fcd34d', fontSize: '0.92rem' }}>Development Mock Mode Enabled (APP_ENV=development)</span>
            <p style={{ fontSize: '0.83rem', color: '#cbd5e1', marginTop: '0.1rem' }}>
              The system is running with mock drivers for local development testing. In production (<code>APP_ENV=production</code>), missing secrets will raise explicit configuration errors.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#9ca3af', padding: '2rem' }}>Running diagnostics...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {diagnostics?.integrations.map((item, idx) => (
            <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `3px solid ${item.connected ? '#10b981' : '#ef4444'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.15rem' }}>{item.service}</h3>
                {item.connected ? (
                  <span style={{ fontSize: '0.78rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 style={{ width: '14px', height: '14px' }} /> CONNECTED
                  </span>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <XCircle style={{ width: '14px', height: '14px' }} /> NOT CONNECTED
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5' }}>{item.details}</p>

              {item.service === 'Gmail API' && (
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {item.connected ? (
                    <button onClick={handleTestGmail} disabled={gmailTesting} className="btn-secondary" style={{ fontSize: '0.8rem', justifyContent: 'center' }}>
                      <RefreshCw style={{ width: '14px', height: '14px', animation: gmailTesting ? 'spin 1s linear infinite' : 'none' }} />
                      {gmailTesting ? 'Testing Gmail API...' : 'Test Gmail Connection'}
                    </button>
                  ) : null}

                  {item.auth_url && (
                    <a
                      href={item.auth_url}
                      className="btn-primary"
                      style={{ textDecoration: 'none', justifyContent: 'center', fontSize: '0.82rem' }}
                    >
                      <ExternalLink style={{ width: '14px', height: '14px' }} /> Connect Google Account
                    </a>
                  )}

                  {gmailTestResult && (
                    <span style={{ fontSize: '0.78rem', color: gmailTestResult.includes('✓') ? '#10b981' : '#ef4444', fontWeight: 600, display: 'block', marginTop: '0.2rem' }}>
                      {gmailTestResult}
                    </span>
                  )}
                </div>
              )}

              {item.service !== 'Gmail API' && item.auth_url && (
                <a
                  href={item.auth_url}
                  className="btn-primary"
                  style={{ textDecoration: 'none', justifyContent: 'center', marginTop: 'auto', fontSize: '0.82rem' }}
                >
                  <ExternalLink style={{ width: '14px', height: '14px' }} /> Connect Google Account
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
