import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = '#6366f1',
  subtext
}) => {
  return (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `${iconColor}18`,
        border: `1px solid ${iconColor}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
        flexShrink: 0
      }}>
        <Icon style={{ width: '24px', height: '24px' }} />
      </div>

      <div>
        <span style={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 500 }}>{title}</span>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, lineHeight: '1.2', marginTop: '0.1rem' }}>{value}</h2>
        {subtext && <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem', display: 'block' }}>{subtext}</span>}
      </div>
    </div>
  );
};
