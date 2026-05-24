## Goal

Reintroduce Oracle pricing with admin control: free daily quota, pay-per-use after, ability to disable Auto Pick mode, and admin-configurable price.

## Database changes (migration)

Add Oracle config columns to `system_settings`:
- `oracle_price_per_scan` numeric, default 5
- `oracle_free_daily_limit` integer, default 3
- `oracle_auto_pick_enabled` boolean, default false (disabled for now)
- `oracle_image_enabled` boolean, default true

Update `charge_oracle_search` RPC to accept a dynamic cost (already does via `p_cost` param).

(Optional, recommended) Add a helper RPC `get_oracle_daily_usage(p_user_id uuid)` returning the count of today's `oracle` type rows in `wallet_transactions` for that user, so we can compute "free uses remaining today" reliably server-side.

## Frontend: `src/pages/Oracle.tsx`

1. Fetch Oracle settings (`oracle_price_per_scan`, `oracle_free_daily_limit`, `oracle_auto_pick_enabled`, `oracle_image_enabled`) on mount.
2. Fetch today's Oracle usage count (predictions used today) for the logged-in user.
3. Compute `isFree = usedToday < freeDailyLimit`. Cost shown per scan = `0` if free, else `oracle_price_per_scan`.
4. Replace hardcoded `AUTO_PICK_COST` / `IMAGE_COST` constants with these dynamic values.
5. `chargeUser` updated: if `isFree`, skip RPC and just award loyalty point; otherwise call `charge_oracle_search` RPC with the admin-configured price. Show "insufficient balance" toast with link to wallet top-up if needed.
6. Tab badges: show "Free" while under quota, otherwise "R{price}". Show small helper text under tabs: `"{remaining}/{limit} free scans today — additional R{price} each"`.
7. Hide the **Auto Pick** tab entirely when `oracle_auto_pick_enabled = false`. Default tab becomes `"image"`. Same for image if ever disabled.
8. Restore the balance/coins display in the header (small chip) so users see their wallet when paid mode kicks in.
9. Refresh usage count after a successful prediction.

## Admin UI

Add an **Oracle Settings** tab to `src/pages/admin/PaymentSettings.tsx`:
- New component `src/components/admin/settings/OracleSettingsCard.tsx`
- Controls:
  - Number input: Price per prediction scan (R)
  - Number input: Free daily predictions per user
  - Switch: Enable Auto Pick mode
  - Switch: Enable Image Upload mode
  - Save button → updates `system_settings` row (admin RLS already allows)

## Edge function

No changes required to `oracle-predict`; pricing is enforced client-side via RPC + RLS-protected `system_settings`. The dynamic price is passed to `charge_oracle_search(p_cost := <price>)`.

## Docs

Update `src/pages/FAQ.tsx` and `src/pages/Terms.tsx` to reflect: "Oracle is free for the first N predictions per day; additional scans cost R{price} each. Auto Pick may be temporarily disabled by the admin."

## Files touched
- New migration (system_settings columns + optional helper RPC)
- `src/pages/Oracle.tsx`
- `src/pages/admin/PaymentSettings.tsx`
- `src/components/admin/settings/OracleSettingsCard.tsx` (new)
- `src/pages/FAQ.tsx`, `src/pages/Terms.tsx`

## Open question
Should the **free daily quota** be shared across Auto Pick + Image, or counted per mode? I'll assume **shared total** (3 free predictions/day combined) unless you say otherwise.
