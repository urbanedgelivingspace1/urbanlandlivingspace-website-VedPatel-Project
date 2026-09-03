-- M7: controlled media registry, private documents, and local Storage boundary.
-- All application mutations remain service-role-only after requireActiveAdmin().

create type public.media_processing_status as enum ('READY', 'APPROVED', 'FAILED');
create type public.document_scan_status as enum ('PENDING', 'CLEAN', 'INFECTED', 'FAILED');

alter table public.media_assets
  alter column storage_bucket drop not null,
  alter column object_path drop not null,
  alter column mime_type drop not null,
  add column external_url text,
  add column external_provider varchar(40),
  add column external_media_id varchar(160),
  add column media_subtype varchar(40),
  add column processing_status public.media_processing_status not null default 'READY',
  add column scan_status public.document_scan_status,
  add column approved_at timestamptz;

alter table public.media_assets add constraint media_assets_locator_check check (
  (
    external_url is null
    and storage_bucket is not null
    and object_path is not null
    and mime_type is not null
    and checksum_sha256 is not null
  )
  or
  (
    external_url is not null
    and external_url ~ '^https://'
    and external_provider is not null
    and external_media_id is not null
    and storage_bucket is null
    and object_path is null
    and mime_type is null
    and file_size_bytes is null
    and checksum_sha256 is null
    and media_type in ('VIDEO', 'PANORAMA_360')
  )
);

alter table public.media_assets add constraint media_assets_bucket_check check (
  storage_bucket is null
  or storage_bucket in ('property-media-public', 'property-media-private', 'guide-media-public')
);

alter table public.media_assets add constraint media_assets_public_approval_check check (
  visibility <> 'PUBLIC'
  or (
    approved_at is not null
    and processing_status = 'APPROVED'
    and (
      storage_bucket in ('property-media-public', 'guide-media-public')
      or external_url is not null
    )
  )
);

alter table public.media_assets add constraint media_assets_public_image_alt_check check (
  visibility <> 'PUBLIC'
  or media_type not in ('IMAGE', 'MAP_IMAGE')
  or nullif(trim(alt_text), '') is not null
);

alter table public.media_assets add constraint media_assets_brochure_scan_check check (
  media_type <> 'BROCHURE'
  or (mime_type = 'application/pdf' and scan_status is not null)
);

alter table public.media_assets add constraint media_assets_image_shape_check check (
  media_type not in ('IMAGE', 'MAP_IMAGE')
  or (width_px is not null and height_px is not null)
);

alter table public.private_documents
  add column original_file_name varchar(255),
  add column page_count integer,
  add column scan_status public.document_scan_status not null default 'PENDING',
  add constraint private_documents_bucket_check check (
    storage_bucket in ('verification-documents-private', 'owner-submissions-private')
  ),
  add constraint private_documents_private_visibility_check check (visibility in ('PRIVATE', 'ADMIN_ONLY')),
  add constraint private_documents_page_count_check check (page_count is null or page_count between 1 and 500);

create unique index media_assets_active_hosted_duplicate_uidx
  on public.media_assets(property_id, media_type, checksum_sha256)
  where property_id is not null and checksum_sha256 is not null and archived_at is null;

create unique index media_assets_active_external_duplicate_uidx
  on public.media_assets(property_id, external_provider, external_media_id, coalesce(media_subtype, ''))
  where property_id is not null and external_url is not null and archived_at is null;

create unique index media_assets_one_active_brochure_uidx
  on public.media_assets(property_id)
  where property_id is not null and media_type = 'BROCHURE' and archived_at is null;

