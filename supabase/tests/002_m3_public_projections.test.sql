begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(23);

select has_view('public', 'public_property_listings', 'public property listing view exists');
select has_view('public', 'public_property_details', 'public property detail view exists');
select has_view('public', 'public_property_media', 'public media view exists');
select has_view('public', 'public_property_verification_summaries', 'public verification view exists');
select has_view('public', 'public_geography_options', 'public geography view exists');
select has_view('public', 'public_area_units', 'public area-unit view exists');
select has_view('public', 'public_app_settings', 'public settings view exists');

select is(
  (
    select count(*)::integer
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('public_property_listings', 'public_property_details')
      and column_name in (
        'private_latitude', 'private_longitude', 'phone', 'email', 'notes_internal',
        'reviewer_notes_internal', 'storage_bucket', 'created_by', 'updated_by'
      )
  ),
  0,
  'property projections expose no forbidden private/admin columns'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '39000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'm3-projection-reviewer@example.invalid', '', now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now()
);
insert into public.admin_profiles(user_id,display_name,is_active)
values ('39000000-0000-4000-8000-000000000001','Synthetic projection reviewer',true);

insert into public.properties (
  id, public_slug, land_category, primary_transaction_type, publication_status,
  listing_title, short_description, description, district_id, display_area_value,
  display_area_unit_id, location_visibility, published_at
) values
  (
    '30000000-0000-4000-8000-000000000001', 'synthetic-m3-public-land', 'AGRICULTURAL',
    'BUY', 'PUBLISHED', 'Synthetic M3 public land', 'Synthetic projection fixture',
    'No real property is represented.', '00000000-0000-4000-8000-000000000003',
    2, '10000000-0000-4000-8000-000000000006', 'HIDDEN', now()
  ),
  (
    '30000000-0000-4000-8000-000000000002', 'synthetic-m3-draft-land', 'AGRICULTURAL',
    'BUY', 'DRAFT', 'Synthetic draft land', null, null,
    '00000000-0000-4000-8000-000000000003', 1,
    '10000000-0000-4000-8000-000000000006', 'APPROXIMATE', null
  );

insert into public.property_locations (
  property_id, private_latitude, private_longitude, location_visibility, location_notes
) values (
  '30000000-0000-4000-8000-000000000001', 23.999999, 72.999999, 'HIDDEN',
  'PRIVATE_EXACT_LAT_CANARY'
);

insert into public.parties (id, party_type, display_name, email, notes_internal)
values (
  '31000000-0000-4000-8000-000000000001', 'INDIVIDUAL', 'Synthetic owner',
  'PRIVATE_OWNER_EMAIL_CANARY@example.invalid', 'INTERNAL_NOTE_CANARY'
);
insert into public.property_parties (property_id, party_id, role, is_primary, notes_internal)
values (
  '30000000-0000-4000-8000-000000000001',
  '31000000-0000-4000-8000-000000000001', 'OWNER', true, 'INTERNAL_NOTE_CANARY'
);
insert into public.private_documents (
  id, property_id, party_id, document_type, storage_bucket, object_path, mime_type, notes_internal, scan_status
) values (
  '32000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  '31000000-0000-4000-8000-000000000001', 'SYNTHETIC_TEST', 'verification-documents-private',
  'PRIVATE_DOC_PATH_CANARY', 'application/pdf', 'INTERNAL_NOTE_CANARY', 'CLEAN'
);

insert into public.property_offers (
  property_id, transaction_type, price_mode, price_amount, is_primary
) values (
  '30000000-0000-4000-8000-000000000001', 'BUY', 'EXACT_TOTAL', 1000000, true
);

insert into public.media_assets (
  id, property_id, media_type, storage_bucket, object_path, mime_type, width_px, height_px,
  checksum_sha256, alt_text, visibility, processing_status, approved_at, is_cover, sort_order
) values
  (
    '33000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001', 'IMAGE', 'property-media-public',
    'synthetic-m3/public.jpg', 'image/jpeg', 1600, 1000, repeat('c',64), 'Synthetic placeholder',
    'PUBLIC', 'APPROVED', now(), true, 0
  ),
  (
    '33000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000001', 'IMAGE', 'property-media-private',
    'INTERNAL_NOTE_CANARY/private.jpg', 'image/jpeg', 1600, 1000, repeat('d',64), null,
    'ADMIN_ONLY', 'READY', null, false, 1
  );

