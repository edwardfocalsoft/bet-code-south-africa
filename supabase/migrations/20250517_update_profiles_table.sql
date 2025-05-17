
-- Add WhatsApp fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS display_whatsapp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
