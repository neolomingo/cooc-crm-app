/*
  # Fix profiles table RLS policies

  1. Changes
    - Add RLS policy to allow users to create their own profile
    - Add RLS policy to allow users to update their own profile
    - Add RLS policy to allow users to read all profiles

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users to:
      - Create their own profile
      - Update their own profile
      - Read all profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;

-- Create new policies
CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = id AND
  auth.email() = email
);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  (
    CASE 
      WHEN role = 'admin' THEN 
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role = 'admin'
        )
      ELSE true
    END
  )
);

CREATE POLICY "Users can read all profiles"
ON profiles FOR SELECT TO authenticated
USING (true);