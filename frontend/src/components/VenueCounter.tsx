import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const VenueCounter: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // 👈 Hook to navigate

  const fetchCurrentCount = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: checkedInCount, error } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .gte('check_in_time', today.toISOString())
        .is('check_out_time', null);

      if (error) throw error;
      setCount(checkedInCount || 0);
    } catch (error) {
      console.error('Error fetching venue count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentCount();

    // Subscribe to changes in check_ins table
    const channel = supabase
      .channel('check_ins_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'check_ins',
        },
        () => {
          fetchCurrentCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-background-elevated rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3
          onClick={() => navigate('/daily-checkins')}
          className="text-sm font-medium text-gray-300 hover:underline cursor-pointer"
        >
          Currently in Venue
        </h3>
        <Users size={16} className="text-accent-red" />
      </div>
      <div className="text-2xl font-bold">
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-800 rounded animate-pulse" />
        ) : (
          count
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">Active check-ins today</p>
    </div>
  );
};

export default VenueCounter;
