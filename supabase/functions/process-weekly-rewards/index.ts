
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
          username: string
          credit_balance: number
          role: string
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
          created_at: string
          processed_at: string
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
          reference_id?: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting weekly rewards processing...')

    // Calculate the previous week's date range (Monday to Sunday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Get to previous Monday
    
    const weekEndDate = new Date(now)
    weekEndDate.setDate(now.getDate() - daysToSubtract - 1) // Previous Sunday
    weekEndDate.setHours(23, 59, 59, 999)
    
    const weekStartDate = new Date(weekEndDate)
    weekStartDate.setDate(weekEndDate.getDate() - 6) // Previous Monday
    weekStartDate.setHours(0, 0, 0, 0)

    const startDateStr = weekStartDate.toISOString().split('T')[0]
    const endDateStr = weekEndDate.toISOString().split('T')[0]

    console.log(`Processing rewards for week: ${startDateStr} to ${endDateStr}`)

    // Check if rewards for this week have already been processed
    const { data: existingRewards } = await supabaseClient
      .from('weekly_rewards')
      .select('id')
      .eq('week_start_date', startDateStr)
      .limit(1)

    if (existingRewards && existingRewards.length > 0) {
      console.log('Rewards for this week already processed')
      return new Response(
        JSON.stringify({ message: 'Rewards for this week already processed' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get all approved sellers
    const { data: sellers, error: sellersError } = await supabaseClient
      .from('profiles')
      .select('id, username')
      .eq('role', 'seller')
      .eq('approved', true)
      .eq('suspended', false)

    if (sellersError) {
      throw new Error(`Failed to fetch sellers: ${sellersError.message}`)
    }

    if (!sellers || sellers.length === 0) {
      console.log('No approved sellers found')
      return new Response(
        JSON.stringify({ message: 'No approved sellers found' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Found ${sellers.length} approved sellers`)

    // Calculate sales for each seller during the week
    const sellerStats = await Promise.all(
      sellers.map(async (seller) => {
        const { count: salesCount } = await supabaseClient
          .from('purchases')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', seller.id)
          .eq('payment_status', 'completed')
          .gte('purchase_date', weekStartDate.toISOString())
          .lte('purchase_date', weekEndDate.toISOString())

        return {
          seller_id: seller.id,
          username: seller.username,
          sales_count: salesCount || 0
        }
      })
    )

    // Filter sellers with sales and sort by sales count
    const sellersWithSales = sellerStats
      .filter(stat => stat.sales_count > 0)
      .sort((a, b) => b.sales_count - a.sales_count)

    console.log(`${sellersWithSales.length} sellers had sales this week`)

    if (sellersWithSales.length === 0) {
      console.log('No sellers had sales this week')
      return new Response(
        JSON.stringify({ message: 'No sellers had sales this week' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Award prizes to top 3 sellers
    const rewards = [500, 250, 100] // R500, R250, R100
    const topSellers = sellersWithSales.slice(0, 3)

    const processedRewards = []

    for (let i = 0; i < topSellers.length; i++) {
      const seller = topSellers[i]
      const position = i + 1
      const amount = rewards[i]

      console.log(`Awarding position ${position}: R${amount} to ${seller.username} (${seller.sales_count} sales)`)

      // Add credits to seller's balance
      const { error: balanceError } = await supabaseClient.rpc('add_credits', {
        user_id: seller.seller_id,
        amount_to_add: amount
      })

      if (balanceError) {
        console.error(`Failed to add credits to ${seller.username}:`, balanceError)
        continue
      }

      // Record the reward in weekly_rewards table
      const { error: rewardError } = await supabaseClient
        .from('weekly_rewards')
        .insert({
          week_start_date: startDateStr,
          week_end_date: endDateStr,
          seller_id: seller.seller_id,
          position: position,
          amount: amount,
          sales_count: seller.sales_count
        })

      if (rewardError) {
        console.error(`Failed to record reward for ${seller.username}:`, rewardError)
        continue
      }

      // Create wallet transaction record
      const { error: transactionError } = await supabaseClient
        .from('wallet_transactions')
        .insert({
          user_id: seller.seller_id,
          amount: amount,
          type: 'bonus',
          description: `Weekly reward - Position ${position} (${seller.sales_count} sales)`
        })

      if (transactionError) {
        console.error(`Failed to create transaction for ${seller.username}:`, transactionError)
        continue
      }

      processedRewards.push({
        username: seller.username,
        position: position,
        amount: amount,
        sales_count: seller.sales_count
      })
    }

    console.log(`Successfully processed ${processedRewards.length} rewards`)

    return new Response(
      JSON.stringify({ 
        message: 'Weekly rewards processed successfully',
        week_start: startDateStr,
        week_end: endDateStr,
        rewards: processedRewards
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing weekly rewards:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