create unique index private_documents_active_property_duplicate_uidx
  on public.private_documents(property_id, document_type, checksum_sha256)
  where property_id is not null and checksum_sha256 is not null and archived_at is null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('property-media-public', 'property-media-public', true, 15728640, array['image/webp', 'application/pdf']),
  ('property-media-private', 'property-media-private', false, 15728640, array['image/webp', 'application/pdf']),
  ('verification-documents-private', 'verification-documents-private', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png']),
  ('owner-submissions-private', 'owner-submissions-private', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png']),
  ('guide-media-public', 'guide-media-public', true, 10485760, array['image/webp'])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No anon/authenticated storage.objects policies are created. Public bucket delivery works by
-- known public URL, while listing and every direct browser mutation remain denied. Private access
-- is minted by the trusted service only after relational authorization.

do $$
begin
  execute format('grant urbanedge_public_projection to %I', current_user);
end;
$$;
grant create on schema public to urbanedge_public_projection;
set role urbanedge_public_projection;

create or replace view public.public_property_listings
with (security_invoker = false)
as
select
  p.id, p.property_code, p.public_slug, p.land_category, p.primary_transaction_type,
  p.listing_title, p.short_description, p.availability_status, p.featured, p.published_at,
  p.district_id, d.name as district_name, p.subdistrict_id, sd.name as subdistrict_name,
  p.place_id, pl.official_name as place_name, p.locality_id, l.name as locality_name,
  p.landmark_text, p.public_address, p.display_area_value,
  u.code as display_area_unit_code, u.display_name as display_area_unit_name,
  u.symbol as display_area_unit_symbol,
  coalesce(loc.location_visibility, p.location_visibility) as location_visibility,
  case when coalesce(loc.location_visibility, p.location_visibility) in ('EXACT', 'APPROXIMATE') then loc.public_latitude else null end as public_latitude,
  case when coalesce(loc.location_visibility, p.location_visibility) in ('EXACT', 'APPROXIMATE') then loc.public_longitude else null end as public_longitude,
  case when coalesce(loc.location_visibility, p.location_visibility) in ('EXACT', 'APPROXIMATE') then loc.public_accuracy_m else null end as public_accuracy_m,
  offer.transaction_type as offer_transaction_type, offer.price_mode, offer.currency_code,
  offer.price_amount, offer.price_min, offer.price_max, offer.price_per_unit,
  offer_unit.code as price_unit_code, offer.is_negotiable,
  cover.id as cover_media_id, cover.object_path as cover_object_path,
  cover.alt_text as cover_alt_text, cover.width_px as cover_width_px,
  cover.height_px as cover_height_px
from public.properties p
join public.districts d on d.id = p.district_id and d.is_active
left join public.subdistricts sd on sd.id = p.subdistrict_id and sd.is_active
left join public.places pl on pl.id = p.place_id and pl.is_active
left join public.localities l on l.id = p.locality_id and l.is_active
join public.area_units u on u.id = p.display_area_unit_id and u.is_public_v1
left join public.property_locations loc on loc.property_id = p.id
left join lateral (
  select po.* from public.property_offers po
  where po.property_id = p.id and po.archived_at is null
  order by po.is_primary desc, po.created_at asc, po.id asc limit 1
) offer on true
left join public.area_units offer_unit on offer_unit.id = offer.price_unit_id
left join lateral (
  select ma.id, ma.object_path, ma.alt_text, ma.width_px, ma.height_px
  from public.media_assets ma
  where ma.property_id = p.id and ma.archived_at is null and ma.visibility = 'PUBLIC'
    and ma.processing_status = 'APPROVED' and ma.approved_at is not null
    and ma.storage_bucket = 'property-media-public' and ma.is_cover and ma.media_type = 'IMAGE'
  order by ma.sort_order asc, ma.id asc limit 1
) cover on true
where p.publication_status = 'PUBLISHED' and p.deleted_at is null and p.archived_at is null;

create or replace view public.public_property_media
with (security_invoker = false)
as
select
  ma.id, ma.property_id, ma.media_type, ma.object_path, ma.mime_type, ma.width_px,
  ma.height_px, ma.duration_seconds, ma.alt_text, ma.caption, ma.is_cover, ma.sort_order,
  ma.external_url, ma.external_provider, ma.external_media_id, ma.media_subtype
from public.media_assets ma
join public.properties p on p.id = ma.property_id
where p.publication_status = 'PUBLISHED' and p.deleted_at is null and p.archived_at is null
  and ma.visibility = 'PUBLIC' and ma.archived_at is null
  and ma.processing_status = 'APPROVED' and ma.approved_at is not null
  and (
    ma.storage_bucket = 'property-media-public'
    or (ma.external_url is not null and ma.external_provider is not null)
  );

reset role;
revoke create on schema public from urbanedge_public_projection;
do $$
begin
  execute format('revoke urbanedge_public_projection from %I', current_user);
end;
$$;
grant select on public.public_property_listings, public.public_property_media to anon, authenticated;

create function public.register_property_media(requested_actor_id uuid, requested_payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  target_id uuid := (requested_payload ->> 'id')::uuid;
  target_property_id uuid := (requested_payload ->> 'propertyId')::uuid;
  existing_id uuid;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise insufficient_privilege using message = 'Service role required';
  end if;
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then
    raise insufficient_privilege using message = 'Active admin actor required';
  end if;
  if not exists (select 1 from public.properties where id = target_property_id and deleted_at is null and archived_at is null) then
    raise exception 'Property not found';
  end if;
  if requested_payload ? 'visibility' or requested_payload ? 'bucket' or requested_payload ? 'path' then
    raise exception 'Client-controlled visibility, bucket, and path fields are not accepted';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_property_id::text, 7001));

  if nullif(requested_payload ->> 'checksumSha256', '') is not null then
    select id into existing_id from public.media_assets
      where property_id = target_property_id
        and media_type = (requested_payload ->> 'mediaType')::public.media_type
        and checksum_sha256 = requested_payload ->> 'checksumSha256'
        and archived_at is null limit 1;
  elsif nullif(requested_payload ->> 'externalUrl', '') is not null then
    select id into existing_id from public.media_assets
      where property_id = target_property_id
        and external_provider = requested_payload ->> 'externalProvider'
        and external_media_id = requested_payload ->> 'externalMediaId'
        and coalesce(media_subtype, '') = coalesce(requested_payload ->> 'mediaSubtype', '')
        and archived_at is null limit 1;
  end if;
  if existing_id is not null then return existing_id; end if;
  if (requested_payload ->> 'mediaType') = 'IMAGE' and (
    select count(*) from public.media_assets
    where property_id = target_property_id and media_type = 'IMAGE' and archived_at is null
      and not (visibility = 'PUBLIC' and processing_status = 'APPROVED')
  ) >= 20 then
    raise exception 'Property staged image limit reached';
  end if;
  if (requested_payload ->> 'mediaType') = 'BROCHURE' and exists (
    select 1 from public.media_assets
    where property_id = target_property_id and media_type = 'BROCHURE' and archived_at is null
  ) then
    raise exception 'Property already has an active brochure';
  end if;

  insert into public.media_assets (
    id, property_id, media_type, storage_bucket, object_path, mime_type, file_size_bytes,
    width_px, height_px, alt_text, caption, visibility, is_cover, sort_order, source_type,
    checksum_sha256, external_url, external_provider, external_media_id, media_subtype,
    processing_status, scan_status, created_by, updated_by
  ) values (
    target_id, target_property_id, (requested_payload ->> 'mediaType')::public.media_type,
    nullif(requested_payload ->> 'storageBucket', ''), nullif(requested_payload ->> 'objectPath', ''),
    nullif(requested_payload ->> 'mimeType', ''), nullif(requested_payload ->> 'fileSizeBytes', '')::bigint,
    nullif(requested_payload ->> 'widthPx', '')::integer, nullif(requested_payload ->> 'heightPx', '')::integer,
    nullif(trim(requested_payload ->> 'altText'), ''), nullif(trim(requested_payload ->> 'caption'), ''),
    'ADMIN_ONLY', false,
    coalesce((select max(sort_order) + 10 from public.media_assets where property_id = target_property_id and archived_at is null), 10),
    requested_payload ->> 'sourceType', nullif(requested_payload ->> 'checksumSha256', ''),
    nullif(requested_payload ->> 'externalUrl', ''), nullif(requested_payload ->> 'externalProvider', ''),
    nullif(requested_payload ->> 'externalMediaId', ''), nullif(requested_payload ->> 'mediaSubtype', ''),
    'READY', nullif(requested_payload ->> 'scanStatus', '')::public.document_scan_status,
    requested_actor_id, requested_actor_id
  );
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, after_state, reason)
  values (requested_actor_id, 'CREATE', 'media_asset', target_id,
    array['property_id','media_type','source_type','processing_status'],
    jsonb_build_object('propertyId', target_property_id, 'mediaType', requested_payload ->> 'mediaType',
      'sourceType', requested_payload ->> 'sourceType', 'processingStatus', 'READY'),
    'M7 media upload/registration');
  return target_id;
