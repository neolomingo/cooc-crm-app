import React from 'react';
import { LogOut } from 'lucide-react';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { useAuthStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

const AdminHome: React.FC = () => {
  const { setUser } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white px-4">
      <Logo size="large" className="mb-10" />
      <h1 className="text-2xl font-bold mb-2">Admin Control Panel</h1>
      <p className="text-gray-400 mb-6">Navigate using the left sidebar to manage users, settings, and reports</p>
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

export default AdminHome;

