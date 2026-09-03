-- M6: narrow, service-role-only property draft transactions.
-- Browser-authenticated admins remain read-only at the database boundary; every
-- caller must first pass the application requireActiveAdmin() contract.

alter type public.audit_action add value 'EXACT_LOCATION_ACCESS';

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
  target_code text;
  current_row public.properties%rowtype;
  next_category public.land_category := (requested_payload ->> 'landCategory')::public.land_category;
  next_transaction public.transaction_type := (requested_payload ->> 'primaryTransactionType')::public.transaction_type;
  location_payload jsonb := requested_payload -> 'location';
  offer_payload jsonb := requested_payload -> 'offer';
  parcel_payload jsonb := requested_payload -> 'parcel';
  planning_payload jsonb := requested_payload -> 'planning';
  category_payload jsonb := requested_payload -> 'categoryDetails';
  party_payload jsonb := requested_payload -> 'partyLink';
  source_payload jsonb := requested_payload -> 'sourceLink';
  target_parcel_id uuid;
  existing_party_link_id uuid;
  existing_source_link_id uuid;
  changed text[] := array['classification','geography','area','copy','slug','location','offer','parcel','planning','category_extension','party_link','source_link'];
begin
  if not exists (
    select 1 from public.admin_profiles
    where user_id = requested_actor_id and is_active
  ) then
    raise insufficient_privilege using message = 'Active admin actor required';
  end if;

  if requested_payload ? 'publicationStatus'
    or requested_payload ? 'availabilityStatus'
    or requested_payload ? 'propertyCode'
    or requested_payload ? 'createdBy'
    or requested_payload ? 'updatedBy'
  then
    raise exception 'Client-controlled status, identity, and actor fields are not accepted';
  end if;

  if nullif(requested_payload ->> 'districtId', '') is null
    or nullif(requested_payload ->> 'displayAreaUnitId', '') is null
    or coalesce((requested_payload ->> 'displayAreaValue')::numeric, 0) <= 0
  then
    raise exception 'District, positive area, and area unit are required for a draft';
  end if;

  if next_category = 'NA' and nullif(category_payload ->> 'naStatus', '') is null then
    raise exception 'NA status is required for an NA draft';
  end if;

  if nullif(requested_payload ->> 'subdistrictId', '') is not null and not exists (
    select 1 from public.subdistricts
    where id = (requested_payload ->> 'subdistrictId')::uuid
      and district_id = (requested_payload ->> 'districtId')::uuid
      and is_active
  ) then
    raise exception 'Subdistrict does not belong to the selected district';
  end if;
  if nullif(requested_payload ->> 'placeId', '') is not null and (
    nullif(requested_payload ->> 'subdistrictId', '') is null or not exists (
      select 1 from public.places
      where id = (requested_payload ->> 'placeId')::uuid
        and subdistrict_id = (requested_payload ->> 'subdistrictId')::uuid
        and is_active
    )
  ) then
    raise exception 'Place does not belong to the selected subdistrict';
  end if;
  if nullif(requested_payload ->> 'localityId', '') is not null and (
    nullif(requested_payload ->> 'placeId', '') is null or not exists (
      select 1 from public.localities
      where id = (requested_payload ->> 'localityId')::uuid
        and place_id = (requested_payload ->> 'placeId')::uuid
        and is_active
    )
  ) then
    raise exception 'Locality does not belong to the selected place';
  end if;

  if requested_property_id is null then
    insert into public.properties (
      land_category, primary_transaction_type, listing_title, short_description, description,
      district_id, subdistrict_id, place_id, locality_id, landmark_text, public_address,
      display_area_value, display_area_unit_id, public_slug, location_visibility,
      publication_status, availability_status, created_by, updated_by
    ) values (
      next_category,
      next_transaction,
      nullif(trim(requested_payload ->> 'listingTitle'), ''),
      nullif(trim(requested_payload ->> 'shortDescription'), ''),
      nullif(trim(requested_payload ->> 'description'), ''),
      (requested_payload ->> 'districtId')::uuid,
      nullif(requested_payload ->> 'subdistrictId', '')::uuid,
      nullif(requested_payload ->> 'placeId', '')::uuid,
      nullif(requested_payload ->> 'localityId', '')::uuid,
      nullif(trim(requested_payload ->> 'landmarkText'), ''),
      nullif(trim(requested_payload ->> 'publicAddress'), ''),
      (requested_payload ->> 'displayAreaValue')::numeric,
      (requested_payload ->> 'displayAreaUnitId')::uuid,
      nullif(trim(requested_payload ->> 'publicSlug'), ''),
      coalesce((location_payload ->> 'visibility')::public.location_visibility, 'APPROXIMATE'),
      'DRAFT', 'AVAILABLE', requested_actor_id, requested_actor_id
    ) returning id, property_code into target_id, target_code;
  else
    select * into current_row from public.properties where id = requested_property_id for update;
    if not found or current_row.deleted_at is not null then
      raise exception 'Property not found';
    end if;
    if current_row.publication_status <> 'DRAFT' then
      raise exception 'Only DRAFT properties may be edited in M6';
    end if;
    if requested_expected_updated_at is null or current_row.updated_at <> requested_expected_updated_at then
      raise exception using errcode = 'P0409', message = 'Property has changed since it was loaded';
    end if;

    if current_row.land_category is distinct from next_category then
      delete from public.property_agricultural where property_id = requested_property_id;
      delete from public.property_na where property_id = requested_property_id;
      delete from public.property_industrial where property_id = requested_property_id;
    end if;

    update public.properties set
      land_category = next_category,
      primary_transaction_type = next_transaction,
      listing_title = nullif(trim(requested_payload ->> 'listingTitle'), ''),
      short_description = nullif(trim(requested_payload ->> 'shortDescription'), ''),
      description = nullif(trim(requested_payload ->> 'description'), ''),
      district_id = (requested_payload ->> 'districtId')::uuid,
      subdistrict_id = nullif(requested_payload ->> 'subdistrictId', '')::uuid,
      place_id = nullif(requested_payload ->> 'placeId', '')::uuid,
      locality_id = nullif(requested_payload ->> 'localityId', '')::uuid,
      landmark_text = nullif(trim(requested_payload ->> 'landmarkText'), ''),
      public_address = nullif(trim(requested_payload ->> 'publicAddress'), ''),
      display_area_value = (requested_payload ->> 'displayAreaValue')::numeric,
      display_area_unit_id = (requested_payload ->> 'displayAreaUnitId')::uuid,
      public_slug = nullif(trim(requested_payload ->> 'publicSlug'), ''),
      location_visibility = coalesce((location_payload ->> 'visibility')::public.location_visibility, 'APPROXIMATE'),
      updated_by = requested_actor_id
    where id = requested_property_id;
    target_id := requested_property_id;
    target_code := current_row.property_code;
  end if;

  if nullif(trim(requested_payload ->> 'publicSlug'), '') is null
    and nullif(trim(requested_payload ->> 'listingTitle'), '') is not null then
    update public.properties set public_slug =
      trim(both '-' from regexp_replace(lower(trim(requested_payload ->> 'listingTitle')), '[^a-z0-9]+', '-', 'g'))
      || '-' || lower(target_code)
    where id = target_id;
  end if;

  if next_category = 'AGRICULTURAL' then
    insert into public.property_agricultural (
      property_id, tenure_type, irrigation_status, road_touch, road_width_m,
      current_cultivation_status, created_by, updated_by
    ) values (
      target_id, nullif(trim(category_payload ->> 'tenureType'), ''),
      nullif(trim(category_payload ->> 'irrigationStatus'), ''),
      nullif(category_payload ->> 'roadTouch', '')::boolean,
      nullif(category_payload ->> 'roadWidthMetres', '')::numeric,
      nullif(trim(category_payload ->> 'currentCultivationStatus'), ''), requested_actor_id, requested_actor_id
    ) on conflict (property_id) do update set
      tenure_type = excluded.tenure_type, irrigation_status = excluded.irrigation_status,
      road_touch = excluded.road_touch, road_width_m = excluded.road_width_m,
      current_cultivation_status = excluded.current_cultivation_status, updated_by = requested_actor_id;
  elsif next_category = 'NA' then
    insert into public.property_na (
      property_id, na_status, na_purpose, development_permission_status,
      road_width_m, frontage_m, corner_plot, restriction_summary, created_by, updated_by
    ) values (
      target_id, trim(category_payload ->> 'naStatus'), nullif(trim(category_payload ->> 'naPurpose'), ''),
      nullif(trim(category_payload ->> 'developmentPermissionStatus'), ''),
      nullif(category_payload ->> 'roadWidthMetres', '')::numeric,
      nullif(category_payload ->> 'frontageMetres', '')::numeric,
      nullif(category_payload ->> 'cornerPlot', '')::boolean,
      nullif(trim(category_payload ->> 'restrictionSummary'), ''), requested_actor_id, requested_actor_id
    ) on conflict (property_id) do update set
      na_status = excluded.na_status, na_purpose = excluded.na_purpose,
      development_permission_status = excluded.development_permission_status,
      road_width_m = excluded.road_width_m, frontage_m = excluded.frontage_m,
      corner_plot = excluded.corner_plot, restriction_summary = excluded.restriction_summary,
      updated_by = requested_actor_id;
  else
    insert into public.property_industrial (
      property_id, industrial_subtype, industrial_authority_name, industrial_tenure,
      gidc_plot_number, existing_shed_present, road_width_m, power_status,
      connectivity_summary, created_by, updated_by
    ) values (
      target_id, nullif(trim(category_payload ->> 'industrialSubtype'), ''),
      nullif(trim(category_payload ->> 'industrialAuthorityName'), ''),
      nullif(trim(category_payload ->> 'industrialTenure'), ''),
      nullif(trim(category_payload ->> 'gidcPlotNumber'), ''),
      nullif(category_payload ->> 'existingShedPresent', '')::boolean,
      nullif(category_payload ->> 'roadWidthMetres', '')::numeric,
      nullif(trim(category_payload ->> 'powerStatus'), ''),
      nullif(trim(category_payload ->> 'connectivitySummary'), ''), requested_actor_id, requested_actor_id
    ) on conflict (property_id) do update set
      industrial_subtype = excluded.industrial_subtype,
      industrial_authority_name = excluded.industrial_authority_name,
      industrial_tenure = excluded.industrial_tenure, gidc_plot_number = excluded.gidc_plot_number,
      existing_shed_present = excluded.existing_shed_present,
      road_width_m = excluded.road_width_m, power_status = excluded.power_status,
      connectivity_summary = excluded.connectivity_summary, updated_by = requested_actor_id;
  end if;

  insert into public.property_locations (
    property_id, private_latitude, private_longitude, public_latitude, public_longitude,
    location_visibility, public_accuracy_m, location_notes
  ) values (
    target_id, nullif(location_payload ->> 'privateLatitude', '')::numeric,
    nullif(location_payload ->> 'privateLongitude', '')::numeric,
    nullif(location_payload ->> 'publicLatitude', '')::numeric,
    nullif(location_payload ->> 'publicLongitude', '')::numeric,
    coalesce((location_payload ->> 'visibility')::public.location_visibility, 'APPROXIMATE'),
    nullif(location_payload ->> 'publicAccuracyMetres', '')::numeric,
    nullif(trim(location_payload ->> 'locationNotes'), '')
  ) on conflict (property_id) do update set
    private_latitude = excluded.private_latitude, private_longitude = excluded.private_longitude,
    public_latitude = excluded.public_latitude, public_longitude = excluded.public_longitude,
    location_visibility = excluded.location_visibility, public_accuracy_m = excluded.public_accuracy_m,
    location_notes = excluded.location_notes;

  if offer_payload is null or offer_payload = 'null'::jsonb then
    offer_payload := jsonb_build_object('transactionType', next_transaction, 'priceMode', 'PRICE_ON_REQUEST', 'negotiable', false);
  end if;
  update public.property_offers set archived_at = now(), is_primary = false
    where property_id = target_id and archived_at is null
      and transaction_type <> (offer_payload ->> 'transactionType')::public.transaction_type;
  insert into public.property_offers (
    property_id, transaction_type, price_mode, currency_code, price_amount, price_min,
    price_max, price_per_unit, price_unit_id, is_negotiable, commercial_terms, is_primary
  ) values (
    target_id, (offer_payload ->> 'transactionType')::public.transaction_type,
    (offer_payload ->> 'priceMode')::public.price_mode, 'INR',
    nullif(offer_payload ->> 'amount', '')::numeric,
    nullif(offer_payload ->> 'minimum', '')::numeric,
    nullif(offer_payload ->> 'maximum', '')::numeric,
    nullif(offer_payload ->> 'perUnit', '')::numeric,
    nullif(offer_payload ->> 'unitId', '')::uuid,
    coalesce((offer_payload ->> 'negotiable')::boolean, false),
    nullif(trim(offer_payload ->> 'commercialTerms'), ''), true
  ) on conflict (property_id, transaction_type) where archived_at is null do update set
    price_mode = excluded.price_mode, price_amount = excluded.price_amount,
    price_min = excluded.price_min, price_max = excluded.price_max,
    price_per_unit = excluded.price_per_unit, price_unit_id = excluded.price_unit_id,
    is_negotiable = excluded.is_negotiable, commercial_terms = excluded.commercial_terms,
    is_primary = true;

  if parcel_payload is not null and parcel_payload <> 'null'::jsonb then
    select id into target_parcel_id from public.property_parcels
      where property_id = target_id and sequence_no = coalesce((parcel_payload ->> 'sequenceNo')::smallint, 1);
    if target_parcel_id is null then
      insert into public.property_parcels (
        property_id, sequence_no, parcel_label, display_area_value, display_area_unit_id, notes_internal
      ) values (
        target_id, coalesce((parcel_payload ->> 'sequenceNo')::smallint, 1),
        nullif(trim(parcel_payload ->> 'label'), ''), nullif(parcel_payload ->> 'areaValue', '')::numeric,
        nullif(parcel_payload ->> 'areaUnitId', '')::uuid, nullif(trim(parcel_payload ->> 'notesInternal'), '')
      ) returning id into target_parcel_id;
    else
      update public.property_parcels set
        parcel_label = nullif(trim(parcel_payload ->> 'label'), ''),
        display_area_value = nullif(parcel_payload ->> 'areaValue', '')::numeric,
        display_area_unit_id = nullif(parcel_payload ->> 'areaUnitId', '')::uuid,
        notes_internal = nullif(trim(parcel_payload ->> 'notesInternal'), ''), archived_at = null
      where id = target_parcel_id;
    end if;
    if nullif(trim(parcel_payload ->> 'identifierValue'), '') is not null then
      if exists (
        select 1 from public.parcel_identifiers identifier
        where identifier.parcel_id = target_parcel_id and identifier.is_primary
      ) then
        update public.parcel_identifiers set
          identifier_type = (parcel_payload ->> 'identifierType'),
          identifier_value = trim(parcel_payload ->> 'identifierValue'),
          normalized_value = upper(regexp_replace(trim(parcel_payload ->> 'identifierValue'), '\s+', '', 'g')),
          public_visibility = coalesce((parcel_payload ->> 'identifierVisibility')::public.record_visibility, 'ADMIN_ONLY')
        where parcel_identifiers.parcel_id = target_parcel_id
          and parcel_identifiers.is_primary;
      else
        insert into public.parcel_identifiers (
          parcel_id, identifier_type, identifier_value, normalized_value, is_primary, public_visibility
        ) values (
          target_parcel_id, parcel_payload ->> 'identifierType', trim(parcel_payload ->> 'identifierValue'),
          upper(regexp_replace(trim(parcel_payload ->> 'identifierValue'), '\s+', '', 'g')), true,
          coalesce((parcel_payload ->> 'identifierVisibility')::public.record_visibility, 'ADMIN_ONLY')
        );
      end if;
    end if;
  end if;

  if planning_payload is not null and planning_payload <> 'null'::jsonb then
    insert into public.property_planning_context (
      property_id, reservation_status, road_reservation_status,
      planning_notes_public, planning_notes_internal, checked_at
    ) values (
      target_id, nullif(trim(planning_payload ->> 'reservationStatus'), ''),
      nullif(trim(planning_payload ->> 'roadReservationStatus'), ''),
      nullif(trim(planning_payload ->> 'publicNotes'), ''),
      nullif(trim(planning_payload ->> 'internalNotes'), ''),
      nullif(planning_payload ->> 'checkedAt', '')::timestamptz
    ) on conflict (property_id) where archived_at is null do update set
      reservation_status = excluded.reservation_status,
      road_reservation_status = excluded.road_reservation_status,
      planning_notes_public = excluded.planning_notes_public,
      planning_notes_internal = excluded.planning_notes_internal,
      checked_at = excluded.checked_at;
  end if;

  select id into existing_party_link_id from public.property_parties
    where property_id = target_id and archived_at is null and is_primary limit 1;
  if party_payload is not null and party_payload <> 'null'::jsonb and nullif(party_payload ->> 'partyId', '') is not null then
    if existing_party_link_id is null then
      insert into public.property_parties (
        property_id, party_id, role, ownership_share_percent, is_primary, notes_internal, created_by, updated_by
      ) values (
        target_id, (party_payload ->> 'partyId')::uuid,
        (party_payload ->> 'role')::public.property_party_role,
        nullif(party_payload ->> 'ownershipSharePercent', '')::numeric, true,
        nullif(trim(party_payload ->> 'notesInternal'), ''), requested_actor_id, requested_actor_id
      );
    else
      update public.property_parties set
        party_id = (party_payload ->> 'partyId')::uuid,
        role = (party_payload ->> 'role')::public.property_party_role,
        ownership_share_percent = nullif(party_payload ->> 'ownershipSharePercent', '')::numeric,
        notes_internal = nullif(trim(party_payload ->> 'notesInternal'), ''), updated_by = requested_actor_id
      where id = existing_party_link_id;
    end if;
  elsif party_payload = 'null'::jsonb and existing_party_link_id is not null then
    update public.property_parties set archived_at = now(), is_primary = false, updated_by = requested_actor_id
      where id = existing_party_link_id;
  end if;

  if source_payload is not null and source_payload <> 'null'::jsonb and nullif(source_payload ->> 'sourceType', '') is not null then
    select id into existing_source_link_id from public.property_source_links where property_id = target_id order by created_at limit 1;
    if existing_source_link_id is null then
      insert into public.property_source_links (property_id, source_type, source_name, source_reference, notes_internal)
      values (target_id, trim(source_payload ->> 'sourceType'), nullif(trim(source_payload ->> 'sourceName'), ''),
        nullif(trim(source_payload ->> 'sourceReference'), ''), nullif(trim(source_payload ->> 'notesInternal'), ''));
    else
      update public.property_source_links set
        source_type = trim(source_payload ->> 'sourceType'), source_name = nullif(trim(source_payload ->> 'sourceName'), ''),
        source_reference = nullif(trim(source_payload ->> 'sourceReference'), ''),
        notes_internal = nullif(trim(source_payload ->> 'notesInternal'), '')
      where id = existing_source_link_id;
    end if;
  end if;

  insert into public.audit_logs (
    actor_admin_id, action, entity_type, entity_id, changed_fields, before_state, after_state, reason
  ) values (
    requested_actor_id,
    case when requested_property_id is null then 'CREATE'::public.audit_action else 'UPDATE'::public.audit_action end,
    'property', target_id, changed,
    case when requested_property_id is null then null else jsonb_build_object(
      'landCategory', current_row.land_category,
      'transactionType', current_row.primary_transaction_type,
      'publicationStatus', current_row.publication_status,
      'availabilityStatus', current_row.availability_status,
      'updatedAt', current_row.updated_at
    ) end,
    jsonb_build_object(
      'propertyCode', target_code, 'landCategory', next_category,
      'transactionType', next_transaction, 'publicationStatus', 'DRAFT'
    ),
    'M6 admin draft save'
  );

  return target_id;
