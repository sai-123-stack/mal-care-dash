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
      children: {
        Row: {
          awc_center: string
          city: string
          created_at: string | null
          current_status: string | null
          date_of_birth: string
          district: string
          gender: string
          guardian_name: string
          healthworker_id: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          awc_center: string
          city: string
          created_at?: string | null
          current_status?: string | null
          date_of_birth: string
          district: string
          gender: string
          guardian_name: string
          healthworker_id?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          awc_center?: string
          city?: string
          created_at?: string | null
          current_status?: string | null
          date_of_birth?: string
          district?: string
          gender?: string
          guardian_name?: string
          healthworker_id?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_healthworker_id_fkey"
            columns: ["healthworker_id"]
            isOneToOne: false
            referencedRelation: "healthworkers"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          child_id: string
          edema: boolean | null
          height: number
          id: string
          mam_probability: number | null
          meals_per_day: number | null
          normal_probability: number | null
          poverty_index: number | null
          predicted_status: string
          recorded_at: string | null
          recorded_by: string | null
          sam_probability: number | null
          sanitation_index: number | null
          weight: number
        }
        Insert: {
          child_id: string
          edema?: boolean | null
          height: number
          id?: string
          mam_probability?: number | null
          meals_per_day?: number | null
          normal_probability?: number | null
          poverty_index?: number | null
          predicted_status: string
          recorded_at?: string | null
          recorded_by?: string | null
          sam_probability?: number | null
          sanitation_index?: number | null
          weight: number
        }
        Update: {
          child_id?: string
          edema?: boolean | null
          height?: number
          id?: string
          mam_probability?: number | null
          meals_per_day?: number | null
          normal_probability?: number | null
          poverty_index?: number | null
          predicted_status?: string
          recorded_at?: string | null
          recorded_by?: string | null
          sam_probability?: number | null
          sanitation_index?: number | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "health_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "healthworkers"
            referencedColumns: ["id"]
          },
        ]
      }
      healthworkers: {
        Row: {
          awc_center: string
          created_at: string | null
          full_name: string
          id: string
          updated_at: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          awc_center: string
          created_at?: string | null
          full_name: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          awc_center?: string
          created_at?: string | null
          full_name?: string
          id?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          awc_center: string | null
          created_at: string | null
          full_name: string
          id: string
          role: string
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          awc_center?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          role: string
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          awc_center?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
          username?: string | null
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
