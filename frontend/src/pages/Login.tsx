import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Logo from '../components/Logo';
import Input from '../components/Input';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Create the auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) throw signUpError;
      
      if (authData.user) {
        // Wait for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create the profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            role: 'reception',
          });
        
        if (profileError) throw profileError;
        
        toast.success('Account created successfully! You can now log in.');
        
        // Auto login after signup
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        
        if (user) {
          // Fetch user role from profiles
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          
          setUser({
            id: user.id,
            email: user.email as string,
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
      
      if (loginError) {
        throw loginError;
      }
      
      if (data?.user) {
        // Fetch user role from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (profileError) {
          throw profileError;
        }
        
        setUser({
          id: data.user.id,
          email: data.user.email as string,
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
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
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
              
              <Button
                type="button"
                variant="outline"
                fullWidth
                size="lg"
                onClick={handleSignUp}
                disabled={isLoading}
              >
                Create Reception Account
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