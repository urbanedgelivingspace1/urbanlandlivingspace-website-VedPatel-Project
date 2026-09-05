-- M12: private brokerage CRM services, exact milestone pipeline, and structured follow-ups.

alter type public.lead_status rename to lead_status_legacy;
create type public.lead_status as enum (
  'NEW','CONTACT_ATTEMPTED','QUALIFIED','REQUIREMENT_CONFIRMED','PROPERTY_MATCHED',
  'SITE_VISIT_REQUESTED','SITE_VISIT_CONFIRMED','SITE_VISIT_COMPLETED','NEGOTIATION',
  'NURTURE','CLOSED_WON','CLOSED_LOST'
);
alter table public.leads alter column status drop default;
alter table public.leads alter column status type public.lead_status using (
  case status::text
    when 'WON' then 'CLOSED_WON'
    when 'LOST' then 'CLOSED_LOST'
    when 'CLOSED' then 'CLOSED_LOST'
    else status::text
  end::public.lead_status
);
alter table public.leads alter column status set default 'NEW';
drop type public.lead_status_legacy;

alter type public.lead_activity_type add value 'EMAIL_INTERACTION';
alter type public.lead_activity_type add value 'FOLLOW_UP_COMPLETED';
alter type public.lead_activity_type add value 'PROPERTY_REJECTED';
alter type public.lead_activity_type add value 'PROPERTY_UNMATCHED';
alter type public.lead_activity_type add value 'CLOSED_WON';
alter type public.lead_activity_type add value 'CLOSED_LOST';

create table public.lead_follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  follow_up_type varchar(40) not null check (follow_up_type in (
    'CALL','WHATSAPP','EMAIL','SITE_VISIT_CONFIRMATION','PROPERTY_CHECK',
    'OWNER_UPDATE','NEGOTIATION','DOCUMENT_CHECK','GENERAL'
  )),
  context varchar(160),
  note text,
  due_at timestamptz not null,
  completed_at timestamptz,
  completed_by uuid references public.admin_profiles(user_id) on delete restrict,
  outcome varchar(240),
  created_at timestamptz not null default now(),
  created_by uuid not null references public.admin_profiles(user_id) on delete restrict,
  check ((completed_at is null) = (completed_by is null))
);
create unique index lead_follow_ups_one_open_uidx on public.lead_follow_ups(lead_id) where completed_at is null;
create index lead_follow_ups_queue_idx on public.lead_follow_ups(completed_at, due_at);
create index lead_follow_ups_lead_idx on public.lead_follow_ups(lead_id, created_at desc);

alter table public.lead_follow_ups enable row level security;
create policy active_admin_select on public.lead_follow_ups for select to authenticated
  using ((select public.is_active_admin()));
revoke all on public.lead_follow_ups from anon, authenticated;
grant select on public.lead_follow_ups to authenticated;
grant all on public.lead_follow_ups to service_role;

create index parties_phone_normalized_idx on public.parties ((regexp_replace(phone, '[^0-9]', '', 'g'))) where phone is not null;
create index parties_email_normalized_idx on public.parties ((lower(trim(email)))) where email is not null;
create index leads_crm_filter_idx on public.leads(status, land_category, preferred_transaction, created_at desc) where archived_at is null;

