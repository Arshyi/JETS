export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      build_history: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          listing_id: string;
          snapshot: Json;
          title: string;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          listing_id: string;
          snapshot: Json;
          title: string;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          listing_id?: string;
          snapshot?: Json;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      favorite_builds: {
        Row: {
          created_at: string;
          id: string;
          listing_id: string;
          snapshot: Json;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          listing_id: string;
          snapshot: Json;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          listing_id?: string;
          snapshot?: Json;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_builds: {
        Row: {
          created_at: string;
          id: string;
          listing_id: string;
          notes: string | null;
          snapshot: Json;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          listing_id: string;
          notes?: string | null;
          snapshot: Json;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          listing_id?: string;
          notes?: string | null;
          snapshot?: Json;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          created_at: string;
          default_budget_max: number | null;
          default_budget_min: number | null;
          default_location: string | null;
          email_notifications: boolean;
          preferred_theme: string;
          preferred_use_case: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          default_budget_max?: number | null;
          default_budget_min?: number | null;
          default_location?: string | null;
          email_notifications?: boolean;
          preferred_theme?: string;
          preferred_use_case?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          default_budget_max?: number | null;
          default_budget_min?: number | null;
          default_location?: string | null;
          email_notifications?: boolean;
          preferred_theme?: string;
          preferred_use_case?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type SavedBuildRow = Database["public"]["Tables"]["saved_builds"]["Row"];
export type FavoriteBuildRow =
  Database["public"]["Tables"]["favorite_builds"]["Row"];
export type BuildHistoryRow =
  Database["public"]["Tables"]["build_history"]["Row"];
export type UserSettingsRow =
  Database["public"]["Tables"]["user_settings"]["Row"];
