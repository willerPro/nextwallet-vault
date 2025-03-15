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
      admin_settings: {
        Row: {
          created_at: string
          deposits_enabled: boolean | null
          id: string
          inactive_user_ban_days: number | null
          minimum_deposit: number | null
          mining_enabled: boolean | null
          updated_at: string
          withdraw_max_percentage: number | null
          withdrawals_enabled: boolean | null
        }
        Insert: {
          created_at?: string
          deposits_enabled?: boolean | null
          id?: string
          inactive_user_ban_days?: number | null
          minimum_deposit?: number | null
          mining_enabled?: boolean | null
          updated_at?: string
          withdraw_max_percentage?: number | null
          withdrawals_enabled?: boolean | null
        }
        Update: {
          created_at?: string
          deposits_enabled?: boolean | null
          id?: string
          inactive_user_ban_days?: number | null
          minimum_deposit?: number | null
          mining_enabled?: boolean | null
          updated_at?: string
          withdraw_max_percentage?: number | null
          withdrawals_enabled?: boolean | null
        }
        Relationships: []
      }
      arbitrage_operations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          started_at: string | null
          stopped_at: string | null
          transactions_per_second: number
          updated_at: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          started_at?: string | null
          stopped_at?: string | null
          transactions_per_second: number
          updated_at?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          started_at?: string | null
          stopped_at?: string | null
          transactions_per_second?: number
          updated_at?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arbitrage_operations_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_wallets: {
        Row: {
          asset_id: string
          asset_name: string
          asset_symbol: string
          created_at: string
          id: string
          label: string | null
          name: string | null
          network: string
          updated_at: string
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          asset_id: string
          asset_name: string
          asset_symbol: string
          created_at?: string
          id?: string
          label?: string | null
          name?: string | null
          network: string
          updated_at?: string
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          asset_id?: string
          asset_name?: string
          asset_symbol?: string
          created_at?: string
          id?: string
          label?: string | null
          name?: string | null
          network?: string
          updated_at?: string
          user_id?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          price: number
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          price?: number
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          price?: number
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      binary_signal: {
        Row: {
          Action: string | null
          created_at: string
          Entry: string | null
          Expiration: string | null
          id: number
          Pair: string | null
          status: string | null
        }
        Insert: {
          Action?: string | null
          created_at?: string
          Entry?: string | null
          Expiration?: string | null
          id?: number
          Pair?: string | null
          status?: string | null
        }
        Update: {
          Action?: string | null
          created_at?: string
          Entry?: string | null
          Expiration?: string | null
          id?: number
          Pair?: string | null
          status?: string | null
        }
        Relationships: []
      }
      cars: {
        Row: {
          brand: string | null
          class: string | null
          created_at: string
          created_by: string | null
          id: string
          images: string[] | null
          make: string
          manufacturer: string | null
          model: string
          price: number
          status: string | null
          steering: string | null
          type: string | null
          updated_at: string
          year: number
        }
        Insert: {
          brand?: string | null
          class?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          images?: string[] | null
          make: string
          manufacturer?: string | null
          model: string
          price: number
          status?: string | null
          steering?: string | null
          type?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          brand?: string | null
          class?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          images?: string[] | null
          make?: string
          manufacturer?: string | null
          model?: string
          price?: number
          status?: string | null
          steering?: string | null
          type?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          api_key: string | null
          bot_name: string
          created_at: string
          id: string
          provider: string
          status: string | null
          updated_at: string
          working_hours: number | null
        }
        Insert: {
          api_key?: string | null
          bot_name: string
          created_at?: string
          id?: string
          provider: string
          status?: string | null
          updated_at?: string
          working_hours?: number | null
        }
        Update: {
          api_key?: string | null
          bot_name?: string
          created_at?: string
          id?: string
          provider?: string
          status?: string | null
          updated_at?: string
          working_hours?: number | null
        }
        Relationships: []
      }
      conversions: {
        Row: {
          created_at: string
          from_amount: number
          from_currency: string
          id: string
          rate: number
          status: string
          to_amount: number
          to_currency: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_amount: number
          from_currency: string
          id?: string
          rate: number
          status?: string
          to_amount: number
          to_currency: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_amount?: number
          from_currency?: string
          id?: string
          rate?: number
          status?: string
          to_amount?: number
          to_currency?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_assets: {
        Row: {
          created_at: string
          current_price: number
          id: string
          logo_url: string | null
          name: string
          price_change_24h: number | null
          symbol: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_price: number
          id?: string
          logo_url?: string | null
          name: string
          price_change_24h?: number | null
          symbol: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_price?: number
          id?: string
          logo_url?: string | null
          name?: string
          price_change_24h?: number | null
          symbol?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_networks: {
        Row: {
          chain_id: string
          created_at: string
          default_token: string
          id: string
          network_name: string
          rpc_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chain_id: string
          created_at?: string
          default_token: string
          id?: string
          network_name: string
          rpc_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chain_id?: string
          created_at?: string
          default_token?: string
          id?: string
          network_name?: string
          rpc_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_profits: {
        Row: {
          bot_profit: number
          contract_profit: number
          created_at: string
          created_by: string | null
          id: string
          updated_at: string
        }
        Insert: {
          bot_profit?: number
          contract_profit?: number
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          bot_profit?: number
          contract_profit?: number
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      deposit_verifications: {
        Row: {
          created_at: string
          deposit_id: string
          id: string
          proof_url: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit_id: string
          id?: string
          proof_url: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit_id?: string
          id?: string
          proof_url?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposit_verifications_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          created_at: string
          id: string
          status: string | null
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string | null
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          done: boolean
          id: string
          title: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          done?: boolean
          id?: string
          title: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          done?: boolean
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          amount: number
          created_at: string
          end_date: string | null
          id: string
          is_recurrent: boolean | null
          start_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_date?: string | null
          id?: string
          is_recurrent?: boolean | null
          start_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string | null
          id?: string
          is_recurrent?: boolean | null
          start_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hostings: {
        Row: {
          cost: number
          created_at: string
          id: string
          link: string | null
          name: string
          provider: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          link?: string | null
          name: string
          provider?: string
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          link?: string | null
          name?: string
          provider?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_packages: {
        Row: {
          amount: number
          created_at: string
          duration_type: string
          end_date: string | null
          id: string
          profit_percentage: number
          start_date: string
          status: string | null
          total_profit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          duration_type: string
          end_date?: string | null
          id?: string
          profit_percentage: number
          start_date?: string
          status?: string | null
          total_profit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          duration_type?: string
          end_date?: string | null
          id?: string
          profit_percentage?: number
          start_date?: string
          status?: string | null
          total_profit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_profits: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      investors: {
        Row: {
          amount: number
          created_at: string
          duration: string
          email: string
          id: string
          name: string
          return_promised: number
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          duration: string
          email: string
          id?: string
          name: string
          return_promised: number
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          duration?: string
          email?: string
          id?: string
          name?: string
          return_promised?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          back_document_url: string | null
          created_at: string
          document_type: string
          front_document_url: string | null
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back_document_url?: string | null
          created_at?: string
          document_type: string
          front_document_url?: string | null
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          back_document_url?: string | null
          created_at?: string
          document_type?: string
          front_document_url?: string | null
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lined_up: {
        Row: {
          created_at: string
          id: string
          investment: number
          profit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          investment?: number
          profit?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          investment?: number
          profit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      logins: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          login_time: string
          otp: string
          user_email: string
          user_id: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          login_time?: string
          otp: string
          user_email: string
          user_id: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          login_time?: string
          otp?: string
          user_email?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      mt5_connections: {
        Row: {
          broker_login: string
          broker_name: string
          broker_password: string
          broker_server: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          broker_login: string
          broker_name: string
          broker_password: string
          broker_server: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          broker_login?: string
          broker_name?: string
          broker_password?: string
          broker_server?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mura_car_sales: {
        Row: {
          amount: number
          car_id: string
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          payment_proof_url: string | null
          payment_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          car_id: string
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          payment_proof_url?: string | null
          payment_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          car_id?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          payment_proof_url?: string | null
          payment_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mura_car_sales_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "mura_cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mura_car_sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mura_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mura_car_sales_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "mura_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mura_cars: {
        Row: {
          brand: string | null
          car_type: string | null
          client_id: string | null
          color: string | null
          created_at: string
          created_by: string | null
          current_location: string | null
          dealer_id: string | null
          id: string
          image_url: string | null
          manufacturer: string | null
          name: string
          price: number
          status: string | null
          steering: string | null
          updated_at: string
          weight: number | null
          year: number | null
        }
        Insert: {
          brand?: string | null
          car_type?: string | null
          client_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          current_location?: string | null
          dealer_id?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          name: string
          price: number
          status?: string | null
          steering?: string | null
          updated_at?: string
          weight?: number | null
          year?: number | null
        }
        Update: {
          brand?: string | null
          car_type?: string | null
          client_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          current_location?: string | null
          dealer_id?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          name?: string
          price?: number
          status?: string | null
          steering?: string | null
          updated_at?: string
          weight?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mura_cars_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mura_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mura_cars_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "mura_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mura_cars_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "mura_dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      mura_clients: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mura_clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "mura_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mura_dealers: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mura_dealers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "mura_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mura_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          contact_number: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          contact_number?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      nextcars: {
        Row: {
          created_at: string
          id: string
          images: string[] | null
          make: string
          model: string
          price: number
          status: string | null
          type: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          images?: string[] | null
          make: string
          model: string
          price: number
          status?: string | null
          type: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          images?: string[] | null
          make?: string
          model?: string
          price?: number
          status?: string | null
          type?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nt_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      nt_events: {
        Row: {
          category: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          event_date: string
          id: string
          images: string[] | null
          price: number
          status: string | null
          title: string
          updated_at: string
          venue: string
        }
        Insert: {
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date: string
          id?: string
          images?: string[] | null
          price: number
          status?: string | null
          title: string
          updated_at?: string
          venue: string
        }
        Update: {
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          id?: string
          images?: string[] | null
          price?: number
          status?: string | null
          title?: string
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      nt_purchases: {
        Row: {
          created_at: string
          id: string
          payment_status: string | null
          quantity: number
          ticket_id: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_status?: string | null
          quantity: number
          ticket_id: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_status?: string | null
          quantity?: number
          ticket_id?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nt_purchases_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "nt_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      nt_ticket_types: {
        Row: {
          created_at: string
          event_id: string
          id: string
          name: string
          price: number
          quantity: number
          remaining: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          name: string
          price: number
          quantity: number
          remaining: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          name?: string
          price?: number
          quantity?: number
          remaining?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nt_ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "nt_events"
            referencedColumns: ["id"]
          },
        ]
      }
      nt_tickets: {
        Row: {
          created_at: string
          event_id: string
          id: string
          price: number
          quantity: number
          remaining: number
          ticket_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          price: number
          quantity: number
          remaining: number
          ticket_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          price?: number
          quantity?: number
          remaining?: number
          ticket_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nt_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "nt_events"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          network: string | null
          payment_method: string
          receiver_id: string
          sender_id: string
          status: string | null
          updated_at: string
          verification_code: string | null
          verification_status: string | null
          wallet_address: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          network?: string | null
          payment_method: string
          receiver_id: string
          sender_id: string
          status?: string | null
          updated_at?: string
          verification_code?: string | null
          verification_status?: string | null
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          network?: string | null
          payment_method?: string
          receiver_id?: string
          sender_id?: string
          status?: string | null
          updated_at?: string
          verification_code?: string | null
          verification_status?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      p2p_users: {
        Row: {
          created_at: string
          id: string
          max_amount: number | null
          min_amount: number | null
          payment_methods: string[] | null
          price: number
          success_rate: number | null
          total_trades: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          payment_methods?: string[] | null
          price: number
          success_rate?: number | null
          total_trades?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_amount?: number | null
          min_amount?: number | null
          payment_methods?: string[] | null
          price?: number
          success_rate?: number | null
          total_trades?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "p2p_users_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          payment_date: string
          payment_method: string
          payment_status: string | null
          sale_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          payment_date: string
          payment_method: string
          payment_status?: string | null
          sale_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          payment_date?: string
          payment_method?: string
          payment_status?: string | null
          sale_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      pin_auth: {
        Row: {
          created_at: string
          id: string
          pin: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pin: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pin?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          action: number | null
          closed_price: number | null
          comment: string | null
          deviation: number | null
          entry_price: number | null
          expiration: number | null
          id: number
          magic: number | null
          mt5_ticket: number | null
          sl: number | null
          symbol: string | null
          tp: number | null
          type: number | null
          type_filling: number | null
          type_time: number | null
          volume: number | null
        }
        Insert: {
          action?: number | null
          closed_price?: number | null
          comment?: string | null
          deviation?: number | null
          entry_price?: number | null
          expiration?: number | null
          id?: never
          magic?: number | null
          mt5_ticket?: number | null
          sl?: number | null
          symbol?: string | null
          tp?: number | null
          type?: number | null
          type_filling?: number | null
          type_time?: number | null
          volume?: number | null
        }
        Update: {
          action?: number | null
          closed_price?: number | null
          comment?: string | null
          deviation?: number | null
          entry_price?: number | null
          expiration?: number | null
          id?: never
          magic?: number | null
          mt5_ticket?: number | null
          sl?: number | null
          symbol?: string | null
          tp?: number | null
          type?: number | null
          type_filling?: number | null
          type_time?: number | null
          volume?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          car_id: string | null
          created_at: string
          created_by: string | null
          dealer_email: string | null
          dealer_location: string | null
          dealer_name: string
          dealer_phone: string | null
          id: string
          purchase_date: string
          purchase_price: number
          selling_price: number | null
          updated_at: string
        }
        Insert: {
          car_id?: string | null
          created_at?: string
          created_by?: string | null
          dealer_email?: string | null
          dealer_location?: string | null
          dealer_name: string
          dealer_phone?: string | null
          id?: string
          purchase_date: string
          purchase_price: number
          selling_price?: number | null
          updated_at?: string
        }
        Update: {
          car_id?: string | null
          created_at?: string
          created_by?: string | null
          dealer_email?: string | null
          dealer_location?: string | null
          dealer_name?: string
          dealer_phone?: string | null
          id?: string
          purchase_date?: string
          purchase_price?: number
          selling_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_links: {
        Row: {
          code: string
          created_at: string
          id: string
          updated_at: string
          used_by: string[] | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          updated_at?: string
          used_by?: string[] | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          updated_at?: string
          used_by?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          car_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          id: string
          sale_date: string
          sale_price: number
          updated_at: string
        }
        Insert: {
          car_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          sale_date: string
          sale_price: number
          updated_at?: string
        }
        Update: {
          car_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          sale_date?: string
          sale_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          recovery_email: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          recovery_email?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          recovery_email?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signal_subscriptions: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          created_at: string
          description: string | null
          entry_price: number
          id: string
          lot_size: number | null
          status: string | null
          stop_loss: number
          take_profit: number
          title: string
          type: string | null
          updated_at: string
          win_rate: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          entry_price: number
          id?: string
          lot_size?: number | null
          status?: string | null
          stop_loss: number
          take_profit: number
          title: string
          type?: string | null
          updated_at?: string
          win_rate?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          entry_price?: number
          id?: string
          lot_size?: number | null
          status?: string | null
          stop_loss?: number
          take_profit?: number
          title?: string
          type?: string | null
          updated_at?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      system_bots: {
        Row: {
          bot_type: Database["public"]["Enums"]["bot_type"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          timeframe: string | null
          trading_strategy: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_type: Database["public"]["Enums"]["bot_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          timeframe?: string | null
          trading_strategy?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_type?: Database["public"]["Enums"]["bot_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          timeframe?: string | null
          trading_strategy?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_operating_funds: {
        Row: {
          bot_name: string
          created_at: string
          funds: number
          id: string
          type: string
          updated_at: string
        }
        Insert: {
          bot_name: string
          created_at?: string
          funds?: number
          id?: string
          type: string
          updated_at?: string
        }
        Update: {
          bot_name?: string
          created_at?: string
          funds?: number
          id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          platform: Database["public"]["Enums"]["platform_type"]
          setting_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          platform: Database["public"]["Enums"]["platform_type"]
          setting_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          platform?: Database["public"]["Enums"]["platform_type"]
          setting_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_stats: {
        Row: {
          bot_income: number
          contract_income: number
          created_at: string
          date: string
          id: string
          investment: number
          provider_income: number
          updated_at: string
        }
        Insert: {
          bot_income?: number
          contract_income?: number
          created_at?: string
          date?: string
          id?: string
          investment?: number
          provider_income?: number
          updated_at?: string
        }
        Update: {
          bot_income?: number
          contract_income?: number
          created_at?: string
          date?: string
          id?: string
          investment?: number
          provider_income?: number
          updated_at?: string
        }
        Relationships: []
      }
      ticket_bookings: {
        Row: {
          created_at: string
          event_id: string
          id: string
          quantity: number
          status: string | null
          ticket_type: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          quantity: number
          status?: string | null
          ticket_type: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          quantity?: number
          status?: string | null
          ticket_type?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "nt_events"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          id: string
          pair: string
          profit: number
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          pair: string
          profit: number
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          pair?: string
          profit?: number
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trading_strategies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          timeframe: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          timeframe?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          timeframe?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          coin_symbol: string
          created_at: string
          fee: number | null
          from_address: string | null
          id: string
          status: string
          to_address: string | null
          tx_hash: string | null
          type: string
          updated_at: string
          user_id: string
          value_usd: number
          wallet_id: string
        }
        Insert: {
          amount: number
          coin_symbol: string
          created_at?: string
          fee?: number | null
          from_address?: string | null
          id?: string
          status?: string
          to_address?: string | null
          tx_hash?: string | null
          type: string
          updated_at?: string
          user_id: string
          value_usd: number
          wallet_id: string
        }
        Update: {
          amount?: number
          coin_symbol?: string
          created_at?: string
          fee?: number | null
          from_address?: string | null
          id?: string
          status?: string
          to_address?: string | null
          tx_hash?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          value_usd?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          recipient_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          recipient_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          recipient_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      updates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          ban_end_date: string | null
          created_at: string | null
          id: string
          is_banned: boolean | null
          last_active_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ban_end_date?: string | null
          created_at?: string | null
          id?: string
          is_banned?: boolean | null
          last_active_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ban_end_date?: string | null
          created_at?: string | null
          id?: string
          is_banned?: boolean | null
          last_active_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          created_at: string
          id: string
          total_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          total_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          total_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_crypto_holdings: {
        Row: {
          asset_id: string
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          asset_id: string
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          asset_id?: string
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_crypto_holdings_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "crypto_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_crypto_holdings_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_funds: {
        Row: {
          balance: number
          bot_profit: number | null
          created_at: string
          currency: string
          demo_balance: number | null
          demo_profit: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          bot_profit?: number | null
          created_at?: string
          currency?: string
          demo_balance?: number | null
          demo_profit?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          bot_profit?: number | null
          created_at?: string
          currency?: string
          demo_balance?: number | null
          demo_profit?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_funds_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_login_details: {
        Row: {
          created_at: string
          id: string
          login_password: string
          server: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          login_password: string
          server: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          login_password?: string
          server?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          city: string
          country: string
          created_at: string
          date_of_birth: string
          full_name: string
          gender: string
          id: string
          phone_number: string
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          date_of_birth: string
          full_name: string
          gender: string
          id: string
          phone_number: string
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          date_of_birth?: string
          full_name?: string
          gender?: string
          id?: string
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          currency_code: string
          currency_symbol: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency_code?: string
          currency_symbol?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          currency_symbol?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      virtual_cards: {
        Row: {
          address_line: string
          card_holder_name: string
          card_name: string | null
          card_number: string | null
          city: string
          country: string
          created_at: string
          cvv: string | null
          expiry_date: string | null
          id: string
          state: string
          updated_at: string
          user_id: string
          zip_code: string
        }
        Insert: {
          address_line: string
          card_holder_name: string
          card_name?: string | null
          card_number?: string | null
          city: string
          country: string
          created_at?: string
          cvv?: string | null
          expiry_date?: string | null
          id?: string
          state: string
          updated_at?: string
          user_id: string
          zip_code: string
        }
        Update: {
          address_line?: string
          card_holder_name?: string
          card_name?: string | null
          card_number?: string | null
          city?: string
          country?: string
          created_at?: string
          cvv?: string | null
          expiry_date?: string | null
          id?: string
          state?: string
          updated_at?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_appeals: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_system_status: {
        Row: {
          created_at: string
          id: string
          last_24h_count: number
          status: string
          threshold: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_24h_count?: number
          status?: string
          threshold?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_24h_count?: number
          status?: string
          threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          bank_details: Json | null
          created_at: string
          currency: string
          id: string
          payment_method: string
          status: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount: number
          bank_details?: Json | null
          created_at?: string
          currency?: string
          id?: string
          payment_method: string
          status?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          bank_details?: Json | null
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string
          status?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_old_binary_signals: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_referral_reward:
        | {
            Args: {
              referrer_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              referrer_id: string
              amount_input: number
            }
            Returns: undefined
          }
      update_user_profits: {
        Args: {
          bot_profit_amount: number
          contract_profit_amount: number
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      bot_type: "trading" | "contact"
      platform_type: "nextbase" | "murafx"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
