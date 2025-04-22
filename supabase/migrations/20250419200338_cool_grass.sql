/*
  # Initial schema for COOC Members Club Management System

  1. Tables
    - `profiles` - User profiles for reception staff
    - `members` - Club members
    - `guestlists` - Guestlists by date
    - `guests` - Guests on guestlists (can be linked to members)
    - `check_ins` - Member check-in records
    - `notes` - Notes about members

  2. Security
    - Row level security enabled on all tables
    - Policies for authenticated users
*/

-- Profiles for reception staff
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'reception' CHECK (role IN ('reception', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles" 
  ON profiles
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can update their own profiles" 
  ON profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Members
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  membership_status TEXT NOT NULL DEFAULT 'active' CHECK (membership_status IN ('active', 'inactive')),
  inactive_since TIMESTAMPTZ,
  last_visit TIMESTAMPTZ,
  notes TEXT,
  mailing_list BOOLEAN DEFAULT false
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read members" 
  ON members 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert members" 
  ON members 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update members" 
  ON members 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Guestlists
CREATE TABLE IF NOT EXISTS guestlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'))
);

ALTER TABLE guestlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read guestlists" 
  ON guestlists 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert guestlists" 
  ON guestlists 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update guestlists" 
  ON guestlists 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Guests
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  guestlist_id UUID NOT NULL REFERENCES guestlists(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_in_time TIMESTAMPTZ,
  mailing_list BOOLEAN DEFAULT false
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read guests" 
  ON guests 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert guests" 
  ON guests 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update guests" 
  ON guests 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Check-ins
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  guestlist_id UUID REFERENCES guestlists(id) ON DELETE SET NULL,
  check_in_time TIMESTAMPTZ NOT NULL,
  check_out_time TIMESTAMPTZ
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read check_ins" 
  ON check_ins 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert check_ins" 
  ON check_ins 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update check_ins" 
  ON check_ins 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read notes" 
  ON notes 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert notes" 
  ON notes 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS members_email_idx ON members (email);
CREATE INDEX IF NOT EXISTS members_last_name_idx ON members (last_name);
CREATE INDEX IF NOT EXISTS guestlists_date_idx ON guestlists (date);
CREATE INDEX IF NOT EXISTS guests_guestlist_id_idx ON guests (guestlist_id);
CREATE INDEX IF NOT EXISTS guests_member_id_idx ON guests (member_id);
CREATE INDEX IF NOT EXISTS check_ins_member_id_idx ON check_ins (member_id);
CREATE INDEX IF NOT EXISTS notes_member_id_idx ON notes (member_id);