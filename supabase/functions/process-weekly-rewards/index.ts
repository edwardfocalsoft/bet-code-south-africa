
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          credit_balance: number
        }
      }
      purchases: {
        Row: {
          id: string
          seller_id: string
          price: number
          purchase_date: string
          payment_status: string
        }
      }
      weekly_rewards: {
        Row: {
          id: string
          week_start_date: string
          week_end_date: string
          seller_id: string
          position: number
          amount: number
          sales_count: number
        }
        Insert: {
          week_start_date: string
          week_end_date: string
          seller_id: string
          position: number
          amount: number
          sales_count: number
        }
      }
      wallet_transactions: {
        Insert: {
          user_id: string
          amount: number
          type: string
          description: string
        }
      }
    }
    Functions: {
      add_credits: {
        Args: {
          user_id: string
          amount_to_add: number
        }
        Returns: number
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Starting weekly rewards processing...')

    // Calculate previous week's date range (Monday to Sunday)
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Adjust for Monday start
    
    const weekEndDate = new Date(today)
    weekEndDate.setDate(today.getDate() - daysToSubtract - 1) // Previous Sunday
    weekEndDate.setHours(23, 59, 59, 999)
    
    const weekStartDate = new Date(weekEndDate)
    weekStartDate.setDate(weekEndDate.getDate() - 6) // Previous Monday
    weekStartDate.setHours(0, 0, 0, 0)

    const startDateStr = weekStartDate.toISOString().split('T')[0]
    const endDateStr = weekEndDate.toISOString().split('T')[0]

    console.log(`Processing rewards for week: ${startDateStr} to ${endDateStr}`)

    // Check if rewards have already been processed for this week
    const { data: existingRewards, error: checkError } = await supabaseClient
      .from('weekly_rewards')
      .select('id')
      .eq('week_start_date', startDateStr)
      .limit(1)

    if (checkError) {
      console.error('Error checking existing rewards:', checkError)
      throw checkError
    }

    if (existingRewards && existingRewards.length > 0) {
      console.log('Rewards already processed for this week')
      return new Response(
        JSON.stringify({ message: 'Rewards already processed for this week' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Get top 3 sellers for the week using the existing leaderboard function
    const { data: topSellers, error: leaderboardError } = await supabaseClient.rpc(
      'get_public_leaderboard',
      {
        start_date: weekStartDate.toISOString(),
        end_date: weekEndDate.toISOString(),
        result_limit: 3
      }
    )

    if (leaderboardError) {
      console.error('Error getting leaderboard:', leaderboardError)
      throw leaderboardError
    }

    if (!topSellers || topSellers.length === 0) {
      console.log('No sales found for this week')
      return new Response(
        JSON.stringify({ message: 'No sales found for this week' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`Found ${topSellers.length} top sellers for rewards`)

    // Reward amounts for positions 1, 2, 3
    const rewardAmounts = [500, 250, 100]
    const processedRewards = []

    for (let i = 0; i < Math.min(topSellers.length, 3); i++) {
      const seller = topSellers[i]
      const position = i + 1
      const rewardAmount = rewardAmounts[i]

      // Only reward sellers with at least 1 sale
      if (seller.sales_count < 1) {
        console.log(`Seller ${seller.username} has no sales, skipping reward`)
        continue
      }

      try {
        console.log(`Processing reward for position ${position}: ${seller.username} - R${rewardAmount}`)

        // Add credits to seller's balance
        const { data: newBalance, error: creditsError } = await supabaseClient.rpc(
          'add_credits',
          {
            user_id: seller.id,
            amount_to_add: rewardAmount
          }
        )

        if (creditsError) {
          console.error(`Error adding credits to seller ${seller.id}:`, creditsError)
          throw creditsError
        }

        // Create wallet transaction record
        const { error: transactionError } = await supabaseClient
          .from('wallet_transactions')
          .insert({
            user_id: seller.id,
            amount: rewardAmount,
            type: 'bonus',
            description: `Weekly reward - Position ${position} (${startDateStr} to ${endDateStr})`
          })

        if (transactionError) {
          console.error(`Error creating transaction for seller ${seller.id}:`, transactionError)
          throw transactionError
        }

        // Record the weekly reward
        const { error: rewardError } = await supabaseClient
          .from('weekly_rewards')
          .insert({
            week_start_date: startDateStr,
            week_end_date: endDateStr,
            seller_id: seller.id,
            position: position,
            amount: rewardAmount,
            sales_count: seller.sales_count
          })

        if (rewardError) {
          console.error(`Error recording reward for seller ${seller.id}:`, rewardError)
          throw rewardError
        }

        processedRewards.push({
          position,
          seller_id: seller.id,
          username: seller.username,
          sales_count: seller.sales_count,
          reward_amount: rewardAmount,
          new_balance: newBalance
        })

        console.log(`Successfully processed reward for ${seller.username}: R${rewardAmount}`)

      } catch (error) {
        console.error(`Failed to process reward for seller ${seller.id}:`, error)
        // Continue with other sellers even if one fails
      }
    }

    console.log(`Weekly rewards processing completed. Processed ${processedRewards.length} rewards.`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Weekly rewards processed successfully`,
        week_period: `${startDateStr} to ${endDateStr}`,
        rewards_processed: processedRewards.length,
        details: processedRewards
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in weekly rewards processing:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
