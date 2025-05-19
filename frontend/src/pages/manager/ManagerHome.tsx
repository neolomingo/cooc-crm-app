import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  TrendingUp,
  Clock,
  Star,
  BarChart2,
  MessageCircle,
  Bell,
  Settings,
} from 'lucide-react';
import Logo from '../../components/Logo';

const tiles = [
  {
    title: 'Total Members',
    icon: Users,
    value: '1,024',
  },
  {
    title: 'Live Check-ins',
    icon: Activity,
    value: '76',
  },
  {
    title: 'Retention Rate',
    icon: TrendingUp,
    value: '82% (Monthly)',
  },
  {
    title: 'Top 5 Active',
    icon: Star,
    value: 'See List',
  },
  {
    title: 'Peak Hours',
    icon: Clock,
    value: '9PM - 12AM',
  },
];

const footerNav = [
  {
    name: 'Check-Ins',
    path: '/manager/checkins',
    icon: BarChart2,
  },
  {
    name: 'Feedback',
    path: '/manager/feedback',
    icon: MessageCircle,
  },
  {
    name: 'Alerts',
    path: '/manager/alerts',
    icon: Bell,
  },
  {
    name: 'Settings',
    path: '/manager/settings',
    icon: Settings,
  },
];

const ManagerHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32">
        <div className="flex flex-col items-center justify-center">
          <Logo size="large" className="mb-6" />
          <h1 className="text-2xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-gray-400 mb-6 text-center">Quick stats and insights</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
            {tiles.map(({ title, icon: Icon, value }) => (
              <div
                key={title}
                className="bg-background-card p-4 rounded-lg border border-gray-700 flex items-center gap-4 shadow-md"
              >
                <Icon size={28} className="text-accent-red" />
                <div>
                  <div className="text-sm text-gray-400">{title}</div>
                  <div className="text-lg font-semibold">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom nav */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background-dark border-t border-gray-800 flex justify-around py-2 md:hidden z-50">
        {footerNav.map(({ name, path, icon: Icon }) => (
          <button
            key={name}
            onClick={() => navigate(path)}
            className="flex flex-col items-center text-sm text-gray-300 hover:text-white"
          >
            <Icon size={20} />
            <span>{name}</span>
          </button>
        ))}
      </footer>
    </div>
  );
};

export default ManagerHome;




