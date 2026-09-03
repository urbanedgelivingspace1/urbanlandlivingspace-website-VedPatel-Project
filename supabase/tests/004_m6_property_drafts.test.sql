begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(35);

select ok(
  'EXACT_LOCATION_ACCESS' = any(enum_range(null::public.audit_action)::text[]),
  'exact private-location access has a dedicated audit action'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '60000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'm6-admin@example.invalid', '', now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now()
);
insert into public.admin_profiles (user_id, display_name, is_active)
values ('60000000-0000-4000-8000-000000000001', 'Synthetic M6 admin', true);
insert into public.parties (id, party_type, display_name, created_by)
values ('60000000-0000-4000-8000-000000000002', 'INDIVIDUAL', 'Synthetic private owner', '60000000-0000-4000-8000-000000000001');

create temporary table m6_properties (category public.land_category primary key, id uuid not null);
grant all on table m6_properties to service_role;

set local role service_role;
insert into m6_properties values (
  'AGRICULTURAL',
  public.save_property_draft(null, null, '60000000-0000-4000-8000-000000000001', jsonb_build_object(
    'landCategory', 'AGRICULTURAL', 'primaryTransactionType', 'BUY',
    'listingTitle', 'Synthetic M6 farm',
    'districtId', '00000000-0000-4000-8000-000000000003',
    'displayAreaValue', 3.5, 'displayAreaUnitId', '10000000-0000-4000-8000-000000000006',
    'location', jsonb_build_object('visibility', 'APPROXIMATE', 'privateLatitude', 23.1, 'privateLongitude', 72.1, 'publicLatitude', 23.11, 'publicLongitude', 72.11),
    'offer', jsonb_build_object('transactionType', 'BUY', 'priceMode', 'EXACT_TOTAL', 'amount', 2500000, 'negotiable', true),
    'parcel', jsonb_build_object('sequenceNo', 1, 'label', 'Parcel A', 'areaValue', 3.5, 'areaUnitId', '10000000-0000-4000-8000-000000000006', 'identifierType', 'SURVEY_NUMBER', 'identifierValue', ' 12 / A ', 'identifierVisibility', 'ADMIN_ONLY', 'notesInternal', 'PRIVATE_PARCEL_NOTE'),
    'planning', jsonb_build_object('reservationStatus', 'CHECK_PENDING', 'publicNotes', 'Public planning context', 'internalNotes', 'PRIVATE_PLANNING_NOTE'),
    'categoryDetails', jsonb_build_object('landCategory', 'AGRICULTURAL', 'irrigationStatus', 'BOREWELL', 'roadWidthMetres', 6),
    'partyLink', jsonb_build_object('partyId', '60000000-0000-4000-8000-000000000002', 'role', 'OWNER', 'ownershipSharePercent', 100),
    'sourceLink', jsonb_build_object('sourceType', 'OWNER_REFERRED', 'sourceName', 'Synthetic source', 'notesInternal', 'PRIVATE_SOURCE_NOTE')
  ))
);
insert into m6_properties values (
  'NA', public.save_property_draft(null, null, '60000000-0000-4000-8000-000000000001', jsonb_build_object(
    'landCategory', 'NA', 'primaryTransactionType', 'BUY',
    'districtId', '00000000-0000-4000-8000-000000000003', 'displayAreaValue', 800,
    'displayAreaUnitId', '10000000-0000-4000-8000-000000000003',
    'location', jsonb_build_object('visibility', 'HIDDEN'),
    'categoryDetails', jsonb_build_object('landCategory', 'NA', 'naStatus', 'ORDER_REVIEW_PENDING')
  ))
);
insert into m6_properties values (
  'INDUSTRIAL', public.save_property_draft(null, null, '60000000-0000-4000-8000-000000000001', jsonb_build_object(
    'landCategory', 'INDUSTRIAL', 'primaryTransactionType', 'LEASE',
    'districtId', '00000000-0000-4000-8000-000000000004', 'displayAreaValue', 1200,
    'displayAreaUnitId', '10000000-0000-4000-8000-000000000001',
    'location', jsonb_build_object('visibility', 'APPROXIMATE'),
    'categoryDetails', jsonb_build_object('landCategory', 'INDUSTRIAL', 'industrialSubtype', 'PLOT', 'gidcPlotNumber', 'SYN-44')
  ))
);

