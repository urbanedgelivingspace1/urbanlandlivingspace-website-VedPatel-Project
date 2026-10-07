begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(8);

insert into auth.users(
  id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values (
  '97000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000',
  'authenticated','authenticated','drive-brochure-admin@example.invalid','',now(),
  '{"provider":"email","providers":["email"]}','{}',now(),now()
);
insert into public.admin_profiles(user_id,display_name,role,is_active)
values('97000000-0000-4000-8000-000000000001','Drive brochure admin','ADMIN',true);

set local role service_role;
set local request.jwt.claims='{"role":"service_role"}';
create temporary table drive_brochure_property(id uuid not null);
grant all on table drive_brochure_property to service_role;
insert into drive_brochure_property values(public.save_property_draft(
  null,null,'97000000-0000-4000-8000-000000000001',jsonb_build_object(
    'landCategory','AGRICULTURAL','primaryTransactionType','BUY',
    'listingTitle','Drive brochure property',
    'districtId','00000000-0000-4000-8000-000000000003','displayAreaValue',2,
    'displayAreaUnitId','10000000-0000-4000-8000-000000000006',
    'location',jsonb_build_object('visibility','HIDDEN'),
    'categoryDetails',jsonb_build_object('landCategory','AGRICULTURAL')
  )
));

select lives_ok(format(
  $$select public.register_property_media('97000000-0000-4000-8000-000000000001', %L::jsonb)$$,
  jsonb_build_object(
    'id','97000000-0000-4000-8000-000000000010',
    'propertyId',(select id from drive_brochure_property),
    'mediaType','BROCHURE','sourceType','GOOGLE_DRIVE',
    'externalUrl','https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_12345/view',
    'externalProvider','GOOGLE_DRIVE','externalMediaId','1AbCdEfGhIjKlMnOpQrStUvWxYz_12345'
  )::text
), 'canonical Google Drive brochure registers without a Storage object');
select ok((select storage_bucket is null and object_path is null and scan_status is null from public.media_assets where id='97000000-0000-4000-8000-000000000010'), 'external brochure stores no fake binary or scan result');
select lives_ok($$select public.approve_property_media('97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000010')$$, 'controlled approval publishes the external brochure');
select ok((select visibility='PUBLIC' and processing_status='APPROVED' and approved_at is not null from public.media_assets where id='97000000-0000-4000-8000-000000000010'), 'approved Drive brochure has the complete public state');
select throws_ok(format(
  $$insert into public.media_assets(property_id,media_type,external_url,external_provider,external_media_id,source_type) values (%L,'BROCHURE','https://evil.example/file.pdf','GOOGLE_DRIVE','1AbCdEfGhIjKlMnOpQrStUvWxYz_12345','GOOGLE_DRIVE')$$,
  (select id from drive_brochure_property)
), '23514', null, 'an arbitrary brochure host is rejected by the database boundary');
select throws_ok(format(
  $$insert into public.media_assets(property_id,media_type,external_url,external_provider,external_media_id,source_type) values (%L,'BROCHURE','https://drive.google.com/file/d/unsafe/view','GOOGLE_DRIVE','unsafe','GOOGLE_DRIVE')$$,
  (select id from drive_brochure_property)
), '23514', null, 'an unsafe Drive file ID is rejected by the database boundary');
select lives_ok($$select public.archive_property_media('97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000010')$$, 'removing a Drive brochure archives its association');
select is((select count(*)::integer from public.media_assets where id='97000000-0000-4000-8000-000000000010' and archived_at is null), 0, 'the removed brochure row is retained as history');

select * from finish();
rollback;
