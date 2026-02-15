export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_views: {
        Row: {
          ad_id: string
          id: string
          user_id: string
          viewed_at: string
          viewed_date: string
        }
        Insert: {
          ad_id: string
          id?: string
          user_id: string
          viewed_at?: string
          viewed_date?: string
        }
        Update: {
          ad_id?: string
          id?: string
          user_id?: string
          viewed_at?: string
          viewed_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_views_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "system_ads"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_details: {
        Row: {
          account_holder: string
          account_number: string
          account_type: string
          bank_name: string
          branch_code: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder: string
          account_number: string
          account_type: string
          bank_name: string
          branch_code: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          account_type?: string
          bank_name?: string
          branch_code?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_replies: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_replies_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_number: string | null
          created_at: string
          description: string
          id: string
          purchase_id: string
          status: string
          ticket_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_number?: string | null
          created_at?: string
          description: string
          id?: string
          purchase_id: string
          status?: string
          ticket_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_number?: string | null
          created_at?: string
          description?: string
          id?: string
          purchase_id?: string
          status?: string
          ticket_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_vouchers: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          drop_date: string
          drop_time: string
          id: string
          is_active: boolean
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          drop_date: string
          drop_time?: string
          id?: string
          is_active?: boolean
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          drop_date?: string
          drop_time?: string
          id?: string
          is_active?: boolean
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_vouchers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      oracle_searches: {
        Row: {
          advice: string | null
          btts_filter: string | null
          corner_filter: string | null
          created_at: string
          date_from: string | null
          date_to: string | null
          double_chance_filter: string | null
          goal_filter: string | null
          id: string
          leagues: string[] | null
          legs: number | null
          mode: string
          predictions: Json | null
          query: string | null
          safe_only: boolean | null
          user_id: string
        }
        Insert: {
          advice?: string | null
          btts_filter?: string | null
          corner_filter?: string | null
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          double_chance_filter?: string | null
          goal_filter?: string | null
          id?: string
          leagues?: string[] | null
          legs?: number | null
          mode?: string
          predictions?: Json | null
          query?: string | null
          safe_only?: boolean | null
          user_id: string
        }
        Update: {
          advice?: string | null
          btts_filter?: string | null
          corner_filter?: string | null
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          double_chance_filter?: string | null
          goal_filter?: string | null
          id?: string
          leagues?: string[] | null
          legs?: number | null
          mode?: string
          predictions?: Json | null
          query?: string | null
          safe_only?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          id: string
          is_test_mode: boolean | null
          merchant_id: string
          merchant_key: string
          passphrase: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          is_test_mode?: boolean | null
          merchant_id: string
          merchant_key: string
          passphrase: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          is_test_mode?: boolean | null
          merchant_id?: string
          merchant_key?: string
          passphrase?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      post_reports: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_hidden: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved: boolean
          avatar_url: string | null
          created_at: string
          credit_balance: number
          display_whatsapp: boolean | null
          email: string
          id: string
          loyalty_points: number | null
          role: Database["public"]["Enums"]["user_role"]
          suspended: boolean
          updated_at: string
          username: string | null
          verified: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          approved?: boolean
          avatar_url?: string | null
          created_at?: string
          credit_balance?: number
          display_whatsapp?: boolean | null
          email: string
          id: string
          loyalty_points?: number | null
          role: Database["public"]["Enums"]["user_role"]
          suspended?: boolean
          updated_at?: string
          username?: string | null
          verified?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          approved?: boolean
          avatar_url?: string | null
          created_at?: string
          credit_balance?: number
          display_whatsapp?: boolean | null
          email?: string
          id?: string
          loyalty_points?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          suspended?: boolean
          updated_at?: string
          username?: string | null
          verified?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          buyer_id: string
          id: string
          is_rated: boolean
          is_winner: boolean | null
          payment_data: Json | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          price: number
          purchase_date: string
          seller_id: string
          ticket_id: string
        }
        Insert: {
          buyer_id: string
          id?: string
          is_rated?: boolean
          is_winner?: boolean | null
          payment_data?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          price: number
          purchase_date?: string
          seller_id: string
          ticket_id: string
        }
        Update: {
          buyer_id?: string
          id?: string
          is_rated?: boolean
          is_winner?: boolean | null
          payment_data?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          price?: number
          purchase_date?: string
          seller_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          buyer_id: string
          comment: string | null
          created_at: string
          id: string
          score: number
          seller_id: string
          ticket_id: string
        }
        Insert: {
          buyer_id: string
          comment?: string | null
          created_at?: string
          id?: string
          score: number
          seller_id: string
          ticket_id: string
        }
        Update: {
          buyer_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          score?: number
          seller_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_settings: {
        Row: {
          created_at: string
          default_og_image: string
          id: string
          site_description: string
          site_keywords: string
          site_title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_og_image?: string
          id?: string
          site_description?: string
          site_keywords?: string
          site_title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_og_image?: string
          id?: string
          site_description?: string
          site_keywords?: string
          site_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          favicon_url: string | null
          google_ads_code: string | null
          id: string
          logo_url: string | null
          maintenance_mode: boolean | null
          site_name: string
          updated_at: string | null
        }
        Insert: {
          favicon_url?: string | null
          google_ads_code?: string | null
          id?: string
          logo_url?: string | null
          maintenance_mode?: boolean | null
          site_name?: string
          updated_at?: string | null
        }
        Update: {
          favicon_url?: string | null
          google_ads_code?: string | null
          id?: string
          logo_url?: string | null
          maintenance_mode?: boolean | null
          site_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          seller_id?: string
        }
        Relationships: []
      }
      system_ads: {
        Row: {
          ad_redirect: string | null
          created_at: string
          created_by: string | null
          id: string
          image_url: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          ad_redirect?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          ad_redirect?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          min_withdrawal_amount: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          min_withdrawal_amount?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          min_withdrawal_amount?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          betting_site: Database["public"]["Enums"]["betting_site"]
          created_at: string
          description: string
          event_results: string | null
          id: string
          is_expired: boolean
          is_free: boolean
          is_hidden: boolean
          kickoff_time: string
          odds: number | null
          price: number
          seller_id: string
          ticket_code: string
          title: string
          updated_at: string
        }
        Insert: {
          betting_site: Database["public"]["Enums"]["betting_site"]
          created_at?: string
          description: string
          event_results?: string | null
          id?: string
          is_expired?: boolean
          is_free?: boolean
          is_hidden?: boolean
          kickoff_time: string
          odds?: number | null
          price: number
          seller_id: string
          ticket_code: string
          title: string
          updated_at?: string
        }
        Update: {
          betting_site?: Database["public"]["Enums"]["betting_site"]
          created_at?: string
          description?: string
          event_results?: string | null
          id?: string
          is_expired?: boolean
          is_free?: boolean
          is_hidden?: boolean
          kickoff_time?: string
          odds?: number | null
          price?: number
          seller_id?: string
          ticket_code?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      voucher_claims: {
        Row: {
          claimed_at: string
          id: string
          user_id: string
          voucher_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          user_id: string
          voucher_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          user_id?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_claims_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: true
            referencedRelation: "daily_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_rewards: {
        Row: {
          amount: number
          created_at: string
          id: string
          position: number
          processed_at: string
          sales_count: number
          seller_id: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          position: number
          processed_at?: string
          sales_count: number
          seller_id: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          position?: number
          processed_at?: string
          sales_count?: number
          seller_id?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_rewards_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          id: string
          processed_date: string | null
          request_date: string
          seller_id: string
          status: string
        }
        Insert: {
          amount: number
          id?: string
          processed_date?: string | null
          request_date?: string
          seller_id: string
          status: string
        }
        Update: {
          amount?: number
          id?: string
          processed_date?: string | null
          request_date?: string
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: { amount_to_add: number; user_id: string }
        Returns: number
      }
      charge_oracle_search: {
        Args: { p_cost?: number; p_user_id: string }
        Returns: boolean
      }
      claim_bc_points: {
        Args: { p_points_to_claim: number; p_user_id: string }
        Returns: boolean
      }
      claim_daily_voucher: {
        Args: { p_user_id: string; p_voucher_id: string }
        Returns: boolean
      }
      complete_ticket_purchase: {
        Args: {
          p_payment_data?: Json
          p_payment_id: string
          p_purchase_id: string
        }
        Returns: boolean
      }
      complete_wallet_transaction: {
        Args: {
          p_payment_data?: Json
          p_payment_id: string
          p_transaction_id: string
        }
        Returns: boolean
      }
      create_wallet_top_up: {
        Args: { p_amount: number; p_description: string; p_user_id: string }
        Returns: string
      }
      get_public_leaderboard: {
        Args: { end_date: string; result_limit?: number; start_date: string }
        Returns: {
          avatar_url: string
          average_rating: number
          id: string
          rank: number
          sales_count: number
          total_sales: number
          username: string
        }[]
      }
      get_public_seller_stats: { Args: { seller_id: string }; Returns: Json }
      get_seller_leaderboard:
        | {
            Args: { end_date: string; start_date: string }
            Returns: {
              avatar_url: string
              average_rating: number
              id: string
              rank: number
              sales_count: number
              username: string
            }[]
          }
        | {
            Args: {
              end_date: string
              result_limit?: number
              start_date: string
            }
            Returns: {
              avatar_url: string
              average_rating: number
              id: string
              rank: number
              sales_count: number
              total_sales: number
              username: string
            }[]
          }
      is_admin: { Args: never; Returns: boolean }
      process_tip: {
        Args: { p_amount: number; p_receiver_id: string; p_sender_id: string }
        Returns: boolean
      }
      purchase_ticket: {
        Args: { p_buyer_id: string; p_ticket_id: string }
        Returns: string
      }
    }
    Enums: {
      betting_site:
        | "Betway"
        | "HollywoodBets"
        | "Supabets"
        | "Playa"
        | "10bet"
        | "Easybet"
      reaction_type: "heart" | "thumbs_up" | "thumbs_down"
      report_status: "pending" | "reviewed" | "dismissed"
      user_role: "buyer" | "seller" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      betting_site: [
        "Betway",
        "HollywoodBets",
        "Supabets",
        "Playa",
        "10bet",
        "Easybet",
      ],
      reaction_type: ["heart", "thumbs_up", "thumbs_down"],
      report_status: ["pending", "reviewed", "dismissed"],
      user_role: ["buyer", "seller", "admin"],
    },
  },
} as const
