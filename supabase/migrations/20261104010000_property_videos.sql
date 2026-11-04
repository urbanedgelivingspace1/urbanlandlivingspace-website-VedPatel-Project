-- Additive property video workflow. Apply before enabling NEXT_PUBLIC_PROPERTY_VIDEOS_ENABLED.
-- Inventory legacy rows first; do not relabel, delete, or silently archive existing provider records.
alter table public.media_assets
  add column video_title varchar(120),
  add column drive_resource_key varchar(200),
  add column video_photo_id uuid references public.media_assets(id) on delete set null,
  add column video_poster_id uuid,
  add column pending_video jsonb,
  add column video_revision integer not null default 0;

create table public.property_video_posters (
  id uuid primary key,
  property_id uuid not null references public.properties(id),
  object_path text not null unique,
  file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 10485760),
  created_by uuid not null references public.admin_profiles(user_id),
  created_at timestamptz not null default now()
);
alter table public.media_assets add constraint media_video_poster_fk foreign key(video_poster_id) references public.property_video_posters(id);
alter table public.property_video_posters enable row level security;
revoke all on public.property_video_posters from anon, authenticated;
grant all on public.property_video_posters to service_role;
grant select on public.property_video_posters to urbanedge_public_projection;
create policy projection_video_posters on public.property_video_posters for select to urbanedge_public_projection
using (exists (select 1 from public.media_assets m where m.video_poster_id = property_video_posters.id and m.visibility = 'PUBLIC' and m.processing_status = 'APPROVED' and m.archived_at is null));

-- Inventory before enforcing boundaries; preserve legacy records and report needed cleanup.
do $$
declare duplicate_groups integer; over_limit_properties integer;
begin
  select count(*) into duplicate_groups from (
    select property_id,external_provider,external_media_id from public.media_assets
    where media_type='VIDEO' and archived_at is null group by property_id,external_provider,external_media_id having count(*)>1
  ) duplicates;
  select count(*) into over_limit_properties from (
    select property_id from public.media_assets where media_type='VIDEO' and archived_at is null group by property_id having count(*)>5
  ) oversized;
  if duplicate_groups>0 or over_limit_properties>0 then
    raise warning 'Legacy video inventory: % duplicate groups, % properties above five videos. Review supabase/inspection/property-video-inventory.sql before enabling.', duplicate_groups,over_limit_properties;
  end if;
end;
$$;
create index media_assets_active_video_identity_idx on public.media_assets(property_id,external_provider,external_media_id)
where media_type='VIDEO' and archived_at is null;
comment on column public.media_assets.external_provider is 'External media provider; GOOGLE_DRIVE supports brochures and reviewed property videos. Existing Vimeo and Matterport records are retained.';

