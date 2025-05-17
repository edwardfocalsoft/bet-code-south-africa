
-- Create profiles bucket for avatar storage if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'profiles', 'profiles', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profiles'
);

-- Allow public access to profiles bucket
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profiles');

-- Allow authenticated users to upload to profiles bucket
CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'profiles' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars" 
ON storage.objects 
FOR UPDATE 
USING (
    bucket_id = 'profiles' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars" 
ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'profiles' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
);
