begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(39);

select has_function('public','property_publication_readiness',array['uuid'],'authoritative publication validator exists');
select has_function('public','publish_property',array['uuid','uuid','timestamp with time zone'],'atomic publish RPC exists');
select has_function('public','unpublish_property',array['uuid','uuid','timestamp with time zone','text'],'controlled unpublish RPC exists');
select has_view('public','public_property_indexability','later sitemap/indexability has a published-only source');

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values('90000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','m9-admin@example.invalid','',now(),'{"provider":"email","providers":["email"]}','{}',now(),now());
insert into public.admin_profiles(user_id,display_name,role,is_active)
values('90000000-0000-4000-8000-000000000001','Synthetic M9 admin','ADMIN',true);

set local role service_role;
set local request.jwt.claims='{"role":"service_role"}';
create temporary table m9_refs(label text primary key,id uuid not null);
grant all on table m9_refs to service_role;
grant select on table m9_refs to authenticated,anon;
insert into m9_refs values('property',public.save_property_draft(null,null,'90000000-0000-4000-8000-000000000001',jsonb_build_object(
  'landCategory','AGRICULTURAL','primaryTransactionType','BUY','listingTitle','Synthetic publication-ready agricultural land',
  'shortDescription','A synthetic public summary for publication validation only.',
  'description','A synthetic public description with sufficient context for the controlled M9 publication workflow.',
  'publicSlug','synthetic-m9-agricultural-land','publicAddress','Ahmedabad district, Gujarat',
  'districtId','00000000-0000-4000-8000-000000000003','displayAreaValue',2,
  'displayAreaUnitId','10000000-0000-4000-8000-000000000006',
  'location',jsonb_build_object('visibility','HIDDEN'),
  'offer',jsonb_build_object('transactionType','BUY','priceMode','PRICE_ON_REQUEST','currencyCode','INR','negotiable',true),
  'parcel',jsonb_build_object('sequenceNo',1,'label','Synthetic parcel','identifierType','SURVEY_NUMBER','identifierValue','SYN-M9-1'),
  'categoryDetails',jsonb_build_object('landCategory','AGRICULTURAL','tenureType','RECORDED','irrigationStatus','RECORDED','roadTouch',true),
  'sourceLink',jsonb_build_object('sourceType','SYNTHETIC_TEST','sourceName','Synthetic fixture')
)));

select ok(not (public.property_publication_readiness((select id from m9_refs where label='property'))->>'ready')::boolean,'missing media and checks block publication');
select ok(public.property_publication_readiness((select id from m9_refs where label='property'))->'blockers' @> '[{"code":"APPROVED_COVER_MISSING"}]','missing approved cover is explicit');
select ok(public.property_publication_readiness((select id from m9_refs where label='property'))->'blockers' @> '[{"code":"REQUIRED_CHECK_UNSUPPORTED"}]','unsupported category checks are explicit');
select throws_ok(format($$select public.publish_property('90000000-0000-4000-8000-000000000001','%s','%s')$$,(select id from m9_refs where label='property'),(select updated_at from public.properties where id=(select id from m9_refs where label='property'))),'P0001','Publication blocked','incomplete property cannot publish');
select is((select publication_status::text from public.properties where id=(select id from m9_refs where label='property')),'DRAFT','failed publication is atomic');

