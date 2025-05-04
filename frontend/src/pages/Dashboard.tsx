import { AdminDashboard } from './AdminDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { ReceptionDashboard } from './ReceptionDashboard';
import { useAuthStore } from '../lib/store';

interface Props {
  onLogout: () => void;
}

const Dashboard: React.FC<Props> = ({ onLogout }) => {
  const { user } = useAuthStore();

  if (user?.role === 'admin') return <AdminDashboard onLogout={onLogout} />;
  if (user?.role === 'manager') return <ManagerDashboard onLogout={onLogout} />;
  return <ReceptionDashboard onLogout={onLogout} />;
};

export default Dashboard;
