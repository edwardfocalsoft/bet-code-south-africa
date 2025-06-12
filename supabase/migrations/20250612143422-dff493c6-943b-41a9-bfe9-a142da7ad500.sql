
-- Fix the claim_daily_voucher function to properly handle timezone
CREATE OR REPLACE FUNCTION public.claim_daily_voucher(
  p_voucher_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_voucher RECORD;
  v_existing_claim UUID;
  v_drop_datetime TIMESTAMP WITH TIME ZONE;
  v_current_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current time
  v_current_time := now();
  
  -- Get voucher details
  SELECT * INTO v_voucher
  FROM public.daily_vouchers
  WHERE id = p_voucher_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Voucher not found or not active';
  END IF;
  
  -- Check if voucher drop time has passed (convert to UTC for comparison)
  v_drop_datetime := (v_voucher.drop_date + v_voucher.drop_time)::timestamp with time zone;
  
  IF v_current_time < v_drop_datetime THEN
    RAISE EXCEPTION 'Voucher drop time has not arrived yet';
  END IF;
  
  -- Check if voucher is already claimed
  SELECT id INTO v_existing_claim
  FROM public.voucher_claims
  WHERE voucher_id = p_voucher_id;
  
  IF FOUND THEN
    RAISE EXCEPTION 'Voucher has already been claimed';
  END IF;
  
  -- Check if user has already claimed a voucher today
  IF EXISTS (
    SELECT 1 FROM public.voucher_claims vc
    JOIN public.daily_vouchers dv ON vc.voucher_id = dv.id
    WHERE vc.user_id = p_user_id 
    AND dv.drop_date = v_voucher.drop_date
  ) THEN
    RAISE EXCEPTION 'You have already claimed a voucher today';
  END IF;
  
  -- Create the claim
  INSERT INTO public.voucher_claims (voucher_id, user_id)
  VALUES (p_voucher_id, p_user_id);
  
  -- Add credits to user account
  PERFORM public.add_credits(p_user_id, v_voucher.value);
  
  -- Create wallet transaction record
  INSERT INTO public.wallet_transactions (
    user_id,
    amount,
    type,
    description,
    reference_id
  ) VALUES (
    p_user_id,
    v_voucher.value,
    'voucher',
    'Daily voucher claim: ' || v_voucher.code,
    p_voucher_id
  );
  
  RETURN true;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
