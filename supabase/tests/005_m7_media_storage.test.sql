begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(51);

select is((select count(*)::integer from storage.buckets where id in (
  'property-media-public','property-media-private','verification-documents-private','owner-submissions-private','guide-media-public'
)), 5, 'all five approved V1 buckets exist');
select is((select count(*)::integer from storage.buckets where id in ('property-media-public','guide-media-public') and public), 2, 'only intentional public buckets are public');
select is((select count(*)::integer from storage.buckets where id in ('property-media-private','verification-documents-private','owner-submissions-private') and not public), 3, 'all sensitive/staging buckets are private');
select ok((select 'image/webp' = any(allowed_mime_types) from storage.buckets where id = 'property-media-public'), 'public bucket accepts normalized WebP');
select is((select count(*)::integer from pg_policies where schemaname = 'storage' and tablename = 'objects' and ('anon' = any(roles) or 'authenticated' = any(roles))), 0, 'browser roles receive no direct object policies');
select is((select count(*)::integer from information_schema.columns where table_schema = 'public' and table_name in ('media_assets','private_documents') and column_name ilike '%signed%url%'), 0, 'signed URLs have no durable database column');
select ok('APPROVED' = any(enum_range(null::public.media_processing_status)::text[]), 'media processing status is typed');
select ok('CLEAN' = any(enum_range(null::public.document_scan_status)::text[]) and 'INFECTED' = any(enum_range(null::public.document_scan_status)::text[]), 'private scan states distinguish clean and infected');

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '70000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'm7-admin@example.invalid', '', now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now()
);
insert into public.admin_profiles (user_id, display_name, is_active)
values ('70000000-0000-4000-8000-000000000001', 'Synthetic M7 admin', true);

create temporary table m7_properties (label text primary key, id uuid not null);
grant all on table m7_properties to service_role;
set local role service_role;
set local request.jwt.claims = '{"role":"service_role"}';
insert into m7_properties values ('one', public.save_property_draft(null, null, '70000000-0000-4000-8000-000000000001', jsonb_build_object(
  'landCategory', 'AGRICULTURAL', 'primaryTransactionType', 'BUY', 'listingTitle', 'Synthetic M7 property',
  'districtId', '00000000-0000-4000-8000-000000000003', 'displayAreaValue', 2,
  'displayAreaUnitId', '10000000-0000-4000-8000-000000000006', 'location', jsonb_build_object('visibility', 'HIDDEN'),
  'categoryDetails', jsonb_build_object('landCategory', 'AGRICULTURAL')
)));
insert into m7_properties values ('two', public.save_property_draft(null, null, '70000000-0000-4000-8000-000000000001', jsonb_build_object(
  'landCategory', 'NA', 'primaryTransactionType', 'BUY', 'listingTitle', 'Synthetic other property',
  'districtId', '00000000-0000-4000-8000-000000000003', 'displayAreaValue', 500,
  'displayAreaUnitId', '10000000-0000-4000-8000-000000000003', 'location', jsonb_build_object('visibility', 'HIDDEN'),
  'categoryDetails', jsonb_build_object('landCategory', 'NA', 'naStatus', 'CHECK_PENDING')
)));

select lives_ok(format(
  $$select public.register_property_media('70000000-0000-4000-8000-000000000001', %L::jsonb)$$,
  jsonb_build_object('id','71000000-0000-4000-8000-000000000001','propertyId',(select id from m7_properties where label='one'),'mediaType','IMAGE','storageBucket','property-media-private','objectPath','properties/'||(select id from m7_properties where label='one')||'/private-media/71000000-0000-4000-8000-000000000001.webp','mimeType','image/webp','fileSizeBytes',1234,'widthPx',1600,'heightPx',1000,'altText','Synthetic field view','sourceType','SUPABASE_UPLOAD','checksumSha256',repeat('a',64))::text
), 'hosted image registration succeeds through the service RPC');
select is((select visibility::text from public.media_assets where id='71000000-0000-4000-8000-000000000001'), 'ADMIN_ONLY', 'new images remain private staged metadata');
select matches((select object_path from public.media_assets where id='71000000-0000-4000-8000-000000000001'), '^properties/[0-9a-f-]+/private-media/[0-9a-f-]+\.webp$', 'hosted path follows the server-owned convention');
select is((select checksum_sha256::text from public.media_assets where id='71000000-0000-4000-8000-000000000001'), repeat('a',64)::text, 'hosted checksum persists');
select is(public.register_property_media('70000000-0000-4000-8000-000000000001', jsonb_build_object('id','71000000-0000-4000-8000-000000000099','propertyId',(select id from m7_properties where label='one'),'mediaType','IMAGE','storageBucket','property-media-private','objectPath','properties/x/private-media/y.webp','mimeType','image/webp','fileSizeBytes',1234,'widthPx',1600,'heightPx',1000,'sourceType','SUPABASE_UPLOAD','checksumSha256',repeat('a',64))), '71000000-0000-4000-8000-000000000001'::uuid, 'same-property checksum returns the existing asset');

