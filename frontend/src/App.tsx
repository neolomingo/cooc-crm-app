import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Login from './pages/Login';

import ReceptionLayout from './layouts/ReceptionLayout';
import AdminLayout from './layouts/AdminLayout';
import ManagerLayout from './layouts/ManagerLayout';

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

import AdminHome from './pages/admin/AdminHome';
import ManagerHome from './pages/manager/ManagerHome';

import { useAuthStore } from './lib/store';
import { supabase } from './lib/supabase';

function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    console.log(`[RouteTracker] Current path: ${location.pathname}`);
  }, [location.pathname]);
  return null;
}

function App() {
  const { user, setUser, isLoading, setLoading } = useAuthStore();
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      console.log('[App] Checking Supabase...');
      try {
        setSupabaseInitialized(true);
      } catch (err) {
        console.error('[App] Supabase error:', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!supabaseInitialized) return;

    const checkUser = async () => {
      console.log('[App] Supabase ready. Checking auth...');
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;

        if (session?.user) {
          console.log('[App] User found in session:', session.user);
          const email = session.user.email;
          if (!email) throw new Error('User email is missing');

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError) throw profileError;

          setUser({
            id: session.user.id,
            email,
            role: profile?.role || 'reception',
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

  const logoutHandler = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!supabaseInitialized || isLoading) {
    return (
      <div style={{ color: 'white', textAlign: 'center', paddingTop: '40vh' }}>
        <p>Loading app...</p>
      </div>
    );
  }

  return (
    <>
      <RouteTracker />

      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={
                user.role === 'admin' ? <Navigate to="/admin/home" />
                : user.role === 'manager' ? <Navigate to="/manager/home" />
                : <Navigate to="/reception/home" />
              }
            />

            {user?.role === 'reception' && (
              <Route path="/reception" element={<ReceptionLayout onLogout={logoutHandler} />}>
                <Route index element={<ReceptionHome />} />
                <Route path="home" element={<ReceptionHome />} />
                <Route path="add-member" element={<AddMember />} />
                <Route path="add-walk-in" element={<AddWalkIn />} />
                <Route path="member-details" element={<MemberDetails />} />
                <Route path="create-guestlist" element={<CreateGuestlist />} />
                <Route path="search-member" element={<SearchMember />} />
                <Route path="edit-profile" element={<EditProfile />} />
                <Route path="daily-check-ins" element={<DailyCheckIns />} />
                <Route path="edit-member/:memberId" element={<EditDetails />} />
                <Route path="view-guestlists" element={<ViewGuestlists />} />
                <Route path="view-guestlist/:id" element={<ViewGuestlists />} />
                <Route path="*" element={<Navigate to="/reception/home" />} />
              </Route>
            )}

            {user?.role === 'manager' && (
              <Route path="/manager" element={<ManagerLayout onLogout={logoutHandler} />}>
                <Route path="home" element={<ManagerHome />} />
                <Route path="*" element={<Navigate to="/manager/home" />} />
              </Route>
            )}

            {user?.role === 'admin' && (
              <Route path="/admin" element={<AdminLayout onLogout={logoutHandler} />}>
                <Route path="home" element={<AdminHome />} />
                <Route path="*" element={<Navigate to="/admin/home" />} />
              </Route>
            )}
          </>
        )}
      </Routes>
    </>
  );
}

export default App;















