-- Add missing columns to oracle_searches
ALTER TABLE public.oracle_searches ADD COLUMN IF NOT EXISTS btts_filter text;
ALTER TABLE public.oracle_searches ADD COLUMN IF NOT EXISTS double_chance_filter text;

-- Create a SECURITY DEFINER function to handle Oracle charges + transaction logging
CREATE OR REPLACE FUNCTION public.charge_oracle_search(p_user_id uuid, p_cost numeric DEFAULT 5)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance numeric;
BEGIN
  -- Get and check balance
  SELECT credit_balance INTO v_balance FROM public.profiles WHERE id = p_user_id;
  IF v_balance < p_cost THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct balance
  UPDATE public.profiles SET credit_balance = credit_balance - p_cost WHERE id = p_user_id;

  -- Create wallet transaction
  INSERT INTO public.wallet_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_cost, 'oracle', 'Oracle search fee');

  RETURN true;
END;
$$;