create function public.create_admin_lead(requested_actor_id uuid, requested_payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target_party_id uuid; target_lead_id uuid; matching_party_count integer;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then
    raise insufficient_privilege using message='Active admin actor required';
  end if;
  if nullif(trim(requested_payload->>'name'),'') is null
    or (nullif(trim(requested_payload->>'phone'),'') is null and nullif(trim(requested_payload->>'email'),'') is null) then
    raise exception 'Name and at least one contact method are required';
  end if;
  select count(*)::integer, min(id::text)::uuid into matching_party_count, target_party_id from public.parties
  where archived_at is null and (
    (nullif(trim(requested_payload->>'phone'),'') is not null and phone=nullif(trim(requested_payload->>'phone'),''))
    or (nullif(trim(requested_payload->>'email'),'') is not null and lower(trim(email))=lower(trim(requested_payload->>'email')))
  );
  if matching_party_count <> 1 then target_party_id := null; end if;
  if target_party_id is null then
    insert into public.parties(party_type,display_name,phone,email,created_by,updated_by)
    values ('INDIVIDUAL',trim(requested_payload->>'name'),nullif(trim(requested_payload->>'phone'),''),
      nullif(lower(trim(requested_payload->>'email')),''),requested_actor_id,requested_actor_id)
    returning id into target_party_id;
  end if;
  insert into public.leads(party_id,source_type,source_detail,inquiry_type,buyer_type,preferred_transaction,
    land_category,budget_min,budget_max,budget_currency,district_id,subdistrict_id,place_id,locality_text,
    intended_use,status,assigned_to,notes_internal,created_by,updated_by)
  values (target_party_id,upper(trim(requested_payload->>'sourceType')),nullif(trim(requested_payload->>'sourceDetail'),''),
    coalesce((requested_payload->>'inquiryType')::public.lead_inquiry_type,'GENERAL_CONTACT'),
    nullif(requested_payload->>'buyerType','')::public.buyer_type,
    nullif(requested_payload->>'preferredTransaction','')::public.transaction_type,
    nullif(requested_payload->>'landCategory','')::public.land_category,
    nullif(requested_payload->>'budgetMin','')::numeric,nullif(requested_payload->>'budgetMax','')::numeric,
    case when requested_payload ? 'budgetMin' or requested_payload ? 'budgetMax' then 'INR' else null end,
    nullif(requested_payload->>'districtId','')::uuid,nullif(requested_payload->>'subdistrictId','')::uuid,
    nullif(requested_payload->>'placeId','')::uuid,nullif(trim(requested_payload->>'localityText'),''),
    nullif(trim(requested_payload->>'intendedUse'),''),'NEW',requested_actor_id,
    nullif(trim(requested_payload->>'notesInternal'),''),requested_actor_id,requested_actor_id)
  returning id into target_lead_id;
  insert into public.lead_activities(lead_id,activity_type,actor_admin_id,note)
    values(target_lead_id,'LEAD_CREATED',requested_actor_id,'Lead created by admin');
  if nullif(trim(requested_payload->>'notesInternal'),'') is not null then
    insert into public.lead_activities(lead_id,activity_type,actor_admin_id,note)
      values(target_lead_id,'NOTE_ADDED',requested_actor_id,trim(requested_payload->>'notesInternal'));
  end if;
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,after_state)
    values(requested_actor_id,'CREATE','lead',target_lead_id,array['identity','source','demand'],jsonb_build_object('status','NEW'));
  return target_lead_id;
end; $$;

create function public.update_admin_lead(requested_actor_id uuid, requested_lead_id uuid, requested_payload jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare target_party_id uuid;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege; end if;
  if nullif(trim(requested_payload->>'name'),'') is null
    or (nullif(trim(requested_payload->>'phone'),'') is null and nullif(trim(requested_payload->>'email'),'') is null) then
    raise exception 'Name and at least one contact method are required';
  end if;
  select party_id into target_party_id from public.leads where id=requested_lead_id and archived_at is null for update;
  if not found then raise exception 'Lead not found'; end if;
  update public.parties set display_name=trim(requested_payload->>'name'),phone=nullif(trim(requested_payload->>'phone'),''),
    email=nullif(lower(trim(requested_payload->>'email')),''),updated_by=requested_actor_id where id=target_party_id;
  update public.leads set source_type=upper(trim(requested_payload->>'sourceType')),
    source_detail=nullif(trim(requested_payload->>'sourceDetail'),''),inquiry_type=(requested_payload->>'inquiryType')::public.lead_inquiry_type,
    buyer_type=nullif(requested_payload->>'buyerType','')::public.buyer_type,
    preferred_transaction=nullif(requested_payload->>'preferredTransaction','')::public.transaction_type,
    land_category=nullif(requested_payload->>'landCategory','')::public.land_category,
    budget_min=nullif(requested_payload->>'budgetMin','')::numeric,budget_max=nullif(requested_payload->>'budgetMax','')::numeric,
    budget_currency=case when nullif(requested_payload->>'budgetMin','') is not null or nullif(requested_payload->>'budgetMax','') is not null then 'INR' else null end,
    district_id=nullif(requested_payload->>'districtId','')::uuid,subdistrict_id=nullif(requested_payload->>'subdistrictId','')::uuid,
    place_id=nullif(requested_payload->>'placeId','')::uuid,locality_text=nullif(trim(requested_payload->>'localityText'),''),
    intended_use=nullif(trim(requested_payload->>'intendedUse'),''),updated_at=now(),updated_by=requested_actor_id
    where id=requested_lead_id;
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields)
    values(requested_actor_id,'UPDATE','lead',requested_lead_id,array['identity','source','demand']);
