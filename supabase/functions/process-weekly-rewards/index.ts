
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TopSeller {
  seller_id: string;
  sales_count: number;
  username: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    console.log('Starting weekly rewards processing...')

    // Calculate previous week's date range (Monday to Sunday)
    const now = new Date()
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysToLastSunday = currentDay === 0 ? 7 : currentDay
    
    const weekEndDate = new Date(now)
    weekEndDate.setDate(now.getDate() - daysToLastSunday)
    weekEndDate.setHours(23, 59, 59, 999)
    
    const weekStartDate = new Date(weekEndDate)
    weekStartDate.setDate(weekEndDate.getDate() - 6)
    weekStartDate.setHours(0, 0, 0, 0)

    console.log(`Processing rewards for week: ${weekStartDate.toISOString()} to ${weekEndDate.toISOString()}`)

    // Check if rewards have already been processed for this week
    const { data: existingRewards } = await supabase
      .from('weekly_rewards')
      .select('id')
      .eq('week_start_date', weekStartDate.toISOString().split('T')[0])
      .limit(1)

    if (existingRewards && existingRewards.length > 0) {
      console.log('Rewards already processed for this week')
      return new Response(
        JSON.stringify({ message: 'Rewards already processed for this week' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get top 3 sellers by completed sales count for the previous week
    const { data: topSellers, error: sellersError } = await supabase
      .from('purchases')
      .select(`
        seller_id,
        profiles!purchases_seller_id_fkey(username)
      `)
      .eq('payment_status', 'completed')
      .gte('purchase_date', weekStartDate.toISOString())
      .lte('purchase_date', weekEndDate.toISOString())

    if (sellersError) {
      console.error('Error fetching sellers:', sellersError)
      throw sellersError
    }

    if (!topSellers || topSellers.length === 0) {
      console.log('No sales found for the previous week')
      return new Response(
        JSON.stringify({ message: 'No sales found for the previous week' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Aggregate sales count by seller
    const sellerSalesMap = new Map<string, { count: number, username: string }>()
    
    topSellers.forEach((sale: any) => {
      const sellerId = sale.seller_id
      const username = sale.profiles?.username || 'Unknown'
      
      if (sellerSalesMap.has(sellerId)) {
        sellerSalesMap.get(sellerId)!.count += 1
      } else {
        sellerSalesMap.set(sellerId, { count: 1, username })
      }
    })

    // Convert to array and sort by sales count (descending)
    const sortedSellers: TopSeller[] = Array.from(sellerSalesMap.entries())
      .map(([seller_id, data]) => ({
        seller_id,
        sales_count: data.count,
        username: data.username
      }))
      .sort((a, b) => b.sales_count - a.sales_count)
      .slice(0, 3) // Top 3 only

    console.log('Top sellers:', sortedSellers)

    if (sortedSellers.length === 0) {
      console.log('No qualifying sellers found')
      return new Response(
        JSON.stringify({ message: 'No qualifying sellers found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Reward amounts by position
    const rewardAmounts = [500, 250, 100] // 1st, 2nd, 3rd place

    const results = []

    // Process rewards for each top seller
    for (let i = 0; i < sortedSellers.length; i++) {
      const seller = sortedSellers[i]
      const position = i + 1
      const amount = rewardAmounts[i]

      console.log(`Processing reward for seller ${seller.username} (${seller.seller_id}): Position ${position}, Amount R${amount}`)

      try {
        // Start transaction: Add credits to seller balance
        const { error: balanceError } = await supabase.rpc('add_credits', {
          user_id: seller.seller_id,
          amount_to_add: amount
        })

        if (balanceError) {
          console.error(`Error updating balance for seller ${seller.seller_id}:`, balanceError)
          throw balanceError
        }

        // Create wallet transaction record
        const { error: transactionError } = await supabase
          .from('wallet_transactions')
          .insert({
            user_id: seller.seller_id,
            amount: amount,
            type: 'bonus',
            description: 'Weekly Performance Bonus'
          })

        if (transactionError) {
          console.error(`Error creating transaction for seller ${seller.seller_id}:`, transactionError)
          throw transactionError
        }

        // Record weekly reward
        const { error: rewardError } = await supabase
          .from('weekly_rewards')
          .insert({
            week_start_date: weekStartDate.toISOString().split('T')[0],
            week_end_date: weekEndDate.toISOString().split('T')[0],
            seller_id: seller.seller_id,
            position: position,
            amount: amount,
            sales_count: seller.sales_count
          })

        if (rewardError) {
          console.error(`Error recording weekly reward for seller ${seller.seller_id}:`, rewardError)
          throw rewardError
        }

        results.push({
          seller_id: seller.seller_id,
          username: seller.username,
          position: position,
          amount: amount,
          sales_count: seller.sales_count
        })

        console.log(`Successfully processed reward for ${seller.username}`)

      } catch (error) {
        console.error(`Failed to process reward for seller ${seller.seller_id}:`, error)
        // Continue with other sellers even if one fails
      }
    }

    console.log(`Weekly rewards processing completed. Processed ${results.length} rewards.`)

    return new Response(
      JSON.stringify({
        message: 'Weekly rewards processed successfully',
        week_start_date: weekStartDate.toISOString().split('T')[0],
        week_end_date: weekEndDate.toISOString().split('T')[0],
        rewards_processed: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error processing weekly rewards:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process weekly rewards',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
