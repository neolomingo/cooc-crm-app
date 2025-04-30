import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash, Plus, RotateCw, Clock, FilePenLine, Check } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase, Member, Note } from '../lib/supabase';
import { useMemberStore } from '../lib/store';
import { formatDistanceToNow, format } from 'date-fns';

interface MemberDetailsProps {
  onNavigate: (page: string) => void;
}

const MemberDetails: React.FC<MemberDetailsProps> = ({ onNavigate }) => {
  const { selectedMember, selectMember } = useMemberStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Member | null>(selectedMember);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  
  React.useEffect(() => {
    if (selectedMember) {
      loadNotes();
    } else {
      onNavigate('home');
    }
  }, [selectedMember]);
  
  const loadNotes = async () => {
    if (!selectedMember) return;
    
    setIsLoadingNotes(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('member_id', selectedMember.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotes(data as Note[]);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: val
      };
    });
  };
  
  const handleSaveChanges = async () => {
    if (!formData || !selectedMember) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          membership_status: formData.membership_status,
          inactive_since: formData.membership_status === 'inactive' 
            ? formData.inactive_since || new Date().toISOString()
            : null,
          mailing_list: formData.mailing_list,
          notes: formData.notes,
        })
        .eq('id', selectedMember.id);
      
      if (error) throw error;
      
      // Refresh member data
      const { data: updatedMember, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('id', selectedMember.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      selectMember(updatedMember);
      setFormData(updatedMember);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating member:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!formData) return;
    
    const newStatus = e.target.value as 'active' | 'inactive';
    
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        membership_status: newStatus,
        inactive_since: newStatus === 'inactive' ? new Date().toISOString() : null,
      };
    });
  };
  
  const handleAddNote = async () => {
    if (!selectedMember || !newNote.trim()) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || 'system';
      
      const { data: newNoteData, error } = await supabase
        .from('notes')
        .insert({
          member_id: selectedMember.id,
          content: newNote,
          created_by: userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setNotes(prev => [newNoteData as Note, ...prev]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };
  
  const handleCheckIn = async () => {
    if (!selectedMember) return;
    
    setIsCheckingIn(true);
    try {
      const now = new Date().toISOString();
      
      // Create check-in record
      const { error: checkInError } = await supabase
        .from('check_ins')
        .insert({
          member_id: selectedMember.id,
          check_in_time: now,
        });
      
      if (checkInError) throw checkInError;
      
      // Update member's last visit
      const { data: updatedMember, error: updateError } = await supabase
        .from('members')
        .update({ last_visit: now })
        .eq('id', selectedMember.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      selectMember(updatedMember);
      setFormData(updatedMember);
    } catch (error) {
      console.error('Error checking in member:', error);
    } finally {
      setIsCheckingIn(false);
    }
  };
  
  if (!selectedMember || !formData) {
    return (
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
          <h1 className="text-2xl font-bold">Member not found</h1>
        </div>
      </div>
    );
  }
  
  const lastVisitText = formData.last_visit 
    ? formatDistanceToNow(new Date(formData.last_visit), { addSuffix: true }) 
    : 'Never';
  
  const isCheckedInToday = formData.last_visit
    ? new Date(formData.last_visit).toDateString() === new Date().toDateString()
    : false;
  
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="text"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => onNavigate('home')}
          className="mr-4"
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold">Member Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-background-elevated flex items-center justify-center text-xl font-bold">
                  {formData.first_name[0]}{formData.last_name[0]}
                </div>
                
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold">
                    {isEditing ? (
                      <div className="flex flex-col space-y-2">
                        <Input 
                          name="first_name" 
                          value={formData.first_name} 
                          onChange={handleChange}
                          placeholder="First Name"
                          className="w-full"
                        />
                        <Input 
                          name="last_name" 
                          value={formData.last_name} 
                          onChange={handleChange}
                          placeholder="Last Name"
                          className="w-full"
                        />
                      </div>
                    ) : (
                      `${formData.first_name} ${formData.last_name}`
                    )}
                  </h2>
                  
                  <div className="flex items-center mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      formData.membership_status === 'active' 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {formData.membership_status}
                    </span>
                    
                    {formData.membership_status === 'inactive' && formData.inactive_since && (
                      <span className="text-xs text-gray-400 ml-2">
                        Since {new Date(formData.inactive_since).toLocaleDateString()}
                      </span>
                    )}
                    
                    {isEditing && (
                      <select
                        value={formData.membership_status}
                        onChange={handleStatusChange}
                        className="ml-3 bg-background-elevated border border-gray-700 rounded text-sm px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={handleSaveChanges}
                      isLoading={isSaving}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(selectedMember);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit size={16} />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Contact Information</h3>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <Input
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <div>
                    <p className="text-white">{formData.email}</p>
                    <p className="text-white">{formData.phone}</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Preferences</h3>
                  
                  {isEditing ? (
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="mailing_list"
                        checked={formData.mailing_list}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-background-elevated"
                      />
                      <span className="ml-2 text-sm text-white">Mailing List</span>
                    </label>
                  ) : (
                    <p className="text-white">
                      {formData.mailing_list ? (
                        <span className="text-green-400">Subscribed to mailing list</span>
                      ) : (
                        <span className="text-gray-400">Not subscribed to mailing list</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Visit Information</h3>
                <div className="flex items-center mb-2">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>Last visit: {lastVisitText}</span>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Notes</h3>
                  
                  {isEditing ? (
                    <textarea
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleChange}
                      className="input-field min-h-[100px]"
                      placeholder="Add general notes about this member"
                    />
                  ) : (
                    <p className="text-white">
                      {formData.notes || <span className="text-gray-400">No general notes</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FilePenLine className="text-accent-red mr-2" size={20} />
                <h2 className="text-lg font-semibold">Staff Notes</h2>
              </div>
              
              <Button
                variant="text"
                size="sm"
                leftIcon={<RotateCw size={16} className={isLoadingNotes ? 'animate-spin' : ''} />}
                onClick={loadNotes}
                disabled={isLoadingNotes}
              >
                Refresh
              </Button>
            </div>
            
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="input-field min-h-[80px]"
                placeholder="Add a note about this member..."
              />
              <div className="flex justify-end mt-2">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={16} />}
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  Add Note
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {isLoadingNotes ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : notes.length > 0 ? (
                notes.map((note) => (
                  <div key={note.id} className="bg-background-elevated p-4 rounded-lg">
                    <p className="text-white">{note.content}</p>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>Staff</span>
                      <span>{format(new Date(note.created_at), 'PPp')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <p>No staff notes yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4">
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            
            <div className="space-y-3">
              <Button
                variant={isCheckedInToday ? "outline" : "accent"}
                leftIcon={isCheckedInToday ? <Check size={18} /> : <Clock size={18} />}
                fullWidth
                onClick={handleCheckIn}
                isLoading={isCheckingIn}
                disabled={isCheckedInToday}
              >
                {isCheckedInToday ? 'Checked In' : 'Check In'}
              </Button>
              
              <Button
                variant={isEditing ? 'primary' : 'outline'}
                leftIcon={<Edit size={18} />}
                fullWidth
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Editing...' : 'Edit Details'}
              </Button>
              
              <Button
                variant="danger"
                leftIcon={<Trash size={18} />}
                fullWidth
                disabled
              >
                Delete Member
              </Button>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Check-in History</h3>
            
            <div className="space-y-2">
              {/* This would be populated with real check-in data */}
              <div className="bg-background-elevated p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Today</span>
                  <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
              
              {formData.last_visit && (
                <div className="bg-background-elevated p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      {new Date(formData.last_visit).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(formData.last_visit).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="text-center py-4 text-sm text-gray-400">
                <Button
                  variant="text"
                  size="sm"
                  disabled
                >
                  View All History
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;