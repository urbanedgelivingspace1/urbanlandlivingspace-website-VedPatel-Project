begin;
create extension if not exists pgtap with schema extensions;
set search_path=public,extensions;
select plan(44);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
('95000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','m15-admin@example.invalid','',now(),'{}','{}',now(),now()),
('95000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','m15-user@example.invalid','',now(),'{}','{}',now(),now());
insert into public.admin_profiles(user_id,display_name,role,is_active)
values('95000000-0000-4000-8000-000000000001','M15 Admin','ADMIN',true);

select has_table('public','owner_submission_consents','versioned owner consent evidence exists');
select has_table('public','owner_submission_events','append-only owner history exists');
select has_table('public','owner_submission_idempotency','owner idempotency ledger exists');
select has_table('public','owner_submission_notification_deliveries','owner notification outbox exists');
select has_column('public','owner_submissions','version','owner workflow has optimistic version');
select has_column('public','owner_submissions','location_visibility_preference','owner preference is distinct from publication');
select has_function('public','submit_owner_land_submission',array['uuid','character','jsonb','jsonb'],'atomic public owner intake exists');
select has_function('public','convert_owner_submission_to_property',array['uuid','uuid','integer','jsonb'],'explicit conversion exists');
select has_function('public','assign_owner_submission',array['uuid','uuid','integer','uuid'],'controlled review assignment exists');

set local role service_role;
select set_config('request.jwt.claims',json_build_object('role','service_role')::text,true);
select lives_ok($$select public.consume_public_intake_rate_limit('OWNER_LAND_SUBMISSION',repeat('9',64)::char(64),3,1800)$$,'owner intake has a transactional abuse bucket');

create temporary table m15_request as select * from public.submit_owner_land_submission(
  '95000000-0000-4000-8000-000000000010',repeat('a',64)::char(64),
  jsonb_build_object(
    'name','M15 Synthetic Owner','phone','+919500000015','email','m15-owner@example.invalid',
    'preferredContact','PHONE','ownerRelationship','OWNER','ownerIntent','SELL','landCategory','AGRICULTURAL',
    'districtId','00000000-0000-4000-8000-000000000003','talukaText','Sanand','villageText','M15 Village',
    'broadAddress','PRIVATE_M15_ADDRESS_CANARY','locationVisibilityPreference','APPROXIMATE',
    'privateLatitude','22.991234','privateLongitude','72.381234','areaValue',2,'areaUnitId','10000000-0000-4000-8000-000000000006',
    'priceMode','PRICE_ON_REQUEST','negotiable',true,'sourceDescription','PRIVATE_M15_OWNER_CLAIM_CANARY',
    'categoryClaims',jsonb_build_object('surveyReference','PRIVATE_M15_SURVEY_CANARY','tenureClaim','Owner claim'),
    'mediaClaims','{}'::jsonb,'contactConsent',true,'informationDeclaration',true,'privacyConsent',true,
    'publicationReviewAcknowledgement',true,'documentCertificationAcknowledgement',true,
    'privacyNoticeVersion','M15-OWNER-INTAKE-2026-09-06'
  ),
  jsonb_build_array(
    jsonb_build_object('id','95000000-0000-4000-8000-000000000011','documentRole','SUPPORTING_DOCUMENT','documentType','OWNER_SUPPORTING_DOCUMENT','objectPath','owner-submissions/95000000-0000-4000-8000-000000000010/documents/95000000-0000-4000-8000-000000000011.pdf','mimeType','application/pdf','fileSizeBytes',100,'checksumSha256',repeat('b',64),'originalFileName','clean.pdf','pageCount',1,'scanStatus','CLEAN'),
    jsonb_build_object('id','95000000-0000-4000-8000-000000000012','documentRole','OWNER_PHOTO','documentType','OWNER_MEDIA','objectPath','owner-submissions/95000000-0000-4000-8000-000000000010/media/95000000-0000-4000-8000-000000000012.jpg','mimeType','image/jpeg','fileSizeBytes',100,'checksumSha256',repeat('c',64),'originalFileName','pending.jpg','scanStatus','PENDING')
  )
);

