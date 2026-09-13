import React from 'react';
import { Search, RefreshCw, User, Bell, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onTriggerScan: () => void;
  isScanning: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onTriggerScan,
  isScanning,
  searchQuery,
  onSearchChange
}) => {
  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '480px' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search style={{
            position: 'absolute',
            left: '0.85rem',
            width: '16px',
            height: '16px',
            color: '#6b7280'
          }} />
          <input
            type="text"
            placeholder="Search company, role, eligibility or skills..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.4rem',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(17, 24, 39, 0.6)',
              color: '#f9fafb',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button
          onClick={onTriggerScan}
          disabled={isScanning}
          className="btn-primary"
        >
          <RefreshCw style={{
            width: '16px',
            height: '16px',
            animation: isScanning ? 'spin 1s linear infinite' : 'none'
          }} />
          <span>{isScanning ? 'Scanning Gmail...' : 'Scan Emails'}</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingLeft: '1rem',
          borderLeft: '1px solid var(--border-glass)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '0.3rem 0.65rem',
            borderRadius: '20px'
          }}>
            <CheckCircle2 style={{ width: '14px', height: '14px', color: '#10b981' }} />
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Gmail Connected</span>
          </div>

          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#1f293d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-glass)',
            color: '#818cf8',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            AS
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