select is((select count(*)::integer from m6_properties), 3, 'three category drafts are created');
select is((select count(*)::integer from public.properties p join m6_properties m on m.id = p.id where p.publication_status = 'DRAFT'), 3, 'all created properties remain drafts');
select is((select count(*)::integer from public.property_agricultural where property_id = (select id from m6_properties where category = 'AGRICULTURAL')), 1, 'Agricultural extension persists');
select is((select count(*)::integer from public.property_na where property_id = (select id from m6_properties where category = 'NA') and na_status = 'ORDER_REVIEW_PENDING'), 1, 'NA extension persists');
select is((select count(*)::integer from public.property_industrial where property_id = (select id from m6_properties where category = 'INDUSTRIAL') and gidc_plot_number = 'SYN-44'), 1, 'Industrial extension persists');
select is((select count(*)::integer from public.property_offers o join m6_properties m on m.id = o.property_id where o.archived_at is null and o.is_primary), 3, 'every draft has exactly one primary offer');
select is((select price_amount from public.property_offers where property_id = (select id from m6_properties where category = 'AGRICULTURAL')), 2500000::numeric, 'structured exact price persists');
select is((select price_mode::text from public.property_offers where property_id = (select id from m6_properties where category = 'NA')), 'PRICE_ON_REQUEST', 'incomplete draft receives structured POR offer');
select is((select private_latitude from public.property_locations where property_id = (select id from m6_properties where category = 'AGRICULTURAL')), 23.1::numeric, 'private coordinate persists in private table');
select is((select public_latitude from public.property_locations where property_id = (select id from m6_properties where category = 'NA')), null::numeric, 'hidden draft stores no public point');
select is((select normalized_value from public.parcel_identifiers where parcel_id = (select id from public.property_parcels where property_id = (select id from m6_properties where category = 'AGRICULTURAL'))), '12/A', 'parcel identifier is normalized separately from Property ID');
select is((select count(*)::integer from public.property_planning_context where property_id = (select id from m6_properties where category = 'AGRICULTURAL')), 1, 'planning context persists');
select is((select count(*)::integer from public.property_parties where property_id = (select id from m6_properties where category = 'AGRICULTURAL') and archived_at is null), 1, 'private party relation persists');
select is((select count(*)::integer from public.property_source_links where property_id = (select id from m6_properties where category = 'AGRICULTURAL')), 1, 'source link persists');
select matches((select property_code from public.properties where id = (select id from m6_properties where category = 'AGRICULTURAL')), '^UE-LS-[0-9]{6}$', 'canonical Property ID is sequence formatted');
select matches((select public_slug from public.properties where id = (select id from m6_properties where category = 'AGRICULTURAL')), '^synthetic-m6-farm-ue-ls-[0-9]{6}$', 'draft slug is generated with immutable Property ID suffix');
select is((select count(*)::integer from public.audit_logs where entity_type = 'property' and action = 'CREATE' and entity_id in (select id from m6_properties)), 3, 'create audit events are actor-attributed');
select is((select count(*)::integer from public.audit_logs where entity_type = 'property' and before_state::text like '%PRIVATE_%' or after_state::text like '%PRIVATE_%'), 0, 'audit snapshots contain no private notes or coordinates');
select is((select count(*)::integer from public.public_property_listings where id in (select id from m6_properties)), 0, 'drafts cannot enter the public projection');