end;
$$;

create function public.update_property_media_metadata(
  requested_actor_id uuid, requested_media_id uuid, requested_alt_text text, requested_caption text
) returns uuid language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise insufficient_privilege using message = 'Service role required'; end if;
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  perform 1 from public.media_assets where id = requested_media_id and archived_at is null for update;
  if not found then raise exception 'Media asset not found'; end if;
  update public.media_assets set alt_text = nullif(trim(requested_alt_text), ''), caption = nullif(trim(requested_caption), ''), updated_by = requested_actor_id where id = requested_media_id;
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, reason)
  values (requested_actor_id, 'UPDATE', 'media_asset', requested_media_id, array['alt_text','caption'], 'M7 media metadata update');
  return requested_media_id;
end;
$$;

create function public.reorder_property_media(requested_actor_id uuid, requested_property_id uuid, requested_media_ids uuid[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare supplied_count integer; active_count integer;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise insufficient_privilege using message = 'Service role required'; end if;
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  supplied_count := coalesce(array_length(requested_media_ids, 1), 0);
  if supplied_count <> (select count(distinct id) from unnest(requested_media_ids) id) then raise exception 'Media order contains duplicate IDs'; end if;
  select count(*) into active_count from public.media_assets where property_id = requested_property_id and archived_at is null;
  if supplied_count <> active_count or active_count <> (select count(*) from public.media_assets where property_id = requested_property_id and archived_at is null and id = any(requested_media_ids)) then
    raise exception 'Media order must contain every active asset for the property exactly once';
  end if;
  update public.media_assets ma set sort_order = ordered.ordinality * 10, updated_by = requested_actor_id
    from unnest(requested_media_ids) with ordinality ordered(id, ordinality) where ma.id = ordered.id;
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, after_state, reason)
  values (requested_actor_id, 'UPDATE', 'property_media_collection', requested_property_id, array['sort_order'], jsonb_build_object('mediaIds', requested_media_ids), 'M7 media reorder');
  return requested_property_id;
end;
$$;

create function public.set_property_cover(requested_actor_id uuid, requested_property_id uuid, requested_media_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise insufficient_privilege using message = 'Service role required'; end if;
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  if not exists (select 1 from public.media_assets where id = requested_media_id and property_id = requested_property_id and archived_at is null and media_type = 'IMAGE' and visibility = 'PUBLIC' and processing_status = 'APPROVED') then
    raise exception 'Cover must be an approved active public image for this property';
  end if;
  update public.media_assets set is_cover = false, updated_by = requested_actor_id where property_id = requested_property_id and archived_at is null and is_cover;
  update public.media_assets set is_cover = true, updated_by = requested_actor_id where id = requested_media_id;
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, after_state, reason)
  values (requested_actor_id, 'UPDATE', 'property_media_collection', requested_property_id, array['is_cover'], jsonb_build_object('coverMediaId', requested_media_id), 'M7 cover selection');
  return requested_media_id;
end;
$$;

create function public.approve_property_media(
  requested_actor_id uuid, requested_media_id uuid, requested_public_bucket text default null, requested_public_path text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare current_row public.media_assets%rowtype;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise insufficient_privilege using message = 'Service role required'; end if;
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  select * into current_row from public.media_assets where id = requested_media_id and archived_at is null for update;
  if not found then raise exception 'Media asset not found'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(current_row.property_id::text, 7001));
  if current_row.processing_status <> 'READY' then raise exception 'Only ready media may be approved'; end if;
  if current_row.media_type in ('IMAGE','MAP_IMAGE') and nullif(trim(current_row.alt_text), '') is null then raise exception 'Public images require alt text'; end if;
  if current_row.media_type = 'BROCHURE' and current_row.scan_status <> 'CLEAN' then raise exception 'Public brochures require a clean scan'; end if;
  if current_row.media_type = 'IMAGE' and (
    select count(*) from public.media_assets
    where property_id = current_row.property_id and media_type = 'IMAGE' and archived_at is null
      and visibility = 'PUBLIC' and processing_status = 'APPROVED' and id <> current_row.id
  ) >= 30 then
    raise exception 'Property approved image limit reached';
  end if;
  if current_row.storage_bucket = 'property-media-private' and coalesce(current_row.file_size_bytes, 0) + (
    select coalesce(sum(file_size_bytes), 0) from public.media_assets
    where property_id = current_row.property_id and storage_bucket = 'property-media-public'
      and archived_at is null and media_type in ('IMAGE', 'BROCHURE') and id <> current_row.id
  ) > 157286400 then
    raise exception 'Property public hosted-media budget exceeded';
  end if;
  if current_row.external_url is null then
    if current_row.storage_bucket <> 'property-media-private' or requested_public_bucket <> 'property-media-public' or requested_public_path !~ ('^properties/' || current_row.property_id || '/media/[0-9a-f-]+[.](webp|pdf)$') then
      raise exception 'Invalid controlled public promotion destination';
    end if;
    update public.media_assets set storage_bucket = requested_public_bucket, object_path = requested_public_path,
      visibility = 'PUBLIC', processing_status = 'APPROVED', approved_at = now(), updated_by = requested_actor_id
      where id = requested_media_id;
  else
    if requested_public_bucket is not null or requested_public_path is not null then raise exception 'External media has no Storage destination'; end if;
    update public.media_assets set visibility = 'PUBLIC', processing_status = 'APPROVED', approved_at = now(), updated_by = requested_actor_id where id = requested_media_id;
  end if;
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, after_state, reason)
  values (requested_actor_id, 'PUBLISH', 'media_asset', requested_media_id, array['visibility','processing_status','approved_at'], jsonb_build_object('visibility', 'PUBLIC', 'processingStatus', 'APPROVED'), 'M7 media approval/promotion; property publication unchanged');
  return requested_media_id;
