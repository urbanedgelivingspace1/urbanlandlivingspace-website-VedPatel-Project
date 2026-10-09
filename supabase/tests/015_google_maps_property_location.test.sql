begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(18);

select has_column(
  'public',
  'properties',
  'google_maps_embed_url',
  'properties store a nullable Google Maps embed src'
);
select has_view(
  'public',
  'public_property_google_maps',
  'a dedicated public-safe map projection exists'
);
select is(
  (
    select pg_get_userbyid(class.relowner)
    from pg_class class
    join pg_namespace namespace on namespace.oid = class.relnamespace
    where namespace.nspname = 'public'
      and class.relname = 'public_property_google_maps'
      and class.relkind = 'v'
  ),
  'urbanedge_public_projection',
  'the public map projection is owned by the constrained projection role'
);
select ok(
  not has_schema_privilege('urbanedge_public_projection', 'public', 'CREATE'),
  'the projection role does not retain schema creation privileges after migration'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '15000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'map-admin@example.invalid', '', now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now()
);
insert into public.admin_profiles (user_id, display_name, is_active)
values ('15000000-0000-4000-8000-000000000001', 'Synthetic map admin', true);

create temporary table map_property (id uuid primary key);
grant all on table map_property to service_role;

set local role service_role;
insert into map_property values (
  public.save_property_draft(
    null,
    null,
    '15000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'landCategory', 'AGRICULTURAL',
      'primaryTransactionType', 'BUY',
      'listingTitle', 'Synthetic mapped property',
      'publicAddress', 'Near IIT Gandhinagar, Palaj',
      'googleMapsEmbedUrl', 'https://www.google.com/maps/embed?pb=synthetic-one',
      'districtId', '00000000-0000-4000-8000-000000000003',
      'displayAreaValue', 2,
      'displayAreaUnitId', '10000000-0000-4000-8000-000000000006',
      'location', jsonb_build_object(
        'visibility', 'APPROXIMATE',
        'privateLatitude', 23.1,
        'privateLongitude', 72.1,
        'publicLatitude', 23.11,
        'publicLongitude', 72.11,
        'publicAccuracyMetres', 500,
        'locationNotes', 'PRIVATE_LOCATION_CANARY'
      ),
      'categoryDetails', jsonb_build_object('landCategory', 'AGRICULTURAL')
    )
  )
);
reset role;

select is(
  (select google_maps_embed_url from public.properties where id = (select id from map_property)),
  'https://www.google.com/maps/embed?pb=synthetic-one',
  'the draft RPC stores only the validated embed URL'
);
select is(
  (select count(*)::integer from public.public_property_google_maps where property_id = (select id from map_property)),
  0,
  'draft map URLs never enter the public projection'
);
select throws_ok(
  format(
    $$update public.properties set google_maps_embed_url = 'https://evil.example.com/embed' where id = %L$$,
    (select id from map_property)
  ),
  '23514',
  null,
  'the database rejects a non-Google embed source'
);

set local role service_role;
select lives_ok(
  format(
    $$select public.save_property_draft(%L, %L, '15000000-0000-4000-8000-000000000001', %L::jsonb)$$,
    (select id from map_property),
    (select updated_at from public.properties where id = (select id from map_property)),
    jsonb_build_object(
      'landCategory', 'AGRICULTURAL',
      'primaryTransactionType', 'BUY',
      'listingTitle', 'Synthetic mapped property edited',
      'publicAddress', 'PDPU Road, Raysan, Gandhinagar',
      'googleMapsEmbedUrl', 'https://www.google.com/maps/embed?pb=synthetic-two',
      'districtId', '00000000-0000-4000-8000-000000000003',
      'displayAreaValue', 2,
      'displayAreaUnitId', '10000000-0000-4000-8000-000000000006',
      'categoryDetails', jsonb_build_object('landCategory', 'AGRICULTURAL')
    )::text
  ),
  'editing only the simple location fields succeeds without a legacy location payload'
);
reset role;

