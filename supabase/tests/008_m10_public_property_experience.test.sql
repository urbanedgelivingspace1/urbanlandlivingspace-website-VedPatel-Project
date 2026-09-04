begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(17);

select has_view('public', 'public_property_details', 'M10 public detail projection exists');
select has_view('public', 'public_property_parcel_identifiers', 'M10 public parcel projection exists');
select has_column('public', 'public_property_details', 'agricultural_tenure_type', 'agricultural facts are explicit');
select has_column('public', 'public_property_details', 'na_status', 'NA facts are explicit');
select has_column('public', 'public_property_details', 'industrial_subtype', 'industrial facts are explicit');
select has_column('public', 'public_property_details', 'planning_authority_name', 'planning context is explicit');
select has_column('public', 'public_property_parcel_identifiers', 'identifier_value', 'approved public identifier is explicit');

select ok(
  (select count(*) = 0 from information_schema.columns
    where table_schema = 'public' and table_name = 'public_property_details'
      and column_name in ('owner_name', 'owner_email', 'owner_phone', 'private_latitude',
        'private_longitude', 'notes_internal', 'published_by', 'verification_notes')),
  'detail projection excludes private identity, coordinates, and internal workflow fields'
);
select ok(
  (select count(*) = 0 from information_schema.columns
    where table_schema = 'public' and table_name = 'public_property_parcel_identifiers'
      and column_name in ('parcel_id', 'public_visibility', 'notes_internal')),
  'parcel projection exposes no private record keys or workflow fields'
);
select is(
  (select tableowner from pg_catalog.pg_tables where schemaname = 'public' and tablename = 'public_property_details'),
  null,
  'view is not represented as a base table'
);
select is(
  (select pg_get_userbyid(c.relowner) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'public_property_details'),
  'urbanedge_public_projection',
  'detail view is owned by the constrained projection role'
);
select is(
  (select pg_get_userbyid(c.relowner) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'public_property_parcel_identifiers'),
  'urbanedge_public_projection',
  'parcel view is owned by the constrained projection role'
);
select ok(
  pg_get_viewdef('public.public_property_details'::regclass, true) like '%public_property_listings%',
  'detail view inherits the publication-gated listing projection'
);
select ok(
  pg_get_viewdef('public.public_property_parcel_identifiers'::regclass, true) like '%public_visibility = ''PUBLIC''%',
  'parcel view requires explicit PUBLIC visibility'
);
select ok(
  pg_get_viewdef('public.public_property_parcel_identifiers'::regclass, true) like '%publication_status = ''PUBLISHED''%',
  'parcel view requires published property state'
);

set local role anon;
select ok(has_table_privilege(current_user, 'public.public_property_details', 'select'), 'anonymous reads the safe detail view');
select ok(has_table_privilege(current_user, 'public.public_property_parcel_identifiers', 'select'), 'anonymous reads the safe parcel view');
reset role;

select * from finish();
rollback;
