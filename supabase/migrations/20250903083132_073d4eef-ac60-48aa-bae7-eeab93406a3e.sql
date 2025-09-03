-- Add image_url column to posts table to support image uploads
ALTER TABLE public.posts 
ADD COLUMN image_url text;