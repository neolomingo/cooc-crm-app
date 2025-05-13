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
import EditProfile from './pages/reception/EditProfile';
import DailyCheckIns from './pages/DailyCheckIns';
import EditDetails from './pages/reception/EditDetails';
import ViewGuestlists from './pages/reception/ViewGuestlists'; 


import { useAuthStore } from './lib/store';
import { supabase } from './lib/supabase';

function App() {
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      console.log('[App] Checking Supabase...');
      try {
        // Simulate or test connection if needed
        setSupabaseInitialized(true);
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
            role: 'reception', // You can fetch real role from Supabase if needed
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

  // Auto logout when window/tab is closed
  useEffect(() => {
    const handleUnload = async () => {
      try {
        await supabase.auth.signOut();
        setUser(null);
      } catch (err) {
        console.error('[App] Error signing out on unload:', err);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [setUser]);

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
        <>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Navigate to="/reception" />} />
          <Route path="/reception" element={<ReceptionLayout onLogout={async () => {
            await supabase.auth.signOut();
            setUser(null);
          }} />}>
            <Route index element={<ReceptionHome />} />
            <Route path="home" element={<ReceptionHome />} />
            <Route path="add-member" element={<AddMember />} />
            <Route path="add-walk-in" element={<AddWalkIn />} />
            <Route path="member-details" element={<MemberDetails />} />
            <Route path="create-guestlist" element={<CreateGuestlist />} />
            <Route path="search-member" element={<SearchMember />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="daily-check-ins" element={<DailyCheckIns />} />
            <Route path="/reception/edit-member/:memberId" element={<EditDetails />} />
            <Route path="/reception/view-guestlists" element={<ViewGuestlists />} />
            <Route path="/reception/view-guestlist/:id" element={<ViewGuestlists />} />
            <Route path="*" element={<Navigate to="/reception" />} />
          </Route>
        </>
      )}
    </Routes>
  );
}

export default App;












