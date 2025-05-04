import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LoginEvent {
  id: string;
  email: string;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

const LoginActivityFeed: React.FC = () => {
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoginEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('login_events')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);

        if (error) throw error;
        setEvents(data || []);
      } catch (err: any) {
        console.error('Failed to fetch login activity:', err.message);
        setError('Error fetching login activity');
      } finally {
        setLoading(false);
      }
    };

    fetchLoginEvents();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">🔐 Login Activity Feed</h2>

      {loading && <p className="text-gray-400">Loading login events...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && events.length === 0 && (
        <p className="text-gray-500">No login events found.</p>
      )}

      {!loading && events.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm text-gray-200">
            <thead className="bg-background-elevated text-gray-400 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">IP Address</th>
                <th className="px-4 py-3 text-left">Device</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-2">{event.email}</td>
                  <td className="px-4 py-2">{new Date(event.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2">{event.ip_address || 'N/A'}</td>
                  <td className="px-4 py-2 text-xs">{event.user_agent || 'Unknown Device'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LoginActivityFeed;
