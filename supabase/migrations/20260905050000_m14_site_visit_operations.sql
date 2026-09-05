-- M14: private site-visit operations, append-only schedule history and CRM synchronization.

alter table public.site_visits
  add column version bigint not null default 1 check (version > 0),
  add column timezone varchar(64) not null default 'Asia/Kolkata' check (timezone = 'Asia/Kolkata'),
  add column meeting_instructions text,
  add column assigned_to uuid references public.admin_profiles(user_id) on delete restrict,
  add column contact_outcome varchar(240),
  add column cancelled_at timestamptz,
  add column cancellation_reason varchar(500),
  add column no_show_at timestamptz;

alter table public.lead_follow_ups
  add column site_visit_id uuid references public.site_visits(id) on delete restrict;

create table public.site_visit_events (
  id uuid primary key default gen_random_uuid(),
  site_visit_id uuid not null references public.site_visits(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  event_type varchar(40) not null check (event_type in (
    'REQUESTED','CONTACTED','PROPOSED','CONFIRMED','RESCHEDULED','COMPLETED',
    'CANCELLED','NO_SHOW','NOTE_ADDED','FOLLOW_UP_LINKED'
  )),
  from_status public.site_visit_status,
  to_status public.site_visit_status,
  previous_start_at timestamptz,
  previous_end_at timestamptz,
  new_start_at timestamptz,
  new_end_at timestamptz,
  reason varchar(500),
  note text,
  follow_up_id uuid references public.lead_follow_ups(id) on delete restrict,
  actor_admin_id uuid references public.admin_profiles(user_id) on delete restrict,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check ((from_status is null and to_status is null) or to_status is not null)
);

create index site_visits_operations_queue_idx
  on public.site_visits(status, confirmed_start_at, proposed_start_at, requested_start_at)
  where archived_at is null;
create index site_visits_assignee_idx on public.site_visits(assigned_to, updated_at desc)
  where archived_at is null;
create index site_visit_events_timeline_idx on public.site_visit_events(site_visit_id, occurred_at desc);
create index site_visit_events_lead_idx on public.site_visit_events(lead_id, occurred_at desc);
create index lead_follow_ups_site_visit_idx on public.lead_follow_ups(site_visit_id, created_at desc)
  where site_visit_id is not null;

insert into public.site_visit_events(
  site_visit_id,lead_id,property_id,event_type,to_status,new_start_at,new_end_at,note,occurred_at,created_at
)
select id,lead_id,property_id,'REQUESTED','REQUESTED',requested_start_at,requested_end_at,
  'Visit request accepted; manual coordination required',created_at,created_at
from public.site_visits;

create function public.record_site_visit_request_event()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status='REQUESTED' then
    insert into public.site_visit_events(
      site_visit_id,lead_id,property_id,event_type,to_status,new_start_at,new_end_at,note,occurred_at,created_at
    ) values(
      new.id,new.lead_id,new.property_id,'REQUESTED','REQUESTED',new.requested_start_at,new.requested_end_at,
      'Visit request accepted; manual coordination required',new.created_at,new.created_at
    );
  end if;
  return new;
end; $$;
create trigger site_visit_request_event_after_insert
after insert on public.site_visits for each row execute function public.record_site_visit_request_event();
revoke all on function public.record_site_visit_request_event() from public,anon,authenticated;

alter table public.site_visit_events enable row level security;
create policy active_admin_select on public.site_visit_events for select to authenticated
  using ((select public.is_active_admin()));
revoke all on public.site_visit_events from anon, authenticated;
grant select on public.site_visit_events to authenticated;
grant all on public.site_visit_events to service_role;

create function public.transition_site_visit(
  requested_actor_id uuid,
  requested_visit_id uuid,
  requested_expected_version bigint,
  requested_next_status public.site_visit_status,
  requested_payload jsonb default '{}'::jsonb
) returns bigint language plpgsql security definer set search_path = '' as $$
declare
  current_visit public.site_visits%rowtype;
  current_lead_status public.lead_status;
  next_lead_status public.lead_status;
  property_available boolean;
  proposed_start timestamptz;
  proposed_end timestamptz;
  event_start timestamptz;
  event_end timestamptz;
  reason_value text:=nullif(trim(requested_payload->>'reason'),'');
  note_value text:=nullif(trim(requested_payload->>'note'),'');
  outcome_value text:=nullif(trim(requested_payload->>'outcome'),'');
  contact_value text:=nullif(trim(requested_payload->>'contactOutcome'),'');
  instructions_value text:=nullif(trim(requested_payload->>'meetingInstructions'),'');
  allowed boolean:=false;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then
    raise insufficient_privilege using message='Active admin actor required';
  end if;
  select * into current_visit from public.site_visits
    where id=requested_visit_id and archived_at is null for update;
  if not found then raise exception 'SITE_VISIT_NOT_FOUND'; end if;
  if requested_expected_version<>current_visit.version then
    raise exception using errcode='P0409',message='STALE_SITE_VISIT';
  end if;
  if requested_next_status::text='FOLLOW_UP_REQUIRED' then raise exception 'INVALID_SITE_VISIT_STATUS'; end if;

  allowed:=case current_visit.status
    when 'REQUESTED' then requested_next_status in ('CONTACTED','CANCELLED')
    when 'CONTACTED' then requested_next_status in ('PROPOSED','CANCELLED')
    when 'PROPOSED' then requested_next_status in ('CONFIRMED','RESCHEDULED','CANCELLED')
    when 'CONFIRMED' then requested_next_status in ('COMPLETED','RESCHEDULED','CANCELLED','NO_SHOW')
    when 'RESCHEDULED' then requested_next_status in ('CONFIRMED','RESCHEDULED','CANCELLED')
    when 'NO_SHOW' then requested_next_status in ('RESCHEDULED','CANCELLED')
    else false end;
  if not allowed then
    raise exception using errcode='P0400',message=format('SITE_VISIT_TRANSITION_NOT_ALLOWED:%s_TO_%s',current_visit.status,requested_next_status);
  end if;

  select p.deleted_at is null and p.archived_at is null and p.publication_status='PUBLISHED'
    and p.availability_status in ('AVAILABLE','UNDER_NEGOTIATION') into property_available
    from public.properties p where p.id=current_visit.property_id;
  if requested_next_status in ('PROPOSED','CONFIRMED','RESCHEDULED') and coalesce(property_available,false) is not true then
    raise exception 'PROPERTY_NOT_VISITABLE';
  end if;

  if requested_next_status='CONTACTED' and (contact_value is null or length(contact_value)>240) then
    raise exception 'CONTACT_OUTCOME_REQUIRED';
  end if;
  if requested_next_status in ('PROPOSED','RESCHEDULED') then
    if nullif(requested_payload->>'startAt','') is null or nullif(requested_payload->>'endAt','') is null then
      raise exception 'VISIT_SLOT_REQUIRED';
    end if;
    proposed_start:=(requested_payload->>'startAt')::timestamptz;
    proposed_end:=(requested_payload->>'endAt')::timestamptz;
    if proposed_start<=now() or proposed_end<=proposed_start then raise exception 'INVALID_FUTURE_VISIT_SLOT'; end if;
    if coalesce(requested_payload->>'timezone','Asia/Kolkata')<>'Asia/Kolkata' then raise exception 'INVALID_VISIT_TIMEZONE'; end if;
  end if;
  if requested_next_status='RESCHEDULED' and (reason_value is null or length(reason_value)>500) then
    raise exception 'RESCHEDULE_REASON_REQUIRED';
  end if;
  if requested_next_status='CONFIRMED' then
    if current_visit.proposed_start_at is null or current_visit.proposed_end_at is null
      or current_visit.proposed_start_at<=now() or current_visit.proposed_end_at<=current_visit.proposed_start_at then
      raise exception 'VALID_PROPOSED_SLOT_REQUIRED';
    end if;
  end if;
  if requested_next_status='CANCELLED' and (reason_value is null or length(reason_value)>500) then
    raise exception 'CANCELLATION_REASON_REQUIRED';
  end if;
  if requested_next_status='COMPLETED' and (
    current_visit.confirmed_start_at is null or current_visit.confirmed_start_at>now()
    or outcome_value is null or length(outcome_value)>80
  ) then raise exception 'COMPLETION_OUTCOME_REQUIRED_AFTER_VISIT'; end if;
  if requested_next_status='NO_SHOW' and (
    current_visit.confirmed_start_at is null or current_visit.confirmed_start_at>now()
  ) then raise exception 'NO_SHOW_REQUIRES_PAST_CONFIRMED_VISIT'; end if;
  if note_value is not null and length(note_value)>5000 then raise exception 'VISIT_NOTE_TOO_LONG'; end if;
  if instructions_value is not null and length(instructions_value)>2000 then raise exception 'MEETING_INSTRUCTIONS_TOO_LONG'; end if;

  event_start:=coalesce(current_visit.confirmed_start_at,current_visit.proposed_start_at,current_visit.requested_start_at);
  event_end:=coalesce(current_visit.confirmed_end_at,current_visit.proposed_end_at,current_visit.requested_end_at);

  update public.site_visits set
    status=requested_next_status,
    contacted_at=case when requested_next_status='CONTACTED' then now() else contacted_at end,
    contact_outcome=case when requested_next_status='CONTACTED' then contact_value else contact_outcome end,
    proposed_start_at=case when requested_next_status in ('PROPOSED','RESCHEDULED') then proposed_start else proposed_start_at end,
    proposed_end_at=case when requested_next_status in ('PROPOSED','RESCHEDULED') then proposed_end else proposed_end_at end,
    confirmed_start_at=case when requested_next_status='CONFIRMED' then proposed_start_at when requested_next_status='RESCHEDULED' then null else confirmed_start_at end,
    confirmed_end_at=case when requested_next_status='CONFIRMED' then proposed_end_at when requested_next_status='RESCHEDULED' then null else confirmed_end_at end,
    meeting_instructions=case when requested_next_status in ('PROPOSED','RESCHEDULED') then instructions_value else meeting_instructions end,
    completed_at=case when requested_next_status='COMPLETED' then now() else completed_at end,
    outcome=case when requested_next_status in ('COMPLETED','NO_SHOW') then coalesce(outcome_value,case when requested_next_status='NO_SHOW' then 'NO_SHOW' end) else outcome end,
    cancelled_at=case when requested_next_status='CANCELLED' then now() else cancelled_at end,
    cancellation_reason=case when requested_next_status='CANCELLED' then reason_value else cancellation_reason end,
    no_show_at=case when requested_next_status='NO_SHOW' then now() else no_show_at end,
    assigned_to=coalesce(assigned_to,requested_actor_id),updated_by=requested_actor_id,updated_at=now(),version=version+1
    where id=current_visit.id;

  insert into public.site_visit_events(site_visit_id,lead_id,property_id,event_type,from_status,to_status,
    previous_start_at,previous_end_at,new_start_at,new_end_at,reason,note,actor_admin_id)
  values(current_visit.id,current_visit.lead_id,current_visit.property_id,requested_next_status::text,
    current_visit.status,requested_next_status,event_start,event_end,
    case when requested_next_status in ('PROPOSED','RESCHEDULED') then proposed_start when requested_next_status='CONFIRMED' then current_visit.proposed_start_at else event_start end,
    case when requested_next_status in ('PROPOSED','RESCHEDULED') then proposed_end when requested_next_status='CONFIRMED' then current_visit.proposed_end_at else event_end end,
    reason_value,note_value,requested_actor_id);

  insert into public.lead_activities(lead_id,activity_type,property_id,actor_admin_id,note,metadata_text)
  values(current_visit.lead_id,
    case requested_next_status when 'CONTACTED' then 'CONTACT_ATTEMPTED'::public.lead_activity_type
      when 'CONFIRMED' then 'SITE_VISIT_CONFIRMED'::public.lead_activity_type
      when 'COMPLETED' then 'SITE_VISIT_COMPLETED'::public.lead_activity_type
      else 'STATUS_CHANGED'::public.lead_activity_type end,
    current_visit.property_id,requested_actor_id,coalesce(note_value,reason_value,contact_value,outcome_value),
    current_visit.status::text||' → '||requested_next_status::text||' · '||current_visit.visit_reference);

  select status into current_lead_status from public.leads where id=current_visit.lead_id for update;
  next_lead_status:=current_lead_status;
  if requested_next_status='CONTACTED' and current_lead_status in ('NEW','CONTACT_ATTEMPTED','QUALIFIED','REQUIREMENT_CONFIRMED','PROPERTY_MATCHED') then
    next_lead_status:='SITE_VISIT_REQUESTED';
  elsif requested_next_status='CONFIRMED' and current_lead_status='SITE_VISIT_REQUESTED' then
    next_lead_status:='SITE_VISIT_CONFIRMED';
  elsif requested_next_status='COMPLETED' and current_lead_status='SITE_VISIT_CONFIRMED' then
    next_lead_status:='SITE_VISIT_COMPLETED';
  elsif requested_next_status in ('RESCHEDULED','NO_SHOW') and current_lead_status='SITE_VISIT_CONFIRMED' then
    next_lead_status:='SITE_VISIT_REQUESTED';
  elsif requested_next_status='CANCELLED' and current_lead_status in ('SITE_VISIT_REQUESTED','SITE_VISIT_CONFIRMED') then
    next_lead_status:='PROPERTY_MATCHED';
  end if;
  if next_lead_status<>current_lead_status then
    update public.leads set status=next_lead_status,
      last_contacted_at=case when requested_next_status='CONTACTED' then now() else last_contacted_at end,
      updated_at=now(),updated_by=requested_actor_id where id=current_visit.lead_id;
    insert into public.lead_activities(lead_id,activity_type,property_id,actor_admin_id,note,metadata_text)
      values(current_visit.lead_id,'STATUS_CHANGED',current_visit.property_id,requested_actor_id,
        'Site-visit operational milestone',current_lead_status::text||' → '||next_lead_status::text);
    insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state)
      values(requested_actor_id,'STATUS_CHANGE','lead',current_visit.lead_id,array['status'],
        jsonb_build_object('status',current_lead_status),jsonb_build_object('status',next_lead_status));
  end if;
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
    values(requested_actor_id,'STATUS_CHANGE','site_visit',current_visit.id,array['status','schedule','outcome'],
      jsonb_build_object('status',current_visit.status,'version',current_visit.version),
      jsonb_build_object('status',requested_next_status,'version',current_visit.version+1),null);
  return current_visit.version+1;