-- Trigger protects the old registration/restore/approval paths as well as the new RPC.
-- Scoped to new/changed video records, so legacy Vimeo/Matterport data is left intact.
create function public.guard_property_video() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.media_type <> 'VIDEO' then return new; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.property_id::text, 7001));
  if new.archived_at is null then
    if (select count(*) from public.media_assets where property_id = new.property_id and media_type = 'VIDEO' and archived_at is null and id <> new.id) >= 5
      and (TG_OP = 'INSERT' or old.archived_at is not null or old.property_id is distinct from new.property_id) then
      raise exception 'A property can have at most five active videos';
    end if;
    if exists (select 1 from public.media_assets where property_id = new.property_id and media_type = 'VIDEO' and archived_at is null and id <> new.id
      and external_provider = new.external_provider and external_media_id = new.external_media_id)
      and (TG_OP = 'INSERT' or old.archived_at is not null or old.external_media_id is distinct from new.external_media_id or old.external_provider is distinct from new.external_provider) then
      raise exception 'This provider video is already attached to the property';
    end if;
  end if;
  if new.video_title is not null then
    if new.external_provider is null or new.external_media_id is null or new.external_url is null or new.source_type is null then raise exception 'Missing video source'; end if;
    if length(trim(new.video_title)) not between 1 and 120 or length(coalesce(new.caption,'')) > 500 then raise exception 'Video title or description length is invalid'; end if;
    if new.external_provider = 'YOUTUBE' then
      if new.external_media_id !~ '^[A-Za-z0-9_-]{11}$' or new.source_type <> 'YOUTUBE'
        or new.external_url <> 'https://www.youtube.com/watch?v=' || new.external_media_id
        or new.drive_resource_key is not null then raise exception 'Invalid YouTube video source'; end if;
    elsif new.external_provider = 'GOOGLE_DRIVE' then
      if new.external_media_id !~ '^[A-Za-z0-9_-]{10,160}$' or new.source_type <> 'GOOGLE_DRIVE'
        or (new.drive_resource_key is not null and new.drive_resource_key !~ '^[A-Za-z0-9_-]{1,200}$')
        or new.external_url <> 'https://drive.google.com/file/d/' || new.external_media_id || '/view' || (case when new.drive_resource_key is null then '' else '?resourcekey=' || new.drive_resource_key end) then raise exception 'Invalid Drive video source'; end if;
    elsif new.external_provider = 'VIMEO' then
      if new.external_media_id !~ '^[0-9]{6,12}$' or new.external_url <> 'https://vimeo.com/' || new.external_media_id then raise exception 'Invalid Vimeo video source'; end if;
    else raise exception 'Unsupported video provider'; end if;
    if coalesce(new.media_subtype,'') not in ('STANDARD_VIDEO','DRONE_VIDEO') then raise exception 'Invalid video type'; end if;
  end if;
  if new.video_photo_id is not null then
    if not exists (select 1 from public.media_assets where id = new.video_photo_id and property_id = new.property_id and media_type = 'IMAGE') then raise exception 'Choose a photo from this property'; end if;
    if exists (select 1 from public.media_assets where id = new.video_photo_id and archived_at is not null) then new.video_photo_id := null; end if;
  end if;
  if new.video_poster_id is not null and not exists (select 1 from public.property_video_posters where id = new.video_poster_id and property_id = new.property_id) then raise exception 'Poster belongs to another property'; end if;
  if TG_OP = 'UPDATE' then
    new.video_revision := old.video_revision + 1;
    if old.archived_at is not null and new.archived_at is null then
      new.visibility := 'ADMIN_ONLY'; new.processing_status := 'READY'; new.approved_at := null;
    end if;
  end if;
  return new;
end;
$$;
create trigger guard_property_video before insert or update on public.media_assets for each row execute function public.guard_property_video();