end;
$$;

create function public.change_property_availability(
  requested_property_id uuid,
  requested_expected_updated_at timestamptz,
  requested_next_status public.property_availability_status,
  requested_actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare current_row public.properties%rowtype;
begin
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then
    raise insufficient_privilege using message = 'Active admin actor required';
  end if;
  select * into current_row from public.properties where id = requested_property_id and deleted_at is null for update;
  if not found then raise exception 'Property not found'; end if;
  if current_row.updated_at <> requested_expected_updated_at then
    raise exception using errcode = 'P0409', message = 'Property has changed since it was loaded';
  end if;
  if not (case current_row.availability_status
    when 'AVAILABLE' then requested_next_status = any(array['UNDER_NEGOTIATION','SOLD','RENTED','LEASED','OFF_MARKET']::public.property_availability_status[])
    when 'UNDER_NEGOTIATION' then requested_next_status = any(array['AVAILABLE','SOLD','RENTED','LEASED','OFF_MARKET']::public.property_availability_status[])
    when 'SOLD' then requested_next_status = 'OFF_MARKET'
    when 'RENTED' then requested_next_status = any(array['AVAILABLE','OFF_MARKET']::public.property_availability_status[])
    when 'LEASED' then requested_next_status = any(array['AVAILABLE','OFF_MARKET']::public.property_availability_status[])
    else false end)
  then raise exception 'Invalid availability transition'; end if;
  update public.properties set availability_status = requested_next_status, updated_by = requested_actor_id
    where id = requested_property_id;
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, before_state, after_state, reason)
  values (requested_actor_id, 'STATUS_CHANGE', 'property', requested_property_id, array['availability_status'],
    jsonb_build_object('availabilityStatus', current_row.availability_status),
    jsonb_build_object('availabilityStatus', requested_next_status), 'M6 controlled availability transition');
  return requested_property_id;
