import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Pencil, Trash, ShieldCheck } from 'lucide-react';
import Button from '../Button';
import Input from '../Input';

type Role = 'reception' | 'manager' | 'admin';

interface UserProfile {
  id: string;
  email: string;
  role: Role;
  created_at: string;
}

const roles: Role[] = ['reception', 'manager', 'admin'];

const UserManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (data) setUsers(data);
    if (error) console.error(error);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } else {
      console.error('Failed to update role:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>

      {loading ? (
        <p className="text-gray-400">Loading users...</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-300">
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Role</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-800">
                <td className="py-2 px-4 text-white">{user.email}</td>
                <td className="py-2 px-4">
                  <select
                    className="bg-gray-900 border border-gray-700 text-white px-2 py-1 rounded"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 flex items-center space-x-2">
                  <button className="text-yellow-400 hover:text-yellow-300">
                    <Pencil size={16} />
                  </button>
                  <button className="text-red-500 hover:text-red-400">
                    <Trash size={16} />
                  </button>
                  {user.role === 'admin' && (
                    <span title="Admin User">
                    <ShieldCheck className="text-green-400 ml-2" size={16} />
                  </span>
                  
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagementPanel;