select lives_ok(format(
  $$select public.save_property_draft('%s', '%s', '60000000-0000-4000-8000-000000000001', %L::jsonb)$$,
  (select id from m6_properties where category = 'AGRICULTURAL'),
  (select updated_at from public.properties where id = (select id from m6_properties where category = 'AGRICULTURAL')),
  jsonb_build_object(
    'landCategory', 'AGRICULTURAL', 'primaryTransactionType', 'BUY', 'listingTitle', 'Edited farm',
    'districtId', '00000000-0000-4000-8000-000000000004', 'displayAreaValue', 4.25,
    'displayAreaUnitId', '10000000-0000-4000-8000-000000000006',
    'location', jsonb_build_object('visibility', 'HIDDEN'),
    'offer', jsonb_build_object('transactionType', 'BUY', 'priceMode', 'PRICE_RANGE', 'minimum', 2000000, 'maximum', 3000000),
    'parcel', jsonb_build_object('sequenceNo', 1, 'label', 'Parcel edited', 'identifierType', 'BLOCK_NUMBER', 'identifierValue', 'B-44'),
    'planning', jsonb_build_object('reservationStatus', 'NO_RESERVATION_OBSERVED'),
    'categoryDetails', jsonb_build_object('landCategory', 'AGRICULTURAL', 'irrigationStatus', 'CANAL')
  )::text
), 'optimistic update edits every shared group');
select is((select display_area_value from public.properties where id = (select id from m6_properties where category = 'AGRICULTURAL')), 4.25::numeric, 'area update persists');
select is((select district_id from public.properties where id = (select id from m6_properties where category = 'AGRICULTURAL')), '00000000-0000-4000-8000-000000000004'::uuid, 'geography update persists');
select is((select price_min from public.property_offers where property_id = (select id from m6_properties where category = 'AGRICULTURAL')), 2000000::numeric, 'offer update persists');
select is((select location_visibility::text from public.property_locations where property_id = (select id from m6_properties where category = 'AGRICULTURAL')), 'HIDDEN', 'location visibility update persists');
select throws_ok(format(
  $$select public.save_property_draft('%s', '2000-01-01', '60000000-0000-4000-8000-000000000001', %L::jsonb)$$,
  (select id from m6_properties where category = 'AGRICULTURAL'),
  jsonb_build_object('landCategory', 'AGRICULTURAL', 'primaryTransactionType', 'BUY', 'districtId', '00000000-0000-4000-8000-000000000003', 'displayAreaValue', 1, 'displayAreaUnitId', '10000000-0000-4000-8000-000000000001', 'categoryDetails', jsonb_build_object('landCategory', 'AGRICULTURAL'))::text
), 'P0409', 'Property has changed since it was loaded', 'stale draft edit is rejected');
select throws_ok(
  $$select public.save_property_draft(null, null, '60000000-0000-4000-8000-000000000001', '{"landCategory":"NA","primaryTransactionType":"BUY","districtId":"00000000-0000-4000-8000-000000000003","displayAreaValue":1,"displayAreaUnitId":"10000000-0000-4000-8000-000000000001","publicationStatus":"PUBLISHED","categoryDetails":{"naStatus":"UNKNOWN"}}')$$,
  'P0001', 'Client-controlled status, identity, and actor fields are not accepted', 'client-supplied publication/status fields are rejected');

select lives_ok(format(
  $$select public.change_property_availability('%s', '%s', 'UNDER_NEGOTIATION', '60000000-0000-4000-8000-000000000001')$$,
  (select id from m6_properties where category = 'NA'), (select updated_at from public.properties where id = (select id from m6_properties where category = 'NA'))
), 'availability uses a controlled valid transition');
select throws_ok(format(
  $$select public.change_property_availability('%s', '%s', 'AVAILABLE', '60000000-0000-4000-8000-000000000001')$$,
  (select id from m6_properties where category = 'INDUSTRIAL'), (select updated_at from public.properties where id = (select id from m6_properties where category = 'INDUSTRIAL'))
), 'P0001', 'Invalid availability transition', 'availability no-op/invalid transition is rejected');
select is((select count(*)::integer from public.audit_logs where action = 'STATUS_CHANGE' and entity_id = (select id from m6_properties where category = 'NA')), 1, 'availability change is audited');

select lives_ok(format(
  $$select public.archive_property_draft('%s', '%s', '60000000-0000-4000-8000-000000000001')$$,
  (select id from m6_properties where category = 'INDUSTRIAL'), (select updated_at from public.properties where id = (select id from m6_properties where category = 'INDUSTRIAL'))
), 'draft archives without hard deletion');
select is((select publication_status::text from public.properties where id = (select id from m6_properties where category = 'INDUSTRIAL')), 'ARCHIVED', 'archive changes publication lifecycle state');
select lives_ok(format(
  $$select public.restore_property_draft('%s', '%s', '60000000-0000-4000-8000-000000000001')$$,
  (select id from m6_properties where category = 'INDUSTRIAL'), (select updated_at from public.properties where id = (select id from m6_properties where category = 'INDUSTRIAL'))
), 'archived property restores to draft');
select is((select count(*)::integer from public.audit_logs where entity_id = (select id from m6_properties where category = 'INDUSTRIAL') and action in ('ARCHIVE','RESTORE')), 2, 'archive and restore are audited');
reset role;

set local role authenticated;
select ok(not has_function_privilege(current_user, 'public.save_property_draft(uuid,timestamptz,uuid,jsonb)', 'execute'), 'browser-authenticated role cannot execute draft mutation RPC');
reset role;

select * from finish();
rollback;
