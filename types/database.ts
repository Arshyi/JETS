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
      ingested_listings: {
        Row: {
          category: string;
          condition: string;
          created_at: string;
          currency: string;
          description: string | null;
          duplicate_key: string;
          external_id: string;
          first_seen_at: string;
          form_factor: string;
          freshness_status: string;
          id: string;
          last_seen_at: string;
          listing_url: string | null;
          location: string | null;
          price: number | null;
          raw_payload: Json;
          recommended_use_cases: string[];
          risk_signals: string[];
          seller_name: string | null;
          source_id: string;
          specs: Json;
          title: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          condition: string;
          created_at?: string;
          currency?: string;
          description?: string | null;
          duplicate_key: string;
          external_id: string;
          first_seen_at: string;
          form_factor: string;
          freshness_status: string;
          id?: string;
          last_seen_at: string;
          listing_url?: string | null;
          location?: string | null;
          price?: number | null;
          raw_payload?: Json;
          recommended_use_cases?: string[];
          risk_signals?: string[];
          seller_name?: string | null;
          source_id: string;
          specs?: Json;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          condition?: string;
          created_at?: string;
          currency?: string;
          description?: string | null;
          duplicate_key?: string;
          external_id?: string;
          first_seen_at?: string;
          form_factor?: string;
          freshness_status?: string;
          id?: string;
          last_seen_at?: string;
          listing_url?: string | null;
          location?: string | null;
          price?: number | null;
          raw_payload?: Json;
          recommended_use_cases?: string[];
          risk_signals?: string[];
          seller_name?: string | null;
          source_id?: string;
          specs?: Json;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ingestion_runs: {
        Row: {
          created_at: string;
          duplicates_detected: number;
          errors: Json;
          finished_at: string | null;
          id: string;
          listings_normalized: number;
          listings_seen: number;
          metadata: Json;
          mode: string;
          source_id: string | null;
          stale_listings: number;
          started_at: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          duplicates_detected?: number;
          errors?: Json;
          finished_at?: string | null;
          id?: string;
          listings_normalized?: number;
          listings_seen?: number;
          metadata?: Json;
          mode?: string;
          source_id?: string | null;
          stale_listings?: number;
          started_at?: string;
          status: string;
        };
        Update: {
          created_at?: string;
          duplicates_detected?: number;
          errors?: Json;
          finished_at?: string | null;
          id?: string;
          listings_normalized?: number;
          listings_seen?: number;
          metadata?: Json;
          mode?: string;
          source_id?: string | null;
          stale_listings?: number;
          started_at?: string;
          status?: string;
        };
        Relationships: [];
      };
      listing_sources: {
        Row: {
          adapter_mode: string;
          base_url: string | null;
          compliance_notes: string[];
          created_at: string;
          enabled: boolean;
          id: string;
          kind: string;
          location_scope: string;
          name: string;
          rate_limit_notes: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          adapter_mode?: string;
          base_url?: string | null;
          compliance_notes?: string[];
          created_at?: string;
          enabled?: boolean;
          id: string;
          kind: string;
          location_scope: string;
          name: string;
          rate_limit_notes: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          adapter_mode?: string;
          base_url?: string | null;
          compliance_notes?: string[];
          created_at?: string;
          enabled?: boolean;
          id?: string;
          kind?: string;
          location_scope?: string;
          name?: string;
          rate_limit_notes?: string;
          status?: string;
          updated_at?: string;
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
export type ListingSourceRow =
  Database["public"]["Tables"]["listing_sources"]["Row"];
export type IngestedListingRow =
  Database["public"]["Tables"]["ingested_listings"]["Row"];
export type IngestionRunRow =
  Database["public"]["Tables"]["ingestion_runs"]["Row"];
