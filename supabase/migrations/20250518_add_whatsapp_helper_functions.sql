
-- Function to check if WhatsApp fields exist
CREATE OR REPLACE FUNCTION public.check_whatsapp_fields_exist()
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  field_count integer;
BEGIN
  SELECT COUNT(*) INTO field_count
  FROM information_schema.columns
  WHERE table_name = 'profiles'
  AND column_name IN ('display_whatsapp', 'whatsapp_number');
  
  RETURN field_count = 2;
END;
$$;

-- Function to safely update WhatsApp fields if they exist
CREATE OR REPLACE FUNCTION public.update_whatsapp_fields(
  p_user_id uuid,
  p_display_whatsapp boolean,
  p_whatsapp_number text
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  fields_exist boolean;
BEGIN
  -- Check if the fields exist
  SELECT public.check_whatsapp_fields_exist() INTO fields_exist;
  
  -- Only update if fields exist
  IF fields_exist THEN
    UPDATE public.profiles
    SET 
      display_whatsapp = p_display_whatsapp,
      whatsapp_number = p_whatsapp_number
    WHERE id = p_user_id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;
