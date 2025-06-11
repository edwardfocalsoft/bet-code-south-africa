export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        Args: { user_id: string; amount_to_add: number }
        Returns: number
      }
      claim_daily_voucher: {
        Args: { p_voucher_id: string; p_user_id: string }
        Returns: boolean
      }
      complete_ticket_purchase: {
        Args: {
          p_purchase_id: string
          p_payment_id: string
          p_payment_data?: Json
        }
        Returns: boolean
      }
      complete_wallet_transaction: {
        Args: {
          p_transaction_id: string
          p_payment_id: string
          p_payment_data?: Json
        }
        Returns: boolean
      }
      create_wallet_top_up: {
        Args: { p_amount: number; p_description: string; p_user_id: string }
        Returns: string
      }
      get_public_leaderboard: {
        Args: { start_date: string; end_date: string; result_limit?: number }
        Returns: {
          rank: number
          id: string
          username: string
          avatar_url: string
          sales_count: number
          total_sales: number
          average_rating: number
        }[]
      }
      get_public_seller_stats: {
        Args: { seller_id: string }
        Returns: Json
      }
      get_seller_leaderboard: {
        Args:
          | { start_date: string; end_date: string }
          | { start_date: string; end_date: string; result_limit?: number }
        Returns: {
          rank: number
          id: string
          username: string
          avatar_url: string
          sales_count: number
          average_rating: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      process_tip: {
        Args: { p_sender_id: string; p_receiver_id: string; p_amount: number }
        Returns: boolean
      }
      purchase_ticket: {
        Args: { p_ticket_id: string; p_buyer_id: string }
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
      user_role: "buyer" | "seller" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      user_role: ["buyer", "seller", "admin"],
    },
  },
} as const
