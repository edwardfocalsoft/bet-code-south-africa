
-- Create oracle search history table
CREATE TABLE public.oracle_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT,
  mode TEXT NOT NULL DEFAULT 'search',
  legs INTEGER,
  leagues TEXT[],
  goal_filter TEXT,
  corner_filter TEXT,
  safe_only BOOLEAN DEFAULT false,
  date_from TEXT,
  date_to TEXT,
  predictions JSONB,
  advice TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.oracle_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own searches"
ON public.oracle_searches FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own searches"
ON public.oracle_searches FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own searches"
ON public.oracle_searches FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_oracle_searches_user_id ON public.oracle_searches(user_id);
CREATE INDEX idx_oracle_searches_created_at ON public.oracle_searches(created_at DESC);
