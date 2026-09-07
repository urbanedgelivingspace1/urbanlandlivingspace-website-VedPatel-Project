-- M11: bounded, public-safe property search.
-- Searchable text is deliberately limited to fields already approved for public display.

alter table public.properties
  add column public_search_document tsvector generated always as (
    to_tsvector(
      'simple',
      coalesce(property_code, '') || ' ' || coalesce(listing_title, '') || ' ' ||
      coalesce(short_description, '') || ' ' || coalesce(description, '') || ' ' ||
      coalesce(landmark_text, '') || ' ' || coalesce(public_address, '')
    )
  ) stored;

create index properties_public_search_document_idx
  on public.properties using gin (public_search_document)
  where publication_status = 'PUBLISHED' and archived_at is null and deleted_at is null;
create index properties_public_discovery_idx
  on public.properties (featured desc, published_at desc, id desc)
  where publication_status = 'PUBLISHED' and archived_at is null and deleted_at is null;
create index properties_public_dimensions_idx
  on public.properties (land_category, primary_transaction_type, availability_status, published_at desc, id desc)
  where publication_status = 'PUBLISHED' and archived_at is null and deleted_at is null;
create index properties_public_geography_idx
  on public.properties (district_id, subdistrict_id, place_id, locality_id, published_at desc, id desc)
  where publication_status = 'PUBLISHED' and archived_at is null and deleted_at is null;
create index properties_public_authoritative_area_idx
  on public.properties (normalized_area_sqm, published_at desc, id desc)
  where publication_status = 'PUBLISHED' and archived_at is null and deleted_at is null
    and area_normalization_status = 'AUTHORITATIVE';
create index property_offers_public_price_idx
  on public.property_offers (property_id, price_mode, price_amount, price_min, price_max)
  where archived_at is null and is_primary;

do $$
declare
  grantor_role text;
begin
  select r.rolname into grantor_role
  from pg_auth_members m
  join pg_roles r on r.oid = m.member
  where m.roleid = 'urbanedge_public_projection'::regrole
    and m.admin_option = true
    and (r.rolname = current_user or pg_has_role(current_user, r.oid, 'MEMBER'))
  order by (r.rolname = current_user) desc
  limit 1;

  if grantor_role is null then
    grantor_role := current_user;
  end if;

  execute format(
    'grant urbanedge_public_projection to %I with inherit false, set true granted by %I',
    current_user, grantor_role
  );
end;
$$;
grant create on schema public to urbanedge_public_projection;
set role urbanedge_public_projection;

create view public.public_property_search
with (security_invoker = false)
as
select
  detail.*,
  property.normalized_area_sqm,
  property.area_normalization_status,
  property.public_search_document,
  case
    when detail.price_mode = 'EXACT_TOTAL' then detail.price_amount
    when detail.price_mode = 'PRICE_RANGE' then detail.price_min
  end as comparable_price_floor,
  case
    when detail.price_mode = 'EXACT_TOTAL' then detail.price_amount
    when detail.price_mode = 'PRICE_RANGE' then detail.price_max
  end as comparable_price_ceiling,
  lower(regexp_replace(trim(detail.district_name), '[^a-zA-Z0-9]+', '-', 'g')) as district_key,
  lower(regexp_replace(trim(detail.subdistrict_name), '[^a-zA-Z0-9]+', '-', 'g')) as taluka_key,
  lower(regexp_replace(trim(detail.place_name), '[^a-zA-Z0-9]+', '-', 'g')) as place_key,
  lower(regexp_replace(trim(detail.locality_name), '[^a-zA-Z0-9]+', '-', 'g')) as locality_key,
  lower(regexp_replace(trim(detail.agricultural_tenure_type), '[^a-zA-Z0-9]+', '-', 'g')) as agricultural_tenure_key,
  lower(regexp_replace(trim(detail.irrigation_status), '[^a-zA-Z0-9]+', '-', 'g')) as agricultural_irrigation_key,
  lower(regexp_replace(trim(detail.na_status), '[^a-zA-Z0-9]+', '-', 'g')) as na_status_key,
  lower(regexp_replace(trim(detail.na_purpose), '[^a-zA-Z0-9]+', '-', 'g')) as na_purpose_key,
  lower(regexp_replace(trim(detail.industrial_subtype), '[^a-zA-Z0-9]+', '-', 'g')) as industrial_type_key,
  lower(regexp_replace(trim(detail.power_status), '[^a-zA-Z0-9]+', '-', 'g')) as industrial_power_key
