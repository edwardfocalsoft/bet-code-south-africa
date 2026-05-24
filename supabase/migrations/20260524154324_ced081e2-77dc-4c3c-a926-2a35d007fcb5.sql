
-- 1) Purchases: remove public read
DROP POLICY IF EXISTS "Public can view ticket counts" ON public.purchases;

-- 2) Notifications: enforce ownership on INSERT
DROP POLICY IF EXISTS "Anyone can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3) Weekly rewards: drop public INSERT (edge functions use service role and bypass RLS)
DROP POLICY IF EXISTS "System can insert weekly rewards" ON public.weekly_rewards;

-- 4) Subscriptions: drop public visibility
DROP POLICY IF EXISTS "Public can view subscriptions" ON public.subscriptions;

-- 5) Voucher claims: restrict SELECT to owner (admins still covered via is_admin elsewhere if needed)
DROP POLICY IF EXISTS "Users can view all claims" ON public.voucher_claims;
CREATE POLICY "Users can view their own claims"
  ON public.voucher_claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 6) Profiles: restrict sensitive PII columns from anon users
-- Public/anon can still see non-sensitive columns; sensitive columns require auth (and own/admin checks at app level)
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, username, avatar_url, role, verified, created_at, updated_at, display_whatsapp, loyalty_points, approved, suspended)
  ON public.profiles TO anon;

-- 7) System ads storage bucket: restrict uploads to admins
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Only admins can upload to system-ads"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'system-ads' AND public.is_admin());
CREATE POLICY "Only admins can update system-ads objects"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'system-ads' AND public.is_admin());
CREATE POLICY "Only admins can delete system-ads objects"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'system-ads' AND public.is_admin());

-- 8) seo_settings: fix policy using JWT role (always evaluates false) - use is_admin()
DROP POLICY IF EXISTS "Allow admins to edit SEO settings" ON public.seo_settings;
CREATE POLICY "Admins can edit SEO settings"
  ON public.seo_settings FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9) Fix mutable search_path on existing functions
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.award_loyalty_points() SET search_path = public;
ALTER FUNCTION public.add_credits(uuid, numeric) SET search_path = public;
ALTER FUNCTION public.add_bonus_credits(uuid, numeric, uuid) SET search_path = public;
ALTER FUNCTION public.charge_oracle_search(uuid, numeric) SET search_path = public;
ALTER FUNCTION public.claim_bc_points(uuid, integer) SET search_path = public;
ALTER FUNCTION public.claim_daily_voucher(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.complete_ticket_purchase(uuid, text, jsonb) SET search_path = public;
ALTER FUNCTION public.complete_wallet_transaction(uuid, text, jsonb) SET search_path = public;
ALTER FUNCTION public.create_wallet_top_up(numeric, text, uuid) SET search_path = public;
ALTER FUNCTION public.generate_case_number() SET search_path = public;
ALTER FUNCTION public.get_public_leaderboard(timestamptz, timestamptz, integer) SET search_path = public;
ALTER FUNCTION public.get_public_seller_stats(uuid) SET search_path = public;
ALTER FUNCTION public.get_seller_leaderboard(timestamptz, timestamptz) SET search_path = public;
ALTER FUNCTION public.get_seller_leaderboard(timestamptz, timestamptz, integer) SET search_path = public;
ALTER FUNCTION public.process_tip(uuid, uuid, numeric) SET search_path = public;
ALTER FUNCTION public.purchase_ticket(uuid, uuid) SET search_path = public;