end;
$$;

create function public.archive_property_media(requested_actor_id uuid, requested_media_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise insufficient_privilege using message = 'Service role required'; end if;
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  perform 1 from public.media_assets where id = requested_media_id and archived_at is null for update;
  if not found then raise exception 'Media asset not found'; end if;
  update public.media_assets set archived_at = now(), is_cover = false, updated_by = requested_actor_id where id = requested_media_id;
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, reason)
  values (requested_actor_id, 'ARCHIVE', 'media_asset', requested_media_id, array['archived_at','is_cover'], 'M7 archive-before-delete');
  return requested_media_id;
end;
$$;

create function public.restore_property_media(requested_actor_id uuid, requested_media_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare current_row public.media_assets%rowtype;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise insufficient_privilege using message = 'Service role required'; end if;
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  select * into current_row from public.media_assets where id = requested_media_id and archived_at is not null for update;
  if not found then raise exception 'Archived media asset not found'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(current_row.property_id::text, 7001));
  if current_row.media_type = 'IMAGE' and current_row.visibility = 'PUBLIC' and current_row.processing_status = 'APPROVED' and (
    select count(*) from public.media_assets where property_id = current_row.property_id and media_type = 'IMAGE'
      and archived_at is null and visibility = 'PUBLIC' and processing_status = 'APPROVED'
  ) >= 30 then raise exception 'Property approved image limit reached'; end if;
  if current_row.media_type = 'IMAGE' and not (current_row.visibility = 'PUBLIC' and current_row.processing_status = 'APPROVED') and (
    select count(*) from public.media_assets where property_id = current_row.property_id and media_type = 'IMAGE'
      and archived_at is null and not (visibility = 'PUBLIC' and processing_status = 'APPROVED')
  ) >= 20 then raise exception 'Property staged image limit reached'; end if;
  if current_row.media_type = 'BROCHURE' and exists (
    select 1 from public.media_assets where property_id = current_row.property_id and media_type = 'BROCHURE' and archived_at is null
  ) then raise exception 'Property already has an active brochure'; end if;
  update public.media_assets set archived_at = null, is_cover = false, updated_by = requested_actor_id where id = requested_media_id;
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, reason)
  values (requested_actor_id, 'RESTORE', 'media_asset', requested_media_id, array['archived_at'], 'M7 media restore rollback');
  return requested_media_id;
