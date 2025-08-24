
-- Create table to track weekly rewards
CREATE TABLE public.weekly_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 3),
  amount NUMERIC NOT NULL,
  sales_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(week_start_date, seller_id)
);

-- Enable RLS
ALTER TABLE public.weekly_rewards ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own rewards
CREATE POLICY "Users can view their own weekly rewards"
  ON public.weekly_rewards
  FOR SELECT
  USING (auth.uid() = seller_id);

-- Policy for admins to view all rewards
CREATE POLICY "Admins can view all weekly rewards"
  ON public.weekly_rewards
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Policy for system to insert rewards (via edge function)
CREATE POLICY "System can insert weekly rewards"
  ON public.weekly_rewards
  FOR INSERT
  WITH CHECK (true);

-- Add index for efficient queries
CREATE INDEX idx_weekly_rewards_week_seller ON public.weekly_rewards(week_start_date, seller_id);
CREATE INDEX idx_weekly_rewards_seller_date ON public.weekly_rewards(seller_id, week_start_date DESC);
