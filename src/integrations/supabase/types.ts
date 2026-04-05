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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          photographer_id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          photographer_id: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          photographer_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          id: string
          message: string | null
          photographer_id: string
          service_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          booking_date?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          photographer_id: string
          service_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          booking_date?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          id?: string
          message?: string | null
          photographer_id?: string
          service_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author: string
          created_at: string
          gallery_id: string
          id: string
          image_id: string | null
          message: string
          parent_id: string | null
        }
        Insert: {
          author?: string
          created_at?: string
          gallery_id: string
          id?: string
          image_id?: string | null
          message: string
          parent_id?: string | null
        }
        Update: {
          author?: string
          created_at?: string
          gallery_id?: string
          id?: string
          image_id?: string | null
          message?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "gallery_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          client_session: string
          created_at: string
          id: string
          image_id: string
        }
        Insert: {
          client_session: string
          created_at?: string
          id?: string
          image_id: string
        }
        Update: {
          client_session?: string
          created_at?: string
          id?: string
          image_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "gallery_images"
            referencedColumns: ["id"]
          },
        ]
      }
      galleries: {
        Row: {
          brand_color: string | null
          client_name: string
          created_at: string
          download_enabled: boolean | null
          expires_at: string | null
          hero_banner_url: string | null
          id: string
          note: string | null
          password_hash: string | null
          photographer_id: string
          title: string
          updated_at: string
          views_count: number | null
          welcome_message: string | null
        }
        Insert: {
          brand_color?: string | null
          client_name?: string
          created_at?: string
          download_enabled?: boolean | null
          expires_at?: string | null
          hero_banner_url?: string | null
          id?: string
          note?: string | null
          password_hash?: string | null
          photographer_id: string
          title: string
          updated_at?: string
          views_count?: number | null
          welcome_message?: string | null
        }
        Update: {
          brand_color?: string | null
          client_name?: string
          created_at?: string
          download_enabled?: boolean | null
          expires_at?: string | null
          hero_banner_url?: string | null
          id?: string
          note?: string | null
          password_hash?: string | null
          photographer_id?: string
          title?: string
          updated_at?: string
          views_count?: number | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "galleries_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          created_at: string
          gallery_id: string
          id: string
          image_url: string
          note: string | null
          sort_order: number | null
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string
          gallery_id: string
          id?: string
          image_url: string
          note?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string
          gallery_id?: string
          id?: string
          image_url?: string
          note?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          about: string | null
          created_at: string
          id: string
          photographer_id: string
          published: boolean | null
          sections: Json | null
          tagline: string | null
          title: string
          updated_at: string
        }
        Insert: {
          about?: string | null
          created_at?: string
          id?: string
          photographer_id: string
          published?: boolean | null
          sections?: Json | null
          tagline?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          about?: string | null
          created_at?: string
          id?: string
          photographer_id?: string
          published?: boolean | null
          sections?: Json | null
          tagline?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          brand_color: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          logo_url: string | null
          onboarded: boolean | null
          phone: string | null
          studio_name: string | null
          subdomain: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          brand_color?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          logo_url?: string | null
          onboarded?: boolean | null
          phone?: string | null
          studio_name?: string | null
          subdomain?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          brand_color?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          logo_url?: string | null
          onboarded?: boolean | null
          phone?: string | null
          studio_name?: string | null
          subdomain?: string | null
          updated_at?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
