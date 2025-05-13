import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';

interface CheckInEntry {
  id: string;
  member_id: string;
  check_in_time: string;
  checked_in_by: string;
  member: {
    first_name: string;
    last_name: string;
  };
}

const DailyCheckIns: React.FC = () => {
  const [entries, setEntries] = useState<CheckInEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCheckIns = async () => {
    setIsLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('daily_check_ins')
      .select(`
        id,
        member_id,
        check_in_time,
        checked_in_by,
        member:members (
          first_name,
          last_name
        )
      `)
      .gte('check_in_time', today.toISOString())
      .order('check_in_time', { ascending: false })
      .returns<CheckInEntry[]>();

    if (error) {
      console.error('Error fetching daily check-ins:', error);
    } else {
      setEntries(data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchCheckIns();
  }, []);

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

      <div className="card p-6">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-gray-400">
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
                  No check-ins today.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="text-sm border-t border-gray-700">
                  <td className="py-2">
                    {entry.member.first_name} {entry.member.last_name}
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





