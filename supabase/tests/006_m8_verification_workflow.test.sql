begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(51);

select is((select array_agg(e.enumlabel order by e.enumsortorder)::text[] from pg_enum e join pg_type t on t.oid=e.enumtypid join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typname='verification_status'),array['NOT_STARTED','IN_REVIEW','PASSED','PASSED_WITH_NOTE','FAILED','REQUIRES_REVIEW','EXPIRED']::text[],'scoped verification states remain authoritative');
select is((select array_agg(e.enumlabel order by e.enumsortorder)::text[] from pg_enum e join pg_type t on t.oid=e.enumtypid join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typname='evidence_provenance_state'),array['RECEIVED','REVIEWED','SOURCE_VERIFIED','PROFESSIONALLY_REVIEWED','SUPERSEDED','REVOKED']::text[],'evidence provenance lifecycle is typed');
select is((select array_agg(e.enumlabel order by e.enumsortorder)::text[] from pg_enum e join pg_type t on t.oid=e.enumtypid join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typname='verification_applicability'),array['UNDETERMINED','APPLICABLE','NOT_APPLICABLE']::text[],'applicability is separate from result status');
select has_table('public', 'professional_reviews', 'professional reviews are first-class');
select has_table('public', 'verification_exceptions', 'exceptions are first-class');
select has_table('public', 'verification_history', 'append-only workflow history exists');
select has_table('public', 'verification_public_copy_policies', 'public copy has a versioned approval gate');
select ok((select count(*) >= 27 from public.verification_check_definitions), 'configurable scoped check seed exists');
select is((select count(*)::integer from public.verification_check_definitions where category_scope='AGRICULTURAL'), 6, 'agricultural definitions are configured');
select is((select count(*)::integer from public.verification_check_definitions where category_scope='NA'), 5, 'NA definitions are configured');
select is((select count(*)::integer from public.verification_check_definitions where category_scope='INDUSTRIAL'), 6, 'industrial/GIDC definitions are configured');
select is((select count(*)::integer from public.verification_public_copy_policies where approval_status='APPROVED'), 0, 'lawyer-approved public copy is intentionally absent in M8');
select throws_ok($$insert into public.verification_public_copy_policies(check_definition_id,version,label,explanation_template,limitation_template,approval_status) select id,1,'Clear Title','This property has clear title','No limitation','DRAFT' from public.verification_check_definitions limit 1$$, '23514', null, 'unsafe legal wording is rejected at persistence boundary');

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '80000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'm8-admin@example.invalid', '', now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now()
);
insert into public.admin_profiles (user_id, display_name, role, is_active)
values ('80000000-0000-4000-8000-000000000001', 'Synthetic M8 verifier', 'VERIFIER', true);

create temporary table m8_properties (category public.land_category primary key, id uuid not null);
grant all on table m8_properties to service_role;
set local role service_role;
set local request.jwt.claims = '{"role":"service_role"}';

insert into m8_properties values ('AGRICULTURAL', public.save_property_draft(null,null,'80000000-0000-4000-8000-000000000001',jsonb_build_object(
  'landCategory','AGRICULTURAL','primaryTransactionType','BUY','listingTitle','Synthetic M8 agricultural',
  'districtId','00000000-0000-4000-8000-000000000003','displayAreaValue',2,'displayAreaUnitId','10000000-0000-4000-8000-000000000006',
  'location',jsonb_build_object('visibility','HIDDEN'),'categoryDetails',jsonb_build_object('landCategory','AGRICULTURAL')
)));
insert into m8_properties values ('NA', public.save_property_draft(null,null,'80000000-0000-4000-8000-000000000001',jsonb_build_object(
  'landCategory','NA','primaryTransactionType','BUY','listingTitle','Synthetic M8 NA',
  'districtId','00000000-0000-4000-8000-000000000003','displayAreaValue',500,'displayAreaUnitId','10000000-0000-4000-8000-000000000003',
  'location',jsonb_build_object('visibility','HIDDEN'),'categoryDetails',jsonb_build_object('landCategory','NA','naStatus','CHECK_PENDING')
)));
insert into m8_properties values ('INDUSTRIAL', public.save_property_draft(null,null,'80000000-0000-4000-8000-000000000001',jsonb_build_object(
  'landCategory','INDUSTRIAL','primaryTransactionType','LEASE','listingTitle','Synthetic M8 industrial',
  'districtId','00000000-0000-4000-8000-000000000003','displayAreaValue',1000,'displayAreaUnitId','10000000-0000-4000-8000-000000000003',
  'location',jsonb_build_object('visibility','HIDDEN'),'categoryDetails',jsonb_build_object('landCategory','INDUSTRIAL','industrialSubtype','PLOT')
)));

