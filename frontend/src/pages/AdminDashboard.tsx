import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import UserManagementPanel from '../components/admin/UserManagementPanel';
import AccessCodeGeneratorPanel from '../components/admin/AccessCodeGeneratorPanel';
import AccountCreationLog from '../components/admin/AccountCreationLog';
import LoginActivityFeed from '../components/admin/LoginActivityFeed';
import SettingsPanel from '../components/admin/SettingsPanel';
import DataExportPanel from '../components/admin/DataExportPanel';
import SystemHealthWidget from '../components/admin/SystemHealthWidget';
import { LogOut } from 'lucide-react';
import Button from '../components/Button';

interface Props {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [currentTab, setCurrentTab] = useState('users');

  const renderTab = () => {
    switch (currentTab) {
      case 'users':
        return <UserManagementPanel />;
      case 'logs':
        return <AccountCreationLog />;
      case 'activity':
        return <LoginActivityFeed />;
      case 'settings':
        return <SettingsPanel />;
      case 'export':
        return <DataExportPanel />;
      case 'health':
        return <SystemHealthWidget />;
        case 'access':
      return <AccessCodeGeneratorPanel />;
      default:
        return <div className="text-center text-red-400">Unknown section</div>;
    }
  };

  return (
    <div className="flex h-screen bg-background-dark text-white">
      <AdminSidebar currentTab={currentTab} onNavigate={setCurrentTab} />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-end mb-4">
          <Button onClick={onLogout} variant="outline" leftIcon={<LogOut size={16} />}>
            Logout
          </Button>
        </div>
        {renderTab()}
      </main>
    </div>
  );
};

export default AdminDashboard;
