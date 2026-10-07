-- Add an intentionally public Google Maps embed URL without changing or
-- backfilling the existing private/public coordinate model.

alter table public.properties
  add column google_maps_embed_url text null;

alter table public.properties
  add constraint properties_google_maps_embed_url_check
  check (
    google_maps_embed_url is null
    or (
      length(google_maps_embed_url) <= 12000
      and google_maps_embed_url ~ '^https://www[.]google[.]com/maps/embed([/?].*)?$'
    )
  );

comment on column public.properties.google_maps_embed_url is
  'Validated public Google Maps embed src only. Never stores iframe HTML.';

-- Keep the existing, audited draft transaction intact and wrap it so the new
-- field is saved atomically. Renaming preserves all historical draft logic.
alter function public.save_property_draft(uuid, timestamptz, uuid, jsonb)
  rename to save_property_draft_core;

revoke all on function public.save_property_draft_core(uuid, timestamptz, uuid, jsonb)
  from public, anon, authenticated, service_role;

create function public.save_property_draft(
  requested_property_id uuid default null,
  requested_expected_updated_at timestamptz default null,
  requested_actor_id uuid default null,
  requested_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
  payload_with_preserved_location jsonb := requested_payload;
  preserved_location jsonb;
begin
  if requested_payload -> 'location' is null then
    if requested_property_id is null then
      preserved_location := jsonb_build_object('visibility', 'APPROXIMATE');
    else
      select jsonb_build_object(
        'visibility', location_visibility,
        'privateLatitude', private_latitude,
        'privateLongitude', private_longitude,
        'publicLatitude', public_latitude,
        'publicLongitude', public_longitude,
        'publicAccuracyMetres', public_accuracy_m,
        'locationNotes', location_notes
      )
      into preserved_location
      from public.property_locations
      where property_id = requested_property_id;

      if preserved_location is null then
        preserved_location := jsonb_build_object('visibility', 'APPROXIMATE');
      end if;
    end if;

    payload_with_preserved_location := jsonb_set(
      requested_payload,
      '{location}',
      preserved_location,
      true
    );
  end if;

  target_id := public.save_property_draft_core(
    requested_property_id,
    requested_expected_updated_at,
    requested_actor_id,
    payload_with_preserved_location
  );

  if requested_payload ? 'googleMapsEmbedUrl' then
    update public.properties
    set google_maps_embed_url = nullif(btrim(requested_payload ->> 'googleMapsEmbedUrl'), '')
    where id = target_id;
  end if;

  return target_id;
end;
$$;

revoke all on function public.save_property_draft(uuid, timestamptz, uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.save_property_draft(uuid, timestamptz, uuid, jsonb)
  to service_role;

comment on function public.save_property_draft(uuid, timestamptz, uuid, jsonb) is
  'Atomic property draft save including a validated Google Maps embed src.';
comment on function public.save_property_draft_core(uuid, timestamptz, uuid, jsonb) is
  'Internal implementation retained from M6; callable only by the public save_property_draft wrapper.';

-- A dedicated public projection keeps the map detail-only and prevents hidden
-- location records from exposing an embed URL.
grant create on schema public to urbanedge_public_projection;

create view public.public_property_google_maps
with (security_invoker = false)
as
select
  property.id as property_id,
  property.google_maps_embed_url
from public.properties property
left join public.property_locations location on location.property_id = property.id
where property.publication_status = 'PUBLISHED'
  and property.deleted_at is null
  and property.archived_at is null
  and property.google_maps_embed_url is not null
  and coalesce(location.location_visibility, property.location_visibility) <> 'HIDDEN';

alter view public.public_property_google_maps owner to urbanedge_public_projection;
revoke create on schema public from urbanedge_public_projection;

comment on view public.public_property_google_maps is
  'Detail-only public Google Maps embed sources. Hidden locations and all private coordinate data are excluded.';

grant select on public.public_property_google_maps to anon, authenticated, service_role;
