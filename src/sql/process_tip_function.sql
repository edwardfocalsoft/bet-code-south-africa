
-- Create function to process tip transactions
CREATE OR REPLACE FUNCTION public.process_tip(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_amount NUMERIC
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sender_balance NUMERIC;
BEGIN
  -- Get sender's balance
  SELECT credit_balance INTO v_sender_balance
  FROM profiles
  WHERE id = p_sender_id;
  
  -- Check if sender has enough balance
  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance to send tip';
    RETURN FALSE;
  END IF;
  
  -- Deduct from sender balance
  UPDATE profiles
  SET credit_balance = credit_balance - p_amount
  WHERE id = p_sender_id;
  
  -- Add to receiver balance
  UPDATE profiles
  SET credit_balance = credit_balance + p_amount
  WHERE id = p_receiver_id;
  
  -- Create transaction record for sender
  INSERT INTO wallet_transactions (
    user_id,
    amount,
    type,
    description
  ) VALUES (
    p_sender_id,
    -p_amount,
    'tip',
    'Tip sent to seller'
  );
  
  -- Create transaction record for receiver
  INSERT INTO wallet_transactions (
    user_id,
    amount,
    type,
    description
  ) VALUES (
    p_receiver_id,
    p_amount,
    'tip',
    'Tip received from buyer'
  );
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in process_tip: %', SQLERRM;
    RETURN FALSE;
END;
$$;
