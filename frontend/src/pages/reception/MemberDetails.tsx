import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash, Plus, RotateCw, FilePenLine, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { supabase, Member, Note } from '../../lib/supabase';
import { useMemberStore } from '../../lib/store';
import { formatDistanceToNow, format } from 'date-fns';

const MemberDetails: React.FC = () => {
  const navigate = useNavigate();
  const { selectedMember, selectMember } = useMemberStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Member | null>(selectedMember);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    if (selectedMember) {
      loadNotes();
    } else {
      navigate('/');
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

  const handleAddNote = async () => {
    if (!selectedMember || !newNote.trim()) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || 'system';
      const { data: newNoteData, error } = await supabase
        .from('notes')
        .insert({ member_id: selectedMember.id, content: newNote, created_by: userId })
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
      await supabase.from('check_ins').insert({
        member_id: selectedMember.id,
        check_in_time: now,
        checked_in_by: 'reception'
      });

      await supabase.from('daily_check_ins').insert({
        member_id: selectedMember.id,
        check_in_time: now,
        checked_in_by: 'reception'
      });

      const { data: updatedMember, error } = await supabase
        .from('members')
        .update({ last_visit: now })
        .eq('id', selectedMember.id)
        .select()
        .single();
      if (error) throw error;
      selectMember(updatedMember);
      setFormData(updatedMember);
    } catch (error) {
      console.error('Error checking in member:', error);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const lastVisitText = formData?.last_visit
    ? formatDistanceToNow(new Date(formData.last_visit), { addSuffix: true })
    : 'Never';

  if (!selectedMember || !formData) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="text" leftIcon={<ArrowLeft size={18} />} onClick={() => navigate('/')} className="mr-4">
            Back
          </Button>
          <h1 className="text-2xl font-bold">Member not found</h1>
        </div>
      </div>
    );
  }

  const imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/members/${formData.photo_url}`;
  console.log("Image URL:", imageUrl);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center mb-6">
        <Button variant="text" leftIcon={<ArrowLeft size={18} />} onClick={() => navigate('/')} className="mr-4">
          Back
        </Button>
        <h1 className="text-2xl font-bold">Member Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="card flex flex-col lg:flex-row overflow-hidden shadow-lg rounded-xl border border-gray-700 bg-background mb-6">
            <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-6">
              {formData.photo_url ? (
                <img
                  src={imageUrl}
                  alt="Member Photo"
                  className="w-full h-auto max-h-[400px] object-cover rounded-lg border border-gray-700"
                />
              ) : (
                <div className="w-full h-[400px] bg-background-elevated rounded-lg flex items-center justify-center text-6xl font-bold border border-gray-700 text-muted-foreground">
                  {formData.first_name[0]}{formData.last_name[0]}
                </div>
              )}
            </div>

            <div className="w-full lg:w-1/2 p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-semibold mb-2 text-white">
                  {formData.first_name} {formData.last_name}
                </h2>
                <span className={`text-sm px-3 py-1 rounded-full inline-block mb-4 ${formData.membership_status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {formData.membership_status}
                </span>

                <dl className="space-y-3 text-sm text-gray-300">
                  <div>
                    <dt className="font-medium text-gray-400">Email</dt>
                    <dd>{formData.email || '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-400">Phone</dt>
                    <dd>{formData.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-400">Mailing List</dt>
                    <dd>{formData.mailing_list ? 'Subscribed' : 'Not Subscribed'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-400">Last Visit</dt>
                    <dd>{lastVisitText}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-400">Notes</dt>
                    <dd>{formData.notes || 'No general notes'}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6">
                <Button leftIcon={<Edit size={16} />} onClick={() => setIsEditing(true)} className="w-full lg:w-auto">
                  Edit
                </Button>
              </div>
            </div>
          </div>

          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FilePenLine size={18} /> Staff Notes
              <button onClick={loadNotes} className="ml-auto text-sm text-muted hover:underline flex items-center gap-1">
                <RotateCw size={16} /> Refresh
              </button>
            </h2>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a note about this member..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
              />
              <Button leftIcon={<Plus size={16} />} onClick={handleAddNote}>Add Note</Button>
            </div>
            <div className="space-y-2">
              {notes.length === 0 ? (
                <p className="text-sm text-muted">No staff notes yet</p>
              ) : (
                notes.map((note, idx) => (
                  <div key={idx} className="text-sm p-2 bg-muted rounded">{note.content}</div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <Button
              variant="secondary"
              leftIcon={<Check size={16} />}
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              className="w-full mb-2"
            >
              {isCheckingIn ? 'Checking In...' : 'Checked In'}
            </Button>
            <Button
              leftIcon={<Edit size={16} />}
              onClick={() => setIsEditing(true)}
              className="w-full mb-2"
            >
              Edit Details
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash size={16} />}
              className="w-full"
            >
              Delete Member
            </Button>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Check-in History</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Today</span><span>{new Date().toLocaleTimeString()}</span></div>
              <div className="flex justify-between"><span>{format(new Date(), 'dd/MM/yyyy')}</span><span>{formData.last_visit ? format(new Date(formData.last_visit), 'HH:mm:ss') : '-'}</span></div>
            </div>
            <button className="mt-4 text-sm underline text-muted">View All History</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;