create function public.manage_property_video(requested_actor_id uuid, requested_property_id uuid, requested_operation text, requested_payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  target uuid := coalesce(nullif(requested_payload->>'id','')::uuid, gen_random_uuid());
  current_row public.media_assets%rowtype;
  replacement jsonb;
  neighbor public.media_assets%rowtype;
  poster jsonb := requested_payload->'poster';
  source jsonb := requested_payload;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise insufficient_privilege using message = 'Service role required'; end if;
  if not exists(select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(requested_property_id::text, 7001));
  if not exists(select 1 from public.properties where id = requested_property_id and deleted_at is null and archived_at is null) then raise exception 'Property not found'; end if;
  if requested_operation <> 'create' then
    select * into current_row from public.media_assets where id = target and property_id = requested_property_id and media_type = 'VIDEO' for update;
    if not found then raise exception 'Video not found on this property'; end if;
    if current_row.video_revision is distinct from (requested_payload->>'revision')::integer then raise exception 'This video changed. Refresh before trying again'; end if;
    if requested_operation <> 'restore' and current_row.archived_at is not null then raise exception 'Video is archived'; end if;
  end if;
  if requested_operation in ('create','edit','replace') then
    if length(trim(coalesce(source->>'title',''))) not between 1 and 120 or length(coalesce(source->>'description','')) > 500 then raise exception 'A title (120 characters maximum) and description (500 maximum) are required'; end if;
    if source->>'provider' not in ('GOOGLE_DRIVE','YOUTUBE') and not (requested_operation = 'edit' and source->>'provider' = current_row.external_provider and source->>'mediaId' = current_row.external_media_id) then raise exception 'Use a Drive or YouTube video'; end if;
    if coalesce(source->>'subtype','') not in ('STANDARD_VIDEO','DRONE_VIDEO') then raise exception 'Invalid video type'; end if;
    if source->>'provider' = 'GOOGLE_DRIVE' and ((source->>'mediaId') !~ '^[A-Za-z0-9_-]{10,160}$' or (source->>'canonicalUrl') is distinct from 'https://drive.google.com/file/d/' || (source->>'mediaId') || '/view' || case when nullif(source->>'resourceKey','') is null then '' else '?resourcekey=' || (source->>'resourceKey') end) then raise exception 'Invalid Drive link'; end if;
    if source->>'provider' = 'YOUTUBE' and ((source->>'mediaId') !~ '^[A-Za-z0-9_-]{11}$' or (source->>'canonicalUrl') is distinct from 'https://www.youtube.com/watch?v=' || (source->>'mediaId')) then raise exception 'Invalid YouTube link'; end if;
    if nullif(source->>'mediaId','') is null or nullif(source->>'provider','') is null or nullif(source->>'canonicalUrl','') is null then raise exception 'Missing video source'; end if;
    if source->>'provider' = 'YOUTUBE' and source->>'resourceKey' is not null then raise exception 'YouTube videos do not use Drive resource keys'; end if;
    if source->>'resourceKey' is not null and source->>'resourceKey' !~ '^[A-Za-z0-9_-]{1,200}$' then raise exception 'Invalid resource key'; end if;
    if nullif(source->>'photoId','') is not null and not exists(select 1 from public.media_assets where id = (source->>'photoId')::uuid and property_id = requested_property_id and media_type = 'IMAGE' and archived_at is null) then raise exception 'Choose a photo from this property'; end if;
    if requested_operation in ('create','replace') and exists(select 1 from public.media_assets where property_id = requested_property_id and media_type = 'VIDEO' and archived_at is null and external_provider = source->>'provider' and external_media_id = source->>'mediaId') then raise exception 'This video is already attached to the property'; end if;
    if poster is not null and poster <> 'null'::jsonb then
      if poster->>'path' <> 'properties/' || requested_property_id || '/video-posters/' || (poster->>'id') || '.webp' then raise exception 'Invalid poster path'; end if;
      insert into public.property_video_posters(id,property_id,object_path,file_size_bytes,created_by)
      values ((poster->>'id')::uuid, requested_property_id, poster->>'path', (poster->>'bytes')::bigint,requested_actor_id);
    end if;
    if requested_operation = 'create' then
      insert into public.media_assets(id,property_id,media_type,external_provider,source_type,external_media_id,external_url,media_subtype,video_title,caption,drive_resource_key,video_photo_id,video_poster_id,sort_order,created_by,updated_by)
      values(target,requested_property_id,'VIDEO',source->>'provider',source->>'provider',source->>'mediaId',source->>'canonicalUrl',source->>'subtype',trim(source->>'title'),nullif(trim(source->>'description'),''),source->>'resourceKey',nullif(source->>'photoId','')::uuid,(poster->>'id')::uuid,coalesce((select max(sort_order)+10 from public.media_assets where property_id=requested_property_id and archived_at is null),10),requested_actor_id,requested_actor_id);
    elsif requested_operation = 'replace' then
      update public.media_assets set pending_video = source, updated_by = requested_actor_id where id = target;
    else
      update public.media_assets set video_title = trim(source->>'title'),caption = nullif(trim(source->>'description'),''),media_subtype = source->>'subtype',video_photo_id = nullif(source->>'photoId','')::uuid,
        video_poster_id = coalesce((poster->>'id')::uuid, case when source->>'clearPoster' = 'true' then null else video_poster_id end), updated_by = requested_actor_id where id = target;
    end if;
  elsif requested_operation = 'approve' then
    replacement := current_row.pending_video;
    if replacement is not null then
      update public.media_assets set external_provider = replacement->>'provider',source_type = replacement->>'provider',external_media_id = replacement->>'mediaId',external_url = replacement->>'canonicalUrl',drive_resource_key = replacement->>'resourceKey',video_title = replacement->>'title',caption = nullif(replacement->>'description',''),media_subtype = replacement->>'subtype',video_photo_id = nullif(replacement->>'photoId','')::uuid,video_poster_id = (replacement->'poster'->>'id')::uuid,pending_video = null,visibility='PUBLIC',processing_status='APPROVED',approved_at=now(),updated_by=requested_actor_id where id=target;
    else
      if nullif(trim(coalesce(current_row.video_title,current_row.caption)), '') is null then raise exception 'Add a title before approval'; end if;
      update public.media_assets set visibility='PUBLIC',processing_status='APPROVED',approved_at=now(),updated_by=requested_actor_id where id=target;
    end if;
  elsif requested_operation = 'discard' then
    update public.media_assets set pending_video=null,updated_by=requested_actor_id where id=target;
  elsif requested_operation = 'hide' then
    update public.media_assets set visibility='ADMIN_ONLY',processing_status='READY',approved_at=null,updated_by=requested_actor_id where id=target;
  elsif requested_operation = 'archive' then
    update public.media_assets set archived_at=now(),updated_by=requested_actor_id where id=target;
  elsif requested_operation = 'restore' then
    if current_row.archived_at is null then raise exception 'Video is already active'; end if;
    update public.media_assets set archived_at=null,pending_video=null,visibility='ADMIN_ONLY',processing_status='READY',approved_at=null,updated_by=requested_actor_id where id=target;
  elsif requested_operation in ('earlier','later') then
    -- Normalize only legacy tied positions before swapping video slots. Photo sequence is preserved.
    if exists (select 1 from public.media_assets where property_id=requested_property_id and archived_at is null group by sort_order having count(*)>1) then
      update public.media_assets m set sort_order=ordered.position*10,updated_by=requested_actor_id
      from (select id,row_number() over(order by sort_order,id) as position from public.media_assets where property_id=requested_property_id and archived_at is null) ordered where m.id=ordered.id;
      select * into current_row from public.media_assets where id=target;
    end if;
    select * into neighbor from public.media_assets where property_id=requested_property_id and media_type='VIDEO' and archived_at is null and
      case when requested_operation='earlier' then (sort_order,id)<(current_row.sort_order,current_row.id) else (sort_order,id)>(current_row.sort_order,current_row.id) end
      order by case when requested_operation='earlier' then -sort_order else sort_order end, id limit 1 for update;
    if found then
      update public.media_assets set sort_order=neighbor.sort_order,updated_by=requested_actor_id where id=target;
      update public.media_assets set sort_order=current_row.sort_order,updated_by=requested_actor_id where id=neighbor.id;
    end if;
  else raise exception 'Unsupported video operation'; end if;
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,after_state,reason)
  values(requested_actor_id,case when requested_operation='create' then 'CREATE'::public.audit_action else 'UPDATE'::public.audit_action end,'media_asset',target,array['video'],jsonb_build_object('operation',requested_operation,'propertyId',requested_property_id),'Property video workflow');
  return target;
