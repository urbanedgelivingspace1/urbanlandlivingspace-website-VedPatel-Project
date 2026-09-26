-- Remove prohibited legal claims wording blocker from publication gate
create or replace function public.property_publication_readiness(requested_property_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  property_row public.properties%rowtype;
  location_row public.property_locations%rowtype;
  offer_row public.property_offers%rowtype;
  agricultural_row public.property_agricultural%rowtype;
  na_row public.property_na%rowtype;
  industrial_row public.property_industrial%rowtype;
  blockers jsonb := '[]'::jsonb;
  warnings jsonb := '[]'::jsonb;
begin
  select * into property_row from public.properties
    where id = requested_property_id and deleted_at is null;
  if not found then raise exception 'Property not found'; end if;

  select * into location_row from public.property_locations where property_id = requested_property_id;
  select * into offer_row from public.property_offers
    where property_id = requested_property_id and archived_at is null and is_primary
    order by created_at, id limit 1;
  select * into agricultural_row from public.property_agricultural where property_id = requested_property_id;
  select * into na_row from public.property_na where property_id = requested_property_id;
  select * into industrial_row from public.property_industrial where property_id = requested_property_id;

  if property_row.publication_status = 'ARCHIVED' or property_row.archived_at is not null then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','IDENTITY','code','PROPERTY_ARCHIVED','message','Restore the archived property before publication review.'));
  elsif property_row.publication_status not in ('DRAFT','UNDER_REVIEW','UNPUBLISHED','PUBLISHED') then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','IDENTITY','code','INVALID_PUBLICATION_STATE','message','The current publication state cannot enter the publish workflow.'));
  end if;

  if property_row.property_code !~ '^UE-LS-[0-9]{6}$' then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','IDENTITY','code','INVALID_PROPERTY_CODE','message','The immutable Property ID is invalid.'));
  end if;

  if property_row.public_slug is null or property_row.public_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','IDENTITY','code','INVALID_PUBLIC_SLUG','message','Add a lowercase public slug containing only words, numbers, and hyphens.'));
  end if;

  if length(btrim(coalesce(property_row.listing_title,''))) < 5 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','MISSING_PUBLIC_TITLE','message','Add a specific public title of at least 5 characters.'));
  end if;

  if length(btrim(coalesce(property_row.short_description,''))) < 10 and length(btrim(coalesce(property_row.description,''))) < 20 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','MISSING_PUBLIC_DESCRIPTION','message','Add a public description or summary of at least 20 characters.'));
  end if;

  if length(btrim(coalesce(property_row.public_address,''))) < 3 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','MISSING_PUBLIC_LOCATION_TEXT','message','Add safe public location text.'));
  end if;

  if not exists(select 1 from public.districts where id = property_row.district_id and is_active) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','INVALID_PUBLIC_DISTRICT','message','Choose an active service district.'));
  end if;

  if not exists(select 1 from public.area_units where id = property_row.display_area_unit_id and is_public_v1) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','INVALID_PUBLIC_AREA_UNIT','message','Choose a public V1 area unit.'));
  end if;

  if property_row.display_area_value is null or property_row.display_area_value <= 0 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','INVALID_DISPLAY_AREA','message','Area must be greater than zero.'));
  end if;

  -- Location Privacy Mode validation
  if location_row.property_id is null or location_row.location_visibility <> property_row.location_visibility then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','LOCATION_MODE_MISMATCH','message','The property and location privacy modes must match.'));
  elsif location_row.location_visibility = 'HIDDEN' and (location_row.public_latitude is not null or location_row.public_longitude is not null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','HIDDEN_LOCATION_EXPOSED','message','Hidden location mode cannot contain a public coordinate.'));
  elsif location_row.location_visibility = 'APPROXIMATE'
    and location_row.private_latitude is not null
    and location_row.public_latitude = location_row.private_latitude
    and location_row.public_longitude = location_row.private_longitude then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','APPROXIMATE_EQUALS_PRIVATE','message','Approximate public coordinates cannot equal the stored exact point.'));
  elsif location_row.location_visibility = 'EXACT' and (location_row.public_latitude is null or location_row.public_longitude is null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','EXACT_PUBLIC_POINT_MISSING','message','Exact disclosure requires an explicit public coordinate pair.'));
  end if;

  -- Offer & Pricing validation: PRICE_ON_REQUEST requires no numeric price
  if offer_row.id is null or offer_row.transaction_type <> property_row.primary_transaction_type then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PRIMARY_OFFER_MISSING','message','Add one active primary offer matching the primary transaction.'));
  elsif offer_row.price_mode = 'PRICE_ON_REQUEST' and (offer_row.price_amount is not null or offer_row.price_min is not null or offer_row.price_max is not null or offer_row.price_per_unit is not null or offer_row.price_unit_id is not null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PRICE_ON_REQUEST_CONTRADICTION','message','Price on Request cannot carry a numeric price.'));
  elsif offer_row.price_mode = 'EXACT_TOTAL' and (offer_row.price_amount is null or offer_row.price_amount <= 0) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','EXACT_PRICE_MISSING','message','Exact Total requires a positive price amount.'));
  elsif offer_row.price_mode = 'PRICE_RANGE' and (offer_row.price_min is null or offer_row.price_max is null or offer_row.price_min <= 0 or offer_row.price_max <= 0 or offer_row.price_min > offer_row.price_max) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PRICE_RANGE_INVALID','message','Price Range requires an ordered minimum and maximum.'));
  elsif offer_row.price_mode = 'PER_UNIT' and (offer_row.price_per_unit is null or offer_row.price_per_unit <= 0 or offer_row.price_unit_id is null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PER_UNIT_PRICE_INVALID','message','Per Unit pricing requires a positive amount and unit.'));
  end if;

  -- Availability checks
  if property_row.availability_status = 'OFF_MARKET' then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','PUBLIC_PROJECTION','code','OFF_MARKET_NOT_PUBLISHABLE','message','Off-market inventory cannot be newly published.'));
  elsif property_row.availability_status in ('SOLD','RENTED','LEASED') then
    warnings := warnings || jsonb_build_array(jsonb_build_object('group','PUBLIC_PROJECTION','code','CLOSED_AVAILABILITY','message','The public representation clearly retains this closed availability state.'));
  end if;

  -- Cover image requirement (at least 1 approved public photo)
  if not exists(select 1 from public.media_assets where property_id = requested_property_id
    and archived_at is null and media_type = 'IMAGE' and is_cover and visibility = 'PUBLIC'
    and processing_status = 'APPROVED' and approved_at is not null
    and storage_bucket = 'property-media-public' and nullif(btrim(alt_text),'') is not null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','MEDIA','code','APPROVED_COVER_MISSING','message','Choose one approved public cover image with alt text.'));
  end if;

  -- Category-specific fields are OPTIONAL:
  if property_row.land_category = 'AGRICULTURAL' and (
    agricultural_row.property_id is null or agricultural_row.tenure_type is null
  ) then
    warnings := warnings || jsonb_build_array(jsonb_build_object('group','CATEGORY_DATA','code','AGRICULTURAL_DATA_OPTIONAL','message','Optional agricultural tenure details have not been specified.'));
  elsif property_row.land_category = 'NA' and (
    na_row.property_id is null or na_row.na_status is null or na_row.na_status = 'UNSPECIFIED'
  ) then
    warnings := warnings || jsonb_build_array(jsonb_build_object('group','CATEGORY_DATA','code','NA_DATA_OPTIONAL','message','Optional NA status/purpose details have not been specified.'));
  elsif property_row.land_category = 'INDUSTRIAL' and (
    industrial_row.property_id is null or industrial_row.industrial_subtype is null
  ) then
    warnings := warnings || jsonb_build_array(jsonb_build_object('group','CATEGORY_DATA','code','INDUSTRIAL_DATA_OPTIONAL','message','Optional industrial subtype details have not been specified.'));
  end if;

  return jsonb_build_object(
    'propertyId', property_row.id,
    'propertyCode', property_row.property_code,
    'publicSlug', property_row.public_slug,
    'publicationStatus', property_row.publication_status,
    'availabilityStatus', property_row.availability_status,
    'locationVisibility', property_row.location_visibility,
    'ready', jsonb_array_length(blockers) = 0,
    'blockers', blockers,
    'warnings', warnings,
    'evaluatedAt', now()
  );
end;
$$;

revoke all on function public.property_publication_readiness(uuid) from public,anon,authenticated;
grant execute on function public.property_publication_readiness(uuid) to service_role;