select is(public.initialize_property_verifications('80000000-0000-4000-8000-000000000001',(select id from m8_properties where category='AGRICULTURAL')), 27, 'agricultural plan initializes all configured definitions with explicit applicability');
select is(public.initialize_property_verifications('80000000-0000-4000-8000-000000000001',(select id from m8_properties where category='NA')), 27, 'NA plan initializes deterministically');
select is(public.initialize_property_verifications('80000000-0000-4000-8000-000000000001',(select id from m8_properties where category='INDUSTRIAL')), 27, 'industrial plan initializes deterministically');
select is((select count(*)::integer from public.property_verifications pv join public.verification_check_definitions d on d.id=pv.check_definition_id where pv.property_id=(select id from m8_properties where category='AGRICULTURAL') and pv.applicability='APPLICABLE'),16,'agricultural plan selects common plus agricultural checks');
select is((select count(*)::integer from public.property_verifications pv join public.verification_check_definitions d on d.id=pv.check_definition_id where pv.property_id=(select id from m8_properties where category='NA') and pv.applicability='APPLICABLE'),15,'NA plan selects common plus NA checks');
select is((select count(*)::integer from public.property_verifications pv join public.verification_check_definitions d on d.id=pv.check_definition_id where pv.property_id=(select id from m8_properties where category='INDUSTRIAL') and pv.applicability='APPLICABLE'),16,'industrial plan selects common plus industrial checks');
select ok((select applicability='NOT_APPLICABLE' from public.property_verifications pv join public.verification_check_definitions d on d.id=pv.check_definition_id where pv.property_id=(select id from m8_properties where category='NA') and d.code='GIDC_RECORDS_REVIEWED'),'GIDC check is not inferred for NA land');
select ok((select description_internal ilike '%does not guarantee development%' from public.verification_check_definitions where code='NA_ORDER_REVIEWED'),'NA definition preserves development-entitlement limitation');
select ok((select description_internal ilike '%no freehold inference%' from public.verification_check_definitions where code='GIDC_RECORDS_REVIEWED'),'GIDC definition preserves ownership limitation');

create temporary table m8_refs (label text primary key, id uuid not null);
grant all on table m8_refs to service_role;
insert into m8_refs select 'identity',pv.id from public.property_verifications pv join public.verification_check_definitions d on d.id=pv.check_definition_id where pv.property_id=(select id from m8_properties where category='AGRICULTURAL') and d.code='PROPERTY_IDENTITY_REVIEWED';
insert into m8_refs select 'legal',pv.id from public.property_verifications pv join public.verification_check_definitions d on d.id=pv.check_definition_id where pv.property_id=(select id from m8_properties where category='AGRICULTURAL') and d.code='LEGAL_REVIEW_COMPLETED';

