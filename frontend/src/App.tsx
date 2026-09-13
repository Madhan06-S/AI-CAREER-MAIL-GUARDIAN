import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { EmailDetailModal } from './components/EmailDetailModal';
import { Dashboard } from './pages/Dashboard';
import { Emails } from './pages/Emails';
import { PriorityAlerts } from './pages/PriorityAlerts';
import { Deadlines } from './pages/Deadlines';
import { Interviews } from './pages/Interviews';
import { CalendarView } from './pages/Calendar';
import { Analytics } from './pages/Analytics';
import { SettingsPage } from './pages/Settings';
import { Integrations } from './pages/Integrations';
import { ParsedEmail, CareerAlert, AlertSummary } from './types';
import { api } from './services/api';
import './styles/theme.css';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [emails, setEmails] = useState<ParsedEmail[]>([]);
  const [alerts, setAlerts] = useState<CareerAlert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<ParsedEmail | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [fetchedEmails, fetchedAlerts, fetchedSummary] = await Promise.all([
        api.getEmails(),
        api.getAlerts(),
        api.getAlertSummary()
      ]);
      setEmails(fetchedEmails);
      setAlerts(fetchedAlerts);
      setSummary(fetchedSummary);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      await api.scanEmails(10);
      await loadData();
    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSendWhatsAppAlert = async (alertId: string) => {
    try {
      await api.sendTestWhatsApp(undefined, alertId);
      await loadData();
    } catch (e) {
      console.error('WhatsApp dispatch error:', e);
    }
  };

  const handleCreateCalendarEvent = async (emailId: string) => {
    const targetEmail = emails.find((e) => e.id === emailId);
    if (!targetEmail || !targetEmail.analysis) return;

    try {
      await api.createCalendarEvent({
        email_id: emailId,
        title: `${targetEmail.analysis.company || 'Recruitment'} - ${targetEmail.analysis.role || 'Event'}`,
        description: `Extracted by AI Career Mail Guardian.\nSummary: ${targetEmail.analysis.summary}`,
        start_time: targetEmail.analysis.interview_date || targetEmail.analysis.deadline || new Date().toISOString(),
        location_or_link: targetEmail.analysis.interview_location_link
      });
      await loadData();
    } catch (e) {
      console.error('Calendar error:', e);
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            summary={summary}
            recentEmails={emails}
            recentAlerts={alerts}
            onSelectEmail={setSelectedEmail}
            onNavigate={setCurrentTab}
            onTriggerScan={handleTriggerScan}
            isScanning={isScanning}
          />
        );
      case 'emails':
        return (
          <Emails
            emails={emails}
            onSelectEmail={setSelectedEmail}
            searchQuery={searchQuery}
          />
        );
      case 'alerts':
        return (
          <PriorityAlerts
            alerts={alerts}
            emails={emails}
            onSelectEmail={setSelectedEmail}
            onSendWhatsApp={handleSendWhatsAppAlert}
            onCreateCalendar={handleCreateCalendarEvent}
          />
        );
      case 'deadlines':
        return (
          <Deadlines
            emails={emails}
            onSelectEmail={setSelectedEmail}
            onCreateCalendar={handleCreateCalendarEvent}
          />
        );
      case 'interviews':
        return (
          <Interviews
            emails={emails}
            onSelectEmail={setSelectedEmail}
            onCreateCalendar={handleCreateCalendarEvent}
          />
        );
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPage />;
      case 'integrations':
        return <Integrations />;
      default:
        return (
          <Dashboard
            summary={summary}
            recentEmails={emails}
            recentAlerts={alerts}
            onSelectEmail={setSelectedEmail}
            onNavigate={setCurrentTab}
            onTriggerScan={handleTriggerScan}
            isScanning={isScanning}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        highPriorityCount={summary?.high_priority_count ?? 0}
      />

      <main className="main-content">
        <Header
          onTriggerScan={handleTriggerScan}
          isScanning={isScanning}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="page-body">
          {renderTabContent()}
        </div>
      </main>

      <EmailDetailModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
        onUpdate={loadData}
      />
    </div>
  );
};
