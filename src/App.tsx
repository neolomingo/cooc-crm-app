import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useAuthStore } from './lib/store';
import { supabase } from './lib/supabase';

function App() {
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);
  
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        // Test Supabase connection
        const { data, error } = await supabase.from('profiles').select('count');
        if (error) throw error;
        setSupabaseInitialized(true);
      } catch (error) {
        console.error('Supabase connection error:', error);
        return;
      }
    };

    checkSupabase();
  }, []);

  useEffect(() => {
    if (!supabaseInitialized) return;

    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          // Fetch user role from profiles
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          setUser({
            id: data.session.user.id,
            email: data.session.user.email as string,
            role: profileData?.role || 'reception',
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user role
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          
          setUser({
            id: session.user.id,
            email: session.user.email as string,
            role: profileData?.role || 'reception',
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabaseInitialized]);
  
  const handleLogout = async () => {
    try {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If we have a session, attempt to sign out
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error during sign out:', error);
          return;
        }
      }
      
      // Only clear the local user state after successful sign out or if there was no session
      setUser(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };
  
  if (!supabaseInitialized) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Connecting to database...</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#2d2d2d',
            color: '#fff',
            border: '1px solid #3a3a3a',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      
      <div className="ipad-container">
        {user ? <Dashboard onLogout={handleLogout} /> : <Login />}
      </div>
    </div>
  );
}

export default App;