select is((select status::text from public.owner_submissions where id='95000000-0000-4000-8000-000000000010'),'NEW','public submission enters NEW');
select is((select primary_transaction_type::text from public.owner_submissions where id='95000000-0000-4000-8000-000000000010'),'BUY','owner SELL maps to discovery BUY without changing intent');
select is((select count(*)::integer from public.properties where id=(select converted_property_id from public.owner_submissions where id='95000000-0000-4000-8000-000000000010')),0,'submission does not create public inventory');
select is((select count(*)::integer from public.parties where phone='+919500000015'),1,'private party is resolved once');
select is((select count(*)::integer from public.owner_submission_consents where owner_submission_id='95000000-0000-4000-8000-000000000010'),5,'all five consents are versioned');
select is((select count(*)::integer from public.owner_submission_events where owner_submission_id='95000000-0000-4000-8000-000000000010' and event_type='SUBMITTED'),1,'submission appends history');
select is((select count(*)::integer from public.private_documents where owner_submission_id='95000000-0000-4000-8000-000000000010'),2,'attachment metadata is registered atomically');
select ok((select bool_and(storage_bucket='owner-submissions-private' and visibility='PRIVATE') from public.private_documents where owner_submission_id='95000000-0000-4000-8000-000000000010'),'all owner files use the private bucket');
select is((select string_agg(scan_status::text,',' order by scan_status::text) from public.private_documents where owner_submission_id='95000000-0000-4000-8000-000000000010'),'CLEAN,PENDING','scan quarantine state is retained');
select ok(position('PRIVATE_M15_OWNER_CLAIM_CANARY' in coalesce((select string_agg(coalesce(before_state::text,'')||coalesce(after_state::text,'')||coalesce(reason,''),'') from public.audit_logs where entity_type='owner_submission'),''))=0,'generic audit omits owner claim PII');

