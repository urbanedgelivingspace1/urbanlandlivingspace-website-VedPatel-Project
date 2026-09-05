begin;
create extension if not exists pgtap with schema extensions;
set search_path=public,extensions;
select plan(46);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
('94000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','m14-admin@example.invalid','',now(),'{}','{}',now(),now()),
('94000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','m14-user@example.invalid','',now(),'{}','{}',now(),now());
insert into public.admin_profiles(user_id,display_name,role,is_active)
values('94000000-0000-4000-8000-000000000001','M14 Admin','ADMIN',true);
insert into public.properties(id,property_code,public_slug,land_category,primary_transaction_type,publication_status,availability_status,listing_title,district_id,display_area_value,display_area_unit_id,published_at)
values('94000000-0000-4000-8000-000000000010','UE-LS-940010','m14-visit-land','AGRICULTURAL','BUY','PUBLISHED','AVAILABLE','M14 visit land','00000000-0000-4000-8000-000000000003',2,'10000000-0000-4000-8000-000000000006',now());

select has_table('public','site_visit_events','append-only visit history exists');
select has_column('public','site_visits','version','visit has optimistic concurrency version');
select has_column('public','site_visits','meeting_instructions','visit stores operational instructions');
select has_column('public','lead_follow_ups','site_visit_id','CRM follow-up may link to a visit');
select has_function('public','transition_site_visit',array['uuid','uuid','bigint','site_visit_status','jsonb'],'atomic transition RPC exists');
select is((select count(*)::integer from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='site_visit_status'),8,'site-visit status remains the approved eight-state enum');
select ok(not exists(select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='site_visit_status' and e.enumlabel='FOLLOW_UP_REQUIRED'),'follow-up is not a site-visit status');

