begin;
create extension if not exists pgtap with schema extensions;
set search_path=public,extensions;
select plan(61);

insert into public.properties(id,property_code,public_slug,land_category,primary_transaction_type,publication_status,availability_status,listing_title,district_id,display_area_value,display_area_unit_id,published_at)
values
('93000000-0000-4000-8000-000000000001','UE-LS-930001','m13-published-land','AGRICULTURAL','BUY','PUBLISHED','AVAILABLE','M13 published land','00000000-0000-4000-8000-000000000003',2,'10000000-0000-4000-8000-000000000006',now()),
('93000000-0000-4000-8000-000000000002','UE-LS-930002','m13-private-land','NA','BUY','DRAFT','AVAILABLE','M13 private land','00000000-0000-4000-8000-000000000003',1,'10000000-0000-4000-8000-000000000006',null);

select has_table('public','party_consents','versioned consent events exist');
select has_table('public','public_intake_idempotency','bounded replay records exist');
select has_table('public','public_rate_limit_events','privacy-preserving rate events exist');
select has_table('public','notification_deliveries','notification outcome records exist');
select has_function('public','submit_public_crm_intake',array['character varying','character','jsonb'],'transactional public intake function exists');
select has_function('public','consume_public_intake_rate_limit',array['character varying','character','integer','integer'],'rate limiter function exists');
select is((select count(*)::integer from information_schema.views where table_schema='public' and table_name like 'public_%'),15,'M13 adds no CRM projection and the later M16 redirect projection is present');

create temporary table m13_inquiry as select * from public.submit_public_crm_intake(
  'PROPERTY_INQUIRY',repeat('a',64)::char(64),jsonb_build_object(
    'name','M13 Private Inquiry','phone','+919876543210','email','m13-private@example.invalid',
    'consent',true,'privacyNoticeVersion','M13-CONTACT-PLACEHOLDER-2026-09-05',
    'propertySlug','m13-published-land','preferredContact','PHONE','message','Please share suitable public details'
  )
);
select is((select replayed from m13_inquiry),false,'first property inquiry is not a replay');
select is((select status::text from public.leads where id=(select target_lead_id from m13_inquiry)),'NEW','public inquiry starts NEW');
select is((select source_type from public.leads where id=(select target_lead_id from m13_inquiry)),'WEBSITE','server owns source type');
select is((select source_detail from public.leads where id=(select target_lead_id from m13_inquiry)),'PROPERTY_DETAIL:UE-LS-930001','canonical property reference is attributed');
select is((select count(*)::integer from public.party_consents where lead_id=(select target_lead_id from m13_inquiry)),1,'consent event is atomic');
select is((select privacy_notice_version from public.party_consents where lead_id=(select target_lead_id from m13_inquiry)),'M13-CONTACT-PLACEHOLDER-2026-09-05','consent notice version is retained');
select is((select match_status from public.lead_properties where lead_id=(select target_lead_id from m13_inquiry)),'INQUIRY','property association does not imply confirmed match');
select is((select count(*)::integer from public.lead_activities where lead_id=(select target_lead_id from m13_inquiry)),2,'lead and inquiry activities are atomic');
select is((select metadata_text from public.lead_activities where lead_id=(select target_lead_id from m13_inquiry) and activity_type='PROPERTY_INQUIRY_RECEIVED'),'preferred_contact=PHONE','approved contact preference is retained privately');
select is((select status from public.notification_deliveries where lead_id=(select target_lead_id from m13_inquiry)),'PENDING','post-commit notification intent is queued');
select is((select count(*)::integer from public.public_intake_idempotency where lead_id=(select target_lead_id from m13_inquiry)),1,'successful intake stores one replay record');
select ok(position('m13-private@example.invalid' in coalesce((select after_state::text from public.audit_logs where entity_id=(select target_lead_id from m13_inquiry)),''))=0,'generic audit excludes contact PII');
select ok(position('m13-private@example.invalid' in coalesce((select key_hash from public.public_intake_idempotency where lead_id=(select target_lead_id from m13_inquiry)),''))=0,'idempotency record contains only a non-reversible hash');

create temporary table m13_replay as select * from public.submit_public_crm_intake(
  'PROPERTY_INQUIRY',repeat('a',64)::char(64),jsonb_build_object(
    'name','M13 Private Inquiry','phone','+919876543210','email','m13-private@example.invalid',
    'consent',true,'privacyNoticeVersion','M13-CONTACT-PLACEHOLDER-2026-09-05',
    'propertySlug','m13-published-land','preferredContact','PHONE','message','Please share suitable public details'
  )
);
select is((select replayed from m13_replay),true,'same event and payload replays safely');
select is((select target_lead_id from m13_replay),(select target_lead_id from m13_inquiry),'replay resolves the original business record');
select is((select count(*)::integer from public.leads where source_type='WEBSITE' and inquiry_type='PROPERTY_INQUIRY'),1,'replay creates no duplicate lead');
select is((select count(*)::integer from public.notification_deliveries where lead_id=(select target_lead_id from m13_inquiry)),1,'replay creates no duplicate notification');
select throws_ok($$select * from public.submit_public_crm_intake('PROPERTY_INQUIRY',repeat('a',64)::char(64),jsonb_build_object('name','Changed Person','phone','+919876543210','consent',true,'privacyNoticeVersion','M13-CONTACT-PLACEHOLDER-2026-09-05','propertySlug','m13-published-land','preferredContact','PHONE'))$$,'IDEMPOTENCY_CONFLICT','same key cannot represent a changed payload');

