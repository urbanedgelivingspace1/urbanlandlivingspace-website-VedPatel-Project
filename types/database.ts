export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type LandCategory = "AGRICULTURAL" | "NA" | "INDUSTRIAL";
export type TransactionType = "BUY" | "RENT" | "LEASE";
export type LocationVisibility = "EXACT" | "APPROXIMATE" | "HIDDEN";
export type AvailabilityStatus =
  "AVAILABLE" | "UNDER_NEGOTIATION" | "SOLD" | "RENTED" | "LEASED" | "OFF_MARKET";
export type PriceMode = "PRICE_ON_REQUEST" | "EXACT_TOTAL" | "PRICE_RANGE" | "PER_UNIT";
export type PublicVerificationStatus = "COMPLETED" | "COMPLETED_WITH_NOTE";
export type AuditAction =
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
  | "EXACT_LOCATION_ACCESS"
  | "VERIFICATION_CHANGE"
  | "STATUS_CHANGE";

export type PublicPropertyListingRow = Readonly<{
  id: string;
  property_code: string;
  public_slug: string | null;
  land_category: LandCategory;
  primary_transaction_type: TransactionType;
  listing_title: string | null;
  short_description: string | null;
  availability_status: AvailabilityStatus;
  featured: boolean;
  published_at: string | null;
  district_id: string;
  district_name: string;
  subdistrict_id: string | null;
  subdistrict_name: string | null;
  place_id: string | null;
  place_name: string | null;
  locality_id: string | null;
  locality_name: string | null;
  landmark_text: string | null;
  public_address: string | null;
  display_area_value: number;
  display_area_unit_code: string;
  display_area_unit_name: string;
  display_area_unit_symbol: string | null;
  location_visibility: LocationVisibility;
  public_latitude: number | null;
  public_longitude: number | null;
  public_accuracy_m: number | null;
  offer_transaction_type: TransactionType | null;
  price_mode: PriceMode | null;
  currency_code: "INR" | null;
  price_amount: number | null;
  price_min: number | null;
  price_max: number | null;
  price_per_unit: number | null;
  price_unit_code: string | null;
  is_negotiable: boolean | null;
  cover_media_id: string | null;
  cover_object_path: string | null;
  cover_alt_text: string | null;
  cover_width_px: number | null;
  cover_height_px: number | null;
}>;

export type PublicPropertyDetailRow = PublicPropertyListingRow &
  Readonly<{
    description: string | null;
    seo_title: string | null;
    seo_description: string | null;
    canonical_path: string | null;
    agricultural_tenure_type: string | null;
    agricultural_use_status: string | null;
    irrigation_status: string | null;
    primary_irrigation_source: string | null;
    borewell_count: number | null;
    well_count: number | null;
    canal_access_status: string | null;
    agricultural_electricity_status: string | null;
    fencing_status: string | null;
    topography: string | null;
    land_shape: string | null;
    agricultural_structure_present: boolean | null;
    agricultural_road_touch: boolean | null;
    agricultural_road_width_m: number | null;
    boundary_summary_public: string | null;
    current_cultivation_status: string | null;
    na_status: string | null;
    na_purpose: string | null;
    na_order_reference: string | null;
    na_order_date: string | null;
    development_permission_status: string | null;
    layout_approval_status: string | null;
    na_road_width_m: number | null;
    na_frontage_m: number | null;
    na_corner_plot: boolean | null;
    na_water_status: string | null;
    na_electricity_status: string | null;
    na_drainage_status: string | null;
    industrial_subtype: string | null;
    industrial_authority_name: string | null;
    industrial_tenure: string | null;
    gidc_estate_name: string | null;
    gidc_plot_number: string | null;
    gidc_shed_number: string | null;
    allotment_status: string | null;
    possession_status: string | null;
    transfer_status: string | null;
    permitted_industrial_use: string | null;
    existing_shed_present: boolean | null;
    shed_area_value: number | null;
    shed_area_unit_code: string | null;
    open_area_value: number | null;
    open_area_unit_code: string | null;
    industrial_road_width_m: number | null;
    truck_loading_access: string | null;
    power_status: string | null;
    sanctioned_load_kw: number | null;
    transformer_status: string | null;
    industrial_water_status: string | null;
    industrial_drainage_status: string | null;
    cetp_status: string | null;
    etp_status: string | null;
    gas_status: string | null;
    connectivity_summary: string | null;
    planning_notes_public: string | null;
    planning_authority_name: string | null;
    development_plan_zone_name: string | null;
    use_classification: string | null;
    tp_scheme_number: string | null;
    tp_plot_type: string | null;
    tp_plot_number: string | null;
  }>;

export type PublicPropertyGoogleMapRow = Readonly<{
  property_id: string;
  google_maps_embed_url: string;
}>;

export type PublicParcelIdentifierRow = Readonly<{
  property_id: string;
  identifier_type: string;
  identifier_value: string;
  is_primary: boolean;
  sequence_no: number;
}>;

export type PublicMediaRow = Readonly<{
  id: string;
  property_id: string;
  media_type:
    "IMAGE" | "VIDEO" | "PANORAMA_360" | "BROCHURE" | "DOCUMENT_PREVIEW" | "MAP_IMAGE" | "OTHER";
  object_path: string | null;
  mime_type: string | null;
  width_px: number | null;
  height_px: number | null;
  duration_seconds: number | null;
  alt_text: string | null;
  caption: string | null;
  is_cover: boolean;
  sort_order: number;
  external_url: string | null;
  external_provider: string | null;
  external_media_id: string | null;
  media_subtype: string | null;
}>;

