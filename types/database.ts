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
      build_project_audit_events: {
        Row: {
          after_state: Json | null;
          before_state: Json | null;
          created_at: string;
          event_type: string;
          id: string;
          metadata: Json;
          project_id: string;
          summary: string;
          user_id: string;
        };
        Insert: {
          after_state?: Json | null;
          before_state?: Json | null;
          created_at?: string;
          event_type: string;
          id?: string;
          metadata?: Json;
          project_id: string;
          summary: string;
          user_id: string;
        };
        Update: {
          after_state?: Json | null;
          before_state?: Json | null;
          created_at?: string;
          event_type?: string;
          id?: string;
          metadata?: Json;
          project_id?: string;
          summary?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      build_project_notes: {
        Row: {
          created_at: string;
          id: string;
          note: string;
          project_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note: string;
          project_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string;
          project_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      build_project_optimization_runs: {
        Row: {
          app_version: string;
          baseline_score: number;
          created_at: string;
          depth: string;
          goal: string;
          id: string;
          input_project_snapshot: Json;
          locked_slots: string[];
          optimized_score: number;
          project_id: string;
          summary: string;
          user_id: string;
        };
        Insert: {
          app_version?: string;
          baseline_score: number;
          created_at?: string;
          depth: string;
          goal: string;
          id?: string;
          input_project_snapshot: Json;
          locked_slots?: string[];
          optimized_score: number;
          project_id: string;
          summary: string;
          user_id: string;
        };
        Update: {
          app_version?: string;
          baseline_score?: number;
          created_at?: string;
          depth?: string;
          goal?: string;
          id?: string;
          input_project_snapshot?: Json;
          locked_slots?: string[];
          optimized_score?: number;
          project_id?: string;
          summary?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      build_project_optimization_suggestions: {
        Row: {
          action: string;
          compatibility_impact: number;
          confidence: number;
          created_at: string;
          current_component_id: string | null;
          current_component_title: string | null;
          estimated_cost_delta: number;
          id: string;
          power_impact: number;
          project_id: string;
          ranking: number;
          reason: string;
          reliability_impact: number;
          run_id: string;
          score_delta: number;
          slot_id: string;
          suggested_component_id: string | null;
          suggested_component_snapshot: Json | null;
          suggested_component_title: string | null;
          upgradeability_impact: number;
          user_id: string;
        };
        Insert: {
          action: string;
          compatibility_impact?: number;
          confidence?: number;
          created_at?: string;
          current_component_id?: string | null;
          current_component_title?: string | null;
          estimated_cost_delta?: number;
          id?: string;
          power_impact?: number;
          project_id: string;
          ranking: number;
          reason: string;
          reliability_impact?: number;
          run_id: string;
          score_delta?: number;
          slot_id: string;
          suggested_component_id?: string | null;
          suggested_component_snapshot?: Json | null;
          suggested_component_title?: string | null;
          upgradeability_impact?: number;
          user_id: string;
        };
        Update: {
          action?: string;
          compatibility_impact?: number;
          confidence?: number;
          created_at?: string;
          current_component_id?: string | null;
          current_component_title?: string | null;
          estimated_cost_delta?: number;
          id?: string;
          power_impact?: number;
          project_id?: string;
          ranking?: number;
          reason?: string;
          reliability_impact?: number;
          run_id?: string;
          score_delta?: number;
          slot_id?: string;
          suggested_component_id?: string | null;
          suggested_component_snapshot?: Json | null;
          suggested_component_title?: string | null;
          upgradeability_impact?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      build_project_slots: {
        Row: {
          component_category: string | null;
          component_id: string | null;
          component_snapshot: Json | null;
          created_at: string;
          id: string;
          notes: string;
          project_id: string;
          slot_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          component_category?: string | null;
          component_id?: string | null;
          component_snapshot?: Json | null;
          created_at?: string;
          id?: string;
          notes?: string;
          project_id: string;
          slot_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          component_category?: string | null;
          component_id?: string | null;
          component_snapshot?: Json | null;
          created_at?: string;
          id?: string;
          notes?: string;
          project_id?: string;
          slot_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      build_projects: {
        Row: {
          app_version: string;
          branch_depth: number;
          branch_name: string;
          branch_notes: string;
          branch_source: string;
          budget: number;
          country: string;
          created_at: string;
          currency: string;
          id: string;
          owned_items: Json;
          parent_project_id: string | null;
          preferences: Json;
          purpose: string;
          root_project_id: string | null;
          source_optimization_run_id: string | null;
          source_optimization_suggestion_ids: string[];
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          app_version?: string;
          branch_depth?: number;
          branch_name?: string;
          branch_notes?: string;
          branch_source?: string;
          budget?: number;
          country: string;
          created_at?: string;
          currency: string;
          id?: string;
          owned_items?: Json;
          parent_project_id?: string | null;
          preferences?: Json;
          purpose: string;
          root_project_id?: string | null;
          source_optimization_run_id?: string | null;
          source_optimization_suggestion_ids?: string[];
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          app_version?: string;
          branch_depth?: number;
          branch_name?: string;
          branch_notes?: string;
          branch_source?: string;
          budget?: number;
          country?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          owned_items?: Json;
          parent_project_id?: string | null;
          preferences?: Json;
          purpose?: string;
          root_project_id?: string | null;
          source_optimization_run_id?: string | null;
          source_optimization_suggestion_ids?: string[];
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      build_snapshots: {
        Row: {
          app_version: string;
          budget: number;
          country: string;
          created_at: string;
          currency: string;
          id: string;
          is_favorite: boolean;
          notes: string;
          platform_health: number;
          primary_use_case: string;
          snapshot: Json;
          status: string;
          title: string;
          top_compatibility_score: number;
          top_decision_score: number;
          top_listing_id: string;
          top_listing_title: string;
          top_overall_score: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          app_version: string;
          budget: number;
          country: string;
          created_at?: string;
          currency: string;
          id?: string;
          is_favorite?: boolean;
          notes?: string;
          platform_health: number;
          primary_use_case: string;
          snapshot: Json;
          status?: string;
          title: string;
          top_compatibility_score: number;
          top_decision_score: number;
          top_listing_id: string;
          top_listing_title: string;
          top_overall_score: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          app_version?: string;
          budget?: number;
          country?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          is_favorite?: boolean;
          notes?: string;
          platform_health?: number;
          primary_use_case?: string;
          snapshot?: Json;
          status?: string;
          title?: string;
          top_compatibility_score?: number;
          top_decision_score?: number;
          top_listing_id?: string;
          top_listing_title?: string;
          top_overall_score?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      decision_audit_events: {
        Row: {
          after_state: Json | null;
          app_version: string;
          before_state: Json | null;
          created_at: string;
          event_type: string;
          id: string;
          metadata: Json;
          note: string | null;
          subject_id: string | null;
          subject_title: string;
          subject_type: string;
          summary: string;
          user_id: string;
        };
        Insert: {
          after_state?: Json | null;
          app_version?: string;
          before_state?: Json | null;
          created_at?: string;
          event_type: string;
          id?: string;
          metadata?: Json;
          note?: string | null;
          subject_id?: string | null;
          subject_title: string;
          subject_type: string;
          summary: string;
          user_id: string;
        };
        Update: {
          after_state?: Json | null;
          app_version?: string;
          before_state?: Json | null;
          created_at?: string;
          event_type?: string;
          id?: string;
          metadata?: Json;
          note?: string | null;
          subject_id?: string | null;
          subject_title?: string;
          subject_type?: string;
          summary?: string;
          user_id?: string;
        };
        Relationships: [];
      };
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
export type BuildProjectRow =
  Database["public"]["Tables"]["build_projects"]["Row"];
export type BuildProjectSlotRow =
  Database["public"]["Tables"]["build_project_slots"]["Row"];
export type BuildProjectNoteRow =
  Database["public"]["Tables"]["build_project_notes"]["Row"];
export type BuildProjectOptimizationRunRow =
  Database["public"]["Tables"]["build_project_optimization_runs"]["Row"];
export type BuildProjectOptimizationSuggestionRow =
  Database["public"]["Tables"]["build_project_optimization_suggestions"]["Row"];
export type BuildProjectAuditEventRow =
  Database["public"]["Tables"]["build_project_audit_events"]["Row"];
export type BuildSnapshotRow =
  Database["public"]["Tables"]["build_snapshots"]["Row"];
export type DecisionAuditEventRow =
  Database["public"]["Tables"]["decision_audit_events"]["Row"];
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
