import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, Search, LogOut, UserCog, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Logo from '../components/Logo';
import Button from '../components/Button';
import Input from '../components/Input';
import { useMemberStore, useAuthStore } from '../lib/store';
import { supabase, Member } from '../lib/supabase';
import { debounce } from '../lib/utils';

interface ReceptionLayoutProps {
  onLogout: () => void;
}

const ReceptionLayout: React.FC<ReceptionLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const { selectMember } = useMemberStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-logout on tab close
  useEffect(() => {
    const handleUnload = async () => {
      await supabase.auth.signOut();
      setUser(null);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [setUser]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSuggestionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .order('last_name', { ascending: true })
        .limit(5);

      if (error) throw error;
      setSuggestions(data as Member[]);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsSuggestionsLoading(false);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce((searchTerm: string) => fetchSuggestions(searchTerm), 300),
    []
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedFetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    navigate('/reception/search-member');
  };

  const handleSuggestionClick = (member: Member) => {
    selectMember(member);
    setSuggestions([]);
    setSearchQuery('');
    navigate('/reception/member-details');
  };

  const handleAddNewClick = () => {
    navigate('/reception/add-member');
  };

  const initials = user?.email
    ? user.email.replace('@', ' ').split(/[.\s]/).map((s) => s[0]?.toUpperCase()).join('').slice(0, 2)
    : '';

  const isHome =
    location.pathname === '/reception' || location.pathname === '/reception/home';

  return (
    <div className="flex h-screen bg-background-dark text-white">
      <Sidebar
        currentPage={location.pathname.split('/').pop() || ''}
        onNavigate={(path) => navigate(`/reception/${path}`)}
      />

      <main className="flex-1 overflow-y-auto relative">
        {/* User badge + dropdown */}
        {user && (
          <div className="absolute top-4 right-4 z-20" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 bg-primary-700 hover:bg-primary-600 text-white px-3 py-1 rounded-full shadow-md transition"
              onClick={() => setIsDropdownOpen(prev => !prev)}
            >
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
              <ChevronDown size={16} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-background-card border border-gray-700 rounded-md shadow-lg py-2 text-sm">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/reception/edit-profile');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-background-elevated flex items-center gap-2"
                >
                  <UserCog size={16} /> Edit Profile
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 hover:bg-background-elevated flex items-center gap-2 text-red-400"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            )}
            <div className="text-xs text-gray-400 text-center mt-1 capitalize">
              {user.role}
            </div>
          </div>
        )}

        {isHome ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="mb-12">
              <Logo size="large" />
            </div>

            <div className="search-container">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="search-icon h-5 w-5" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search Member"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <PlusCircle className="add-icon h-5 w-5" onClick={handleAddNewClick} />

                  {(suggestions.length > 0 || isSuggestionsLoading) && searchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background-card border border-gray-800 rounded-lg shadow-xl overflow-hidden">
                      {isSuggestionsLoading ? (
                        <div className="p-3 text-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                        </div>
                      ) : (
                        suggestions.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-background-elevated transition-colors border-b border-gray-800 last:border-0"
                            onClick={() => handleSuggestionClick(member)}
                          >
                            <div className="font-medium">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-sm text-gray-400">{member.email}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default ReceptionLayout;









