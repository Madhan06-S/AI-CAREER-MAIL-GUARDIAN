import React from 'react';
import { 
  LayoutDashboard, 
  Mail, 
  AlertOctagon, 
  Clock, 
  Calendar, 
  BarChart2, 
  Settings, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  highPriorityCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, highPriorityCount }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'emails', label: 'Emails', icon: Mail },
    { id: 'alerts', label: 'Priority Alerts', icon: AlertOctagon, badge: highPriorityCount },
    { id: 'deadlines', label: 'Deadlines', icon: Clock },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: ShieldCheck },
  ];

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
        }}>
          <Sparkles style={{ width: '20px', height: '20px', color: '#fff' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', lineHeight: '1.2' }}>AI CAREER</h3>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af', letterSpacing: '0.1em', fontWeight: 700 }}>MAIL GUARDIAN</span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#818cf8' : '#9ca3af',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px'
                }}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '1rem 0.5rem', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>System Active & Monitoring</span>
        </div>
      </div>
    </aside>
  );
};
