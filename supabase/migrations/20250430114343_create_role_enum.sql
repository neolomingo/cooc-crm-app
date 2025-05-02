-- Up migration
BEGIN;

-- 1. First identify and drop dependent objects
-- Drop policy that might reference the column
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- 2. Create the ENUM type
CREATE TYPE role_type AS ENUM ('reception', 'manager', 'admin');

-- 3. Add new enum column (temporary name)
ALTER TABLE profiles
ADD COLUMN role_new role_type NOT NULL DEFAULT 'reception';

-- 4. Copy data with explicit casting
UPDATE profiles SET
role_new = CASE
  WHEN role = 'reception' THEN 'reception'::role_type
  WHEN role = 'manager' THEN 'manager'::role_type
  WHEN role = 'admin' THEN 'admin'::role_type
  ELSE 'reception'::role_type
END;

-- 5. Drop old column (after ensuring no dependencies)
ALTER TABLE profiles
DROP COLUMN role;

-- 6. Rename new column
ALTER TABLE profiles
RENAME COLUMN role_new TO role;

-- 7. Recreate policy with proper enum comparison
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  (auth.uid() = id) AND
  CASE
    WHEN role = 'admin'::role_type THEN EXISTS (
      SELECT 1 FROM profiles AS p2
      WHERE p2.id = auth.uid() AND p2.role = 'admin'::role_type
    )
    ELSE true
  END
);

COMMIT;

