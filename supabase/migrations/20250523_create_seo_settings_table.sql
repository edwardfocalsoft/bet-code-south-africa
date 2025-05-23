
-- Create the SEO settings table
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT NOT NULL DEFAULT 'BetCode South Africa',
  site_description TEXT NOT NULL DEFAULT 'The best betting tips and predictions in South Africa.',
  site_keywords TEXT NOT NULL DEFAULT 'betting, predictions, tips, bet codes, sports betting',
  default_og_image TEXT NOT NULL DEFAULT '/logo.png',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a security policy allowing only admins to edit
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to edit SEO settings" 
  ON public.seo_settings 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policy for public reads
CREATE POLICY "Allow public to view SEO settings" 
  ON public.seo_settings 
  FOR SELECT 
  USING (true);

-- Insert default values if none exist
INSERT INTO public.seo_settings (site_title, site_description, site_keywords, default_og_image)
SELECT 'BetCode South Africa', 'The best betting tips and predictions in South Africa.', 'betting, predictions, tips, bet codes, sports betting', '/logo.png'
WHERE NOT EXISTS (SELECT 1 FROM public.seo_settings);
