import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import Input from '../../components/Input';
import Button from '../../components/Button';

const EditProfile = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, role')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || '');
        setRole(data.role || '');
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq('id', user.id);

    setLoading(false);

    if (!error) {
      setSuccessMessage('Changes saved!');
      setTimeout(() => {
        navigate('/reception');
      }, 1500); // Navigate after 1.5 seconds
    } else {
      setSuccessMessage('Something went wrong. Try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

      <div className="space-y-4">
        <Input label="Email" value={email} disabled fullWidth />
        <Input label="Role" value={role} disabled fullWidth />
        <Input
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
        />
        <Input
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
        />

        <Button onClick={handleSave} isLoading={loading} fullWidth>
          Save Changes
        </Button>

        {successMessage && (
          <p className="text-sm mt-2 text-green-400 text-center">{successMessage}</p>
        )}
      </div>
    </div>
  );
};

export default EditProfile;