create temporary table m13_returning as select * from public.submit_public_crm_intake(
  'PROPERTY_INQUIRY',repeat('b',64)::char(64),jsonb_build_object(
    'name','M13 Returning Inquiry','phone','+919876543210','email','m13-private@example.invalid',
    'consent',true,'privacyNoticeVersion','M13-CONTACT-PLACEHOLDER-2026-09-05',
    'propertySlug','m13-published-land','preferredContact','WHATSAPP'
  )
);
select is((select replayed from m13_returning),false,'a later enquiry is a new event');
select is((select party_id from public.leads where id=(select target_lead_id from m13_returning)),(select party_id from public.leads where id=(select target_lead_id from m13_inquiry)),'unambiguous returning contact reuses party');
select is((select count(*)::integer from public.leads where party_id=(select party_id from public.leads where id=(select target_lead_id from m13_inquiry))),2,'returning contact keeps distinct opportunities');

create temporary table m13_requirement as select * from public.submit_public_crm_intake(
  'BUYER_REQUIREMENT',repeat('c',64)::char(64),jsonb_build_object(
    'name','M13 Requirement','phone','+919876543211','consent',true,
    'privacyNoticeVersion','M13-CONTACT-PLACEHOLDER-2026-09-05','sourceContext','SEARCH_ZERO',
    'preferredTransaction','LEASE','landCategory','INDUSTRIAL','districtId','00000000-0000-4000-8000-000000000003',
    'minimumArea',2,'maximumArea',4,'areaUnitId','10000000-0000-4000-8000-000000000006',
    'budgetMinimum',1000000,'budgetMaximum',5000000,'timeline','1–3 months','message','Truck access preferred'
  )
);
select is((select target_property_id from m13_requirement),null::uuid,'generic requirement has no fake property');
select is((select count(*)::integer from public.lead_requirements where lead_id=(select target_lead_id from m13_requirement)),1,'structured requirement is atomic');
select is((select source_detail from public.leads where id=(select target_lead_id from m13_requirement)),'REQUIREMENTS_SEARCH_ZERO','safe discovery source is retained');
select is((select preferred_transaction::text from public.leads where id=(select target_lead_id from m13_requirement)),'LEASE','requirement transaction uses CRM taxonomy');
select is((select land_category::text from public.leads where id=(select target_lead_id from m13_requirement)),'INDUSTRIAL','requirement category uses CRM taxonomy');
select is((select count(*)::integer from public.lead_activities where lead_id=(select target_lead_id from m13_requirement) and activity_type='REQUIREMENT_UPDATED'),1,'requirement activity is recorded');

create temporary table m13_visit as select * from public.submit_public_crm_intake(
  'SITE_VISIT_REQUEST',repeat('d',64)::char(64),jsonb_build_object(
    'name','M13 Visit','phone','+919876543212','consent',true,
    'privacyNoticeVersion','M13-CONTACT-PLACEHOLDER-2026-09-05','propertySlug','m13-published-land',
    'requestedStartAt',now()+interval '2 days','requestedEndAt',now()+interval '2 days 3 hours','message','Morning preferred'
  )
);
select is((select status::text from public.site_visits where lead_id=(select target_lead_id from m13_visit)),'REQUESTED','visit intake creates REQUESTED only');
select ok((select confirmed_start_at is null and confirmed_end_at is null and completed_at is null from public.site_visits where lead_id=(select target_lead_id from m13_visit)),'visit is not auto-confirmed or completed');
select is((select status::text from public.leads where id=(select target_lead_id from m13_visit)),'NEW','visit request does not auto-progress lead');
select is((select match_status from public.lead_properties where lead_id=(select target_lead_id from m13_visit)),'VISIT_REQUESTED','visit property context is traceable without confirmed match');

