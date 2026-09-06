-- M15: private owner-supply intake, review history, documents, and explicit draft conversion.
-- A public submission is an owner-provided claim. It is never public inventory and never publishes.

alter table public.owner_submissions
  add column owner_intent varchar(12) not null default 'SELL'
    check (owner_intent in ('SELL','RENT','LEASE')),
  add column preferred_contact varchar(20) not null default 'PHONE'
    check (preferred_contact in ('PHONE','WHATSAPP','EMAIL')),
  add column owner_relationship varchar(40) not null default 'OWNER'
    check (owner_relationship in ('OWNER','CO_OWNER','AUTHORIZED_REPRESENTATIVE','BROKER_INTERMEDIARY','OTHER')),
  add column taluka_text varchar(180),
  add column village_text varchar(180),
  add column broad_address text,
  add column location_visibility_preference public.location_visibility not null default 'APPROXIMATE',
  add column private_latitude numeric(9,6),
  add column private_longitude numeric(9,6),
  add column price_mode public.price_mode not null default 'PRICE_ON_REQUEST',
  add column asking_price_amount numeric(20,2),
  add column asking_price_per_unit numeric(20,4),
  add column price_unit_id uuid references public.area_units(id) on delete restrict,
  add column is_negotiable boolean not null default false,
  add column minimum_acceptable_price numeric(20,2),
  add column category_claims jsonb not null default '{}'::jsonb,
  add column media_claims jsonb not null default '{}'::jsonb,
  add column assigned_to uuid references public.admin_profiles(user_id) on delete restrict,
  add column version integer not null default 1,
  add constraint owner_submissions_private_coordinate_pair_check
    check ((private_latitude is null) = (private_longitude is null)),
  add constraint owner_submissions_private_latitude_check
    check (private_latitude is null or private_latitude between -90 and 90),
  add constraint owner_submissions_private_longitude_check
    check (private_longitude is null or private_longitude between -180 and 180),
  add constraint owner_submissions_price_values_check
    check (
      asking_price_amount is null or asking_price_amount >= 0
    ),
  add constraint owner_submissions_price_per_unit_check
    check (asking_price_per_unit is null or asking_price_per_unit >= 0),
  add constraint owner_submissions_minimum_price_check
    check (minimum_acceptable_price is null or minimum_acceptable_price >= 0),
  add constraint owner_submissions_price_shape_check
    check (
      (price_mode = 'PRICE_ON_REQUEST' and asking_price_amount is null and asking_price_per_unit is null and price_unit_id is null)
      or (price_mode = 'EXACT_TOTAL' and asking_price_amount is not null and asking_price_per_unit is null and price_unit_id is null)
      or (price_mode = 'PER_UNIT' and asking_price_amount is null and asking_price_per_unit is not null and price_unit_id is not null)
    ),
  add constraint owner_submissions_claims_object_check
    check (jsonb_typeof(category_claims) = 'object' and jsonb_typeof(media_claims) = 'object'),
  add constraint owner_submissions_version_check check (version > 0);

create table public.owner_submission_consents (
  id uuid primary key default gen_random_uuid(),
  owner_submission_id uuid not null references public.owner_submissions(id) on delete restrict,
  party_id uuid not null references public.parties(id) on delete restrict,
  purpose varchar(50) not null check (purpose in (
    'CONTACT_PERMISSION','INFORMATION_DECLARATION','PRIVACY_NOTICE',
    'PUBLICATION_REVIEW_ACKNOWLEDGEMENT','DOCUMENT_CERTIFICATION_ACKNOWLEDGEMENT'
  )),
  privacy_notice_version varchar(80) not null,
  consent_source varchar(80) not null,
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (owner_submission_id, purpose)
);

create table public.owner_submission_events (
  id bigint generated always as identity primary key,
  owner_submission_id uuid not null references public.owner_submissions(id) on delete restrict,
  event_type varchar(50) not null check (event_type in (
    'SUBMITTED','STATUS_CHANGED','NOTE_ADDED','DOCUMENT_REQUESTED','ASSIGNED','CONVERTED'
  )),
  from_status public.owner_submission_status,
  to_status public.owner_submission_status,
  note text,
  next_action_at timestamptz,
  actor_admin_id uuid references public.admin_profiles(user_id) on delete restrict,
  occurred_at timestamptz not null default now(),
  check ((from_status is null and to_status is not null) or (from_status is not null and to_status is not null) or event_type = 'NOTE_ADDED'),
  check (note is null or length(note) <= 5000)
);