insert into public.media_assets(id,property_id,media_type,storage_bucket,object_path,mime_type,file_size_bytes,width_px,height_px,alt_text,visibility,is_cover,sort_order,source_type,checksum_sha256,processing_status,approved_at,created_by,updated_by)
values('91000000-0000-4000-8000-000000000001',(select id from m9_refs where label='property'),'IMAGE','property-media-public','properties/synthetic/m9-cover.webp','image/webp',1000,1600,1000,'Synthetic agricultural field','PUBLIC',true,10,'SUPABASE_UPLOAD',repeat('9',64),'APPROVED',now(),'90000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001');
select is(public.initialize_property_verifications('90000000-0000-4000-8000-000000000001',(select id from m9_refs where label='property')),27,'verification plan initializes before publication');
insert into public.private_documents(id,property_id,document_type,storage_bucket,object_path,mime_type,scan_status,original_file_name,visibility,created_by,updated_by)
values('92000000-0000-4000-8000-000000000001',(select id from m9_refs where label='property'),'OWNER_DOCUMENT','verification-documents-private','properties/synthetic/m9-private.pdf','application/pdf','CLEAN','private-canary.pdf','PRIVATE','90000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001');
insert into m9_refs select 'identity',pv.id from public.property_verifications pv join public.verification_check_definitions d on d.id=pv.check_definition_id where pv.property_id=(select id from m9_refs where label='property') and d.code='PROPERTY_IDENTITY_REVIEWED';
insert into m9_refs select 'revenue',pv.id from public.property_verifications pv join public.verification_check_definitions d on d.id=pv.check_definition_id where pv.property_id=(select id from m9_refs where label='property') and d.code='REVENUE_RECORDS_REVIEWED';
insert into m9_refs values('identity-evidence',public.link_verification_evidence('90000000-0000-4000-8000-000000000001',(select id from m9_refs where label='identity'),'{"privateDocumentId":"92000000-0000-4000-8000-000000000001","evidenceType":"OWNER_DOCUMENT","sourceClass":"URBANEDGE_OPERATIONAL_POLICY"}'));
insert into m9_refs values('revenue-evidence',public.link_verification_evidence('90000000-0000-4000-8000-000000000001',(select id from m9_refs where label='revenue'),'{"privateDocumentId":"92000000-0000-4000-8000-000000000001","evidenceType":"OFFICIAL_RECORD","sourceClass":"OFFICIAL_ADMINISTRATIVE_PRACTICE"}'));
select lives_ok($$select public.transition_property_verification('90000000-0000-4000-8000-000000000001',(select id from m9_refs where label='identity'),'IN_REVIEW'); select public.advance_verification_evidence('90000000-0000-4000-8000-000000000001',(select id from m9_refs where label='identity-evidence'),'REVIEWED'); select public.transition_property_verification('90000000-0000-4000-8000-000000000001',(select id from m9_refs where label='identity'),'PASSED','{"scopeStatement":"Synthetic parcel identity references reviewed for the named listing","limitations":"Identity comparison only; no title or boundary conclusion"}')$$,'identity check completes through guarded workflow');
select lives_ok($$select public.transition_property_verification('90000000-0000-4000-8000-000000000001',(select id from m9_refs where label='revenue'),'IN_REVIEW'); select public.advance_verification_evidence('90000000-0000-4000-8000-000000000001',(select id from m9_refs where label='revenue-evidence'),'REVIEWED'); select public.advance_verification_evidence('90000000-0000-4000-8000-000000000001',(select id from m9_refs where label='revenue-evidence'),'SOURCE_VERIFIED'); select public.transition_property_verification('90000000-0000-4000-8000-000000000001',(select id from m9_refs where label='revenue'),'PASSED','{"scopeStatement":"Synthetic revenue record reviewed for the named parcel and current date","limitations":"Record review only; no universal legal conclusion"}')$$,'category claim support requires source-verified evidence');
select ok((public.property_publication_readiness((select id from m9_refs where label='property'))->>'ready')::boolean,'complete authoritative state is publishable');
select ok(public.property_publication_readiness((select id from m9_refs where label='property'))->'warnings' @> '[{"code":"PUBLIC_VERIFICATION_COPY_DISABLED"}]','missing lawyer-approved public copy is a warning, not a publication blocker');
select lives_ok(format($$select public.publish_property('90000000-0000-4000-8000-000000000001','%s','%s')$$,(select id from m9_refs where label='property'),(select updated_at from public.properties where id=(select id from m9_refs where label='property'))),'ready property publishes atomically');
select ok((select publication_status='PUBLISHED' and published_at is not null and published_by='90000000-0000-4000-8000-000000000001' from public.properties where id=(select id from m9_refs where label='property')),'publish records state, actor, and timestamp');
select is((select count(*)::integer from public.audit_logs where entity_id=(select id from m9_refs where label='property') and action='PUBLISH'),1,'publish audit exists');
select is((select count(*)::integer from public.public_property_listings where id=(select id from m9_refs where label='property')),1,'published property enters public inventory');
select is((select count(*)::integer from public.public_property_indexability where id=(select id from m9_refs where label='property')),1,'published property enters indexability source');
select is((select count(*)::integer from public.public_property_media where property_id=(select id from m9_refs where label='property')),1,'only approved public media projects');
select ok((select count(*) from information_schema.columns where table_schema='public' and table_name='public_property_listings' and column_name in ('private_latitude','private_longitude','notes_internal','published_by'))=0,'public listing shape excludes private/internal fields');
select ok((select public_latitude is null and public_longitude is null from public.public_property_listings where id=(select id from m9_refs where label='property')),'hidden location emits no coordinate');
select ok((select price_mode='PRICE_ON_REQUEST' and price_amount is null and price_min is null and price_max is null from public.public_property_listings where id=(select id from m9_refs where label='property')),'Price on Request publishes without fake numeric price');
select is((select count(*)::integer from public.public_property_verification_summaries where property_id=(select id from m9_refs where label='property')),0,'unapproved verification copy remains absent after publication');

