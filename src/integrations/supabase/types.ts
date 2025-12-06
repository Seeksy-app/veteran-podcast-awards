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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      awards_config: {
        Row: {
          created_at: string
          event_date: string | null
          id: string
          is_active: boolean
          name: string
          nominations_open: boolean
          updated_at: string
          voting_open: boolean
          year: number
        }
        Insert: {
          created_at?: string
          event_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          nominations_open?: boolean
          updated_at?: string
          voting_open?: boolean
          year: number
        }
        Update: {
          created_at?: string
          event_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          nominations_open?: boolean
          updated_at?: string
          voting_open?: boolean
          year?: number
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          clicked_count: number
          content: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          opened_count: number
          sent_at: string | null
          sent_count: number
          status: string
          subject: string
          target_list: string
        }
        Insert: {
          clicked_count?: number
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          opened_count?: number
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject: string
          target_list: string
        }
        Update: {
          clicked_count?: number
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          opened_count?: number
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string
          target_list?: string
        }
        Relationships: []
      }
      email_sends: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          contact_id: string | null
          email: string
          id: string
          opened_at: string | null
          resend_id: string | null
          sent_at: string
          status: string
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          contact_id?: string | null
          email: string
          id?: string
          opened_at?: string | null
          resend_id?: string | null
          sent_at?: string
          status?: string
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          contact_id?: string | null
          email?: string
          id?: string
          opened_at?: string | null
          resend_id?: string | null
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sends_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "podcast_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          podcast_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          podcast_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          podcast_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_nominees: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number
          host_name: string
          id: string
          image_url: string | null
          is_active: boolean
          podcast_name: string
          podcast_url: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number
          host_name: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          podcast_name: string
          podcast_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          host_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          podcast_name?: string
          podcast_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mailing_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      podcast_contacts: {
        Row: {
          contact_type: string | null
          created_at: string
          email: string
          host_name: string | null
          id: string
          is_on_vpn: boolean
          linked_podcast_id: string | null
          lists: string[] | null
          name: string
          notes: string | null
          podcast_name: string | null
          podcast_url: string | null
          rss_url: string | null
          source: string | null
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          contact_type?: string | null
          created_at?: string
          email: string
          host_name?: string | null
          id?: string
          is_on_vpn?: boolean
          linked_podcast_id?: string | null
          lists?: string[] | null
          name: string
          notes?: string | null
          podcast_name?: string | null
          podcast_url?: string | null
          rss_url?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          contact_type?: string | null
          created_at?: string
          email?: string
          host_name?: string | null
          id?: string
          is_on_vpn?: boolean
          linked_podcast_id?: string | null
          lists?: string[] | null
          name?: string
          notes?: string | null
          podcast_name?: string | null
          podcast_url?: string | null
          rss_url?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_contacts_linked_podcast_id_fkey"
            columns: ["linked_podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          rss_url: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          rss_url: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          rss_url?: string
          status?: string
        }
        Relationships: []
      }
      podcaster_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          recipient_id: string
          sender_email: string
          sender_name: string
          subject: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          recipient_id: string
          sender_email: string
          sender_name: string
          subject: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          recipient_id?: string
          sender_email?: string
          sender_name?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcaster_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          author: string | null
          created_at: string
          description: string | null
          display_order: number
          episodes: Json | null
          id: string
          image_url: string | null
          is_active: boolean
          last_fetched_at: string | null
          rss_url: string
          title: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          episodes?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          last_fetched_at?: string | null
          rss_url: string
          title: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          episodes?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          last_fetched_at?: string | null
          rss_url?: string
          title?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      pre_registrations: {
        Row: {
          created_at: string
          email: string
          id: string
          interested_in: string[] | null
          name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interested_in?: string[] | null
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interested_in?: string[] | null
          name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allow_contact: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          custom_voting_link: string | null
          email: string | null
          full_name: string | null
          id: string
          is_public: boolean | null
          podcast_id: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_twitter: string | null
          updated_at: string
          user_type: string | null
          username_slug: string | null
          website_url: string | null
        }
        Insert: {
          allow_contact?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          custom_voting_link?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_public?: boolean | null
          podcast_id?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          updated_at?: string
          user_type?: string | null
          username_slug?: string | null
          website_url?: string | null
        }
        Update: {
          allow_contact?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          custom_voting_link?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_public?: boolean | null
          podcast_id?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          updated_at?: string
          user_type?: string | null
          username_slug?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_assets: {
        Row: {
          asset_type: string
          asset_url: string
          created_at: string
          description: string | null
          id: string
          podcast_id: string
        }
        Insert: {
          asset_type: string
          asset_url: string
          created_at?: string
          description?: string | null
          id?: string
          podcast_id: string
        }
        Update: {
          asset_type?: string
          asset_url?: string
          created_at?: string
          description?: string | null
          id?: string
          podcast_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotional_assets_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_lists: {
        Row: {
          created_at: string
          description: string | null
          filters: Json
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          logo_url: string
          name: string
          tier: Database["public"]["Enums"]["sponsor_tier"]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url: string
          name: string
          tier?: Database["public"]["Enums"]["sponsor_tier"]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string
          name?: string
          tier?: Database["public"]["Enums"]["sponsor_tier"]
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vote_counts: {
        Row: {
          category_id: string
          id: string
          podcast_id: string
          updated_at: string
          vote_count: number
          year: number
        }
        Insert: {
          category_id: string
          id?: string
          podcast_id: string
          updated_at?: string
          vote_count?: number
          year?: number
        }
        Update: {
          category_id?: string
          id?: string
          podcast_id?: string
          updated_at?: string
          vote_count?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vote_counts_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          category_id: string
          created_at: string
          id: string
          nominee_id: string
          user_id: string
          year: number
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          nominee_id: string
          user_id: string
          year?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          nominee_id?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_nominee_id_fkey"
            columns: ["nominee_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_campaign_clicked: {
        Args: { campaign_id: string }
        Returns: undefined
      }
      increment_campaign_opened: {
        Args: { campaign_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      sponsor_tier: "platinum" | "gold" | "silver" | "bronze"
      user_type: "podcaster" | "voter" | "fan"
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
      app_role: ["admin", "moderator", "user"],
      sponsor_tier: ["platinum", "gold", "silver", "bronze"],
      user_type: ["podcaster", "voter", "fan"],
    },
  },
} as const
