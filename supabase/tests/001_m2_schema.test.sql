begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(38);

select is(
  (select count(*)::integer from pg_tables where schemaname = 'public'),
  63,
  'authoritative public table inventory contains 59 through M14 plus 4 M15 owner-workflow tables'
);
select is(
  (select count(*)::integer from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typtype = 'e'),
  32,
  'authoritative enum inventory contains 24 base plus 2 M7 and 6 M8 workflow enums'
);
select is(
  (select count(*)::integer from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'site_visit_status' and e.enumlabel = 'FOLLOW_UP_REQUIRED'),
  0,
  'ADR-0001 excludes FOLLOW_UP_REQUIRED from site_visit_status'
);
select is((select count(*)::integer from countries where iso_code = 'IN'), 1, 'India seed is repeatable');
select is((select count(*)::integer from districts where is_service_area), 2, 'two approved service-area districts are seeded');
select is((select count(*)::integer from area_units where is_public_v1), 9, 'nine approved public area units are seeded');

select throws_ok(
  $$insert into properties (land_category, primary_transaction_type, district_id, display_area_value, display_area_unit_id)
    values ('AGRICULTURAL', 'BUY', '00000000-0000-4000-8000-000000000003', -1, '10000000-0000-4000-8000-000000000006')$$,
  '23514', null, 'negative property area is rejected'
);
select throws_ok(
  $$insert into properties (land_category, primary_transaction_type, district_id, display_area_value, display_area_unit_id, archived_at)
    values ('AGRICULTURAL', 'BUY', '00000000-0000-4000-8000-000000000003', 1, '10000000-0000-4000-8000-000000000006', now())$$,
  '23514', null, 'archived timestamp requires ARCHIVED publication state'
);
select throws_ok(
  $$insert into properties (land_category, primary_transaction_type, publication_status, district_id, display_area_value, display_area_unit_id, published_at)
    values ('AGRICULTURAL', 'BUY', 'PUBLISHED', '00000000-0000-4000-8000-000000000003', 1, '10000000-0000-4000-8000-000000000006', now())$$,
  '23514', null, 'published property requires title and public slug'
);
select throws_ok(
  $$insert into properties (land_category, primary_transaction_type, district_id, display_area_value, display_area_unit_id, normalized_area_sqm, area_normalization_status)
    values ('AGRICULTURAL', 'BUY', '00000000-0000-4000-8000-000000000003', 1, '10000000-0000-4000-8000-000000000006', 4046.85, 'AUTHORITATIVE')$$,
  '23514', null, 'authoritative normalized area requires source provenance'
);

insert into properties (id, land_category, primary_transaction_type, district_id, display_area_value, display_area_unit_id)
values ('20000000-0000-4000-8000-000000000001', 'AGRICULTURAL', 'BUY', '00000000-0000-4000-8000-000000000003', 2, '10000000-0000-4000-8000-000000000006');