select lives_ok(format($$select public.change_property_availability('%s','%s','SOLD','90000000-0000-4000-8000-000000000001')$$,(select id from m9_refs where label='property'),(select updated_at from public.properties where id=(select id from m9_refs where label='property'))),'availability changes independently while published');
select is((select availability_status::text from public.public_property_listings where id=(select id from m9_refs where label='property')),'SOLD','public projection immediately represents closed availability');
select is((select publication_status::text from public.properties where id=(select id from m9_refs where label='property')),'PUBLISHED','availability does not unpublish implicitly');
select lives_ok(format($$select public.unpublish_property('90000000-0000-4000-8000-000000000001','%s','%s','Synthetic listing withdrawn from public discovery')$$,(select id from m9_refs where label='property'),(select updated_at from public.properties where id=(select id from m9_refs where label='property'))),'published property unpublishes explicitly');
select is((select count(*)::integer from public.public_property_listings where id=(select id from m9_refs where label='property')),0,'unpublish removes public inventory');
select is((select count(*)::integer from public.public_property_indexability where id=(select id from m9_refs where label='property')),0,'unpublish removes sitemap/indexability eligibility');
select is((select count(*)::integer from public.audit_logs where entity_id=(select id from m9_refs where label='property') and action='UNPUBLISH'),1,'unpublish audit exists');
select lives_ok(format($$select public.archive_property_draft('%s','%s','90000000-0000-4000-8000-000000000001')$$,(select id from m9_refs where label='property'),(select updated_at from public.properties where id=(select id from m9_refs where label='property'))),'unpublished property archives safely');
select ok((select publication_status='ARCHIVED' and availability_status='OFF_MARKET' from public.properties where id=(select id from m9_refs where label='property')),'archive cannot remain publicly available');
select throws_ok(format($$select public.publish_property('90000000-0000-4000-8000-000000000001','%s','%s')$$,(select id from m9_refs where label='property'),(select updated_at from public.properties where id=(select id from m9_refs where label='property'))),'P0001','Only draft, under-review, or unpublished properties may be published','archived property cannot publish');

reset role;
set local role authenticated;
select ok(not has_function_privilege(current_user,'public.publish_property(uuid,uuid,timestamp with time zone)','execute'),'authenticated browser cannot execute publish RPC');
select ok(not has_function_privilege(current_user,'public.unpublish_property(uuid,uuid,timestamp with time zone,text)','execute'),'authenticated browser cannot execute unpublish RPC');
select ok(not has_table_privilege(current_user,'public.properties','update'),'browser cannot directly change publication fields');
reset role;
set local role anon;
select ok(not has_function_privilege(current_user,'public.get_property_publication_readiness(uuid,uuid)','execute'),'anonymous actor cannot submit a manipulated readiness decision');
select is((select count(*)::integer from public.public_property_listings where id=(select id from m9_refs where label='property')),0,'anonymous actor cannot retrieve archived inventory');
reset role;

select * from finish();
rollback;
