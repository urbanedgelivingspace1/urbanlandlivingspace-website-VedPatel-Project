begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(40);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '40000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'nonadmin@example.invalid', '', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  ),
  (
    '40000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'inactive@example.invalid', '', now(),
    '{"provider":"email","providers":["email"],"isAdmin":true}', '{"isAdmin":true}', now(), now()
  ),
  (
    '40000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'active@example.invalid', '', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now()
  );

insert into public.admin_profiles (user_id, display_name, is_active)
values
  ('40000000-0000-4000-8000-000000000002', 'Synthetic inactive admin', false),
  ('40000000-0000-4000-8000-000000000003', 'Synthetic active admin', true);

insert into public.properties (
  id, public_slug, land_category, primary_transaction_type, publication_status,
  listing_title, district_id, display_area_value, display_area_unit_id,
  location_visibility, published_at
) values
  (
    '41000000-0000-4000-8000-000000000001', 'synthetic-m4-public-land',
    'AGRICULTURAL', 'BUY', 'PUBLISHED', 'Synthetic M4 public land',
    '00000000-0000-4000-8000-000000000003', 1,
    '10000000-0000-4000-8000-000000000006', 'HIDDEN', now()
  ),
  (
    '41000000-0000-4000-8000-000000000002', 'synthetic-m4-private-draft',
    'AGRICULTURAL', 'BUY', 'DRAFT', 'Synthetic M4 unpublished land',
    '00000000-0000-4000-8000-000000000003', 1,
    '10000000-0000-4000-8000-000000000006', 'APPROXIMATE', null
  );
insert into public.property_locations (
  property_id, private_latitude, private_longitude, location_visibility, location_notes
) values (
  '41000000-0000-4000-8000-000000000001', 23.999999, 72.999999, 'HIDDEN',
  'PRIVATE_EXACT_LAT_CANARY'
);
insert into public.parties (id, party_type, display_name, email, notes_internal)
values (
  '42000000-0000-4000-8000-000000000001', 'INDIVIDUAL', 'Synthetic private party',
  'PRIVATE_OWNER_EMAIL_CANARY@example.invalid', 'INTERNAL_NOTE_CANARY'
);
insert into public.leads (id, party_id, source_type, inquiry_type, notes_internal)
values (
  '43000000-0000-4000-8000-000000000001',
  '42000000-0000-4000-8000-000000000001', 'SYNTHETIC_TEST',
  'PROPERTY_INQUIRY', 'INTERNAL_NOTE_CANARY'
);
insert into public.owner_submissions (
  id, party_id, land_category, primary_transaction_type, notes_internal
) values (
  '44000000-0000-4000-8000-000000000001',
  '42000000-0000-4000-8000-000000000001', 'AGRICULTURAL', 'BUY',
  'INTERNAL_NOTE_CANARY'
);
insert into public.private_documents (
  id, property_id, party_id, document_type, storage_bucket, object_path, mime_type
) values (
  '45000000-0000-4000-8000-000000000001',
  '41000000-0000-4000-8000-000000000001',
  '42000000-0000-4000-8000-000000000001', 'SYNTHETIC_TEST',
  'verification-documents-private', 'PRIVATE_DOC_PATH_CANARY', 'application/pdf'
);
insert into public.verification_check_definitions (id, code, name)
values (
  '46000000-0000-4000-8000-000000000001', 'SYNTHETIC_M4_CHECK', 'Synthetic M4 check'
);
insert into public.property_verifications (
  id, property_id, check_definition_id, status, reviewer_notes_internal
) values (
  '47000000-0000-4000-8000-000000000001',
  '41000000-0000-4000-8000-000000000001',
  '46000000-0000-4000-8000-000000000001', 'IN_REVIEW', 'INTERNAL_NOTE_CANARY'
);
insert into public.verification_evidence (
  id, property_verification_id, private_document_id, evidence_type, evidence_notes_internal
) values (
  '48000000-0000-4000-8000-000000000001',
  '47000000-0000-4000-8000-000000000001',
  '45000000-0000-4000-8000-000000000001', 'SYNTHETIC_TEST', 'INTERNAL_NOTE_CANARY'
);
insert into public.app_settings (
  id, key, label, value_type, text_value, is_public, is_secret_reference
) values
  (
    '49000000-0000-4000-8000-000000000001', 'public.synthetic_m4',
    'Synthetic public', 'TEXT', 'Safe synthetic value', true, false
  ),
  (
    '49000000-0000-4000-8000-000000000002', 'private.synthetic_m4',
    'Synthetic private', 'TEXT', 'INTERNAL_NOTE_CANARY', false, true
  );

select is(
  (select count(*)::integer from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity),
  49,
  'RLS is enabled on all 49 application tables'
);
select ok(not (select rolcanlogin from pg_roles where rolname = 'urbanedge_public_projection'), 'projection owner cannot log in');
select ok(not (select rolbypassrls from pg_roles where rolname = 'urbanedge_public_projection'), 'projection owner cannot bypass RLS');
select is(
  (select count(*)::integer from information_schema.views where table_schema = 'public' and table_name like 'public_%'),
  10,
  'ten explicit public views exist'
);