from public.public_property_details detail
join public.properties property on property.id = detail.id;

create view public.public_property_search_filter_options
with (security_invoker = false)
as
select facet_key, land_category, value, label, count(*)::bigint as result_count
from (
  select 'agriculturalTenure'::text as facet_key, land_category,
    agricultural_tenure_key as value, agricultural_tenure_type as label
  from public.public_property_search
  where land_category = 'AGRICULTURAL' and agricultural_tenure_key <> ''
  union all
  select 'agriculturalIrrigation', land_category,
    agricultural_irrigation_key, irrigation_status
  from public.public_property_search
  where land_category = 'AGRICULTURAL' and agricultural_irrigation_key <> ''
  union all
  select 'naStatus', land_category, na_status_key, na_status
  from public.public_property_search where land_category = 'NA' and na_status_key <> ''
  union all
  select 'naPurpose', land_category, na_purpose_key, na_purpose
  from public.public_property_search where land_category = 'NA' and na_purpose_key <> ''
  union all
  select 'industrialType', land_category, industrial_type_key, industrial_subtype
  from public.public_property_search
  where land_category = 'INDUSTRIAL' and industrial_type_key <> ''
  union all
  select 'industrialPower', land_category, industrial_power_key, power_status
  from public.public_property_search
  where land_category = 'INDUSTRIAL' and industrial_power_key <> ''
) option
where label is not null and value is not null
group by facet_key, land_category, value, label;

comment on view public.public_property_search is
  'M11 server search projection. Public display fields plus normalized filter/sort columns; excludes PII, private coordinates, evidence, documents and internal metadata.';
comment on view public.public_property_search_filter_options is
  'M11 bounded public-safe category facet vocabulary derived only from published properties.';

