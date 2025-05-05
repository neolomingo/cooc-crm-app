import React, { useState, useEffect } from 'react';
import { supabase, supabaseUrl } from '../../lib/supabase'; // ✅ Import supabaseUrl
import Button from '../../components/Button';

const SystemHealthWidget: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const appVersion = 'v1.0.0'; // Replace with dynamic source if needed
  const schemaVersion = '2025.05.01'; // Replace or fetch dynamically if desired

  useEffect(() => {
    const checkDb = async () => {
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        setDbStatus(error ? 'offline' : 'online');
      } catch {
        setDbStatus('offline');
      }
    };

    const checkApi = async () => {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1`, { method: 'OPTIONS' }); // ✅ Fixed here
        setApiStatus(response.ok ? 'online' : 'offline');
      } catch {
        setApiStatus('offline');
      }
    };

    checkDb();
    checkApi();
  }, []);

  const getStatusBadge = (status: string) => {
    const color =
      status === 'online' ? 'bg-green-600' :
      status === 'offline' ? 'bg-red-600' : 'bg-yellow-400';
    return <span className={`ml-2 px-2 py-1 text-xs rounded ${color}`}>{status}</span>;
  };

  return (
    <div className="p-6 space-y-6 text-white">
      <h2 className="text-xl font-semibold">🩺 System Health</h2>
      <div className="space-y-4">
        <div>
          <span className="font-medium">Database Status:</span>
          {getStatusBadge(dbStatus)}
        </div>
        <div>
          <span className="font-medium">API Gateway:</span>
          {getStatusBadge(apiStatus)}
        </div>
        <div>
          <span className="font-medium">App Version:</span>
          <span className="ml-2 text-gray-300">{appVersion}</span>
        </div>
        <div>
          <span className="font-medium">Schema Version:</span>
          <span className="ml-2 text-gray-300">{schemaVersion}</span>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
        Refresh Status
      </Button>
    </div>
  );
};

export default SystemHealthWidget;

