import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { supabase, Member } from '../../lib/supabase';
import { format } from 'date-fns';
import { debounce } from '../../lib/utils';
import toast from 'react-hot-toast';

type GuestlistType = 'member' | 'guest' | 'staff';

const CreateGuestlist: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: `Guestlist for ${format(new Date(), 'MMMM d, yyyy')}`,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [guestlistType, setGuestlistType] = useState<GuestlistType>('member');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<any[]>([]);
  const [newGuestRow, setNewGuestRow] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mailing_list: false,
  });
  const [guestOfMap, setGuestOfMap] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchSuggestions = async (searchTerm: string) => {
    const { data, error } = await supabase
      .from('members')
      .select('*, member_friends(*), walk_ins(*)')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .limit(10);
    if (!error) setSuggestions(data as Member[]);
  };

  const debouncedFetchSuggestions = useCallback(
    debounce((searchTerm: string) => fetchSuggestions(searchTerm), 300),
    []
  );

  useEffect(() => {
    if (searchQuery.trim()) debouncedFetchSuggestions(searchQuery);
    else setSuggestions([]);
  }, [searchQuery]);

  const handleSelectSuggestion = (person: Member) => {
    if (!selectedGuests.some(g => g.id === person.id)) {
      setSelectedGuests(prev => [...prev, person]);
    }
    setSuggestions([]);
    setSearchQuery('');
  };

  const handleAssignGuestOf = (guestId: string, hostId: string) => {
    setGuestOfMap(prev => ({ ...prev, [guestId]: hostId }));
  };

  const handleAddGuestRow = () => {
    if (!newGuestRow.first_name || !newGuestRow.last_name) return;
    const id = `new-${Date.now()}`;
    setSelectedGuests(prev => [...prev, { ...newGuestRow, id }]);
    setNewGuestRow({ first_name: '', last_name: '', email: '', phone: '', mailing_list: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data: guestlist } = await supabase.from('guestlists').insert({
        name: formData.name,
        date: formData.date,
        notes: formData.notes,
        status: 'active',
      }).select().single();

      const guestEntries = selectedGuests.map(guest => ({
        guestlist_id: guestlist.id,
        member_id: guest?.id?.startsWith('new-') ? null : guest.id,
        guest_of: guestOfMap[guest.id] || null,
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email || null,
        phone: guest.phone || null,
        mailing_list: guest.mailing_list || false,
        checked_in: false,
      }));

      await supabase.from('guests').insert(guestEntries);
      toast.success('Guestlist created!');
      navigate('/reception/view-guestlists');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create guestlist');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen p-6">
      <div className="max-w-2xl w-full bg-black p-6 rounded-lg shadow-lg space-y-6">
        <h1 className="text-2xl font-bold mb-4">Create Guestlist</h1>

        <Input name="name" value={formData.name} onChange={handleChange} label="Guestlist Name" />
        <Input name="date" type="date" value={formData.date} onChange={handleChange} label="Date" />

        <div>
          <label className="block text-sm font-medium text-white mb-1">Guestlist Type</label>
          <select
            value={guestlistType}
            onChange={(e) => setGuestlistType(e.target.value as GuestlistType)}
            className="w-full bg-background border border-gray-700 text-white p-2 rounded"
          >
            <option value="member">Member Guestlist</option>
            <option value="guest">Guest Guestlist</option>
            <option value="staff">Staff Guestlist</option>
          </select>
        </div>

        {guestlistType !== 'guest' && (
          <Input
            placeholder="Search member or friend by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        )}

        {suggestions.map(person => (
          <div key={person.id} onClick={() => handleSelectSuggestion(person)} className="p-2 hover:bg-gray-800 cursor-pointer border rounded">
            {person.first_name} {person.last_name} ({person.email})
          </div>
        ))}

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any notes..."
          className="w-full bg-background text-white p-4 rounded-lg border border-gray-700"
        />

        <div className="border p-4 rounded-lg bg-background-elevated">
          <h3 className="font-semibold text-white mb-2">Add Guest</h3>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <Input
              label="First Name"
              value={newGuestRow.first_name}
              onChange={(e) => setNewGuestRow({ ...newGuestRow, first_name: e.target.value })}
            />
            <Input
              label="Last Name"
              value={newGuestRow.last_name}
              onChange={(e) => setNewGuestRow({ ...newGuestRow, last_name: e.target.value })}
            />
            <Input
              label="Email"
              value={newGuestRow.email}
              onChange={(e) => setNewGuestRow({ ...newGuestRow, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={newGuestRow.phone}
              onChange={(e) => setNewGuestRow({ ...newGuestRow, phone: e.target.value })}
            />
          </div>
          <Button onClick={handleAddGuestRow} leftIcon={<Plus size={16} />}>Add to Guestlist</Button>
        </div>

        {selectedGuests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Confirmed Guestlist</h3>
            {selectedGuests.map(guest => (
              <div key={guest.id} className="p-2 border border-gray-700 rounded mb-2 flex justify-between items-center">
                <span>{guest.first_name} {guest.last_name}</span>
                <select
                  onChange={(e) => handleAssignGuestOf(guest.id, e.target.value)}
                  className="ml-4 bg-background border border-gray-600 rounded px-2 py-1 text-white"
                >
                  <option value="">Select host</option>
                  {selectedGuests.map(host => (
                    <option key={host.id} value={host.id}>
                      {host.first_name} {host.last_name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <Button onClick={() => navigate('/reception/view-guestlists')} variant="secondary">
            View Guestlists
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Create Guestlist'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGuestlist;