end;
$$;

create function public.register_private_document(requested_actor_id uuid, requested_payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target_id uuid := (requested_payload ->> 'id')::uuid; target_property_id uuid := (requested_payload ->> 'propertyId')::uuid; existing_id uuid;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise insufficient_privilege using message = 'Service role required'; end if;
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  if not exists (select 1 from public.properties where id = target_property_id and deleted_at is null and archived_at is null) then raise exception 'Property not found'; end if;
  if requested_payload ? 'visibility' or requested_payload ? 'bucket' or requested_payload ? 'path' then raise exception 'Client-controlled visibility, bucket, and path fields are not accepted'; end if;
  select id into existing_id from public.private_documents where property_id = target_property_id
    and document_type = requested_payload ->> 'documentType' and checksum_sha256 = requested_payload ->> 'checksumSha256' and archived_at is null limit 1;
  if existing_id is not null then return existing_id; end if;
  insert into public.private_documents (
    id, property_id, document_type, storage_bucket, object_path, mime_type, file_size_bytes,
    checksum_sha256, visibility, original_file_name, page_count, scan_status, created_by, updated_by
  ) values (
    target_id, target_property_id, requested_payload ->> 'documentType',
    'verification-documents-private', requested_payload ->> 'objectPath', requested_payload ->> 'mimeType',
    (requested_payload ->> 'fileSizeBytes')::bigint, requested_payload ->> 'checksumSha256', 'PRIVATE',
    nullif(requested_payload ->> 'originalFileName', ''), nullif(requested_payload ->> 'pageCount', '')::integer,
    (requested_payload ->> 'scanStatus')::public.document_scan_status, requested_actor_id, requested_actor_id
  );
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, after_state, reason)
  values (requested_actor_id, 'CREATE', 'private_document', target_id, array['property_id','document_type','scan_status'],
    jsonb_build_object('propertyId', target_property_id, 'documentType', requested_payload ->> 'documentType', 'scanStatus', requested_payload ->> 'scanStatus'), 'M7 private document upload');
  return target_id;
