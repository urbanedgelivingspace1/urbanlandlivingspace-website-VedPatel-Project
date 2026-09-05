begin;
create extension if not exists pgtap with schema extensions;
set search_path=public,extensions;
select plan(38);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values('92000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','m12-admin@example.invalid','',now(),'{}','{}',now(),now()),
('92000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','m12-user@example.invalid','',now(),'{}','{}',now(),now());
insert into public.admin_profiles(user_id,display_name,role,is_active) values('92000000-0000-4000-8000-000000000001','M12 Admin','ADMIN',true);
insert into public.properties(id,property_code,land_category,primary_transaction_type,district_id,display_area_value,display_area_unit_id)
values('92000000-0000-4000-8000-000000000010','UE-LS-920010','AGRICULTURAL','BUY','00000000-0000-4000-8000-000000000003',2,'10000000-0000-4000-8000-000000000006');

select has_table('public','lead_follow_ups','structured follow-up table exists');
select has_index('public','lead_follow_ups','lead_follow_ups_queue_idx','follow-up queue is indexed');
select col_is_pk('public','lead_follow_ups','id','follow-up identity is a primary key');
select is((select count(*)::int from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='lead_status'),12,'pipeline has exactly twelve states');
select ok(exists(select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='lead_status' and e.enumlabel='CLOSED_WON'),'closed won state exists');
select ok(not exists(select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='lead_status' and e.enumlabel='FOLLOW_UP_REQUIRED'),'follow-up is not a visit/lead state');

