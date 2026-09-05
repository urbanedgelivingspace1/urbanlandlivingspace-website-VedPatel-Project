begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(40);

select has_view('public', 'public_property_search', 'M11 internal public-safe search projection exists');
select has_view('public', 'public_property_search_filter_options', 'M11 public facet projection exists');
select has_function('public', 'search_public_properties', 'M11 typed search function exists');
select has_column('public', 'properties', 'public_search_document', 'properties carry an indexed public search document');
select has_index('public', 'properties', 'properties_public_search_document_idx', 'public full-text search index exists');
select has_index('public', 'properties', 'properties_public_authoritative_area_idx', 'strict normalized-area index exists');
select has_index('public', 'property_offers', 'property_offers_public_price_idx', 'comparable public price index exists');

insert into public.source_references (
  id, authority_name, source_system, document_or_service_name, source_classification
) values (
  '91000000-0000-4000-8000-000000000001', 'Synthetic M11 authority',
  'SYNTHETIC_M11', 'Synthetic area record', 'URBANEDGE_OBSERVED'
);

insert into public.properties (
  id, property_code, public_slug, land_category, primary_transaction_type,
  publication_status, availability_status, listing_title, short_description,
  district_id, display_area_value, display_area_unit_id, normalized_area_sqm,
  area_normalization_status, area_source_reference_id, location_visibility,
  featured, published_at
) values
  ('91000000-0000-4000-8000-000000000011', 'UE-LS-910011', 'm11-orchard',
   'AGRICULTURAL', 'BUY', 'PUBLISHED', 'AVAILABLE', 'Sanand orchard land',
   'Public orchard beside the canal', '00000000-0000-4000-8000-000000000003',
   2, '10000000-0000-4000-8000-000000000006', 8093.7128, 'AUTHORITATIVE',
   '91000000-0000-4000-8000-000000000001', 'HIDDEN', true, now()),
  ('91000000-0000-4000-8000-000000000012', 'UE-LS-910012', 'm11-na-plot',
   'NA', 'BUY', 'PUBLISHED', 'UNDER_NEGOTIATION', 'Ahmedabad NA plot',
   'Public plotted land', '00000000-0000-4000-8000-000000000003',
   1000, '10000000-0000-4000-8000-000000000001', 1000, 'AUTHORITATIVE',
   '91000000-0000-4000-8000-000000000001', 'HIDDEN', false, now() - interval '1 day'),
  ('91000000-0000-4000-8000-000000000013', 'UE-LS-910013', 'm11-industrial-por',
   'INDUSTRIAL', 'LEASE', 'PUBLISHED', 'AVAILABLE', 'Gandhinagar logistics land',
   'Public logistics opportunity', '00000000-0000-4000-8000-000000000004',
   5000, '10000000-0000-4000-8000-000000000001', null, 'SOURCE_DECLARED',
   null, 'HIDDEN', false, now() - interval '2 days'),
  ('91000000-0000-4000-8000-000000000014', 'UE-LS-910014', 'm11-sold-land',
   'AGRICULTURAL', 'BUY', 'PUBLISHED', 'SOLD', 'Closed agricultural land',
   'Public closed opportunity', '00000000-0000-4000-8000-000000000003',
   1, '10000000-0000-4000-8000-000000000006', 4046.8564, 'AUTHORITATIVE',
   '91000000-0000-4000-8000-000000000001', 'HIDDEN', false, now() - interval '3 days'),
  ('91000000-0000-4000-8000-000000000015', 'UE-LS-910015', 'm11-private-draft',
   'AGRICULTURAL', 'BUY', 'DRAFT', 'AVAILABLE', 'PRIVATE_M11_SEARCH_CANARY',
   'PRIVATE_M11_SEARCH_CANARY', '00000000-0000-4000-8000-000000000003',
   1, '10000000-0000-4000-8000-000000000006', null, 'UNKNOWN', null,
   'HIDDEN', false, null);

insert into public.property_offers (
  property_id, transaction_type, price_mode, price_amount, price_min, price_max, is_primary
) values
  ('91000000-0000-4000-8000-000000000011', 'BUY', 'EXACT_TOTAL', 15000000, null, null, true),
  ('91000000-0000-4000-8000-000000000012', 'BUY', 'PRICE_RANGE', null, 8000000, 12000000, true),
  ('91000000-0000-4000-8000-000000000013', 'LEASE', 'PRICE_ON_REQUEST', null, null, null, true),
  ('91000000-0000-4000-8000-000000000014', 'BUY', 'EXACT_TOTAL', 5000000, null, null, true);

insert into public.property_agricultural (property_id, tenure_type, irrigation_status)
values
  ('91000000-0000-4000-8000-000000000011', 'OLD_TENURE', 'CANAL'),
  ('91000000-0000-4000-8000-000000000014', 'NEW_TENURE', 'RAINFED');
insert into public.property_na (property_id, na_status, na_purpose)
values ('91000000-0000-4000-8000-000000000012', 'APPROVED', 'WAREHOUSE');
insert into public.property_industrial (property_id, industrial_subtype, power_status)
values ('91000000-0000-4000-8000-000000000013', 'LOGISTICS', 'AVAILABLE');

