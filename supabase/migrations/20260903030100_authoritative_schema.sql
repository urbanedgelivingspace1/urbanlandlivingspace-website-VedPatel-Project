create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  display_name varchar(160) not null,
  role varchar(40) not null default 'ADMIN' check (role in ('SUPER_ADMIN','ADMIN','EDITOR','SALES','VERIFIER','CONTENT_EDITOR')),
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.source_references (
  id uuid primary key default gen_random_uuid(), authority_name varchar(180) not null,
  source_system varchar(120) not null, document_or_service_name varchar(240) not null,
  source_url text, reference_number varchar(160), accessed_at timestamptz, document_date date,
  last_known_update_date date, source_classification varchar(40) not null
    check (source_classification in ('LEGAL_OFFICIAL','ADMINISTRATIVE_PRACTICE','SECONDARY_COMMENTARY','OWNER_PROVIDED','URBANEDGE_OBSERVED')),
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.countries (
  id uuid primary key default gen_random_uuid(), iso_code char(2) not null unique,
  name varchar(100) not null unique, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.states (
  id uuid primary key default gen_random_uuid(), country_id uuid not null references public.countries(id) on delete restrict,
  code varchar(10) not null, name varchar(100) not null, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (country_id, code), unique (country_id, name)
);
create table public.districts (
  id uuid primary key default gen_random_uuid(), state_id uuid not null references public.states(id) on delete restrict,
  code varchar(30), name varchar(120) not null, is_service_area boolean not null default false,
  is_active boolean not null default true, source_reference_id uuid references public.source_references(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (state_id, name)
);
create table public.subdistricts (
  id uuid primary key default gen_random_uuid(), district_id uuid not null references public.districts(id) on delete restrict,
  code varchar(30), name varchar(120) not null, is_active boolean not null default true,
  source_reference_id uuid references public.source_references(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index subdistricts_district_name_uidx on public.subdistricts (district_id, lower(name));
create table public.places (
  id uuid primary key default gen_random_uuid(), subdistrict_id uuid not null references public.subdistricts(id) on delete restrict,
  place_type varchar(20) not null, official_name varchar(160) not null, postal_name varchar(160), pin_code varchar(6),
  is_active boolean not null default true, source_reference_id uuid references public.source_references(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (pin_code is null or pin_code ~ '^[0-9]{6}$')
);
create table public.localities (
  id uuid primary key default gen_random_uuid(), place_id uuid not null references public.places(id) on delete restrict,
  name varchar(160) not null, slug varchar(180) not null, is_active boolean not null default true,
  is_publicly_indexable boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index localities_place_name_uidx on public.localities (place_id, lower(name));
create unique index localities_slug_uidx on public.localities (lower(slug));
create table public.geography_aliases (
  id uuid primary key default gen_random_uuid(), entity_type varchar(30) not null, entity_id uuid not null,
  alias varchar(180) not null, language_code varchar(10) not null default 'en', is_searchable boolean not null default true,
  created_at timestamptz not null default now(), unique (entity_type, entity_id, alias, language_code)
);

create table public.area_units (
  id uuid primary key default gen_random_uuid(), code varchar(30) not null unique, display_name varchar(80) not null,
  symbol varchar(20), is_public_v1 boolean not null default false, is_metric boolean not null default false,
  is_local boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.area_conversion_rules (
  id uuid primary key default gen_random_uuid(), from_unit_id uuid not null references public.area_units(id) on delete restrict,
  to_unit_id uuid not null references public.area_units(id) on delete restrict, jurisdiction_id uuid, place_id uuid references public.places(id) on delete restrict,
  factor numeric(30,12), conversion_method varchar(40) not null, source_reference_id uuid references public.source_references(id) on delete restrict,
  effective_from date, effective_to date, is_authoritative boolean not null default false, created_at timestamptz not null default now(),
  check (from_unit_id <> to_unit_id), check (factor is null or factor > 0),
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

create table public.planning_authorities (
  id uuid primary key default gen_random_uuid(), state_id uuid not null references public.states(id) on delete restrict,
  name varchar(180) not null, short_name varchar(50), authority_type varchar(50) not null, is_active boolean not null default true,
  source_reference_id uuid references public.source_references(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (state_id, name)
);
create table public.development_plan_zones (
  id uuid primary key default gen_random_uuid(), planning_authority_id uuid not null references public.planning_authorities(id) on delete restrict,
  code varchar(80), name varchar(180) not null, use_classification varchar(120), source_reference_id uuid references public.source_references(id) on delete restrict,
  effective_from date, effective_to date, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);
create table public.tp_schemes (
  id uuid primary key default gen_random_uuid(), planning_authority_id uuid not null references public.planning_authorities(id) on delete restrict,
  scheme_number varchar(80) not null, name varchar(180), village_context varchar(180), status varchar(50),
  source_reference_id uuid references public.source_references(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (planning_authority_id, scheme_number)
);
create table public.tp_plots (
  id uuid primary key default gen_random_uuid(), tp_scheme_id uuid not null references public.tp_schemes(id) on delete restrict,
  plot_type varchar(10) not null check (plot_type in ('OP','FP')), plot_number varchar(80) not null,
  area_value numeric(18,4), area_unit_id uuid references public.area_units(id) on delete restrict,
  source_reference_id uuid references public.source_references(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check (area_value is null or area_value > 0)
);
create unique index tp_plots_identity_uidx on public.tp_plots (tp_scheme_id, plot_type, lower(plot_number));
create table public.gidc_estates (
  id uuid primary key default gen_random_uuid(), name varchar(180) not null, district_id uuid references public.districts(id) on delete restrict,
  place_id uuid references public.places(id) on delete restrict, authority_name varchar(180) not null,
  estate_type varchar(80), is_active boolean not null default true, source_reference_id uuid references public.source_references(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(), property_code varchar(13) not null default public.next_property_code(),
  public_slug varchar(220), land_category public.land_category not null, primary_transaction_type public.transaction_type not null,
  publication_status public.property_publication_status not null default 'DRAFT', availability_status public.property_availability_status not null default 'AVAILABLE',
  listing_title varchar(220), short_description text, description text,
  district_id uuid not null references public.districts(id) on delete restrict, subdistrict_id uuid references public.subdistricts(id) on delete restrict,
  place_id uuid references public.places(id) on delete restrict, locality_id uuid references public.localities(id) on delete restrict,
  landmark_text varchar(240), public_address text, display_area_value numeric(20,4) not null,
  display_area_unit_id uuid not null references public.area_units(id) on delete restrict, normalized_area_sqm numeric(20,4),
  area_normalization_status public.area_normalization_status not null default 'UNKNOWN',
  area_conversion_rule_id uuid references public.area_conversion_rules(id) on delete restrict,
  area_source_reference_id uuid references public.source_references(id) on delete restrict,
  featured boolean not null default false, location_visibility public.location_visibility not null default 'APPROXIMATE',
  seo_title varchar(220), seo_description varchar(320), canonical_path varchar(300), published_at timestamptz,
  published_by uuid references public.admin_profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  archived_at timestamptz, archived_by uuid references public.admin_profiles(user_id) on delete restrict,
  deleted_at timestamptz, deleted_by uuid references public.admin_profiles(user_id) on delete restrict,
  constraint properties_code_format check (property_code ~ '^UE-LS-[0-9]{6}$'), unique (property_code),
  check (display_area_value > 0), check (normalized_area_sqm is null or normalized_area_sqm > 0),
  check (area_normalization_status <> 'AUTHORITATIVE' or (normalized_area_sqm is not null and area_source_reference_id is not null)),
  check (publication_status <> 'PUBLISHED' or (public_slug is not null and listing_title is not null and published_at is not null)),
  check (archived_at is null or publication_status = 'ARCHIVED'), check (deleted_at is null or publication_status = 'ARCHIVED')
);
create unique index properties_public_slug_uidx on public.properties (lower(public_slug)) where public_slug is not null and deleted_at is null;
create trigger properties_property_code_immutable before update on public.properties for each row execute function public.prevent_column_change('property_code');

create table public.property_offers (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete restrict,
  transaction_type public.transaction_type not null, price_mode public.price_mode not null, currency_code char(3) not null default 'INR' check (currency_code = 'INR'),
  price_amount numeric(20,2), price_min numeric(20,2), price_max numeric(20,2), price_per_unit numeric(20,4),
  price_unit_id uuid references public.area_units(id) on delete restrict, is_negotiable boolean not null default false,
  security_deposit_amount numeric(20,2), term_min_months integer, term_max_months integer, payment_frequency varchar(30),
  commercial_terms text, is_primary boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz,
  check (price_amount is null or price_amount >= 0), check (price_min is null or price_min >= 0), check (price_max is null or price_max >= 0),
  check (price_per_unit is null or price_per_unit >= 0), check (security_deposit_amount is null or security_deposit_amount >= 0),
  check (term_min_months is null or term_min_months >= 0), check (term_max_months is null or term_max_months >= 0),
  check (term_max_months is null or term_min_months is null or term_max_months >= term_min_months),
  check ((price_mode = 'EXACT_TOTAL' and price_amount is not null and price_min is null and price_max is null and price_per_unit is null)
    or (price_mode = 'PRICE_RANGE' and price_min is not null and price_max is not null and price_min <= price_max and price_amount is null and price_per_unit is null)
    or (price_mode = 'PER_UNIT' and price_per_unit is not null and price_unit_id is not null and price_amount is null and price_min is null and price_max is null)
    or (price_mode = 'PRICE_ON_REQUEST' and price_amount is null and price_min is null and price_max is null and price_per_unit is null and price_unit_id is null))
);
create unique index property_offers_active_transaction_uidx on public.property_offers (property_id, transaction_type) where archived_at is null;
create unique index property_offers_active_primary_uidx on public.property_offers (property_id) where archived_at is null and is_primary;

create table public.property_parcels (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete restrict,
  sequence_no smallint not null check (sequence_no > 0), parcel_label varchar(80), display_area_value numeric(20,4),
  display_area_unit_id uuid references public.area_units(id) on delete restrict, normalized_area_sqm numeric(20,4),
  area_normalization_status public.area_normalization_status not null default 'UNKNOWN',
  area_source_reference_id uuid references public.source_references(id) on delete restrict, notes_internal text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz,
  unique (property_id, sequence_no), check (display_area_value is null or display_area_value > 0),
  check (normalized_area_sqm is null or normalized_area_sqm > 0)
);
create table public.parcel_identifiers (
  id uuid primary key default gen_random_uuid(), parcel_id uuid not null references public.property_parcels(id) on delete restrict,
  identifier_type varchar(50) not null check (identifier_type in ('SURVEY_NUMBER','HISSA_NUMBER','BLOCK_NUMBER','CITY_SURVEY_NUMBER','PROPERTY_CARD_NUMBER','VF7_REFERENCE','VF8A_REFERENCE','VF6_ENTRY_NUMBER','ULPIN','GIDC_PLOT_NUMBER','GIDC_SHED_NUMBER','OTHER')),
  identifier_value varchar(160) not null, normalized_value varchar(160) not null check (length(trim(normalized_value)) > 0),
  source_reference_id uuid references public.source_references(id) on delete restrict, is_primary boolean not null default false,
  public_visibility public.record_visibility not null default 'ADMIN_ONLY', valid_from date, valid_to date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);

create table public.property_locations (
  property_id uuid primary key references public.properties(id) on delete cascade,
  private_latitude numeric(9,6), private_longitude numeric(9,6), public_latitude numeric(9,6), public_longitude numeric(9,6),
  location_visibility public.location_visibility not null default 'APPROXIMATE', private_accuracy_m numeric(10,2), public_accuracy_m numeric(10,2),
  location_source_reference_id uuid references public.source_references(id) on delete restrict, location_notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((private_latitude is null) = (private_longitude is null)), check ((public_latitude is null) = (public_longitude is null)),
  check (private_latitude is null or private_latitude between -90 and 90), check (private_longitude is null or private_longitude between -180 and 180),
  check (public_latitude is null or public_latitude between -90 and 90), check (public_longitude is null or public_longitude between -180 and 180),
  check (private_accuracy_m is null or private_accuracy_m >= 0), check (public_accuracy_m is null or public_accuracy_m >= 0),
  check (location_visibility <> 'HIDDEN' or (public_latitude is null and public_longitude is null))
);
create table public.property_planning_context (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete restrict,
  planning_authority_id uuid references public.planning_authorities(id) on delete restrict,
  development_plan_zone_id uuid references public.development_plan_zones(id) on delete restrict,
  tp_scheme_id uuid references public.tp_schemes(id) on delete restrict, primary_tp_plot_id uuid references public.tp_plots(id) on delete restrict,
  reservation_status varchar(50), road_reservation_status varchar(50), planning_notes_public text, planning_notes_internal text,
  source_reference_id uuid references public.source_references(id) on delete restrict, checked_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz
);
create unique index property_planning_context_active_uidx on public.property_planning_context(property_id) where archived_at is null;

create table public.property_agricultural (
  property_id uuid primary key references public.properties(id) on delete cascade, tenure_type varchar(40), agricultural_use_status varchar(50),
  irrigation_status varchar(40), primary_irrigation_source varchar(40), borewell_count integer, well_count integer,
  canal_access_status varchar(40), electricity_status varchar(30), fencing_status varchar(30), topography varchar(40), land_shape varchar(40),
  structure_present boolean, built_structure_area numeric(20,4), built_structure_area_unit_id uuid references public.area_units(id) on delete restrict,
  road_touch boolean, road_width_m numeric(10,2), boundary_summary_public text, survey_mapni_status varchar(40),
  measurement_source_reference_id uuid references public.source_references(id) on delete restrict, current_cultivation_status varchar(50), tree_count_estimate integer,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  check (borewell_count is null or borewell_count >= 0), check (well_count is null or well_count >= 0),
  check (tree_count_estimate is null or tree_count_estimate >= 0), check (built_structure_area is null or built_structure_area > 0),
  check (road_width_m is null or road_width_m >= 0)
);
create table public.property_na (
  property_id uuid primary key references public.properties(id) on delete cascade, na_status varchar(40) not null, na_purpose varchar(160),
  na_order_reference varchar(160), na_order_date date, development_permission_status varchar(50), layout_approval_status varchar(50),
  road_width_m numeric(10,2), frontage_m numeric(10,2), corner_plot boolean, fsi numeric(8,3), far numeric(8,3),
  fsi_source_reference_id uuid references public.source_references(id) on delete restrict, layout_source_reference_id uuid references public.source_references(id) on delete restrict,
  water_status varchar(30), electricity_status varchar(30), drainage_status varchar(30), restriction_summary text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  check (road_width_m is null or road_width_m >= 0), check (frontage_m is null or frontage_m >= 0),
  check (fsi is null or fsi >= 0), check (far is null or far >= 0)
);
create table public.property_industrial (
  property_id uuid primary key references public.properties(id) on delete cascade, industrial_subtype varchar(100),
  gidc_estate_id uuid references public.gidc_estates(id) on delete restrict, industrial_authority_name varchar(180), industrial_tenure varchar(60),
  gidc_plot_number varchar(100), gidc_shed_number varchar(100), allotment_status varchar(60), possession_status varchar(60), transfer_status varchar(60),
  lease_start_date date, lease_end_date date, permitted_industrial_use text, existing_shed_present boolean,
  shed_area_value numeric(20,4), shed_area_unit_id uuid references public.area_units(id) on delete restrict,
  open_area_value numeric(20,4), open_area_unit_id uuid references public.area_units(id) on delete restrict,
  building_height_m numeric(8,2), crane_provision varchar(50), road_width_m numeric(10,2), truck_loading_access varchar(50),
  power_status varchar(50), sanctioned_load_kw numeric(12,2), transformer_status varchar(50), water_status varchar(50), drainage_status varchar(50),
  cetp_status varchar(50), etp_status varchar(50), gas_status varchar(50), environmental_approval_summary text, connectivity_summary text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  check (lease_end_date is null or lease_start_date is null or lease_end_date >= lease_start_date),
  check (shed_area_value is null or shed_area_value > 0), check (open_area_value is null or open_area_value > 0),
  check (building_height_m is null or building_height_m >= 0), check (road_width_m is null or road_width_m >= 0),
  check (sanctioned_load_kw is null or sanctioned_load_kw >= 0)
);

create table public.property_attribute_definitions (
  id uuid primary key default gen_random_uuid(), code varchar(100) not null unique, label varchar(180) not null, description text,
  land_category public.land_category, value_type public.attribute_value_type not null, unit_id uuid references public.area_units(id) on delete restrict,
  is_filterable boolean not null default false, is_searchable boolean not null default false, is_public boolean not null default false,
  is_required_for_publish boolean not null default false, is_active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  archived_at timestamptz
);
create table public.property_attribute_options (
  id uuid primary key default gen_random_uuid(), attribute_definition_id uuid not null references public.property_attribute_definitions(id) on delete restrict,
  code varchar(100) not null, label varchar(180) not null, sort_order integer not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), unique (attribute_definition_id, code)
);
create table public.property_attribute_values (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade,
  attribute_definition_id uuid not null references public.property_attribute_definitions(id) on delete restrict,
  text_value text, long_text_value text, integer_value bigint, decimal_value numeric(20,6), boolean_value boolean, date_value date,
  timestamp_value timestamptz, option_id uuid references public.property_attribute_options(id) on delete restrict, sort_key integer,
  source_reference_id uuid references public.source_references(id) on delete restrict,
  public_visibility public.record_visibility not null default 'ADMIN_ONLY', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.parties (
  id uuid primary key default gen_random_uuid(), party_type public.party_type not null, display_name varchar(180) not null,
  legal_name varchar(240), phone varchar(40), email varchar(320), alternate_phone varchar(40), consent_recorded_at timestamptz,
  consent_source varchar(80), notes_internal text, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  archived_at timestamptz
);
create table public.property_parties (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete restrict,
  party_id uuid not null references public.parties(id) on delete restrict, role public.property_party_role not null,
  ownership_share_percent numeric(7,4), is_primary boolean not null default false, authority_document_id uuid,
  start_date date, end_date date, notes_internal text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  archived_at timestamptz, check (ownership_share_percent is null or ownership_share_percent between 0 and 100),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create unique index property_parties_primary_owner_uidx on public.property_parties(property_id)
  where archived_at is null and is_primary and role in ('OWNER','CO_OWNER');
create table public.property_source_links (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete restrict,
  party_id uuid references public.parties(id) on delete restrict, source_type varchar(50) not null, source_name varchar(180),
  source_reference varchar(180), notes_internal text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(), property_id uuid references public.properties(id) on delete restrict,
  media_type public.media_type not null, storage_bucket varchar(100) not null, object_path text not null,
  mime_type varchar(120) not null, file_size_bytes bigint, width_px integer, height_px integer, duration_seconds numeric(12,3),
  alt_text text, caption text, visibility public.record_visibility not null default 'ADMIN_ONLY', is_cover boolean not null default false,
  sort_order integer not null default 0, source_type varchar(40), checksum_sha256 varchar(64),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  archived_at timestamptz, check (file_size_bytes is null or file_size_bytes >= 0), check (width_px is null or width_px > 0),
  check (height_px is null or height_px > 0), check (duration_seconds is null or duration_seconds >= 0),
  check (checksum_sha256 is null or checksum_sha256 ~ '^[0-9a-f]{64}$')
);
create unique index media_assets_active_cover_uidx on public.media_assets(property_id) where property_id is not null and archived_at is null and is_cover;

create table public.owner_submissions (
  id uuid primary key default gen_random_uuid(), submission_reference varchar(20) not null default public.next_owner_submission_reference() unique,
  party_id uuid not null references public.parties(id) on delete restrict, land_category public.land_category not null,
  primary_transaction_type public.transaction_type not null, district_id uuid references public.districts(id) on delete restrict,
  subdistrict_id uuid references public.subdistricts(id) on delete restrict, place_id uuid references public.places(id) on delete restrict,
  locality_text varchar(180), approximate_area_value numeric(20,4), approximate_area_unit_id uuid references public.area_units(id) on delete restrict,
  asking_price_text varchar(180), source_description text, status public.owner_submission_status not null default 'NEW',
  converted_property_id uuid unique references public.properties(id) on delete restrict, first_contacted_at timestamptz, next_action_at timestamptz,
  notes_internal text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  archived_at timestamptz, check (approximate_area_value is null or approximate_area_value > 0),
  check (status <> 'CONVERTED' or converted_property_id is not null),
  check (converted_property_id is null or status in ('CONVERTED','CLOSED'))
);
create table public.private_documents (
  id uuid primary key default gen_random_uuid(), property_id uuid references public.properties(id) on delete restrict,
  party_id uuid references public.parties(id) on delete restrict, owner_submission_id uuid references public.owner_submissions(id) on delete restrict,
  document_type varchar(80) not null, storage_bucket varchar(100) not null, object_path text not null, mime_type varchar(120) not null,
  file_size_bytes bigint, checksum_sha256 varchar(64), document_reference varchar(180), document_date date, issuer_name varchar(180),
  visibility public.record_visibility not null default 'PRIVATE', notes_internal text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  archived_at timestamptz, check (visibility <> 'PUBLIC'), check (file_size_bytes is null or file_size_bytes >= 0),
  check (checksum_sha256 is null or checksum_sha256 ~ '^[0-9a-f]{64}$'),
  check (property_id is not null or party_id is not null or owner_submission_id is not null)
);
alter table public.property_parties add constraint property_parties_authority_document_fk
  foreign key (authority_document_id) references public.private_documents(id) on delete restrict;

create table public.verification_check_definitions (
  id uuid primary key default gen_random_uuid(), code varchar(100) not null unique, name varchar(180) not null, description_internal text,
  category_scope public.land_category, applies_to_transaction public.transaction_type, default_required_for_publish boolean not null default false,
  lawyer_review_required_by_default boolean not null default false, surveyor_review_required_by_default boolean not null default false,
  public_label_default varchar(180), public_explanation_template text, recheck_days_default integer,
  risk_if_failed public.risk_level not null default 'NONE', is_active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (recheck_days_default is null or recheck_days_default > 0)
);
create table public.property_verifications (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete restrict,
  check_definition_id uuid not null references public.verification_check_definitions(id) on delete restrict,
  status public.verification_status not null default 'NOT_STARTED', risk_level public.risk_level not null default 'NONE',
  scope_statement text, public_label varchar(180), public_explanation text, public_visible boolean not null default false,
  reviewed_by uuid references public.admin_profiles(user_id) on delete restrict, reviewed_at timestamptz, recheck_at timestamptz,
  reviewer_notes_internal text, referral_required boolean not null default false, referral_type varchar(40),
  source_reference_id uuid references public.source_references(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (property_id, check_definition_id),
  check (referral_type is null or referral_type in ('LAWYER','SURVEYOR','PLANNER','ENGINEER','OTHER')),
  check (not referral_required or referral_type is not null), check (recheck_at is null or reviewed_at is null or recheck_at >= reviewed_at)
);
create table public.verification_evidence (
  id uuid primary key default gen_random_uuid(), property_verification_id uuid not null references public.property_verifications(id) on delete restrict,
  private_document_id uuid references public.private_documents(id) on delete restrict, source_reference_id uuid references public.source_references(id) on delete restrict,
  evidence_type varchar(60) not null, evidence_reference varchar(180), observed_date date, supports_check boolean not null default true,
  evidence_notes_internal text, created_at timestamptz not null default now(), created_by uuid references public.admin_profiles(user_id) on delete restrict,
  check (private_document_id is not null or source_reference_id is not null or evidence_notes_internal is not null)
);
create table public.owner_submission_documents (
  id uuid primary key default gen_random_uuid(), owner_submission_id uuid not null references public.owner_submissions(id) on delete restrict,
  private_document_id uuid not null references public.private_documents(id) on delete restrict, document_role varchar(80) not null,
  created_at timestamptz not null default now(), unique(owner_submission_id, private_document_id, document_role)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(), lead_reference varchar(20) not null default public.next_lead_reference() unique,
  party_id uuid not null references public.parties(id) on delete restrict, source_type varchar(50) not null, source_detail varchar(180),
  inquiry_type public.lead_inquiry_type not null, buyer_type public.buyer_type, preferred_transaction public.transaction_type,
  land_category public.land_category, budget_min numeric(20,2), budget_max numeric(20,2), budget_currency char(3),
  district_id uuid references public.districts(id) on delete restrict, subdistrict_id uuid references public.subdistricts(id) on delete restrict,
  place_id uuid references public.places(id) on delete restrict, locality_text varchar(180), intended_use varchar(240),
  status public.lead_status not null default 'NEW', next_follow_up_at timestamptz, last_contacted_at timestamptz,
  assigned_to uuid references public.admin_profiles(user_id) on delete restrict, notes_internal text, closed_at timestamptz, loss_reason varchar(120),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  archived_at timestamptz, check (budget_min is null or budget_min >= 0), check (budget_max is null or budget_max >= 0),
  check (budget_max is null or budget_min is null or budget_max >= budget_min), check (budget_currency is null or budget_currency = 'INR')
);
create table public.lead_requirements (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null unique references public.leads(id) on delete restrict,
  min_area_value numeric(20,4), max_area_value numeric(20,4), area_unit_id uuid references public.area_units(id) on delete restrict,
  normalized_min_area_sqm numeric(20,4), normalized_max_area_sqm numeric(20,4), preferred_road_width_m_min numeric(10,2),
  preferred_frontage_m_min numeric(10,2), preferred_use_text text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (min_area_value is null or min_area_value > 0), check (max_area_value is null or max_area_value > 0),
  check (max_area_value is null or min_area_value is null or max_area_value >= min_area_value),
  check (normalized_min_area_sqm is null or normalized_min_area_sqm > 0), check (normalized_max_area_sqm is null or normalized_max_area_sqm > 0),
  check (normalized_max_area_sqm is null or normalized_min_area_sqm is null or normalized_max_area_sqm >= normalized_min_area_sqm),
  check (preferred_road_width_m_min is null or preferred_road_width_m_min >= 0),
  check (preferred_frontage_m_min is null or preferred_frontage_m_min >= 0)
);
create table public.lead_properties (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict, match_status varchar(40), match_score numeric(6,3),
  matched_by uuid references public.admin_profiles(user_id) on delete restrict, matched_at timestamptz, notes_internal text,
  created_at timestamptz not null default now(), unique (lead_id, property_id), check (match_score is null or match_score between 0 and 100)
);
create table public.lead_activities (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id) on delete restrict,
  activity_type public.lead_activity_type not null, property_id uuid references public.properties(id) on delete restrict,
  actor_admin_id uuid references public.admin_profiles(user_id) on delete restrict, activity_at timestamptz not null default now(),
  note text, metadata_text text, created_at timestamptz not null default now()
);
create table public.site_visits (
  id uuid primary key default gen_random_uuid(), visit_reference varchar(20) not null default public.next_site_visit_reference() unique,
  lead_id uuid not null references public.leads(id) on delete restrict, property_id uuid not null references public.properties(id) on delete restrict,
  status public.site_visit_status not null default 'REQUESTED', requested_start_at timestamptz, requested_end_at timestamptz,
  proposed_start_at timestamptz, proposed_end_at timestamptz, confirmed_start_at timestamptz, confirmed_end_at timestamptz,
  contacted_at timestamptz, completed_at timestamptz, outcome varchar(80), notes_internal text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  archived_at timestamptz,
  check (requested_end_at is null or requested_start_at is null or requested_end_at > requested_start_at),
  check (proposed_end_at is null or proposed_start_at is null or proposed_end_at > proposed_start_at),
  check (confirmed_end_at is null or confirmed_start_at is null or confirmed_end_at > confirmed_start_at),
  check (status not in ('CONFIRMED','COMPLETED','NO_SHOW') or (confirmed_start_at is not null and confirmed_end_at is not null)),
  check (status <> 'COMPLETED' or completed_at is not null)
);

create table public.guide_categories (
  id uuid primary key default gen_random_uuid(), name varchar(120) not null, slug varchar(150) not null,
  description text, is_active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index guide_categories_slug_uidx on public.guide_categories(lower(slug));
create table public.guides (
  id uuid primary key default gen_random_uuid(), title varchar(240) not null, slug varchar(220) not null, excerpt text,
  body_markdown text not null, category_id uuid references public.guide_categories(id) on delete restrict,
  status public.guide_status not null default 'DRAFT', author_admin_id uuid references public.admin_profiles(user_id) on delete restrict,
  reviewed_at timestamptz, reviewed_by uuid references public.admin_profiles(user_id) on delete restrict,
  published_at timestamptz, published_by uuid references public.admin_profiles(user_id) on delete restrict,
  seo_title varchar(220), seo_description varchar(320), canonical_url varchar(500),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  archived_at timestamptz, check (status <> 'PUBLISHED' or published_at is not null)
);
create unique index guides_slug_uidx on public.guides(lower(slug)) where archived_at is null;
create table public.seo_pages (
  id uuid primary key default gen_random_uuid(), page_type varchar(50) not null, slug varchar(220) not null,
  district_id uuid references public.districts(id) on delete restrict, locality_id uuid references public.localities(id) on delete restrict,
  land_category public.land_category, transaction_type public.transaction_type, title varchar(240) not null,
  intro_text text, body_markdown text, status public.seo_page_status not null default 'DRAFT', seo_title varchar(220),
  seo_description varchar(320), canonical_url varchar(500), published_at timestamptz,
  published_by uuid references public.admin_profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict, updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  archived_at timestamptz, check (status <> 'PUBLISHED' or published_at is not null)
);
create unique index seo_pages_slug_uidx on public.seo_pages(lower(slug)) where archived_at is null;
create table public.app_settings (
  id uuid primary key default gen_random_uuid(), key varchar(160) not null unique, label varchar(180) not null, description text,
  value_type public.setting_value_type not null, text_value text, integer_value bigint, decimal_value numeric(20,6),
  boolean_value boolean, url_value text, json_value jsonb, is_public boolean not null default false,
  is_secret_reference boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  check (not (is_public and is_secret_reference))
);
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(), event_name varchar(120) not null, occurred_at timestamptz not null default now(),
  anonymous_id varchar(160), session_id varchar(160), page_path varchar(500), referrer_path varchar(500),
  property_id uuid references public.properties(id) on delete restrict, lead_id uuid references public.leads(id) on delete restrict,
  source_channel varchar(80), device_class varchar(30), country_code char(2), metadata jsonb,
  created_at timestamptz not null default now(), check (country_code is null or country_code ~ '^[A-Z]{2}$')
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(), actor_admin_id uuid references public.admin_profiles(user_id) on delete restrict,
  action public.audit_action not null, entity_type varchar(80) not null, entity_id uuid, occurred_at timestamptz not null default now(),
  ip_hash varchar(128), user_agent_hash varchar(128), changed_fields text[], before_state jsonb, after_state jsonb, reason text
);
