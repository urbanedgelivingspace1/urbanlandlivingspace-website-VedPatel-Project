-- M20: Simplify publication readiness and CRM intake for Admin UX redesign
-- 1. Add SELLER_LEAD to lead_inquiry_type enum
alter type public.lead_inquiry_type add value if not exists 'SELLER_LEAD';

-- Properties created from seller leads use the existing source-link model. This
-- keeps buyer matching in lead_properties while supporting Seller Lead -> 0..N Properties.
create index if not exists property_source_links_seller_lead_idx
  on public.property_source_links(source_reference, property_id)
  where source_type = 'SELLER_LEAD';

-- 2. Update party_consents, public_intake_idempotency, and public_rate_limit_events constraints
alter table public.party_consents drop constraint if exists party_consents_purpose_check;
alter table public.party_consents add constraint party_consents_purpose_check
  check (purpose in ('INQUIRY_CONTACT','REQUIREMENT_CONTACT','SITE_VISIT_CONTACT','GENERAL_CONTACT','SELLER_CONTACT'));

alter table public.public_intake_idempotency drop constraint if exists public_intake_idempotency_intake_action_check;
alter table public.public_intake_idempotency add constraint public_intake_idempotency_intake_action_check
  check (intake_action in ('PROPERTY_INQUIRY','BUYER_REQUIREMENT','SITE_VISIT_REQUEST','GENERAL_CONTACT','SELLER_LEAD'));

alter table public.public_rate_limit_events drop constraint if exists public_rate_limit_events_intake_action_check;
alter table public.public_rate_limit_events add constraint public_rate_limit_events_intake_action_check
  check (intake_action in ('PROPERTY_INQUIRY','BUYER_REQUIREMENT','SITE_VISIT_REQUEST','GENERAL_CONTACT','PUBLIC_INTENT','OWNER_LAND_SUBMISSION','SELLER_LEAD'));

-- The existing verification-documents-private bucket is intentionally reused for
-- ordinary property and seller-intake files: it is private, has no browser object
-- policies, uses short-lived audited signed URLs, and verification_evidence links
-- are optional. No public-sharing switch is introduced.
create unique index if not exists private_documents_active_lead_duplicate_uidx
  on public.private_documents(party_id, document_reference, document_type, checksum_sha256)
  where document_reference like 'LEAD:%' and checksum_sha256 is not null and archived_at is null;

create function public.register_lead_private_document(
  requested_actor_id uuid,
  requested_payload jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  target_id uuid := (requested_payload ->> 'id')::uuid;
  target_lead_id uuid := (requested_payload ->> 'leadId')::uuid;
  target_party_id uuid;
  existing_id uuid;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise insufficient_privilege using message = 'Service role required';
  end if;
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then
    raise insufficient_privilege using message = 'Active admin actor required';
  end if;
  select party_id into target_party_id from public.leads
    where id=target_lead_id and archived_at is null;
  if target_party_id is null then raise exception 'Lead not found'; end if;
  if requested_payload ? 'visibility' or requested_payload ? 'bucket' or requested_payload ? 'path' then
    raise exception 'Client-controlled visibility, bucket, and path fields are not accepted';
  end if;
  if requested_payload ->> 'objectPath' !~ ('^leads/' || target_lead_id || '/documents/[0-9a-f-]+[.](pdf|jpg|png)$') then
    raise exception 'Invalid controlled lead document path';
  end if;
  select id into existing_id from public.private_documents
    where party_id=target_party_id and document_reference='LEAD:' || target_lead_id
      and document_type=requested_payload ->> 'documentType'
      and checksum_sha256=requested_payload ->> 'checksumSha256' and archived_at is null
    limit 1;
  if existing_id is not null then return existing_id; end if;
  insert into public.private_documents(
    id,party_id,document_type,storage_bucket,object_path,mime_type,file_size_bytes,
    checksum_sha256,document_reference,visibility,original_file_name,page_count,scan_status,
    created_by,updated_by
  ) values (
    target_id,target_party_id,requested_payload ->> 'documentType',
    'verification-documents-private',requested_payload ->> 'objectPath',requested_payload ->> 'mimeType',
    (requested_payload ->> 'fileSizeBytes')::bigint,requested_payload ->> 'checksumSha256',
    'LEAD:' || target_lead_id,'PRIVATE',nullif(requested_payload ->> 'originalFileName',''),
    nullif(requested_payload ->> 'pageCount','')::integer,
    (requested_payload ->> 'scanStatus')::public.document_scan_status,requested_actor_id,requested_actor_id
  );
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,after_state,reason)
  values(requested_actor_id,'CREATE','private_document',target_id,array['lead_id','document_type','scan_status'],
    jsonb_build_object('leadId',target_lead_id,'documentType',requested_payload ->> 'documentType','scanStatus',requested_payload ->> 'scanStatus'),
    'M20 private seller-lead document upload');
  return target_id;