end;
$$;

create function public.archive_private_document(requested_actor_id uuid, requested_document_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise insufficient_privilege using message = 'Service role required'; end if;
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  if not exists (select 1 from public.private_documents where id = requested_document_id and archived_at is null) then raise exception 'Private document not found'; end if;
  update public.private_documents set archived_at = now(), updated_by = requested_actor_id where id = requested_document_id;
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, reason)
  values (requested_actor_id, 'ARCHIVE', 'private_document', requested_document_id, array['archived_at'], 'M7 private document archive-before-delete');
  return requested_document_id;
end;
$$;

create function public.record_private_document_access(requested_actor_id uuid, requested_document_id uuid, requested_purpose text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare audit_id uuid;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise insufficient_privilege using message = 'Service role required'; end if;
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  if not exists (select 1 from public.private_documents where id = requested_document_id and archived_at is null and scan_status = 'CLEAN') then raise exception 'Accessible private document not found'; end if;
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, after_state, reason)
  values (requested_actor_id, 'DOCUMENT_ACCESS', 'private_document', requested_document_id, array['access'], jsonb_build_object('purpose', left(requested_purpose, 80)), 'M7 short-lived signed access') returning id into audit_id;
  return audit_id;
end;
$$;

revoke all on function public.register_property_media(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.update_property_media_metadata(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.reorder_property_media(uuid, uuid, uuid[]) from public, anon, authenticated;
revoke all on function public.set_property_cover(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.approve_property_media(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.archive_property_media(uuid, uuid) from public, anon, authenticated;
revoke all on function public.restore_property_media(uuid, uuid) from public, anon, authenticated;
revoke all on function public.register_private_document(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.archive_private_document(uuid, uuid) from public, anon, authenticated;
revoke all on function public.record_private_document_access(uuid, uuid, text) from public, anon, authenticated;

grant execute on function public.register_property_media(uuid, jsonb) to service_role;
grant execute on function public.update_property_media_metadata(uuid, uuid, text, text) to service_role;
grant execute on function public.reorder_property_media(uuid, uuid, uuid[]) to service_role;
grant execute on function public.set_property_cover(uuid, uuid, uuid) to service_role;
grant execute on function public.approve_property_media(uuid, uuid, text, text) to service_role;
grant execute on function public.archive_property_media(uuid, uuid) to service_role;
grant execute on function public.restore_property_media(uuid, uuid) to service_role;
grant execute on function public.register_private_document(uuid, jsonb) to service_role;
grant execute on function public.archive_private_document(uuid, uuid) to service_role;
grant execute on function public.record_private_document_access(uuid, uuid, text) to service_role;

comment on table public.media_assets is 'ADR-0002 single registry with mutually exclusive hosted Storage and canonical external URL locators.';
comment on column public.media_assets.external_url is 'Canonical allowlisted HTTPS URL; never arbitrary iframe HTML.';
comment on column public.private_documents.scan_status is 'Must be CLEAN before future trusted evidence use or signed operational access.';
