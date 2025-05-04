import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LogEntry {
  id: string;
  role: string;
  email: string;
  created_at: string;
  created_by: string;
}

const AccountCreationLog: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, created_at, created_by')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLogs(data || []);
      } catch (err: any) {
        console.error('Error fetching logs:', err.message);
        setError('Failed to fetch account logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">🧾 Account Creation Logs</h2>

      {loading && <p className="text-gray-400">Loading logs...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && logs.length === 0 && (
        <p className="text-gray-500">No accounts found.</p>
      )}

      {!loading && logs.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm text-gray-200">
            <thead className="bg-background-elevated text-gray-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Created By</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-2">{log.email}</td>
                  <td className="px-4 py-2 capitalize">{log.role}</td>
                  <td className="px-4 py-2">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-xs">{log.created_by || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountCreationLog;
