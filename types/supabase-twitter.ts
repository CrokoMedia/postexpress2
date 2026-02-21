/**
 * Supabase Types - Twitter Monitoring System
 * Auto-generated from Migration 004
 * DO NOT EDIT MANUALLY
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      twitter_experts: {
        Row: {
          id: string
          twitter_username: string
          twitter_user_id: string | null
          display_name: string | null
          is_active: boolean
          themes: string[]
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          twitter_username: string
          twitter_user_id?: string | null
          display_name?: string | null
          is_active?: boolean
          themes?: string[]
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          twitter_username?: string
          twitter_user_id?: string | null
          display_name?: string | null
          is_active?: boolean
          themes?: string[]
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      twitter_stream_rules: {
        Row: {
          id: string
          twitter_rule_id: string | null
          rule_value: string
          rule_tag: string
          expert_id: string | null
          is_active: boolean
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          twitter_rule_id?: string | null
          rule_value: string
          rule_tag: string
          expert_id?: string | null
          is_active?: boolean
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          twitter_rule_id?: string | null
          rule_value?: string
          rule_tag?: string
          expert_id?: string | null
          is_active?: boolean
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      twitter_content_updates: {
        Row: {
          id: string
          tweet_id: string
          tweet_text: string
          tweet_url: string
          expert_id: string | null
          author_username: string
          author_display_name: string | null
          likes_count: number
          retweets_count: number
          replies_count: number
          published_at: string
          detected_at: string
          themes: string[] | null
          sentiment: string | null
          notified: boolean
          notified_at: string | null
          raw_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tweet_id: string
          tweet_text: string
          tweet_url: string
          expert_id?: string | null
          author_username: string
          author_display_name?: string | null
          likes_count?: number
          retweets_count?: number
          replies_count?: number
          published_at: string
          detected_at?: string
          themes?: string[] | null
          sentiment?: string | null
          notified?: boolean
          notified_at?: string | null
          raw_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tweet_id?: string
          tweet_text?: string
          tweet_url?: string
          expert_id?: string | null
          author_username?: string
          author_display_name?: string | null
          likes_count?: number
          retweets_count?: number
          replies_count?: number
          published_at?: string
          detected_at?: string
          themes?: string[] | null
          sentiment?: string | null
          notified?: boolean
          notified_at?: string | null
          raw_data?: Json | null
          created_at?: string
        }
      }
      twitter_monitoring_log: {
        Row: {
          id: string
          event_type: string
          expert_id: string | null
          rule_id: string | null
          tweet_id: string | null
          success: boolean | null
          error_message: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          expert_id?: string | null
          rule_id?: string | null
          tweet_id?: string | null
          success?: boolean | null
          error_message?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          expert_id?: string | null
          rule_id?: string | null
          tweet_id?: string | null
          success?: boolean | null
          error_message?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types para uso mais fácil
export type TwitterExpert = Database['public']['Tables']['twitter_experts']['Row']
export type TwitterExpertInsert = Database['public']['Tables']['twitter_experts']['Insert']
export type TwitterExpertUpdate = Database['public']['Tables']['twitter_experts']['Update']

export type TwitterStreamRule = Database['public']['Tables']['twitter_stream_rules']['Row']
export type TwitterStreamRuleInsert = Database['public']['Tables']['twitter_stream_rules']['Insert']
export type TwitterStreamRuleUpdate = Database['public']['Tables']['twitter_stream_rules']['Update']

export type TwitterContentUpdate = Database['public']['Tables']['twitter_content_updates']['Row']
export type TwitterContentUpdateInsert = Database['public']['Tables']['twitter_content_updates']['Insert']
export type TwitterContentUpdateUpdate = Database['public']['Tables']['twitter_content_updates']['Update']

export type TwitterMonitoringLog = Database['public']['Tables']['twitter_monitoring_log']['Row']
export type TwitterMonitoringLogInsert = Database['public']['Tables']['twitter_monitoring_log']['Insert']
export type TwitterMonitoringLogUpdate = Database['public']['Tables']['twitter_monitoring_log']['Update']
