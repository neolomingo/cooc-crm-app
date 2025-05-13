import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from './Button'; // ✅ Ensure path is correct for your setup

const VenueCounter: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
      console.error('❌ Error fetching venue count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCheckIns = async () => {
    const confirm = window.confirm("Are you sure you want to reset today's check-ins? This action cannot be undone.");
    if (!confirm) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    try {
      // ✅ Mark check_out_time as now instead of deleting
      const { error: error1 } = await supabase
        .from('check_ins')
        .update({ check_out_time: new Date().toISOString() })
        .gte('check_in_time', todayISO)
        .is('check_out_time', null);

      const { error: error2 } = await supabase
        .from('daily_check_ins')
        .delete()
        .gte('check_in_time', todayISO);

      if (error1 || error2) {
        console.error('❌ Error resetting check-ins:', error1 || error2);
        alert("Something went wrong while resetting.");
      } else {
        alert("✅ Check-ins reset successfully!");
        fetchCurrentCount(); // Refresh counter
      }
    } catch (error) {
      console.error("❌ Exception during reset:", error);
      alert("An error occurred.");
    }
  };

  useEffect(() => {
    fetchCurrentCount();

    // Realtime subscription to check_ins INSERTs
    const channel = supabase
      .channel('venue-counter-check-ins')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'check_ins',
        },
        () => {
          console.log('✅ Realtime INSERT detected');
          fetchCurrentCount();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Subscribed to check_ins changes');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-background-elevated rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3
          onClick={() => navigate('/reception/daily-check-ins')}
          className="text-sm font-medium text-gray-300 hover:underline cursor-pointer"
        >
          Currently in Venue
        </h3>
        <Users size={16} className="text-accent-red" />
      </div>
      <div id="venue-count" className="text-2xl font-bold">
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-800 rounded animate-pulse" />
        ) : (
          count
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">Active check-ins today</p>

      <Button
        onClick={handleResetCheckIns}
        variant="danger"
        className="mt-4 text-sm w-full"
      >
        Reset Today's Check-Ins
      </Button>
    </div>
  );
};

export default VenueCounter;