export type PublicVerificationSummaryRow = Readonly<{
  id: string;
  property_id: string;
  check_code: string;
  label: string | null;
  explanation: string | null;
  public_status: PublicVerificationStatus | null;
  reviewed_at: string | null;
  check_date: string | null;
  scope: string | null;
  limitation: string | null;
  source_class:
    | "LEGAL_OFFICIAL_REQUIREMENT"
    | "OFFICIAL_ADMINISTRATIVE_PRACTICE"
    | "PROFESSIONAL_DUE_DILIGENCE"
    | "URBANEDGE_OPERATIONAL_POLICY";
}>;

export type PublicPropertyIndexabilityRow = Readonly<{
  id: string;
  property_code: string;
  public_slug: string;
  canonical_path: string;
  availability_status: AvailabilityStatus;
  published_at: string;
  updated_at: string;
}>;

export type PublicGeographyOptionRow = Readonly<{
  district_id: string;
  district_name: string;
  subdistrict_id: string | null;
  subdistrict_name: string | null;
  place_id: string | null;
  place_name: string | null;
  locality_id: string | null;
  locality_name: string | null;
  locality_slug: string | null;
  locality_is_indexable: boolean;
}>;

export type PublicAreaUnitRow = Readonly<{
  id: string;
  code: string;
  display_name: string;
  symbol: string | null;
  is_metric: boolean;
  is_local: boolean;
}>;

export type PublicAppSettingRow = Readonly<{
  key: string;
  label: string;
  value_type: "TEXT" | "INTEGER" | "DECIMAL" | "BOOLEAN" | "URL" | "JSON";
  value: Json;
}>;

export type PublicSearchFacetRow = Readonly<{
  facet_key: string;
  land_category: LandCategory;
  value: string;
  label: string;
  result_count: number;
}>;

export type PublicPropertySearchRow = PublicPropertyListingRow & Readonly<{ total_count: number }>;

export type PublicGuideCategoryRow = Readonly<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}>;

export type PublicGuideRow = Readonly<{
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body_markdown: string;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  published_at: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  updated_at: string;
  hero_storage_bucket: string | null;
  hero_object_path: string | null;
  hero_alt_text: string | null;
  hero_width_px: number | null;
  hero_height_px: number | null;
}>;

export type PublicSeoPageRow = Readonly<{
  id: string;
  page_type: string;
  slug: string;
  district_id: string | null;
  locality_id: string | null;
  land_category: LandCategory | null;
  transaction_type: TransactionType | null;
  title: string;
  intro_text: string | null;
  body_markdown: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  published_at: string;
  status: "PUBLISHED" | "NOINDEX";
}>;

export type PublicSeoRedirectRow = Readonly<{
  source_path: string;
  destination_path: string;
  status_code: number;
}>;

type View<Row> = {
  Row: Row;
  Insert: never;
  Update: never;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          user_id: string;
          display_name: string;
          role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "SALES" | "VERIFIER" | "CONTENT_EDITOR";
          is_active: boolean;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      public_property_listings: View<PublicPropertyListingRow>;
      public_property_details: View<PublicPropertyDetailRow>;
      public_property_google_maps: View<PublicPropertyGoogleMapRow>;
      public_property_media: View<PublicMediaRow>;
      public_property_verification_summaries: View<PublicVerificationSummaryRow>;
      public_property_indexability: View<PublicPropertyIndexabilityRow>;
      public_property_parcel_identifiers: View<PublicParcelIdentifierRow>;
      public_geography_options: View<PublicGeographyOptionRow>;
      public_area_units: View<PublicAreaUnitRow>;
      public_app_settings: View<PublicAppSettingRow>;
      public_property_search_filter_options: View<PublicSearchFacetRow>;
      public_guide_categories: View<PublicGuideCategoryRow>;
      public_guides: View<PublicGuideRow>;
      public_seo_pages: View<PublicSeoPageRow>;
      public_seo_redirects: View<PublicSeoRedirectRow>;
    };
    Functions: {
      search_public_properties: {
        Args: {
          requested_keyword?: string | null;
          requested_property_code?: string | null;
          requested_category?: LandCategory | null;
          requested_transaction?: TransactionType | null;
          requested_district?: string | null;
          requested_taluka?: string | null;
          requested_place?: string | null;
          requested_locality?: string | null;
          requested_minimum_area_sqm?: number | null;
          requested_maximum_area_sqm?: number | null;
          requested_minimum_price?: number | null;
          requested_maximum_price?: number | null;
          requested_pricing?: string | null;
          requested_availability?: AvailabilityStatus | null;
          requested_agricultural_tenure?: string | null;
          requested_agricultural_irrigation?: string | null;
          requested_na_status?: string | null;
          requested_na_purpose?: string | null;
          requested_industrial_type?: string | null;
          requested_industrial_power?: string | null;
          requested_sort?: string;
          requested_page?: number;
          requested_page_size?: number;
        };
        Returns: PublicPropertySearchRow[];
      };
      write_audit_log: {
        Args: {
          requested_action: AuditAction;
          requested_entity_type: string;
          requested_entity_id?: string | null;
          requested_changed_fields?: string[] | null;
          requested_before_state?: Json;
          requested_after_state?: Json;
          requested_reason?: string | null;
        };
        Returns: string;
      };
    };
    Enums: {
      land_category: LandCategory;
      transaction_type: TransactionType;
      location_visibility: LocationVisibility;
      property_availability_status: AvailabilityStatus;
      price_mode: PriceMode;
    };
    CompositeTypes: Record<never, never>;
  };
};