create temporary table m14_request as select * from public.submit_public_crm_intake(
  'SITE_VISIT_REQUEST',repeat('a',64)::char(64),jsonb_build_object(
    'name','M14 Private Visitor','phone','+919400000001','consent',true,
    'privacyNoticeVersion','M13-CONTACT-PLACEHOLDER-2026-09-05','propertySlug','m14-visit-land',
    'requestedStartAt',now()+interval '3 days','requestedEndAt',now()+interval '3 days 3 hours','message','PRIVATE_M14_REQUEST_CANARY'
  )
);
create temporary table m14_ids as select s.id as visit_id,s.lead_id from public.site_visits s where s.lead_id=(select target_lead_id from m14_request);
select is((select status::text from public.site_visits where id=(select visit_id from m14_ids)),'REQUESTED','M13 request enters M14 queue as REQUESTED');
select is((select version::integer from public.site_visits where id=(select visit_id from m14_ids)),1,'new request starts at version one');
select is((select count(*)::integer from public.site_visit_events where site_visit_id=(select visit_id from m14_ids) and event_type='REQUESTED'),1,'request history is backfilled/recorded');
select throws_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select visit_id from m14_ids),1,'CONFIRMED','{}')$$,'P0400',null,'request cannot jump directly to confirmed');
select lives_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select visit_id from m14_ids),1,'CONTACTED',jsonb_build_object('contactOutcome','Reached visitor','note','PRIVATE_M14_CONTACT_CANARY'))$$,'admin records contacted explicitly');
select ok((select status='CONTACTED' and contacted_at is not null and contact_outcome='Reached visitor' and version=2 from public.site_visits where id=(select visit_id from m14_ids)),'contact persists actor-safe operational data and advances version');
select is((select status::text from public.leads where id=(select lead_id from m14_ids)),'SITE_VISIT_REQUESTED','contact reconciles the truthful requested CRM milestone');
select throws_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select visit_id from m14_ids),2,'PROPOSED','{}')$$,'VISIT_SLOT_REQUIRED','proposal requires an explicit slot');
select lives_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select visit_id from m14_ids),2,'PROPOSED',jsonb_build_object('startAt',now()+interval '4 days','endAt',now()+interval '4 days 2 hours','timezone','Asia/Kolkata','meetingInstructions','Meet at public gate'))$$,'future proposal succeeds');
select ok((select status='PROPOSED' and confirmed_start_at is null and version=3 from public.site_visits where id=(select visit_id from m14_ids)),'proposal remains distinct from confirmation');
select lives_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select visit_id from m14_ids),3,'CONFIRMED',jsonb_build_object('note','Visitor agreed'))$$,'admin explicitly confirms proposed slot');
select is((select status::text from public.leads where id=(select lead_id from m14_ids)),'SITE_VISIT_CONFIRMED','confirmation atomically synchronizes CRM stage');
select is((select count(*)::integer from public.lead_activities where lead_id=(select lead_id from m14_ids) and activity_type='SITE_VISIT_CONFIRMED'),1,'confirmation appends a distinct CRM activity');
select lives_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select visit_id from m14_ids),4,'RESCHEDULED',jsonb_build_object('startAt',now()+interval '5 days','endAt',now()+interval '5 days 2 hours','timezone','Asia/Kolkata','reason','Visitor requested another day'))$$,'confirmed visit can be explicitly rescheduled');
select ok((select status='RESCHEDULED' and confirmed_start_at is null and proposed_start_at is not null and version=5 from public.site_visits where id=(select visit_id from m14_ids)),'reschedule clears current confirmation and retains new proposal');
select ok((select previous_start_at is not null and new_start_at is not null and previous_start_at<>new_start_at from public.site_visit_events where site_visit_id=(select visit_id from m14_ids) and event_type='RESCHEDULED'),'reschedule history retains old and new schedule');
select is((select status::text from public.leads where id=(select lead_id from m14_ids)),'SITE_VISIT_REQUESTED','reschedule prevents CRM from falsely remaining confirmed');
select throws_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select visit_id from m14_ids),4,'CONFIRMED','{}')$$,'P0409',null,'stale mutation is rejected');
select lives_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select visit_id from m14_ids),5,'CONFIRMED','{}')$$,'revised slot requires explicit confirmation');
update public.properties set availability_status='SOLD' where id='94000000-0000-4000-8000-000000000010';
select throws_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select visit_id from m14_ids),6,'RESCHEDULED',jsonb_build_object('startAt',now()+interval '6 days','endAt',now()+interval '6 days 1 hour','reason','Try again'))$$,'PROPERTY_NOT_VISITABLE','sold property blocks blind rescheduling');
select is((select status::text from public.site_visits where id=(select visit_id from m14_ids)),'CONFIRMED','property conflict leaves historical visit unchanged');
update public.properties set availability_status='AVAILABLE' where id='94000000-0000-4000-8000-000000000010';
select lives_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select visit_id from m14_ids),6,'CANCELLED',jsonb_build_object('reason','PRIVATE_M14_CANCELLATION_CANARY'))$$,'confirmed visit can be cancelled with reason');
select ok((select status='CANCELLED' and cancelled_at is not null and cancellation_reason='PRIVATE_M14_CANCELLATION_CANARY' from public.site_visits where id=(select visit_id from m14_ids)),'cancellation is retained instead of deleting the visit');
create temporary table m14_follow as select public.schedule_site_visit_follow_up('94000000-0000-4000-8000-000000000001',(select visit_id from m14_ids),7,now()+interval '1 day','CALL','Revisit interest','PRIVATE_M14_FOLLOW_UP') as id;
select ok((select site_visit_id=(select visit_id from m14_ids) and completed_at is null from public.lead_follow_ups where id=(select id from m14_follow)),'separate CRM follow-up links to cancelled visit');
select is((select status::text from public.site_visits where id=(select visit_id from m14_ids)),'CANCELLED','follow-up does not replace terminal visit state');
select is((select count(*)::integer from public.site_visit_events where site_visit_id=(select visit_id from m14_ids) and event_type='FOLLOW_UP_LINKED'),1,'follow-up linkage has visit history evidence');