end; $$;

create function public.add_site_visit_note(
  requested_actor_id uuid, requested_visit_id uuid, requested_expected_version bigint, requested_note text
) returns bigint language plpgsql security definer set search_path = '' as $$
declare current_visit public.site_visits%rowtype;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege; end if;
  select * into current_visit from public.site_visits where id=requested_visit_id and archived_at is null for update;
  if not found then raise exception 'SITE_VISIT_NOT_FOUND'; end if;
  if requested_expected_version<>current_visit.version then raise exception using errcode='P0409',message='STALE_SITE_VISIT'; end if;
  if nullif(trim(requested_note),'') is null or length(trim(requested_note))>5000 then raise exception 'VALID_VISIT_NOTE_REQUIRED'; end if;
  update public.site_visits set version=version+1,updated_at=now(),updated_by=requested_actor_id where id=current_visit.id;
  insert into public.site_visit_events(site_visit_id,lead_id,property_id,event_type,note,actor_admin_id)
    values(current_visit.id,current_visit.lead_id,current_visit.property_id,'NOTE_ADDED',trim(requested_note),requested_actor_id);
  insert into public.lead_activities(lead_id,activity_type,property_id,actor_admin_id,note,metadata_text)
    values(current_visit.lead_id,'NOTE_ADDED',current_visit.property_id,requested_actor_id,trim(requested_note),current_visit.visit_reference);
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,after_state)
    values(requested_actor_id,'UPDATE','site_visit',current_visit.id,array['operational_note'],jsonb_build_object('version',current_visit.version+1));
  return current_visit.version+1;
