create view public.public_property_listings
with (security_invoker = true)
as
select
  p.id,
  p.property_code,
  p.public_slug,
  p.land_category,
  p.primary_transaction_type,
  p.listing_title,
  p.short_description,
  p.availability_status,
  p.featured,
  p.published_at,
  p.district_id,
  d.name as district_name,
  p.subdistrict_id,
  sd.name as subdistrict_name,
  p.place_id,
  pl.official_name as place_name,
  p.locality_id,
  l.name as locality_name,
  p.landmark_text,
  p.public_address,
  p.display_area_value,
  u.code as display_area_unit_code,
  u.display_name as display_area_unit_name,
  u.symbol as display_area_unit_symbol,
  coalesce(loc.location_visibility, p.location_visibility) as location_visibility,
  case
    when coalesce(loc.location_visibility, p.location_visibility) in ('EXACT', 'APPROXIMATE') then loc.public_latitude
    else null
  end as public_latitude,
  case
    when coalesce(loc.location_visibility, p.location_visibility) in ('EXACT', 'APPROXIMATE') then loc.public_longitude
    else null
  end as public_longitude,
  case
    when coalesce(loc.location_visibility, p.location_visibility) in ('EXACT', 'APPROXIMATE') then loc.public_accuracy_m
    else null
  end as public_accuracy_m,
  offer.transaction_type as offer_transaction_type,
  offer.price_mode,
  offer.currency_code,
  offer.price_amount,
  offer.price_min,
  offer.price_max,
  offer.price_per_unit,
  offer_unit.code as price_unit_code,
  offer.is_negotiable,
  cover.id as cover_media_id,
  cover.object_path as cover_object_path,
  cover.alt_text as cover_alt_text,
  cover.width_px as cover_width_px,
  cover.height_px as cover_height_px
from public.properties p
join public.districts d on d.id = p.district_id and d.is_active
left join public.subdistricts sd on sd.id = p.subdistrict_id and sd.is_active
left join public.places pl on pl.id = p.place_id and pl.is_active
left join public.localities l on l.id = p.locality_id and l.is_active
join public.area_units u on u.id = p.display_area_unit_id and u.is_public_v1
left join public.property_locations loc on loc.property_id = p.id
left join lateral (
  select po.*
  from public.property_offers po
  where po.property_id = p.id and po.archived_at is null
  order by po.is_primary desc, po.created_at asc, po.id asc
  limit 1
) offer on true
left join public.area_units offer_unit on offer_unit.id = offer.price_unit_id
left join lateral (
  select ma.id, ma.object_path, ma.alt_text, ma.width_px, ma.height_px
  from public.media_assets ma
  where ma.property_id = p.id
    and ma.archived_at is null
    and ma.visibility = 'PUBLIC'
    and ma.is_cover
    and ma.media_type = 'IMAGE'
  order by ma.sort_order asc, ma.id asc
  limit 1
) cover on true
where p.publication_status = 'PUBLISHED'
  and p.deleted_at is null
  and p.archived_at is null;

create view public.public_property_details
with (security_invoker = true)
as
select
  listing.*,
  p.description,
  p.seo_title,
  p.seo_description,
  p.canonical_path
from public.public_property_listings listing
join public.properties p on p.id = listing.id;

create view public.public_property_media
with (security_invoker = true)
as
select
  ma.id,
  ma.property_id,
  ma.media_type,
  ma.object_path,
  ma.mime_type,
  ma.width_px,
  ma.height_px,
  ma.duration_seconds,
  ma.alt_text,
  ma.caption,
  ma.is_cover,
  ma.sort_order
from public.media_assets ma
join public.properties p on p.id = ma.property_id
where p.publication_status = 'PUBLISHED'
  and p.deleted_at is null
  and p.archived_at is null
  and ma.visibility = 'PUBLIC'
  and ma.archived_at is null;

create view public.public_property_verification_summaries
with (security_invoker = true)
as
select
  pv.id,
  pv.property_id,
  vcd.code as check_code,
  coalesce(pv.public_label, vcd.public_label_default) as label,
  coalesce(pv.public_explanation, vcd.public_explanation_template) as explanation,
  pv.status,
  pv.reviewed_at,
  pv.recheck_at
from public.property_verifications pv
join public.verification_check_definitions vcd on vcd.id = pv.check_definition_id
join public.properties p on p.id = pv.property_id
where p.publication_status = 'PUBLISHED'
  and p.deleted_at is null
  and p.archived_at is null
  and pv.public_visible
  and pv.status in ('PASSED', 'PASSED_WITH_NOTE')
  and (pv.recheck_at is null or pv.recheck_at > now());

create view public.public_geography_options
with (security_invoker = true)
as
select
  d.id as district_id,
  d.name as district_name,
  sd.id as subdistrict_id,
  sd.name as subdistrict_name,
  pl.id as place_id,
  pl.official_name as place_name,
  l.id as locality_id,
  l.name as locality_name,
  l.slug as locality_slug,
  coalesce(l.is_publicly_indexable, false) as locality_is_indexable
from public.districts d
left join public.subdistricts sd on sd.district_id = d.id and sd.is_active
left join public.places pl on pl.subdistrict_id = sd.id and pl.is_active
left join public.localities l on l.place_id = pl.id and l.is_active
where d.is_active and d.is_service_area;

create view public.public_area_units
with (security_invoker = true)
as
select id, code, display_name, symbol, is_metric, is_local
from public.area_units
where is_public_v1;

create view public.public_app_settings
with (security_invoker = true)
as
select
  key,
  label,
  value_type,
  case value_type
    when 'TEXT' then to_jsonb(text_value)
    when 'INTEGER' then to_jsonb(integer_value)
    when 'DECIMAL' then to_jsonb(decimal_value)
    when 'BOOLEAN' then to_jsonb(boolean_value)
    when 'URL' then to_jsonb(url_value)
    when 'JSON' then json_value
  end as value
from public.app_settings
where is_public and not is_secret_reference;

comment on view public.public_property_listings is
  'M3 public property card projection. Deliberately omits owner PII, private coordinates, evidence, documents, internal notes and admin metadata.';
comment on view public.public_property_details is
  'M3 public property detail projection. Deliberately whitelisted; do not replace with select-star access to base tables.';
comment on view public.public_property_media is
  'M3 public media projection containing only approved PUBLIC, non-archived media for published properties.';
comment on view public.public_property_verification_summaries is
  'M3 public verification summary projection. Evidence and reviewer/internal fields are excluded.';
comment on view public.public_app_settings is
  'M3 non-secret public settings projection.';

-- Access remains closed until the actor-matrix grants and RLS policies are added in M4.
revoke all on public.public_property_listings from anon, authenticated;
revoke all on public.public_property_details from anon, authenticated;
revoke all on public.public_property_media from anon, authenticated;
revoke all on public.public_property_verification_summaries from anon, authenticated;
revoke all on public.public_geography_options from anon, authenticated;
revoke all on public.public_area_units from anon, authenticated;
revoke all on public.public_app_settings from anon, authenticated;
