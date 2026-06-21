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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bar_enrichment_runs: {
        Row: {
          bar_id: string
          error: string | null
          id: string
          images_count: number
          menu_items_count: number
          status: string
          updated_at: string
        }
        Insert: {
          bar_id: string
          error?: string | null
          id?: string
          images_count?: number
          menu_items_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          bar_id?: string
          error?: string | null
          id?: string
          images_count?: number
          menu_items_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bar_enrichment_runs_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: true
            referencedRelation: "bars"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_images: {
        Row: {
          bar_id: string
          created_at: string
          height: number | null
          id: string
          kind: string
          position: number
          source_url: string | null
          storage_path: string | null
          width: number | null
        }
        Insert: {
          bar_id: string
          created_at?: string
          height?: number | null
          id?: string
          kind?: string
          position?: number
          source_url?: string | null
          storage_path?: string | null
          width?: number | null
        }
        Update: {
          bar_id?: string
          created_at?: string
          height?: number | null
          id?: string
          kind?: string
          position?: number
          source_url?: string | null
          storage_path?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bar_images_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bars"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_menu_items: {
        Row: {
          bar_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          position: number
          price_text: string | null
          section: string | null
        }
        Insert: {
          bar_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          position?: number
          price_text?: string | null
          section?: string | null
        }
        Update: {
          bar_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          position?: number
          price_text?: string | null
          section?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bar_menu_items_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bars"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_menus: {
        Row: {
          bar_id: string
          id: string
          markdown: string | null
          pdf_storage_path: string | null
          scraped_at: string
          source_url: string | null
        }
        Insert: {
          bar_id: string
          id?: string
          markdown?: string | null
          pdf_storage_path?: string | null
          scraped_at?: string
          source_url?: string | null
        }
        Update: {
          bar_id?: string
          id?: string
          markdown?: string | null
          pdf_storage_path?: string | null
          scraped_at?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bar_menus_bar_id_fkey"
            columns: ["bar_id"]
            isOneToOne: false
            referencedRelation: "bars"
            referencedColumns: ["id"]
          },
        ]
      }
      bar_places_runs: {
        Row: {
          bar_id: string
          error: string | null
          got_hours: boolean
          got_image: boolean
          got_phone: boolean
          got_website: boolean
          place_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          bar_id: string
          error?: string | null
          got_hours?: boolean
          got_image?: boolean
          got_phone?: boolean
          got_website?: boolean
          place_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          bar_id?: string
          error?: string | null
          got_hours?: boolean
          got_image?: boolean
          got_phone?: boolean
          got_website?: boolean
          place_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      bars: {
        Row: {
          address: string | null
          category: string | null
          created_at: string
          description: string | null
          email: string | null
          google_maps_link: string | null
          id: string
          image_url: string | null
          name: string
          operating_hours: string | null
          phone: string | null
          slug: string
          social_media_links: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          google_maps_link?: string | null
          id?: string
          image_url?: string | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          slug: string
          social_media_links?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          google_maps_link?: string | null
          id?: string
          image_url?: string | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          slug?: string
          social_media_links?: string | null
          website?: string | null
        }
        Relationships: []
      }
      cocktail_questionnaire_responses: {
        Row: {
          created_at: string
          email: string
          flavor_preference: string
          id: string
          occasion: string
          recommended_cocktail: string | null
          spirit_preference: string
          strength_preference: string
        }
        Insert: {
          created_at?: string
          email: string
          flavor_preference: string
          id?: string
          occasion: string
          recommended_cocktail?: string | null
          spirit_preference: string
          strength_preference: string
        }
        Update: {
          created_at?: string
          email?: string
          flavor_preference?: string
          id?: string
          occasion?: string
          recommended_cocktail?: string | null
          spirit_preference?: string
          strength_preference?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_bar_stats: { Args: never; Returns: Json }
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
