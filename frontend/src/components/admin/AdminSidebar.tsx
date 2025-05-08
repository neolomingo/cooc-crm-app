import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Button from '../../components/Button';
import { useAuthStore } from '../../lib/store';


const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();

  const handleLogout = async () => {
    setUser(null);
    navigate('/');
  };

  const currentTab = location.pathname.split('/')[2] || '';
  const handleNavigate = (tab: string) => {
    navigate(`/admin/${tab}`);
  };

  return (
    <div className="flex h-screen bg-background-dark text-white">
      <AdminSidebar currentTab={currentTab} onNavigate={handleNavigate} />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-xl font-semibold capitalize">{currentTab.replace('-', ' ')}</div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut size={16} />}
            onClick={handleLogout}
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

