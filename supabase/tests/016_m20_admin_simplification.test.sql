begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(21);

select ok(
  exists(
    select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid
    where t.typnamespace='public'::regnamespace and t.typname='lead_inquiry_type'
      and e.enumlabel='SELLER_LEAD'
  ),
  'seller lead is a first-class inquiry type'
);
select has_function(
  'public','register_lead_private_document',array['uuid','jsonb'],
  'controlled seller-lead document registration exists'
);
select ok(
  has_function_privilege('service_role','public.register_lead_private_document(uuid,jsonb)','execute'),
  'only the server workflow may register seller documents'
);
select ok(
  not has_function_privilege('anon','public.register_lead_private_document(uuid,jsonb)','execute')
  and not has_function_privilege('authenticated','public.register_lead_private_document(uuid,jsonb)','execute'),
  'browser roles cannot register seller documents directly'
);
select ok(
  (select not public from storage.buckets where id='verification-documents-private'),
  'the reused document bucket remains private'
);
select is(
  (select count(*)::integer from pg_policies where schemaname='storage' and tablename='objects'
    and cmd in ('INSERT','UPDATE','DELETE') and roles && array['anon','authenticated']::name[]),
  0,
  'browser roles still have no storage mutation policy'
);

insert into auth.users(
  id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values (
  '96000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000',
  'authenticated','authenticated','m20-admin@example.invalid','',now(),
  '{"provider":"email","providers":["email"]}','{}',now(),now()
);
insert into public.admin_profiles(user_id,display_name,role,is_active)
values('96000000-0000-4000-8000-000000000001','Synthetic M20 admin','ADMIN',true);
insert into public.parties(id,party_type,display_name,phone)
values
  ('96000000-0000-4000-8000-000000000002','INDIVIDUAL','Synthetic M20 seller','+919600000002'),
  ('96000000-0000-4000-8000-000000000003','INDIVIDUAL','Synthetic M20 buyer','+919600000003');
insert into public.leads(id,party_id,source_type,inquiry_type,status)
values
  ('96000000-0000-4000-8000-000000000004','96000000-0000-4000-8000-000000000002','MANUAL','SELLER_LEAD','NEW'),
  ('96000000-0000-4000-8000-000000000005','96000000-0000-4000-8000-000000000003','MANUAL','BUYER_REQUIREMENT','NEGOTIATION');

set local role service_role;
set local request.jwt.claims='{"role":"service_role"}';
create temporary table m20_ids(label text primary key,id uuid not null);
grant all on table m20_ids to service_role;

insert into m20_ids values(
  'property-1',
  public.save_property_draft(null,null,'96000000-0000-4000-8000-000000000001',jsonb_build_object(
    'landCategory','AGRICULTURAL','primaryTransactionType','BUY',
    'listingTitle','M20 seller agricultural land one',
    'shortDescription','Marketing-ready synthetic seller property one.',
    'description','Synthetic description used to verify simplified marketing publication rules.',
    'publicSlug','m20-seller-agricultural-land-one','publicAddress','Ahmedabad district, Gujarat',
    'districtId','00000000-0000-4000-8000-000000000003','displayAreaValue',2,
    'displayAreaUnitId','10000000-0000-4000-8000-000000000006',
    'location',jsonb_build_object('visibility','HIDDEN'),
    'offer',jsonb_build_object('transactionType','BUY','priceMode','PRICE_ON_REQUEST','currencyCode','INR','negotiable',true),
    'parcel',jsonb_build_object('sequenceNo',1,'label','Synthetic parcel one','identifierType','SURVEY_NUMBER','identifierValue','M20-1'),
    'categoryDetails',jsonb_build_object('landCategory','AGRICULTURAL'),
    'sourceLink',jsonb_build_object('sourceType','SELLER_LEAD','sourceName','Synthetic seller lead','sourceReference','96000000-0000-4000-8000-000000000004')
  ))
);
insert into m20_ids values(
  'property-2',
  public.save_property_draft(null,null,'96000000-0000-4000-8000-000000000001',jsonb_build_object(
    'landCategory','AGRICULTURAL','primaryTransactionType','BUY',
    'listingTitle','M20 seller agricultural land two',
    'shortDescription','Marketing-ready synthetic seller property two.',
    'description','Synthetic description used to verify public projection behavior after M20.',
    'publicSlug','m20-seller-agricultural-land-two','publicAddress','Ahmedabad district, Gujarat',
    'districtId','00000000-0000-4000-8000-000000000003','displayAreaValue',3,
    'displayAreaUnitId','10000000-0000-4000-8000-000000000006',
    'location',jsonb_build_object('visibility','HIDDEN'),
    'offer',jsonb_build_object('transactionType','BUY','priceMode','PRICE_ON_REQUEST','currencyCode','INR','negotiable',true),
    'parcel',jsonb_build_object('sequenceNo',1,'label','Synthetic parcel two','identifierType','SURVEY_NUMBER','identifierValue','M20-2'),
    'categoryDetails',jsonb_build_object('landCategory','AGRICULTURAL'),
    'sourceLink',jsonb_build_object('sourceType','SELLER_LEAD','sourceName','Synthetic seller lead','sourceReference','96000000-0000-4000-8000-000000000004')
  ))
);

insert into public.media_assets(
  id,property_id,media_type,storage_bucket,object_path,mime_type,file_size_bytes,
  width_px,height_px,alt_text,visibility,is_cover,sort_order,source_type,
  checksum_sha256,processing_status,approved_at,created_by,updated_by
) values
  ('96000000-0000-4000-8000-000000000011',(select id from m20_ids where label='property-1'),'IMAGE','property-media-public','properties/m20/one.webp','image/webp',1000,1600,1000,'Synthetic land one','PUBLIC',true,10,'SUPABASE_UPLOAD',repeat('1',64),'APPROVED',now(),'96000000-0000-4000-8000-000000000001','96000000-0000-4000-8000-000000000001'),
  ('96000000-0000-4000-8000-000000000012',(select id from m20_ids where label='property-2'),'IMAGE','property-media-public','properties/m20/two.webp','image/webp',1000,1600,1000,'Synthetic land two','PUBLIC',true,10,'SUPABASE_UPLOAD',repeat('2',64),'APPROVED',now(),'96000000-0000-4000-8000-000000000001','96000000-0000-4000-8000-000000000001');

select is(
  (select count(*)::integer from public.property_source_links
    where source_type='SELLER_LEAD' and source_reference='96000000-0000-4000-8000-000000000004'),
  2,
  'one seller lead can explicitly source multiple properties'
);
select ok(
  (public.property_publication_readiness((select id from m20_ids where label='property-1'))->>'ready')::boolean,
  'core marketing data is publishable without deep verification records'
);
select is(
  (select count(*)::integer from public.property_verifications
    where property_id=(select id from m20_ids where label='property-1')),
  0,
  'marketing readiness does not initialize hidden verification work'
);
select ok(
  public.property_publication_readiness((select id from m20_ids where label='property-1'))->'warnings'
    @> '[{"code":"AGRICULTURAL_DATA_OPTIONAL"}]',
  'missing category-specific data is an optional warning'
);

update public.properties set listing_title='100% clear title M20 land'
where id=(select id from m20_ids where label='property-2');
select ok(
  public.property_publication_readiness((select id from m20_ids where label='property-2'))->'blockers'
    @> '[{"code":"UNSAFE_PUBLIC_CLAIM"}]',
  'prohibited legal claims still block marketing publication'
);
update public.properties set listing_title='M20 seller agricultural land two'
where id=(select id from m20_ids where label='property-2');

insert into public.lead_properties(lead_id,property_id,match_status,matched_at)
select '96000000-0000-4000-8000-000000000005',id,'ACTIVE',now() from m20_ids;
select is(
  (select count(*)::integer from public.lead_properties where lead_id='96000000-0000-4000-8000-000000000005'),
  2,
  'one buyer lead can be matched to multiple properties'
);
select lives_ok(
  $$select public.transition_lead_status('96000000-0000-4000-8000-000000000001','96000000-0000-4000-8000-000000000005','CLOSED_WON','Synthetic accepted property')$$,
  'buyer lead can close won with an active property relation'
);
select is(
  (select availability_status::text from public.properties where id=(select id from m20_ids where label='property-1')),
  'AVAILABLE',
  'closed won does not change inventory availability implicitly'
);
select lives_ok(
  format($$select public.change_property_availability('%s','%s','SOLD','96000000-0000-4000-8000-000000000001')$$,
    (select id from m20_ids where label='property-1'),
    (select updated_at from public.properties where id=(select id from m20_ids where label='property-1'))),
  'availability changes only through the explicit inventory workflow'
);
select is(
  (select availability_status::text from public.properties where id=(select id from m20_ids where label='property-1')),
  'SOLD',
  'explicit availability change marks the property sold'
);

select is(
  (select count(*)::integer from public.public_property_listings
    where id=(select id from m20_ids where label='property-2')),
  0,
  'draft property is absent from the public projection'
);
select lives_ok(
  format($$select public.publish_property('96000000-0000-4000-8000-000000000001','%s','%s')$$,
    (select id from m20_ids where label='property-2'),
    (select updated_at from public.properties where id=(select id from m20_ids where label='property-2'))),
  'marketing-ready property publishes without verification completion'
);
select is(
  (select count(*)::integer from public.public_property_listings
    where id=(select id from m20_ids where label='property-2')),
  1,
  'published property enters the public-safe projection'
);

insert into m20_ids values(
  'lead-document',
  public.register_lead_private_document(
    '96000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'id','96000000-0000-4000-8000-000000000013','leadId','96000000-0000-4000-8000-000000000004',
      'documentType','LAND_RECORDS','objectPath','leads/96000000-0000-4000-8000-000000000004/documents/96000000-0000-4000-8000-000000000013.pdf',
      'mimeType','application/pdf','fileSizeBytes',1000,'checksumSha256',repeat('3',64),
      'originalFileName','seller-record.pdf','pageCount',1,'scanStatus','CLEAN'
    )
  )
);
select ok(
  (select visibility='PRIVATE' and property_id is null and document_reference='LEAD:96000000-0000-4000-8000-000000000004'
    from public.private_documents where id=(select id from m20_ids where label='lead-document')),
  'seller document metadata is private and attached to the lead party, not verification'
);
select is(
  public.register_lead_private_document(
    '96000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'id','96000000-0000-4000-8000-000000000014','leadId','96000000-0000-4000-8000-000000000004',
      'documentType','LAND_RECORDS','objectPath','leads/96000000-0000-4000-8000-000000000004/documents/96000000-0000-4000-8000-000000000014.pdf',
      'mimeType','application/pdf','fileSizeBytes',1000,'checksumSha256',repeat('3',64),
      'originalFileName','seller-record-copy.pdf','pageCount',1,'scanStatus','CLEAN'
    )
  ),
  (select id from m20_ids where label='lead-document'),
  'seller document registration is idempotent by lead, tag, and checksum'
);

reset role;
select * from finish();
rollback;