create table public.owner_submission_idempotency (
  id uuid primary key default gen_random_uuid(),
  key_hash char(64) not null unique check (key_hash ~ '^[0-9a-f]{64}$'),
  payload_hash char(64) not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  owner_submission_id uuid not null references public.owner_submissions(id) on delete restrict,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create table public.owner_submission_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  owner_submission_id uuid not null references public.owner_submissions(id) on delete restrict,
  event_key varchar(130) not null unique,
  status varchar(20) not null default 'PENDING' check (status in ('PENDING','SENT','FAILED','SKIPPED')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error_code varchar(80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index owner_submission_events_timeline_idx
  on public.owner_submission_events(owner_submission_id, occurred_at desc, id desc);
create index owner_submission_idempotency_expiry_idx
  on public.owner_submission_idempotency(expires_at);
create index owner_submission_notifications_status_idx
  on public.owner_submission_notification_deliveries(status, created_at);
create index owner_submissions_assignment_queue_idx
  on public.owner_submissions(assigned_to, status, created_at desc)
  where archived_at is null;
create unique index private_documents_active_submission_duplicate_uidx
  on public.private_documents(owner_submission_id, document_type, checksum_sha256)
  where owner_submission_id is not null and checksum_sha256 is not null and archived_at is null;

create trigger owner_submission_notifications_updated_at
before update on public.owner_submission_notification_deliveries
for each row execute function public.set_updated_at();

create function public.prevent_owner_submission_event_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'owner_submission_events are append-only';
end;
$$;

create trigger owner_submission_events_append_only
before update or delete on public.owner_submission_events
for each row execute function public.prevent_owner_submission_event_mutation();

alter table public.owner_submission_consents enable row level security;
alter table public.owner_submission_events enable row level security;
alter table public.owner_submission_idempotency enable row level security;
alter table public.owner_submission_notification_deliveries enable row level security;

create policy active_admin_select on public.owner_submission_consents for select to authenticated
  using ((select public.is_active_admin()));
create policy active_admin_select on public.owner_submission_events for select to authenticated
  using ((select public.is_active_admin()));
create policy active_admin_select on public.owner_submission_idempotency for select to authenticated
  using ((select public.is_active_admin()));
create policy active_admin_select on public.owner_submission_notification_deliveries for select to authenticated
  using ((select public.is_active_admin()));

revoke all on public.owner_submission_consents, public.owner_submission_events,
  public.owner_submission_idempotency, public.owner_submission_notification_deliveries
  from anon, authenticated;
grant select on public.owner_submission_consents, public.owner_submission_events,
  public.owner_submission_idempotency, public.owner_submission_notification_deliveries
  to authenticated;
grant all on public.owner_submission_consents, public.owner_submission_events,
  public.owner_submission_idempotency, public.owner_submission_notification_deliveries
  to service_role;
grant usage, select on sequence public.owner_submission_events_id_seq to service_role;

alter table public.public_rate_limit_events
  drop constraint public_rate_limit_events_intake_action_check;
alter table public.public_rate_limit_events
  add constraint public_rate_limit_events_intake_action_check
  check (intake_action in (
    'PROPERTY_INQUIRY','BUYER_REQUIREMENT','SITE_VISIT_REQUEST','GENERAL_CONTACT',
    'OWNER_LAND_SUBMISSION','PUBLIC_INTENT'
  ));

create or replace function public.consume_public_intake_rate_limit(
  requested_action varchar,
  requested_bucket_hash char(64),
  requested_max_attempts integer,
  requested_window_seconds integer
) returns boolean language plpgsql security definer set search_path = '' as $$
declare recent_count integer;
begin
  if requested_action not in (
    'PROPERTY_INQUIRY','BUYER_REQUIREMENT','SITE_VISIT_REQUEST','GENERAL_CONTACT',
    'OWNER_LAND_SUBMISSION','PUBLIC_INTENT'
  ) or requested_bucket_hash !~ '^[0-9a-f]{64}$'
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
end;
$$;

create function public.submit_owner_land_submission(
  requested_submission_id uuid,
  requested_idempotency_key_hash char(64),
  requested_payload jsonb,
  requested_documents jsonb default '[]'::jsonb
) returns table(
  target_submission_id uuid,
  target_submission_reference varchar,
  target_notification_id uuid,
  replayed boolean
) language plpgsql security definer set search_path = '' as $$
declare
  target_party_id uuid;
  created_reference varchar(20);
  created_notification_id uuid;
  existing_submission_id uuid;
  existing_payload_hash char(64);
  calculated_payload_hash char(64);
  matching_party_count integer;
  document jsonb;
  document_count integer;
  document_total_bytes bigint := 0;
  contact_name varchar(180) := nullif(btrim(requested_payload->>'name'),'');
  contact_phone varchar(40) := nullif(btrim(requested_payload->>'phone'),'');
  contact_email varchar(320) := nullif(lower(btrim(requested_payload->>'email')),'');
  owner_intent_value varchar(12) := nullif(requested_payload->>'ownerIntent','');
  transaction_value public.transaction_type;
  price_mode_value public.price_mode := (requested_payload->>'priceMode')::public.price_mode;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise insufficient_privilege using message = 'Service role required';
  end if;
  if requested_idempotency_key_hash !~ '^[0-9a-f]{64}$' then raise exception 'INVALID_IDEMPOTENCY_KEY'; end if;
  if jsonb_typeof(requested_payload) <> 'object' or jsonb_typeof(requested_documents) <> 'array' then
    raise exception 'INVALID_OWNER_SUBMISSION';
  end if;
  document_count := jsonb_array_length(requested_documents);
  calculated_payload_hash := encode(extensions.digest(
    convert_to(jsonb_build_object('payload',requested_payload,'documents',requested_documents)::text,'UTF8'),
    'sha256'
  ),'hex');
  perform pg_advisory_xact_lock(hashtextextended('OWNER_LAND_SUBMISSION:' || requested_idempotency_key_hash, 0));
  delete from public.owner_submission_idempotency where expires_at <= now();
  select i.payload_hash,i.owner_submission_id into existing_payload_hash,existing_submission_id
    from public.owner_submission_idempotency i
    where i.key_hash=requested_idempotency_key_hash and i.expires_at>now();
  if found then
    if existing_payload_hash<>calculated_payload_hash then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
    select s.submission_reference into created_reference from public.owner_submissions s where s.id=existing_submission_id;
    select n.id into created_notification_id from public.owner_submission_notification_deliveries n
      where n.event_key='OWNER_LAND_SUBMISSION:' || requested_idempotency_key_hash;
    return query select existing_submission_id,created_reference,created_notification_id,true;
    return;
  end if;

  if contact_name is null or length(contact_name)>160
    or contact_phone is null or contact_phone !~ '^\+[1-9][0-9]{6,14}$'
    or (contact_email is not null and (length(contact_email)>320 or contact_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'))
    or requested_payload->>'privacyNoticeVersion' <> 'M15-OWNER-INTAKE-2026-09-06'
    or coalesce((requested_payload->>'contactConsent')::boolean,false) is not true
    or coalesce((requested_payload->>'informationDeclaration')::boolean,false) is not true
    or coalesce((requested_payload->>'privacyConsent')::boolean,false) is not true
    or coalesce((requested_payload->>'publicationReviewAcknowledgement')::boolean,false) is not true
    or coalesce((requested_payload->>'documentCertificationAcknowledgement')::boolean,false) is not true
  then raise exception 'INVALID_OWNER_SUBMISSION'; end if;
  if coalesce(requested_payload->>'preferredContact','') not in ('PHONE','WHATSAPP','EMAIL')
    or (requested_payload->>'preferredContact'='EMAIL' and contact_email is null)
    or coalesce(requested_payload->>'ownerRelationship','') not in ('OWNER','CO_OWNER','AUTHORIZED_REPRESENTATIVE','BROKER_INTERMEDIARY','OTHER')
    or coalesce(owner_intent_value,'') not in ('SELL','RENT','LEASE')
    or coalesce(requested_payload->>'landCategory','') not in ('AGRICULTURAL','NA','INDUSTRIAL')
    or coalesce(requested_payload->>'locationVisibilityPreference','') not in ('EXACT','APPROXIMATE','HIDDEN')
  then raise exception 'INVALID_OWNER_SUBMISSION'; end if;
  transaction_value := case owner_intent_value when 'SELL' then 'BUY'::public.transaction_type else owner_intent_value::public.transaction_type end;
  if nullif(requested_payload->>'districtId','') is null
    or nullif(btrim(requested_payload->>'talukaText'),'') is null
    or nullif(btrim(requested_payload->>'villageText'),'') is null
    or coalesce((requested_payload->>'areaValue')::numeric,0) <= 0
    or nullif(requested_payload->>'areaUnitId','') is null
  then raise exception 'INVALID_OWNER_SUBMISSION'; end if;
  if not exists(select 1 from public.districts d where d.id=(requested_payload->>'districtId')::uuid and d.is_active and d.is_service_area)
    or not exists(select 1 from public.area_units u where u.id=(requested_payload->>'areaUnitId')::uuid and u.is_public_v1)
  then raise exception 'INVALID_OWNER_SUBMISSION_REFERENCE'; end if;
  if (nullif(requested_payload->>'privateLatitude','') is null) <> (nullif(requested_payload->>'privateLongitude','') is null)
    or nullif(requested_payload->>'privateLatitude','')::numeric not between -90 and 90
    or nullif(requested_payload->>'privateLongitude','')::numeric not between -180 and 180
  then raise exception 'INVALID_OWNER_LOCATION'; end if;
  if price_mode_value='EXACT_TOTAL' and coalesce((requested_payload->>'askingPriceAmount')::numeric,-1)<0 then raise exception 'INVALID_OWNER_PRICE'; end if;
  if price_mode_value='PER_UNIT' and (
    coalesce((requested_payload->>'askingPricePerUnit')::numeric,-1)<0
    or nullif(requested_payload->>'priceUnitId','') is null
    or not exists(select 1 from public.area_units u where u.id=(requested_payload->>'priceUnitId')::uuid and u.is_public_v1)
  ) then raise exception 'INVALID_OWNER_PRICE'; end if;
  if price_mode_value not in ('PRICE_ON_REQUEST','EXACT_TOTAL','PER_UNIT') then raise exception 'INVALID_OWNER_PRICE'; end if;
  if length(coalesce(requested_payload->>'sourceDescription',''))>10000
    or length(coalesce((requested_payload->'categoryClaims')::text,''))>12000
    or length(coalesce((requested_payload->'mediaClaims')::text,''))>4000
  then raise exception 'INVALID_OWNER_SUBMISSION'; end if;
  if document_count > 10 then raise exception 'OWNER_ATTACHMENT_LIMIT'; end if;
  for document in select value from jsonb_array_elements(requested_documents) loop
    document_total_bytes := document_total_bytes + coalesce((document->>'fileSizeBytes')::bigint,0);
    if document->>'documentRole' not in ('OWNER_PHOTO','OWNER_BROCHURE','SUPPORTING_DOCUMENT')
      or document->>'documentType' not in ('OWNER_MEDIA','OWNER_BROCHURE','OWNER_SUPPORTING_DOCUMENT')
      or document->>'mimeType' not in ('application/pdf','image/jpeg','image/png')
      or (document->>'fileSizeBytes')::bigint not between 1 and 20971520
      or document->>'checksumSha256' !~ '^[0-9a-f]{64}$'
      or document->>'scanStatus' not in ('PENDING','CLEAN')
      or document->>'objectPath' !~ ('^owner-submissions/' || requested_submission_id || '/(media|documents)/[0-9a-f-]+[.](pdf|jpg|png)$')
    then raise exception 'INVALID_OWNER_ATTACHMENT'; end if;
  end loop;
  if document_total_bytes > 20971520 then raise exception 'OWNER_ATTACHMENT_TOTAL_LIMIT'; end if;

  select count(*)::integer,min(p.id::text)::uuid into matching_party_count,target_party_id
    from public.parties p where p.archived_at is null and (
      p.phone=contact_phone or (contact_email is not null and lower(btrim(p.email))=contact_email)
    );
  if matching_party_count<>1 then target_party_id:=null; end if;
  if target_party_id is null then
    insert into public.parties(party_type,display_name,phone,email,consent_recorded_at,consent_source)
      values('INDIVIDUAL',contact_name,contact_phone,contact_email,now(),'PUBLIC_OWNER_LAND_SUBMISSION')
      returning id into target_party_id;
  else
    update public.parties set display_name=contact_name,phone=coalesce(phone,contact_phone),
      email=coalesce(email,contact_email),consent_recorded_at=now(),
      consent_source='PUBLIC_OWNER_LAND_SUBMISSION'
      where id=target_party_id;
  end if;

  insert into public.owner_submissions(
    id,party_id,land_category,primary_transaction_type,owner_intent,preferred_contact,
    owner_relationship,district_id,subdistrict_id,place_id,taluka_text,village_text,
    locality_text,broad_address,location_visibility_preference,private_latitude,private_longitude,
    approximate_area_value,approximate_area_unit_id,price_mode,asking_price_amount,
    asking_price_per_unit,price_unit_id,is_negotiable,minimum_acceptable_price,
    asking_price_text,source_description,category_claims,media_claims,status
  ) values (
    requested_submission_id,target_party_id,(requested_payload->>'landCategory')::public.land_category,
    transaction_value,owner_intent_value,requested_payload->>'preferredContact',
    requested_payload->>'ownerRelationship',(requested_payload->>'districtId')::uuid,
    nullif(requested_payload->>'subdistrictId','')::uuid,nullif(requested_payload->>'placeId','')::uuid,
    nullif(btrim(requested_payload->>'talukaText'),''),nullif(btrim(requested_payload->>'villageText'),''),
    nullif(btrim(requested_payload->>'localityText'),''),nullif(btrim(requested_payload->>'broadAddress'),''),
    (requested_payload->>'locationVisibilityPreference')::public.location_visibility,
    nullif(requested_payload->>'privateLatitude','')::numeric,nullif(requested_payload->>'privateLongitude','')::numeric,
    (requested_payload->>'areaValue')::numeric,(requested_payload->>'areaUnitId')::uuid,price_mode_value,
    case when price_mode_value='EXACT_TOTAL' then (requested_payload->>'askingPriceAmount')::numeric end,
    case when price_mode_value='PER_UNIT' then (requested_payload->>'askingPricePerUnit')::numeric end,
    case when price_mode_value='PER_UNIT' then (requested_payload->>'priceUnitId')::uuid end,
    coalesce((requested_payload->>'negotiable')::boolean,false),nullif(requested_payload->>'minimumAcceptablePrice','')::numeric,
    nullif(btrim(requested_payload->>'askingPriceText'),''),nullif(btrim(requested_payload->>'sourceDescription'),''),
    coalesce(requested_payload->'categoryClaims','{}'::jsonb),coalesce(requested_payload->'mediaClaims','{}'::jsonb),'NEW'
  ) returning submission_reference into created_reference;

  insert into public.owner_submission_consents(owner_submission_id,party_id,purpose,privacy_notice_version,consent_source)
  select requested_submission_id,target_party_id,purpose,'M15-OWNER-INTAKE-2026-09-06','PUBLIC_SELL_YOUR_LAND'
  from unnest(array[
    'CONTACT_PERMISSION','INFORMATION_DECLARATION','PRIVACY_NOTICE',
    'PUBLICATION_REVIEW_ACKNOWLEDGEMENT','DOCUMENT_CERTIFICATION_ACKNOWLEDGEMENT'
  ]) as purposes(purpose);

  for document in select value from jsonb_array_elements(requested_documents) loop
    insert into public.private_documents(
      id,party_id,owner_submission_id,document_type,storage_bucket,object_path,mime_type,
      file_size_bytes,checksum_sha256,visibility,original_file_name,page_count,scan_status
    ) values (
      (document->>'id')::uuid,target_party_id,requested_submission_id,document->>'documentType',
      'owner-submissions-private',document->>'objectPath',document->>'mimeType',
      (document->>'fileSizeBytes')::bigint,document->>'checksumSha256','PRIVATE',
      nullif(document->>'originalFileName',''),nullif(document->>'pageCount','')::integer,
      (document->>'scanStatus')::public.document_scan_status
    );
    insert into public.owner_submission_documents(owner_submission_id,private_document_id,document_role)
      values(requested_submission_id,(document->>'id')::uuid,document->>'documentRole');
  end loop;

  insert into public.owner_submission_events(owner_submission_id,event_type,to_status,note)
    values(requested_submission_id,'SUBMITTED','NEW','Public owner submission received; all details remain private pending review');
  insert into public.audit_logs(action,entity_type,entity_id,changed_fields,after_state,reason)
    values('CREATE','owner_submission',requested_submission_id,
      array['status','category','transaction','consent','private_attachments'],
      jsonb_build_object('status','NEW','category',requested_payload->>'landCategory',
        'transaction',transaction_value,'attachmentCount',document_count),
      'M15 public owner intake; owner PII and claims omitted');
  insert into public.owner_submission_notification_deliveries(owner_submission_id,event_key)
    values(requested_submission_id,'OWNER_LAND_SUBMISSION:' || requested_idempotency_key_hash)
    returning id into created_notification_id;
  insert into public.owner_submission_idempotency(key_hash,payload_hash,owner_submission_id)
    values(requested_idempotency_key_hash,calculated_payload_hash,requested_submission_id);
  return query select requested_submission_id,created_reference,created_notification_id,false;
end;
$$;

create function public.record_owner_submission_notification_result(
  requested_delivery_id uuid,
  requested_status varchar,
  requested_error_code varchar default null
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then
    raise insufficient_privilege using message = 'Service role required';
  end if;
  if requested_status not in ('SENT','FAILED','SKIPPED') then raise exception 'INVALID_NOTIFICATION_STATUS'; end if;
  update public.owner_submission_notification_deliveries
    set status=requested_status,attempt_count=attempt_count+1,
      last_error_code=case when requested_status='FAILED' then left(coalesce(requested_error_code,'PROVIDER_FAILURE'),80) else null end
    where id=requested_delivery_id;
  if not found then raise exception 'OWNER_NOTIFICATION_NOT_FOUND'; end if;
end;
$$;

create function public.transition_owner_submission(
  requested_actor_id uuid,
  requested_submission_id uuid,
  requested_expected_version integer,
  requested_next_status public.owner_submission_status,
  requested_note text default null,
  requested_next_action_at timestamptz default null
) returns integer language plpgsql security definer set search_path = '' as $$
declare current_row public.owner_submissions%rowtype;
declare note_value text := nullif(btrim(requested_note),'');
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise insufficient_privilege using message='Service role required'; end if;
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  select * into current_row from public.owner_submissions where id=requested_submission_id and archived_at is null for update;
  if not found then raise exception 'OWNER_SUBMISSION_NOT_FOUND'; end if;
  if current_row.version<>requested_expected_version then raise exception using errcode='P0409',message='STALE_OWNER_SUBMISSION'; end if;
  if requested_next_status='CONVERTED' then raise exception 'CONVERSION_ACTION_REQUIRED'; end if;
  if not (
    (current_row.status='NEW' and requested_next_status in ('CONTACTED','ON_HOLD'))
    or (current_row.status='CONTACTED' and requested_next_status in ('DOCS_REQUESTED','UNDER_REVIEW','ON_HOLD'))
    or (current_row.status='DOCS_REQUESTED' and requested_next_status in ('UNDER_REVIEW','ON_HOLD'))
    or (current_row.status='UNDER_REVIEW' and requested_next_status in ('VERIFICATION_PENDING','APPROVED','REJECTED','ON_HOLD'))
    or (current_row.status='VERIFICATION_PENDING' and requested_next_status in ('APPROVED','ON_HOLD'))
    or (current_row.status='APPROVED' and requested_next_status='ON_HOLD')
    or (current_row.status='ON_HOLD' and requested_next_status='UNDER_REVIEW')
    or (current_row.status='REJECTED' and requested_next_status='CLOSED')
    or (current_row.status='CONVERTED' and requested_next_status='CLOSED')
  ) then raise exception 'OWNER_TRANSITION_NOT_ALLOWED'; end if;
  if requested_next_status in ('CONTACTED','DOCS_REQUESTED','REJECTED','ON_HOLD','CLOSED') and length(coalesce(note_value,''))<8 then
    raise exception 'OWNER_TRANSITION_NOTE_REQUIRED';
  end if;
  update public.owner_submissions set status=requested_next_status,
    first_contacted_at=case when requested_next_status='CONTACTED' then coalesce(first_contacted_at,now()) else first_contacted_at end,
    next_action_at=requested_next_action_at,notes_internal=case when note_value is null then notes_internal else concat_ws(E'\n',notes_internal,note_value) end,
    updated_by=requested_actor_id,version=version+1
    where id=requested_submission_id;
  insert into public.owner_submission_events(owner_submission_id,event_type,from_status,to_status,note,next_action_at,actor_admin_id)
    values(requested_submission_id,case when requested_next_status='DOCS_REQUESTED' then 'DOCUMENT_REQUESTED' else 'STATUS_CHANGED' end,
      current_row.status,requested_next_status,note_value,requested_next_action_at,requested_actor_id);
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
    values(requested_actor_id,'STATUS_CHANGE','owner_submission',requested_submission_id,array['status','next_action_at','version'],
      jsonb_build_object('status',current_row.status,'version',current_row.version),
      jsonb_build_object('status',requested_next_status,'version',current_row.version+1),
      'M15 controlled owner-submission transition; private note omitted');
  return current_row.version+1;
end;
$$;

create function public.add_owner_submission_note(
  requested_actor_id uuid,
  requested_submission_id uuid,
  requested_expected_version integer,
  requested_note text
) returns integer language plpgsql security definer set search_path = '' as $$
declare current_row public.owner_submissions%rowtype;
declare note_value text := nullif(btrim(requested_note),'');
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise insufficient_privilege using message='Service role required'; end if;
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  if length(coalesce(note_value,'')) not between 2 and 5000 then raise exception 'INVALID_OWNER_NOTE'; end if;
  select * into current_row from public.owner_submissions where id=requested_submission_id and archived_at is null for update;
  if not found then raise exception 'OWNER_SUBMISSION_NOT_FOUND'; end if;
  if current_row.version<>requested_expected_version then raise exception using errcode='P0409',message='STALE_OWNER_SUBMISSION'; end if;
  update public.owner_submissions set notes_internal=concat_ws(E'\n',notes_internal,note_value),updated_by=requested_actor_id,version=version+1
    where id=requested_submission_id;
  insert into public.owner_submission_events(owner_submission_id,event_type,from_status,to_status,note,actor_admin_id)
    values(requested_submission_id,'NOTE_ADDED',current_row.status,current_row.status,note_value,requested_actor_id);
  return current_row.version+1;
end;
$$;

create function public.assign_owner_submission(
  requested_actor_id uuid,
  requested_submission_id uuid,
  requested_expected_version integer,
  requested_assigned_to uuid default null
) returns integer language plpgsql security definer set search_path = '' as $$
declare current_row public.owner_submissions%rowtype;
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise insufficient_privilege using message='Service role required'; end if;
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  if requested_assigned_to is not null and not exists(
    select 1 from public.admin_profiles where user_id=requested_assigned_to and is_active
  ) then raise exception 'OWNER_ASSIGNEE_NOT_ACTIVE'; end if;
  select * into current_row from public.owner_submissions
    where id=requested_submission_id and archived_at is null for update;
  if not found then raise exception 'OWNER_SUBMISSION_NOT_FOUND'; end if;
  if current_row.version<>requested_expected_version then raise exception using errcode='P0409',message='STALE_OWNER_SUBMISSION'; end if;
  if current_row.status in ('CLOSED','CONVERTED') then raise exception 'OWNER_ASSIGNMENT_NOT_ALLOWED'; end if;
  if current_row.assigned_to is not distinct from requested_assigned_to then return current_row.version; end if;
  update public.owner_submissions set assigned_to=requested_assigned_to,
    updated_by=requested_actor_id,version=version+1
    where id=requested_submission_id;
  insert into public.owner_submission_events(owner_submission_id,event_type,from_status,to_status,note,actor_admin_id)
    values(requested_submission_id,'ASSIGNED',current_row.status,current_row.status,
      case when requested_assigned_to is null then 'Assignment cleared' else 'Assigned for review' end,
      requested_actor_id);
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
    values(requested_actor_id,'UPDATE','owner_submission',requested_submission_id,array['assigned_to','version'],
      jsonb_build_object('assignedTo',current_row.assigned_to,'version',current_row.version),
      jsonb_build_object('assignedTo',requested_assigned_to,'version',current_row.version+1),
      'M15 controlled owner-submission assignment');
  return current_row.version+1;
end;
$$;

create function public.convert_owner_submission_to_property(
  requested_actor_id uuid,
  requested_submission_id uuid,
  requested_expected_version integer,
  requested_payload jsonb
) returns table(target_property_id uuid,target_property_code varchar)
language plpgsql security definer set search_path = '' as $$
declare
  current_row public.owner_submissions%rowtype;
  target_id uuid;
  target_code varchar(13);
  parcel_id uuid;
  claims jsonb;
  chosen_visibility public.location_visibility;
  chosen_price_mode public.price_mode;
  relationship_role public.property_party_role;
  public_title text := nullif(btrim(requested_payload->>'listingTitle'),'');
  public_description text := nullif(btrim(requested_payload->>'publicDescription'),'');
begin
  if coalesce(auth.jwt()->>'role','') <> 'service_role' then raise insufficient_privilege using message='Service role required'; end if;
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  if requested_payload ? 'publicationStatus' or requested_payload ? 'publishedAt' or requested_payload ? 'verificationStatus' then
    raise exception 'CONVERSION_CANNOT_PUBLISH_OR_VERIFY';
  end if;
  select * into current_row from public.owner_submissions where id=requested_submission_id and archived_at is null for update;
  if not found then raise exception 'OWNER_SUBMISSION_NOT_FOUND'; end if;
  if current_row.version<>requested_expected_version then raise exception using errcode='P0409',message='STALE_OWNER_SUBMISSION'; end if;
  if current_row.status<>'APPROVED' then raise exception 'OWNER_SUBMISSION_NOT_APPROVED'; end if;
  if current_row.converted_property_id is not null then raise exception 'OWNER_SUBMISSION_ALREADY_CONVERTED'; end if;
  if current_row.district_id is null or current_row.approximate_area_value is null or current_row.approximate_area_unit_id is null then
    raise exception 'OWNER_SUBMISSION_INCOMPLETE';
  end if;
  if length(coalesce(public_title,''))<5 or length(coalesce(public_description,''))<10 then raise exception 'CURATED_PUBLIC_COPY_REQUIRED'; end if;
  chosen_visibility := coalesce(nullif(requested_payload->>'locationVisibility','')::public.location_visibility,'APPROXIMATE');
  chosen_price_mode := coalesce(nullif(requested_payload->>'priceMode','')::public.price_mode,'PRICE_ON_REQUEST');
  if chosen_price_mode='PRICE_RANGE' then raise exception 'OWNER_CONVERSION_PRICE_RANGE_UNSUPPORTED'; end if;
  if chosen_price_mode='EXACT_TOTAL' and coalesce(nullif(requested_payload->>'priceAmount','')::numeric,current_row.asking_price_amount) is null then raise exception 'CONVERSION_PRICE_REQUIRED'; end if;
  if chosen_price_mode='PER_UNIT' and (
    coalesce(nullif(requested_payload->>'pricePerUnit','')::numeric,current_row.asking_price_per_unit) is null
    or coalesce(nullif(requested_payload->>'priceUnitId','')::uuid,current_row.price_unit_id) is null
  ) then raise exception 'CONVERSION_PRICE_REQUIRED'; end if;
  claims := current_row.category_claims;
  relationship_role := case current_row.owner_relationship
    when 'OWNER' then 'OWNER'::public.property_party_role
    when 'CO_OWNER' then 'CO_OWNER'::public.property_party_role
    when 'AUTHORIZED_REPRESENTATIVE' then 'AUTHORIZED_REPRESENTATIVE'::public.property_party_role
    when 'BROKER_INTERMEDIARY' then 'INTERMEDIARY'::public.property_party_role
    else 'OTHER'::public.property_party_role end;

  insert into public.properties(
    land_category,primary_transaction_type,listing_title,short_description,description,
    district_id,subdistrict_id,place_id,public_address,display_area_value,display_area_unit_id,
    location_visibility,publication_status,availability_status,created_by,updated_by
  ) values (
    current_row.land_category,current_row.primary_transaction_type,public_title,left(public_description,1000),public_description,
    current_row.district_id,current_row.subdistrict_id,current_row.place_id,
    nullif(btrim(requested_payload->>'publicAddress'),''),current_row.approximate_area_value,current_row.approximate_area_unit_id,
    chosen_visibility,'DRAFT','AVAILABLE',requested_actor_id,requested_actor_id
  ) returning id,property_code into target_id,target_code;
  update public.properties set public_slug=trim(both '-' from regexp_replace(lower(public_title),'[^a-z0-9]+','-','g')) || '-' || lower(target_code)
    where id=target_id;

  insert into public.property_locations(property_id,private_latitude,private_longitude,public_latitude,public_longitude,location_visibility,location_notes)
    values(target_id,current_row.private_latitude,current_row.private_longitude,null,null,chosen_visibility,
      concat_ws(E'\n',nullif(current_row.broad_address,''),'Copied as private source location from owner submission '||current_row.submission_reference));

  insert into public.property_offers(property_id,transaction_type,price_mode,currency_code,price_amount,price_per_unit,price_unit_id,is_negotiable,commercial_terms,is_primary)
    values(target_id,current_row.primary_transaction_type,chosen_price_mode,'INR',
      case when chosen_price_mode='EXACT_TOTAL' then coalesce(nullif(requested_payload->>'priceAmount','')::numeric,current_row.asking_price_amount) end,
      case when chosen_price_mode='PER_UNIT' then coalesce(nullif(requested_payload->>'pricePerUnit','')::numeric,current_row.asking_price_per_unit) end,
      case when chosen_price_mode='PER_UNIT' then coalesce(nullif(requested_payload->>'priceUnitId','')::uuid,current_row.price_unit_id) end,
      coalesce((requested_payload->>'negotiable')::boolean,current_row.is_negotiable),
      'Owner-declared commercial input; requires UrbanEdge review before publication',true);

  if current_row.land_category='AGRICULTURAL' then
    insert into public.property_agricultural(property_id,tenure_type,irrigation_status,current_cultivation_status,road_touch,boundary_summary_public,created_by,updated_by)
      values(target_id,nullif(claims->>'tenureClaim',''),nullif(claims->>'waterIrrigation',''),nullif(claims->>'currentUse',''),
        case when nullif(claims->>'accessClaim','') is null then null else true end,null,requested_actor_id,requested_actor_id);
  elsif current_row.land_category='NA' then
    insert into public.property_na(property_id,na_status,na_purpose,road_width_m,frontage_m,restriction_summary,created_by,updated_by)
      values(target_id,coalesce(nullif(claims->>'naStatusClaim',''),'OWNER_CLAIM_UNSPECIFIED'),nullif(claims->>'naPurpose',''),
        nullif(claims->>'roadWidthMetres','')::numeric,nullif(claims->>'frontageMetres','')::numeric,
        'Owner-provided claims require UrbanEdge review',requested_actor_id,requested_actor_id);
  else
    insert into public.property_industrial(property_id,industrial_subtype,industrial_authority_name,industrial_tenure,gidc_plot_number,gidc_shed_number,permitted_industrial_use,road_width_m,power_status,connectivity_summary,created_by,updated_by)
      values(target_id,nullif(claims->>'industrialContext',''),nullif(claims->>'authorityName',''),nullif(claims->>'tenureClaim',''),
        nullif(claims->>'plotReference',''),nullif(claims->>'shedReference',''),nullif(claims->>'permittedUseClaim',''),
        nullif(claims->>'roadWidthMetres','')::numeric,nullif(claims->>'powerInfrastructure',''),nullif(claims->>'accessClaim',''),
        requested_actor_id,requested_actor_id);
  end if;

  if nullif(claims->>'surveyReference','') is not null or nullif(claims->>'blockReference','') is not null then
    insert into public.property_parcels(property_id,sequence_no,parcel_label,display_area_value,display_area_unit_id,notes_internal)
      values(target_id,1,'Owner-submitted parcel',current_row.approximate_area_value,current_row.approximate_area_unit_id,
        'Owner-provided parcel reference; not verified') returning id into parcel_id;
    insert into public.parcel_identifiers(parcel_id,identifier_type,identifier_value,normalized_value,is_primary,public_visibility)
      values(parcel_id,case when nullif(claims->>'blockReference','') is not null then 'BLOCK_NUMBER' else 'SURVEY_NUMBER' end,
        coalesce(nullif(claims->>'blockReference',''),claims->>'surveyReference'),
        upper(regexp_replace(coalesce(nullif(claims->>'blockReference',''),claims->>'surveyReference'),'\s+','','g')),true,'ADMIN_ONLY');
  end if;

  insert into public.property_parties(property_id,party_id,role,is_primary,notes_internal,created_by,updated_by)
    values(target_id,current_row.party_id,relationship_role,true,'Owner relationship copied from private submission; review authority before publication',requested_actor_id,requested_actor_id);
  insert into public.property_source_links(property_id,party_id,source_type,source_name,source_reference,notes_internal)
    values(target_id,current_row.party_id,'OWNER_SUBMISSION','Sell Your Land',current_row.submission_reference,'Private source relation; owner claims are unverified');
  update public.private_documents set property_id=target_id,updated_by=requested_actor_id
    where owner_submission_id=requested_submission_id and archived_at is null and scan_status='CLEAN';
  perform public.initialize_property_verifications(requested_actor_id,target_id);
  update public.owner_submissions set status='CONVERTED',converted_property_id=target_id,updated_by=requested_actor_id,version=version+1
    where id=requested_submission_id;
  insert into public.owner_submission_events(owner_submission_id,event_type,from_status,to_status,note,actor_admin_id)
    values(requested_submission_id,'CONVERTED','APPROVED','CONVERTED','Explicit admin conversion created draft '||target_code,requested_actor_id);
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
    values(requested_actor_id,'CREATE','property',target_id,array['source_submission','publication_status','private_documents'],
      jsonb_build_object('ownerSubmissionStatus','APPROVED'),
      jsonb_build_object('ownerSubmissionId',requested_submission_id,'propertyCode',target_code,'publicationStatus','DRAFT'),
      'M15 explicit owner-submission conversion; private owner data omitted');
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
    values(requested_actor_id,'STATUS_CHANGE','owner_submission',requested_submission_id,array['status','converted_property_id','version'],
      jsonb_build_object('status','APPROVED','version',current_row.version),
      jsonb_build_object('status','CONVERTED','propertyId',target_id,'version',current_row.version+1),
      'M15 explicit unique conversion to property draft');
  return query select target_id,target_code;
end;
$$;

revoke all on function public.consume_public_intake_rate_limit(varchar,char,integer,integer) from public,anon,authenticated;
revoke all on function public.submit_owner_land_submission(uuid,char,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.record_owner_submission_notification_result(uuid,varchar,varchar) from public,anon,authenticated;
revoke all on function public.transition_owner_submission(uuid,uuid,integer,public.owner_submission_status,text,timestamptz) from public,anon,authenticated;
revoke all on function public.add_owner_submission_note(uuid,uuid,integer,text) from public,anon,authenticated;
revoke all on function public.assign_owner_submission(uuid,uuid,integer,uuid) from public,anon,authenticated;
revoke all on function public.convert_owner_submission_to_property(uuid,uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.consume_public_intake_rate_limit(varchar,char,integer,integer) to service_role;
grant execute on function public.submit_owner_land_submission(uuid,char,jsonb,jsonb) to service_role;
grant execute on function public.record_owner_submission_notification_result(uuid,varchar,varchar) to service_role;
grant execute on function public.transition_owner_submission(uuid,uuid,integer,public.owner_submission_status,text,timestamptz) to service_role;
grant execute on function public.add_owner_submission_note(uuid,uuid,integer,text) to service_role;
grant execute on function public.assign_owner_submission(uuid,uuid,integer,uuid) to service_role;
grant execute on function public.convert_owner_submission_to_property(uuid,uuid,integer,jsonb) to service_role;

comment on table public.owner_submission_events is 'M15 append-only private owner-supply workflow history.';
comment on column public.owner_submissions.category_claims is 'Owner-provided category claims; never verification or public copy by themselves.';
comment on column public.owner_submissions.location_visibility_preference is 'Owner preference only; conversion and publication require separate UrbanEdge decisions.';
comment on function public.convert_owner_submission_to_property(uuid,uuid,integer,jsonb) is 'M15 service-role-only atomic conversion. Creates DRAFT and cannot publish.';
