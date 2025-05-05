import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Logo from '../components/Logo';
import Input from '../components/Input';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';
import bcrypt from 'bcryptjs';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<'reception' | 'manager' | 'admin'>('reception');
  const [accessCode, setAccessCode] = useState('');

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if ((selectedRole === 'admin' || selectedRole === 'manager') && !accessCode) {
      setError('Access code is required for selected role');
      return;
    }

    if (selectedRole === 'admin' || selectedRole === 'manager') {
      const { data: codeEntry, error: codeError } = await supabase
        .from('access_codes')
        .select('code')
        .eq('role', selectedRole)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (codeError || !codeEntry) {
        setError('Failed to validate access code');
        return;
      }

      const isValid = await bcrypt.compare(accessCode, codeEntry.code);
      if (!isValid) {
        setError(`Invalid ${selectedRole} access code`);
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            role: selectedRole,
          });

        if (profileError) throw profileError;

        toast.success('Account created successfully! You can now log in.');

        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          setUser({
            id: user.id,
            email: user.email!,
            role: profileData?.role || 'reception',
          });
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      if (data?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        setUser({
          id: data.user.id,
          email: data.user.email!,
          role: profileData?.role || 'reception',
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            <Logo size="large" />
            <h1 className="text-2xl font-bold mt-4 mb-1">Reception Log In</h1>
            <p className="text-gray-400">Welcome back, please enter your credentials</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reception@cooc.com"
              fullWidth
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              fullWidth
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              autoComplete="current-password"
              required
            />

            <div className="flex flex-col space-y-3">
              <Button
                type="submit"
                variant="accent"
                fullWidth
                size="lg"
                isLoading={isLoading}
                rightIcon={<LogIn size={18} />}
              >
                Log In
              </Button>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Select Role</label>
                <select
                  className="bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white w-full"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                >
                  <option value="reception">Reception</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>

                {(selectedRole === 'manager' || selectedRole === 'admin') && (
                  <Input
                    label="Access Code"
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter code from admin"
                    fullWidth
                  />
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                fullWidth
                size="lg"
                onClick={handleSignUp}
                disabled={isLoading}
              >
                Create Account
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          © 2025 COOC Members Club. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
