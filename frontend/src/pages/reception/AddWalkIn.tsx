import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Download, CheckCircle, Clock } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { supabase, Member } from '../../lib/supabase';
import { debounce } from '../../lib/utils';
import toast from 'react-hot-toast';

interface WalkIn {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mailing_list: boolean;
  friend_of?: string;
  created_at: string;
  checked_in?: boolean;
  friend_of_name?: string;
}

const AddWalkIn: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mailing_list: false,
    friend_of: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [walkIns, setWalkIns] = useState<WalkIn[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const fetchSuggestions = async (term: string) => {
    const { data, error } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
      .limit(10);
    if (!error) setSuggestions(data as Member[]);
  };

  const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), []);

  useEffect(() => {
    if (searchQuery.trim()) debouncedFetch(searchQuery);
    else setSuggestions([]);
  }, [searchQuery]);

  const handleSelectMember = (member: Member) => {
    setFormData(prev => ({ ...prev, friend_of: member.id }));
    setSearchQuery(`${member.first_name} ${member.last_name}`);
    setSuggestions([]);
  };

  const fetchWalkIns = async () => {
    const { data: walkData, error } = await supabase
      .from('walk_ins')
      .select('*, friend:friend_of (first_name, last_name)')
      .order('created_at', { ascending: false });

    if (!walkData || error) return;

    const { data: checkins } = await supabase
      .from('daily_check_ins')
      .select('walk_in_id');

    const checkedInIds = new Set((checkins || []).map(ci => ci.walk_in_id));

    const enriched = walkData.map(w => ({
      ...w,
      checked_in: checkedInIds.has(w.id),
      friend_of_name: w.friend ? `${w.friend.first_name} ${w.friend.last_name}` : '',
    }));

    setWalkIns(enriched);
  };

  useEffect(() => {
    fetchWalkIns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: walkIn, error: walkInError } = await supabase
        .from('walk_ins')
        .insert({
          ...formData,
          friend_of: formData.friend_of || null,
        })
        .select()
        .single();

      if (walkInError) throw walkInError;

      const { error: checkInError } = await supabase.from('daily_check_ins').insert({
        member_id: null,
        walk_in_id: walkIn.id,
        check_in_time: new Date().toISOString(),
        checked_in_by: 'reception',
      });

      if (checkInError) throw checkInError;

      toast.success('Walk-in added and checked in!');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        mailing_list: false,
        friend_of: '',
      });
      setSearchQuery('');
      fetchWalkIns();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add walk-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (walkIn: WalkIn) => {
    try {
      const { error } = await supabase.from('daily_check_ins').insert({
        member_id: null,
        walk_in_id: walkIn.id,
        check_in_time: new Date().toISOString(),
        checked_in_by: 'reception',
      });
      if (error) throw error;
      toast.success(`Checked in ${walkIn.first_name}`);
      fetchWalkIns();
    } catch (err) {
      console.error('Check-in error:', err);
      toast.error('Failed to check in.');
    }
  };

  const exportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Mailing List'];
    const rows = walkIns.map(w => [
      w.first_name,
      w.last_name,
      w.email || '',
      w.phone || '',
      w.mailing_list ? 'Yes' : 'No',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'walkins.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const paginated = walkIns.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(walkIns.length / perPage);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Button
        variant="text"
        leftIcon={<ArrowLeft size={18} />}
        onClick={() => window.history.back()}
        className="mb-4"
      >
        Back
      </Button>

      <h1 className="text-2xl font-bold mb-6">Add Walk-In</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required />
        <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
        <Input label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
        <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />

        <div>
          <label className="block text-sm font-medium text-white mb-1">Friend Of</label>
          <Input
            placeholder="Search member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />
          {suggestions.length > 0 && (
            <div className="border rounded mt-1 bg-background-elevated">
              {suggestions.map(member => (
                <div
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="p-2 hover:bg-gray-800 cursor-pointer"
                >
                  {member.first_name} {member.last_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" name="mailing_list" checked={formData.mailing_list} onChange={handleChange} />
          Join Mailing List
        </label>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Add Walk-In'}
        </Button>
      </form>

      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">All Walk-Ins</h2>
          <Button onClick={exportCSV} leftIcon={<Download size={16} />} variant="secondary" size="sm">
            Download CSV
          </Button>
        </div>

        <div className="space-y-2">
          {paginated.map(w => (
            <div key={w.id} className="p-3 bg-background-elevated rounded flex justify-between items-center">
              <div>
                <p className="text-white font-medium">
                  {w.first_name} {w.last_name}{' '}
                  {w.friend_of_name && (
                    <span className="text-sm text-gray-400">• Friend of {w.friend_of_name}</span>
                  )}
                </p>
                <p className="text-sm text-muted">{w.email || '-'} | {w.phone || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                {w.checked_in ? (
                  <span className="text-green-400 flex items-center text-sm"><CheckCircle size={16} className="mr-1" /> Checked In</span>
                ) : (
                  <Button size="sm" onClick={() => handleCheckIn(w)}>
                    <Clock size={14} className="mr-1" /> Check In
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? 'bg-accent-red text-white' : 'bg-gray-700 text-gray-300'
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddWalkIn;