end;
$$;

create function public.archive_property_draft(
  requested_property_id uuid,
  requested_expected_updated_at timestamptz,
  requested_actor_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare current_row public.properties%rowtype;
begin
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then
    raise insufficient_privilege using message = 'Active admin actor required';
  end if;
  select * into current_row from public.properties where id = requested_property_id and deleted_at is null for update;
  if not found then raise exception 'Property not found'; end if;
  if current_row.updated_at <> requested_expected_updated_at then
    raise exception using errcode = 'P0409', message = 'Property has changed since it was loaded';
  end if;
  if current_row.publication_status <> 'DRAFT' then raise exception 'M6 may archive DRAFT properties only'; end if;
  update public.properties set publication_status = 'ARCHIVED', archived_at = now(), archived_by = requested_actor_id, updated_by = requested_actor_id
    where id = requested_property_id;
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, before_state, after_state, reason)
  values (requested_actor_id, 'ARCHIVE', 'property', requested_property_id, array['publication_status','archived_at'],
    jsonb_build_object('publicationStatus', current_row.publication_status), jsonb_build_object('publicationStatus', 'ARCHIVED'),
    'M6 property archive');
  return requested_property_id;
end;
$$;

create function public.restore_property_draft(
  requested_property_id uuid,
  requested_expected_updated_at timestamptz,
  requested_actor_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare current_row public.properties%rowtype;
begin
  if not exists (select 1 from public.admin_profiles where user_id = requested_actor_id and is_active) then
    raise insufficient_privilege using message = 'Active admin actor required';
  end if;
  select * into current_row from public.properties where id = requested_property_id and deleted_at is null for update;
  if not found then raise exception 'Property not found'; end if;
  if current_row.updated_at <> requested_expected_updated_at then
    raise exception using errcode = 'P0409', message = 'Property has changed since it was loaded';
  end if;
  if current_row.publication_status <> 'ARCHIVED' then raise exception 'Only archived properties may be restored'; end if;
  update public.properties set publication_status = 'DRAFT', archived_at = null, archived_by = null, updated_by = requested_actor_id
    where id = requested_property_id;
  insert into public.audit_logs (actor_admin_id, action, entity_type, entity_id, changed_fields, before_state, after_state, reason)
  values (requested_actor_id, 'RESTORE', 'property', requested_property_id, array['publication_status','archived_at'],
    jsonb_build_object('publicationStatus', 'ARCHIVED'), jsonb_build_object('publicationStatus', 'DRAFT'),
    'M6 property restore');
  return requested_property_id;
end;
$$;

revoke all on function public.save_property_draft(uuid, timestamptz, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.change_property_availability(uuid, timestamptz, public.property_availability_status, uuid) from public, anon, authenticated;
revoke all on function public.archive_property_draft(uuid, timestamptz, uuid) from public, anon, authenticated;
revoke all on function public.restore_property_draft(uuid, timestamptz, uuid) from public, anon, authenticated;
grant execute on function public.save_property_draft(uuid, timestamptz, uuid, jsonb) to service_role;
grant execute on function public.change_property_availability(uuid, timestamptz, public.property_availability_status, uuid) to service_role;
grant execute on function public.archive_property_draft(uuid, timestamptz, uuid) to service_role;
grant execute on function public.restore_property_draft(uuid, timestamptz, uuid) to service_role;

comment on function public.save_property_draft(uuid, timestamptz, uuid, jsonb) is
  'M6 service-role transaction. Draft-only; ignores no publication field because those fields are rejected.';