end; $$;

create function public.save_lead_requirement(requested_actor_id uuid, requested_lead_id uuid, requested_payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege; end if;
  if not exists(select 1 from public.leads where id=requested_lead_id and archived_at is null) then raise exception 'Lead not found'; end if;
  insert into public.lead_requirements(lead_id,min_area_value,max_area_value,area_unit_id,normalized_min_area_sqm,
    normalized_max_area_sqm,preferred_road_width_m_min,preferred_frontage_m_min,preferred_use_text)
  values(requested_lead_id,nullif(requested_payload->>'minAreaValue','')::numeric,nullif(requested_payload->>'maxAreaValue','')::numeric,
    nullif(requested_payload->>'areaUnitId','')::uuid,nullif(requested_payload->>'normalizedMinAreaSqm','')::numeric,
    nullif(requested_payload->>'normalizedMaxAreaSqm','')::numeric,nullif(requested_payload->>'preferredRoadWidthMMin','')::numeric,
    nullif(requested_payload->>'preferredFrontageMMin','')::numeric,nullif(trim(requested_payload->>'notes'),''))
  on conflict(lead_id) do update set min_area_value=excluded.min_area_value,max_area_value=excluded.max_area_value,
    area_unit_id=excluded.area_unit_id,normalized_min_area_sqm=excluded.normalized_min_area_sqm,
    normalized_max_area_sqm=excluded.normalized_max_area_sqm,preferred_road_width_m_min=excluded.preferred_road_width_m_min,
    preferred_frontage_m_min=excluded.preferred_frontage_m_min,preferred_use_text=excluded.preferred_use_text,updated_at=now()
  returning id into target_id;
  update public.leads set updated_at=now(),updated_by=requested_actor_id where id=requested_lead_id;
  insert into public.lead_activities(lead_id,activity_type,actor_admin_id,note) values(requested_lead_id,'REQUIREMENT_UPDATED',requested_actor_id,'Buyer requirement updated');
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields) values(requested_actor_id,'UPDATE','lead',requested_lead_id,array['requirement']);
  return target_id;
end; $$;

