
ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS oracle_price_per_scan numeric NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS oracle_free_daily_limit integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS oracle_auto_pick_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS oracle_image_enabled boolean NOT NULL DEFAULT true;

-- Ensure a row exists
INSERT INTO public.system_settings (min_withdrawal_amount)
SELECT 1000
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

CREATE OR REPLACE FUNCTION public.get_oracle_daily_usage(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*), 0)::int
  FROM public.wallet_transactions
  WHERE user_id = p_user_id
    AND type = 'oracle'
    AND created_at >= (CURRENT_DATE AT TIME ZONE 'UTC');
$$;