end;
$$;
revoke all on function public.manage_property_video(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.manage_property_video(uuid,uuid,text,jsonb) to service_role;

create or replace function public.reorder_property_media(requested_actor_id uuid, requested_property_id uuid, requested_media_ids uuid[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare supplied_count integer; active_count integer;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise insufficient_privilege using message = 'Service role required'; end if;
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then raise insufficient_privilege using message = 'Active admin actor required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(requested_property_id::text, 7001));
  -- Photo ordering supplies the full collection. It must preserve the current video sequence.
  if (select array_agg(m.id order by ordered.ordinality) from unnest(requested_media_ids) with ordinality ordered(id,ordinality) join public.media_assets m on m.id=ordered.id where m.property_id=requested_property_id and m.media_type='VIDEO' and m.archived_at is null)
    is distinct from (select array_agg(id order by sort_order,id) from public.media_assets where property_id=requested_property_id and media_type='VIDEO' and archived_at is null) then
    raise exception 'The video order changed. Refresh before reordering photos';
  end if;
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

create or replace function public.get_storage_usage_bytes() returns bigint language sql stable security definer set search_path='' as $$
 select coalesce((select sum(file_size_bytes) from public.media_assets where storage_bucket is not null),0)
 + coalesce((select sum(file_size_bytes) from public.private_documents),0)
 + coalesce((select sum(file_size_bytes) from public.property_video_posters),0);
$$;

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

create or replace view public.public_property_media with (security_invoker=false) as
select ma.id,ma.property_id,ma.media_type,ma.object_path,ma.mime_type,ma.width_px,ma.height_px,ma.duration_seconds,ma.alt_text,ma.caption,ma.is_cover,ma.sort_order,ma.external_url,ma.external_provider,ma.external_media_id,ma.media_subtype,
 ma.video_title,ma.drive_resource_key,coalesce(poster.object_path,photo.object_path) as video_poster_path
from public.media_assets ma
join public.properties p on p.id=ma.property_id
left join public.property_video_posters poster on poster.id=ma.video_poster_id and poster.property_id=ma.property_id
left join public.media_assets photo on photo.id=ma.video_photo_id and photo.property_id=ma.property_id and photo.media_type='IMAGE' and photo.archived_at is null and photo.visibility='PUBLIC' and photo.processing_status='APPROVED' and photo.storage_bucket='property-media-public'
where p.publication_status='PUBLISHED' and p.deleted_at is null and p.archived_at is null and ma.visibility='PUBLIC' and ma.archived_at is null and ma.processing_status='APPROVED' and ma.approved_at is not null and (ma.storage_bucket='property-media-public' or (ma.external_url is not null and ma.external_provider is not null));
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


revoke all on function public.guard_property_video() from public,anon,authenticated;
