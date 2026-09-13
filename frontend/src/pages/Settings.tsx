import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Bell, Send, Calendar, Clock, Save, ShieldCheck } from 'lucide-react';
import { UserSettings, PriorityType } from '../types';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    whatsapp_enabled: true,
    min_priority_threshold: 'MEDIUM',
    auto_create_calendar_events: false,
    scan_frequency_minutes: 30,
    recipient_phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getSettings().then((s) => setSettings(s)).catch((e) => console.error(e));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedMessage(null);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSavedMessage('Settings updated successfully!');
    } catch (e: any) {
      setSavedMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Guardian Preferences & Consent</h1>
      <p className="page-subtitle">Configure WhatsApp alert triggers, Google Calendar auto-creation, and scan behavior</p>

      <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* WhatsApp Notification Toggles */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Send style={{ width: '20px', height: '20px', color: '#25D366' }} />
            <h3 style={{ fontSize: '1.1rem' }}>WhatsApp Alert Dispatch Preferences</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <span style={{ fontWeight: 600, color: '#f3f4f6', fontSize: '0.95rem' }}>Enable WhatsApp Alerts</span>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block' }}>Dispatch instant WhatsApp alerts when urgent recruitment emails are detected</span>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsapp_enabled}
                onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.checked })}
                style={{ width: '20px', height: '20px', accentColor: '#6366f1' }}
              />
            </label>

            <div>
              <label style={{ fontWeight: '600', color: '#f3f4f6', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>
                Recipient Phone Number (with Country Code)
              </label>
              <input
                type="text"
                placeholder="+919876543210"
                value={settings.recipient_phone || ''}
                onChange={(e) => setSettings({ ...settings, recipient_phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  background: '#090d16',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', color: '#f3f4f6', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>
                Minimum Priority Threshold for Notifications
              </label>
              <select
                value={settings.min_priority_threshold}
                onChange={(e) => setSettings({ ...settings, min_priority_threshold: e.target.value as PriorityType })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  background: '#090d16',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              >
                <option value="HIGH">🔴 HIGH Priority Only (Placements & Interviews)</option>
                <option value="MEDIUM">🟠 HIGH & MEDIUM Priority (Placements, Internships & Job Boards)</option>
                <option value="LOW">🟢 ALL Emails (Including general career news)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Google Calendar Preferences */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Calendar style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
            <h3 style={{ fontSize: '1.1rem' }}>Google Calendar Auto-Schedule</h3>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <span style={{ fontWeight: 600, color: '#f3f4f6', fontSize: '0.95rem' }}>Auto-Suggest / Create Calendar Events</span>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block' }}>Automatically schedule interview times and deadline reminders in user's Google Calendar</span>
            </div>
            <input
              type="checkbox"
              checked={settings.auto_create_calendar_events}
              onChange={(e) => setSettings({ ...settings, auto_create_calendar_events: e.target.checked })}
              style={{ width: '20px', height: '20px', accentColor: '#6366f1' }}
            />
          </label>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save style={{ width: '16px', height: '16px' }} />
            {saving ? 'Saving Preferences...' : 'Save Settings'}
          </button>
          {savedMessage && <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>{savedMessage}</span>}
        </div>
      </div>
    </div>
  );
};