end; $$;

create function public.schedule_site_visit_follow_up(
  requested_actor_id uuid, requested_visit_id uuid, requested_expected_version bigint,
  requested_due_at timestamptz, requested_type varchar, requested_context varchar default null, requested_note text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare current_visit public.site_visits%rowtype; target_follow_up_id uuid;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege; end if;
  select * into current_visit from public.site_visits where id=requested_visit_id and archived_at is null for update;
  if not found then raise exception 'SITE_VISIT_NOT_FOUND'; end if;
  if requested_expected_version<>current_visit.version then raise exception using errcode='P0409',message='STALE_SITE_VISIT'; end if;
  if current_visit.status not in ('COMPLETED','NO_SHOW','CANCELLED') then raise exception 'FOLLOW_UP_REQUIRES_VISIT_OUTCOME'; end if;
  if requested_due_at<=now() then raise exception 'FUTURE_FOLLOW_UP_REQUIRED'; end if;
  if requested_type not in ('CALL','WHATSAPP','EMAIL','SITE_VISIT_CONFIRMATION','PROPERTY_CHECK','OWNER_UPDATE','NEGOTIATION','DOCUMENT_CHECK','GENERAL') then raise exception 'INVALID_FOLLOW_UP_TYPE'; end if;
  insert into public.lead_follow_ups(lead_id,site_visit_id,follow_up_type,context,note,due_at,created_by)
    values(current_visit.lead_id,current_visit.id,requested_type,nullif(trim(requested_context),''),nullif(trim(requested_note),''),requested_due_at,requested_actor_id)
    returning id into target_follow_up_id;
  update public.leads set next_follow_up_at=requested_due_at,updated_at=now(),updated_by=requested_actor_id where id=current_visit.lead_id;
  update public.site_visits set version=version+1,updated_at=now(),updated_by=requested_actor_id where id=current_visit.id;
  insert into public.site_visit_events(site_visit_id,lead_id,property_id,event_type,follow_up_id,actor_admin_id)
    values(current_visit.id,current_visit.lead_id,current_visit.property_id,'FOLLOW_UP_LINKED',target_follow_up_id,requested_actor_id);
  insert into public.lead_activities(lead_id,activity_type,property_id,actor_admin_id,note,metadata_text)
    values(current_visit.lead_id,'FOLLOW_UP_SCHEDULED',current_visit.property_id,requested_actor_id,nullif(trim(requested_note),''),requested_type||' · '||requested_due_at::text);
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,after_state)
    values(requested_actor_id,'UPDATE','site_visit',current_visit.id,array['follow_up_link'],jsonb_build_object('version',current_visit.version+1));
  return target_follow_up_id;
end; $$;

revoke all on function public.transition_site_visit(uuid,uuid,bigint,public.site_visit_status,jsonb) from public,anon,authenticated;
revoke all on function public.add_site_visit_note(uuid,uuid,bigint,text) from public,anon,authenticated;
revoke all on function public.schedule_site_visit_follow_up(uuid,uuid,bigint,timestamptz,varchar,varchar,text) from public,anon,authenticated;
grant execute on function public.transition_site_visit(uuid,uuid,bigint,public.site_visit_status,jsonb) to service_role;
grant execute on function public.add_site_visit_note(uuid,uuid,bigint,text) to service_role;
grant execute on function public.schedule_site_visit_follow_up(uuid,uuid,bigint,timestamptz,varchar,varchar,text) to service_role;

comment on table public.site_visit_events is 'M14 append-only private operational and schedule history; CRM follow-up remains separate per ADR-0001.';
comment on function public.transition_site_visit is 'M14 atomic admin-only visit transition with optimistic concurrency, CRM activity/stage sync and audit.';
