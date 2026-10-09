-- Allow admins to update active and previously unpublished properties through
-- the existing atomic save transaction. Archived rows remain protected until
-- they are explicitly restored through the lifecycle workflow.
--
-- The core function was introduced in M6 and renamed (without changing its
-- body) when Google Maps support added a validating wrapper. Rewriting only
-- the two obsolete M6 fragments keeps every concurrency, detail-sync, and
-- audit behavior in that function intact.
do $migration$
declare
  core_definition text;
  updated_definition text;
  old_status_guard constant text := $old$
    if current_row.publication_status <> 'DRAFT' then
      raise exception 'Only DRAFT properties may be edited in M6';
    end if;$old$;
  new_status_guard constant text := $new$
    if current_row.publication_status = 'ARCHIVED' or current_row.archived_at is not null then
      raise exception 'Archived properties cannot be edited directly. Restore the property first.';
    end if;$new$;
  old_audit_status constant text := $old$'publicationStatus', 'DRAFT'$old$;
  new_audit_status constant text := $new$
      'publicationStatus', coalesce(
        current_row.publication_status,
        'DRAFT'::public.property_publication_status
      )$new$;
  old_slug_assignment constant text := $old$
      public_slug = nullif(trim(requested_payload ->> 'publicSlug'), ''),$old$;
  intermediate_slug_assignment constant text := $old$
      public_slug = case
        when nullif(trim(requested_payload ->> 'publicSlug'), '') is not null
          then trim(requested_payload ->> 'publicSlug')
        when nullif(trim(requested_payload ->> 'listingTitle'), '') is not null
          then trim(both '-' from regexp_replace(
            lower(trim(requested_payload ->> 'listingTitle')),
            '[^a-z0-9]+',
            '-',
            'g'
          )) || '-' || lower(target_code)
        else null
      end,$old$;
  new_slug_assignment constant text := $new$
      public_slug = case
        when nullif(trim(requested_payload ->> 'publicSlug'), '') is not null
          then trim(requested_payload ->> 'publicSlug')
        when nullif(trim(requested_payload ->> 'listingTitle'), '') is not null
          then trim(both '-' from regexp_replace(
            lower(trim(requested_payload ->> 'listingTitle')),
            '[^a-z0-9]+',
            '-',
            'g'
          )) || '-' || lower(current_row.property_code)
        else null
      end,$new$;
begin
  select pg_get_functiondef(
    'public.save_property_draft_core(uuid,timestamptz,uuid,jsonb)'::regprocedure
  ) into core_definition;

  if strpos(core_definition, old_status_guard) > 0 then
    updated_definition := replace(core_definition, old_status_guard, new_status_guard);
  elsif strpos(core_definition, new_status_guard) > 0 then
    updated_definition := core_definition;
  else
    raise exception 'Expected legacy save_property_draft_core status guard was not found';
  end if;

  if strpos(updated_definition, old_audit_status) > 0 then
    updated_definition := replace(updated_definition, old_audit_status, new_audit_status);
  elsif strpos(updated_definition, new_audit_status) = 0 then
    raise exception 'Expected legacy save_property_draft_core audit status was not found';
  end if;

  if strpos(updated_definition, old_slug_assignment) > 0 then
    updated_definition := replace(updated_definition, old_slug_assignment, new_slug_assignment);
  elsif strpos(updated_definition, intermediate_slug_assignment) > 0 then
    updated_definition := replace(
      updated_definition,
      intermediate_slug_assignment,
      new_slug_assignment
    );
  elsif strpos(updated_definition, new_slug_assignment) = 0 then
    raise exception 'Expected legacy save_property_draft_core slug assignment was not found';
  end if;

  execute updated_definition;
end;
$migration$;

revoke all on function public.save_property_draft_core(uuid, timestamptz, uuid, jsonb)
  from public, anon, authenticated, service_role;

comment on function public.save_property_draft_core(uuid, timestamptz, uuid, jsonb) is
  'Internal property save implementation. Active properties are editable; archived properties must be restored first.';
