import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus, CalendarClock } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PhotoCapture from '../../components/PhotoCapture';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const AddMember: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
    membership_status: 'active',
    mailing_list: false,
    add_to_guestlist: false,
    guestlist_date: new Date().toISOString().split('T')[0],
  });

  const [memberPhoto, setMemberPhoto] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handlePhotoCapture = (photoBlob: Blob) => {
    setMemberPhoto(photoBlob);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const memberData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
        membership_status: formData.membership_status,
        last_visit: new Date().toISOString(),
        mailing_list: formData.mailing_list,
      };

      const { data: newMember, error: memberError } = await supabase
        .from('members')
        .insert(memberData)
        .select()
        .single();

      if (memberError) throw memberError;

      if (memberPhoto && newMember) {
        const photoPath = `member-photos/${newMember.id}.jpg`;

        await supabase.storage.from('members').remove([photoPath]);

        const { error: uploadError } = await supabase.storage
          .from('members')
          .upload(photoPath, memberPhoto, {
            contentType: memberPhoto.type || 'image/jpeg',
          });

        if (uploadError) throw uploadError;

        await supabase
          .from('members')
          .update({ photo_url: photoPath })
          .eq('id', newMember.id);
      }

      if (formData.add_to_guestlist && newMember) {
        const { data: existingGuestlist, error: guestlistFetchError } = await supabase
          .from('guestlists')
          .select('*')
          .eq('date', formData.guestlist_date)
          .eq('status', 'active')
          .maybeSingle();

        if (guestlistFetchError) throw guestlistFetchError;

        let guestlistId: string;

        if (existingGuestlist) {
          guestlistId = existingGuestlist.id;
        } else {
          const { data: newGuestlist, error: guestlistCreateError } = await supabase
            .from('guestlists')
            .insert({
              date: formData.guestlist_date,
              name: `Guestlist for ${new Date(formData.guestlist_date).toLocaleDateString()}`,
              status: 'active',
            })
            .select()
            .single();

          if (guestlistCreateError) throw guestlistCreateError;
          guestlistId = newGuestlist.id;
        }

        const { error: guestError } = await supabase
          .from('guests')
          .insert({
            guestlist_id: guestlistId,
            member_id: newMember.id,
            first_name: newMember.first_name,
            last_name: newMember.last_name,
            email: newMember.email,
            phone: newMember.phone,
            checked_in: false,
            mailing_list: newMember.mailing_list,
          });

        if (guestError) throw guestError;
      }

      // ✅ Show success toast
      toast.success('✅ Member added successfully!');

      // ✅ Reset form after success
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        notes: '',
        membership_status: 'active',
        mailing_list: false,
        add_to_guestlist: false,
        guestlist_date: new Date().toISOString().split('T')[0],
      });
      setMemberPhoto(null);

    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="text"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/')}
            className="mr-4"
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold">Add New Member</h1>
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
                <UserPlus className="text-white" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Personal Information</h2>
            </div>

            <div className="mb-6">
              <PhotoCapture onPhotoCapture={handlePhotoCapture} />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Or upload a photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setMemberPhoto(file);
                    }
                  }}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-accent-pink file:text-white hover:file:opacity-90"
                />
              </div>

              {memberPhoto && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(memberPhoto)}
                    alt="Member Preview"
                    className="rounded-lg w-32 h-32 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} required />
              <Input label="Last Name *" name="last_name" value={formData.last_name} onChange={handleChange} required />
              <Input label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <Input label="Phone *" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field min-h-[80px]"
                placeholder="Optional notes about the member..."
              />
            </div>

            <div className="flex items-center mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="mailing_list"
                  checked={formData.mailing_list}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-background-elevated"
                />
                <span className="ml-2 text-sm text-gray-300">Add to mailing list for promotions and offers</span>
              </label>
            </div>
          </div>

          <div className="card mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-accent-red to-accent-pink rounded-lg p-2 mr-2">
                <CalendarClock className="text-white" size={20} />
              </div>
              <h2 className="text-lg font-semibold">Guestlist Options</h2>
            </div>

            <div className="mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="add_to_guestlist"
                  checked={formData.add_to_guestlist}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-background-elevated"
                />
                <span className="ml-2 text-sm text-gray-300">Add to guestlist</span>
              </label>
            </div>

            {formData.add_to_guestlist && (
              <div className="mb-4">
                <Input
                  label="Guestlist Date *"
                  name="guestlist_date"
                  type="date"
                  value={formData.guestlist_date}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 left-[300px] right-0 p-6 bg-background-card border-t border-gray-800">
        <div className="max-w-3xl mx-auto flex gap-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            leftIcon={<Save size={18} />}
            className="flex-1 bg-gradient-to-r from-accent-red to-accent-pink hover:opacity-90"
            onClick={handleSubmit}
          >
            Save Member
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate('/')}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddMember;