end;
$$;

revoke all on function public.register_lead_private_document(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.register_lead_private_document(uuid,jsonb) to service_role;

-- 3. Update consume_public_intake_rate_limit to accept SELLER_LEAD
create or replace function public.consume_public_intake_rate_limit(
  requested_action varchar,
  requested_bucket_hash char(64),
  requested_max_attempts integer,
  requested_window_seconds integer
) returns boolean language plpgsql security definer set search_path = '' as $$
declare recent_count integer;
begin
  if requested_action not in ('PROPERTY_INQUIRY','BUYER_REQUIREMENT','SITE_VISIT_REQUEST','GENERAL_CONTACT','PUBLIC_INTENT','OWNER_LAND_SUBMISSION','SELLER_LEAD')
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

-- 4. Update submit_public_crm_intake to support SELLER_LEAD
create or replace function public.submit_public_crm_intake(
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
  if requested_action not in ('PROPERTY_INQUIRY','BUYER_REQUIREMENT','SITE_VISIT_REQUEST','GENERAL_CONTACT','SELLER_LEAD') then
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
    when 'SELLER_LEAD' then 'SELL_YOUR_LAND_PAGE'
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
    when 'SELLER_LEAD' then 'SELLER_CONTACT'
    else 'GENERAL_CONTACT' end;

  insert into public.leads(party_id,source_type,source_detail,inquiry_type,buyer_type,preferred_transaction,
    land_category,budget_min,budget_max,budget_currency,district_id,subdistrict_id,place_id,locality_text,
    intended_use,status,notes_internal)
  values(target_party_id,'WEBSITE',source_detail_value,requested_action::public.lead_inquiry_type,
    nullif(requested_payload->>'buyerType','')::public.buyer_type,
    coalesce(nullif(requested_payload->>'preferredTransaction','')::public.transaction_type,resolved_property_transaction, 'BUY'),
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
  elsif requested_action='SELLER_LEAD' then
    if nullif(requested_payload->>'areaValue','') is not null then
      insert into public.lead_requirements(lead_id,min_area_value,max_area_value,area_unit_id,preferred_use_text)
        values(created_lead_id,nullif(requested_payload->>'areaValue','')::numeric,
          nullif(requested_payload->>'areaValue','')::numeric,nullif(requested_payload->>'areaUnitId','')::uuid,
          nullif(concat_ws(E'\n',nullif(trim(requested_payload->>'expectedPrice'),''),message_value),''));
    end if;
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
      values(created_lead_id,resolved_property_id,'REQUESTED',
        (requested_payload->>'requestedStartAt')::timestamptz,
        (requested_payload->>'requestedEndAt')::timestamptz,
        nullif(concat_ws(E'\n',message_value,nullif(trim(requested_payload->>'alternateTime'),'')),''));
    insert into public.lead_activities(lead_id,activity_type,property_id,note)
      values(created_lead_id,'SITE_VISIT_REQUESTED',resolved_property_id,
        'Public visit request received; manual confirmation required');
  else
    insert into public.lead_activities(lead_id,activity_type,note)
      values(created_lead_id,'GENERAL_CONTACT_RECEIVED',message_value);
  end if;

  insert into public.party_consents(party_id,lead_id,purpose,privacy_notice_version,consent_source,consented_at)
    values(target_party_id,created_lead_id,consent_purpose,requested_payload->>'privacyNoticeVersion',
      'PUBLIC_' || requested_action,now());

  insert into public.audit_logs(action,entity_type,entity_id,changed_fields,after_state)
    values('CREATE','lead',created_lead_id,array['source','demand','consent'],
      jsonb_build_object('status','NEW','source','WEBSITE','inquiryType',requested_action));

  insert into public.public_intake_idempotency(intake_action,key_hash,payload_hash,lead_id,property_id)
    values(requested_action,requested_idempotency_key_hash,calculated_payload_hash,created_lead_id,resolved_property_id);

  insert into public.notification_deliveries(lead_id,notification_type,event_key)
    values(created_lead_id,'ADMIN_PUBLIC_INTAKE',requested_action || ':' || requested_idempotency_key_hash)
    returning id into created_notification_id;

  return query select created_lead_id,resolved_property_id,created_notification_id,false;
end; $$;

-- 5. Redesign property_publication_readiness for Marketing Readiness
-- Category fields are OPTIONAL (never block publication).
-- Scoped verification checks are decoupled from publication gate (remain internal/optional).
create or replace function public.property_publication_readiness(requested_property_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  property_row public.properties%rowtype;
  location_row public.property_locations%rowtype;
  offer_row public.property_offers%rowtype;
  agricultural_row public.property_agricultural%rowtype;
  na_row public.property_na%rowtype;
  industrial_row public.property_industrial%rowtype;
  blockers jsonb := '[]'::jsonb;
  warnings jsonb := '[]'::jsonb;
  claim_text text;
begin
  select * into property_row from public.properties
    where id = requested_property_id and deleted_at is null;
  if not found then raise exception 'Property not found'; end if;

  select * into location_row from public.property_locations where property_id = requested_property_id;
  select * into offer_row from public.property_offers
    where property_id = requested_property_id and archived_at is null and is_primary
    order by created_at, id limit 1;
  select * into agricultural_row from public.property_agricultural where property_id = requested_property_id;
  select * into na_row from public.property_na where property_id = requested_property_id;
  select * into industrial_row from public.property_industrial where property_id = requested_property_id;

  if property_row.publication_status = 'ARCHIVED' or property_row.archived_at is not null then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','IDENTITY','code','PROPERTY_ARCHIVED','message','Restore the archived property before publication review.'));
  elsif property_row.publication_status not in ('DRAFT','UNDER_REVIEW','UNPUBLISHED','PUBLISHED') then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','IDENTITY','code','INVALID_PUBLICATION_STATE','message','The current publication state cannot enter the publish workflow.'));
  end if;

  if property_row.property_code !~ '^UE-LS-[0-9]{6}$' then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','IDENTITY','code','INVALID_PROPERTY_CODE','message','The immutable Property ID is invalid.'));
  end if;

  if property_row.public_slug is null or property_row.public_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','IDENTITY','code','INVALID_PUBLIC_SLUG','message','Add a lowercase public slug containing only words, numbers, and hyphens.'));
  end if;

  if length(btrim(coalesce(property_row.listing_title,''))) < 5 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','MISSING_PUBLIC_TITLE','message','Add a specific public title of at least 5 characters.'));
  end if;

  if length(btrim(coalesce(property_row.short_description,''))) < 10 and length(btrim(coalesce(property_row.description,''))) < 20 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','MISSING_PUBLIC_DESCRIPTION','message','Add a public description or summary of at least 20 characters.'));
  end if;

  if length(btrim(coalesce(property_row.public_address,''))) < 3 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','MISSING_PUBLIC_LOCATION_TEXT','message','Add safe public location text.'));
  end if;

  if not exists(select 1 from public.districts where id = property_row.district_id and is_active) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','INVALID_PUBLIC_DISTRICT','message','Choose an active service district.'));
  end if;

  if not exists(select 1 from public.area_units where id = property_row.display_area_unit_id and is_public_v1) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','INVALID_PUBLIC_AREA_UNIT','message','Choose a public V1 area unit.'));
  end if;

  if property_row.display_area_value is null or property_row.display_area_value <= 0 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','INVALID_DISPLAY_AREA','message','Area must be greater than zero.'));
  end if;

  -- Location Privacy Mode validation
  if location_row.property_id is null or location_row.location_visibility <> property_row.location_visibility then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','LOCATION_MODE_MISMATCH','message','The property and location privacy modes must match.'));
  elsif location_row.location_visibility = 'HIDDEN' and (location_row.public_latitude is not null or location_row.public_longitude is not null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','HIDDEN_LOCATION_EXPOSED','message','Hidden location mode cannot contain a public coordinate.'));
  elsif location_row.location_visibility = 'APPROXIMATE'
    and location_row.private_latitude is not null
    and location_row.public_latitude = location_row.private_latitude
    and location_row.public_longitude = location_row.private_longitude then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','APPROXIMATE_EQUALS_PRIVATE','message','Approximate public coordinates cannot equal the stored exact point.'));
  elsif location_row.location_visibility = 'EXACT' and (location_row.public_latitude is null or location_row.public_longitude is null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','EXACT_PUBLIC_POINT_MISSING','message','Exact disclosure requires an explicit public coordinate pair.'));
  end if;

  -- Offer & Pricing validation: PRICE_ON_REQUEST requires no numeric price
  if offer_row.id is null or offer_row.transaction_type <> property_row.primary_transaction_type then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PRIMARY_OFFER_MISSING','message','Add one active primary offer matching the primary transaction.'));
  elsif offer_row.price_mode = 'PRICE_ON_REQUEST' and (offer_row.price_amount is not null or offer_row.price_min is not null or offer_row.price_max is not null or offer_row.price_per_unit is not null or offer_row.price_unit_id is not null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PRICE_ON_REQUEST_CONTRADICTION','message','Price on Request cannot carry a numeric price.'));
  elsif offer_row.price_mode = 'EXACT_TOTAL' and (offer_row.price_amount is null or offer_row.price_amount <= 0) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','EXACT_PRICE_MISSING','message','Exact Total requires a positive price amount.'));
  elsif offer_row.price_mode = 'PRICE_RANGE' and (offer_row.price_min is null or offer_row.price_max is null or offer_row.price_min <= 0 or offer_row.price_max <= 0 or offer_row.price_min > offer_row.price_max) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PRICE_RANGE_INVALID','message','Price Range requires an ordered minimum and maximum.'));
  elsif offer_row.price_mode = 'PER_UNIT' and (offer_row.price_per_unit is null or offer_row.price_per_unit <= 0 or offer_row.price_unit_id is null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PER_UNIT_PRICE_INVALID','message','Per Unit pricing requires a positive amount and unit.'));
  end if;

  -- Availability checks: CLOSED_WON does NOT change property availability automatically
  if property_row.availability_status = 'OFF_MARKET' then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','PUBLIC_PROJECTION','code','OFF_MARKET_NOT_PUBLISHABLE','message','Off-market inventory cannot be newly published.'));
  elsif property_row.availability_status in ('SOLD','RENTED','LEASED') then
    warnings := warnings || jsonb_build_array(jsonb_build_object('group','PUBLIC_PROJECTION','code','CLOSED_AVAILABILITY','message','The public representation clearly retains this closed availability state.'));
  end if;

  -- Cover image requirement (at least 1 approved public photo)
  if not exists(select 1 from public.media_assets where property_id = requested_property_id
    and archived_at is null and media_type = 'IMAGE' and is_cover and visibility = 'PUBLIC'
    and processing_status = 'APPROVED' and approved_at is not null
    and storage_bucket = 'property-media-public' and nullif(btrim(alt_text),'') is not null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','MEDIA','code','APPROVED_COVER_MISSING','message','Choose one approved public cover image with alt text.'));
  end if;

  -- Category-specific fields are OPTIONAL (RULE 2):
  -- Missing optional Agricultural/NA/Industrial fields NEVER block publication.
  -- Only warn if relevant category data is absent.
  if property_row.land_category = 'AGRICULTURAL' and (
    agricultural_row.property_id is null or agricultural_row.tenure_type is null
  ) then
    warnings := warnings || jsonb_build_array(jsonb_build_object('group','CATEGORY_DATA','code','AGRICULTURAL_DATA_OPTIONAL','message','Optional agricultural tenure details have not been specified.'));
  elsif property_row.land_category = 'NA' and (
    na_row.property_id is null or na_row.na_status is null or na_row.na_status = 'UNSPECIFIED'
  ) then
    warnings := warnings || jsonb_build_array(jsonb_build_object('group','CATEGORY_DATA','code','NA_DATA_OPTIONAL','message','Optional NA status/purpose details have not been specified.'));
  elsif property_row.land_category = 'INDUSTRIAL' and (
    industrial_row.property_id is null or industrial_row.industrial_subtype is null
  ) then
    warnings := warnings || jsonb_build_array(jsonb_build_object('group','CATEGORY_DATA','code','INDUSTRIAL_DATA_OPTIONAL','message','Optional industrial subtype details have not been specified.'));
  end if;

  -- Prohibited claims screening (100% clear title, guaranteed NA, etc.)
  claim_text := lower(concat_ws(' ', property_row.listing_title, property_row.short_description, property_row.description, property_row.public_address,
    agricultural_row.boundary_summary_public,
    (select planning_notes_public from public.property_planning_context where property_id=requested_property_id and archived_at is null order by created_at limit 1)));
  if claim_text ~ '(100% clear title|clear title|legally verified|government approved|fully verified|dispute[ -]free|guaranteed na|guaranteed construction|risk[ -]free|no legal issues)' then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CLAIMS_VERIFICATION','code','UNSAFE_PUBLIC_CLAIM','message','Remove prohibited legal, approval, title, construction, or risk guarantee wording.'));
  end if;

  return jsonb_build_object(
    'propertyId', property_row.id,
    'propertyCode', property_row.property_code,
    'publicSlug', property_row.public_slug,
    'publicationStatus', property_row.publication_status,
    'availabilityStatus', property_row.availability_status,
    'locationVisibility', property_row.location_visibility,
    'ready', jsonb_array_length(blockers) = 0,
    'blockers', blockers,
    'warnings', warnings,
    'evaluatedAt', now()
  );
end;
$$;