create temporary table m12_ids(lead_id uuid,follow_up_id uuid);
insert into m12_ids(lead_id) select public.create_admin_lead('92000000-0000-4000-8000-000000000001',jsonb_build_object('name','Private CRM Canary','phone','+919999999999','email','private-m12@example.invalid','sourceType','MANUAL','inquiryType','BUYER_REQUIREMENT','buyerType','INVESTOR','preferredTransaction','BUY','landCategory','AGRICULTURAL','districtId','00000000-0000-4000-8000-000000000003','budgetMin',1000000,'budgetMax',3000000,'notesInternal','Private intake note'));
create temporary table m12_duplicate(lead_id uuid);
insert into m12_duplicate(lead_id) select public.create_admin_lead('92000000-0000-4000-8000-000000000001',jsonb_build_object('name','Private CRM Canary New Intent','phone','+919999999999','email','private-m12@example.invalid','sourceType','REFERRAL','inquiryType','PRICE_INQUIRY'));
select is((select party_id from public.leads where id=(select lead_id from m12_duplicate)),(select party_id from public.leads where id=(select lead_id from m12_ids)),'unambiguous duplicate signals reuse the contact party');
select is((select count(*)::int from public.leads where party_id=(select party_id from public.leads where id=(select lead_id from m12_ids))),2,'repeat intent remains a separate lead opportunity');
select is((select status::text from public.leads where id=(select lead_id from m12_ids)),'NEW','admin lead starts NEW');
select is((select count(*)::int from public.lead_activities where lead_id=(select lead_id from m12_ids) and activity_type='LEAD_CREATED'),1,'lead creation activity is atomic');
select is((select count(*)::int from public.lead_activities where lead_id=(select lead_id from m12_ids) and activity_type='NOTE_ADDED'),1,'initial note is an attributed append-only activity');
select is((select count(*)::int from public.audit_logs where entity_id=(select lead_id from m12_ids) and action='CREATE'),1,'lead creation is audited');
select throws_ok($$select public.transition_lead_status('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'PROPERTY_MATCHED',null)$$,'P0400',null,'invalid transition is rejected');
select public.add_lead_activity('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'CONTACT_ATTEMPTED','Called once');
select lives_ok($$select public.transition_lead_status('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'CONTACT_ATTEMPTED','Phone')$$,'contact attempted transition works with activity');
select lives_ok($$select public.transition_lead_status('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'QUALIFIED','Qualified offline')$$,'qualification works');
select public.save_lead_requirement('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),jsonb_build_object('minAreaValue',1,'maxAreaValue',3,'areaUnitId','10000000-0000-4000-8000-000000000006','notes','Private requirement'));
select lives_ok($$select public.transition_lead_status('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'REQUIREMENT_CONFIRMED','Reviewed')$$,'requirement confirmed needs persisted requirement');
select public.match_lead_property('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'92000000-0000-4000-8000-000000000010','ACTIVE','Candidate');
select lives_ok($$select public.transition_lead_status('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'PROPERTY_MATCHED','Candidate linked')$$,'property matched requires relation');
select is((select count(*)::int from public.lead_properties where lead_id=(select lead_id from m12_ids)),1,'one property relation exists');
select public.match_lead_property('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'92000000-0000-4000-8000-000000000010','REJECTED','Not suitable');
select is((select match_status from public.lead_properties where lead_id=(select lead_id from m12_ids)),'REJECTED','match may be rejected without duplicate relation');
update m12_ids set follow_up_id=public.schedule_lead_follow_up('92000000-0000-4000-8000-000000000001',lead_id,now()+interval '1 day','CALL','Budget check','Private follow-up') returning follow_up_id;
select is((select count(*)::int from public.lead_follow_ups where lead_id=(select lead_id from m12_ids) and completed_at is null),1,'one open structured follow-up exists');
select lives_ok($$select public.complete_lead_follow_up('92000000-0000-4000-8000-000000000001',(select follow_up_id from m12_ids),'Reached')$$,'follow-up completion works');
select ok((select completed_at is not null and completed_by is not null from public.lead_follow_ups where id=(select follow_up_id from m12_ids)),'completion records time and actor');
select is((select count(*)::int from public.lead_activities where lead_id=(select lead_id from m12_ids) and activity_type='FOLLOW_UP_COMPLETED'),1,'completion appends activity');
select throws_ok($$select public.transition_lead_status('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'CLOSED_LOST',null)$$,'Closed lost requires a structured reason','terminal loss needs reason');
select throws_ok($$select public.transition_lead_status('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'CLOSED_LOST','UNSTRUCTURED')$$,'Closed lost requires a structured reason','terminal loss rejects an unstructured reason');
select lives_ok($$select public.transition_lead_status('92000000-0000-4000-8000-000000000001',(select lead_id from m12_duplicate),'CLOSED_LOST','NOT_INTERESTED')$$,'closed lost accepts a structured reason');
select ok((select status='CLOSED_LOST' and loss_reason='NOT_INTERESTED' and closed_at is not null from public.leads where id=(select lead_id from m12_duplicate)),'closed lost persists terminal outcome fields');
update public.leads set status='NEGOTIATION' where id=(select lead_id from m12_ids);
select throws_ok($$select public.transition_lead_status('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'CLOSED_WON','Confirmed transaction')$$,'Closed won requires an outcome property','closed won rejects a lead with only rejected matches');
select public.match_lead_property('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'92000000-0000-4000-8000-000000000010','ACCEPTED','Outcome property');
select lives_ok($$select public.transition_lead_status('92000000-0000-4000-8000-000000000001',(select lead_id from m12_ids),'CLOSED_WON','Confirmed transaction')$$,'closed won accepts an outcome and active property relation');

set local role anon;
select ok(not has_table_privilege(current_user,'public.leads','select'),'anonymous cannot read leads');
select ok(not has_table_privilege(current_user,'public.lead_requirements','select'),'anonymous cannot read requirements');
select ok(not has_table_privilege(current_user,'public.lead_follow_ups','select'),'anonymous cannot read follow-ups');
select throws_ok($$insert into public.leads(party_id,source_type,inquiry_type) values('00000000-0000-0000-0000-000000000000','WEB','GENERAL_CONTACT')$$,'42501',null,'anonymous cannot insert leads');
select ok(not has_function_privilege(current_user,'public.create_admin_lead(uuid,jsonb)','execute'),'anonymous cannot execute CRM creation RPC');
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub','92000000-0000-4000-8000-000000000002','role','authenticated')::text,true);
select is((select count(*)::int from public.leads),0,'non-admin cannot read leads');
select ok(not has_function_privilege(current_user,'public.transition_lead_status(uuid,uuid,public.lead_status,text)','execute'),'browser role cannot execute transition RPC');
set local role postgres;
select ok(position('private-m12@example.invalid' in coalesce((select after_state::text from public.audit_logs where entity_id=(select lead_id from m12_ids) and action='CREATE'),''))=0,'audit metadata excludes contact PII');
select is((select count(*)::int from public.public_property_listings where row_to_json(public_property_listings)::text like '%Private CRM Canary%'),0,'public projection excludes lead PII');
select * from finish();
rollback;
