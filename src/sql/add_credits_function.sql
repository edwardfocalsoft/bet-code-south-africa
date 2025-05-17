
-- Create function to add or subtract credits from a user's balance
CREATE OR REPLACE FUNCTION public.add_credits(user_id UUID, amount_to_add NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  -- Update the balance and return the new value
  UPDATE public.profiles
  SET credit_balance = credit_balance + amount_to_add
  WHERE id = user_id
  RETURNING credit_balance INTO new_balance;
  
  RETURN new_balance;
END;
$$;
