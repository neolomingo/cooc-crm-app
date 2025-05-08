import React from 'react';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

const ReceptionHome: React.FC = () => {
  const { setUser } = useAuthStore();

  const handleLogout = async () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-white">
      <div className="mb-12">
        <Logo size="large" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Welcome to Reception Dashboard</h1>
      <p className="text-gray-400 mb-6">Use the sidebar to begin your tasks</p>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<LogOut size={16} />}
        onClick={handleLogout}
        className="absolute top-4 right-4"
      >
        Log Out
      </Button>
    </div>
  );
};

export default ReceptionHome;