create function public.search_public_properties(
  requested_keyword text default null,
  requested_property_code text default null,
  requested_category public.land_category default null,
  requested_transaction public.transaction_type default null,
  requested_district text default null,
  requested_taluka text default null,
  requested_place text default null,
  requested_locality text default null,
  requested_minimum_area_sqm numeric default null,
  requested_maximum_area_sqm numeric default null,
  requested_minimum_price numeric default null,
  requested_maximum_price numeric default null,
  requested_pricing text default null,
  requested_availability public.property_availability_status default null,
  requested_agricultural_tenure text default null,
  requested_agricultural_irrigation text default null,
  requested_na_status text default null,
  requested_na_purpose text default null,
  requested_industrial_type text default null,
  requested_industrial_power text default null,
  requested_sort text default 'DEFAULT',
  requested_page integer default 1,
  requested_page_size integer default 12
)
returns table (
  id uuid, property_code varchar, public_slug varchar, land_category public.land_category,
  primary_transaction_type public.transaction_type, listing_title varchar,
  short_description text, availability_status public.property_availability_status,
  featured boolean, published_at timestamptz, district_id uuid, district_name varchar,
  subdistrict_id uuid, subdistrict_name varchar, place_id uuid, place_name varchar,
  locality_id uuid, locality_name varchar, landmark_text varchar, public_address text,
  display_area_value numeric, display_area_unit_code varchar, display_area_unit_name varchar,
  display_area_unit_symbol varchar, location_visibility public.location_visibility,
  public_latitude numeric, public_longitude numeric, public_accuracy_m numeric,
  offer_transaction_type public.transaction_type, price_mode public.price_mode,
  currency_code character, price_amount numeric, price_min numeric, price_max numeric,
  price_per_unit numeric, price_unit_code varchar, is_negotiable boolean,
  cover_media_id uuid, cover_object_path text, cover_alt_text text,
  cover_width_px integer, cover_height_px integer, total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if requested_page is null or requested_page < 1 or requested_page > 100 then
    raise exception 'search page must be between 1 and 100';
  end if;
  if requested_page_size is null or requested_page_size < 1 or requested_page_size > 48 then
    raise exception 'search page size must be between 1 and 48';
  end if;
  if requested_keyword is not null and length(requested_keyword) > 120 then
    raise exception 'search keyword exceeds 120 characters';
  end if;
  if requested_property_code is not null and requested_property_code !~ '^UE-LS-[0-9]{6}$' then
    raise exception 'invalid public property code';
  end if;
  if requested_sort not in ('DEFAULT','NEWEST','OLDEST','PRICE_LOW','PRICE_HIGH','AREA_SMALL','AREA_LARGE') then
    raise exception 'unsupported search sort';
  end if;
  if requested_pricing is not null and requested_pricing not in ('LISTED','POR') then
    raise exception 'unsupported pricing class';
  end if;
  if requested_pricing = 'POR'
    and (requested_minimum_price is not null or requested_maximum_price is not null) then
    raise exception 'POR cannot be combined with a numeric budget';
  end if;
  if requested_availability = 'OFF_MARKET' then
    raise exception 'off-market properties are never public search results';
  end if;
  if requested_minimum_area_sqm < 0 or requested_maximum_area_sqm < 0
    or requested_minimum_area_sqm > requested_maximum_area_sqm then
    raise exception 'invalid area range';
  end if;
  if requested_minimum_price < 0 or requested_maximum_price < 0
    or requested_minimum_price > requested_maximum_price then
    raise exception 'invalid price range';
  end if;
  if (requested_taluka is not null and requested_district is null)
    or (requested_place is not null and requested_taluka is null)
    or (requested_locality is not null and requested_place is null) then
    raise exception 'invalid geography hierarchy';
  end if;
  if exists (
    select 1 from unnest(array[requested_district, requested_taluka, requested_place,
      requested_locality, requested_agricultural_tenure, requested_agricultural_irrigation,
      requested_na_status, requested_na_purpose, requested_industrial_type,
      requested_industrial_power]) value
    where value is not null and (length(value) > 180 or value !~ '^[a-z0-9]+(-[a-z0-9]+)*$')
  ) then
    raise exception 'invalid search filter token';
  end if;
  if requested_category is not null and (
    requested_category <> 'AGRICULTURAL'
      and (requested_agricultural_tenure is not null or requested_agricultural_irrigation is not null)
    or requested_category <> 'NA'
      and (requested_na_status is not null or requested_na_purpose is not null)
    or requested_category <> 'INDUSTRIAL'
      and (requested_industrial_type is not null or requested_industrial_power is not null)
  ) then
    raise exception 'category-specific filter does not match category';
  end if;

  return query
  with matched as (
    select search.*,
      case when requested_keyword is null then 0::real
        else ts_rank(search.public_search_document, websearch_to_tsquery('simple', requested_keyword))
      end as relevance
    from public.public_property_search search
    where
      (requested_availability is not null and search.availability_status = requested_availability
        or requested_availability is null
          and search.availability_status in ('AVAILABLE','UNDER_NEGOTIATION'))
      and (requested_property_code is null or search.property_code = requested_property_code)
      and (requested_category is null or search.land_category = requested_category)
      and (requested_transaction is null or search.primary_transaction_type = requested_transaction)
      and (requested_district is null or search.district_key = requested_district)
      and (requested_taluka is null or search.taluka_key = requested_taluka)
      and (requested_place is null or search.place_key = requested_place)
      and (requested_locality is null or search.locality_key = requested_locality)
      and (requested_keyword is null
        or search.public_search_document @@ websearch_to_tsquery('simple', requested_keyword)
        or lower(concat_ws(' ', search.district_name, search.subdistrict_name,
          search.place_name, search.locality_name)) like '%' || lower(requested_keyword) || '%')
      and ((requested_minimum_area_sqm is null and requested_maximum_area_sqm is null)
        or search.area_normalization_status = 'AUTHORITATIVE'
          and (requested_minimum_area_sqm is null or search.normalized_area_sqm >= requested_minimum_area_sqm)
          and (requested_maximum_area_sqm is null or search.normalized_area_sqm <= requested_maximum_area_sqm))
      and (requested_pricing is null
        or requested_pricing = 'POR' and search.price_mode = 'PRICE_ON_REQUEST'
        or requested_pricing = 'LISTED' and search.price_mode <> 'PRICE_ON_REQUEST')
      and ((requested_minimum_price is null and requested_maximum_price is null)
        or search.price_mode in ('EXACT_TOTAL','PRICE_RANGE')
          and (requested_minimum_price is null or search.comparable_price_ceiling >= requested_minimum_price)
          and (requested_maximum_price is null or search.comparable_price_floor <= requested_maximum_price))
      and (requested_agricultural_tenure is null
        or search.land_category = 'AGRICULTURAL' and search.agricultural_tenure_key = requested_agricultural_tenure)
      and (requested_agricultural_irrigation is null
        or search.land_category = 'AGRICULTURAL' and search.agricultural_irrigation_key = requested_agricultural_irrigation)
      and (requested_na_status is null or search.land_category = 'NA' and search.na_status_key = requested_na_status)
      and (requested_na_purpose is null or search.land_category = 'NA' and search.na_purpose_key = requested_na_purpose)
      and (requested_industrial_type is null
        or search.land_category = 'INDUSTRIAL' and search.industrial_type_key = requested_industrial_type)
      and (requested_industrial_power is null
        or search.land_category = 'INDUSTRIAL' and search.industrial_power_key = requested_industrial_power)
      and (requested_sort not in ('PRICE_LOW','PRICE_HIGH')
        or search.comparable_price_floor is not null)
      and (requested_sort not in ('AREA_SMALL','AREA_LARGE')
        or search.area_normalization_status = 'AUTHORITATIVE')
  ), counted as (
    select matched.*, count(*) over () as matched_total from matched
  )
  select
    result.id, result.property_code, result.public_slug, result.land_category,
    result.primary_transaction_type, result.listing_title, result.short_description,
    result.availability_status, result.featured, result.published_at, result.district_id,
    result.district_name, result.subdistrict_id, result.subdistrict_name,
    result.place_id, result.place_name, result.locality_id, result.locality_name,
    result.landmark_text, result.public_address, result.display_area_value,
    result.display_area_unit_code, result.display_area_unit_name,
    result.display_area_unit_symbol, result.location_visibility, result.public_latitude,
    result.public_longitude, result.public_accuracy_m, result.offer_transaction_type,
    result.price_mode, result.currency_code, result.price_amount, result.price_min,
    result.price_max, result.price_per_unit, result.price_unit_code, result.is_negotiable,
    result.cover_media_id, result.cover_object_path, result.cover_alt_text,
    result.cover_width_px, result.cover_height_px, result.matched_total
  from counted result
  order by
    case when requested_sort = 'DEFAULT' and requested_property_code is not null
      and result.property_code = requested_property_code then 0 else 1 end,
    case when requested_sort = 'DEFAULT' then result.relevance end desc,
    case when requested_sort = 'DEFAULT' then result.featured end desc,
    case when requested_sort in ('DEFAULT','NEWEST') then result.published_at end desc,
    case when requested_sort = 'OLDEST' then result.published_at end asc,
    case when requested_sort = 'PRICE_LOW' then result.comparable_price_floor end asc,
    case when requested_sort = 'PRICE_HIGH' then result.comparable_price_ceiling end desc,
    case when requested_sort = 'AREA_SMALL' then result.normalized_area_sqm end asc,
    case when requested_sort = 'AREA_LARGE' then result.normalized_area_sqm end desc,
    result.id desc
  limit requested_page_size
  offset ((requested_page - 1) * requested_page_size);
end;
$$;

grant select on public.public_property_search_filter_options to anon, authenticated, service_role;
grant execute on function public.search_public_properties(text,text,public.land_category,
  public.transaction_type,text,text,text,text,numeric,numeric,numeric,numeric,text,
  public.property_availability_status,text,text,text,text,text,text,text,integer,integer)
  to anon, authenticated, service_role;

set role postgres;
revoke create on schema public from urbanedge_public_projection;
do $$
declare
  grantor_role text;
begin
  select g.rolname into grantor_role
  from pg_auth_members m
  join pg_roles r on r.oid = m.roleid
  join pg_roles u on u.oid = m.member
  join pg_roles g on g.oid = m.grantor
  where r.rolname = 'urbanedge_public_projection'
    and u.rolname = current_user
    and m.set_option = true
  limit 1;

  if grantor_role is not null then
    execute format(
      'revoke urbanedge_public_projection from %I granted by %I',
      current_user, grantor_role
    );
  end if;
end;
$$;
