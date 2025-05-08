import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ReceptionLayout from './layouts/ReceptionLayout';
import ReceptionHome from './pages/reception/ReceptionHome';
import AddMember from './pages/reception/AddMember';
import AddWalkIn from './pages/reception/AddWalkIn';
import MemberDetails from './pages/reception/MemberDetails';
import CreateGuestlist from './pages/reception/CreateGuestlist';
import SearchMember from './pages/reception/SearchMember';

import { useAuthStore } from './lib/store';
import { supabase } from './lib/supabase';

function App() {
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      console.log('[App] Checking Supabase...');
      try {
        setSupabaseInitialized(true); // Assume working connection for now
      } catch (err) {
        console.error('[App] Supabase error:', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!supabaseInitialized) return;

    console.log('[App] Supabase ready. Checking auth...');
    const checkUser = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (session?.user) {
          console.log('[App] User found in session:', session.user);
          const email = session.user.email;
          if (!email) throw new Error('User email is missing');

          setUser({
            id: session.user.id,
            email,
            role: 'reception', // or pull this from Supabase `profiles` if you want
          });
        } else {
          console.log('[App] No session user');
        }
      } catch (err) {
        console.error('[App] Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [supabaseInitialized]);

  if (!supabaseInitialized || isLoading) {
    console.log('[App] Still loading...');
    return (
      <div style={{ color: 'white', textAlign: 'center', paddingTop: '40vh' }}>
        <p>Loading app...</p>
      </div>
    );
  }

  return (
    <Routes>
      {!user ? (
        <Route path="*" element={<Login />} />
      ) : (
        <Route path="/reception" element={<ReceptionLayout onLogout={() => setUser(null)} />}>
          <Route index element={<ReceptionHome />} />
          <Route path="home" element={<ReceptionHome />} />
          <Route path="add-member" element={<AddMember />} />
          <Route path="add-walk-in" element={<AddWalkIn />} />
          <Route path="member-details" element={<MemberDetails />} />
          <Route path="create-guestlist" element={<CreateGuestlist />} />
          <Route path="search-member" element={<SearchMember />} />
          <Route path="*" element={<Navigate to="/reception" />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;










