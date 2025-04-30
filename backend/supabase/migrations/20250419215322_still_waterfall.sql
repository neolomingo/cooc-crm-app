/*
  # Add member photos support

  1. Changes
    - Add photo_url column to members table
    - Create storage bucket for member photos

  2. Security
    - Enable RLS on storage bucket
    - Add policy for authenticated users to read/write photos
*/

-- Add photo_url column to members table
ALTER TABLE members
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create storage bucket for member photos
INSERT INTO storage.buckets (id, name)
VALUES ('members', 'members')
ON CONFLICT DO NOTHING;

-- Enable RLS on storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read member photos
CREATE POLICY "Authenticated users can read member photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'members');

-- Allow authenticated users to upload member photos
CREATE POLICY "Authenticated users can upload member photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'members');