select throws_ok($$select public.transition_property_verification('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='identity'),'PASSED','{"scopeStatement":"Complete parcel identity scope"}')$$,'P0001','Invalid verification status transition','NOT_STARTED cannot skip directly to PASSED');
select lives_ok($$select public.transition_property_verification('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='identity'),'IN_REVIEW')$$,'check starts through a controlled transition');
select throws_ok($$select public.transition_property_verification('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='identity'),'PASSED','{"scopeStatement":"Survey number and parcel reference reviewed for synthetic fixture"}')$$,'P0001','Current eligible evidence at the required provenance is required','pass is blocked without eligible evidence');

insert into public.private_documents(id,property_id,document_type,storage_bucket,object_path,mime_type,scan_status,original_file_name,visibility,created_by,updated_by)
values
('82000000-0000-4000-8000-000000000001',(select id from m8_properties where category='AGRICULTURAL'),'OWNER_DOCUMENT','verification-documents-private','properties/synthetic/pending.pdf','application/pdf','PENDING','pending-private.pdf','PRIVATE','80000000-0000-4000-8000-000000000001','80000000-0000-4000-8000-000000000001'),
('82000000-0000-4000-8000-000000000002',(select id from m8_properties where category='AGRICULTURAL'),'OWNER_DOCUMENT','verification-documents-private','properties/synthetic/clean.pdf','application/pdf','CLEAN','clean-private.pdf','PRIVATE','80000000-0000-4000-8000-000000000001','80000000-0000-4000-8000-000000000001');

select throws_ok($$select public.link_verification_evidence('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='identity'),'{"privateDocumentId":"82000000-0000-4000-8000-000000000001","evidenceType":"OWNER_DOCUMENT","sourceClass":"URBANEDGE_OPERATIONAL_POLICY"}')$$,'P0001','Private document must belong to the property and have a clean trusted scan','pending scan cannot become trusted evidence');
insert into m8_refs values ('evidence', public.link_verification_evidence('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='identity'),'{"privateDocumentId":"82000000-0000-4000-8000-000000000002","evidenceType":"OWNER_DOCUMENT","sourceClass":"URBANEDGE_OPERATIONAL_POLICY","evidenceReference":"SYN-ID"}'));
select is((select provenance_state::text from public.verification_evidence where id=(select id from m8_refs where label='evidence')),'RECEIVED','linking a clean upload remains merely received');
select lives_ok($$select public.advance_verification_evidence('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='evidence'),'REVIEWED')$$,'human review advances evidence explicitly');
select lives_ok($$select public.transition_property_verification('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='identity'),'PASSED','{"scopeStatement":"Survey number and parcel reference reviewed for synthetic fixture","limitations":"Identity comparison only; no boundary or title conclusion","recheckAt":"2099-01-01T00:00:00Z","riskLevel":"LOW"}')$$,'reviewed evidence supports the scoped operational identity result');
select ok((select reviewed_by='80000000-0000-4000-8000-000000000001' and reviewed_at is not null and check_date=current_date from public.property_verifications where id=(select id from m8_refs where label='identity')),'reviewer and dates are server-attributed');

insert into public.verification_public_copy_policies(check_definition_id,version,label,explanation_template,limitation_template,approval_status,approved_by,approved_at,created_by)
select check_definition_id,1,'Information reviewed','The recorded parcel identity references were compared for the stated scope.','This is not a title, boundary, permission, or legal-clearance conclusion.','APPROVED','80000000-0000-4000-8000-000000000001',now(),'80000000-0000-4000-8000-000000000001' from public.property_verifications where id=(select id from m8_refs where label='identity');
update public.properties set publication_status='PUBLISHED',published_at=now(),published_by='80000000-0000-4000-8000-000000000001' where id=(select id from m8_properties where category='AGRICULTURAL');
select lives_ok($$select public.set_verification_public_disclosure('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='identity'),(select id from public.verification_public_copy_policies limit 1),true)$$,'approved safe copy can make a current scoped result eligible');
select is((select count(*)::integer from public.public_property_verification_summaries where property_id=(select id from m8_properties where category='AGRICULTURAL')),1,'public-safe projection exposes exactly the eligible scoped summary');
select ok((select count(*) from information_schema.columns where table_schema='public' and table_name='public_property_verification_summaries' and column_name in ('private_document_id','source_reference_id','reviewer_notes_internal','risk_level','reviewed_by','owner_party_id','private_latitude'))=0,'public projection excludes evidence, private source metadata, internal review, PII and coordinates');

select lives_ok($$select public.retire_verification_evidence('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='evidence'),'REVOKED',null,'Synthetic evidence was withdrawn')$$,'current evidence can be revoked with a reason');
select is((select status::text from public.property_verifications where id=(select id from m8_refs where label='identity')),'REQUIRES_REVIEW','revoked evidence invalidates the prior current result');
select is((select count(*)::integer from public.public_property_verification_summaries where property_id=(select id from m8_properties where category='AGRICULTURAL')),0,'revoked evidence removes the public-safe summary');
select ok((select count(*) >= 5 from public.verification_history where property_verification_id=(select id from m8_refs where label='identity')),'meaningful verification history is retained');
select ok((select count(*) >= 5 from public.audit_logs where actor_admin_id='80000000-0000-4000-8000-000000000001' and action='VERIFICATION_CHANGE'),'meaningful verification activity is actor-attributed');
select ok((select coalesce(string_agg(coalesce(before_state::text,'')||coalesce(after_state::text,''),''),'') not like '%clean-private.pdf%' and coalesce(string_agg(coalesce(before_state::text,'')||coalesce(after_state::text,''),''),'') not like '%properties/synthetic%' from public.audit_logs where actor_admin_id='80000000-0000-4000-8000-000000000001'),'audit payload omits private filenames and paths');

select lives_ok($$select public.transition_property_verification('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='legal'),'IN_REVIEW')$$,'professional check can start');
insert into m8_refs values ('legal_evidence',public.link_verification_evidence('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='legal'),'{"privateDocumentId":"82000000-0000-4000-8000-000000000002","evidenceType":"PROFESSIONAL_REPORT","sourceClass":"PROFESSIONAL_DUE_DILIGENCE"}'));
select lives_ok($$select public.advance_verification_evidence('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='legal_evidence'),'REVIEWED'); select public.advance_verification_evidence('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='legal_evidence'),'SOURCE_VERIFIED')$$,'professional material advances only through explicit provenance reviews');
insert into m8_refs values ('professional',public.request_professional_review('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='legal'),'LAWYER','Review the stated parcel identity materials for the recorded transaction scope'));
select lives_ok($$select public.update_professional_review('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='professional'),'MATERIALS_PENDING'); select public.update_professional_review('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='professional'),'IN_REVIEW'); select public.update_professional_review('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='professional'),'COMPLETED','{"professionalName":"Synthetic lawyer","professionalReference":"SYN-LAW-1","outcome":"Completed only the stated synthetic parcel-material review scope.","limitations":"No universal title conclusion.","reviewDate":"2026-09-04"}')$$,'professional review follows its independent guarded lifecycle');
select lives_ok($$select public.advance_verification_evidence('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='legal_evidence'),'PROFESSIONALLY_REVIEWED',(select id from m8_refs where label='professional'))$$,'evidence can link to a completed scoped professional review');
select lives_ok($$select public.transition_property_verification('80000000-0000-4000-8000-000000000001',(select id from m8_refs where label='legal'),'PASSED','{"scopeStatement":"Synthetic lawyer reviewed the named parcel materials for the recorded sale context","limitations":"Professional completion is scoped and is not a universal title conclusion","riskLevel":"LOW"}')$$,'professional-required check passes only after the scoped professional workflow');

reset role;
set local role authenticated;
select ok(not has_function_privilege(current_user,'public.transition_property_verification(uuid,uuid,public.verification_status,jsonb)','execute'),'authenticated browser cannot execute verification transitions');
select ok(not has_function_privilege(current_user,'public.link_verification_evidence(uuid,uuid,jsonb)','execute'),'authenticated browser cannot link evidence');
select ok(not has_table_privilege(current_user,'public.property_verifications','update'),'authenticated browser cannot directly mutate verification status');
select is((select count(*)::integer from public.verification_evidence),0,'non-admin authenticated actor cannot read verification evidence under RLS');
reset role;
set local role anon;
select ok(not has_table_privilege(current_user,'public.verification_evidence','select'),'anonymous actor cannot read verification evidence');
select ok(not has_table_privilege(current_user,'public.private_documents','select'),'anonymous actor cannot read private documents');
select ok(not has_function_privilege(current_user,'public.set_verification_public_disclosure(uuid,uuid,uuid,boolean)','execute'),'anonymous actor cannot publish a verification summary');
reset role;

select * from finish();
rollback;
