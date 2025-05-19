import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
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
  const [navOpen, setNavOpen] = useState(false);

  const toggleNav = () => setNavOpen(!navOpen);
  const closeNav = () => setNavOpen(false);

  useEffect(() => {
    console.log('[ManagerLayout] mounted');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-800 md:px-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* Top Row: Logo + Hamburger + Log Out (on mobile) */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <Logo size="small" />
            <h1 className="text-lg font-semibold md:hidden">Manager</h1>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              leftIcon={<LogOut size={16} />}
              className="text-sm"
            >
              Logout
            </Button>

            <button onClick={toggleNav} aria-label="Toggle navigation">
              {navOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Nav Tabs - Desktop */}
        <nav className="hidden md:flex gap-3">
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

        {/* Logout Button - Desktop Only */}
        <div className="hidden md:block">
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            leftIcon={<LogOut size={16} />}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {navOpen && (
        <div className="md:hidden bg-background-card border-b border-gray-800 px-4 pb-4">
          <nav className="flex flex-col space-y-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-accent-red text-white' : 'text-gray-300 hover:text-white'
                  }`
                }
                onClick={closeNav}
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;