set local role anon;
select ok(has_function_privilege(current_user, 'public.search_public_properties(text,text,public.land_category,public.transaction_type,text,text,text,text,numeric,numeric,numeric,numeric,text,public.property_availability_status,text,text,text,text,text,text,text,integer,integer)', 'execute'), 'anonymous may execute only the bounded search API');
select ok(not has_table_privilege(current_user, 'public.public_property_search', 'select'), 'anonymous cannot query the internal search projection directly');
select ok(has_table_privilege(current_user, 'public.public_property_search_filter_options', 'select'), 'anonymous may read the safe facet vocabulary');

select is((select count(*)::integer from public.search_public_properties()), 3, 'default discovery returns available and negotiating records only');
select is((select property_code::text from public.search_public_properties(requested_property_code => 'UE-LS-910011')), 'UE-LS-910011', 'exact Property ID lookup works');
select is((select count(*)::integer from public.search_public_properties(requested_keyword => 'orchard')), 1, 'approved public text is searchable');
select is((select count(*)::integer from public.search_public_properties(requested_keyword => 'PRIVATE_M11_SEARCH_CANARY')), 0, 'unpublished text never leaks through search');
select is((select count(*)::integer from public.search_public_properties(requested_category => 'AGRICULTURAL')), 1, 'category filters use AND semantics with active availability');
select is((select count(*)::integer from public.search_public_properties(requested_category => 'AGRICULTURAL', requested_agricultural_tenure => 'old-tenure')), 1, 'category-specific agricultural facet filters');
select is((select count(*)::integer from public.search_public_properties(requested_category => 'NA', requested_na_purpose => 'warehouse')), 1, 'category-specific NA facet filters');
select is((select count(*)::integer from public.search_public_properties(requested_pricing => 'POR')), 1, 'POR class is explicitly selectable');
select is((select count(*)::integer from public.search_public_properties(requested_minimum_price => 10000000, requested_maximum_price => 16000000)), 2, 'numeric budget uses overlap semantics for exact and range offers');
select is((select count(*)::integer from public.search_public_properties(requested_minimum_area_sqm => 8000)), 1, 'strict area includes only authoritative normalized measurements');
select is((select count(*)::integer from public.search_public_properties(requested_availability => 'SOLD')), 1, 'closed availability is returned only when explicitly requested');
select is((select count(*)::integer from public.search_public_properties(requested_page_size => 1)), 1, 'page size is enforced by the RPC');
select is((select total_count::integer from public.search_public_properties(requested_page_size => 1)), 3, 'windowed total count is stable across pagination');
select is((select property_code::text from public.search_public_properties(requested_sort => 'DEFAULT', requested_page_size => 1)), 'UE-LS-910011', 'recommended sort uses featured, publication time and stable ID');
select is((select property_code::text from public.search_public_properties(requested_sort => 'NEWEST', requested_page_size => 1)), 'UE-LS-910011', 'newest sort is deterministic');
select is((select property_code::text from public.search_public_properties(requested_sort => 'OLDEST', requested_page_size => 1)), 'UE-LS-910013', 'oldest sort is deterministic');
select is((select property_code::text from public.search_public_properties(requested_sort => 'PRICE_LOW', requested_page_size => 1)), 'UE-LS-910012', 'price ascending sort is deterministic and comparable-only');
select is((select property_code::text from public.search_public_properties(requested_sort => 'PRICE_HIGH', requested_page_size => 1)), 'UE-LS-910011', 'price descending sort is deterministic and comparable-only');
select is((select property_code::text from public.search_public_properties(requested_sort => 'AREA_SMALL', requested_page_size => 1)), 'UE-LS-910012', 'area ascending sort is authoritative-only and deterministic');
select is((select property_code::text from public.search_public_properties(requested_sort => 'AREA_LARGE', requested_page_size => 1)), 'UE-LS-910011', 'area sort is authoritative-only and deterministic');
select throws_ok($$select * from public.search_public_properties(requested_page_size => 49)$$, 'P0001', 'search page size must be between 1 and 48', 'oversized pages are rejected');
select throws_ok($$select * from public.search_public_properties(requested_sort => 'RANDOM')$$, 'P0001', 'unsupported search sort', 'sort is allow-listed');
select throws_ok($$select * from public.search_public_properties(requested_availability => 'OFF_MARKET')$$, 'P0001', 'off-market properties are never public search results', 'off-market search is rejected');
select throws_ok($$select * from public.search_public_properties(requested_pricing => 'POR', requested_minimum_price => 1)$$, 'P0001', 'POR cannot be combined with a numeric budget', 'POR and numeric budget are mutually exclusive');
select throws_ok($$select * from public.search_public_properties(requested_taluka => 'sanand')$$, 'P0001', 'invalid geography hierarchy', 'incomplete geography hierarchy is rejected');
select throws_ok($$select * from public.search_public_properties(requested_district => 'Ahmedabad OR 1=1')$$, 'P0001', 'invalid search filter token', 'filter tokens are normalized and bounded');
select throws_ok($$select * from public.search_public_properties(requested_category => 'NA', requested_agricultural_tenure => 'old-tenure')$$, 'P0001', 'category-specific filter does not match category', 'incompatible category-specific filters are rejected');
reset role;

select is((select count(*)::integer from public.public_property_search_filter_options where facet_key = 'agriculturalTenure'), 2, 'facet vocabulary derives published category values');
select ok(position('PRIVATE_' in pg_get_viewdef('public.public_property_search'::regclass, true)) = 0, 'search projection definition contains no private field canary');
select is((select pg_get_userbyid(c.relowner) from pg_class c where c.oid = 'public.public_property_search'::regclass), 'urbanedge_public_projection', 'search projection is owned by constrained non-login role');

select * from finish();
rollback;
