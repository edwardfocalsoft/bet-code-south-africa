
-- Add bonus_credits column to profiles (non-withdrawable credits)
ALTER TABLE public.profiles ADD COLUMN bonus_credits numeric NOT NULL DEFAULT 0;

-- Create function for admin to add bonus credits
CREATE OR REPLACE FUNCTION public.add_bonus_credits(p_user_id uuid, p_amount numeric, p_admin_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  -- Verify caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can add bonus credits';
  END IF;

  -- Update bonus credits
  UPDATE public.profiles
  SET bonus_credits = bonus_credits + p_amount
  WHERE id = p_user_id
  RETURNING bonus_credits INTO new_balance;

  -- Log the transaction
  INSERT INTO public.wallet_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, 'bonus', 'Admin bonus credits (non-withdrawable)');

  RETURN new_balance;
END;
$$;

-- Update charge_oracle_search to use bonus_credits first
CREATE OR REPLACE FUNCTION public.charge_oracle_search(p_user_id uuid, p_cost numeric DEFAULT 5)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bonus numeric;
  v_balance numeric;
  v_total numeric;
  v_from_bonus numeric;
  v_from_balance numeric;
BEGIN
  -- Get balances
  SELECT credit_balance, bonus_credits INTO v_balance, v_bonus FROM public.profiles WHERE id = p_user_id;
  v_total := v_balance + v_bonus;
  
  IF v_total < p_cost THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct from bonus_credits first, then credit_balance
  IF v_bonus >= p_cost THEN
    v_from_bonus := p_cost;
    v_from_balance := 0;
  ELSE
    v_from_bonus := v_bonus;
    v_from_balance := p_cost - v_bonus;
  END IF;

  UPDATE public.profiles 
  SET bonus_credits = bonus_credits - v_from_bonus,
      credit_balance = credit_balance - v_from_balance
  WHERE id = p_user_id;

  -- Create wallet transaction
  INSERT INTO public.wallet_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_cost, 'oracle', 'Oracle search fee');

  RETURN true;
END;
$$;

-- Update purchase_ticket to use bonus_credits first for ticket purchases
CREATE OR REPLACE FUNCTION public.complete_ticket_purchase(p_purchase_id uuid, p_payment_id text, p_payment_data jsonb DEFAULT '{}'::jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_purchase RECORD;
  v_bonus numeric;
  v_from_bonus numeric;
  v_from_balance numeric;
BEGIN
  -- Get purchase details
  SELECT buyer_id, seller_id, price, payment_status 
  INTO v_purchase
  FROM purchases
  WHERE id = p_purchase_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF v_purchase.payment_status = 'completed' THEN
    RETURN true;
  END IF;
  
  -- Update purchase record
  UPDATE purchases
  SET payment_id = p_payment_id, payment_status = 'completed', payment_data = p_payment_data
  WHERE id = p_purchase_id;
  
  -- Get buyer's bonus credits
  SELECT bonus_credits INTO v_bonus FROM profiles WHERE id = v_purchase.buyer_id;
  
  -- Deduct from bonus first, then balance
  IF v_bonus >= v_purchase.price THEN
    v_from_bonus := v_purchase.price;
    v_from_balance := 0;
  ELSE
    v_from_bonus := v_bonus;
    v_from_balance := v_purchase.price - v_bonus;
  END IF;
  
  UPDATE profiles
  SET bonus_credits = bonus_credits - v_from_bonus,
      credit_balance = credit_balance - v_from_balance
  WHERE id = v_purchase.buyer_id;
  
  -- Add to seller's balance (always real credits)
  UPDATE profiles
  SET credit_balance = credit_balance + v_purchase.price
  WHERE id = v_purchase.seller_id;
  
  -- Create wallet transactions
  INSERT INTO wallet_transactions (user_id, amount, type, description, reference_id)
  VALUES (v_purchase.buyer_id, -v_purchase.price, 'purchase', 'Ticket purchase', p_purchase_id);
  
  INSERT INTO wallet_transactions (user_id, amount, type, description, reference_id)
  VALUES (v_purchase.seller_id, v_purchase.price, 'sale', 'Ticket sale', p_purchase_id);
  
  RETURN true;
END;
$$;
