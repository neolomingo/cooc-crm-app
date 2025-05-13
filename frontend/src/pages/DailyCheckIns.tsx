import React, { useEffect, useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';

interface CheckInEntry {
  id: string;
  member_id: string;
  check_in_time: string;
  checked_in_by: string;
  members: {
    first_name: string;
    last_name: string;
  };
}

const DailyCheckIns: React.FC = () => {
  const [entries, setEntries] = useState<CheckInEntry[]>([]);
  const [eventType, setEventType] = useState<'day' | 'night'>('day');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCheckIns = async () => {
    setIsLoading(true);
    const now = new Date();
    const todayStart = new Date(now);
    const todayEnd = new Date(now);

    if (eventType === 'day') {
      todayStart.setHours(9, 0, 0, 0);
      todayEnd.setHours(21, 0, 0, 0);
    } else {
      todayStart.setHours(21, 0, 0, 0); // 9 PM today
      todayEnd.setDate(todayEnd.getDate() + 1);
      todayEnd.setHours(6, 0, 0, 0); // 6 AM next day
    }

    const { data, error } = await supabase
      .from('daily_check_ins')
      .select(`
        id,
        member_id,
        check_in_time,
        checked_in_by,
        members (
          first_name,
          last_name
        )
      `)
      .gte('check_in_time', todayStart.toISOString())
      .lt('check_in_time', todayEnd.toISOString())
      .order('check_in_time', { ascending: false });

    if (error) {
      console.error('Error fetching check-ins:', error);
    } else {
      setEntries(data as CheckInEntry[]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchCheckIns();
  }, [eventType]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="text"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/reception')}
          className="mr-4"
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold">Daily Check-Ins</h1>
        <span className="ml-auto text-sm text-muted">Total: {entries.length}</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm font-medium text-white">Event Type:</label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as 'day' | 'night')}
          className="bg-background text-black border border-gray-600 p-2 rounded"
        >
          <option value="day">Day (9 AM – 9 PM)</option>
          <option value="night">Night (9 PM – 6 AM)</option>
        </select>

        <Button onClick={handlePrint} leftIcon={<Printer size={16} />} variant="secondary">
          Print Log
        </Button>
      </div>

      <div className="card p-6 bg-background-elevated rounded-lg shadow">
        <table className="w-full table-auto text-sm text-left text-gray-300">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="pb-2">Name</th>
              <th className="pb-2">Check-in Time</th>
              <th className="pb-2">Checked-in By</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="text-center text-muted py-6">
                  Loading...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-muted py-6">
                  No check-ins for this period.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="border-t border-gray-700 hover:bg-gray-800">
                  <td className="py-2">
                    {entry.members.first_name} {entry.members.last_name}
                  </td>
                  <td className="py-2">
                    {new Date(entry.check_in_time).toLocaleTimeString()}
                  </td>
                  <td className="py-2">{entry.checked_in_by}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyCheckIns;







