-- M13: server-owned public demand intake into the private M12 CRM.

alter type public.lead_activity_type add value 'PROPERTY_INQUIRY_RECEIVED';
alter type public.lead_activity_type add value 'GENERAL_CONTACT_RECEIVED';

create table public.party_consents (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete restrict,
  lead_id uuid not null references public.leads(id) on delete restrict,
  purpose varchar(40) not null check (purpose in ('INQUIRY_CONTACT','REQUIREMENT_CONTACT','SITE_VISIT_CONTACT','GENERAL_CONTACT')),
  privacy_notice_version varchar(80) not null,
  consent_source varchar(80) not null,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (lead_id, purpose)
);

create table public.public_intake_idempotency (
  id uuid primary key default gen_random_uuid(),
  intake_action varchar(40) not null check (intake_action in ('PROPERTY_INQUIRY','BUYER_REQUIREMENT','SITE_VISIT_REQUEST','GENERAL_CONTACT')),
  key_hash char(64) not null check (key_hash ~ '^[0-9a-f]{64}$'),
  payload_hash char(64) not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  lead_id uuid not null references public.leads(id) on delete restrict,
  property_id uuid references public.properties(id) on delete restrict,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  unique (intake_action, key_hash),
  check (expires_at > created_at)
);

create table public.public_rate_limit_events (
  id bigint generated always as identity primary key,
  intake_action varchar(40) not null check (intake_action in ('PROPERTY_INQUIRY','BUYER_REQUIREMENT','SITE_VISIT_REQUEST','GENERAL_CONTACT','PUBLIC_INTENT')),
  bucket_hash char(64) not null check (bucket_hash ~ '^[0-9a-f]{64}$'),
  occurred_at timestamptz not null default now()
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete restrict,
  notification_type varchar(50) not null check (notification_type = 'ADMIN_PUBLIC_INTAKE'),
  event_key varchar(130) not null unique,
  status varchar(20) not null default 'PENDING' check (status in ('PENDING','SENT','FAILED','SKIPPED')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error_code varchar(80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index party_consents_party_idx on public.party_consents(party_id, consented_at desc);
create index public_intake_idempotency_expiry_idx on public.public_intake_idempotency(expires_at);
create index public_rate_limit_bucket_idx on public.public_rate_limit_events(intake_action, bucket_hash, occurred_at desc);
create index notification_deliveries_status_idx on public.notification_deliveries(status, created_at);

create trigger notification_deliveries_updated_at before update on public.notification_deliveries
for each row execute function public.set_updated_at();

alter table public.party_consents enable row level security;
alter table public.public_intake_idempotency enable row level security;
alter table public.public_rate_limit_events enable row level security;
alter table public.notification_deliveries enable row level security;

create policy active_admin_select on public.party_consents for select to authenticated
  using ((select public.is_active_admin()));
create policy active_admin_select on public.public_intake_idempotency for select to authenticated
  using ((select public.is_active_admin()));
create policy active_admin_select on public.public_rate_limit_events for select to authenticated
  using ((select public.is_active_admin()));
create policy active_admin_select on public.notification_deliveries for select to authenticated
  using ((select public.is_active_admin()));

revoke all on public.party_consents, public.public_intake_idempotency, public.public_rate_limit_events, public.notification_deliveries from anon, authenticated;
grant select on public.party_consents, public.public_intake_idempotency, public.public_rate_limit_events, public.notification_deliveries to authenticated;
grant all on public.party_consents, public.public_intake_idempotency, public.public_rate_limit_events, public.notification_deliveries to service_role;
grant usage, select on sequence public.public_rate_limit_events_id_seq to service_role;

create function public.consume_public_intake_rate_limit(
  requested_action varchar,
  requested_bucket_hash char(64),
  requested_max_attempts integer,
  requested_window_seconds integer
) returns boolean language plpgsql security definer set search_path = '' as $$
declare recent_count integer;
begin
  if requested_action not in ('PROPERTY_INQUIRY','BUYER_REQUIREMENT','SITE_VISIT_REQUEST','GENERAL_CONTACT','PUBLIC_INTENT')
    or requested_bucket_hash !~ '^[0-9a-f]{64}$'
    or requested_max_attempts not between 1 and 120
    or requested_window_seconds not between 60 and 86400 then
    raise exception 'INVALID_RATE_LIMIT_REQUEST';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(requested_action || ':' || requested_bucket_hash, 0));
  delete from public.public_rate_limit_events where occurred_at <= now() - interval '24 hours';
  select count(*)::integer into recent_count from public.public_rate_limit_events
    where intake_action=requested_action and bucket_hash=requested_bucket_hash
      and occurred_at > now() - make_interval(secs => requested_window_seconds);
  if recent_count >= requested_max_attempts then return false; end if;
  insert into public.public_rate_limit_events(intake_action,bucket_hash)
    values(requested_action,requested_bucket_hash);
  return true;
end; $$;

create function public.submit_public_crm_intake(
  requested_action varchar,
  requested_idempotency_key_hash char(64),
  requested_payload jsonb
) returns table(target_lead_id uuid,target_property_id uuid,target_notification_id uuid,replayed boolean)
language plpgsql security definer set search_path = '' as $$
declare
  target_party_id uuid;
  created_lead_id uuid;
  resolved_property_id uuid;
  resolved_property_code varchar(20);
  resolved_property_category public.land_category;
  resolved_property_transaction public.transaction_type;
  created_notification_id uuid;
  existing_lead_id uuid;
  existing_property_id uuid;
  matching_party_count integer;
  calculated_payload_hash char(64);
  existing_payload_hash char(64);
  source_detail_value varchar(180);
  consent_purpose varchar(40);
  contact_phone varchar(40):=nullif(trim(requested_payload->>'phone'),'');
  contact_email varchar(320):=nullif(lower(trim(requested_payload->>'email')),'');
  contact_name varchar(180):=nullif(trim(requested_payload->>'name'),'');
  message_value text:=nullif(trim(requested_payload->>'message'),'');
begin
  if requested_action not in ('PROPERTY_INQUIRY','BUYER_REQUIREMENT','SITE_VISIT_REQUEST','GENERAL_CONTACT') then
    raise exception 'INVALID_INTAKE_ACTION';
  end if;
  if requested_idempotency_key_hash !~ '^[0-9a-f]{64}$' then raise exception 'INVALID_IDEMPOTENCY_KEY'; end if;
  calculated_payload_hash:=encode(extensions.digest(convert_to(requested_payload::text,'UTF8'),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(requested_action || ':' || requested_idempotency_key_hash, 0));
  delete from public.public_intake_idempotency where expires_at <= now();
  select i.payload_hash,i.lead_id,i.property_id into existing_payload_hash,existing_lead_id,existing_property_id
    from public.public_intake_idempotency i
    where i.intake_action=requested_action and i.key_hash=requested_idempotency_key_hash and i.expires_at>now();
  if found then
    if existing_payload_hash<>calculated_payload_hash then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
    select n.id into created_notification_id from public.notification_deliveries n
      where n.event_key=requested_action || ':' || requested_idempotency_key_hash;
    return query select existing_lead_id,existing_property_id,created_notification_id,true;
    return;
  end if;

  if contact_name is null or length(contact_name)>160
    or (contact_phone is null and contact_email is null)
    or (contact_phone is not null and contact_phone !~ '^\+[1-9][0-9]{6,14}$')
    or (contact_email is not null and (length(contact_email)>320 or contact_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'))
    or coalesce((requested_payload->>'consent')::boolean,false) is not true
    or requested_payload->>'privacyNoticeVersion'<>'M13-CONTACT-PLACEHOLDER-2026-09-05' then
    raise exception 'INVALID_PUBLIC_INTAKE';
  end if;
  if message_value is not null and (length(message_value)>2000 or message_value ~ '[<>]') then raise exception 'INVALID_PUBLIC_INTAKE'; end if;

  if requested_action in ('PROPERTY_INQUIRY','SITE_VISIT_REQUEST') then
    select p.id,p.property_code,p.land_category,p.primary_transaction_type
      into resolved_property_id,resolved_property_code,resolved_property_category,resolved_property_transaction
      from public.properties p
      where lower(p.public_slug)=lower(nullif(trim(requested_payload->>'propertySlug'),''))
        and p.publication_status='PUBLISHED' and p.archived_at is null
        and p.availability_status in ('AVAILABLE','UNDER_NEGOTIATION');
    if resolved_property_id is null then raise exception 'PUBLIC_PROPERTY_UNAVAILABLE'; end if;
  end if;
  if requested_action='BUYER_REQUIREMENT' and (
    nullif(requested_payload->>'preferredTransaction','') is null or
    nullif(requested_payload->>'landCategory','') is null
  ) then raise exception 'INVALID_PUBLIC_INTAKE'; end if;
  if requested_action='SITE_VISIT_REQUEST' and (
    nullif(requested_payload->>'requestedStartAt','') is null or
    nullif(requested_payload->>'requestedEndAt','') is null or
    (requested_payload->>'requestedStartAt')::timestamptz<=now() or
    (requested_payload->>'requestedEndAt')::timestamptz<=(requested_payload->>'requestedStartAt')::timestamptz
  ) then raise exception 'INVALID_VISIT_WINDOW'; end if;

  if nullif(requested_payload->>'districtId','') is not null and not exists(
    select 1 from public.districts d where d.id=(requested_payload->>'districtId')::uuid and d.is_active and d.is_service_area
  ) then raise exception 'INVALID_GEOGRAPHY'; end if;
  if nullif(requested_payload->>'subdistrictId','') is not null and not exists(
    select 1 from public.subdistricts s where s.id=(requested_payload->>'subdistrictId')::uuid and s.is_active
      and (nullif(requested_payload->>'districtId','') is null or s.district_id=(requested_payload->>'districtId')::uuid)
  ) then raise exception 'INVALID_GEOGRAPHY'; end if;
  if nullif(requested_payload->>'placeId','') is not null and not exists(
    select 1 from public.places p join public.subdistricts s on s.id=p.subdistrict_id
      where p.id=(requested_payload->>'placeId')::uuid and p.is_active
        and (nullif(requested_payload->>'subdistrictId','') is null or p.subdistrict_id=(requested_payload->>'subdistrictId')::uuid)
        and (nullif(requested_payload->>'districtId','') is null or s.district_id=(requested_payload->>'districtId')::uuid)
  ) then raise exception 'INVALID_GEOGRAPHY'; end if;
  if nullif(requested_payload->>'areaUnitId','') is not null and not exists(
    select 1 from public.area_units u where u.id=(requested_payload->>'areaUnitId')::uuid and u.is_public_v1
  ) then raise exception 'INVALID_AREA_UNIT'; end if;

  select count(*)::integer,min(p.id::text)::uuid into matching_party_count,target_party_id
    from public.parties p where p.archived_at is null and (
      (contact_phone is not null and p.phone=contact_phone) or
      (contact_email is not null and lower(trim(p.email))=contact_email)
    );
  if matching_party_count<>1 then target_party_id:=null; end if;
  if target_party_id is null then
    insert into public.parties(party_type,display_name,phone,email,consent_recorded_at,consent_source)
      values('INDIVIDUAL',contact_name,contact_phone,contact_email,now(),'PUBLIC_' || requested_action)
      returning id into target_party_id;
  else
    update public.parties set display_name=contact_name,phone=coalesce(phone,contact_phone),email=coalesce(email,contact_email),
      consent_recorded_at=now(),consent_source='PUBLIC_' || requested_action,updated_at=now()
      where id=target_party_id;
  end if;

  source_detail_value:=case requested_action
    when 'PROPERTY_INQUIRY' then 'PROPERTY_DETAIL:' || resolved_property_code
    when 'SITE_VISIT_REQUEST' then 'PROPERTY_DETAIL_SITE_VISIT:' || resolved_property_code
    when 'GENERAL_CONTACT' then 'CONTACT_PAGE'
    else case coalesce(requested_payload->>'sourceContext','DIRECT')
      when 'SEARCH_ZERO' then 'REQUIREMENTS_SEARCH_ZERO'
      when 'CATEGORY_AGRICULTURAL' then 'REQUIREMENTS_CATEGORY_AGRICULTURAL'
      when 'CATEGORY_NA' then 'REQUIREMENTS_CATEGORY_NA'
      when 'CATEGORY_INDUSTRIAL' then 'REQUIREMENTS_CATEGORY_INDUSTRIAL'
      when 'TRANSACTION_BUY' then 'REQUIREMENTS_TRANSACTION_BUY'
      when 'TRANSACTION_RENT' then 'REQUIREMENTS_TRANSACTION_RENT'
      when 'TRANSACTION_LEASE' then 'REQUIREMENTS_TRANSACTION_LEASE'
      else 'REQUIREMENTS_DIRECT' end
  end;
  consent_purpose:=case requested_action
    when 'PROPERTY_INQUIRY' then 'INQUIRY_CONTACT'
    when 'BUYER_REQUIREMENT' then 'REQUIREMENT_CONTACT'
    when 'SITE_VISIT_REQUEST' then 'SITE_VISIT_CONTACT'
    else 'GENERAL_CONTACT' end;

  insert into public.leads(party_id,source_type,source_detail,inquiry_type,buyer_type,preferred_transaction,
    land_category,budget_min,budget_max,budget_currency,district_id,subdistrict_id,place_id,locality_text,
    intended_use,status,notes_internal)
  values(target_party_id,'WEBSITE',source_detail_value,requested_action::public.lead_inquiry_type,
    nullif(requested_payload->>'buyerType','')::public.buyer_type,
    coalesce(nullif(requested_payload->>'preferredTransaction','')::public.transaction_type,resolved_property_transaction),
    coalesce(nullif(requested_payload->>'landCategory','')::public.land_category,resolved_property_category),
    nullif(requested_payload->>'budgetMinimum','')::numeric,nullif(requested_payload->>'budgetMaximum','')::numeric,
    case when nullif(requested_payload->>'budgetMinimum','') is not null or nullif(requested_payload->>'budgetMaximum','') is not null then 'INR' else null end,
    nullif(requested_payload->>'districtId','')::uuid,nullif(requested_payload->>'subdistrictId','')::uuid,
    nullif(requested_payload->>'placeId','')::uuid,nullif(trim(requested_payload->>'localityText'),''),
    nullif(trim(requested_payload->>'intendedUse'),''),'NEW',message_value)
  returning id into created_lead_id;

  insert into public.lead_activities(lead_id,activity_type,property_id,note)
    values(created_lead_id,'LEAD_CREATED',resolved_property_id,'Public ' || lower(replace(requested_action,'_',' ')) || ' received');

  if requested_action='BUYER_REQUIREMENT' then
    insert into public.lead_requirements(lead_id,min_area_value,max_area_value,area_unit_id,preferred_use_text)
      values(created_lead_id,nullif(requested_payload->>'minimumArea','')::numeric,
        nullif(requested_payload->>'maximumArea','')::numeric,nullif(requested_payload->>'areaUnitId','')::uuid,
        nullif(concat_ws(E'\n',nullif(trim(requested_payload->>'timeline'),''),message_value),''));
    insert into public.lead_activities(lead_id,activity_type,note)
      values(created_lead_id,'REQUIREMENT_UPDATED','Public buyer requirement recorded');
  elsif requested_action='PROPERTY_INQUIRY' then
    insert into public.lead_properties(lead_id,property_id,match_status,matched_at)
      values(created_lead_id,resolved_property_id,'INQUIRY',now());
    insert into public.lead_activities(lead_id,activity_type,property_id,note,metadata_text)
      values(created_lead_id,'PROPERTY_INQUIRY_RECEIVED',resolved_property_id,message_value,
        'preferred_contact=' || coalesce(requested_payload->>'preferredContact','PHONE'));
  elsif requested_action='SITE_VISIT_REQUEST' then
    insert into public.lead_properties(lead_id,property_id,match_status,matched_at)
      values(created_lead_id,resolved_property_id,'VISIT_REQUESTED',now());
    insert into public.site_visits(lead_id,property_id,status,requested_start_at,requested_end_at,notes_internal)
      values(created_lead_id,resolved_property_id,'REQUESTED',(requested_payload->>'requestedStartAt')::timestamptz,
        (requested_payload->>'requestedEndAt')::timestamptz,
        nullif(concat_ws(E'\n',message_value,nullif(trim(requested_payload->>'alternateTime'),'')),''));
    insert into public.lead_activities(lead_id,activity_type,property_id,note)
      values(created_lead_id,'SITE_VISIT_REQUESTED',resolved_property_id,'Public visit request received; manual confirmation required');
  else
    insert into public.lead_activities(lead_id,activity_type,note)
      values(created_lead_id,'GENERAL_CONTACT_RECEIVED',message_value);
  end if;

  insert into public.party_consents(party_id,lead_id,purpose,privacy_notice_version,consent_source)
    values(target_party_id,created_lead_id,consent_purpose,requested_payload->>'privacyNoticeVersion','PUBLIC_' || requested_action);
  insert into public.audit_logs(action,entity_type,entity_id,changed_fields,after_state)
    values('CREATE','lead',created_lead_id,array['source','demand','consent'],
      jsonb_build_object('status','NEW','source','WEBSITE','inquiryType',requested_action));
  insert into public.notification_deliveries(lead_id,notification_type,event_key)
    values(created_lead_id,'ADMIN_PUBLIC_INTAKE',requested_action || ':' || requested_idempotency_key_hash)
    returning id into created_notification_id;
  insert into public.public_intake_idempotency(intake_action,key_hash,payload_hash,lead_id,property_id)
    values(requested_action,requested_idempotency_key_hash,calculated_payload_hash,created_lead_id,resolved_property_id);
  return query select created_lead_id,resolved_property_id,created_notification_id,false;
end; $$;

create function public.record_notification_delivery_result(
  requested_delivery_id uuid,
  requested_status varchar,
  requested_error_code varchar default null
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if requested_status not in ('SENT','FAILED','SKIPPED') then raise exception 'INVALID_NOTIFICATION_STATUS'; end if;
  update public.notification_deliveries set status=requested_status,attempt_count=attempt_count+1,
    last_error_code=case when requested_status='FAILED' then left(coalesce(requested_error_code,'PROVIDER_FAILURE'),80) else null end
    where id=requested_delivery_id;
  if not found then raise exception 'NOTIFICATION_NOT_FOUND'; end if;
end; $$;

revoke all on function public.consume_public_intake_rate_limit(varchar,char,integer,integer) from public,anon,authenticated;
revoke all on function public.submit_public_crm_intake(varchar,char,jsonb) from public,anon,authenticated;
revoke all on function public.record_notification_delivery_result(uuid,varchar,varchar) from public,anon,authenticated;
grant execute on function public.consume_public_intake_rate_limit(varchar,char,integer,integer) to service_role;
grant execute on function public.submit_public_crm_intake(varchar,char,jsonb) to service_role;
grant execute on function public.record_notification_delivery_result(uuid,varchar,varchar) to service_role;

comment on function public.submit_public_crm_intake is 'M13 atomic server-owned adapter into M12 CRM; never executable by browser roles.';
comment on table public.public_intake_idempotency is 'Private bounded replay protection, not a second public lead store.';
comment on table public.public_rate_limit_events is 'Privacy-preserving HMAC buckets only; raw network addresses are never stored.';