insert into public.site_visits(lead_id,property_id,status,proposed_start_at,proposed_end_at,confirmed_start_at,confirmed_end_at,assigned_to)
values((select lead_id from m14_ids),'94000000-0000-4000-8000-000000000010','CONFIRMED',now()-interval '3 hours',now()-interval '1 hour',now()-interval '3 hours',now()-interval '1 hour','94000000-0000-4000-8000-000000000001');
create temporary table m14_complete as select id,lead_id from public.site_visits where lead_id=(select lead_id from m14_ids) and status='CONFIRMED' order by created_at desc limit 1;
update public.leads set status='SITE_VISIT_CONFIRMED' where id=(select lead_id from m14_complete);
select lives_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select id from m14_complete),1,'COMPLETED',jsonb_build_object('outcome','INTERESTED','note','Discuss commercials'))$$,'past confirmed visit can be completed explicitly');
select ok((select status='COMPLETED' and completed_at is not null and outcome='INTERESTED' from public.site_visits where id=(select id from m14_complete)),'completion stores time and outcome');
select is((select status::text from public.leads where id=(select lead_id from m14_complete)),'SITE_VISIT_COMPLETED','completion atomically synchronizes CRM stage');
select is((select count(*)::integer from public.lead_activities where lead_id=(select lead_id from m14_complete) and activity_type='SITE_VISIT_COMPLETED'),1,'completion appends CRM activity');

insert into public.site_visits(lead_id,property_id,status,proposed_start_at,proposed_end_at,confirmed_start_at,confirmed_end_at,assigned_to)
values((select lead_id from m14_ids),'94000000-0000-4000-8000-000000000010','CONFIRMED',now()-interval '3 hours',now()-interval '1 hour',now()-interval '3 hours',now()-interval '1 hour','94000000-0000-4000-8000-000000000001');
create temporary table m14_no_show as select id,lead_id from public.site_visits where lead_id=(select lead_id from m14_ids) and status='CONFIRMED' order by created_at desc limit 1;
update public.leads set status='SITE_VISIT_CONFIRMED' where id=(select lead_id from m14_no_show);
select lives_ok($$select public.transition_site_visit('94000000-0000-4000-8000-000000000001',(select id from m14_no_show),1,'NO_SHOW',jsonb_build_object('outcome','NO_SHOW'))$$,'past confirmed visit can record no-show explicitly');
select ok((select status='NO_SHOW' and no_show_at is not null and completed_at is null from public.site_visits where id=(select id from m14_no_show)),'no-show remains distinct from completed and cancelled');
select is((select status::text from public.leads where id=(select lead_id from m14_no_show)),'SITE_VISIT_REQUESTED','no-show removes false confirmed CRM state for possible reschedule');

set local role anon;
select ok(not has_table_privilege(current_user,'public.site_visits','select'),'anonymous cannot read visit operations');
select ok(not has_function_privilege(current_user,'public.transition_site_visit(uuid,uuid,bigint,public.site_visit_status,jsonb)','execute'),'anonymous cannot execute visit transition RPC');
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub','94000000-0000-4000-8000-000000000002','role','authenticated')::text,true);
select is((select count(*)::integer from public.site_visits),0,'authenticated non-admin cannot read guessed visit IDs');
select ok(not has_function_privilege(current_user,'public.transition_site_visit(uuid,uuid,bigint,public.site_visit_status,jsonb)','execute'),'browser role cannot invoke privileged visit mutation');
select set_config('request.jwt.claims',json_build_object('sub','94000000-0000-4000-8000-000000000001','role','authenticated')::text,true);
select ok((select count(*) from public.site_visits)>0,'active admin can read private visit queue');
set local role postgres;
select ok(position('PRIVATE_M14_' in coalesce((select string_agg(coalesce(before_state::text,'')||coalesce(after_state::text,'')||coalesce(reason,''),'') from public.audit_logs where entity_type='site_visit'),''))=0,'generic audit payload excludes private operational notes and reasons');

select * from finish();
rollback;