insert into public.verification_check_definitions (
  id, code, name, public_label_default, public_explanation_template
) values (
  '34000000-0000-4000-8000-000000000001', 'SYNTHETIC_M3_CHECK',
  'Synthetic M3 check', 'Synthetic reviewed check', 'Test-only public explanation.'
);
insert into public.property_verifications (
  id, property_id, check_definition_id, status, public_visible, reviewed_at,
  reviewer_notes_internal, applicability, scope_statement, reviewed_by, check_date,
  public_disclosure_eligible
) values (
  '35000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  '34000000-0000-4000-8000-000000000001', 'PASSED', true, now(),
  'INTERNAL_NOTE_CANARY', 'APPLICABLE',
  'Synthetic parcel reference checked for the public projection regression fixture.',
  '39000000-0000-4000-8000-000000000001', current_date, true
);
insert into public.verification_evidence (
  property_verification_id, private_document_id, evidence_type, evidence_notes_internal
) values (
  '35000000-0000-4000-8000-000000000001',
  '32000000-0000-4000-8000-000000000001', 'OTHER_RECORDED_OBSERVATION', 'INTERNAL_NOTE_CANARY'
);
insert into public.verification_public_copy_policies(
  id,check_definition_id,version,label,explanation_template,limitation_template,
  approval_status,approved_by,approved_at,created_by
) values (
  '38000000-0000-4000-8000-000000000001','34000000-0000-4000-8000-000000000001',1,
  'Information reviewed','The named synthetic reference was checked for the recorded scope.',
  'This is not a title, boundary, permission, or legal-clearance conclusion.','APPROVED',
  '39000000-0000-4000-8000-000000000001',now(),'39000000-0000-4000-8000-000000000001'
);
update public.property_verifications set public_copy_policy_id='38000000-0000-4000-8000-000000000001'
where id='35000000-0000-4000-8000-000000000001';

insert into public.app_settings (
  id, key, label, value_type, text_value, is_public, is_secret_reference
) values
  (
    '36000000-0000-4000-8000-000000000001', 'public.synthetic_phone',
    'Synthetic phone', 'TEXT', '+91 00000 00000', true, false
  ),
  (
    '36000000-0000-4000-8000-000000000002', 'private.synthetic_secret',
    'Synthetic secret', 'TEXT', 'INTERNAL_NOTE_CANARY', false, true
  );

select is(
  (select count(*)::integer from public.public_property_listings where id = '30000000-0000-4000-8000-000000000001'),
  1,
  'published synthetic property appears in listing projection'
);
select is(
  (select count(*)::integer from public.public_property_listings where id = '30000000-0000-4000-8000-000000000002'),
  0,
  'draft property is excluded from listing projection'
);
select is(
  (select public_latitude from public.public_property_listings where id = '30000000-0000-4000-8000-000000000001'),
  null::numeric,
  'hidden location has no public latitude'
);
select ok(
  position('PRIVATE_' in (select row_to_json(v)::text from public.public_property_listings v where id = '30000000-0000-4000-8000-000000000001')) = 0,
  'listing projection contains no private canary marker'
);
select ok(
  position('INTERNAL_NOTE_CANARY' in (select row_to_json(v)::text from public.public_property_details v where id = '30000000-0000-4000-8000-000000000001')) = 0,
  'detail projection contains no internal-note canary'
);
select is(
  (select count(*)::integer from public.public_property_media where property_id = '30000000-0000-4000-8000-000000000001'),
  1,
  'only public non-archived media is projected'
);
select ok(
  position('INTERNAL_NOTE_CANARY' in (select string_agg(row_to_json(v)::text, '') from public.public_property_media v where property_id = '30000000-0000-4000-8000-000000000001')) = 0,
  'public media projection excludes private media path canary'
);
select is(
  (select count(*)::integer from public.public_property_verification_summaries where property_id = '30000000-0000-4000-8000-000000000001'),
  1,
  'eligible public verification summary is projected'
);
select ok(
  position('INTERNAL_NOTE_CANARY' in (select row_to_json(v)::text from public.public_property_verification_summaries v where property_id = '30000000-0000-4000-8000-000000000001')) = 0,
  'verification summary excludes evidence and reviewer notes'
);
select is((select count(*)::integer from public.public_app_settings), 1, 'only non-secret public setting is projected');
select ok(
  position('INTERNAL_NOTE_CANARY' in (select string_agg(row_to_json(v)::text, '') from public.public_app_settings v)) = 0,
  'public settings exclude private secret-reference values'
);
select is((select count(distinct district_id)::integer from public.public_geography_options), 2, 'service geography exposes both approved districts');
select is((select count(*)::integer from public.public_area_units), 9, 'public area unit projection exposes approved units');
select ok(has_table_privilege('anon', 'public.public_property_listings', 'select'), 'M4 grants anonymous access to the approved listing view');
select ok(has_table_privilege('authenticated', 'public.public_property_listings', 'select'), 'M4 grants authenticated access to the approved listing view');

select * from finish();
rollback;
