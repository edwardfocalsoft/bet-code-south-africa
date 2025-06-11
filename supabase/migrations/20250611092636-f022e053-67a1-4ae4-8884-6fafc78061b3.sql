
-- Create daily_vouchers table
CREATE TABLE public.daily_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  value NUMERIC NOT NULL,
  drop_date DATE NOT NULL,
  drop_time TIME NOT NULL DEFAULT '12:00:00',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create voucher_claims table
CREATE TABLE public.voucher_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id UUID NOT NULL REFERENCES public.daily_vouchers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(voucher_id), -- Each voucher can only be claimed once
  UNIQUE(user_id, voucher_id) -- Prevent duplicate claims by same user
);

-- Enable RLS on daily_vouchers
ALTER TABLE public.daily_vouchers ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active vouchers
CREATE POLICY "Anyone can view active vouchers" 
  ON public.daily_vouchers 
  FOR SELECT 
  USING (is_active = true);

-- Policy: Only admins can create vouchers
CREATE POLICY "Admins can create vouchers" 
  ON public.daily_vouchers 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can update vouchers
CREATE POLICY "Admins can update vouchers" 
  ON public.daily_vouchers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable RLS on voucher_claims
ALTER TABLE public.voucher_claims ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all claims (to see which vouchers are taken)
CREATE POLICY "Users can view all claims" 
  ON public.voucher_claims 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create claims
CREATE POLICY "Users can create claims" 
  ON public.voucher_claims 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to claim voucher and add credits
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
  
  -- Check if voucher drop time has passed (using current timezone)
  v_drop_datetime := (v_voucher.drop_date + v_voucher.drop_time) AT TIME ZONE current_setting('timezone');
  
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
