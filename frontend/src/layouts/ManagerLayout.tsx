import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Logo from '../components/Logo';
import Button from '../components/Button';

interface ManagerLayoutProps {
  onLogout: () => void;
}

const tabs = [
  { name: 'Check-Ins', path: '/manager/checkins' },
  { name: 'Feedback', path: '/manager/feedback' },
  { name: 'Alerts', path: '/manager/alerts' },
  { name: 'Settings', path: '/manager/settings' },
];

const ManagerLayout: React.FC<ManagerLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-screen bg-background-dark text-white flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <Logo size="small" />
        <nav className="space-x-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent-red text-white' : 'text-gray-300 hover:text-white'
                }`
              }
            >
              {tab.name}
            </NavLink>
          ))}
        </nav>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          leftIcon={<LogOut size={16} />}
        >
          Logout
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;

