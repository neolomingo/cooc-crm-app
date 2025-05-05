import React, { useState } from 'react';
import Button from '../components/Button';
import Logo from '../components/Logo';

interface Props {
  onLogout: () => void;
}

export const ManagerDashboard: React.FC<Props> = ({ onLogout }) => {
  const [currentTab, setCurrentTab] = useState<'overview' | 'checkins' | 'feedback' | 'alerts' | 'settings'>('overview');

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <div className="p-6 text-white">📊 Overview: Summary of check-ins, most active members, engagement trends.</div>;
      case 'checkins':
        return <div className="p-6 text-white">✅ Real-time Check-Ins: Who's currently inside, time of entry, who checked them in.</div>;
      case 'feedback':
        return <div className="p-6 text-white">📝 Feedback Viewer: Music, vibe, service ratings.</div>;
      case 'alerts':
        return <div className="p-6 text-white">🔔 Alerts Panel: Notifications for key members arriving, capacity limits, special notes.</div>;
      case 'settings':
        return <div className="p-6 text-white">⚙️ Settings: Set ping rules, define event themes, toggle visibility for certain features.</div>;
      default:
        return <div className="text-red-400">Unknown section</div>;
    }
  };

  return (
    <div className="h-screen bg-background-dark text-white flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <Logo size="small" />
        <nav className="space-x-2">
        <Button variant="outline" onClick={() => setCurrentTab('checkins')}>Check-Ins</Button>
<Button variant="outline" onClick={() => setCurrentTab('feedback')}>Feedback</Button>
<Button variant="outline" onClick={() => setCurrentTab('alerts')}>Alerts</Button>
<Button variant="outline" onClick={() => setCurrentTab('settings')}>Settings</Button>

        </nav>
        <Button variant="outline" size="sm" onClick={onLogout}>Logout</Button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default ManagerDashboard;
