-- Allow a public marketing brochure to use a canonical Google Drive file locator.
-- Hosted PDF brochures keep their existing malware-scan and controlled-promotion rules.

alter table public.media_assets drop constraint media_assets_locator_check;
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
    and (
      media_type in ('VIDEO', 'PANORAMA_360')
      or (
        media_type = 'BROCHURE'
        and external_provider = 'GOOGLE_DRIVE'
        and source_type = 'GOOGLE_DRIVE'
        and external_url ~ '^https://drive[.]google[.]com/file/d/[A-Za-z0-9_-]{10,160}/view$'
        and external_media_id ~ '^[A-Za-z0-9_-]{10,160}$'
        and external_url = 'https://drive.google.com/file/d/' || external_media_id || '/view'
      )
    )
  )
);

alter table public.media_assets drop constraint media_assets_brochure_scan_check;
alter table public.media_assets add constraint media_assets_brochure_scan_check check (
  media_type <> 'BROCHURE'
  or (
    external_provider = 'GOOGLE_DRIVE'
    and external_url is not null
    and mime_type is null
    and scan_status is null
  )
  or (
    external_url is null
    and mime_type = 'application/pdf'
    and scan_status is not null
  )
);

create or replace function public.approve_property_media(
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
  if current_row.media_type = 'BROCHURE' and current_row.external_url is null and current_row.scan_status is distinct from 'CLEAN' then raise exception 'Public hosted brochures require a clean scan'; end if;
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

comment on column public.media_assets.external_provider is
  'Allowlisted external provider. GOOGLE_DRIVE is permitted only for canonical BROCHURE file locators.';
