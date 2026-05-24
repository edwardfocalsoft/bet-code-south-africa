
CREATE OR REPLACE FUNCTION public.get_public_leaderboard(
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  result_limit integer DEFAULT 10
)
RETURNS TABLE(
  rank bigint,
  id uuid,
  username text,
  avatar_url text,
  sales_count bigint,
  total_sales numeric,
  average_rating numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    RANK() OVER (ORDER BY COUNT(p.id) DESC, COALESCE(MIN(p.purchase_date), 'infinity')) AS rank,
    pr.id,
    pr.username,
    pr.avatar_url,
    COUNT(p.id) AS sales_count,
    COALESCE(SUM(p.price) FILTER (WHERE p.price > 0), 0)::numeric AS total_sales,
    COALESCE(
      (SELECT AVG(r.score)::numeric(10,1)
       FROM ratings r
       WHERE r.seller_id = pr.id), 0.0
    ) AS average_rating
  FROM profiles pr
  LEFT JOIN purchases p ON pr.id = p.seller_id
    AND p.purchase_date BETWEEN start_date AND end_date
    AND p.payment_status = 'completed'
  WHERE pr.role = 'seller'
    AND pr.approved = true
    AND pr.suspended = false
  GROUP BY pr.id
  ORDER BY sales_count DESC, COALESCE(MIN(p.purchase_date), 'infinity')
  LIMIT result_limit;
END;
$$;