create function public.transition_lead_status(requested_actor_id uuid, requested_lead_id uuid, requested_next_status public.lead_status, requested_reason text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare current_status public.lead_status; allowed boolean:=false;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege; end if;
  select status into current_status from public.leads where id=requested_lead_id and archived_at is null for update;
  if not found then raise exception 'Lead not found'; end if;
  allowed := case current_status
    when 'NEW' then requested_next_status in ('CONTACT_ATTEMPTED','QUALIFIED','NURTURE','CLOSED_LOST')
    when 'CONTACT_ATTEMPTED' then requested_next_status in ('CONTACT_ATTEMPTED','QUALIFIED','NURTURE','CLOSED_LOST')
    when 'QUALIFIED' then requested_next_status in ('REQUIREMENT_CONFIRMED','PROPERTY_MATCHED','NURTURE','CLOSED_LOST')
    when 'REQUIREMENT_CONFIRMED' then requested_next_status in ('PROPERTY_MATCHED','NURTURE','CLOSED_LOST')
    when 'PROPERTY_MATCHED' then requested_next_status in ('SITE_VISIT_REQUESTED','NURTURE','CLOSED_LOST')
    when 'SITE_VISIT_REQUESTED' then requested_next_status in ('SITE_VISIT_CONFIRMED','NURTURE','CLOSED_LOST')
    when 'SITE_VISIT_CONFIRMED' then requested_next_status in ('SITE_VISIT_COMPLETED','NURTURE','CLOSED_LOST')
    when 'SITE_VISIT_COMPLETED' then requested_next_status in ('NEGOTIATION','NURTURE','CLOSED_LOST')
    when 'NEGOTIATION' then requested_next_status in ('CLOSED_WON','CLOSED_LOST','NURTURE')
    when 'NURTURE' then requested_next_status in ('CONTACT_ATTEMPTED','QUALIFIED','REQUIREMENT_CONFIRMED','PROPERTY_MATCHED','SITE_VISIT_REQUESTED','NEGOTIATION','CLOSED_WON','CLOSED_LOST')
    else false end;
  if not allowed then raise exception using errcode='P0400',message=format('Transition from %s to %s is not allowed',current_status,requested_next_status); end if;
  if requested_next_status='CONTACT_ATTEMPTED' and not exists(select 1 from public.lead_activities where lead_id=requested_lead_id and activity_type='CONTACT_ATTEMPTED') then raise exception 'A contact attempt activity is required'; end if;
  if requested_next_status='REQUIREMENT_CONFIRMED' and not exists(select 1 from public.lead_requirements where lead_id=requested_lead_id) then raise exception 'A reviewed requirement is required'; end if;
  if requested_next_status='PROPERTY_MATCHED' and not exists(select 1 from public.lead_properties where lead_id=requested_lead_id and coalesce(match_status,'ACTIVE') in ('ACTIVE','ACCEPTED','PRESENTED')) then raise exception 'An active property match is required'; end if;
  if requested_next_status='NURTURE' and not exists(select 1 from public.lead_follow_ups where lead_id=requested_lead_id and completed_at is null and due_at>now()) and nullif(trim(requested_reason),'') is null then raise exception 'Nurture requires a future follow-up or reactivation plan'; end if;
  if requested_next_status='CLOSED_LOST' and coalesce(trim(requested_reason),'') not in (
    'BUDGET_MISMATCH','LOCATION_MISMATCH','SIZE_MISMATCH','PROPERTY_SOLD','PROPERTY_UNAVAILABLE',
    'BUYER_ELIGIBILITY_REVIEW','LEGAL_DOCUMENT_CONCERN','TIMING_CHANGED','COMPETITOR_PROPERTY',
    'BUYER_STOPPED_RESPONDING','NOT_INTERESTED','DUPLICATE','OTHER'
  ) then raise exception 'Closed lost requires a structured reason'; end if;
  if requested_next_status='CLOSED_WON' and nullif(trim(requested_reason),'') is null then raise exception 'Closed won requires an outcome'; end if;
  if requested_next_status='CLOSED_WON' and not exists(
    select 1 from public.lead_properties where lead_id=requested_lead_id
      and coalesce(match_status,'ACTIVE') in ('ACTIVE','PRESENTED','ACCEPTED')
  ) then raise exception 'Closed won requires an outcome property'; end if;
  update public.leads set status=requested_next_status,loss_reason=case when requested_next_status='CLOSED_LOST' then trim(requested_reason) else null end,
    closed_at=case when requested_next_status in ('CLOSED_WON','CLOSED_LOST') then now() else null end,
    next_follow_up_at=case when requested_next_status in ('CLOSED_WON','CLOSED_LOST') then null else next_follow_up_at end,
    updated_at=now(),updated_by=requested_actor_id where id=requested_lead_id;
  insert into public.lead_activities(lead_id,activity_type,actor_admin_id,note,metadata_text)
    values(requested_lead_id,case requested_next_status when 'CLOSED_WON' then 'CLOSED_WON'::public.lead_activity_type when 'CLOSED_LOST' then 'CLOSED_LOST'::public.lead_activity_type else 'STATUS_CHANGED'::public.lead_activity_type end,
      requested_actor_id,nullif(trim(requested_reason),''),current_status::text||' → '||requested_next_status::text);
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
    values(requested_actor_id,'STATUS_CHANGE','lead',requested_lead_id,array['status'],jsonb_build_object('status',current_status),jsonb_build_object('status',requested_next_status),case when requested_next_status='CLOSED_LOST' then nullif(trim(requested_reason),'') else null end);
end; $$;

create function public.add_lead_activity(requested_actor_id uuid, requested_lead_id uuid, requested_activity_type public.lead_activity_type, requested_note text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege; end if;
  if requested_activity_type in ('LEAD_CREATED','STATUS_CHANGED','FOLLOW_UP_SCHEDULED','FOLLOW_UP_COMPLETED','PROPERTY_MATCHED','PROPERTY_REJECTED','PROPERTY_UNMATCHED','CLOSED_WON','CLOSED_LOST') then raise exception 'This activity type is service-owned'; end if;
  insert into public.lead_activities(lead_id,activity_type,actor_admin_id,note) values(requested_lead_id,requested_activity_type,requested_actor_id,nullif(trim(requested_note),'')) returning id into target_id;
  if requested_activity_type in ('CONTACT_ATTEMPTED','CONTACTED','WHATSAPP_CLICK','CALL_CLICK','EMAIL_INTERACTION') then update public.leads set last_contacted_at=now(),updated_at=now(),updated_by=requested_actor_id where id=requested_lead_id; end if;
  return target_id;
end; $$;

create function public.schedule_lead_follow_up(requested_actor_id uuid, requested_lead_id uuid, requested_due_at timestamptz, requested_type varchar, requested_context varchar default null, requested_note text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege; end if;
  update public.lead_follow_ups set completed_at=now(),completed_by=requested_actor_id,outcome='Rescheduled' where lead_id=requested_lead_id and completed_at is null;
  insert into public.lead_follow_ups(lead_id,follow_up_type,context,note,due_at,created_by)
    values(requested_lead_id,requested_type,nullif(trim(requested_context),''),nullif(trim(requested_note),''),requested_due_at,requested_actor_id) returning id into target_id;
  update public.leads set next_follow_up_at=requested_due_at,updated_at=now(),updated_by=requested_actor_id where id=requested_lead_id and status not in ('CLOSED_WON','CLOSED_LOST');
  if not found then raise exception 'Lead not found or terminal'; end if;
  insert into public.lead_activities(lead_id,activity_type,actor_admin_id,note,metadata_text) values(requested_lead_id,'FOLLOW_UP_SCHEDULED',requested_actor_id,nullif(trim(requested_note),''),requested_type||' · '||requested_due_at::text);
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields) values(requested_actor_id,'UPDATE','lead',requested_lead_id,array['next_follow_up_at']);
  return target_id;
end; $$;

create function public.complete_lead_follow_up(requested_actor_id uuid, requested_follow_up_id uuid, requested_outcome text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare target_lead_id uuid;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege; end if;
  update public.lead_follow_ups set completed_at=now(),completed_by=requested_actor_id,outcome=nullif(trim(requested_outcome),'')
    where id=requested_follow_up_id and completed_at is null returning lead_id into target_lead_id;
  if target_lead_id is null then raise exception 'Open follow-up not found'; end if;
  update public.leads set next_follow_up_at=null,last_contacted_at=now(),updated_at=now(),updated_by=requested_actor_id where id=target_lead_id;
  insert into public.lead_activities(lead_id,activity_type,actor_admin_id,note) values(target_lead_id,'FOLLOW_UP_COMPLETED',requested_actor_id,nullif(trim(requested_outcome),''));
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields) values(requested_actor_id,'UPDATE','lead',target_lead_id,array['next_follow_up_at','follow_up_completion']);
end; $$;

create function public.match_lead_property(requested_actor_id uuid, requested_lead_id uuid, requested_property_id uuid, requested_status varchar default 'ACTIVE', requested_notes text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege; end if;
  if requested_status not in ('ACTIVE','PRESENTED','ACCEPTED','REJECTED') then raise exception 'Invalid match status'; end if;
  if not exists(select 1 from public.properties where id=requested_property_id and deleted_at is null) then raise exception 'Property not found'; end if;
  insert into public.lead_properties(lead_id,property_id,match_status,matched_by,matched_at,notes_internal)
    values(requested_lead_id,requested_property_id,requested_status,requested_actor_id,now(),nullif(trim(requested_notes),''))
  on conflict(lead_id,property_id) do update set match_status=excluded.match_status,matched_by=excluded.matched_by,matched_at=excluded.matched_at,notes_internal=excluded.notes_internal
  returning id into target_id;
  insert into public.lead_activities(lead_id,activity_type,property_id,actor_admin_id,note)
    values(requested_lead_id,case when requested_status='REJECTED' then 'PROPERTY_REJECTED'::public.lead_activity_type else 'PROPERTY_MATCHED'::public.lead_activity_type end,requested_property_id,requested_actor_id,nullif(trim(requested_notes),''));
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,after_state)
    values(requested_actor_id,'UPDATE','lead',requested_lead_id,array['property_match'],jsonb_build_object('property_id',requested_property_id,'status',requested_status));
  return target_id;
end; $$;

create function public.unmatch_lead_property(requested_actor_id uuid, requested_lead_id uuid, requested_property_id uuid, requested_reason text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege; end if;
  delete from public.lead_properties where lead_id=requested_lead_id and property_id=requested_property_id;
  if not found then raise exception 'Property match not found'; end if;
  insert into public.lead_activities(lead_id,activity_type,property_id,actor_admin_id,note) values(requested_lead_id,'PROPERTY_UNMATCHED',requested_property_id,requested_actor_id,nullif(trim(requested_reason),''));
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state) values(requested_actor_id,'UPDATE','lead',requested_lead_id,array['property_match'],jsonb_build_object('property_id',requested_property_id));
end; $$;

do $$ declare routine text; begin
  foreach routine in array array['create_admin_lead','update_admin_lead','save_lead_requirement','transition_lead_status','add_lead_activity','schedule_lead_follow_up','complete_lead_follow_up','match_lead_property','unmatch_lead_property'] loop
    execute format('revoke all on function public.%I from public, anon, authenticated',routine);
  end loop;
end $$;
grant execute on function public.create_admin_lead(uuid,jsonb) to service_role;
grant execute on function public.update_admin_lead(uuid,uuid,jsonb) to service_role;
grant execute on function public.save_lead_requirement(uuid,uuid,jsonb) to service_role;
grant execute on function public.transition_lead_status(uuid,uuid,public.lead_status,text) to service_role;
grant execute on function public.add_lead_activity(uuid,uuid,public.lead_activity_type,text) to service_role;
grant execute on function public.schedule_lead_follow_up(uuid,uuid,timestamptz,varchar,varchar,text) to service_role;
grant execute on function public.complete_lead_follow_up(uuid,uuid,text) to service_role;
grant execute on function public.match_lead_property(uuid,uuid,uuid,varchar,text) to service_role;
grant execute on function public.unmatch_lead_property(uuid,uuid,uuid,text) to service_role;

comment on table public.lead_follow_ups is 'M12 structured private follow-up history; separate from site-visit lifecycle per ADR-0001.';
