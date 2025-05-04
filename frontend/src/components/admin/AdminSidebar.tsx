import React from 'react';
import { User, FileText, Activity, Settings, Download, Server } from 'lucide-react';
import Logo from '../Logo';

interface Props {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

const tabs = [
  { key: 'users', label: 'Users', icon: User },
  { key: 'logs', label: 'Logs', icon: FileText },
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'export', label: 'Export', icon: Download },
  { key: 'health', label: 'System Health', icon: Server },
];

const AdminSidebar: React.FC<Props> = ({ currentTab, onNavigate }) => {
  return (
    <aside className="w-64 bg-background-card border-r border-gray-800 flex flex-col p-4">
      <div className="mb-8 flex justify-center">
        <Logo size="medium" />
      </div>

      <nav className="flex-1 space-y-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`flex items-center w-full px-4 py-2 text-left rounded-lg transition-all ${
              currentTab === key
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-background-elevated'
            }`}
          >
            <Icon className="w-4 h-4 mr-3" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
