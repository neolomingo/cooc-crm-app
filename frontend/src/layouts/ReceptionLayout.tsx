import React, { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, Search, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Logo from '../components/Logo';
import Button from '../components/Button';
import Input from '../components/Input';
import { useMemberStore } from '../lib/store';
import { supabase, Member } from '../lib/supabase';
import { debounce } from '../lib/utils';

interface ReceptionLayoutProps {
  onLogout: () => void;
}

const ReceptionLayout: React.FC<ReceptionLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const { selectMember } = useMemberStore();

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

  const isHome =
    location.pathname === '/reception' || location.pathname === '/reception/home';

  console.log('[ReceptionLayout] Rendering with path:', location.pathname);

  return (
    <div className="flex h-screen bg-background-dark text-white">
      <Sidebar
        currentPage={location.pathname.split('/').pop() || ''}
        onNavigate={(path) => {
          console.log('[Sidebar] Navigating to:', path);
          navigate(`/reception/${path}`);
        }}
      />
      <main className="flex-1 overflow-y-auto">
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
                  <PlusCircle
                    className="add-icon h-5 w-5"
                    onClick={handleAddNewClick}
                  />

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

            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut size={16} />}
              onClick={onLogout}
              className="absolute top-4 right-4"
            >
              Log Out
            </Button>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default ReceptionLayout;