select lives_ok($$select * from public.submit_owner_land_submission(
  '95000000-0000-4000-8000-000000000010',repeat('a',64)::char(64),
  jsonb_build_object('name','M15 Synthetic Owner','phone','+919500000015','email','m15-owner@example.invalid','preferredContact','PHONE','ownerRelationship','OWNER','ownerIntent','SELL','landCategory','AGRICULTURAL','districtId','00000000-0000-4000-8000-000000000003','talukaText','Sanand','villageText','M15 Village','broadAddress','PRIVATE_M15_ADDRESS_CANARY','locationVisibilityPreference','APPROXIMATE','privateLatitude','22.991234','privateLongitude','72.381234','areaValue',2,'areaUnitId','10000000-0000-4000-8000-000000000006','priceMode','PRICE_ON_REQUEST','negotiable',true,'sourceDescription','PRIVATE_M15_OWNER_CLAIM_CANARY','categoryClaims',jsonb_build_object('surveyReference','PRIVATE_M15_SURVEY_CANARY','tenureClaim','Owner claim'),'mediaClaims','{}'::jsonb,'contactConsent',true,'informationDeclaration',true,'privacyConsent',true,'publicationReviewAcknowledgement',true,'documentCertificationAcknowledgement',true,'privacyNoticeVersion','M15-OWNER-INTAKE-2026-09-06'),
  jsonb_build_array(jsonb_build_object('id','95000000-0000-4000-8000-000000000011','documentRole','SUPPORTING_DOCUMENT','documentType','OWNER_SUPPORTING_DOCUMENT','objectPath','owner-submissions/95000000-0000-4000-8000-000000000010/documents/95000000-0000-4000-8000-000000000011.pdf','mimeType','application/pdf','fileSizeBytes',100,'checksumSha256',repeat('b',64),'originalFileName','clean.pdf','pageCount',1,'scanStatus','CLEAN'),jsonb_build_object('id','95000000-0000-4000-8000-000000000012','documentRole','OWNER_PHOTO','documentType','OWNER_MEDIA','objectPath','owner-submissions/95000000-0000-4000-8000-000000000010/media/95000000-0000-4000-8000-000000000012.jpg','mimeType','image/jpeg','fileSizeBytes',100,'checksumSha256',repeat('c',64),'originalFileName','pending.jpg','scanStatus','PENDING'))
)$$,'identical intake retries safely');
select is((select count(*)::integer from public.owner_submissions where id='95000000-0000-4000-8000-000000000010'),1,'idempotent retry creates no duplicate submission');
select throws_ok($$select * from public.convert_owner_submission_to_property('95000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000010',1,jsonb_build_object('listingTitle','M15 curated land','publicDescription','Curated description for review'))$$,'P0001','OWNER_SUBMISSION_NOT_APPROVED','NEW cannot convert');
select lives_ok($$select public.assign_owner_submission('95000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000010',1,'95000000-0000-4000-8000-000000000001')$$,'active admin can assign private review');
select is((select assigned_to from public.owner_submissions where id='95000000-0000-4000-8000-000000000010'),'95000000-0000-4000-8000-000000000001'::uuid,'assignment persists on the private submission');
select throws_ok($$select public.assign_owner_submission('95000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000010',1,null)$$,'P0409','STALE_OWNER_SUBMISSION','stale assignment is rejected');
select lives_ok($$select public.transition_owner_submission('95000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000010',2,'CONTACTED','Owner reached for review',null)$$,'contact is explicit');
select lives_ok($$select public.transition_owner_submission('95000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000010',3,'UNDER_REVIEW',null,null)$$,'review is explicit');
select lives_ok($$select public.transition_owner_submission('95000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000010',4,'APPROVED',null,null)$$,'approval is explicit');
select lives_ok($$select * from public.convert_owner_submission_to_property('95000000-0000-4000-8000-000000000001','95000000-0000-4000-8000-000000000010',5,jsonb_build_object('listingTitle','M15 curated agricultural land','publicDescription','Curated public description that remains a draft.','locationVisibility','APPROXIMATE','priceMode','PRICE_ON_REQUEST','negotiable',true))$$,'approved submission converts explicitly');
select is((select publication_status::text from public.properties where id=(select converted_property_id from public.owner_submissions where id='95000000-0000-4000-8000-000000000010')),'DRAFT','conversion creates DRAFT only');
select ok((select public_latitude is null and public_longitude is null from public.property_locations where property_id=(select converted_property_id from public.owner_submissions where id='95000000-0000-4000-8000-000000000010')),'private coordinates never become public coordinates');
select is((select status::text from public.owner_submissions where id='95000000-0000-4000-8000-000000000010'),'CONVERTED','source advances only after draft creation');
select is((select count(*)::integer from public.properties where id=(select converted_property_id from public.owner_submissions where id='95000000-0000-4000-8000-000000000010')),1,'conversion is one-to-one');
select ok((select property_id is not null from public.private_documents where id='95000000-0000-4000-8000-000000000011'),'CLEAN document is linked to verification handoff');
select ok((select property_id is null from public.private_documents where id='95000000-0000-4000-8000-000000000012'),'PENDING document remains quarantined from conversion');
select ok((select count(*)>0 from public.property_verifications where property_id=(select converted_property_id from public.owner_submissions where id='95000000-0000-4000-8000-000000000010')),'draft receives separate verification checklist');
select is((select count(*)::integer from public.owner_submission_notification_deliveries where owner_submission_id='95000000-0000-4000-8000-000000000010'),1,'notification outbox is unique');

set local role anon;
select ok(not has_table_privilege(current_user,'public.owner_submissions','select'),'anonymous cannot read owner submissions');
select ok(not has_function_privilege(current_user,'public.submit_owner_land_submission(uuid,character,jsonb,jsonb)','execute'),'anonymous cannot invoke owner intake RPC directly');
select ok(not has_function_privilege(current_user,'public.convert_owner_submission_to_property(uuid,uuid,integer,jsonb)','execute'),'anonymous cannot convert submissions');
select ok(not has_function_privilege(current_user,'public.assign_owner_submission(uuid,uuid,integer,uuid)','execute'),'anonymous cannot assign submissions');
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub','95000000-0000-4000-8000-000000000002','role','authenticated')::text,true);
select is((select count(*)::integer from public.owner_submissions),0,'authenticated non-admin cannot read guessed submissions');
select set_config('request.jwt.claims',json_build_object('sub','95000000-0000-4000-8000-000000000001','role','authenticated')::text,true);
select is((select count(*)::integer from public.owner_submissions),1,'active admin can read the private owner queue');

select * from finish();
rollback;
