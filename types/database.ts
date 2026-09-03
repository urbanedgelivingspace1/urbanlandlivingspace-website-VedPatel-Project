export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type LandCategory = "AGRICULTURAL" | "NA" | "INDUSTRIAL";
export type TransactionType = "BUY" | "RENT" | "LEASE";
export type LocationVisibility = "EXACT" | "APPROXIMATE" | "HIDDEN";
export type AvailabilityStatus =
  "AVAILABLE" | "UNDER_NEGOTIATION" | "SOLD" | "RENTED" | "LEASED" | "OFF_MARKET";
export type PriceMode = "PRICE_ON_REQUEST" | "EXACT_TOTAL" | "PRICE_RANGE" | "PER_UNIT";
export type VerificationStatus = "PASSED" | "PASSED_WITH_NOTE";
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
  }>;

export type PublicMediaRow = Readonly<{
  id: string;
  property_id: string;
  media_type:
    "IMAGE" | "VIDEO" | "PANORAMA_360" | "BROCHURE" | "DOCUMENT_PREVIEW" | "MAP_IMAGE" | "OTHER";
  object_path: string;
  mime_type: string;
  width_px: number | null;
  height_px: number | null;
  duration_seconds: number | null;
  alt_text: string | null;
  caption: string | null;
  is_cover: boolean;
  sort_order: number;
}>;

export type PublicVerificationSummaryRow = Readonly<{
  id: string;
  property_id: string;
  check_code: string;
  label: string | null;
  explanation: string | null;
  status: VerificationStatus;
  reviewed_at: string | null;
  recheck_at: string | null;
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
      public_property_media: View<PublicMediaRow>;
      public_property_verification_summaries: View<PublicVerificationSummaryRow>;
      public_geography_options: View<PublicGeographyOptionRow>;
      public_area_units: View<PublicAreaUnitRow>;
      public_app_settings: View<PublicAppSettingRow>;
    };
    Functions: {
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
