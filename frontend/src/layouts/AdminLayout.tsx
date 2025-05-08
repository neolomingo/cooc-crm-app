import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import Button from '../components/Button';

interface AdminLayoutProps {
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  return (
    <div className="flex h-screen bg-background-dark text-white">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="space-x-3">
            <NavLink
              to="users"
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              Users
            </NavLink>
            <NavLink
              to="logs"
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              Logs
            </NavLink>
            <NavLink
              to="activity"
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              Activity
            </NavLink>
            <NavLink
              to="settings"
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              Settings
            </NavLink>
            <NavLink
              to="export"
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              Export
            </NavLink>
            <NavLink
              to="health"
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              System Health
            </NavLink>
            <NavLink
              to="access"
              className={({ isActive }) =>
                `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-accent-red text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              Access Codes
            </NavLink>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut size={16} />}
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