select matches(
  (select property_code from properties where id = '20000000-0000-4000-8000-000000000001'),
  '^UE-LS-[0-9]{6}$',
  'property code is generated in the canonical format'
);
select throws_ok(
  $$update properties set property_code = 'UE-LS-999999' where id = '20000000-0000-4000-8000-000000000001'$$,
  'P0001', 'property_code is immutable', 'property code is immutable'
);
update properties set public_slug = 'Synthetic-Test-Land' where id = '20000000-0000-4000-8000-000000000001';
select throws_ok(
  $$insert into properties (public_slug, land_category, primary_transaction_type, district_id, display_area_value, display_area_unit_id)
    values ('synthetic-test-land', 'NA', 'BUY', '00000000-0000-4000-8000-000000000003', 1, '10000000-0000-4000-8000-000000000006')$$,
  '23505', null, 'public slug uniqueness is case-insensitive'
);
select throws_ok(
  $$insert into property_na (property_id, na_status) values ('20000000-0000-4000-8000-000000000001', 'APPROVED')$$,
  'P0001', null, 'mismatched category extension is rejected'
);
select lives_ok(
  $$insert into property_agricultural (property_id) values ('20000000-0000-4000-8000-000000000001')$$,
  'matching category extension is accepted'
);
select throws_ok(
  $$insert into property_locations (property_id, location_visibility, public_latitude, public_longitude)
    values ('20000000-0000-4000-8000-000000000001', 'HIDDEN', 23.0225, 72.5714)$$,
  '23514', null, 'hidden locations cannot persist public coordinates'
);
select throws_ok(
  $$insert into property_offers (property_id, transaction_type, price_mode, price_amount)
    values ('20000000-0000-4000-8000-000000000001', 'BUY', 'PRICE_ON_REQUEST', 100)$$,
  '23514', null, 'price-on-request cannot carry a numeric price'
);
select throws_ok(
  $$insert into property_offers (property_id, transaction_type, price_mode, price_min, price_max)
    values ('20000000-0000-4000-8000-000000000001', 'RENT', 'PRICE_RANGE', 200, 100)$$,
  '23514', null, 'price range minimum cannot exceed maximum'
);
select throws_ok(
  $$insert into property_offers (property_id, transaction_type, price_mode, price_per_unit)
    values ('20000000-0000-4000-8000-000000000001', 'LEASE', 'PER_UNIT', 100)$$,
  '23514', null, 'per-unit pricing requires an area unit'
);

insert into property_offers (property_id, transaction_type, price_mode, price_amount, is_primary)
values ('20000000-0000-4000-8000-000000000001', 'BUY', 'EXACT_TOTAL', 100000, true);
select throws_ok(
  $$insert into property_offers (property_id, transaction_type, price_mode, price_amount)
    values ('20000000-0000-4000-8000-000000000001', 'BUY', 'EXACT_TOTAL', 200000)$$,
  '23505', null, 'duplicate active property transaction offer is rejected'
);
select throws_ok(
  $$insert into property_offers (property_id, transaction_type, price_mode, price_amount, is_primary)
    values ('20000000-0000-4000-8000-000000000001', 'RENT', 'EXACT_TOTAL', 200000, true)$$,
  '23505', null, 'property has at most one active primary offer'
);

