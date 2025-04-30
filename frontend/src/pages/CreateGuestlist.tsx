import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, CalendarClock, Save, Search, Plus, RotateCw, X } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase, Member } from '../lib/supabase';
import { useGuestlistStore } from '../lib/store';
import { format } from 'date-fns';
import { debounce } from '../lib/utils';
import toast from 'react-hot-toast';

interface CreateGuestlistProps {
  onNavigate: (page: string) => void;
}

const CreateGuestlist: React.FC<CreateGuestlistProps> = ({ onNavigate }) => {
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    setNewGuests(prev => [
      ...prev,
      {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        mailing_list: false,
      }
    ]);
  };
  
  const handleNewGuestChange = (index: number, field: string, value: string | boolean) => {
    setNewGuests(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
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
      // Create guestlist
      const { data: guestlist, error: guestlistError } = await supabase
        .from('guestlists')
        .insert({
          name: formData.name,
          date: formData.date,
          notes: formData.notes,
          status: 'active',
        })
        .select()
        .single();
      
      if (guestlistError) throw guestlistError;
      
      // Add selected members to guestlist
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
        
        const { error: membersError } = await supabase
          .from('guests')
          .insert(memberGuests);
        
        if (membersError) throw membersError;
      }
      
      // Add new guests to guestlist
      if (newGuests.length > 0) {
        const validNewGuests = newGuests.filter(
          guest => guest.first_name.trim() && guest.last_name.trim()
        );
        
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
          
          const { error: newGuestsError } = await supabase
            .from('guests')
            .insert(newGuestEntries);
          
          if (newGuestsError) throw newGuestsError;
        }
      }
      
      toast.success('Guestlist created successfully!');
      onNavigate('home');
    } catch (err) {
      console.error('Error creating guestlist:', err);
      setError('Failed to create guestlist. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="text"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => onNavigate('home')}
            className="mr-4"
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create Guestlist</h1>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <form onSubmit={handleSubmit} className="max-w-3xl">
          <div className="card mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-accent-red to-accent-pink rounded-lg p-2 mr-2">
                <CalendarClock className="text-white" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Guestlist Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label={<>Name <span className="text-red-500">*</span></>}
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              
              <Input
                label={<>Date <span className="text-red-500">*</span></>}
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field min-h-[80px]"
                placeholder="Any special notes about this guestlist..."
              />
            </div>
          </div>
          
          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">Add Members</h2>
            
            <div className="mb-4 relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Search for members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-5 w-5" />}
                    fullWidth
                  />
                  
                  {/* Suggestions dropdown */}
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
                
                <Button
                  type="button"
                  onClick={handleSearch}
                  isLoading={isSearching}
                >
                  Search
                </Button>
              </div>
            </div>
            
            {selectedMembers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Selected Members</h3>
                <div className="space-y-2">
                  {selectedMembers.map(member => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between bg-background-elevated p-3 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{member.first_name} {member.last_name}</p>
                        <p className="text-sm text-gray-400">{member.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-300">New Guests</h3>
                <Button
                  type="button"
                  variant="text"
                  size="sm"
                  leftIcon={<Plus size={16} />}
                  onClick={handleAddNewGuest}
                >
                  Add New Guest
                </Button>
              </div>
              
              {newGuests.length > 0 ? (
                <div className="space-y-4">
                  {newGuests.map((guest, index) => (
                    <div key={index} className="bg-background-elevated p-4 rounded-lg relative">
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-background-card border border-gray-700 rounded-full text-gray-400 hover:text-red-400 transition-colors"
                        onClick={() => handleRemoveNewGuest(index)}
                      >
                        <X size={16} />
                      </button>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Input
                          placeholder="First Name"
                          value={guest.first_name}
                          onChange={(e) => handleNewGuestChange(index, 'first_name', e.target.value)}
                          required
                        />
                        <Input
                          placeholder="Last Name"
                          value={guest.last_name}
                          onChange={(e) => handleNewGuestChange(index, 'last_name', e.target.value)}
                          required
                        />
                        <Input
                          placeholder="Email (optional)"
                          type="email"
                          value={guest.email}
                          onChange={(e) => handleNewGuestChange(index, 'email', e.target.value)}
                        />
                        <Input
                          placeholder="Phone (optional)"
                          value={guest.phone}
                          onChange={(e) => handleNewGuestChange(index, 'phone', e.target.value)}
                        />
                      </div>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={guest.mailing_list}
                          onChange={(e) => handleNewGuestChange(index, 'mailing_list', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-background-elevated"
                        />
                        <span className="ml-2 text-sm text-gray-300">Add to mailing list</span>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  className="border border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 transition-colors"
                  onClick={handleAddNewGuest}
                >
                  <Plus className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-gray-400">Add a new guest that isn't a member</p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      
      <div className="fixed bottom-0 left-[300px] right-0 p-6 bg-background-card border-t border-gray-800">
        <div className="max-w-3xl mx-auto flex gap-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save size={18} />}
            className="flex-1 bg-gradient-to-r from-accent-red to-accent-pink hover:opacity-90"
            onClick={handleSubmit}
          >
            Create Guestlist
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => onNavigate('home')}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGuestlist;