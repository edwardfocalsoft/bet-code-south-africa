-- Enable required extensions for scheduled functions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a dedicated "System" seller profile for scraped codes
INSERT INTO public.profiles (
  id, 
  email, 
  role, 
  approved, 
  suspended, 
  username, 
  verified, 
  display_whatsapp, 
  credit_balance
)
VALUES (
  '7c8f7f3e-9d3e-4c68-9b3a-9b0c7f31c7a1',
  'system@code.local',
  'seller',
  true,
  false,
  'System',
  true,
  false,
  0
)
ON CONFLICT (id) DO NOTHING;

-- Schedule the scraping function to run every 10 minutes
SELECT cron.schedule(
  'scrape-betway-codes',
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://lvcbgoatolxgyuyuqyyr.supabase.co/functions/v1/scrape-convertbetcodes',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Y2Jnb2F0b2x4Z3l1eXVxeXlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjU1Mjc5OCwiZXhwIjoyMDYyMTI4Nzk4fQ.vxzCtMg8bFfzJSRYfQy6Hb7-vkLg9l8ZGJ89Q6CBZLM"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);