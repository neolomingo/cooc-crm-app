import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Member } from '../../lib/supabase';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PhotoCapture from '../../components/PhotoCapture';
import { ArrowLeft } from 'lucide-react';

const EditDetails: React.FC = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      if (!memberId) return;

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) {
        console.error('❌ Error fetching member:', error);
        return;
      }

      setMember(data);
      if (data.photo_url) {
        setPreviewUrl(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/members/${data.photo_url}`);
      }
    };

    fetchMember();
  }, [memberId]);

  const handlePhotoCapture = (blob: Blob) => {
    setPhotoBlob(blob);
    setPreviewUrl(URL.createObjectURL(blob));
  };

  const uploadPhoto = async (id: string): Promise<string | null> => {
    if (!photoBlob) return member?.photo_url || null;

    const fileExt = 'jpg';
    const fileName = `${id}-${Date.now()}.${fileExt}`;
    const filePath = `member-photos/${fileName}`;

    // Delete old photo if exists
    if (member?.photo_url) {
      const oldFilePath = member.photo_url;
      await supabase.storage.from('members').remove([oldFilePath]);
    }

    const { error: uploadError } = await supabase.storage
      .from('members')
      .upload(filePath, photoBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Photo upload failed:', uploadError);
      return null;
    }

    return filePath;
  };

  const handleSave = async () => {
    if (!member) return;
    setIsSaving(true);

    try {
      const photoPath = await uploadPhoto(member.id);

      const { error } = await supabase
        .from('members')
        .update({
          ...member,
          photo_url: photoPath || member.photo_url,
        })
        .eq('id', member.id);

      if (error) throw error;

      navigate(`/reception/member/${member.id}`, {
        state: { refresh: true },
      });
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!member) return <p className="p-6 text-gray-400">Loading member...</p>;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="text"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Member</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="card flex flex-col lg:flex-row overflow-hidden shadow-lg rounded-xl border border-gray-700 bg-background mb-6">
            <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-6">
              <PhotoCapture
                onPhotoCapture={handlePhotoCapture}
                existingPreview={previewUrl || undefined}
              />
            </div>
            <div className="w-full lg:w-1/2 p-8 flex flex-col justify-between space-y-4">
              <Input
                label="First Name"
                value={member.first_name}
                onChange={(e) =>
                  setMember({ ...member, first_name: e.target.value })
                }
              />
              <Input
                label="Last Name"
                value={member.last_name}
                onChange={(e) =>
                  setMember({ ...member, last_name: e.target.value })
                }
              />
              <Input
                label="Email"
                value={member.email || ''}
                onChange={(e) =>
                  setMember({ ...member, email: e.target.value })
                }
              />
              <Input
                label="Phone"
                value={member.phone || ''}
                onChange={(e) =>
                  setMember({ ...member, phone: e.target.value })
                }
              />
              <label className="block text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={member.mailing_list}
                  onChange={(e) =>
                    setMember({ ...member, mailing_list: e.target.checked })
                  }
                  className="mr-2"
                />
                Subscribed to mailing list
              </label>
              <Button
                className="mt-6"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDetails;