select lives_ok(format(
  $$select public.register_property_media('70000000-0000-4000-8000-000000000001', %L::jsonb)$$,
  jsonb_build_object('id','71000000-0000-4000-8000-000000000002','propertyId',(select id from m7_properties where label='one'),'mediaType','VIDEO','mediaSubtype','DRONE_VIDEO','sourceType','YOUTUBE','externalUrl','https://www.youtube.com/watch?v=AbCdEf12345','externalProvider','YOUTUBE','externalMediaId','AbCdEf12345')::text
), 'external video registers without a fake Storage object');
select ok((select object_path is null and storage_bucket is null and external_provider='YOUTUBE' from public.media_assets where id='71000000-0000-4000-8000-000000000002'), 'external locator is mutually separate from hosted locator');
select throws_ok($$insert into public.media_assets (property_id,media_type,storage_bucket,object_path,mime_type,external_url,external_provider,external_media_id,visibility,source_type) values ((select id from m7_properties where label='one'),'VIDEO','property-media-private','x','image/webp','https://www.youtube.com/watch?v=AbCdEf12345','YOUTUBE','AbCdEf12345','ADMIN_ONLY','YOUTUBE')$$, '23514', null, 'a row cannot combine hosted and external locators');
select throws_ok(format($$select public.register_property_media('70000000-0000-4000-8000-000000000001', %L::jsonb)$$, jsonb_build_object('id','71000000-0000-4000-8000-000000000003','propertyId',(select id from m7_properties where label='one'),'mediaType','IMAGE','bucket','property-media-public','path','attacker/path.webp')::text), 'P0001', 'Client-controlled visibility, bucket, and path fields are not accepted', 'client bucket/path manipulation marker is rejected');

select lives_ok(format($$select public.approve_property_media('70000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','property-media-public',%L)$$, 'properties/'||(select id from m7_properties where label='one')||'/media/71000000-0000-4000-8000-000000000010.webp'), 'hosted image approval uses a controlled public destination');
select ok((select visibility='PUBLIC' and processing_status='APPROVED' and approved_at is not null and storage_bucket='property-media-public' from public.media_assets where id='71000000-0000-4000-8000-000000000001'), 'approved hosted image has the complete public state');
select lives_ok($$select public.approve_property_media('70000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002')$$, 'external media approval requires no Storage destination');
select lives_ok($$select public.set_property_cover('70000000-0000-4000-8000-000000000001',(select id from m7_properties where label='one'),'71000000-0000-4000-8000-000000000001')$$, 'approved image can be selected as cover');
select is((select count(*)::integer from public.media_assets where property_id=(select id from m7_properties where label='one') and archived_at is null and is_cover), 1, 'one-cover invariant holds');
select lives_ok($$select public.reorder_property_media('70000000-0000-4000-8000-000000000001',(select id from m7_properties where label='one'),array['71000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000001']::uuid[])$$, 'full collection reorder succeeds atomically');
select is((select sort_order from public.media_assets where id='71000000-0000-4000-8000-000000000002'), 10, 'reorder normalizes positions');
select throws_ok($$select public.reorder_property_media('70000000-0000-4000-8000-000000000001',(select id from m7_properties where label='one'),array['71000000-0000-4000-8000-000000000001']::uuid[])$$, 'P0001', 'Media order must contain every active asset for the property exactly once', 'partial/foreign collection reorder is rejected');
select lives_ok($$select public.update_property_media_metadata('70000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','Updated synthetic alt','Safe caption')$$, 'metadata update uses the controlled RPC');
select is((select alt_text from public.media_assets where id='71000000-0000-4000-8000-000000000001'), 'Updated synthetic alt', 'metadata update persists');
select lives_ok($$select public.archive_property_media('70000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001')$$, 'media archives before binary deletion');
select is((select count(*)::integer from public.media_assets where id='71000000-0000-4000-8000-000000000001' and archived_at is null and is_cover), 0, 'archiving clears active cover state');
select lives_ok($$select public.restore_property_media('70000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001')$$, 'archived public media can be restored for rollback');

