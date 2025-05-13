import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Please connect to Supabase using the "Connect to Supabase" button in the top right corner.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Optional: throttle limit
    },
  },
});

// ---------- Type Definitions ----------

export type Member = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  membership_status: 'active' | 'inactive';
  inactive_since?: string | null;
  last_visit: string | null;
  notes: string | null;
  mailing_list: boolean;
  photo_url?: string | null;
};

export type Guest = {
  id: string;
  created_at: string;
  guestlist_id: string;
  member_id?: string | null;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  checked_in: boolean;
  checked_in_time?: string | null;
  mailing_list: boolean;
};

export type Guestlist = {
  id: string;
  created_at: string;
  date: string;
  name: string;
  notes?: string | null;
  status: 'active' | 'completed' | 'cancelled';
};

export type Note = {
  id: string;
  created_at: string;
  member_id: string;
  content: string;
  created_by: string;
};

export type CheckInRecord = {
  id: string;
  created_at: string;
  member_id: string;
  guestlist_id?: string | null;
  check_in_time: string;
  check_out_time?: string | null;
};
