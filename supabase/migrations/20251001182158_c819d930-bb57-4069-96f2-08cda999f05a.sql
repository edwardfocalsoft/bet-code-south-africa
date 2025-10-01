-- Create function to award loyalty points (BC points) on purchase completion
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award 1 BC point to the buyer for each completed purchase
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    UPDATE public.profiles
    SET loyalty_points = COALESCE(loyalty_points, 0) + 1
    WHERE id = NEW.buyer_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to award loyalty points when purchase is completed
DROP TRIGGER IF EXISTS award_loyalty_points_on_purchase ON public.purchases;
CREATE TRIGGER award_loyalty_points_on_purchase
AFTER UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.award_loyalty_points();

-- Create function to claim BC points as cash
CREATE OR REPLACE FUNCTION public.claim_bc_points(p_user_id UUID, p_points_to_claim INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_points INTEGER;
  v_cash_amount NUMERIC;
  v_user_role user_role;
BEGIN
  -- Check if user is a buyer (Punter)
  SELECT role, loyalty_points INTO v_user_role, v_current_points
  FROM public.profiles
  WHERE id = p_user_id;
  
  IF v_user_role != 'buyer' THEN
    RAISE EXCEPTION 'Only Punters can claim BC points';
  END IF;
  
  -- Check minimum requirement (2500 BC points)
  IF p_points_to_claim < 2500 THEN
    RAISE EXCEPTION 'Minimum claim amount is 2500 BC points';
  END IF;
  
  -- Check if user has enough points
  IF v_current_points < p_points_to_claim THEN
    RAISE EXCEPTION 'Insufficient BC points';
  END IF;
  
  -- Calculate cash amount (1 BC point = R0.20)
  v_cash_amount := p_points_to_claim * 0.20;
  
  -- Deduct BC points
  UPDATE public.profiles
  SET loyalty_points = loyalty_points - p_points_to_claim
  WHERE id = p_user_id;
  
  -- Add cash to balance
  UPDATE public.profiles
  SET credit_balance = credit_balance + v_cash_amount
  WHERE id = p_user_id;
  
  -- Create wallet transaction record
  INSERT INTO public.wallet_transactions (
    user_id,
    amount,
    type,
    description
  ) VALUES (
    p_user_id,
    v_cash_amount,
    'bonus',
    'BC Points claimed: ' || p_points_to_claim || ' points converted to R' || v_cash_amount
  );
  
  RETURN TRUE;
END;
$$;