select is(
  (select private_latitude from public.property_locations where property_id = (select id from map_property)),
  23.1::numeric,
  'editing the new location fields preserves the private latitude'
);
select is(
  (select public_longitude from public.property_locations where property_id = (select id from map_property)),
  72.11::numeric,
  'editing the new location fields preserves the legacy public longitude'
);
select is(
  (select location_notes from public.property_locations where property_id = (select id from map_property)),
  'PRIVATE_LOCATION_CANARY',
  'editing the new location fields preserves private location notes'
);

update public.properties
set publication_status = 'PUBLISHED', published_at = now()
where id = (select id from map_property);

select is(
  (select google_maps_embed_url from public.public_property_google_maps where property_id = (select id from map_property)),
  'https://www.google.com/maps/embed?pb=synthetic-two',
  'a published visible location exposes only its approved embed URL'
);

set local role service_role;
select lives_ok(
  format(
    $$select public.save_property_draft(%L, %L, '15000000-0000-4000-8000-000000000001', %L::jsonb)$$,
    (select id from map_property),
    (select updated_at from public.properties where id = (select id from map_property)),
    jsonb_build_object(
      'landCategory', 'AGRICULTURAL',
      'primaryTransactionType', 'BUY',
      'listingTitle', 'Synthetic published property edited',
      'publicAddress', 'PDPU Road, Raysan, Gandhinagar',
      'googleMapsEmbedUrl', 'https://www.google.com/maps/embed?pb=synthetic-published',
      'districtId', '00000000-0000-4000-8000-000000000003',
      'displayAreaValue', 2,
      'displayAreaUnitId', '10000000-0000-4000-8000-000000000006',
      'categoryDetails', jsonb_build_object('landCategory', 'AGRICULTURAL')
    )::text
  ),
  'published properties can be updated through the admin save transaction'
);
reset role;

select is(
  (select publication_status::text from public.properties where id = (select id from map_property)),
  'PUBLISHED',
  'editing a published property preserves its publication status'
);
select is(
  (select google_maps_embed_url from public.properties where id = (select id from map_property)),
  'https://www.google.com/maps/embed?pb=synthetic-published',
  'editing a published property saves its Google Maps embed URL'
);

update public.property_locations
set location_visibility = 'HIDDEN', public_latitude = null, public_longitude = null
where property_id = (select id from map_property);
update public.properties
set location_visibility = 'HIDDEN'
where id = (select id from map_property);

select is(
  (select count(*)::integer from public.public_property_google_maps where property_id = (select id from map_property)),
  1,
  'a saved Google Maps embed remains public independently of legacy coordinate visibility'
);

update public.properties
set publication_status = 'ARCHIVED', availability_status = 'OFF_MARKET', archived_at = now()
where id = (select id from map_property);

set local role service_role;
select throws_ok(
  format(
    $$select public.save_property_draft(%L, %L, '15000000-0000-4000-8000-000000000001', %L::jsonb)$$,
    (select id from map_property),
    (select updated_at from public.properties where id = (select id from map_property)),
    jsonb_build_object(
      'landCategory', 'AGRICULTURAL',
      'primaryTransactionType', 'BUY',
      'listingTitle', 'Archived property edit attempt',
      'districtId', '00000000-0000-4000-8000-000000000003',
      'displayAreaValue', 2,
      'displayAreaUnitId', '10000000-0000-4000-8000-000000000006',
      'categoryDetails', jsonb_build_object('landCategory', 'AGRICULTURAL')
    )::text
  ),
  'P0001',
  'Archived properties cannot be edited directly. Restore the property first.',
  'archived properties must be restored before they can be edited'
);
reset role;

select ok(
  not has_function_privilege(
    'authenticated',
    'public.save_property_draft_core(uuid,timestamptz,uuid,jsonb)',
    'execute'
  ),
  'browser roles cannot bypass the validated draft wrapper'
);

select * from finish();
rollback;