insert into property_parcels (id, property_id, sequence_no)
values ('25000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 1);
select throws_ok(
  $$insert into property_parcels (property_id, sequence_no)
    values ('20000000-0000-4000-8000-000000000001', 0)$$,
  '23514', null, 'parcel sequence must be positive'
);
select throws_ok(
  $$delete from properties where id = '20000000-0000-4000-8000-000000000001'$$,
  '23503', null, 'business history prevents destructive property cascade'
);

insert into property_attribute_definitions (id, code, label, value_type)
values ('30000000-0000-4000-8000-000000000001', 'soil_type_test', 'Soil type test', 'TEXT');
select throws_ok(
  $$insert into property_attribute_values (property_id, attribute_definition_id, integer_value)
    values ('20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 1)$$,
  'P0001', null, 'attribute value must match its definition type'
);
select lives_ok(
  $$insert into property_attribute_values (property_id, attribute_definition_id, text_value)
    values ('20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'synthetic')$$,
  'matching typed attribute value is accepted'
);
insert into media_assets (property_id, media_type, storage_bucket, object_path, mime_type, width_px, height_px, checksum_sha256, visibility, processing_status, approved_at, alt_text, is_cover)
values ('20000000-0000-4000-8000-000000000001', 'IMAGE', 'property-media-public', 'synthetic/cover.jpg', 'image/jpeg', 1600, 1000, repeat('a',64), 'PUBLIC', 'APPROVED', now(), 'Synthetic cover', true);
select throws_ok(
  $$insert into media_assets (property_id, media_type, storage_bucket, object_path, mime_type, width_px, height_px, checksum_sha256, visibility, processing_status, approved_at, alt_text, is_cover)
    values ('20000000-0000-4000-8000-000000000001', 'IMAGE', 'property-media-public', 'synthetic/cover-2.jpg', 'image/jpeg', 1600, 1000, repeat('b',64), 'PUBLIC', 'APPROVED', now(), 'Synthetic second cover', true)$$,
  '23505', null, 'property has at most one active cover asset'
);
select throws_ok(
  $$insert into app_settings (key, label, value_type, boolean_value) values ('test_setting', 'Test', 'TEXT', true)$$,
  'P0001', null, 'setting value must match its declared type'
);

insert into parties (id, party_type, display_name)
values ('40000000-0000-4000-8000-000000000001', 'INDIVIDUAL', 'Synthetic Test Party');
select throws_ok(
  $$insert into private_documents (party_id, document_type, storage_bucket, object_path, mime_type, visibility)
    values ('40000000-0000-4000-8000-000000000001', 'TEST', 'verification-documents-private', 'synthetic/test.pdf', 'application/pdf', 'PUBLIC')$$,
  '23514', null, 'private documents cannot be marked public'
);
select throws_ok(
  $$insert into owner_submissions (party_id, land_category, primary_transaction_type, status)
    values ('40000000-0000-4000-8000-000000000001', 'AGRICULTURAL', 'BUY', 'CONVERTED')$$,
  '23514', null, 'converted submission requires a converted property'
);

insert into leads (id, party_id, source_type, inquiry_type)
values ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'TEST', 'PROPERTY_INQUIRY');
insert into lead_properties (lead_id, property_id)
values ('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001');
select throws_ok(
  $$insert into lead_properties (lead_id, property_id)
    values ('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001')$$,
  '23505', null, 'duplicate lead-property match is rejected'
);
select throws_ok(
  $$insert into site_visits (lead_id, property_id, status)
    values ('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'COMPLETED')$$,
  '23514', null, 'completed visit requires confirmed times and completion timestamp'
);
select throws_ok(
  $$insert into site_visits (lead_id, property_id, status)
    values ('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'FOLLOW_UP_REQUIRED')$$,
  '22P02', null, 'invalid follow-up visit lifecycle value is rejected'
);
select throws_ok(
  $$insert into site_visits (lead_id, property_id, status, requested_start_at, requested_end_at)
    values ('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'REQUESTED', now(), now() - interval '1 hour')$$,
  '23514', null, 'site-visit requested end must follow its start'
);

insert into verification_check_definitions (id, code, name)
values ('55000000-0000-4000-8000-000000000001', 'M2_TEST_CHECK', 'M2 synthetic check');
insert into property_verifications (id, property_id, check_definition_id)
values ('56000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '55000000-0000-4000-8000-000000000001');
select throws_ok(
  $$insert into verification_evidence (property_verification_id, evidence_type)
    values ('56000000-0000-4000-8000-000000000001', 'TEST')$$,
  '23514', null, 'verification evidence requires a source, document or note'
);

insert into owner_submissions (id, party_id, land_category, primary_transaction_type)
values ('57000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'AGRICULTURAL', 'BUY');
select throws_ok(
  $$update owner_submissions set submission_reference = 'UE-OWN-99999999' where id = '57000000-0000-4000-8000-000000000001'$$,
  'P0001', 'submission_reference is immutable', 'owner submission reference is immutable'
);

insert into audit_logs (id, action, entity_type) values ('60000000-0000-4000-8000-000000000001', 'CREATE', 'TEST');
select throws_ok(
  $$update audit_logs set reason = 'changed' where id = '60000000-0000-4000-8000-000000000001'$$,
  'P0001', 'audit_logs are append-only', 'audit log is append-only'
);

set timezone = 'Asia/Kolkata';
insert into analytics_events (id, event_name, occurred_at)
values ('70000000-0000-4000-8000-000000000001', 'test_event', '2026-09-03 10:00:00+05:30');
select is(
  (select occurred_at at time zone 'UTC' from analytics_events where id = '70000000-0000-4000-8000-000000000001'),
  timestamp '2026-09-03 04:30:00',
  'Asia/Kolkata input round-trips as the correct UTC instant'
);
select ok(
  (select id is not null from properties where id = '20000000-0000-4000-8000-000000000001'),
  'UUID primary key is present'
);

select * from finish();
rollback;