select lives_ok(format($$select public.register_private_document('70000000-0000-4000-8000-000000000001', %L::jsonb)$$, jsonb_build_object('id','72000000-0000-4000-8000-000000000001','propertyId',(select id from m7_properties where label='one'),'documentType','LEGAL_DOCUMENT','objectPath','properties/'||(select id from m7_properties where label='one')||'/verification/72000000-0000-4000-8000-000000000001.pdf','mimeType','application/pdf','fileSizeBytes',2345,'checksumSha256',repeat('b',64),'originalFileName','private-title.pdf','pageCount',2,'scanStatus','CLEAN')::text), 'private legal document registers through its separate model');
select is((select storage_bucket from public.private_documents where id='72000000-0000-4000-8000-000000000001'), 'verification-documents-private', 'server chooses the private evidence bucket');
select is((select scan_status::text from public.private_documents where id='72000000-0000-4000-8000-000000000001'), 'CLEAN', 'private scan status persists');
select throws_ok($$select public.record_private_document_access('ffffffff-ffff-4fff-8fff-ffffffffffff','72000000-0000-4000-8000-000000000001','ADMIN_DOWNLOAD')$$, '42501', 'Active admin actor required', 'signed access requires an active admin actor');
select lives_ok($$select public.record_private_document_access('70000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','ADMIN_DOWNLOAD')$$, 'clean active document access is audited before signing');
select lives_ok($$select public.archive_private_document('70000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001')$$, 'private document archives without hard deletion');
select throws_ok($$select public.record_private_document_access('70000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','ADMIN_DOWNLOAD')$$, 'P0001', 'Accessible private document not found', 'archived documents cannot receive new signed access');
select ok((select coalesce(string_agg(coalesce(before_state::text,'')||coalesce(after_state::text,''),''),'') not like '%signed%' and coalesce(string_agg(coalesce(before_state::text,'')||coalesce(after_state::text,''),''),'') not like '%private-title.pdf%' from public.audit_logs where actor_admin_id='70000000-0000-4000-8000-000000000001'), 'audits contain no signed URL or private filename/path');
select is((select count(*)::integer from public.public_property_media where property_id=(select id from m7_properties where label='one')), 0, 'unpublished property media cannot leak through the public projection');
select ok((select count(*) from information_schema.columns where table_schema='public' and table_name='public_property_media' and column_name in ('storage_bucket','checksum_sha256','created_by','private_document_id')) = 0, 'public media projection has no private registry fields');

update public.properties set publication_status='PUBLISHED', published_at=now(), published_by='70000000-0000-4000-8000-000000000001' where id=(select id from m7_properties where label='one');
select is((select count(*)::integer from public.public_property_media where property_id=(select id from m7_properties where label='one')), 2, 'published property exposes only its two approved media assets');
select is((select count(*)::integer from public.public_property_media where property_id=(select id from m7_properties where label='one') and object_path like '%verification%'), 0, 'private document paths never enter public property media');
select is((select count(*)::integer from public.audit_logs where actor_admin_id='70000000-0000-4000-8000-000000000001' and entity_type in ('media_asset','property_media_collection','private_document')), 12, 'sensitive media/document operations are actor-attributed');
select lives_ok(format(
  $$select public.register_property_media('70000000-0000-4000-8000-000000000001', %L::jsonb)$$,
  jsonb_build_object('id','71000000-0000-4000-8000-000000000010','propertyId',(select id from m7_properties where label='two'),'mediaType','BROCHURE','storageBucket','property-media-private','objectPath','properties/'||(select id from m7_properties where label='two')||'/private-media/71000000-0000-4000-8000-000000000010.pdf','mimeType','application/pdf','fileSizeBytes',1000,'sourceType','SUPABASE_UPLOAD','checksumSha256',repeat('c',64),'scanStatus','CLEAN')::text
), 'one active brochure can be staged for a property');
select throws_ok(format(
  $$select public.register_property_media('70000000-0000-4000-8000-000000000001', %L::jsonb)$$,
  jsonb_build_object('id','71000000-0000-4000-8000-000000000011','propertyId',(select id from m7_properties where label='two'),'mediaType','BROCHURE','storageBucket','property-media-private','objectPath','properties/'||(select id from m7_properties where label='two')||'/private-media/71000000-0000-4000-8000-000000000011.pdf','mimeType','application/pdf','fileSizeBytes',1000,'sourceType','SUPABASE_UPLOAD','checksumSha256',repeat('d',64),'scanStatus','CLEAN')::text
), 'P0001', 'Property already has an active brochure', 'a second active brochure is rejected server-side');

reset role;
set local role authenticated;
select ok(not has_function_privilege(current_user, 'public.register_property_media(uuid,jsonb)', 'execute'), 'authenticated browser cannot execute media registration');
select ok(not has_function_privilege(current_user, 'public.register_private_document(uuid,jsonb)', 'execute'), 'authenticated browser cannot execute private document registration');
select ok(not has_table_privilege(current_user, 'public.private_documents', 'insert'), 'authenticated browser cannot mutate private documents directly');
select ok(not has_table_privilege(current_user, 'public.media_assets', 'insert'), 'authenticated browser cannot mutate media directly');
reset role;
set local role anon;
select ok(not has_table_privilege(current_user, 'public.private_documents', 'select'), 'anonymous actor cannot read private document records');
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('verification-documents-private', 'attacker/guessed.pdf')$$,
  '42501', null, 'anonymous actor cannot mutate Storage objects directly'
);
reset role;

select * from finish();
rollback;