insert into public.public_intake_idempotency(intake_action,key_hash,payload_hash,lead_id,created_at,expires_at)
values('GENERAL_CONTACT',repeat('9',64),repeat('8',64),(select target_lead_id from m13_inquiry),now()-interval '2 days',now()-interval '1 day');
create temporary table m13_contact as select * from public.submit_public_crm_intake(
  'GENERAL_CONTACT',repeat('e',64)::char(64),jsonb_build_object(
    'name','M13 Contact','phone','+919876543213','consent',true,
    'privacyNoticeVersion','M13-CONTACT-PLACEHOLDER-2026-09-05','intendedUse','Understand services','message','Please explain the process'
  )
);
select is((select source_detail from public.leads where id=(select target_lead_id from m13_contact)),'CONTACT_PAGE','contact enters the same CRM with server source');
select is((select count(*)::integer from public.lead_activities where lead_id=(select target_lead_id from m13_contact) and activity_type='GENERAL_CONTACT_RECEIVED'),1,'contact activity is recorded');
select is((select count(*)::integer from public.public_intake_idempotency where expires_at<=now()),0,'expired replay events are pruned at intake');

select throws_ok($$select * from public.submit_public_crm_intake('PROPERTY_INQUIRY',repeat('f',64)::char(64),jsonb_build_object('name','Private probe','phone','+919876543214','consent',true,'privacyNoticeVersion','M13-CONTACT-PLACEHOLDER-2026-09-05','propertySlug','m13-private-land','preferredContact','PHONE'))$$,'PUBLIC_PROPERTY_UNAVAILABLE','unpublished property is rejected generically');
select is((select count(*)::integer from public.leads where party_id in (select id from public.parties where phone='+919876543214')),0,'unpublished property rejection leaves no partial CRM state');
select throws_ok($$select * from public.submit_public_crm_intake('BUYER_REQUIREMENT',repeat('1',64)::char(64),jsonb_build_object('name','Bad range','phone','+919876543215','consent',true,'privacyNoticeVersion','M13-CONTACT-PLACEHOLDER-2026-09-05','preferredTransaction','BUY','landCategory','NA','minimumArea',5,'maximumArea',2,'areaUnitId','10000000-0000-4000-8000-000000000006'))$$,'23514',null,'invalid requirement range is rejected');
select is((select count(*)::integer from public.parties where phone='+919876543215'),0,'failed requirement transaction leaves no party');

insert into public.public_rate_limit_events(intake_action,bucket_hash,occurred_at)
values('GENERAL_CONTACT',repeat('3',64),now()-interval '2 days');
select ok(public.consume_public_intake_rate_limit('GENERAL_CONTACT',repeat('2',64)::char(64),2,900),'first bounded request is allowed');
select ok(public.consume_public_intake_rate_limit('GENERAL_CONTACT',repeat('2',64)::char(64),2,900),'second bounded request is allowed');
select ok(not public.consume_public_intake_rate_limit('GENERAL_CONTACT',repeat('2',64)::char(64),2,900),'request beyond the limit is blocked');
select is((select count(*)::integer from public.public_rate_limit_events where bucket_hash=repeat('2',64)::char(64)),2,'blocked request adds no rate event');
select is((select count(*)::integer from public.public_rate_limit_events where occurred_at<=now()-interval '24 hours'),0,'old rate events are pruned to bound retention');

select public.record_notification_delivery_result((select target_notification_id from m13_inquiry),'FAILED','HTTP_503');
select is((select status from public.notification_deliveries where id=(select target_notification_id from m13_inquiry)),'FAILED','notification failure is recorded after durable intake');
select is((select last_error_code from public.notification_deliveries where id=(select target_notification_id from m13_inquiry)),'HTTP_503','notification record stores only bounded failure code');
select is((select count(*)::integer from public.leads where id=(select target_lead_id from m13_inquiry)),1,'notification failure does not roll back lead');

set local role anon;
select ok(not has_table_privilege(current_user,'public.party_consents','select'),'anonymous cannot read consent events');
select ok(not has_table_privilege(current_user,'public.public_intake_idempotency','select'),'anonymous cannot enumerate intake events');
select throws_ok($$insert into public.parties(party_type,display_name,phone) values('INDIVIDUAL','Bypass','+919999999999')$$,'42501',null,'anonymous cannot bypass server intake with direct insert');
select ok(not has_function_privilege(current_user,'public.submit_public_crm_intake(character varying,character,jsonb)','execute'),'anonymous cannot execute intake RPC directly');
set local role authenticated;
select ok(not has_function_privilege(current_user,'public.consume_public_intake_rate_limit(character varying,character,integer,integer)','execute'),'browser authenticated role cannot execute rate RPC');
select ok(not has_function_privilege(current_user,'public.submit_public_crm_intake(character varying,character,jsonb)','execute'),'browser authenticated role cannot execute intake RPC');
set local role postgres;
select ok(has_function_privilege('service_role','public.submit_public_crm_intake(character varying,character,jsonb)','execute'),'service role owns the narrow intake path');
select is((select count(*)::integer from public.public_property_listings where row_to_json(public_property_listings)::text like '%M13 Private Inquiry%'),0,'submitted PII never enters public projections');

select * from finish();
rollback;
