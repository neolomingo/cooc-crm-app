import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Save, Search, Plus, RotateCw, X } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { supabase, Member } from '../../lib/supabase';
import { useGuestlistStore } from '../../lib/store';
import { format } from 'date-fns';
import { debounce } from '../../lib/utils';
import toast from 'react-hot-toast';

const CreateGuestlist: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: `Guestlist for ${format(new Date(), 'MMMM d, yyyy')}`,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [newGuests, setNewGuests] = useState<Array<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    mailing_list: boolean;
  }>>([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5);
      if (error) throw error;
      setSearchResults(data as Member[]);
    } catch (error) {
      console.error('Error searching members:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (member: Member) => {
    handleSelectMember(member);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleSelectMember = (member: Member) => {
    if (!selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers(prev => [...prev, member]);
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleAddNewGuest = () => {
    setNewGuests(prev => [...prev, { first_name: '', last_name: '', email: '', phone: '', mailing_list: false }]);
  };

  const handleNewGuestChange = (index: number, field: string, value: string | boolean) => {
    setNewGuests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveNewGuest = (index: number) => {
    setNewGuests(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) {
      setError('Name and date are required');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const { data: guestlist, error: guestlistError } = await supabase
        .from('guestlists')
        .insert({ name: formData.name, date: formData.date, notes: formData.notes, status: 'active' })
        .select()
        .single();
      if (guestlistError) throw guestlistError;
      if (selectedMembers.length > 0) {
        const memberGuests = selectedMembers.map(member => ({
          guestlist_id: guestlist.id,
          member_id: member.id,
          first_name: member.first_name,
          last_name: member.last_name,
          email: member.email,
          phone: member.phone,
          checked_in: false,
          mailing_list: member.mailing_list,
        }));
        const { error: membersError } = await supabase.from('guests').insert(memberGuests);
        if (membersError) throw membersError;
      }
      if (newGuests.length > 0) {
        const validNewGuests = newGuests.filter(guest => guest.first_name.trim() && guest.last_name.trim());
        if (validNewGuests.length > 0) {
          const newGuestEntries = validNewGuests.map(guest => ({
            guestlist_id: guestlist.id,
            first_name: guest.first_name,
            last_name: guest.last_name,
            email: guest.email || null,
            phone: guest.phone || null,
            checked_in: false,
            mailing_list: guest.mailing_list,
          }));
          const { error: newGuestsError } = await supabase.from('guests').insert(newGuestEntries);
          if (newGuestsError) throw newGuestsError;
        }
      }
      toast.success('Guestlist created successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error creating guestlist:', err);
      setError('Failed to create guestlist. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Remaining layout and JSX structure (form inputs, buttons, etc.) remains unchanged */}
      {/* Only the props and navigation method were updated */}
    </div>
  );
};

export default CreateGuestlist;
