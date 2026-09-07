-- M9: authoritative publication readiness, atomic publish/unpublish, and indexability source.

create or replace function public.property_publication_readiness(requested_property_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
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
  required_code text;
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

  if length(btrim(coalesce(property_row.listing_title,''))) < 10 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','MISSING_PUBLIC_TITLE','message','Add a specific public title of at least 10 characters.'));
  end if;
  if length(btrim(coalesce(property_row.short_description,''))) < 20 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','MISSING_PUBLIC_SUMMARY','message','Add a public summary of at least 20 characters.'));
  end if;
  if length(btrim(coalesce(property_row.description,''))) < 40 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','MISSING_PUBLIC_DESCRIPTION','message','Add a public description of at least 40 characters.'));
  end if;
  if length(btrim(coalesce(property_row.public_address,''))) < 5 then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','MISSING_PUBLIC_LOCATION_TEXT','message','Add safe public location text.'));
  end if;
  if not exists(select 1 from public.districts where id = property_row.district_id and is_active) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','LOCATION_PRIVACY','code','INVALID_PUBLIC_DISTRICT','message','Choose an active service district.'));
  end if;
  if not exists(select 1 from public.area_units where id = property_row.display_area_unit_id and is_public_v1) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CONTENT','code','INVALID_PUBLIC_AREA_UNIT','message','Choose a public V1 area unit.'));
  end if;

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

  if offer_row.id is null or offer_row.transaction_type <> property_row.primary_transaction_type then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PRIMARY_OFFER_MISSING','message','Add one active primary offer matching the primary transaction.'));
  elsif offer_row.price_mode = 'PRICE_ON_REQUEST' and (offer_row.price_amount is not null or offer_row.price_min is not null or offer_row.price_max is not null or offer_row.price_per_unit is not null or offer_row.price_unit_id is not null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PRICE_ON_REQUEST_CONTRADICTION','message','Price on Request cannot carry a numeric price.'));
  elsif offer_row.price_mode = 'EXACT_TOTAL' and offer_row.price_amount is null then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','EXACT_PRICE_MISSING','message','Exact Total requires a price amount.'));
  elsif offer_row.price_mode = 'PRICE_RANGE' and (offer_row.price_min is null or offer_row.price_max is null or offer_row.price_min > offer_row.price_max) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PRICE_RANGE_INVALID','message','Price Range requires an ordered minimum and maximum.'));
  elsif offer_row.price_mode = 'PER_UNIT' and (offer_row.price_per_unit is null or offer_row.price_unit_id is null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','OFFER_PRICE','code','PER_UNIT_PRICE_INVALID','message','Per Unit pricing requires an amount and unit.'));
  end if;

  if property_row.availability_status = 'OFF_MARKET' then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','PUBLIC_PROJECTION','code','OFF_MARKET_NOT_PUBLISHABLE','message','Off-market inventory cannot be newly published.'));
  elsif property_row.availability_status in ('SOLD','RENTED','LEASED') then
    warnings := warnings || jsonb_build_array(jsonb_build_object('group','PUBLIC_PROJECTION','code','CLOSED_AVAILABILITY','message','The public representation must clearly retain this closed availability state.'));
  end if;

  if not exists(select 1 from public.media_assets where property_id = requested_property_id
    and archived_at is null and media_type = 'IMAGE' and is_cover and visibility = 'PUBLIC'
    and processing_status = 'APPROVED' and approved_at is not null
    and storage_bucket = 'property-media-public' and nullif(btrim(alt_text),'') is not null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','MEDIA','code','APPROVED_COVER_MISSING','message','Choose one approved public cover image with alt text.'));
  end if;

  if not exists(select 1 from public.property_source_links where property_id = requested_property_id)
    and not exists(select 1 from public.property_parties where property_id = requested_property_id and archived_at is null) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','IDENTITY','code','SOURCE_RELATIONSHIP_MISSING','message','Record an owner or source relationship before publication.'));
  end if;

  if property_row.land_category = 'AGRICULTURAL' then
    if agricultural_row.property_id is null or nullif(btrim(agricultural_row.tenure_type),'') is null
      or nullif(btrim(agricultural_row.irrigation_status),'') is null or agricultural_row.road_touch is null then
      blockers := blockers || jsonb_build_array(jsonb_build_object('group','CATEGORY_DATA','code','AGRICULTURAL_DATA_INCOMPLETE','message','Agricultural publication requires tenure, irrigation/use context, and road-access context.'));
    end if;
    required_code := 'REVENUE_RECORDS_REVIEWED';
  elsif property_row.land_category = 'NA' then
    if na_row.property_id is null or nullif(btrim(na_row.na_status),'') is null
      or upper(na_row.na_status) in ('CHECK_PENDING','UNKNOWN') or nullif(btrim(na_row.na_purpose),'') is null
      or na_row.road_width_m is null then
      blockers := blockers || jsonb_build_array(jsonb_build_object('group','CATEGORY_DATA','code','NA_DATA_INCOMPLETE','message','NA publication requires recorded status, purpose, and public road/access context.'));
    end if;
    required_code := 'NA_ORDER_REVIEWED';
  else
    if industrial_row.property_id is null or nullif(btrim(industrial_row.industrial_subtype),'') is null
      or nullif(btrim(industrial_row.industrial_tenure),'') is null
      or nullif(btrim(industrial_row.power_status),'') is null
      or nullif(btrim(industrial_row.connectivity_summary),'') is null then
      blockers := blockers || jsonb_build_array(jsonb_build_object('group','CATEGORY_DATA','code','INDUSTRIAL_DATA_INCOMPLETE','message','Industrial publication requires subtype, tenure, power/infrastructure, and access/connectivity context.'));
    end if;
    required_code := 'INDUSTRIAL_DESIGNATION_REVIEWED';
  end if;

  foreach required_code in array array['PROPERTY_IDENTITY_REVIEWED', required_code] loop
    if not exists(
      select 1 from public.property_verifications verification
      join public.verification_check_definitions definition on definition.id = verification.check_definition_id
      where verification.property_id = requested_property_id and definition.code = required_code
        and verification.applicability = 'APPLICABLE'
        and verification.status in ('PASSED','PASSED_WITH_NOTE')
        and verification.reviewed_by is not null and verification.reviewed_at is not null
        and length(btrim(coalesce(verification.scope_statement,''))) >= 20
        and (verification.recheck_at is null or verification.recheck_at > now())
        and not exists(select 1 from public.verification_exceptions exception
          where exception.property_verification_id = verification.id and exception.status = 'OPEN'
            and exception.blocks_public_disclosure)
        and exists(select 1 from public.verification_evidence evidence
          left join public.private_documents document on document.id = evidence.private_document_id
          where evidence.property_verification_id = verification.id and evidence.supports_check
            and evidence.provenance_state not in ('SUPERSEDED','REVOKED')
            and public.verification_provenance_rank(evidence.provenance_state) >= public.verification_provenance_rank(definition.minimum_provenance)
            and (evidence.private_document_id is null or (document.scan_status = 'CLEAN' and document.archived_at is null)))
    ) then
      blockers := blockers || jsonb_build_array(jsonb_build_object('group','CLAIMS_VERIFICATION','code','REQUIRED_CHECK_UNSUPPORTED','checkCode',required_code,'message','Complete the scoped internal check and required current evidence before publishing this category claim.'));
    end if;
  end loop;

  claim_text := lower(concat_ws(' ', property_row.listing_title, property_row.short_description, property_row.description, property_row.public_address,
    agricultural_row.boundary_summary_public,
    (select planning_notes_public from public.property_planning_context where property_id=requested_property_id and archived_at is null order by created_at limit 1)));
  if claim_text ~ '(100% clear title|clear title|legally verified|government approved|fully verified|dispute[ -]free|guaranteed na|guaranteed construction|risk[ -]free|no legal issues)' then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CLAIMS_VERIFICATION','code','UNSAFE_PUBLIC_CLAIM','message','Remove prohibited legal, approval, title, construction, or risk guarantee wording.'));
  end if;
  if property_row.land_category = 'INDUSTRIAL' and claim_text ~ '\mgidc\M'
    and not exists(
      select 1 from public.property_verifications verification
      join public.verification_check_definitions definition on definition.id=verification.check_definition_id
      where verification.property_id=requested_property_id and definition.code='GIDC_RECORDS_REVIEWED'
        and verification.applicability='APPLICABLE' and verification.status in ('PASSED','PASSED_WITH_NOTE')
        and (verification.recheck_at is null or verification.recheck_at > now())
    ) then
    blockers := blockers || jsonb_build_array(jsonb_build_object('group','CLAIMS_VERIFICATION','code','GIDC_CLAIM_UNSUPPORTED','message','A public GIDC claim requires a current scoped GIDC records check.'));
  end if;

  if not exists(select 1 from public.verification_public_copy_policies where approval_status='APPROVED') then
    warnings := warnings || jsonb_build_array(jsonb_build_object('group','CLAIMS_VERIFICATION','code','PUBLIC_VERIFICATION_COPY_DISABLED','message','Publication may proceed, but no gated verification label will appear until lawyer-approved copy exists.'));
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

create or replace function public.get_property_publication_readiness(
  requested_actor_id uuid, requested_property_id uuid
) returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  return public.property_publication_readiness(requested_property_id);
end;
$$;

create or replace function public.publish_property(
  requested_actor_id uuid, requested_property_id uuid, requested_expected_updated_at timestamptz
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_row public.properties%rowtype; readiness jsonb;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  select * into current_row from public.properties where id=requested_property_id and deleted_at is null for update;
  if not found then raise exception 'Property not found'; end if;
  if current_row.updated_at <> requested_expected_updated_at then raise exception using errcode='P0409',message='Property has changed since it was loaded'; end if;
  if current_row.publication_status not in ('DRAFT','UNDER_REVIEW','UNPUBLISHED') then raise exception 'Only draft, under-review, or unpublished properties may be published'; end if;
  readiness := public.property_publication_readiness(requested_property_id);
  if not coalesce((readiness->>'ready')::boolean,false) then raise exception using errcode='P0001',message='Publication blocked',detail=readiness::text; end if;
  update public.properties set publication_status='PUBLISHED',published_at=now(),published_by=requested_actor_id,
    archived_at=null,archived_by=null,updated_by=requested_actor_id where id=requested_property_id;
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
  values(requested_actor_id,'PUBLISH','property',requested_property_id,array['publication_status','published_at','published_by'],
    jsonb_build_object('publicationStatus',current_row.publication_status,'availabilityStatus',current_row.availability_status),
    jsonb_build_object('publicationStatus','PUBLISHED','availabilityStatus',current_row.availability_status,'publicSlug',current_row.public_slug),
    'M9 atomic publication gate passed');
  return public.property_publication_readiness(requested_property_id);
end;
$$;

create or replace function public.unpublish_property(
  requested_actor_id uuid, requested_property_id uuid, requested_expected_updated_at timestamptz, requested_reason text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare current_row public.properties%rowtype;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  if length(btrim(coalesce(requested_reason,''))) < 10 then raise exception 'Unpublish requires a specific reason'; end if;
  select * into current_row from public.properties where id=requested_property_id and deleted_at is null for update;
  if not found then raise exception 'Property not found'; end if;
  if current_row.updated_at <> requested_expected_updated_at then raise exception using errcode='P0409',message='Property has changed since it was loaded'; end if;
  if current_row.publication_status <> 'PUBLISHED' then raise exception 'Only a published property may be unpublished'; end if;
  update public.properties set publication_status='UNPUBLISHED',updated_by=requested_actor_id where id=requested_property_id;
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
  values(requested_actor_id,'UNPUBLISH','property',requested_property_id,array['publication_status'],
    jsonb_build_object('publicationStatus','PUBLISHED','availabilityStatus',current_row.availability_status),
    jsonb_build_object('publicationStatus','UNPUBLISHED','availabilityStatus',current_row.availability_status),btrim(requested_reason));
  return requested_property_id;
end;
$$;

create or replace function public.archive_property_draft(
  requested_property_id uuid, requested_expected_updated_at timestamptz, requested_actor_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare current_row public.properties%rowtype;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  select * into current_row from public.properties where id=requested_property_id and deleted_at is null for update;
  if not found then raise exception 'Property not found'; end if;
  if current_row.updated_at <> requested_expected_updated_at then raise exception using errcode='P0409',message='Property has changed since it was loaded'; end if;
  if current_row.publication_status not in ('DRAFT','UNDER_REVIEW','UNPUBLISHED') then raise exception 'Unpublish a published property before archiving'; end if;
  update public.properties set publication_status='ARCHIVED',availability_status='OFF_MARKET',archived_at=now(),archived_by=requested_actor_id,updated_by=requested_actor_id where id=requested_property_id;
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
  values(requested_actor_id,'ARCHIVE','property',requested_property_id,array['publication_status','availability_status','archived_at'],
    jsonb_build_object('publicationStatus',current_row.publication_status,'availabilityStatus',current_row.availability_status),
    jsonb_build_object('publicationStatus','ARCHIVED','availabilityStatus','OFF_MARKET'),'M9 safe archive after public exclusion');
  return requested_property_id;
end;
$$;

create or replace function public.restore_property_draft(
  requested_property_id uuid, requested_expected_updated_at timestamptz, requested_actor_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare current_row public.properties%rowtype;
begin
  if not exists(select 1 from public.admin_profiles where user_id=requested_actor_id and is_active) then raise insufficient_privilege using message='Active admin actor required'; end if;
  select * into current_row from public.properties where id=requested_property_id and deleted_at is null for update;
  if not found then raise exception 'Property not found'; end if;
  if current_row.updated_at <> requested_expected_updated_at then raise exception using errcode='P0409',message='Property has changed since it was loaded'; end if;
  if current_row.publication_status <> 'ARCHIVED' then raise exception 'Only archived properties may be restored'; end if;
  update public.properties set publication_status='DRAFT',availability_status='AVAILABLE',archived_at=null,archived_by=null,updated_by=requested_actor_id where id=requested_property_id;
  insert into public.audit_logs(actor_admin_id,action,entity_type,entity_id,changed_fields,before_state,after_state,reason)
  values(requested_actor_id,'RESTORE','property',requested_property_id,array['publication_status','availability_status','archived_at'],
    jsonb_build_object('publicationStatus','ARCHIVED','availabilityStatus',current_row.availability_status),
    jsonb_build_object('publicationStatus','DRAFT','availabilityStatus','AVAILABLE'),'M9 explicit restore to private draft');
  return requested_property_id;
end;
$$;

alter table public.properties add constraint properties_archived_off_market_check
  check (publication_status <> 'ARCHIVED' or availability_status = 'OFF_MARKET');

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
create view public.public_property_indexability with (security_invoker=false) as
select id,property_code,public_slug,coalesce(canonical_path,'/properties/'||public_slug) as canonical_path,
  availability_status,published_at,updated_at
from public.properties
where publication_status='PUBLISHED' and archived_at is null and deleted_at is null
  and public_slug is not null and published_at is not null;
comment on view public.public_property_indexability is 'M9 safe source for later sitemap/canonical consumers; only published, non-archived inventory.';
grant select on public.public_property_indexability to anon,authenticated,service_role;
reset role;
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

revoke all on function public.property_publication_readiness(uuid) from public,anon,authenticated;
revoke all on function public.get_property_publication_readiness(uuid,uuid) from public,anon,authenticated;
revoke all on function public.publish_property(uuid,uuid,timestamptz) from public,anon,authenticated;
revoke all on function public.unpublish_property(uuid,uuid,timestamptz,text) from public,anon,authenticated;
revoke all on function public.archive_property_draft(uuid,timestamptz,uuid) from public,anon,authenticated;
revoke all on function public.restore_property_draft(uuid,timestamptz,uuid) from public,anon,authenticated;
grant execute on function public.property_publication_readiness(uuid) to service_role;
grant execute on function public.get_property_publication_readiness(uuid,uuid) to service_role;
grant execute on function public.publish_property(uuid,uuid,timestamptz) to service_role;
grant execute on function public.unpublish_property(uuid,uuid,timestamptz,text) to service_role;
grant execute on function public.archive_property_draft(uuid,timestamptz,uuid) to service_role;
grant execute on function public.restore_property_draft(uuid,timestamptz,uuid) to service_role;
