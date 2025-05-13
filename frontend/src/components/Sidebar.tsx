import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  UserPlus,
  Search,
  CalendarClock,
  List,
  Plus,
  RefreshCw,
  LogIn,
} from 'lucide-react';
import Logo from './Logo';
import Button from './Button';
import Input from './Input';
import VenueCounter from './VenueCounter';
import { useGuestlistStore } from '../lib/store';
import { supabase, Guestlist } from '../lib/supabase';

interface SidebarProps {
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  const navigate = useNavigate();
  const { guestlists, setGuestlists, selectGuestlist } = useGuestlistStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTodayGuestlists = async () => {
    setIsLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('guestlists')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuestlists(data as Guestlist[]);
    } catch (error) {
      console.error('Error fetching guestlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayGuestlists();
  }, []);

  const filteredGuestlists = searchQuery
    ? guestlists.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : guestlists;

  return (
    <div className="sidebar">
      <div className="p-4 mb-6">
        <Logo size="medium" />
      </div>

      <div className="px-4 mb-6">
        <VenueCounter />
      </div>

      <div className="flex-1 px-2">
        <div className="space-y-1 mb-6">
          <button
            className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg text-left transition-colors ${
              currentPage === 'home'
                ? 'bg-gradient-to-r from-accent-red to-accent-pink text-white'
                : 'text-gray-300 hover:bg-background-elevated'
            }`}
            onClick={() => navigate('/reception/home')}
          >
            <Search size={18} />
            <span>Search Members</span>
          </button>

          <button
            className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg text-left transition-colors ${
              currentPage === 'add-member'
                ? 'bg-gradient-to-r from-accent-red to-accent-pink text-white'
                : 'text-gray-300 hover:bg-background-elevated'
            }`}
            onClick={() => navigate('/reception/add-member')}
          >
            <UserPlus size={18} />
            <span>Add New Member</span>
          </button>

          <button
            className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg text-left transition-colors ${
              currentPage === 'add-walk-in'
                ? 'bg-gradient-to-r from-accent-red to-accent-pink text-white'
                : 'text-gray-300 hover:bg-background-elevated'
            }`}
            onClick={() => navigate('/reception/add-walk-in')}
          >
            <LogIn size={18} />
            <span>Add Walk-In</span>
          </button>

          <button
            className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg text-left transition-colors ${
              currentPage === 'create-guestlist'
                ? 'bg-gradient-to-r from-accent-red to-accent-pink text-white'
                : 'text-gray-300 hover:bg-background-elevated'
            }`}
            onClick={() => navigate('/reception/create-guestlist')}
          >
            <CalendarClock size={18} />
            <span>Create Guestlist</span>
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="font-medium text-gray-300">Today's Guestlists</h3>
            <button
              className="text-gray-400 hover:text-white transition-colors"
              onClick={fetchTodayGuestlists}
            >
              <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="px-4 mb-3">
            <Input
              placeholder="Search guestlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-sm"
            />
          </div>

          <div className="space-y-1 max-h-[calc(100vh-400px)] overflow-y-auto px-2">
            {filteredGuestlists.length > 0 ? (
              filteredGuestlists.map((guestlist) => (
                <div
                  key={guestlist.id}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm bg-background-elevated hover:bg-gray-800 transition-colors"
                >
                  <Link
                    to={`/reception/view-guestlist/${guestlist.id}`}
                    className="font-medium truncate flex-1 hover:underline text-white"
                  >
                    {guestlist.name}
                  </Link>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                      guestlist.status === 'active'
                        ? 'bg-green-900 text-green-300'
                        : guestlist.status === 'completed'
                        ? 'bg-blue-900 text-blue-300'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {guestlist.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 bg-background-elevated rounded-lg text-gray-400 text-sm mx-2">
                <List size={24} className="mb-2" />
                <p>No guestlists for today</p>
                <Button
                  variant="text"
                  size="sm"
                  leftIcon={<Plus size={16} />}
                  className="mt-2"
                  onClick={() => navigate('/reception/create-guestlist')}
                >
                  Create Guestlist
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto p-4">
        <div className="bg-background-elevated rounded-lg p-4 text-sm">
          <p className="text-gray-300 font-medium mb-1">COOC Members Club</p>
          <p className="text-gray-500">Reception Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;




