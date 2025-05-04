CREATE TABLE access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  code TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
