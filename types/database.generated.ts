export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string;
          display_name: string;
          is_active: boolean;
          last_seen_at: string | null;
          role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          is_active?: boolean;
          last_seen_at?: string | null;
          role?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          is_active?: boolean;
          last_seen_at?: string | null;
          role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      analytics_events: {
        Row: {
          anonymous_id: string | null;
          country_code: string | null;
          created_at: string;
          device_class: string | null;
          event_name: string;
          id: string;
          lead_id: string | null;
          metadata: Json | null;
          occurred_at: string;
          page_path: string | null;
          property_id: string | null;
          referrer_path: string | null;
          session_id: string | null;
          source_channel: string | null;
        };
        Insert: {
          anonymous_id?: string | null;
          country_code?: string | null;
          created_at?: string;
          device_class?: string | null;
          event_name: string;
          id?: string;
          lead_id?: string | null;
          metadata?: Json | null;
          occurred_at?: string;
          page_path?: string | null;
          property_id?: string | null;
          referrer_path?: string | null;
          session_id?: string | null;
          source_channel?: string | null;
        };
        Update: {
          anonymous_id?: string | null;
          country_code?: string | null;
          created_at?: string;
          device_class?: string | null;
          event_name?: string;
          id?: string;
          lead_id?: string | null;
          metadata?: Json | null;
          occurred_at?: string;
          page_path?: string | null;
          property_id?: string | null;
          referrer_path?: string | null;
          session_id?: string | null;
          source_channel?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
        ];
      };
      app_settings: {
        Row: {
          boolean_value: boolean | null;
          created_at: string;
          decimal_value: number | null;
          description: string | null;
          id: string;
          integer_value: number | null;
          is_public: boolean;
          is_secret_reference: boolean;
          json_value: Json | null;
          key: string;
          label: string;
          text_value: string | null;
          updated_at: string;
          updated_by: string | null;
          url_value: string | null;
          value_type: Database["public"]["Enums"]["setting_value_type"];
        };
        Insert: {
          boolean_value?: boolean | null;
          created_at?: string;
          decimal_value?: number | null;
          description?: string | null;
          id?: string;
          integer_value?: number | null;
          is_public?: boolean;
          is_secret_reference?: boolean;
          json_value?: Json | null;
          key: string;
          label: string;
          text_value?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          url_value?: string | null;
          value_type: Database["public"]["Enums"]["setting_value_type"];
        };
        Update: {
          boolean_value?: boolean | null;
          created_at?: string;
          decimal_value?: number | null;
          description?: string | null;
          id?: string;
          integer_value?: number | null;
          is_public?: boolean;
          is_secret_reference?: boolean;
          json_value?: Json | null;
          key?: string;
          label?: string;
          text_value?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          url_value?: string | null;
          value_type?: Database["public"]["Enums"]["setting_value_type"];
        };
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      area_conversion_rules: {
        Row: {
          conversion_method: string;
          created_at: string;
          effective_from: string | null;
          effective_to: string | null;
          factor: number | null;
          from_unit_id: string;
          id: string;
          is_authoritative: boolean;
          jurisdiction_id: string | null;
          place_id: string | null;
          source_reference_id: string | null;
          to_unit_id: string;
        };
        Insert: {
          conversion_method: string;
          created_at?: string;
          effective_from?: string | null;
          effective_to?: string | null;
          factor?: number | null;
          from_unit_id: string;
          id?: string;
          is_authoritative?: boolean;
          jurisdiction_id?: string | null;
          place_id?: string | null;
          source_reference_id?: string | null;
          to_unit_id: string;
        };
        Update: {
          conversion_method?: string;
          created_at?: string;
          effective_from?: string | null;
          effective_to?: string | null;
          factor?: number | null;
          from_unit_id?: string;
          id?: string;
          is_authoritative?: boolean;
          jurisdiction_id?: string | null;
          place_id?: string | null;
          source_reference_id?: string | null;
          to_unit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "area_conversion_rules_from_unit_id_fkey";
            columns: ["from_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "area_conversion_rules_from_unit_id_fkey";
            columns: ["from_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "area_conversion_rules_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "area_conversion_rules_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["place_id"];
          },
          {
            foreignKeyName: "area_conversion_rules_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "area_conversion_rules_to_unit_id_fkey";
            columns: ["to_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "area_conversion_rules_to_unit_id_fkey";
            columns: ["to_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
        ];
      };
      area_units: {
        Row: {
          code: string;
          created_at: string;
          display_name: string;
          id: string;
          is_local: boolean;
          is_metric: boolean;
          is_public_v1: boolean;
          symbol: string | null;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          display_name: string;
          id?: string;
          is_local?: boolean;
          is_metric?: boolean;
          is_public_v1?: boolean;
          symbol?: string | null;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          display_name?: string;
          id?: string;
          is_local?: boolean;
          is_metric?: boolean;
          is_public_v1?: boolean;
          symbol?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"];
          actor_admin_id: string | null;
          after_state: Json | null;
          before_state: Json | null;
          changed_fields: string[] | null;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip_hash: string | null;
          occurred_at: string;
          reason: string | null;
          user_agent_hash: string | null;
        };
        Insert: {
          action: Database["public"]["Enums"]["audit_action"];
          actor_admin_id?: string | null;
          after_state?: Json | null;
          before_state?: Json | null;
          changed_fields?: string[] | null;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip_hash?: string | null;
          occurred_at?: string;
          reason?: string | null;
          user_agent_hash?: string | null;
        };
        Update: {
          action?: Database["public"]["Enums"]["audit_action"];
          actor_admin_id?: string | null;
          after_state?: Json | null;
          before_state?: Json | null;
          changed_fields?: string[] | null;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          ip_hash?: string | null;
          occurred_at?: string;
          reason?: string | null;
          user_agent_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_admin_id_fkey";
            columns: ["actor_admin_id"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      countries: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          iso_code: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          iso_code: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          iso_code?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      development_plan_zones: {
        Row: {
          code: string | null;
          created_at: string;
          effective_from: string | null;
          effective_to: string | null;
          id: string;
          is_active: boolean;
          name: string;
          planning_authority_id: string;
          source_reference_id: string | null;
          updated_at: string;
          use_classification: string | null;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          effective_from?: string | null;
          effective_to?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          planning_authority_id: string;
          source_reference_id?: string | null;
          updated_at?: string;
          use_classification?: string | null;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          effective_from?: string | null;
          effective_to?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          planning_authority_id?: string;
          source_reference_id?: string | null;
          updated_at?: string;
          use_classification?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "development_plan_zones_planning_authority_id_fkey";
            columns: ["planning_authority_id"];
            isOneToOne: false;
            referencedRelation: "planning_authorities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "development_plan_zones_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
        ];
      };
      districts: {
        Row: {
          code: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          is_service_area: boolean;
          name: string;
          source_reference_id: string | null;
          state_id: string;
          updated_at: string;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_service_area?: boolean;
          name: string;
          source_reference_id?: string | null;
          state_id: string;
          updated_at?: string;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_service_area?: boolean;
          name?: string;
          source_reference_id?: string | null;
          state_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "districts_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "districts_state_id_fkey";
            columns: ["state_id"];
            isOneToOne: false;
            referencedRelation: "states";
            referencedColumns: ["id"];
          },
        ];
      };
      geography_aliases: {
        Row: {
          alias: string;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          is_searchable: boolean;
          language_code: string;
        };
        Insert: {
          alias: string;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          is_searchable?: boolean;
          language_code?: string;
        };
        Update: {
          alias?: string;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          is_searchable?: boolean;
          language_code?: string;
        };
        Relationships: [];
      };
      gidc_estates: {
        Row: {
          authority_name: string;
          created_at: string;
          district_id: string | null;
          estate_type: string | null;
          id: string;
          is_active: boolean;
          name: string;
          place_id: string | null;
          source_reference_id: string | null;
          updated_at: string;
        };
        Insert: {
          authority_name: string;
          created_at?: string;
          district_id?: string | null;
          estate_type?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          place_id?: string | null;
          source_reference_id?: string | null;
          updated_at?: string;
        };
        Update: {
          authority_name?: string;
          created_at?: string;
          district_id?: string | null;
          estate_type?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          place_id?: string | null;
          source_reference_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gidc_estates_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gidc_estates_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["district_id"];
          },
          {
            foreignKeyName: "gidc_estates_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gidc_estates_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["place_id"];
          },
          {
            foreignKeyName: "gidc_estates_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
        ];
      };
      guide_categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      guides: {
        Row: {
          archived_at: string | null;
          author_admin_id: string | null;
          body_markdown: string;
          canonical_url: string | null;
          category_id: string | null;
          created_at: string;
          created_by: string | null;
          excerpt: string | null;
          hero_alt_text: string | null;
          hero_height_px: number | null;
          hero_object_path: string | null;
          hero_storage_bucket: string | null;
          hero_width_px: number | null;
          id: string;
          published_at: string | null;
          published_by: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: Database["public"]["Enums"]["guide_status"];
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          archived_at?: string | null;
          author_admin_id?: string | null;
          body_markdown: string;
          canonical_url?: string | null;
          category_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          excerpt?: string | null;
          hero_alt_text?: string | null;
          hero_height_px?: number | null;
          hero_object_path?: string | null;
          hero_storage_bucket?: string | null;
          hero_width_px?: number | null;
          id?: string;
          published_at?: string | null;
          published_by?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["guide_status"];
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          author_admin_id?: string | null;
          body_markdown?: string;
          canonical_url?: string | null;
          category_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          excerpt?: string | null;
          hero_alt_text?: string | null;
          hero_height_px?: number | null;
          hero_object_path?: string | null;
          hero_storage_bucket?: string | null;
          hero_width_px?: number | null;
          id?: string;
          published_at?: string | null;
          published_by?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["guide_status"];
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "guides_author_admin_id_fkey";
            columns: ["author_admin_id"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "guides_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "guide_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "guides_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "public_guide_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "guides_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "guides_published_by_fkey";
            columns: ["published_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "guides_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "guides_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      lead_activities: {
        Row: {
          activity_at: string;
          activity_type: Database["public"]["Enums"]["lead_activity_type"];
          actor_admin_id: string | null;
          created_at: string;
          id: string;
          lead_id: string;
          metadata_text: string | null;
          note: string | null;
          property_id: string | null;
        };
        Insert: {
          activity_at?: string;
          activity_type: Database["public"]["Enums"]["lead_activity_type"];
          actor_admin_id?: string | null;
          created_at?: string;
          id?: string;
          lead_id: string;
          metadata_text?: string | null;
          note?: string | null;
          property_id?: string | null;
        };
        Update: {
          activity_at?: string;
          activity_type?: Database["public"]["Enums"]["lead_activity_type"];
          actor_admin_id?: string | null;
          created_at?: string;
          id?: string;
          lead_id?: string;
          metadata_text?: string | null;
          note?: string | null;
          property_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lead_activities_actor_admin_id_fkey";
            columns: ["actor_admin_id"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "lead_activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_activities_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_activities_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_activities_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_activities_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_activities_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
        ];
      };
      lead_follow_ups: {
        Row: {
          completed_at: string | null;
          completed_by: string | null;
          context: string | null;
          created_at: string;
          created_by: string;
          due_at: string;
          follow_up_type: string;
          id: string;
          lead_id: string;
          note: string | null;
          outcome: string | null;
          site_visit_id: string | null;
        };
        Insert: {
          completed_at?: string | null;
          completed_by?: string | null;
          context?: string | null;
          created_at?: string;
          created_by: string;
          due_at: string;
          follow_up_type: string;
          id?: string;
          lead_id: string;
          note?: string | null;
          outcome?: string | null;
          site_visit_id?: string | null;
        };
        Update: {
          completed_at?: string | null;
          completed_by?: string | null;
          context?: string | null;
          created_at?: string;
          created_by?: string;
          due_at?: string;
          follow_up_type?: string;
          id?: string;
          lead_id?: string;
          note?: string | null;
          outcome?: string | null;
          site_visit_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lead_follow_ups_completed_by_fkey";
            columns: ["completed_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "lead_follow_ups_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "lead_follow_ups_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_follow_ups_site_visit_id_fkey";
            columns: ["site_visit_id"];
            isOneToOne: false;
            referencedRelation: "site_visits";
            referencedColumns: ["id"];
          },
        ];
      };
      lead_properties: {
        Row: {
          created_at: string;
          id: string;
          lead_id: string;
          match_score: number | null;
          match_status: string | null;
          matched_at: string | null;
          matched_by: string | null;
          notes_internal: string | null;
          property_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          lead_id: string;
          match_score?: number | null;
          match_status?: string | null;
          matched_at?: string | null;
          matched_by?: string | null;
          notes_internal?: string | null;
          property_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          lead_id?: string;
          match_score?: number | null;
          match_status?: string | null;
          matched_at?: string | null;
          matched_by?: string | null;
          notes_internal?: string | null;
          property_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_properties_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_properties_matched_by_fkey";
            columns: ["matched_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "lead_properties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_properties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_properties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_properties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_properties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
        ];
      };
      lead_requirements: {
        Row: {
          area_unit_id: string | null;
          created_at: string;
          id: string;
          lead_id: string;
          max_area_value: number | null;
          min_area_value: number | null;
          normalized_max_area_sqm: number | null;
          normalized_min_area_sqm: number | null;
          preferred_frontage_m_min: number | null;
          preferred_road_width_m_min: number | null;
          preferred_use_text: string | null;
          updated_at: string;
        };
        Insert: {
          area_unit_id?: string | null;
          created_at?: string;
          id?: string;
          lead_id: string;
          max_area_value?: number | null;
          min_area_value?: number | null;
          normalized_max_area_sqm?: number | null;
          normalized_min_area_sqm?: number | null;
          preferred_frontage_m_min?: number | null;
          preferred_road_width_m_min?: number | null;
          preferred_use_text?: string | null;
          updated_at?: string;
        };
        Update: {
          area_unit_id?: string | null;
          created_at?: string;
          id?: string;
          lead_id?: string;
          max_area_value?: number | null;
          min_area_value?: number | null;
          normalized_max_area_sqm?: number | null;
          normalized_min_area_sqm?: number | null;
          preferred_frontage_m_min?: number | null;
          preferred_road_width_m_min?: number | null;
          preferred_use_text?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_requirements_area_unit_id_fkey";
            columns: ["area_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_requirements_area_unit_id_fkey";
            columns: ["area_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_requirements_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: true;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          archived_at: string | null;
          assigned_to: string | null;
          budget_currency: string | null;
          budget_max: number | null;
          budget_min: number | null;
          buyer_type: Database["public"]["Enums"]["buyer_type"] | null;
          closed_at: string | null;
          created_at: string;
          created_by: string | null;
          district_id: string | null;
          id: string;
          inquiry_type: Database["public"]["Enums"]["lead_inquiry_type"];
          intended_use: string | null;
          land_category: Database["public"]["Enums"]["land_category"] | null;
          last_contacted_at: string | null;
          lead_reference: string;
          locality_text: string | null;
          loss_reason: string | null;
          next_follow_up_at: string | null;
          notes_internal: string | null;
          party_id: string;
          place_id: string | null;
          preferred_transaction: Database["public"]["Enums"]["transaction_type"] | null;
          source_detail: string | null;
          source_type: string;
          status: Database["public"]["Enums"]["lead_status"];
          subdistrict_id: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          archived_at?: string | null;
          assigned_to?: string | null;
          budget_currency?: string | null;
          budget_max?: number | null;
          budget_min?: number | null;
          buyer_type?: Database["public"]["Enums"]["buyer_type"] | null;
          closed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: string | null;
          id?: string;
          inquiry_type: Database["public"]["Enums"]["lead_inquiry_type"];
          intended_use?: string | null;
          land_category?: Database["public"]["Enums"]["land_category"] | null;
          last_contacted_at?: string | null;
          lead_reference?: string;
          locality_text?: string | null;
          loss_reason?: string | null;
          next_follow_up_at?: string | null;
          notes_internal?: string | null;
          party_id: string;
          place_id?: string | null;
          preferred_transaction?: Database["public"]["Enums"]["transaction_type"] | null;
          source_detail?: string | null;
          source_type: string;
          status?: Database["public"]["Enums"]["lead_status"];
          subdistrict_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          assigned_to?: string | null;
          budget_currency?: string | null;
          budget_max?: number | null;
          budget_min?: number | null;
          buyer_type?: Database["public"]["Enums"]["buyer_type"] | null;
          closed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: string | null;
          id?: string;
          inquiry_type?: Database["public"]["Enums"]["lead_inquiry_type"];
          intended_use?: string | null;
          land_category?: Database["public"]["Enums"]["land_category"] | null;
          last_contacted_at?: string | null;
          lead_reference?: string;
          locality_text?: string | null;
          loss_reason?: string | null;
          next_follow_up_at?: string | null;
          notes_internal?: string | null;
          party_id?: string;
          place_id?: string | null;
          preferred_transaction?: Database["public"]["Enums"]["transaction_type"] | null;
          source_detail?: string | null;
          source_type?: string;
          status?: Database["public"]["Enums"]["lead_status"];
          subdistrict_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "leads_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "leads_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["district_id"];
          },
          {
            foreignKeyName: "leads_party_id_fkey";
            columns: ["party_id"];
            isOneToOne: false;
            referencedRelation: "parties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["place_id"];
          },
          {
            foreignKeyName: "leads_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["subdistrict_id"];
          },
          {
            foreignKeyName: "leads_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "subdistricts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      localities: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          is_publicly_indexable: boolean;
          name: string;
          place_id: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_publicly_indexable?: boolean;
          name: string;
          place_id: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_publicly_indexable?: boolean;
          name?: string;
          place_id?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "localities_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "localities_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["place_id"];
          },
        ];
      };
      media_assets: {
        Row: {
          alt_text: string | null;
          approved_at: string | null;
          archived_at: string | null;
          caption: string | null;
          checksum_sha256: string | null;
          created_at: string;
          created_by: string | null;
          duration_seconds: number | null;
          external_media_id: string | null;
          external_provider: string | null;
          external_url: string | null;
          file_size_bytes: number | null;
          height_px: number | null;
          id: string;
          is_cover: boolean;
          media_subtype: string | null;
          media_type: Database["public"]["Enums"]["media_type"];
          mime_type: string | null;
          object_path: string | null;
          processing_status: Database["public"]["Enums"]["media_processing_status"];
          property_id: string | null;
          scan_status: Database["public"]["Enums"]["document_scan_status"] | null;
          sort_order: number;
          source_type: string | null;
          storage_bucket: string | null;
          updated_at: string;
          updated_by: string | null;
          visibility: Database["public"]["Enums"]["record_visibility"];
          width_px: number | null;
        };
        Insert: {
          alt_text?: string | null;
          approved_at?: string | null;
          archived_at?: string | null;
          caption?: string | null;
          checksum_sha256?: string | null;
          created_at?: string;
          created_by?: string | null;
          duration_seconds?: number | null;
          external_media_id?: string | null;
          external_provider?: string | null;
          external_url?: string | null;
          file_size_bytes?: number | null;
          height_px?: number | null;
          id?: string;
          is_cover?: boolean;
          media_subtype?: string | null;
          media_type: Database["public"]["Enums"]["media_type"];
          mime_type?: string | null;
          object_path?: string | null;
          processing_status?: Database["public"]["Enums"]["media_processing_status"];
          property_id?: string | null;
          scan_status?: Database["public"]["Enums"]["document_scan_status"] | null;
          sort_order?: number;
          source_type?: string | null;
          storage_bucket?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          visibility?: Database["public"]["Enums"]["record_visibility"];
          width_px?: number | null;
        };
        Update: {
          alt_text?: string | null;
          approved_at?: string | null;
          archived_at?: string | null;
          caption?: string | null;
          checksum_sha256?: string | null;
          created_at?: string;
          created_by?: string | null;
          duration_seconds?: number | null;
          external_media_id?: string | null;
          external_provider?: string | null;
          external_url?: string | null;
          file_size_bytes?: number | null;
          height_px?: number | null;
          id?: string;
          is_cover?: boolean;
          media_subtype?: string | null;
          media_type?: Database["public"]["Enums"]["media_type"];
          mime_type?: string | null;
          object_path?: string | null;
          processing_status?: Database["public"]["Enums"]["media_processing_status"];
          property_id?: string | null;
          scan_status?: Database["public"]["Enums"]["document_scan_status"] | null;
          sort_order?: number;
          source_type?: string | null;
          storage_bucket?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          visibility?: Database["public"]["Enums"]["record_visibility"];
          width_px?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_assets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "media_assets_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      notification_deliveries: {
        Row: {
          attempt_count: number;
          created_at: string;
          event_key: string;
          id: string;
          last_error_code: string | null;
          lead_id: string;
          notification_type: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          attempt_count?: number;
          created_at?: string;
          event_key: string;
          id?: string;
          last_error_code?: string | null;
          lead_id: string;
          notification_type: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          attempt_count?: number;
          created_at?: string;
          event_key?: string;
          id?: string;
          last_error_code?: string | null;
          lead_id?: string;
          notification_type?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      owner_submission_consents: {
        Row: {
          consent_source: string;
          consented_at: string;
          created_at: string;
          id: string;
          owner_submission_id: string;
          party_id: string;
          privacy_notice_version: string;
          purpose: string;
        };
        Insert: {
          consent_source: string;
          consented_at?: string;
          created_at?: string;
          id?: string;
          owner_submission_id: string;
          party_id: string;
          privacy_notice_version: string;
          purpose: string;
        };
        Update: {
          consent_source?: string;
          consented_at?: string;
          created_at?: string;
          id?: string;
          owner_submission_id?: string;
          party_id?: string;
          privacy_notice_version?: string;
          purpose?: string;
        };
        Relationships: [
          {
            foreignKeyName: "owner_submission_consents_owner_submission_id_fkey";
            columns: ["owner_submission_id"];
            isOneToOne: false;
            referencedRelation: "owner_submissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submission_consents_party_id_fkey";
            columns: ["party_id"];
            isOneToOne: false;
            referencedRelation: "parties";
            referencedColumns: ["id"];
          },
        ];
      };
      owner_submission_documents: {
        Row: {
          created_at: string;
          document_role: string;
          id: string;
          owner_submission_id: string;
          private_document_id: string;
        };
        Insert: {
          created_at?: string;
          document_role: string;
          id?: string;
          owner_submission_id: string;
          private_document_id: string;
        };
        Update: {
          created_at?: string;
          document_role?: string;
          id?: string;
          owner_submission_id?: string;
          private_document_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "owner_submission_documents_owner_submission_id_fkey";
            columns: ["owner_submission_id"];
            isOneToOne: false;
            referencedRelation: "owner_submissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submission_documents_private_document_id_fkey";
            columns: ["private_document_id"];
            isOneToOne: false;
            referencedRelation: "private_documents";
            referencedColumns: ["id"];
          },
        ];
      };
      owner_submission_events: {
        Row: {
          actor_admin_id: string | null;
          event_type: string;
          from_status: Database["public"]["Enums"]["owner_submission_status"] | null;
          id: number;
          next_action_at: string | null;
          note: string | null;
          occurred_at: string;
          owner_submission_id: string;
          to_status: Database["public"]["Enums"]["owner_submission_status"] | null;
        };
        Insert: {
          actor_admin_id?: string | null;
          event_type: string;
          from_status?: Database["public"]["Enums"]["owner_submission_status"] | null;
          id?: never;
          next_action_at?: string | null;
          note?: string | null;
          occurred_at?: string;
          owner_submission_id: string;
          to_status?: Database["public"]["Enums"]["owner_submission_status"] | null;
        };
        Update: {
          actor_admin_id?: string | null;
          event_type?: string;
          from_status?: Database["public"]["Enums"]["owner_submission_status"] | null;
          id?: never;
          next_action_at?: string | null;
          note?: string | null;
          occurred_at?: string;
          owner_submission_id?: string;
          to_status?: Database["public"]["Enums"]["owner_submission_status"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "owner_submission_events_actor_admin_id_fkey";
            columns: ["actor_admin_id"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "owner_submission_events_owner_submission_id_fkey";
            columns: ["owner_submission_id"];
            isOneToOne: false;
            referencedRelation: "owner_submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      owner_submission_idempotency: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          key_hash: string;
          owner_submission_id: string;
          payload_hash: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          key_hash: string;
          owner_submission_id: string;
          payload_hash: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          key_hash?: string;
          owner_submission_id?: string;
          payload_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "owner_submission_idempotency_owner_submission_id_fkey";
            columns: ["owner_submission_id"];
            isOneToOne: false;
            referencedRelation: "owner_submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      owner_submission_notification_deliveries: {
        Row: {
          attempt_count: number;
          created_at: string;
          event_key: string;
          id: string;
          last_error_code: string | null;
          owner_submission_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          attempt_count?: number;
          created_at?: string;
          event_key: string;
          id?: string;
          last_error_code?: string | null;
          owner_submission_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          attempt_count?: number;
          created_at?: string;
          event_key?: string;
          id?: string;
          last_error_code?: string | null;
          owner_submission_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "owner_submission_notification_deliveri_owner_submission_id_fkey";
            columns: ["owner_submission_id"];
            isOneToOne: false;
            referencedRelation: "owner_submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      owner_submissions: {
        Row: {
          approximate_area_unit_id: string | null;
          approximate_area_value: number | null;
          archived_at: string | null;
          asking_price_amount: number | null;
          asking_price_per_unit: number | null;
          asking_price_text: string | null;
          assigned_to: string | null;
          broad_address: string | null;
          category_claims: Json;
          converted_property_id: string | null;
          created_at: string;
          created_by: string | null;
          district_id: string | null;
          first_contacted_at: string | null;
          id: string;
          is_negotiable: boolean;
          land_category: Database["public"]["Enums"]["land_category"];
          locality_text: string | null;
          location_visibility_preference: Database["public"]["Enums"]["location_visibility"];
          media_claims: Json;
          minimum_acceptable_price: number | null;
          next_action_at: string | null;
          notes_internal: string | null;
          owner_intent: string;
          owner_relationship: string;
          party_id: string;
          place_id: string | null;
          preferred_contact: string;
          price_mode: Database["public"]["Enums"]["price_mode"];
          price_unit_id: string | null;
          primary_transaction_type: Database["public"]["Enums"]["transaction_type"];
          private_latitude: number | null;
          private_longitude: number | null;
          source_description: string | null;
          status: Database["public"]["Enums"]["owner_submission_status"];
          subdistrict_id: string | null;
          submission_reference: string;
          taluka_text: string | null;
          updated_at: string;
          updated_by: string | null;
          version: number;
          village_text: string | null;
        };
        Insert: {
          approximate_area_unit_id?: string | null;
          approximate_area_value?: number | null;
          archived_at?: string | null;
          asking_price_amount?: number | null;
          asking_price_per_unit?: number | null;
          asking_price_text?: string | null;
          assigned_to?: string | null;
          broad_address?: string | null;
          category_claims?: Json;
          converted_property_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: string | null;
          first_contacted_at?: string | null;
          id?: string;
          is_negotiable?: boolean;
          land_category: Database["public"]["Enums"]["land_category"];
          locality_text?: string | null;
          location_visibility_preference?: Database["public"]["Enums"]["location_visibility"];
          media_claims?: Json;
          minimum_acceptable_price?: number | null;
          next_action_at?: string | null;
          notes_internal?: string | null;
          owner_intent?: string;
          owner_relationship?: string;
          party_id: string;
          place_id?: string | null;
          preferred_contact?: string;
          price_mode?: Database["public"]["Enums"]["price_mode"];
          price_unit_id?: string | null;
          primary_transaction_type: Database["public"]["Enums"]["transaction_type"];
          private_latitude?: number | null;
          private_longitude?: number | null;
          source_description?: string | null;
          status?: Database["public"]["Enums"]["owner_submission_status"];
          subdistrict_id?: string | null;
          submission_reference?: string;
          taluka_text?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
          village_text?: string | null;
        };
        Update: {
          approximate_area_unit_id?: string | null;
          approximate_area_value?: number | null;
          archived_at?: string | null;
          asking_price_amount?: number | null;
          asking_price_per_unit?: number | null;
          asking_price_text?: string | null;
          assigned_to?: string | null;
          broad_address?: string | null;
          category_claims?: Json;
          converted_property_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: string | null;
          first_contacted_at?: string | null;
          id?: string;
          is_negotiable?: boolean;
          land_category?: Database["public"]["Enums"]["land_category"];
          locality_text?: string | null;
          location_visibility_preference?: Database["public"]["Enums"]["location_visibility"];
          media_claims?: Json;
          minimum_acceptable_price?: number | null;
          next_action_at?: string | null;
          notes_internal?: string | null;
          owner_intent?: string;
          owner_relationship?: string;
          party_id?: string;
          place_id?: string | null;
          preferred_contact?: string;
          price_mode?: Database["public"]["Enums"]["price_mode"];
          price_unit_id?: string | null;
          primary_transaction_type?: Database["public"]["Enums"]["transaction_type"];
          private_latitude?: number | null;
          private_longitude?: number | null;
          source_description?: string | null;
          status?: Database["public"]["Enums"]["owner_submission_status"];
          subdistrict_id?: string | null;
          submission_reference?: string;
          taluka_text?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
          village_text?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "owner_submissions_approximate_area_unit_id_fkey";
            columns: ["approximate_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_approximate_area_unit_id_fkey";
            columns: ["approximate_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "owner_submissions_converted_property_id_fkey";
            columns: ["converted_property_id"];
            isOneToOne: true;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_converted_property_id_fkey";
            columns: ["converted_property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_converted_property_id_fkey";
            columns: ["converted_property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_converted_property_id_fkey";
            columns: ["converted_property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_converted_property_id_fkey";
            columns: ["converted_property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "owner_submissions_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["district_id"];
          },
          {
            foreignKeyName: "owner_submissions_party_id_fkey";
            columns: ["party_id"];
            isOneToOne: false;
            referencedRelation: "parties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["place_id"];
          },
          {
            foreignKeyName: "owner_submissions_price_unit_id_fkey";
            columns: ["price_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_price_unit_id_fkey";
            columns: ["price_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["subdistrict_id"];
          },
          {
            foreignKeyName: "owner_submissions_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "subdistricts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "owner_submissions_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      parcel_identifiers: {
        Row: {
          created_at: string;
          id: string;
          identifier_type: string;
          identifier_value: string;
          is_primary: boolean;
          normalized_value: string;
          parcel_id: string;
          public_visibility: Database["public"]["Enums"]["record_visibility"];
          source_reference_id: string | null;
          updated_at: string;
          valid_from: string | null;
          valid_to: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          identifier_type: string;
          identifier_value: string;
          is_primary?: boolean;
          normalized_value: string;
          parcel_id: string;
          public_visibility?: Database["public"]["Enums"]["record_visibility"];
          source_reference_id?: string | null;
          updated_at?: string;
          valid_from?: string | null;
          valid_to?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          identifier_type?: string;
          identifier_value?: string;
          is_primary?: boolean;
          normalized_value?: string;
          parcel_id?: string;
          public_visibility?: Database["public"]["Enums"]["record_visibility"];
          source_reference_id?: string | null;
          updated_at?: string;
          valid_from?: string | null;
          valid_to?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "parcel_identifiers_parcel_id_fkey";
            columns: ["parcel_id"];
            isOneToOne: false;
            referencedRelation: "property_parcels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "parcel_identifiers_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
        ];
      };
      parties: {
        Row: {
          alternate_phone: string | null;
          archived_at: string | null;
          consent_recorded_at: string | null;
          consent_source: string | null;
          created_at: string;
          created_by: string | null;
          display_name: string;
          email: string | null;
          id: string;
          is_active: boolean;
          legal_name: string | null;
          notes_internal: string | null;
          party_type: Database["public"]["Enums"]["party_type"];
          phone: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          alternate_phone?: string | null;
          archived_at?: string | null;
          consent_recorded_at?: string | null;
          consent_source?: string | null;
          created_at?: string;
          created_by?: string | null;
          display_name: string;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          legal_name?: string | null;
          notes_internal?: string | null;
          party_type: Database["public"]["Enums"]["party_type"];
          phone?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          alternate_phone?: string | null;
          archived_at?: string | null;
          consent_recorded_at?: string | null;
          consent_source?: string | null;
          created_at?: string;
          created_by?: string | null;
          display_name?: string;
          email?: string | null;
          id?: string;
          is_active?: boolean;
          legal_name?: string | null;
          notes_internal?: string | null;
          party_type?: Database["public"]["Enums"]["party_type"];
          phone?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "parties_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "parties_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      party_consents: {
        Row: {
          consent_source: string;
          consented_at: string;
          created_at: string;
          id: string;
          lead_id: string;
          party_id: string;
          privacy_notice_version: string;
          purpose: string;
        };
        Insert: {
          consent_source: string;
          consented_at?: string;
          created_at?: string;
          id?: string;
          lead_id: string;
          party_id: string;
          privacy_notice_version: string;
          purpose: string;
        };
        Update: {
          consent_source?: string;
          consented_at?: string;
          created_at?: string;
          id?: string;
          lead_id?: string;
          party_id?: string;
          privacy_notice_version?: string;
          purpose?: string;
        };
        Relationships: [
          {
            foreignKeyName: "party_consents_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "party_consents_party_id_fkey";
            columns: ["party_id"];
            isOneToOne: false;
            referencedRelation: "parties";
            referencedColumns: ["id"];
          },
        ];
      };
      places: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          official_name: string;
          pin_code: string | null;
          place_type: string;
          postal_name: string | null;
          source_reference_id: string | null;
          subdistrict_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          official_name: string;
          pin_code?: string | null;
          place_type: string;
          postal_name?: string | null;
          source_reference_id?: string | null;
          subdistrict_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          official_name?: string;
          pin_code?: string | null;
          place_type?: string;
          postal_name?: string | null;
          source_reference_id?: string | null;
          subdistrict_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "places_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "places_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["subdistrict_id"];
          },
          {
            foreignKeyName: "places_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "subdistricts";
            referencedColumns: ["id"];
          },
        ];
      };
      planning_authorities: {
        Row: {
          authority_type: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          short_name: string | null;
          source_reference_id: string | null;
          state_id: string;
          updated_at: string;
        };
        Insert: {
          authority_type: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          short_name?: string | null;
          source_reference_id?: string | null;
          state_id: string;
          updated_at?: string;
        };
        Update: {
          authority_type?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          short_name?: string | null;
          source_reference_id?: string | null;
          state_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "planning_authorities_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "planning_authorities_state_id_fkey";
            columns: ["state_id"];
            isOneToOne: false;
            referencedRelation: "states";
            referencedColumns: ["id"];
          },
        ];
      };
      private_documents: {
        Row: {
          archived_at: string | null;
          checksum_sha256: string | null;
          created_at: string;
          created_by: string | null;
          document_date: string | null;
          document_reference: string | null;
          document_type: string;
          file_size_bytes: number | null;
          id: string;
          issuer_name: string | null;
          mime_type: string;
          notes_internal: string | null;
          object_path: string;
          original_file_name: string | null;
          owner_submission_id: string | null;
          page_count: number | null;
          party_id: string | null;
          property_id: string | null;
          scan_status: Database["public"]["Enums"]["document_scan_status"];
          storage_bucket: string;
          updated_at: string;
          updated_by: string | null;
          visibility: Database["public"]["Enums"]["record_visibility"];
        };
        Insert: {
          archived_at?: string | null;
          checksum_sha256?: string | null;
          created_at?: string;
          created_by?: string | null;
          document_date?: string | null;
          document_reference?: string | null;
          document_type: string;
          file_size_bytes?: number | null;
          id?: string;
          issuer_name?: string | null;
          mime_type: string;
          notes_internal?: string | null;
          object_path: string;
          original_file_name?: string | null;
          owner_submission_id?: string | null;
          page_count?: number | null;
          party_id?: string | null;
          property_id?: string | null;
          scan_status?: Database["public"]["Enums"]["document_scan_status"];
          storage_bucket: string;
          updated_at?: string;
          updated_by?: string | null;
          visibility?: Database["public"]["Enums"]["record_visibility"];
        };
        Update: {
          archived_at?: string | null;
          checksum_sha256?: string | null;
          created_at?: string;
          created_by?: string | null;
          document_date?: string | null;
          document_reference?: string | null;
          document_type?: string;
          file_size_bytes?: number | null;
          id?: string;
          issuer_name?: string | null;
          mime_type?: string;
          notes_internal?: string | null;
          object_path?: string;
          original_file_name?: string | null;
          owner_submission_id?: string | null;
          page_count?: number | null;
          party_id?: string | null;
          property_id?: string | null;
          scan_status?: Database["public"]["Enums"]["document_scan_status"];
          storage_bucket?: string;
          updated_at?: string;
          updated_by?: string | null;
          visibility?: Database["public"]["Enums"]["record_visibility"];
        };
        Relationships: [
          {
            foreignKeyName: "private_documents_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "private_documents_owner_submission_id_fkey";
            columns: ["owner_submission_id"];
            isOneToOne: false;
            referencedRelation: "owner_submissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "private_documents_party_id_fkey";
            columns: ["party_id"];
            isOneToOne: false;
            referencedRelation: "parties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "private_documents_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "private_documents_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "private_documents_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "private_documents_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "private_documents_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "private_documents_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      professional_reviews: {
        Row: {
          completed_by: string | null;
          created_at: string;
          evidence_reference: string | null;
          id: string;
          limitations: string | null;
          outcome_summary: string | null;
          professional_name: string | null;
          professional_reference: string | null;
          professional_type: string;
          property_verification_id: string;
          requested_by: string;
          review_date: string | null;
          scope_statement: string;
          status: Database["public"]["Enums"]["professional_review_status"];
          superseded_at: string | null;
          updated_at: string;
        };
        Insert: {
          completed_by?: string | null;
          created_at?: string;
          evidence_reference?: string | null;
          id?: string;
          limitations?: string | null;
          outcome_summary?: string | null;
          professional_name?: string | null;
          professional_reference?: string | null;
          professional_type: string;
          property_verification_id: string;
          requested_by: string;
          review_date?: string | null;
          scope_statement: string;
          status?: Database["public"]["Enums"]["professional_review_status"];
          superseded_at?: string | null;
          updated_at?: string;
        };
        Update: {
          completed_by?: string | null;
          created_at?: string;
          evidence_reference?: string | null;
          id?: string;
          limitations?: string | null;
          outcome_summary?: string | null;
          professional_name?: string | null;
          professional_reference?: string | null;
          professional_type?: string;
          property_verification_id?: string;
          requested_by?: string;
          review_date?: string | null;
          scope_statement?: string;
          status?: Database["public"]["Enums"]["professional_review_status"];
          superseded_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professional_reviews_completed_by_fkey";
            columns: ["completed_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "professional_reviews_property_verification_id_fkey";
            columns: ["property_verification_id"];
            isOneToOne: false;
            referencedRelation: "property_verifications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_reviews_property_verification_id_fkey";
            columns: ["property_verification_id"];
            isOneToOne: false;
            referencedRelation: "public_property_verification_summaries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "professional_reviews_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      properties: {
        Row: {
          archived_at: string | null;
          archived_by: string | null;
          area_conversion_rule_id: string | null;
          area_normalization_status: Database["public"]["Enums"]["area_normalization_status"];
          area_source_reference_id: string | null;
          availability_status: Database["public"]["Enums"]["property_availability_status"];
          canonical_path: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          description: string | null;
          display_area_unit_id: string;
          display_area_value: number;
          district_id: string;
          featured: boolean;
          id: string;
          land_category: Database["public"]["Enums"]["land_category"];
          landmark_text: string | null;
          listing_title: string | null;
          locality_id: string | null;
          location_visibility: Database["public"]["Enums"]["location_visibility"];
          normalized_area_sqm: number | null;
          place_id: string | null;
          primary_transaction_type: Database["public"]["Enums"]["transaction_type"];
          property_code: string;
          public_address: string | null;
          public_search_document: unknown;
          public_slug: string | null;
          publication_status: Database["public"]["Enums"]["property_publication_status"];
          published_at: string | null;
          published_by: string | null;
          seo_description: string | null;
          seo_title: string | null;
          short_description: string | null;
          subdistrict_id: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          archived_at?: string | null;
          archived_by?: string | null;
          area_conversion_rule_id?: string | null;
          area_normalization_status?: Database["public"]["Enums"]["area_normalization_status"];
          area_source_reference_id?: string | null;
          availability_status?: Database["public"]["Enums"]["property_availability_status"];
          canonical_path?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          display_area_unit_id: string;
          display_area_value: number;
          district_id: string;
          featured?: boolean;
          id?: string;
          land_category: Database["public"]["Enums"]["land_category"];
          landmark_text?: string | null;
          listing_title?: string | null;
          locality_id?: string | null;
          location_visibility?: Database["public"]["Enums"]["location_visibility"];
          normalized_area_sqm?: number | null;
          place_id?: string | null;
          primary_transaction_type: Database["public"]["Enums"]["transaction_type"];
          property_code?: string;
          public_address?: string | null;
          public_search_document?: unknown;
          public_slug?: string | null;
          publication_status?: Database["public"]["Enums"]["property_publication_status"];
          published_at?: string | null;
          published_by?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          short_description?: string | null;
          subdistrict_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          archived_by?: string | null;
          area_conversion_rule_id?: string | null;
          area_normalization_status?: Database["public"]["Enums"]["area_normalization_status"];
          area_source_reference_id?: string | null;
          availability_status?: Database["public"]["Enums"]["property_availability_status"];
          canonical_path?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          description?: string | null;
          display_area_unit_id?: string;
          display_area_value?: number;
          district_id?: string;
          featured?: boolean;
          id?: string;
          land_category?: Database["public"]["Enums"]["land_category"];
          landmark_text?: string | null;
          listing_title?: string | null;
          locality_id?: string | null;
          location_visibility?: Database["public"]["Enums"]["location_visibility"];
          normalized_area_sqm?: number | null;
          place_id?: string | null;
          primary_transaction_type?: Database["public"]["Enums"]["transaction_type"];
          property_code?: string;
          public_address?: string | null;
          public_search_document?: unknown;
          public_slug?: string | null;
          publication_status?: Database["public"]["Enums"]["property_publication_status"];
          published_at?: string | null;
          published_by?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          short_description?: string | null;
          subdistrict_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "properties_archived_by_fkey";
            columns: ["archived_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "properties_area_conversion_rule_id_fkey";
            columns: ["area_conversion_rule_id"];
            isOneToOne: false;
            referencedRelation: "area_conversion_rules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_area_source_reference_id_fkey";
            columns: ["area_source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "properties_deleted_by_fkey";
            columns: ["deleted_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "properties_display_area_unit_id_fkey";
            columns: ["display_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_display_area_unit_id_fkey";
            columns: ["display_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["district_id"];
          },
          {
            foreignKeyName: "properties_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "localities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["locality_id"];
          },
          {
            foreignKeyName: "properties_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["place_id"];
          },
          {
            foreignKeyName: "properties_published_by_fkey";
            columns: ["published_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "properties_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["subdistrict_id"];
          },
          {
            foreignKeyName: "properties_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "subdistricts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      property_agricultural: {
        Row: {
          agricultural_use_status: string | null;
          borewell_count: number | null;
          boundary_summary_public: string | null;
          built_structure_area: number | null;
          built_structure_area_unit_id: string | null;
          canal_access_status: string | null;
          created_at: string;
          created_by: string | null;
          current_cultivation_status: string | null;
          electricity_status: string | null;
          fencing_status: string | null;
          irrigation_status: string | null;
          land_shape: string | null;
          measurement_source_reference_id: string | null;
          primary_irrigation_source: string | null;
          property_id: string;
          road_touch: boolean | null;
          road_width_m: number | null;
          structure_present: boolean | null;
          survey_mapni_status: string | null;
          tenure_type: string | null;
          topography: string | null;
          tree_count_estimate: number | null;
          updated_at: string;
          updated_by: string | null;
          well_count: number | null;
        };
        Insert: {
          agricultural_use_status?: string | null;
          borewell_count?: number | null;
          boundary_summary_public?: string | null;
          built_structure_area?: number | null;
          built_structure_area_unit_id?: string | null;
          canal_access_status?: string | null;
          created_at?: string;
          created_by?: string | null;
          current_cultivation_status?: string | null;
          electricity_status?: string | null;
          fencing_status?: string | null;
          irrigation_status?: string | null;
          land_shape?: string | null;
          measurement_source_reference_id?: string | null;
          primary_irrigation_source?: string | null;
          property_id: string;
          road_touch?: boolean | null;
          road_width_m?: number | null;
          structure_present?: boolean | null;
          survey_mapni_status?: string | null;
          tenure_type?: string | null;
          topography?: string | null;
          tree_count_estimate?: number | null;
          updated_at?: string;
          updated_by?: string | null;
          well_count?: number | null;
        };
        Update: {
          agricultural_use_status?: string | null;
          borewell_count?: number | null;
          boundary_summary_public?: string | null;
          built_structure_area?: number | null;
          built_structure_area_unit_id?: string | null;
          canal_access_status?: string | null;
          created_at?: string;
          created_by?: string | null;
          current_cultivation_status?: string | null;
          electricity_status?: string | null;
          fencing_status?: string | null;
          irrigation_status?: string | null;
          land_shape?: string | null;
          measurement_source_reference_id?: string | null;
          primary_irrigation_source?: string | null;
          property_id?: string;
          road_touch?: boolean | null;
          road_width_m?: number | null;
          structure_present?: boolean | null;
          survey_mapni_status?: string | null;
          tenure_type?: string | null;
          topography?: string | null;
          tree_count_estimate?: number | null;
          updated_at?: string;
          updated_by?: string | null;
          well_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "property_agricultural_built_structure_area_unit_id_fkey";
            columns: ["built_structure_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_agricultural_built_structure_area_unit_id_fkey";
            columns: ["built_structure_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_agricultural_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "property_agricultural_measurement_source_reference_id_fkey";
            columns: ["measurement_source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_agricultural_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_agricultural_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_agricultural_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_agricultural_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_agricultural_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_agricultural_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      property_attribute_definitions: {
        Row: {
          archived_at: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          is_active: boolean;
          is_filterable: boolean;
          is_public: boolean;
          is_required_for_publish: boolean;
          is_searchable: boolean;
          label: string;
          land_category: Database["public"]["Enums"]["land_category"] | null;
          sort_order: number;
          unit_id: string | null;
          updated_at: string;
          updated_by: string | null;
          value_type: Database["public"]["Enums"]["attribute_value_type"];
        };
        Insert: {
          archived_at?: string | null;
          code: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_filterable?: boolean;
          is_public?: boolean;
          is_required_for_publish?: boolean;
          is_searchable?: boolean;
          label: string;
          land_category?: Database["public"]["Enums"]["land_category"] | null;
          sort_order?: number;
          unit_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          value_type: Database["public"]["Enums"]["attribute_value_type"];
        };
        Update: {
          archived_at?: string | null;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_filterable?: boolean;
          is_public?: boolean;
          is_required_for_publish?: boolean;
          is_searchable?: boolean;
          label?: string;
          land_category?: Database["public"]["Enums"]["land_category"] | null;
          sort_order?: number;
          unit_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          value_type?: Database["public"]["Enums"]["attribute_value_type"];
        };
        Relationships: [
          {
            foreignKeyName: "property_attribute_definitions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "property_attribute_definitions_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_attribute_definitions_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_attribute_definitions_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      property_attribute_options: {
        Row: {
          attribute_definition_id: string;
          code: string;
          created_at: string;
          id: string;
          is_active: boolean;
          label: string;
          sort_order: number;
        };
        Insert: {
          attribute_definition_id: string;
          code: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label: string;
          sort_order?: number;
        };
        Update: {
          attribute_definition_id?: string;
          code?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "property_attribute_options_attribute_definition_id_fkey";
            columns: ["attribute_definition_id"];
            isOneToOne: false;
            referencedRelation: "property_attribute_definitions";
            referencedColumns: ["id"];
          },
        ];
      };
      property_attribute_values: {
        Row: {
          attribute_definition_id: string;
          boolean_value: boolean | null;
          created_at: string;
          date_value: string | null;
          decimal_value: number | null;
          id: string;
          integer_value: number | null;
          long_text_value: string | null;
          option_id: string | null;
          property_id: string;
          public_visibility: Database["public"]["Enums"]["record_visibility"];
          sort_key: number | null;
          source_reference_id: string | null;
          text_value: string | null;
          timestamp_value: string | null;
          updated_at: string;
        };
        Insert: {
          attribute_definition_id: string;
          boolean_value?: boolean | null;
          created_at?: string;
          date_value?: string | null;
          decimal_value?: number | null;
          id?: string;
          integer_value?: number | null;
          long_text_value?: string | null;
          option_id?: string | null;
          property_id: string;
          public_visibility?: Database["public"]["Enums"]["record_visibility"];
          sort_key?: number | null;
          source_reference_id?: string | null;
          text_value?: string | null;
          timestamp_value?: string | null;
          updated_at?: string;
        };
        Update: {
          attribute_definition_id?: string;
          boolean_value?: boolean | null;
          created_at?: string;
          date_value?: string | null;
          decimal_value?: number | null;
          id?: string;
          integer_value?: number | null;
          long_text_value?: string | null;
          option_id?: string | null;
          property_id?: string;
          public_visibility?: Database["public"]["Enums"]["record_visibility"];
          sort_key?: number | null;
          source_reference_id?: string | null;
          text_value?: string | null;
          timestamp_value?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_attribute_values_attribute_definition_id_fkey";
            columns: ["attribute_definition_id"];
            isOneToOne: false;
            referencedRelation: "property_attribute_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_attribute_values_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "property_attribute_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_attribute_values_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_attribute_values_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_attribute_values_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_attribute_values_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_attribute_values_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_attribute_values_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
        ];
      };
      property_industrial: {
        Row: {
          allotment_status: string | null;
          building_height_m: number | null;
          cetp_status: string | null;
          connectivity_summary: string | null;
          crane_provision: string | null;
          created_at: string;
          created_by: string | null;
          drainage_status: string | null;
          environmental_approval_summary: string | null;
          etp_status: string | null;
          existing_shed_present: boolean | null;
          gas_status: string | null;
          gidc_estate_id: string | null;
          gidc_plot_number: string | null;
          gidc_shed_number: string | null;
          industrial_authority_name: string | null;
          industrial_subtype: string | null;
          industrial_tenure: string | null;
          lease_end_date: string | null;
          lease_start_date: string | null;
          open_area_unit_id: string | null;
          open_area_value: number | null;
          permitted_industrial_use: string | null;
          possession_status: string | null;
          power_status: string | null;
          property_id: string;
          road_width_m: number | null;
          sanctioned_load_kw: number | null;
          shed_area_unit_id: string | null;
          shed_area_value: number | null;
          transfer_status: string | null;
          transformer_status: string | null;
          truck_loading_access: string | null;
          updated_at: string;
          updated_by: string | null;
          water_status: string | null;
        };
        Insert: {
          allotment_status?: string | null;
          building_height_m?: number | null;
          cetp_status?: string | null;
          connectivity_summary?: string | null;
          crane_provision?: string | null;
          created_at?: string;
          created_by?: string | null;
          drainage_status?: string | null;
          environmental_approval_summary?: string | null;
          etp_status?: string | null;
          existing_shed_present?: boolean | null;
          gas_status?: string | null;
          gidc_estate_id?: string | null;
          gidc_plot_number?: string | null;
          gidc_shed_number?: string | null;
          industrial_authority_name?: string | null;
          industrial_subtype?: string | null;
          industrial_tenure?: string | null;
          lease_end_date?: string | null;
          lease_start_date?: string | null;
          open_area_unit_id?: string | null;
          open_area_value?: number | null;
          permitted_industrial_use?: string | null;
          possession_status?: string | null;
          power_status?: string | null;
          property_id: string;
          road_width_m?: number | null;
          sanctioned_load_kw?: number | null;
          shed_area_unit_id?: string | null;
          shed_area_value?: number | null;
          transfer_status?: string | null;
          transformer_status?: string | null;
          truck_loading_access?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          water_status?: string | null;
        };
        Update: {
          allotment_status?: string | null;
          building_height_m?: number | null;
          cetp_status?: string | null;
          connectivity_summary?: string | null;
          crane_provision?: string | null;
          created_at?: string;
          created_by?: string | null;
          drainage_status?: string | null;
          environmental_approval_summary?: string | null;
          etp_status?: string | null;
          existing_shed_present?: boolean | null;
          gas_status?: string | null;
          gidc_estate_id?: string | null;
          gidc_plot_number?: string | null;
          gidc_shed_number?: string | null;
          industrial_authority_name?: string | null;
          industrial_subtype?: string | null;
          industrial_tenure?: string | null;
          lease_end_date?: string | null;
          lease_start_date?: string | null;
          open_area_unit_id?: string | null;
          open_area_value?: number | null;
          permitted_industrial_use?: string | null;
          possession_status?: string | null;
          power_status?: string | null;
          property_id?: string;
          road_width_m?: number | null;
          sanctioned_load_kw?: number | null;
          shed_area_unit_id?: string | null;
          shed_area_value?: number | null;
          transfer_status?: string | null;
          transformer_status?: string | null;
          truck_loading_access?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          water_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "property_industrial_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "property_industrial_gidc_estate_id_fkey";
            columns: ["gidc_estate_id"];
            isOneToOne: false;
            referencedRelation: "gidc_estates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_industrial_open_area_unit_id_fkey";
            columns: ["open_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_industrial_open_area_unit_id_fkey";
            columns: ["open_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_industrial_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_industrial_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_industrial_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_industrial_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_industrial_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_industrial_shed_area_unit_id_fkey";
            columns: ["shed_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_industrial_shed_area_unit_id_fkey";
            columns: ["shed_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_industrial_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      property_locations: {
        Row: {
          created_at: string;
          location_notes: string | null;
          location_source_reference_id: string | null;
          location_visibility: Database["public"]["Enums"]["location_visibility"];
          private_accuracy_m: number | null;
          private_latitude: number | null;
          private_longitude: number | null;
          property_id: string;
          public_accuracy_m: number | null;
          public_latitude: number | null;
          public_longitude: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          location_notes?: string | null;
          location_source_reference_id?: string | null;
          location_visibility?: Database["public"]["Enums"]["location_visibility"];
          private_accuracy_m?: number | null;
          private_latitude?: number | null;
          private_longitude?: number | null;
          property_id: string;
          public_accuracy_m?: number | null;
          public_latitude?: number | null;
          public_longitude?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          location_notes?: string | null;
          location_source_reference_id?: string | null;
          location_visibility?: Database["public"]["Enums"]["location_visibility"];
          private_accuracy_m?: number | null;
          private_latitude?: number | null;
          private_longitude?: number | null;
          property_id?: string;
          public_accuracy_m?: number | null;
          public_latitude?: number | null;
          public_longitude?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_locations_location_source_reference_id_fkey";
            columns: ["location_source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_locations_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_locations_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_locations_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_locations_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_locations_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
        ];
      };
      property_na: {
        Row: {
          corner_plot: boolean | null;
          created_at: string;
          created_by: string | null;
          development_permission_status: string | null;
          drainage_status: string | null;
          electricity_status: string | null;
          far: number | null;
          frontage_m: number | null;
          fsi: number | null;
          fsi_source_reference_id: string | null;
          layout_approval_status: string | null;
          layout_source_reference_id: string | null;
          na_order_date: string | null;
          na_order_reference: string | null;
          na_purpose: string | null;
          na_status: string;
          property_id: string;
          restriction_summary: string | null;
          road_width_m: number | null;
          updated_at: string;
          updated_by: string | null;
          water_status: string | null;
        };
        Insert: {
          corner_plot?: boolean | null;
          created_at?: string;
          created_by?: string | null;
          development_permission_status?: string | null;
          drainage_status?: string | null;
          electricity_status?: string | null;
          far?: number | null;
          frontage_m?: number | null;
          fsi?: number | null;
          fsi_source_reference_id?: string | null;
          layout_approval_status?: string | null;
          layout_source_reference_id?: string | null;
          na_order_date?: string | null;
          na_order_reference?: string | null;
          na_purpose?: string | null;
          na_status: string;
          property_id: string;
          restriction_summary?: string | null;
          road_width_m?: number | null;
          updated_at?: string;
          updated_by?: string | null;
          water_status?: string | null;
        };
        Update: {
          corner_plot?: boolean | null;
          created_at?: string;
          created_by?: string | null;
          development_permission_status?: string | null;
          drainage_status?: string | null;
          electricity_status?: string | null;
          far?: number | null;
          frontage_m?: number | null;
          fsi?: number | null;
          fsi_source_reference_id?: string | null;
          layout_approval_status?: string | null;
          layout_source_reference_id?: string | null;
          na_order_date?: string | null;
          na_order_reference?: string | null;
          na_purpose?: string | null;
          na_status?: string;
          property_id?: string;
          restriction_summary?: string | null;
          road_width_m?: number | null;
          updated_at?: string;
          updated_by?: string | null;
          water_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "property_na_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "property_na_fsi_source_reference_id_fkey";
            columns: ["fsi_source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_na_layout_source_reference_id_fkey";
            columns: ["layout_source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_na_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_na_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_na_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_na_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_na_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_na_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      property_offers: {
        Row: {
          archived_at: string | null;
          commercial_terms: string | null;
          created_at: string;
          currency_code: string;
          id: string;
          is_negotiable: boolean;
          is_primary: boolean;
          payment_frequency: string | null;
          price_amount: number | null;
          price_max: number | null;
          price_min: number | null;
          price_mode: Database["public"]["Enums"]["price_mode"];
          price_per_unit: number | null;
          price_unit_id: string | null;
          property_id: string;
          security_deposit_amount: number | null;
          term_max_months: number | null;
          term_min_months: number | null;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          commercial_terms?: string | null;
          created_at?: string;
          currency_code?: string;
          id?: string;
          is_negotiable?: boolean;
          is_primary?: boolean;
          payment_frequency?: string | null;
          price_amount?: number | null;
          price_max?: number | null;
          price_min?: number | null;
          price_mode: Database["public"]["Enums"]["price_mode"];
          price_per_unit?: number | null;
          price_unit_id?: string | null;
          property_id: string;
          security_deposit_amount?: number | null;
          term_max_months?: number | null;
          term_min_months?: number | null;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          commercial_terms?: string | null;
          created_at?: string;
          currency_code?: string;
          id?: string;
          is_negotiable?: boolean;
          is_primary?: boolean;
          payment_frequency?: string | null;
          price_amount?: number | null;
          price_max?: number | null;
          price_min?: number | null;
          price_mode?: Database["public"]["Enums"]["price_mode"];
          price_per_unit?: number | null;
          price_unit_id?: string | null;
          property_id?: string;
          security_deposit_amount?: number | null;
          term_max_months?: number | null;
          term_min_months?: number | null;
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_offers_price_unit_id_fkey";
            columns: ["price_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_offers_price_unit_id_fkey";
            columns: ["price_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_offers_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_offers_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_offers_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_offers_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_offers_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
        ];
      };
      property_parcels: {
        Row: {
          archived_at: string | null;
          area_normalization_status: Database["public"]["Enums"]["area_normalization_status"];
          area_source_reference_id: string | null;
          created_at: string;
          display_area_unit_id: string | null;
          display_area_value: number | null;
          id: string;
          normalized_area_sqm: number | null;
          notes_internal: string | null;
          parcel_label: string | null;
          property_id: string;
          sequence_no: number;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          area_normalization_status?: Database["public"]["Enums"]["area_normalization_status"];
          area_source_reference_id?: string | null;
          created_at?: string;
          display_area_unit_id?: string | null;
          display_area_value?: number | null;
          id?: string;
          normalized_area_sqm?: number | null;
          notes_internal?: string | null;
          parcel_label?: string | null;
          property_id: string;
          sequence_no: number;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          area_normalization_status?: Database["public"]["Enums"]["area_normalization_status"];
          area_source_reference_id?: string | null;
          created_at?: string;
          display_area_unit_id?: string | null;
          display_area_value?: number | null;
          id?: string;
          normalized_area_sqm?: number | null;
          notes_internal?: string | null;
          parcel_label?: string | null;
          property_id?: string;
          sequence_no?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_parcels_area_source_reference_id_fkey";
            columns: ["area_source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parcels_display_area_unit_id_fkey";
            columns: ["display_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parcels_display_area_unit_id_fkey";
            columns: ["display_area_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parcels_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parcels_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parcels_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parcels_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parcels_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
        ];
      };
      property_parties: {
        Row: {
          archived_at: string | null;
          authority_document_id: string | null;
          created_at: string;
          created_by: string | null;
          end_date: string | null;
          id: string;
          is_primary: boolean;
          notes_internal: string | null;
          ownership_share_percent: number | null;
          party_id: string;
          property_id: string;
          role: Database["public"]["Enums"]["property_party_role"];
          start_date: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          archived_at?: string | null;
          authority_document_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          end_date?: string | null;
          id?: string;
          is_primary?: boolean;
          notes_internal?: string | null;
          ownership_share_percent?: number | null;
          party_id: string;
          property_id: string;
          role: Database["public"]["Enums"]["property_party_role"];
          start_date?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          authority_document_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          end_date?: string | null;
          id?: string;
          is_primary?: boolean;
          notes_internal?: string | null;
          ownership_share_percent?: number | null;
          party_id?: string;
          property_id?: string;
          role?: Database["public"]["Enums"]["property_party_role"];
          start_date?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "property_parties_authority_document_fk";
            columns: ["authority_document_id"];
            isOneToOne: false;
            referencedRelation: "private_documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parties_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "property_parties_party_id_fkey";
            columns: ["party_id"];
            isOneToOne: false;
            referencedRelation: "parties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parties_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parties_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      property_planning_context: {
        Row: {
          archived_at: string | null;
          checked_at: string | null;
          created_at: string;
          development_plan_zone_id: string | null;
          id: string;
          planning_authority_id: string | null;
          planning_notes_internal: string | null;
          planning_notes_public: string | null;
          primary_tp_plot_id: string | null;
          property_id: string;
          reservation_status: string | null;
          road_reservation_status: string | null;
          source_reference_id: string | null;
          tp_scheme_id: string | null;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          checked_at?: string | null;
          created_at?: string;
          development_plan_zone_id?: string | null;
          id?: string;
          planning_authority_id?: string | null;
          planning_notes_internal?: string | null;
          planning_notes_public?: string | null;
          primary_tp_plot_id?: string | null;
          property_id: string;
          reservation_status?: string | null;
          road_reservation_status?: string | null;
          source_reference_id?: string | null;
          tp_scheme_id?: string | null;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          checked_at?: string | null;
          created_at?: string;
          development_plan_zone_id?: string | null;
          id?: string;
          planning_authority_id?: string | null;
          planning_notes_internal?: string | null;
          planning_notes_public?: string | null;
          primary_tp_plot_id?: string | null;
          property_id?: string;
          reservation_status?: string | null;
          road_reservation_status?: string | null;
          source_reference_id?: string | null;
          tp_scheme_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_planning_context_development_plan_zone_id_fkey";
            columns: ["development_plan_zone_id"];
            isOneToOne: false;
            referencedRelation: "development_plan_zones";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_planning_context_planning_authority_id_fkey";
            columns: ["planning_authority_id"];
            isOneToOne: false;
            referencedRelation: "planning_authorities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_planning_context_primary_tp_plot_id_fkey";
            columns: ["primary_tp_plot_id"];
            isOneToOne: false;
            referencedRelation: "tp_plots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_planning_context_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_planning_context_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_planning_context_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_planning_context_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_planning_context_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_planning_context_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_planning_context_tp_scheme_id_fkey";
            columns: ["tp_scheme_id"];
            isOneToOne: false;
            referencedRelation: "tp_schemes";
            referencedColumns: ["id"];
          },
        ];
      };
      property_source_links: {
        Row: {
          created_at: string;
          id: string;
          notes_internal: string | null;
          party_id: string | null;
          property_id: string;
          source_name: string | null;
          source_reference: string | null;
          source_type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes_internal?: string | null;
          party_id?: string | null;
          property_id: string;
          source_name?: string | null;
          source_reference?: string | null;
          source_type: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes_internal?: string | null;
          party_id?: string | null;
          property_id?: string;
          source_name?: string | null;
          source_reference?: string | null;
          source_type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_source_links_party_id_fkey";
            columns: ["party_id"];
            isOneToOne: false;
            referencedRelation: "parties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_source_links_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_source_links_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_source_links_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_source_links_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_source_links_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
        ];
      };
      property_verifications: {
        Row: {
          applicability: Database["public"]["Enums"]["verification_applicability"];
          applicability_reason: string | null;
          check_date: string | null;
          check_definition_id: string;
          created_at: string;
          id: string;
          limitations: string | null;
          property_id: string;
          public_copy_policy_id: string | null;
          public_disclosure_eligible: boolean;
          public_explanation: string | null;
          public_label: string | null;
          public_limitation: string | null;
          public_visible: boolean;
          recheck_at: string | null;
          referral_required: boolean;
          referral_type: string | null;
          review_iteration: number;
          reviewed_at: string | null;
          reviewed_by: string | null;
          reviewer_notes_internal: string | null;
          risk_level: Database["public"]["Enums"]["risk_level"];
          scope_statement: string | null;
          source_reference_id: string | null;
          status: Database["public"]["Enums"]["verification_status"];
          unresolved_exceptions_summary: string | null;
          updated_at: string;
        };
        Insert: {
          applicability?: Database["public"]["Enums"]["verification_applicability"];
          applicability_reason?: string | null;
          check_date?: string | null;
          check_definition_id: string;
          created_at?: string;
          id?: string;
          limitations?: string | null;
          property_id: string;
          public_copy_policy_id?: string | null;
          public_disclosure_eligible?: boolean;
          public_explanation?: string | null;
          public_label?: string | null;
          public_limitation?: string | null;
          public_visible?: boolean;
          recheck_at?: string | null;
          referral_required?: boolean;
          referral_type?: string | null;
          review_iteration?: number;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_notes_internal?: string | null;
          risk_level?: Database["public"]["Enums"]["risk_level"];
          scope_statement?: string | null;
          source_reference_id?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          unresolved_exceptions_summary?: string | null;
          updated_at?: string;
        };
        Update: {
          applicability?: Database["public"]["Enums"]["verification_applicability"];
          applicability_reason?: string | null;
          check_date?: string | null;
          check_definition_id?: string;
          created_at?: string;
          id?: string;
          limitations?: string | null;
          property_id?: string;
          public_copy_policy_id?: string | null;
          public_disclosure_eligible?: boolean;
          public_explanation?: string | null;
          public_label?: string | null;
          public_limitation?: string | null;
          public_visible?: boolean;
          recheck_at?: string | null;
          referral_required?: boolean;
          referral_type?: string | null;
          review_iteration?: number;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          reviewer_notes_internal?: string | null;
          risk_level?: Database["public"]["Enums"]["risk_level"];
          scope_statement?: string | null;
          source_reference_id?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          unresolved_exceptions_summary?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_verifications_check_definition_id_fkey";
            columns: ["check_definition_id"];
            isOneToOne: false;
            referencedRelation: "verification_check_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_verifications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_verifications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_verifications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_verifications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_verifications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_verifications_public_copy_policy_id_fkey";
            columns: ["public_copy_policy_id"];
            isOneToOne: false;
            referencedRelation: "verification_public_copy_policies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_verifications_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "property_verifications_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
        ];
      };
      public_intake_idempotency: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          intake_action: string;
          key_hash: string;
          lead_id: string;
          payload_hash: string;
          property_id: string | null;
        };
        Insert: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          intake_action: string;
          key_hash: string;
          lead_id: string;
          payload_hash: string;
          property_id?: string | null;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          intake_action?: string;
          key_hash?: string;
          lead_id?: string;
          payload_hash?: string;
          property_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_intake_idempotency_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_intake_idempotency_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_intake_idempotency_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_intake_idempotency_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_intake_idempotency_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_intake_idempotency_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
        ];
      };
      public_rate_limit_events: {
        Row: {
          bucket_hash: string;
          id: number;
          intake_action: string;
          occurred_at: string;
        };
        Insert: {
          bucket_hash: string;
          id?: never;
          intake_action: string;
          occurred_at?: string;
        };
        Update: {
          bucket_hash?: string;
          id?: never;
          intake_action?: string;
          occurred_at?: string;
        };
        Relationships: [];
      };
      seo_pages: {
        Row: {
          archived_at: string | null;
          body_markdown: string | null;
          canonical_url: string | null;
          created_at: string;
          created_by: string | null;
          district_id: string | null;
          id: string;
          intro_text: string | null;
          land_category: Database["public"]["Enums"]["land_category"] | null;
          locality_id: string | null;
          page_type: string;
          published_at: string | null;
          published_by: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: Database["public"]["Enums"]["seo_page_status"];
          title: string;
          transaction_type: Database["public"]["Enums"]["transaction_type"] | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          archived_at?: string | null;
          body_markdown?: string | null;
          canonical_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: string | null;
          id?: string;
          intro_text?: string | null;
          land_category?: Database["public"]["Enums"]["land_category"] | null;
          locality_id?: string | null;
          page_type: string;
          published_at?: string | null;
          published_by?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["seo_page_status"];
          title: string;
          transaction_type?: Database["public"]["Enums"]["transaction_type"] | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          archived_at?: string | null;
          body_markdown?: string | null;
          canonical_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          district_id?: string | null;
          id?: string;
          intro_text?: string | null;
          land_category?: Database["public"]["Enums"]["land_category"] | null;
          locality_id?: string | null;
          page_type?: string;
          published_at?: string | null;
          published_by?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["seo_page_status"];
          title?: string;
          transaction_type?: Database["public"]["Enums"]["transaction_type"] | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "seo_pages_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "seo_pages_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_pages_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["district_id"];
          },
          {
            foreignKeyName: "seo_pages_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "localities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_pages_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["locality_id"];
          },
          {
            foreignKeyName: "seo_pages_published_by_fkey";
            columns: ["published_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "seo_pages_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      seo_redirects: {
        Row: {
          created_at: string;
          created_by: string | null;
          destination_path: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          is_active: boolean;
          source_path: string;
          status_code: number;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          destination_path: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          is_active?: boolean;
          source_path: string;
          status_code?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          destination_path?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          is_active?: boolean;
          source_path?: string;
          status_code?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "seo_redirects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "seo_redirects_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      site_visit_events: {
        Row: {
          actor_admin_id: string | null;
          created_at: string;
          event_type: string;
          follow_up_id: string | null;
          from_status: Database["public"]["Enums"]["site_visit_status"] | null;
          id: string;
          lead_id: string;
          new_end_at: string | null;
          new_start_at: string | null;
          note: string | null;
          occurred_at: string;
          previous_end_at: string | null;
          previous_start_at: string | null;
          property_id: string;
          reason: string | null;
          site_visit_id: string;
          to_status: Database["public"]["Enums"]["site_visit_status"] | null;
        };
        Insert: {
          actor_admin_id?: string | null;
          created_at?: string;
          event_type: string;
          follow_up_id?: string | null;
          from_status?: Database["public"]["Enums"]["site_visit_status"] | null;
          id?: string;
          lead_id: string;
          new_end_at?: string | null;
          new_start_at?: string | null;
          note?: string | null;
          occurred_at?: string;
          previous_end_at?: string | null;
          previous_start_at?: string | null;
          property_id: string;
          reason?: string | null;
          site_visit_id: string;
          to_status?: Database["public"]["Enums"]["site_visit_status"] | null;
        };
        Update: {
          actor_admin_id?: string | null;
          created_at?: string;
          event_type?: string;
          follow_up_id?: string | null;
          from_status?: Database["public"]["Enums"]["site_visit_status"] | null;
          id?: string;
          lead_id?: string;
          new_end_at?: string | null;
          new_start_at?: string | null;
          note?: string | null;
          occurred_at?: string;
          previous_end_at?: string | null;
          previous_start_at?: string | null;
          property_id?: string;
          reason?: string | null;
          site_visit_id?: string;
          to_status?: Database["public"]["Enums"]["site_visit_status"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "site_visit_events_actor_admin_id_fkey";
            columns: ["actor_admin_id"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "site_visit_events_follow_up_id_fkey";
            columns: ["follow_up_id"];
            isOneToOne: false;
            referencedRelation: "lead_follow_ups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visit_events_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visit_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visit_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visit_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visit_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visit_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visit_events_site_visit_id_fkey";
            columns: ["site_visit_id"];
            isOneToOne: false;
            referencedRelation: "site_visits";
            referencedColumns: ["id"];
          },
        ];
      };
      site_visits: {
        Row: {
          archived_at: string | null;
          assigned_to: string | null;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          completed_at: string | null;
          confirmed_end_at: string | null;
          confirmed_start_at: string | null;
          contact_outcome: string | null;
          contacted_at: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          lead_id: string;
          meeting_instructions: string | null;
          no_show_at: string | null;
          notes_internal: string | null;
          outcome: string | null;
          property_id: string;
          proposed_end_at: string | null;
          proposed_start_at: string | null;
          requested_end_at: string | null;
          requested_start_at: string | null;
          status: Database["public"]["Enums"]["site_visit_status"];
          timezone: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
          visit_reference: string;
        };
        Insert: {
          archived_at?: string | null;
          assigned_to?: string | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          confirmed_end_at?: string | null;
          confirmed_start_at?: string | null;
          contact_outcome?: string | null;
          contacted_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          lead_id: string;
          meeting_instructions?: string | null;
          no_show_at?: string | null;
          notes_internal?: string | null;
          outcome?: string | null;
          property_id: string;
          proposed_end_at?: string | null;
          proposed_start_at?: string | null;
          requested_end_at?: string | null;
          requested_start_at?: string | null;
          status?: Database["public"]["Enums"]["site_visit_status"];
          timezone?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
          visit_reference?: string;
        };
        Update: {
          archived_at?: string | null;
          assigned_to?: string | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          confirmed_end_at?: string | null;
          confirmed_start_at?: string | null;
          contact_outcome?: string | null;
          contacted_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          lead_id?: string;
          meeting_instructions?: string | null;
          no_show_at?: string | null;
          notes_internal?: string | null;
          outcome?: string | null;
          property_id?: string;
          proposed_end_at?: string | null;
          proposed_start_at?: string | null;
          requested_end_at?: string | null;
          requested_start_at?: string | null;
          status?: Database["public"]["Enums"]["site_visit_status"];
          timezone?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
          visit_reference?: string;
        };
        Relationships: [
          {
            foreignKeyName: "site_visits_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "site_visits_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "site_visits_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visits_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visits_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visits_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visits_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visits_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visits_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      source_references: {
        Row: {
          accessed_at: string | null;
          authority_name: string;
          certification_type: string | null;
          created_at: string;
          document_date: string | null;
          document_or_service_name: string;
          id: string;
          last_known_update_date: string | null;
          notes: string | null;
          record_identifier: string | null;
          reference_number: string | null;
          retrieval_method: string | null;
          snapshot_reference: string | null;
          source_class: Database["public"]["Enums"]["verification_source_class"] | null;
          source_classification: string;
          source_system: string;
          source_url: string | null;
          source_version: string | null;
          updated_at: string;
        };
        Insert: {
          accessed_at?: string | null;
          authority_name: string;
          certification_type?: string | null;
          created_at?: string;
          document_date?: string | null;
          document_or_service_name: string;
          id?: string;
          last_known_update_date?: string | null;
          notes?: string | null;
          record_identifier?: string | null;
          reference_number?: string | null;
          retrieval_method?: string | null;
          snapshot_reference?: string | null;
          source_class?: Database["public"]["Enums"]["verification_source_class"] | null;
          source_classification: string;
          source_system: string;
          source_url?: string | null;
          source_version?: string | null;
          updated_at?: string;
        };
        Update: {
          accessed_at?: string | null;
          authority_name?: string;
          certification_type?: string | null;
          created_at?: string;
          document_date?: string | null;
          document_or_service_name?: string;
          id?: string;
          last_known_update_date?: string | null;
          notes?: string | null;
          record_identifier?: string | null;
          reference_number?: string | null;
          retrieval_method?: string | null;
          snapshot_reference?: string | null;
          source_class?: Database["public"]["Enums"]["verification_source_class"] | null;
          source_classification?: string;
          source_system?: string;
          source_url?: string | null;
          source_version?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      states: {
        Row: {
          code: string;
          country_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          country_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          country_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "states_country_id_fkey";
            columns: ["country_id"];
            isOneToOne: false;
            referencedRelation: "countries";
            referencedColumns: ["id"];
          },
        ];
      };
      subdistricts: {
        Row: {
          code: string | null;
          created_at: string;
          district_id: string;
          id: string;
          is_active: boolean;
          name: string;
          source_reference_id: string | null;
          updated_at: string;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          district_id: string;
          id?: string;
          is_active?: boolean;
          name: string;
          source_reference_id?: string | null;
          updated_at?: string;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          district_id?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          source_reference_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subdistricts_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subdistricts_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["district_id"];
          },
          {
            foreignKeyName: "subdistricts_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
        ];
      };
      tp_plots: {
        Row: {
          area_unit_id: string | null;
          area_value: number | null;
          created_at: string;
          id: string;
          plot_number: string;
          plot_type: string;
          source_reference_id: string | null;
          tp_scheme_id: string;
          updated_at: string;
        };
        Insert: {
          area_unit_id?: string | null;
          area_value?: number | null;
          created_at?: string;
          id?: string;
          plot_number: string;
          plot_type: string;
          source_reference_id?: string | null;
          tp_scheme_id: string;
          updated_at?: string;
        };
        Update: {
          area_unit_id?: string | null;
          area_value?: number | null;
          created_at?: string;
          id?: string;
          plot_number?: string;
          plot_type?: string;
          source_reference_id?: string | null;
          tp_scheme_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tp_plots_area_unit_id_fkey";
            columns: ["area_unit_id"];
            isOneToOne: false;
            referencedRelation: "area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tp_plots_area_unit_id_fkey";
            columns: ["area_unit_id"];
            isOneToOne: false;
            referencedRelation: "public_area_units";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tp_plots_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tp_plots_tp_scheme_id_fkey";
            columns: ["tp_scheme_id"];
            isOneToOne: false;
            referencedRelation: "tp_schemes";
            referencedColumns: ["id"];
          },
        ];
      };
      tp_schemes: {
        Row: {
          created_at: string;
          id: string;
          name: string | null;
          planning_authority_id: string;
          scheme_number: string;
          source_reference_id: string | null;
          status: string | null;
          updated_at: string;
          village_context: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string | null;
          planning_authority_id: string;
          scheme_number: string;
          source_reference_id?: string | null;
          status?: string | null;
          updated_at?: string;
          village_context?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string | null;
          planning_authority_id?: string;
          scheme_number?: string;
          source_reference_id?: string | null;
          status?: string | null;
          updated_at?: string;
          village_context?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tp_schemes_planning_authority_id_fkey";
            columns: ["planning_authority_id"];
            isOneToOne: false;
            referencedRelation: "planning_authorities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tp_schemes_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
        ];
      };
      verification_check_definitions: {
        Row: {
          applies_to_transaction: Database["public"]["Enums"]["transaction_type"] | null;
          blocked_if_stale: boolean;
          category_scope: Database["public"]["Enums"]["land_category"] | null;
          code: string;
          created_at: string;
          default_required_for_publish: boolean;
          description_internal: string | null;
          evidence_types: string[];
          id: string;
          is_active: boolean;
          lawyer_review_required_by_default: boolean;
          minimum_provenance: Database["public"]["Enums"]["evidence_provenance_state"];
          name: string;
          policy_version: number;
          public_explanation_template: string | null;
          public_label_default: string | null;
          recheck_days_default: number | null;
          required_evidence: boolean;
          requires_exception_resolution: boolean;
          risk_if_failed: Database["public"]["Enums"]["risk_level"];
          sort_order: number;
          source_class: Database["public"]["Enums"]["verification_source_class"];
          surveyor_review_required_by_default: boolean;
          updated_at: string;
        };
        Insert: {
          applies_to_transaction?: Database["public"]["Enums"]["transaction_type"] | null;
          blocked_if_stale?: boolean;
          category_scope?: Database["public"]["Enums"]["land_category"] | null;
          code: string;
          created_at?: string;
          default_required_for_publish?: boolean;
          description_internal?: string | null;
          evidence_types?: string[];
          id?: string;
          is_active?: boolean;
          lawyer_review_required_by_default?: boolean;
          minimum_provenance?: Database["public"]["Enums"]["evidence_provenance_state"];
          name: string;
          policy_version?: number;
          public_explanation_template?: string | null;
          public_label_default?: string | null;
          recheck_days_default?: number | null;
          required_evidence?: boolean;
          requires_exception_resolution?: boolean;
          risk_if_failed?: Database["public"]["Enums"]["risk_level"];
          sort_order?: number;
          source_class?: Database["public"]["Enums"]["verification_source_class"];
          surveyor_review_required_by_default?: boolean;
          updated_at?: string;
        };
        Update: {
          applies_to_transaction?: Database["public"]["Enums"]["transaction_type"] | null;
          blocked_if_stale?: boolean;
          category_scope?: Database["public"]["Enums"]["land_category"] | null;
          code?: string;
          created_at?: string;
          default_required_for_publish?: boolean;
          description_internal?: string | null;
          evidence_types?: string[];
          id?: string;
          is_active?: boolean;
          lawyer_review_required_by_default?: boolean;
          minimum_provenance?: Database["public"]["Enums"]["evidence_provenance_state"];
          name?: string;
          policy_version?: number;
          public_explanation_template?: string | null;
          public_label_default?: string | null;
          recheck_days_default?: number | null;
          required_evidence?: boolean;
          requires_exception_resolution?: boolean;
          risk_if_failed?: Database["public"]["Enums"]["risk_level"];
          sort_order?: number;
          source_class?: Database["public"]["Enums"]["verification_source_class"];
          surveyor_review_required_by_default?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      verification_evidence: {
        Row: {
          created_at: string;
          created_by: string | null;
          evidence_notes_internal: string | null;
          evidence_reference: string | null;
          evidence_type: string;
          id: string;
          observed_date: string | null;
          private_document_id: string | null;
          professional_review_id: string | null;
          property_verification_id: string;
          provenance_state: Database["public"]["Enums"]["evidence_provenance_state"];
          reviewed_at: string | null;
          reviewed_by: string | null;
          revoked_at: string | null;
          revoked_by: string | null;
          source_class: Database["public"]["Enums"]["verification_source_class"];
          source_reference_id: string | null;
          source_verified_at: string | null;
          source_verified_by: string | null;
          superseded_at: string | null;
          superseded_by_id: string | null;
          supports_check: boolean;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          evidence_notes_internal?: string | null;
          evidence_reference?: string | null;
          evidence_type: string;
          id?: string;
          observed_date?: string | null;
          private_document_id?: string | null;
          professional_review_id?: string | null;
          property_verification_id: string;
          provenance_state?: Database["public"]["Enums"]["evidence_provenance_state"];
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
          source_class?: Database["public"]["Enums"]["verification_source_class"];
          source_reference_id?: string | null;
          source_verified_at?: string | null;
          source_verified_by?: string | null;
          superseded_at?: string | null;
          superseded_by_id?: string | null;
          supports_check?: boolean;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          evidence_notes_internal?: string | null;
          evidence_reference?: string | null;
          evidence_type?: string;
          id?: string;
          observed_date?: string | null;
          private_document_id?: string | null;
          professional_review_id?: string | null;
          property_verification_id?: string;
          provenance_state?: Database["public"]["Enums"]["evidence_provenance_state"];
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
          source_class?: Database["public"]["Enums"]["verification_source_class"];
          source_reference_id?: string | null;
          source_verified_at?: string | null;
          source_verified_by?: string | null;
          superseded_at?: string | null;
          superseded_by_id?: string | null;
          supports_check?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_evidence_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "verification_evidence_private_document_id_fkey";
            columns: ["private_document_id"];
            isOneToOne: false;
            referencedRelation: "private_documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_evidence_professional_review_id_fkey";
            columns: ["professional_review_id"];
            isOneToOne: false;
            referencedRelation: "professional_reviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_evidence_property_verification_id_fkey";
            columns: ["property_verification_id"];
            isOneToOne: false;
            referencedRelation: "property_verifications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_evidence_property_verification_id_fkey";
            columns: ["property_verification_id"];
            isOneToOne: false;
            referencedRelation: "public_property_verification_summaries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_evidence_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "verification_evidence_revoked_by_fkey";
            columns: ["revoked_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "verification_evidence_source_reference_id_fkey";
            columns: ["source_reference_id"];
            isOneToOne: false;
            referencedRelation: "source_references";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_evidence_source_verified_by_fkey";
            columns: ["source_verified_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "verification_evidence_superseded_by_id_fkey";
            columns: ["superseded_by_id"];
            isOneToOne: false;
            referencedRelation: "verification_evidence";
            referencedColumns: ["id"];
          },
        ];
      };
      verification_exceptions: {
        Row: {
          blocks_public_disclosure: boolean;
          created_at: string;
          created_by: string;
          id: string;
          limitation: string | null;
          professional_referral_required: boolean;
          property_verification_id: string;
          resolution_summary: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          severity: Database["public"]["Enums"]["risk_level"];
          status: Database["public"]["Enums"]["verification_exception_status"];
          summary: string;
        };
        Insert: {
          blocks_public_disclosure?: boolean;
          created_at?: string;
          created_by: string;
          id?: string;
          limitation?: string | null;
          professional_referral_required?: boolean;
          property_verification_id: string;
          resolution_summary?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          severity: Database["public"]["Enums"]["risk_level"];
          status?: Database["public"]["Enums"]["verification_exception_status"];
          summary: string;
        };
        Update: {
          blocks_public_disclosure?: boolean;
          created_at?: string;
          created_by?: string;
          id?: string;
          limitation?: string | null;
          professional_referral_required?: boolean;
          property_verification_id?: string;
          resolution_summary?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          severity?: Database["public"]["Enums"]["risk_level"];
          status?: Database["public"]["Enums"]["verification_exception_status"];
          summary?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_exceptions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "verification_exceptions_property_verification_id_fkey";
            columns: ["property_verification_id"];
            isOneToOne: false;
            referencedRelation: "property_verifications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_exceptions_property_verification_id_fkey";
            columns: ["property_verification_id"];
            isOneToOne: false;
            referencedRelation: "public_property_verification_summaries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_exceptions_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      verification_history: {
        Row: {
          actor_admin_id: string;
          event_type: string;
          from_status: Database["public"]["Enums"]["verification_status"] | null;
          id: number;
          occurred_at: string;
          property_verification_id: string;
          reason: string | null;
          review_iteration: number;
          to_status: Database["public"]["Enums"]["verification_status"] | null;
        };
        Insert: {
          actor_admin_id: string;
          event_type: string;
          from_status?: Database["public"]["Enums"]["verification_status"] | null;
          id?: never;
          occurred_at?: string;
          property_verification_id: string;
          reason?: string | null;
          review_iteration: number;
          to_status?: Database["public"]["Enums"]["verification_status"] | null;
        };
        Update: {
          actor_admin_id?: string;
          event_type?: string;
          from_status?: Database["public"]["Enums"]["verification_status"] | null;
          id?: never;
          occurred_at?: string;
          property_verification_id?: string;
          reason?: string | null;
          review_iteration?: number;
          to_status?: Database["public"]["Enums"]["verification_status"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "verification_history_actor_admin_id_fkey";
            columns: ["actor_admin_id"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "verification_history_property_verification_id_fkey";
            columns: ["property_verification_id"];
            isOneToOne: false;
            referencedRelation: "property_verifications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_history_property_verification_id_fkey";
            columns: ["property_verification_id"];
            isOneToOne: false;
            referencedRelation: "public_property_verification_summaries";
            referencedColumns: ["id"];
          },
        ];
      };
      verification_public_copy_policies: {
        Row: {
          approval_status: Database["public"]["Enums"]["public_copy_approval_status"];
          approved_at: string | null;
          approved_by: string | null;
          check_definition_id: string;
          created_at: string;
          created_by: string | null;
          explanation_template: string;
          id: string;
          label: string;
          limitation_template: string;
          retired_at: string | null;
          version: number;
        };
        Insert: {
          approval_status?: Database["public"]["Enums"]["public_copy_approval_status"];
          approved_at?: string | null;
          approved_by?: string | null;
          check_definition_id: string;
          created_at?: string;
          created_by?: string | null;
          explanation_template: string;
          id?: string;
          label: string;
          limitation_template: string;
          retired_at?: string | null;
          version: number;
        };
        Update: {
          approval_status?: Database["public"]["Enums"]["public_copy_approval_status"];
          approved_at?: string | null;
          approved_by?: string | null;
          check_definition_id?: string;
          created_at?: string;
          created_by?: string | null;
          explanation_template?: string;
          id?: string;
          label?: string;
          limitation_template?: string;
          retired_at?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "verification_public_copy_policies_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "verification_public_copy_policies_check_definition_id_fkey";
            columns: ["check_definition_id"];
            isOneToOne: false;
            referencedRelation: "verification_check_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_public_copy_policies_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
    };
    Views: {
      public_app_settings: {
        Row: {
          key: string | null;
          label: string | null;
          value: Json | null;
          value_type: Database["public"]["Enums"]["setting_value_type"] | null;
        };
        Insert: {
          key?: string | null;
          label?: string | null;
          value?: never;
          value_type?: Database["public"]["Enums"]["setting_value_type"] | null;
        };
        Update: {
          key?: string | null;
          label?: string | null;
          value?: never;
          value_type?: Database["public"]["Enums"]["setting_value_type"] | null;
        };
        Relationships: [];
      };
      public_area_units: {
        Row: {
          code: string | null;
          display_name: string | null;
          id: string | null;
          is_local: boolean | null;
          is_metric: boolean | null;
          symbol: string | null;
        };
        Insert: {
          code?: string | null;
          display_name?: string | null;
          id?: string | null;
          is_local?: boolean | null;
          is_metric?: boolean | null;
          symbol?: string | null;
        };
        Update: {
          code?: string | null;
          display_name?: string | null;
          id?: string | null;
          is_local?: boolean | null;
          is_metric?: boolean | null;
          symbol?: string | null;
        };
        Relationships: [];
      };
      public_geography_options: {
        Row: {
          district_id: string | null;
          district_name: string | null;
          locality_id: string | null;
          locality_is_indexable: boolean | null;
          locality_name: string | null;
          locality_slug: string | null;
          place_id: string | null;
          place_name: string | null;
          subdistrict_id: string | null;
          subdistrict_name: string | null;
        };
        Relationships: [];
      };
      public_guide_categories: {
        Row: {
          description: string | null;
          id: string | null;
          name: string | null;
          slug: string | null;
          sort_order: number | null;
        };
        Insert: {
          description?: string | null;
          id?: string | null;
          name?: string | null;
          slug?: string | null;
          sort_order?: number | null;
        };
        Update: {
          description?: string | null;
          id?: string | null;
          name?: string | null;
          slug?: string | null;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      public_guides: {
        Row: {
          body_markdown: string | null;
          canonical_url: string | null;
          category_id: string | null;
          category_name: string | null;
          category_slug: string | null;
          excerpt: string | null;
          hero_alt_text: string | null;
          hero_height_px: number | null;
          hero_object_path: string | null;
          hero_storage_bucket: string | null;
          hero_width_px: number | null;
          id: string | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string | null;
          title: string | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "guides_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "guide_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "guides_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "public_guide_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      public_property_details: {
        Row: {
          agricultural_electricity_status: string | null;
          agricultural_road_touch: boolean | null;
          agricultural_road_width_m: number | null;
          agricultural_structure_present: boolean | null;
          agricultural_tenure_type: string | null;
          agricultural_use_status: string | null;
          allotment_status: string | null;
          availability_status: Database["public"]["Enums"]["property_availability_status"] | null;
          borewell_count: number | null;
          boundary_summary_public: string | null;
          canal_access_status: string | null;
          canonical_path: string | null;
          cetp_status: string | null;
          connectivity_summary: string | null;
          cover_alt_text: string | null;
          cover_height_px: number | null;
          cover_media_id: string | null;
          cover_object_path: string | null;
          cover_width_px: number | null;
          currency_code: string | null;
          current_cultivation_status: string | null;
          description: string | null;
          development_permission_status: string | null;
          development_plan_zone_name: string | null;
          display_area_unit_code: string | null;
          display_area_unit_name: string | null;
          display_area_unit_symbol: string | null;
          display_area_value: number | null;
          district_id: string | null;
          district_name: string | null;
          etp_status: string | null;
          existing_shed_present: boolean | null;
          featured: boolean | null;
          fencing_status: string | null;
          gas_status: string | null;
          gidc_estate_name: string | null;
          gidc_plot_number: string | null;
          gidc_shed_number: string | null;
          id: string | null;
          industrial_authority_name: string | null;
          industrial_drainage_status: string | null;
          industrial_road_width_m: number | null;
          industrial_subtype: string | null;
          industrial_tenure: string | null;
          industrial_water_status: string | null;
          irrigation_status: string | null;
          is_negotiable: boolean | null;
          land_category: Database["public"]["Enums"]["land_category"] | null;
          land_shape: string | null;
          landmark_text: string | null;
          layout_approval_status: string | null;
          listing_title: string | null;
          locality_id: string | null;
          locality_name: string | null;
          location_visibility: Database["public"]["Enums"]["location_visibility"] | null;
          na_corner_plot: boolean | null;
          na_drainage_status: string | null;
          na_electricity_status: string | null;
          na_frontage_m: number | null;
          na_order_date: string | null;
          na_order_reference: string | null;
          na_purpose: string | null;
          na_road_width_m: number | null;
          na_status: string | null;
          na_water_status: string | null;
          offer_transaction_type: Database["public"]["Enums"]["transaction_type"] | null;
          open_area_unit_code: string | null;
          open_area_value: number | null;
          permitted_industrial_use: string | null;
          place_id: string | null;
          place_name: string | null;
          planning_authority_name: string | null;
          planning_notes_public: string | null;
          possession_status: string | null;
          power_status: string | null;
          price_amount: number | null;
          price_max: number | null;
          price_min: number | null;
          price_mode: Database["public"]["Enums"]["price_mode"] | null;
          price_per_unit: number | null;
          price_unit_code: string | null;
          primary_irrigation_source: string | null;
          primary_transaction_type: Database["public"]["Enums"]["transaction_type"] | null;
          property_code: string | null;
          public_accuracy_m: number | null;
          public_address: string | null;
          public_latitude: number | null;
          public_longitude: number | null;
          public_slug: string | null;
          published_at: string | null;
          sanctioned_load_kw: number | null;
          seo_description: string | null;
          seo_title: string | null;
          shed_area_unit_code: string | null;
          shed_area_value: number | null;
          short_description: string | null;
          subdistrict_id: string | null;
          subdistrict_name: string | null;
          topography: string | null;
          tp_plot_number: string | null;
          tp_plot_type: string | null;
          tp_scheme_number: string | null;
          transfer_status: string | null;
          transformer_status: string | null;
          truck_loading_access: string | null;
          use_classification: string | null;
          well_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "properties_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["district_id"];
          },
          {
            foreignKeyName: "properties_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "localities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["locality_id"];
          },
          {
            foreignKeyName: "properties_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["place_id"];
          },
          {
            foreignKeyName: "properties_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["subdistrict_id"];
          },
          {
            foreignKeyName: "properties_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "subdistricts";
            referencedColumns: ["id"];
          },
        ];
      };
      public_property_indexability: {
        Row: {
          availability_status: Database["public"]["Enums"]["property_availability_status"] | null;
          canonical_path: string | null;
          id: string | null;
          property_code: string | null;
          public_slug: string | null;
          published_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          availability_status?: Database["public"]["Enums"]["property_availability_status"] | null;
          canonical_path?: never;
          id?: string | null;
          property_code?: string | null;
          public_slug?: string | null;
          published_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          availability_status?: Database["public"]["Enums"]["property_availability_status"] | null;
          canonical_path?: never;
          id?: string | null;
          property_code?: string | null;
          public_slug?: string | null;
          published_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      public_property_listings: {
        Row: {
          availability_status: Database["public"]["Enums"]["property_availability_status"] | null;
          cover_alt_text: string | null;
          cover_height_px: number | null;
          cover_media_id: string | null;
          cover_object_path: string | null;
          cover_width_px: number | null;
          currency_code: string | null;
          display_area_unit_code: string | null;
          display_area_unit_name: string | null;
          display_area_unit_symbol: string | null;
          display_area_value: number | null;
          district_id: string | null;
          district_name: string | null;
          featured: boolean | null;
          id: string | null;
          is_negotiable: boolean | null;
          land_category: Database["public"]["Enums"]["land_category"] | null;
          landmark_text: string | null;
          listing_title: string | null;
          locality_id: string | null;
          locality_name: string | null;
          location_visibility: Database["public"]["Enums"]["location_visibility"] | null;
          offer_transaction_type: Database["public"]["Enums"]["transaction_type"] | null;
          place_id: string | null;
          place_name: string | null;
          price_amount: number | null;
          price_max: number | null;
          price_min: number | null;
          price_mode: Database["public"]["Enums"]["price_mode"] | null;
          price_per_unit: number | null;
          price_unit_code: string | null;
          primary_transaction_type: Database["public"]["Enums"]["transaction_type"] | null;
          property_code: string | null;
          public_accuracy_m: number | null;
          public_address: string | null;
          public_latitude: number | null;
          public_longitude: number | null;
          public_slug: string | null;
          published_at: string | null;
          short_description: string | null;
          subdistrict_id: string | null;
          subdistrict_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "properties_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["district_id"];
          },
          {
            foreignKeyName: "properties_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "localities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["locality_id"];
          },
          {
            foreignKeyName: "properties_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["place_id"];
          },
          {
            foreignKeyName: "properties_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["subdistrict_id"];
          },
          {
            foreignKeyName: "properties_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "subdistricts";
            referencedColumns: ["id"];
          },
        ];
      };
      public_property_media: {
        Row: {
          alt_text: string | null;
          caption: string | null;
          duration_seconds: number | null;
          external_media_id: string | null;
          external_provider: string | null;
          external_url: string | null;
          height_px: number | null;
          id: string | null;
          is_cover: boolean | null;
          media_subtype: string | null;
          media_type: Database["public"]["Enums"]["media_type"] | null;
          mime_type: string | null;
          object_path: string | null;
          property_id: string | null;
          sort_order: number | null;
          width_px: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_assets_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
        ];
      };
      public_property_parcel_identifiers: {
        Row: {
          identifier_type: string | null;
          identifier_value: string | null;
          is_primary: boolean | null;
          property_id: string | null;
          sequence_no: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "property_parcels_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parcels_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parcels_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parcels_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_parcels_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
        ];
      };
      public_property_search: {
        Row: {
          agricultural_electricity_status: string | null;
          agricultural_irrigation_key: string | null;
          agricultural_road_touch: boolean | null;
          agricultural_road_width_m: number | null;
          agricultural_structure_present: boolean | null;
          agricultural_tenure_key: string | null;
          agricultural_tenure_type: string | null;
          agricultural_use_status: string | null;
          allotment_status: string | null;
          area_normalization_status:
            Database["public"]["Enums"]["area_normalization_status"] | null;
          availability_status: Database["public"]["Enums"]["property_availability_status"] | null;
          borewell_count: number | null;
          boundary_summary_public: string | null;
          canal_access_status: string | null;
          canonical_path: string | null;
          cetp_status: string | null;
          comparable_price_ceiling: number | null;
          comparable_price_floor: number | null;
          connectivity_summary: string | null;
          cover_alt_text: string | null;
          cover_height_px: number | null;
          cover_media_id: string | null;
          cover_object_path: string | null;
          cover_width_px: number | null;
          currency_code: string | null;
          current_cultivation_status: string | null;
          description: string | null;
          development_permission_status: string | null;
          development_plan_zone_name: string | null;
          display_area_unit_code: string | null;
          display_area_unit_name: string | null;
          display_area_unit_symbol: string | null;
          display_area_value: number | null;
          district_id: string | null;
          district_key: string | null;
          district_name: string | null;
          etp_status: string | null;
          existing_shed_present: boolean | null;
          featured: boolean | null;
          fencing_status: string | null;
          gas_status: string | null;
          gidc_estate_name: string | null;
          gidc_plot_number: string | null;
          gidc_shed_number: string | null;
          id: string | null;
          industrial_authority_name: string | null;
          industrial_drainage_status: string | null;
          industrial_power_key: string | null;
          industrial_road_width_m: number | null;
          industrial_subtype: string | null;
          industrial_tenure: string | null;
          industrial_type_key: string | null;
          industrial_water_status: string | null;
          irrigation_status: string | null;
          is_negotiable: boolean | null;
          land_category: Database["public"]["Enums"]["land_category"] | null;
          land_shape: string | null;
          landmark_text: string | null;
          layout_approval_status: string | null;
          listing_title: string | null;
          locality_id: string | null;
          locality_key: string | null;
          locality_name: string | null;
          location_visibility: Database["public"]["Enums"]["location_visibility"] | null;
          na_corner_plot: boolean | null;
          na_drainage_status: string | null;
          na_electricity_status: string | null;
          na_frontage_m: number | null;
          na_order_date: string | null;
          na_order_reference: string | null;
          na_purpose: string | null;
          na_purpose_key: string | null;
          na_road_width_m: number | null;
          na_status: string | null;
          na_status_key: string | null;
          na_water_status: string | null;
          normalized_area_sqm: number | null;
          offer_transaction_type: Database["public"]["Enums"]["transaction_type"] | null;
          open_area_unit_code: string | null;
          open_area_value: number | null;
          permitted_industrial_use: string | null;
          place_id: string | null;
          place_key: string | null;
          place_name: string | null;
          planning_authority_name: string | null;
          planning_notes_public: string | null;
          possession_status: string | null;
          power_status: string | null;
          price_amount: number | null;
          price_max: number | null;
          price_min: number | null;
          price_mode: Database["public"]["Enums"]["price_mode"] | null;
          price_per_unit: number | null;
          price_unit_code: string | null;
          primary_irrigation_source: string | null;
          primary_transaction_type: Database["public"]["Enums"]["transaction_type"] | null;
          property_code: string | null;
          public_accuracy_m: number | null;
          public_address: string | null;
          public_latitude: number | null;
          public_longitude: number | null;
          public_search_document: unknown;
          public_slug: string | null;
          published_at: string | null;
          sanctioned_load_kw: number | null;
          seo_description: string | null;
          seo_title: string | null;
          shed_area_unit_code: string | null;
          shed_area_value: number | null;
          short_description: string | null;
          subdistrict_id: string | null;
          subdistrict_name: string | null;
          taluka_key: string | null;
          topography: string | null;
          tp_plot_number: string | null;
          tp_plot_type: string | null;
          tp_scheme_number: string | null;
          transfer_status: string | null;
          transformer_status: string | null;
          truck_loading_access: string | null;
          use_classification: string | null;
          well_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "properties_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["district_id"];
          },
          {
            foreignKeyName: "properties_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "localities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["locality_id"];
          },
          {
            foreignKeyName: "properties_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "places";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["place_id"];
          },
          {
            foreignKeyName: "properties_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["subdistrict_id"];
          },
          {
            foreignKeyName: "properties_subdistrict_id_fkey";
            columns: ["subdistrict_id"];
            isOneToOne: false;
            referencedRelation: "subdistricts";
            referencedColumns: ["id"];
          },
        ];
      };
      public_property_search_filter_options: {
        Row: {
          facet_key: string | null;
          label: string | null;
          land_category: Database["public"]["Enums"]["land_category"] | null;
          result_count: number | null;
          value: string | null;
        };
        Relationships: [];
      };
      public_property_verification_summaries: {
        Row: {
          check_code: string | null;
          check_date: string | null;
          explanation: string | null;
          id: string | null;
          label: string | null;
          limitation: string | null;
          property_id: string | null;
          public_status: string | null;
          reviewed_at: string | null;
          scope: string | null;
          source_class: Database["public"]["Enums"]["verification_source_class"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "property_verifications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_verifications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_verifications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_indexability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_verifications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_verifications_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "public_property_search";
            referencedColumns: ["id"];
          },
        ];
      };
      public_seo_pages: {
        Row: {
          body_markdown: string | null;
          canonical_url: string | null;
          district_id: string | null;
          id: string | null;
          intro_text: string | null;
          land_category: Database["public"]["Enums"]["land_category"] | null;
          locality_id: string | null;
          page_type: string | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string | null;
          status: Database["public"]["Enums"]["seo_page_status"] | null;
          title: string | null;
          transaction_type: Database["public"]["Enums"]["transaction_type"] | null;
        };
        Insert: {
          body_markdown?: string | null;
          canonical_url?: string | null;
          district_id?: string | null;
          id?: string | null;
          intro_text?: string | null;
          land_category?: Database["public"]["Enums"]["land_category"] | null;
          locality_id?: string | null;
          page_type?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string | null;
          status?: Database["public"]["Enums"]["seo_page_status"] | null;
          title?: string | null;
          transaction_type?: Database["public"]["Enums"]["transaction_type"] | null;
        };
        Update: {
          body_markdown?: string | null;
          canonical_url?: string | null;
          district_id?: string | null;
          id?: string | null;
          intro_text?: string | null;
          land_category?: Database["public"]["Enums"]["land_category"] | null;
          locality_id?: string | null;
          page_type?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string | null;
          status?: Database["public"]["Enums"]["seo_page_status"] | null;
          title?: string | null;
          transaction_type?: Database["public"]["Enums"]["transaction_type"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "seo_pages_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "districts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_pages_district_id_fkey";
            columns: ["district_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["district_id"];
          },
          {
            foreignKeyName: "seo_pages_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "localities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seo_pages_locality_id_fkey";
            columns: ["locality_id"];
            isOneToOne: false;
            referencedRelation: "public_geography_options";
            referencedColumns: ["locality_id"];
          },
        ];
      };
      public_seo_redirects: {
        Row: {
          destination_path: string | null;
          source_path: string | null;
          status_code: number | null;
        };
        Insert: {
          destination_path?: string | null;
          source_path?: string | null;
          status_code?: number | null;
        };
        Update: {
          destination_path?: string | null;
          source_path?: string | null;
          status_code?: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      add_lead_activity: {
        Args: {
          requested_activity_type: Database["public"]["Enums"]["lead_activity_type"];
          requested_actor_id: string;
          requested_lead_id: string;
          requested_note?: string;
        };
        Returns: string;
      };
      add_owner_submission_note: {
        Args: {
          requested_actor_id: string;
          requested_expected_version: number;
          requested_note: string;
          requested_submission_id: string;
        };
        Returns: number;
      };
      add_site_visit_note: {
        Args: {
          requested_actor_id: string;
          requested_expected_version: number;
          requested_note: string;
          requested_visit_id: string;
        };
        Returns: number;
      };
      advance_verification_evidence: {
        Args: {
          requested_actor_id: string;
          requested_evidence_id: string;
          requested_professional_review_id?: string;
          requested_state: Database["public"]["Enums"]["evidence_provenance_state"];
        };
        Returns: undefined;
      };
      approve_property_media: {
        Args: {
          requested_actor_id: string;
          requested_media_id: string;
          requested_public_bucket?: string;
          requested_public_path?: string;
        };
        Returns: string;
      };
      archive_private_document: {
        Args: { requested_actor_id: string; requested_document_id: string };
        Returns: string;
      };
      archive_property_draft: {
        Args: {
          requested_actor_id: string;
          requested_expected_updated_at: string;
          requested_property_id: string;
        };
        Returns: string;
      };
      archive_property_media: {
        Args: { requested_actor_id: string; requested_media_id: string };
        Returns: string;
      };
      assign_owner_submission: {
        Args: {
          requested_actor_id: string;
          requested_assigned_to?: string;
          requested_expected_version: number;
          requested_submission_id: string;
        };
        Returns: number;
      };
      change_property_availability: {
        Args: {
          requested_actor_id: string;
          requested_expected_updated_at: string;
          requested_next_status: Database["public"]["Enums"]["property_availability_status"];
          requested_property_id: string;
        };
        Returns: string;
      };
      complete_lead_follow_up: {
        Args: {
          requested_actor_id: string;
          requested_follow_up_id: string;
          requested_outcome?: string;
        };
        Returns: undefined;
      };
      consume_public_intake_rate_limit: {
        Args: {
          requested_action: string;
          requested_bucket_hash: string;
          requested_max_attempts: number;
          requested_window_seconds: number;
        };
        Returns: boolean;
      };
      convert_owner_submission_to_property: {
        Args: {
          requested_actor_id: string;
          requested_expected_version: number;
          requested_payload: Json;
          requested_submission_id: string;
        };
        Returns: {
          target_property_code: string;
          target_property_id: string;
        }[];
      };
      create_admin_lead: {
        Args: { requested_actor_id: string; requested_payload: Json };
        Returns: string;
      };
      create_verification_source_reference: {
        Args: { requested_actor_id: string; requested_payload: Json };
        Returns: string;
      };
      get_property_publication_readiness: {
        Args: { requested_actor_id: string; requested_property_id: string };
        Returns: Json;
      };
      get_storage_usage_bytes: { Args: never; Returns: number };
      initialize_property_verifications: {
        Args: { requested_actor_id: string; requested_property_id: string };
        Returns: number;
      };
      is_active_admin: { Args: never; Returns: boolean };
      link_verification_evidence: {
        Args: {
          requested_actor_id: string;
          requested_payload: Json;
          requested_verification_id: string;
        };
        Returns: string;
      };
      match_lead_property: {
        Args: {
          requested_actor_id: string;
          requested_lead_id: string;
          requested_notes?: string;
          requested_property_id: string;
          requested_status?: string;
        };
        Returns: string;
      };
      migrate_published_guide_slug: {
        Args: {
          requested_actor_id: string;
          requested_guide_id: string;
          requested_new_slug: string;
        };
        Returns: undefined;
      };
      next_lead_reference: { Args: never; Returns: string };
      next_owner_submission_reference: { Args: never; Returns: string };
      next_property_code: { Args: never; Returns: string };
      next_site_visit_reference: { Args: never; Returns: string };
      property_publication_readiness: {
        Args: { requested_property_id: string };
        Returns: Json;
      };
      publish_property: {
        Args: {
          requested_actor_id: string;
          requested_expected_updated_at: string;
          requested_property_id: string;
        };
        Returns: Json;
      };
      record_notification_delivery_result: {
        Args: {
          requested_delivery_id: string;
          requested_error_code?: string;
          requested_status: string;
        };
        Returns: undefined;
      };
      record_owner_submission_notification_result: {
        Args: {
          requested_delivery_id: string;
          requested_error_code?: string;
          requested_status: string;
        };
        Returns: undefined;
      };
      record_private_document_access: {
        Args: {
          requested_actor_id: string;
          requested_document_id: string;
          requested_purpose: string;
        };
        Returns: string;
      };
      record_seo_redirect: {
        Args: {
          requested_actor_id: string;
          requested_destination_path: string;
          requested_entity_id?: string;
          requested_entity_type: string;
          requested_source_path: string;
        };
        Returns: string;
      };
      record_verification_exception: {
        Args: {
          requested_actor_id: string;
          requested_payload: Json;
          requested_verification_id: string;
        };
        Returns: string;
      };
      register_private_document: {
        Args: { requested_actor_id: string; requested_payload: Json };
        Returns: string;
      };
      register_lead_private_document: {
        Args: { requested_actor_id: string; requested_payload: Json };
        Returns: string;
      };
      register_property_media: {
        Args: { requested_actor_id: string; requested_payload: Json };
        Returns: string;
      };
      reorder_property_media: {
        Args: {
          requested_actor_id: string;
          requested_media_ids: string[];
          requested_property_id: string;
        };
        Returns: string;
      };
      request_professional_review: {
        Args: {
          requested_actor_id: string;
          requested_scope: string;
          requested_type: string;
          requested_verification_id: string;
        };
        Returns: string;
      };
      resolve_verification_exception: {
        Args: {
          requested_actor_id: string;
          requested_exception_id: string;
          requested_resolution: string;
          requested_status: Database["public"]["Enums"]["verification_exception_status"];
        };
        Returns: undefined;
      };
      restore_property_draft: {
        Args: {
          requested_actor_id: string;
          requested_expected_updated_at: string;
          requested_property_id: string;
        };
        Returns: string;
      };
      restore_property_media: {
        Args: { requested_actor_id: string; requested_media_id: string };
        Returns: string;
      };
      retire_verification_evidence: {
        Args: {
          requested_actor_id: string;
          requested_evidence_id: string;
          requested_reason?: string;
          requested_replacement_id?: string;
          requested_state: Database["public"]["Enums"]["evidence_provenance_state"];
        };
        Returns: undefined;
      };
      save_lead_requirement: {
        Args: {
          requested_actor_id: string;
          requested_lead_id: string;
          requested_payload: Json;
        };
        Returns: string;
      };
      save_property_draft: {
        Args: {
          requested_actor_id?: string;
          requested_expected_updated_at?: string;
          requested_payload?: Json;
          requested_property_id?: string;
        };
        Returns: string;
      };
      schedule_lead_follow_up: {
        Args: {
          requested_actor_id: string;
          requested_context?: string;
          requested_due_at: string;
          requested_lead_id: string;
          requested_note?: string;
          requested_type: string;
        };
        Returns: string;
      };
      schedule_site_visit_follow_up: {
        Args: {
          requested_actor_id: string;
          requested_context?: string;
          requested_due_at: string;
          requested_expected_version: number;
          requested_note?: string;
          requested_type: string;
          requested_visit_id: string;
        };
        Returns: string;
      };
      search_public_properties: {
        Args: {
          requested_agricultural_irrigation?: string;
          requested_agricultural_tenure?: string;
          requested_availability?: Database["public"]["Enums"]["property_availability_status"];
          requested_category?: Database["public"]["Enums"]["land_category"];
          requested_district?: string;
          requested_industrial_power?: string;
          requested_industrial_type?: string;
          requested_keyword?: string;
          requested_locality?: string;
          requested_maximum_area_sqm?: number;
          requested_maximum_price?: number;
          requested_minimum_area_sqm?: number;
          requested_minimum_price?: number;
          requested_na_purpose?: string;
          requested_na_status?: string;
          requested_page?: number;
          requested_page_size?: number;
          requested_place?: string;
          requested_pricing?: string;
          requested_property_code?: string;
          requested_sort?: string;
          requested_taluka?: string;
          requested_transaction?: Database["public"]["Enums"]["transaction_type"];
        };
        Returns: {
          availability_status: Database["public"]["Enums"]["property_availability_status"];
          cover_alt_text: string;
          cover_height_px: number;
          cover_media_id: string;
          cover_object_path: string;
          cover_width_px: number;
          currency_code: string;
          display_area_unit_code: string;
          display_area_unit_name: string;
          display_area_unit_symbol: string;
          display_area_value: number;
          district_id: string;
          district_name: string;
          featured: boolean;
          id: string;
          is_negotiable: boolean;
          land_category: Database["public"]["Enums"]["land_category"];
          landmark_text: string;
          listing_title: string;
          locality_id: string;
          locality_name: string;
          location_visibility: Database["public"]["Enums"]["location_visibility"];
          offer_transaction_type: Database["public"]["Enums"]["transaction_type"];
          place_id: string;
          place_name: string;
          price_amount: number;
          price_max: number;
          price_min: number;
          price_mode: Database["public"]["Enums"]["price_mode"];
          price_per_unit: number;
          price_unit_code: string;
          primary_transaction_type: Database["public"]["Enums"]["transaction_type"];
          property_code: string;
          public_accuracy_m: number;
          public_address: string;
          public_latitude: number;
          public_longitude: number;
          public_slug: string;
          published_at: string;
          short_description: string;
          subdistrict_id: string;
          subdistrict_name: string;
          total_count: number;
        }[];
      };
      set_property_cover: {
        Args: {
          requested_actor_id: string;
          requested_media_id: string;
          requested_property_id: string;
        };
        Returns: string;
      };
      set_verification_applicability: {
        Args: {
          requested_actor_id: string;
          requested_applicability: Database["public"]["Enums"]["verification_applicability"];
          requested_reason: string;
          requested_verification_id: string;
        };
        Returns: undefined;
      };
      set_verification_public_disclosure: {
        Args: {
          requested_actor_id: string;
          requested_policy_id: string;
          requested_verification_id: string;
          requested_visible: boolean;
        };
        Returns: undefined;
      };
      submit_owner_land_submission: {
        Args: {
          requested_documents?: Json;
          requested_idempotency_key_hash: string;
          requested_payload: Json;
          requested_submission_id: string;
        };
        Returns: {
          replayed: boolean;
          target_notification_id: string;
          target_submission_id: string;
          target_submission_reference: string;
        }[];
      };
      submit_public_crm_intake: {
        Args: {
          requested_action: string;
          requested_idempotency_key_hash: string;
          requested_payload: Json;
        };
        Returns: {
          replayed: boolean;
          target_lead_id: string;
          target_notification_id: string;
          target_property_id: string;
        }[];
      };
      transition_lead_status: {
        Args: {
          requested_actor_id: string;
          requested_lead_id: string;
          requested_next_status: Database["public"]["Enums"]["lead_status"];
          requested_reason?: string;
        };
        Returns: undefined;
      };
      transition_owner_submission: {
        Args: {
          requested_actor_id: string;
          requested_expected_version: number;
          requested_next_action_at?: string;
          requested_next_status: Database["public"]["Enums"]["owner_submission_status"];
          requested_note?: string;
          requested_submission_id: string;
        };
        Returns: number;
      };
      transition_property_verification: {
        Args: {
          requested_actor_id: string;
          requested_payload?: Json;
          requested_target: Database["public"]["Enums"]["verification_status"];
          requested_verification_id: string;
        };
        Returns: undefined;
      };
      transition_site_visit: {
        Args: {
          requested_actor_id: string;
          requested_expected_version: number;
          requested_next_status: Database["public"]["Enums"]["site_visit_status"];
          requested_payload?: Json;
          requested_visit_id: string;
        };
        Returns: number;
      };
      unmatch_lead_property: {
        Args: {
          requested_actor_id: string;
          requested_lead_id: string;
          requested_property_id: string;
          requested_reason?: string;
        };
        Returns: undefined;
      };
      unpublish_property: {
        Args: {
          requested_actor_id: string;
          requested_expected_updated_at: string;
          requested_property_id: string;
          requested_reason: string;
        };
        Returns: string;
      };
      update_admin_lead: {
        Args: {
          requested_actor_id: string;
          requested_lead_id: string;
          requested_payload: Json;
        };
        Returns: undefined;
      };
      update_professional_review: {
        Args: {
          requested_actor_id: string;
          requested_payload?: Json;
          requested_review_id: string;
          requested_target: Database["public"]["Enums"]["professional_review_status"];
        };
        Returns: undefined;
      };
      update_property_media_metadata: {
        Args: {
          requested_actor_id: string;
          requested_alt_text: string;
          requested_caption: string;
          requested_media_id: string;
        };
        Returns: string;
      };
      verification_provenance_rank: {
        Args: {
          value: Database["public"]["Enums"]["evidence_provenance_state"];
        };
        Returns: number;
      };
      write_audit_log: {
        Args: {
          requested_action: Database["public"]["Enums"]["audit_action"];
          requested_after_state?: Json;
          requested_before_state?: Json;
          requested_changed_fields?: string[];
          requested_entity_id?: string;
          requested_entity_type: string;
          requested_reason?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      area_normalization_status: "AUTHORITATIVE" | "SOURCE_DECLARED" | "PROVISIONAL" | "UNKNOWN";
      attribute_value_type:
        | "TEXT"
        | "LONG_TEXT"
        | "INTEGER"
        | "DECIMAL"
        | "BOOLEAN"
        | "DATE"
        | "TIMESTAMP"
        | "SINGLE_OPTION"
        | "MULTI_OPTION";
      audit_action:
        | "CREATE"
        | "UPDATE"
        | "PUBLISH"
        | "UNPUBLISH"
        | "ARCHIVE"
        | "RESTORE"
        | "DELETE"
        | "LOGIN"
        | "LOGOUT"
        | "EXPORT"
        | "DOCUMENT_ACCESS"
        | "VERIFICATION_CHANGE"
        | "STATUS_CHANGE"
        | "EXACT_LOCATION_ACCESS";
      buyer_type:
        | "INDIVIDUAL"
        | "INVESTOR"
        | "FARMER"
        | "DEVELOPER"
        | "BUILDER"
        | "INDUSTRIAL_BUSINESS"
        | "LOGISTICS_OPERATOR"
        | "NRI"
        | "BROKER"
        | "OTHER";
      document_scan_status: "PENDING" | "CLEAN" | "INFECTED" | "FAILED";
      evidence_provenance_state:
        | "RECEIVED"
        | "REVIEWED"
        | "SOURCE_VERIFIED"
        | "PROFESSIONALLY_REVIEWED"
        | "SUPERSEDED"
        | "REVOKED";
      guide_status: "DRAFT" | "REVIEW" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
      land_category: "AGRICULTURAL" | "NA" | "INDUSTRIAL";
      lead_activity_type:
        | "LEAD_CREATED"
        | "CONTACT_ATTEMPTED"
        | "CONTACTED"
        | "NOTE_ADDED"
        | "WHATSAPP_CLICK"
        | "CALL_CLICK"
        | "REQUIREMENT_UPDATED"
        | "PROPERTY_MATCHED"
        | "SITE_VISIT_REQUESTED"
        | "SITE_VISIT_CONFIRMED"
        | "SITE_VISIT_COMPLETED"
        | "OFFER_RECEIVED"
        | "FOLLOW_UP_SCHEDULED"
        | "STATUS_CHANGED"
        | "DOCUMENT_REQUESTED"
        | "OTHER"
        | "EMAIL_INTERACTION"
        | "FOLLOW_UP_COMPLETED"
        | "PROPERTY_REJECTED"
        | "PROPERTY_UNMATCHED"
        | "CLOSED_WON"
        | "CLOSED_LOST"
        | "PROPERTY_INQUIRY_RECEIVED"
        | "GENERAL_CONTACT_RECEIVED";
      lead_inquiry_type:
        | "PROPERTY_INQUIRY"
        | "PRICE_INQUIRY"
        | "WHATSAPP_CLICK"
        | "CALL_CLICK"
        | "BUYER_REQUIREMENT"
        | "SITE_VISIT_REQUEST"
        | "GENERAL_CONTACT"
        | "SELLER_LEAD";
      lead_status:
        | "NEW"
        | "CONTACT_ATTEMPTED"
        | "QUALIFIED"
        | "REQUIREMENT_CONFIRMED"
        | "PROPERTY_MATCHED"
        | "SITE_VISIT_REQUESTED"
        | "SITE_VISIT_CONFIRMED"
        | "SITE_VISIT_COMPLETED"
        | "NEGOTIATION"
        | "NURTURE"
        | "CLOSED_WON"
        | "CLOSED_LOST";
      location_visibility: "EXACT" | "APPROXIMATE" | "HIDDEN";
      media_processing_status: "READY" | "APPROVED" | "FAILED";
      media_type:
        | "IMAGE"
        | "VIDEO"
        | "PANORAMA_360"
        | "BROCHURE"
        | "DOCUMENT_PREVIEW"
        | "MAP_IMAGE"
        | "OTHER";
      owner_submission_status:
        | "NEW"
        | "CONTACTED"
        | "DOCS_REQUESTED"
        | "UNDER_REVIEW"
        | "VERIFICATION_PENDING"
        | "APPROVED"
        | "REJECTED"
        | "ON_HOLD"
        | "CONVERTED"
        | "CLOSED";
      party_type:
        "INDIVIDUAL" | "COMPANY" | "PARTNERSHIP" | "TRUST" | "SOCIETY" | "GOVERNMENT" | "OTHER";
      price_mode: "PRICE_ON_REQUEST" | "EXACT_TOTAL" | "PRICE_RANGE" | "PER_UNIT";
      professional_review_status:
        | "NOT_REQUIRED"
        | "REQUESTED"
        | "MATERIALS_PENDING"
        | "IN_REVIEW"
        | "COMPLETED"
        | "PARTIALLY_COMPLETED"
        | "REQUIRES_MORE_INFORMATION"
        | "SUPERSEDED"
        | "REQUIRES_REVIEW";
      property_availability_status:
        "AVAILABLE" | "UNDER_NEGOTIATION" | "SOLD" | "RENTED" | "LEASED" | "OFF_MARKET";
      property_party_role:
        | "OWNER"
        | "CO_OWNER"
        | "AUTHORIZED_REPRESENTATIVE"
        | "BROKER"
        | "INTERMEDIARY"
        | "DEVELOPER"
        | "INSTITUTIONAL_OWNER"
        | "OTHER";
      property_publication_status:
        "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
      public_copy_approval_status: "DRAFT" | "APPROVED" | "RETIRED";
      record_visibility: "PUBLIC" | "ADMIN_ONLY" | "PRIVATE";
      risk_level: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      seo_page_status: "DRAFT" | "REVIEW" | "PUBLISHED" | "NOINDEX" | "ARCHIVED";
      setting_value_type: "TEXT" | "INTEGER" | "DECIMAL" | "BOOLEAN" | "URL" | "JSON";
      site_visit_status:
        | "REQUESTED"
        | "CONTACTED"
        | "PROPOSED"
        | "CONFIRMED"
        | "COMPLETED"
        | "CANCELLED"
        | "NO_SHOW"
        | "RESCHEDULED";
      transaction_type: "BUY" | "RENT" | "LEASE";
      verification_applicability: "UNDETERMINED" | "APPLICABLE" | "NOT_APPLICABLE";
      verification_exception_status: "OPEN" | "RESOLVED" | "ACCEPTED_LIMITATION";
      verification_source_class:
        | "LEGAL_OFFICIAL_REQUIREMENT"
        | "OFFICIAL_ADMINISTRATIVE_PRACTICE"
        | "PROFESSIONAL_DUE_DILIGENCE"
        | "URBANEDGE_OPERATIONAL_POLICY";
      verification_status:
        | "NOT_STARTED"
        | "IN_REVIEW"
        | "PASSED"
        | "PASSED_WITH_NOTE"
        | "FAILED"
        | "REQUIRES_REVIEW"
        | "EXPIRED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      area_normalization_status: ["AUTHORITATIVE", "SOURCE_DECLARED", "PROVISIONAL", "UNKNOWN"],
      attribute_value_type: [
        "TEXT",
        "LONG_TEXT",
        "INTEGER",
        "DECIMAL",
        "BOOLEAN",
        "DATE",
        "TIMESTAMP",
        "SINGLE_OPTION",
        "MULTI_OPTION",
      ],
      audit_action: [
        "CREATE",
        "UPDATE",
        "PUBLISH",
        "UNPUBLISH",
        "ARCHIVE",
        "RESTORE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "EXPORT",
        "DOCUMENT_ACCESS",
        "VERIFICATION_CHANGE",
        "STATUS_CHANGE",
        "EXACT_LOCATION_ACCESS",
      ],
      buyer_type: [
        "INDIVIDUAL",
        "INVESTOR",
        "FARMER",
        "DEVELOPER",
        "BUILDER",
        "INDUSTRIAL_BUSINESS",
        "LOGISTICS_OPERATOR",
        "NRI",
        "BROKER",
        "OTHER",
      ],
      document_scan_status: ["PENDING", "CLEAN", "INFECTED", "FAILED"],
      evidence_provenance_state: [
        "RECEIVED",
        "REVIEWED",
        "SOURCE_VERIFIED",
        "PROFESSIONALLY_REVIEWED",
        "SUPERSEDED",
        "REVOKED",
      ],
      guide_status: ["DRAFT", "REVIEW", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"],
      land_category: ["AGRICULTURAL", "NA", "INDUSTRIAL"],
      lead_activity_type: [
        "LEAD_CREATED",
        "CONTACT_ATTEMPTED",
        "CONTACTED",
        "NOTE_ADDED",
        "WHATSAPP_CLICK",
        "CALL_CLICK",
        "REQUIREMENT_UPDATED",
        "PROPERTY_MATCHED",
        "SITE_VISIT_REQUESTED",
        "SITE_VISIT_CONFIRMED",
        "SITE_VISIT_COMPLETED",
        "OFFER_RECEIVED",
        "FOLLOW_UP_SCHEDULED",
        "STATUS_CHANGED",
        "DOCUMENT_REQUESTED",
        "OTHER",
        "EMAIL_INTERACTION",
        "FOLLOW_UP_COMPLETED",
        "PROPERTY_REJECTED",
        "PROPERTY_UNMATCHED",
        "CLOSED_WON",
        "CLOSED_LOST",
        "PROPERTY_INQUIRY_RECEIVED",
        "GENERAL_CONTACT_RECEIVED",
      ],
      lead_inquiry_type: [
        "PROPERTY_INQUIRY",
        "PRICE_INQUIRY",
        "WHATSAPP_CLICK",
        "CALL_CLICK",
        "BUYER_REQUIREMENT",
        "SITE_VISIT_REQUEST",
        "GENERAL_CONTACT",
        "SELLER_LEAD",
      ],
      lead_status: [
        "NEW",
        "CONTACT_ATTEMPTED",
        "QUALIFIED",
        "REQUIREMENT_CONFIRMED",
        "PROPERTY_MATCHED",
        "SITE_VISIT_REQUESTED",
        "SITE_VISIT_CONFIRMED",
        "SITE_VISIT_COMPLETED",
        "NEGOTIATION",
        "NURTURE",
        "CLOSED_WON",
        "CLOSED_LOST",
      ],
      location_visibility: ["EXACT", "APPROXIMATE", "HIDDEN"],
      media_processing_status: ["READY", "APPROVED", "FAILED"],
      media_type: [
        "IMAGE",
        "VIDEO",
        "PANORAMA_360",
        "BROCHURE",
        "DOCUMENT_PREVIEW",
        "MAP_IMAGE",
        "OTHER",
      ],
      owner_submission_status: [
        "NEW",
        "CONTACTED",
        "DOCS_REQUESTED",
        "UNDER_REVIEW",
        "VERIFICATION_PENDING",
        "APPROVED",
        "REJECTED",
        "ON_HOLD",
        "CONVERTED",
        "CLOSED",
      ],
      party_type: [
        "INDIVIDUAL",
        "COMPANY",
        "PARTNERSHIP",
        "TRUST",
        "SOCIETY",
        "GOVERNMENT",
        "OTHER",
      ],
      price_mode: ["PRICE_ON_REQUEST", "EXACT_TOTAL", "PRICE_RANGE", "PER_UNIT"],
      professional_review_status: [
        "NOT_REQUIRED",
        "REQUESTED",
        "MATERIALS_PENDING",
        "IN_REVIEW",
        "COMPLETED",
        "PARTIALLY_COMPLETED",
        "REQUIRES_MORE_INFORMATION",
        "SUPERSEDED",
        "REQUIRES_REVIEW",
      ],
      property_availability_status: [
        "AVAILABLE",
        "UNDER_NEGOTIATION",
        "SOLD",
        "RENTED",
        "LEASED",
        "OFF_MARKET",
      ],
      property_party_role: [
        "OWNER",
        "CO_OWNER",
        "AUTHORIZED_REPRESENTATIVE",
        "BROKER",
        "INTERMEDIARY",
        "DEVELOPER",
        "INSTITUTIONAL_OWNER",
        "OTHER",
      ],
      property_publication_status: [
        "DRAFT",
        "UNDER_REVIEW",
        "PUBLISHED",
        "UNPUBLISHED",
        "ARCHIVED",
      ],
      public_copy_approval_status: ["DRAFT", "APPROVED", "RETIRED"],
      record_visibility: ["PUBLIC", "ADMIN_ONLY", "PRIVATE"],
      risk_level: ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
      seo_page_status: ["DRAFT", "REVIEW", "PUBLISHED", "NOINDEX", "ARCHIVED"],
      setting_value_type: ["TEXT", "INTEGER", "DECIMAL", "BOOLEAN", "URL", "JSON"],
      site_visit_status: [
        "REQUESTED",
        "CONTACTED",
        "PROPOSED",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
        "RESCHEDULED",
      ],
      transaction_type: ["BUY", "RENT", "LEASE"],
      verification_applicability: ["UNDETERMINED", "APPLICABLE", "NOT_APPLICABLE"],
      verification_exception_status: ["OPEN", "RESOLVED", "ACCEPTED_LIMITATION"],
      verification_source_class: [
        "LEGAL_OFFICIAL_REQUIREMENT",
        "OFFICIAL_ADMINISTRATIVE_PRACTICE",
        "PROFESSIONAL_DUE_DILIGENCE",
        "URBANEDGE_OPERATIONAL_POLICY",
      ],
      verification_status: [
        "NOT_STARTED",
        "IN_REVIEW",
        "PASSED",
        "PASSED_WITH_NOTE",
        "FAILED",
        "REQUIRES_REVIEW",
        "EXPIRED",
      ],
    },
  },
} as const;
