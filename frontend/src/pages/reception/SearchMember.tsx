import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Search, UserPlus, ArrowLeft } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import MemberItem from '../../components/MemberItem';
import { supabase, Member } from '../../lib/supabase';
import { useMemberStore } from '../../lib/store';
import { debounce } from '../../lib/utils';

const SearchMember: React.FC = () => {
  const navigate = useNavigate();
  const { selectMember } = useMemberStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Member[]>([]);
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

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
    if (query.trim()) {
      debouncedFetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('last_visit', { ascending: false });

      if (error) throw error;
      setResults(data as Member[]);
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionClick = (member: Member) => {
    selectMember(member);
    navigate('/member-details');
  };

  const handleMemberClick = (member: Member) => {
    selectMember(member);
    navigate('/member-details');
  };

  const handleCheckIn = async (member: Member) => {
    setCheckingInId(member.id);
    try {
      await supabase.from('check_ins').insert({
        member_id: member.id,
        check_in_time: new Date().toISOString(),
      });

      const { data: updatedMember } = await supabase
        .from('members')
        .update({ last_visit: new Date().toISOString() })
        .eq('id', member.id)
        .select()
        .single();

      setResults((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, ...updatedMember } : m))
      );
    } catch (error) {
      console.error('Error checking in member:', error);
    } finally {
      setCheckingInId(null);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <Button
          variant="text"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/')}
          className="mr-4"
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold">Search Members</h1>
      </div>

      <div className="flex mb-6">
        <form onSubmit={handleFormSubmit} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search by name, email, or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
              className="w-full"
            />

            {(suggestions.length > 0 || isSuggestionsLoading) && query.length >= 2 && (
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
                      className="w-full px-4 py-2 text-left hover:bg-background-elevated transition-colors border-b border-gray-800 last:border-0"
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

          <Button type="submit" isLoading={isLoading}>Search</Button>
        </form>

        <Button
          variant="primary"
          leftIcon={<UserPlus size={18} />}
          onClick={() => navigate('/add-member')}
          className="ml-4"
        >
          Add New
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                onClick={() => handleMemberClick(member)}
                onCheckIn={() => handleCheckIn(member)}
                isCheckingIn={checkingInId === member.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search size={48} className="mb-4 opacity-30" />
            <h2 className="text-xl font-medium mb-2">No members found</h2>
            <p className="mb-4">Try a different search term or add a new member</p>
            <Button
              variant="primary"
              leftIcon={<UserPlus size={18} />}
              onClick={() => navigate('/add-member')}
            >
              Add New Member
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchMember;
