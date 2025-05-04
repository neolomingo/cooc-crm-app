import { supabase } from './supabase';

export async function signUpWithRole(email: string, password: string, role: 'admin' | 'manager' | 'reception') {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) throw error;

  const user = data.user;
  if (!user) throw new Error('User not returned from signUp');

  const { error: profileError } = await supabase.from('profiles').insert([
    {
      id: user.id,
      email,
      role,
    },
  ]);

  if (profileError) throw profileError;

  return user;
}