set local role anon;
select ok(has_table_privilege(current_user, 'public.public_property_listings', 'select'), 'anonymous may select approved public view');
select is((select count(*)::integer from public.public_property_listings where id = '41000000-0000-4000-8000-000000000001'), 1, 'anonymous sees published property');
select is((select count(*)::integer from public.public_property_listings where id = '41000000-0000-4000-8000-000000000002'), 0, 'anonymous cannot see unpublished property');
select is((select public_latitude from public.public_property_listings where id = '41000000-0000-4000-8000-000000000001'), null::numeric, 'hidden location has no public coordinate');
select ok(position('PRIVATE_' in (select row_to_json(v)::text from public.public_property_details v where id = '41000000-0000-4000-8000-000000000001')) = 0, 'anonymous detail contains no private marker');
select is((select count(*)::integer from public.public_app_settings), 1, 'anonymous sees only approved public setting');
select ok(not has_table_privilege(current_user, 'public.leads', 'insert'), 'anonymous cannot insert leads directly');
select ok(not has_table_privilege(current_user, 'public.lead_activities', 'insert'), 'anonymous cannot insert lead activities directly');
select ok(not has_table_privilege(current_user, 'public.owner_submissions', 'insert'), 'anonymous cannot insert owner submissions directly');
select ok(not has_table_privilege(current_user, 'public.site_visits', 'insert'), 'anonymous cannot insert site visits directly');
select ok(not has_table_privilege(current_user, 'public.properties', 'insert'), 'anonymous cannot insert properties');
select ok(not has_table_privilege(current_user, 'public.property_verifications', 'insert'), 'anonymous cannot insert verifications');
select ok(not has_table_privilege(current_user, 'public.private_documents', 'select'), 'anonymous cannot read private document metadata');
select ok(not has_table_privilege(current_user, 'public.audit_logs', 'select'), 'anonymous cannot read audit logs');
reset role;

select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select ok(not public.is_active_admin(), 'authenticated non-admin is not authorized by claims alone');
select is((select count(*)::integer from public.properties), 0, 'non-admin cannot read guessed property UUID');
select is((select count(*)::integer from public.leads), 0, 'non-admin cannot read guessed lead UUID');
select is((select count(*)::integer from public.private_documents), 0, 'non-admin cannot read guessed private document UUID');
select is((select count(*)::integer from public.property_locations), 0, 'non-admin cannot read guessed exact-location row');
select ok(not has_table_privilege(current_user, 'public.properties', 'insert'), 'non-admin cannot write admin tables');
select throws_ok(
  $$select public.write_audit_log('CREATE'::public.audit_action, 'attack')$$,
  '42501', 'Active admin or service role required',
  'non-admin cannot invoke trusted audit writer'
);
reset role;

select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select ok(not public.is_active_admin(), 'inactive admin remains denied despite attacker-supplied admin-like metadata');
select is((select count(*)::integer from public.properties), 0, 'inactive admin cannot read properties');
select ok(not has_table_privilege(current_user, 'public.properties', 'update'), 'inactive admin cannot write properties');
reset role;

select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select ok(public.is_active_admin(), 'database profile authorizes active admin');
select is((select count(*)::integer from public.properties where id in ('41000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000002')), 2, 'active admin can read published and unpublished M4 properties');
select is((select count(*)::integer from public.leads where id = '43000000-0000-4000-8000-000000000001'), 1, 'active admin can read M4 lead PII boundary');
select is((select count(*)::integer from public.private_documents where id = '45000000-0000-4000-8000-000000000001'), 1, 'active admin can read M4 private document metadata');
select is((select count(*)::integer from public.property_locations where property_id = '41000000-0000-4000-8000-000000000001'), 1, 'active admin can read M4 private location row');
select ok(not has_table_privilege(current_user, 'public.properties', 'update'), 'admin browser cannot bypass property transition services');
select ok(not has_table_privilege(current_user, 'public.audit_logs', 'update'), 'admin browser cannot update audit history directly');
select ok(
  public.write_audit_log('CREATE', 'synthetic_m4_test', null, null, null, null, 'Synthetic RLS test') is not null,
  'active admin may write audit through trusted function'
);
select is((select count(*)::integer from public.audit_logs where entity_type = 'synthetic_m4_test'), 1, 'trusted audit row is readable by active admin');
reset role;

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;
select ok(has_table_privilege(current_user, 'public.properties', 'insert'), 'server-privileged role has business write privilege');
select is((select count(*)::integer from public.private_documents where id = '45000000-0000-4000-8000-000000000001'), 1, 'server-privileged role can access the M4 private resource');
reset role;

select is(
  (select count(distinct tablename)::integer from pg_policies where schemaname = 'public' and policyname = 'active_admin_select'),
  49,
  'every application table has the active-admin read policy'
);

select * from finish();
rollback;
