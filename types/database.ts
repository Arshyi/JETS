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
      acquisition_compare_sets: {
        Row: {
          acquisition_ids: string[];
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          acquisition_ids?: string[];
          created_at?: string;
          id?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          acquisition_ids?: string[];
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      acquisition_corrections: {
        Row: {
          acquisition_id: string;
          before_value: string | null;
          corrected_value: string | null;
          created_at: string;
          evidence_payload: Json;
          field_id: string;
          id: string;
          is_unknown: boolean;
          user_id: string;
        };
        Insert: {
          acquisition_id: string;
          before_value?: string | null;
          corrected_value?: string | null;
          created_at?: string;
          evidence_payload?: Json;
          field_id: string;
          id?: string;
          is_unknown?: boolean;
          user_id: string;
        };
        Update: {
          acquisition_id?: string;
          before_value?: string | null;
          corrected_value?: string | null;
          created_at?: string;
          evidence_payload?: Json;
          field_id?: string;
          id?: string;
          is_unknown?: boolean;
          user_id?: string;
        };
        Relationships: [];
      };
      acquisition_decisions: {
        Row: {
          acquisition_id: string;
          created_at: string;
          decision: string;
          id: string;
          metadata: Json;
          reason: string | null;
          user_id: string;
        };
        Insert: {
          acquisition_id: string;
          created_at?: string;
          decision: string;
          id?: string;
          metadata?: Json;
          reason?: string | null;
          user_id: string;
        };
        Update: {
          acquisition_id?: string;
          created_at?: string;
          decision?: string;
          id?: string;
          metadata?: Json;
          reason?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      acquisition_notes: {
        Row: {
          acquisition_id: string;
          body: string;
          created_at: string;
          id: string;
          note_type: string;
          user_id: string;
        };
        Insert: {
          acquisition_id: string;
          body: string;
          created_at?: string;
          id?: string;
          note_type?: string;
          user_id: string;
        };
        Update: {
          acquisition_id?: string;
          body?: string;
          created_at?: string;
          id?: string;
          note_type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      acquisition_project_links: {
        Row: {
          accepted_slot_ids: string[];
          acquisition_id: string;
          completed_at: string | null;
          created_at: string;
          evidence_links: Json;
          handoff_classification: string;
          handoff_status: string;
          id: string;
          link_type: string;
          project_id: string | null;
          rejected_slot_ids: string[];
          slot_mappings: Json;
          user_id: string;
        };
        Insert: {
          accepted_slot_ids?: string[];
          acquisition_id: string;
          completed_at?: string | null;
          created_at?: string;
          evidence_links?: Json;
          handoff_classification?: string;
          handoff_status?: string;
          id?: string;
          link_type?: string;
          project_id?: string | null;
          rejected_slot_ids?: string[];
          slot_mappings?: Json;
          user_id: string;
        };
        Update: {
          accepted_slot_ids?: string[];
          acquisition_id?: string;
          completed_at?: string | null;
          created_at?: string;
          evidence_links?: Json;
          handoff_classification?: string;
          handoff_status?: string;
          id?: string;
          link_type?: string;
          project_id?: string | null;
          rejected_slot_ids?: string[];
          slot_mappings?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      acquisition_records: {
        Row: {
          analysis_snapshot: Json;
          app_version: string;
          condition: string;
          confidence: string;
          created_at: string;
          currency: string;
          description: string;
          detected_platform_id: string | null;
          detected_platform_name: string | null;
          id: string;
          image_count: number;
          listing_url: string | null;
          location: string;
          marketplace: string;
          normalized_payload: Json;
          personal_notes: Json;
          price_amount: number | null;
          price_text: string;
          raw_payload: Json;
          readiness: string;
          recommendation_preview_score: number;
          seller_notes: string | null;
          source_id: string;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          analysis_snapshot?: Json;
          app_version?: string;
          condition: string;
          confidence: string;
          created_at?: string;
          currency: string;
          description: string;
          detected_platform_id?: string | null;
          detected_platform_name?: string | null;
          id?: string;
          image_count?: number;
          listing_url?: string | null;
          location: string;
          marketplace: string;
          normalized_payload?: Json;
          personal_notes?: Json;
          price_amount?: number | null;
          price_text: string;
          raw_payload?: Json;
          readiness: string;
          recommendation_preview_score?: number;
          seller_notes?: string | null;
          source_id: string;
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          analysis_snapshot?: Json;
          app_version?: string;
          condition?: string;
          confidence?: string;
          created_at?: string;
          currency?: string;
          description?: string;
          detected_platform_id?: string | null;
          detected_platform_name?: string | null;
          id?: string;
          image_count?: number;
          listing_url?: string | null;
          location?: string;
          marketplace?: string;
          normalized_payload?: Json;
          personal_notes?: Json;
          price_amount?: number | null;
          price_text?: string;
          raw_payload?: Json;
          readiness?: string;
          recommendation_preview_score?: number;
          seller_notes?: string | null;
          source_id?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
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
      evidence_sources: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json;
          publisher: string | null;
          review_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          source_key: string;
          source_type: string;
          submitted_by: string | null;
          title: string;
          trust_weight: number;
          updated_at: string;
          url: string | null;
          verification_status: string;
          visibility: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          publisher?: string | null;
          review_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          source_key: string;
          source_type: string;
          submitted_by?: string | null;
          title: string;
          trust_weight?: number;
          updated_at?: string;
          url?: string | null;
          verification_status?: string;
          visibility?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          publisher?: string | null;
          review_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          source_key?: string;
          source_type?: string;
          submitted_by?: string | null;
          title?: string;
          trust_weight?: number;
          updated_at?: string;
          url?: string | null;
          verification_status?: string;
          visibility?: string;
        };
        Relationships: [];
      };
      evidence_records: {
        Row: {
          app_version: string;
          claim: string;
          confidence: string;
          created_at: string;
          extraction_method: string;
          id: string;
          metadata: Json;
          platform_id: string | null;
          related_discovery_ids: string[];
          related_evidence_ids: string[];
          review_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          source_id: string | null;
          source_title: string;
          source_type: string;
          source_url: string | null;
          subject_id: string;
          subject_type: string;
          submitted_by: string | null;
          supersedes_evidence_id: string | null;
          supporting_text: string;
          updated_at: string;
          verification_status: string;
          visibility: string;
        };
        Insert: {
          app_version?: string;
          claim: string;
          confidence?: string;
          created_at?: string;
          extraction_method?: string;
          id?: string;
          metadata?: Json;
          platform_id?: string | null;
          related_discovery_ids?: string[];
          related_evidence_ids?: string[];
          review_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          source_id?: string | null;
          source_title: string;
          source_type: string;
          source_url?: string | null;
          subject_id: string;
          subject_type: string;
          submitted_by?: string | null;
          supersedes_evidence_id?: string | null;
          supporting_text: string;
          updated_at?: string;
          verification_status?: string;
          visibility?: string;
        };
        Update: {
          app_version?: string;
          claim?: string;
          confidence?: string;
          created_at?: string;
          extraction_method?: string;
          id?: string;
          metadata?: Json;
          platform_id?: string | null;
          related_discovery_ids?: string[];
          related_evidence_ids?: string[];
          review_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          source_id?: string | null;
          source_title?: string;
          source_type?: string;
          source_url?: string | null;
          subject_id?: string;
          subject_type?: string;
          submitted_by?: string | null;
          supersedes_evidence_id?: string | null;
          supporting_text?: string;
          updated_at?: string;
          verification_status?: string;
          visibility?: string;
        };
        Relationships: [];
      };
      evidence_conflicts: {
        Row: {
          claim_id: string;
          conflicting_evidence_ids: string[];
          created_at: string;
          created_by: string | null;
          current_handling: string;
          id: string;
          metadata: Json;
          platform_id: string | null;
          review_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          summary: string;
          title: string;
          updated_at: string;
          verification_status: string;
        };
        Insert: {
          claim_id: string;
          conflicting_evidence_ids?: string[];
          created_at?: string;
          created_by?: string | null;
          current_handling: string;
          id?: string;
          metadata?: Json;
          platform_id?: string | null;
          review_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          summary: string;
          title: string;
          updated_at?: string;
          verification_status?: string;
        };
        Update: {
          claim_id?: string;
          conflicting_evidence_ids?: string[];
          created_at?: string;
          created_by?: string | null;
          current_handling?: string;
          id?: string;
          metadata?: Json;
          platform_id?: string | null;
          review_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
          verification_status?: string;
        };
        Relationships: [];
      };
      evidence_timeline_events: {
        Row: {
          app_version: string;
          created_at: string;
          created_by: string | null;
          date_label: string;
          description: string;
          evidence_record_ids: string[];
          id: string;
          metadata: Json;
          platform_id: string;
          review_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          title: string;
          updated_at: string;
          verification_status: string;
        };
        Insert: {
          app_version?: string;
          created_at?: string;
          created_by?: string | null;
          date_label: string;
          description: string;
          evidence_record_ids?: string[];
          id?: string;
          metadata?: Json;
          platform_id: string;
          review_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          title: string;
          updated_at?: string;
          verification_status?: string;
        };
        Update: {
          app_version?: string;
          created_at?: string;
          created_by?: string | null;
          date_label?: string;
          description?: string;
          evidence_record_ids?: string[];
          id?: string;
          metadata?: Json;
          platform_id?: string;
          review_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          title?: string;
          updated_at?: string;
          verification_status?: string;
        };
        Relationships: [];
      };
      evidence_review_notes: {
        Row: {
          action: string;
          after_state: Json | null;
          before_state: Json | null;
          conflict_id: string | null;
          created_at: string;
          created_by: string | null;
          evidence_record_id: string | null;
          id: string;
          note: string;
          reason: string | null;
          timeline_event_id: string | null;
        };
        Insert: {
          action: string;
          after_state?: Json | null;
          before_state?: Json | null;
          conflict_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          evidence_record_id?: string | null;
          id?: string;
          note: string;
          reason?: string | null;
          timeline_event_id?: string | null;
        };
        Update: {
          action?: string;
          after_state?: Json | null;
          before_state?: Json | null;
          conflict_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          evidence_record_id?: string | null;
          id?: string;
          note?: string;
          reason?: string | null;
          timeline_event_id?: string | null;
        };
        Relationships: [];
      };
      parsed_field_evidence_links: {
        Row: {
          confidence: string;
          created_at: string;
          created_by: string | null;
          evidence_record_id: string;
          extraction_method: string;
          field_path: string;
          id: string;
          normalized_listing_id: string;
          source_id: string | null;
          subject_id: string;
          subject_type: string;
          verification_status: string;
        };
        Insert: {
          confidence?: string;
          created_at?: string;
          created_by?: string | null;
          evidence_record_id: string;
          extraction_method?: string;
          field_path: string;
          id?: string;
          normalized_listing_id: string;
          source_id?: string | null;
          subject_id: string;
          subject_type: string;
          verification_status?: string;
        };
        Update: {
          confidence?: string;
          created_at?: string;
          created_by?: string | null;
          evidence_record_id?: string;
          extraction_method?: string;
          field_path?: string;
          id?: string;
          normalized_listing_id?: string;
          source_id?: string | null;
          subject_id?: string;
          subject_type?: string;
          verification_status?: string;
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
      normalized_marketplace_listings: {
        Row: {
          app_version: string;
          condition: string | null;
          created_at: string;
          currency: string;
          detected_components: Json;
          evidence_record_ids: string[];
          id: string;
          image_urls: string[];
          listing_health: Json;
          listing_health_score: number;
          listing_key: string;
          listing_status: string;
          location: string | null;
          marketplace: string;
          marketplace_listing_id: string;
          normalized_payload: Json;
          normalized_platform_id: string | null;
          parsing_confidence: string;
          price: number | null;
          raw_description: string;
          raw_payload: Json;
          raw_title: string;
          readiness_reasons: string[];
          recommendation_readiness: string;
          review_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          seller: string | null;
          source_kind: string;
          source_url: string | null;
          submitted_by: string | null;
          updated_at: string;
          verification_status: string;
          visibility: string;
        };
        Insert: {
          app_version?: string;
          condition?: string | null;
          created_at?: string;
          currency?: string;
          detected_components?: Json;
          evidence_record_ids?: string[];
          id?: string;
          image_urls?: string[];
          listing_health?: Json;
          listing_health_score?: number;
          listing_key: string;
          listing_status?: string;
          location?: string | null;
          marketplace: string;
          marketplace_listing_id: string;
          normalized_payload?: Json;
          normalized_platform_id?: string | null;
          parsing_confidence?: string;
          price?: number | null;
          raw_description: string;
          raw_payload?: Json;
          raw_title: string;
          readiness_reasons?: string[];
          recommendation_readiness?: string;
          review_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          seller?: string | null;
          source_kind?: string;
          source_url?: string | null;
          submitted_by?: string | null;
          updated_at?: string;
          verification_status?: string;
          visibility?: string;
        };
        Update: {
          app_version?: string;
          condition?: string | null;
          created_at?: string;
          currency?: string;
          detected_components?: Json;
          evidence_record_ids?: string[];
          id?: string;
          image_urls?: string[];
          listing_health?: Json;
          listing_health_score?: number;
          listing_key?: string;
          listing_status?: string;
          location?: string | null;
          marketplace?: string;
          marketplace_listing_id?: string;
          normalized_payload?: Json;
          normalized_platform_id?: string | null;
          parsing_confidence?: string;
          price?: number | null;
          raw_description?: string;
          raw_payload?: Json;
          raw_title?: string;
          readiness_reasons?: string[];
          recommendation_readiness?: string;
          review_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          seller?: string | null;
          source_kind?: string;
          source_url?: string | null;
          submitted_by?: string | null;
          updated_at?: string;
          verification_status?: string;
          visibility?: string;
        };
        Relationships: [];
      };
      listing_parsed_fields: {
        Row: {
          confidence: string;
          corrected_value: string | null;
          correction_reason: string | null;
          created_at: string;
          created_by: string | null;
          evidence_record_ids: string[];
          field_label: string;
          field_path: string;
          field_source: string;
          final_value: string | null;
          id: string;
          normalized_listing_id: string;
          parsed_value: string | null;
          review_status: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          updated_at: string;
          verification_status: string;
        };
        Insert: {
          confidence?: string;
          corrected_value?: string | null;
          correction_reason?: string | null;
          created_at?: string;
          created_by?: string | null;
          evidence_record_ids?: string[];
          field_label: string;
          field_path: string;
          field_source?: string;
          final_value?: string | null;
          id?: string;
          normalized_listing_id: string;
          parsed_value?: string | null;
          review_status?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          updated_at?: string;
          verification_status?: string;
        };
        Update: {
          confidence?: string;
          corrected_value?: string | null;
          correction_reason?: string | null;
          created_at?: string;
          created_by?: string | null;
          evidence_record_ids?: string[];
          field_label?: string;
          field_path?: string;
          field_source?: string;
          final_value?: string | null;
          id?: string;
          normalized_listing_id?: string;
          parsed_value?: string | null;
          review_status?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          updated_at?: string;
          verification_status?: string;
        };
        Relationships: [];
      };
      listing_field_corrections: {
        Row: {
          after_value: string | null;
          before_value: string | null;
          created_at: string;
          created_by: string | null;
          evidence_record_id: string | null;
          field_path: string;
          id: string;
          normalized_listing_id: string;
          parsed_field_id: string | null;
          reason: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
        };
        Insert: {
          after_value?: string | null;
          before_value?: string | null;
          created_at?: string;
          created_by?: string | null;
          evidence_record_id?: string | null;
          field_path: string;
          id?: string;
          normalized_listing_id: string;
          parsed_field_id?: string | null;
          reason: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
        };
        Update: {
          after_value?: string | null;
          before_value?: string | null;
          created_at?: string;
          created_by?: string | null;
          evidence_record_id?: string | null;
          field_path?: string;
          id?: string;
          normalized_listing_id?: string;
          parsed_field_id?: string | null;
          reason?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      listing_duplicate_candidates: {
        Row: {
          candidate_listing_id: string | null;
          candidate_listing_key: string | null;
          confidence: string;
          created_at: string;
          id: string;
          normalized_listing_id: string;
          review_reason: string | null;
          review_status: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          signals: Json;
          status: string;
        };
        Insert: {
          candidate_listing_id?: string | null;
          candidate_listing_key?: string | null;
          confidence?: string;
          created_at?: string;
          id?: string;
          normalized_listing_id: string;
          review_reason?: string | null;
          review_status?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          signals?: Json;
          status?: string;
        };
        Update: {
          candidate_listing_id?: string | null;
          candidate_listing_key?: string | null;
          confidence?: string;
          created_at?: string;
          id?: string;
          normalized_listing_id?: string;
          review_reason?: string | null;
          review_status?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          signals?: Json;
          status?: string;
        };
        Relationships: [];
      };
      listing_review_events: {
        Row: {
          action: string;
          after_state: Json | null;
          before_state: Json | null;
          correction_id: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          normalized_listing_id: string | null;
          parsed_field_id: string | null;
          reason: string | null;
          summary: string;
        };
        Insert: {
          action: string;
          after_state?: Json | null;
          before_state?: Json | null;
          correction_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          normalized_listing_id?: string | null;
          parsed_field_id?: string | null;
          reason?: string | null;
          summary: string;
        };
        Update: {
          action?: string;
          after_state?: Json | null;
          before_state?: Json | null;
          correction_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          normalized_listing_id?: string | null;
          parsed_field_id?: string | null;
          reason?: string | null;
          summary?: string;
        };
        Relationships: [];
      };
      importer_fixture_runs: {
        Row: {
          app_version: string;
          created_at: string;
          created_by: string | null;
          created_count: number;
          error_count: number;
          finished_at: string | null;
          fixture_count: number;
          fixture_set_id: string;
          id: string;
          mode: string;
          skipped_count: number;
          started_at: string;
          status: string;
          summary: Json;
          updated_count: number;
        };
        Insert: {
          app_version?: string;
          created_at?: string;
          created_by?: string | null;
          created_count?: number;
          error_count?: number;
          finished_at?: string | null;
          fixture_count?: number;
          fixture_set_id: string;
          id?: string;
          mode?: string;
          skipped_count?: number;
          started_at?: string;
          status?: string;
          summary?: Json;
          updated_count?: number;
        };
        Update: {
          app_version?: string;
          created_at?: string;
          created_by?: string | null;
          created_count?: number;
          error_count?: number;
          finished_at?: string | null;
          fixture_count?: number;
          fixture_set_id?: string;
          id?: string;
          mode?: string;
          skipped_count?: number;
          started_at?: string;
          status?: string;
          summary?: Json;
          updated_count?: number;
        };
        Relationships: [];
      };
      importer_fixture_run_items: {
        Row: {
          created_at: string;
          error_codes: string[];
          external_id: string;
          fixture_key: string;
          id: string;
          listing_key: string | null;
          marketplace: string;
          message: string;
          metadata: Json;
          normalized_listing_id: string | null;
          run_id: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          error_codes?: string[];
          external_id: string;
          fixture_key: string;
          id?: string;
          listing_key?: string | null;
          marketplace: string;
          message: string;
          metadata?: Json;
          normalized_listing_id?: string | null;
          run_id: string;
          status: string;
        };
        Update: {
          created_at?: string;
          error_codes?: string[];
          external_id?: string;
          fixture_key?: string;
          id?: string;
          listing_key?: string | null;
          marketplace?: string;
          message?: string;
          metadata?: Json;
          normalized_listing_id?: string | null;
          run_id?: string;
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
export type AcquisitionCompareSetRow =
  Database["public"]["Tables"]["acquisition_compare_sets"]["Row"];
export type AcquisitionCorrectionRow =
  Database["public"]["Tables"]["acquisition_corrections"]["Row"];
export type AcquisitionDecisionRow =
  Database["public"]["Tables"]["acquisition_decisions"]["Row"];
export type AcquisitionNoteRow =
  Database["public"]["Tables"]["acquisition_notes"]["Row"];
export type AcquisitionProjectLinkRow =
  Database["public"]["Tables"]["acquisition_project_links"]["Row"];
export type AcquisitionRecordRow =
  Database["public"]["Tables"]["acquisition_records"]["Row"];
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
export type NormalizedMarketplaceListingRow =
  Database["public"]["Tables"]["normalized_marketplace_listings"]["Row"];
export type ListingParsedFieldRow =
  Database["public"]["Tables"]["listing_parsed_fields"]["Row"];
export type ListingFieldCorrectionRow =
  Database["public"]["Tables"]["listing_field_corrections"]["Row"];
export type ListingDuplicateCandidateRow =
  Database["public"]["Tables"]["listing_duplicate_candidates"]["Row"];
export type ListingReviewEventRow =
  Database["public"]["Tables"]["listing_review_events"]["Row"];
export type ImporterFixtureRunRow =
  Database["public"]["Tables"]["importer_fixture_runs"]["Row"];
export type ImporterFixtureRunItemRow =
  Database["public"]["Tables"]["importer_fixture_run_items"]["Row"];
export type EvidenceSourceRow =
  Database["public"]["Tables"]["evidence_sources"]["Row"];
export type EvidenceRecordRow =
  Database["public"]["Tables"]["evidence_records"]["Row"];
export type EvidenceConflictRow =
  Database["public"]["Tables"]["evidence_conflicts"]["Row"];
export type EvidenceTimelineEventRow =
  Database["public"]["Tables"]["evidence_timeline_events"]["Row"];
export type EvidenceReviewNoteRow =
  Database["public"]["Tables"]["evidence_review_notes"]["Row"];
export type ParsedFieldEvidenceLinkRow =
  Database["public"]["Tables"]["parsed_field_evidence_links"]["Row"];
