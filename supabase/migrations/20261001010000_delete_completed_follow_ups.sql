alter table public.site_visit_events
  drop constraint site_visit_events_follow_up_id_fkey,
  add constraint site_visit_events_follow_up_id_fkey
    foreign key (follow_up_id) references public.lead_follow_ups(id) on delete set null;

create function public.delete_completed_lead_follow_up(
  requested_actor_id uuid,
  requested_follow_up_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_lead_id uuid;
begin
  if not exists (
    select 1
    from public.admin_profiles
    where user_id = requested_actor_id and is_active
  ) then
    raise insufficient_privilege;
  end if;

  select lead_id
  into target_lead_id
  from public.lead_follow_ups
  where id = requested_follow_up_id and completed_at is not null
  for update;

  if target_lead_id is null then
    raise exception 'COMPLETED_FOLLOW_UP_NOT_FOUND';
  end if;

  delete from public.lead_follow_ups
  where id = requested_follow_up_id;

  insert into public.audit_logs(
    actor_admin_id,
    action,
    entity_type,
    entity_id,
    changed_fields,
    before_state,
    reason
  ) values (
    requested_actor_id,
    'DELETE',
    'lead_follow_up',
    requested_follow_up_id,
    array['completed_follow_up'],
    jsonb_build_object('lead_id', target_lead_id, 'completed', true),
    'Admin deleted one completed follow-up record'
  );

  return target_lead_id;
end;
$$;

revoke all on function public.delete_completed_lead_follow_up(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.delete_completed_lead_follow_up(uuid, uuid)
  to service_role;

comment on function public.delete_completed_lead_follow_up(uuid, uuid) is
  'Deletes exactly one completed CRM follow-up for an active admin while preserving its lead and any linked site-visit event.';
