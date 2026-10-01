begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(12);

select has_function(
  'public',
  'delete_completed_lead_follow_up',
  array['uuid', 'uuid'],
  'completed follow-up deletion RPC exists'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.delete_completed_lead_follow_up(uuid,uuid)',
    'execute'
  ),
  'server workflow may delete completed follow-ups'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.delete_completed_lead_follow_up(uuid,uuid)',
    'execute'
  )
  and not has_function_privilege(
    'authenticated',
    'public.delete_completed_lead_follow_up(uuid,uuid)',
    'execute'
  ),
  'browser roles cannot execute completed follow-up deletion'
);
select is(
  (
    select confdeltype::text
    from pg_constraint
    where conname = 'site_visit_events_follow_up_id_fkey'
  ),
  'n',
  'site-visit history keeps its event and nulls only the deleted follow-up reference'
);

insert into auth.users(
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '97000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'follow-up-admin@example.invalid',
    '',
    now(),
    '{}',
    '{}',
    now(),
    now()
  ),
  (
    '97000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'follow-up-user@example.invalid',
    '',
    now(),
    '{}',
    '{}',
    now(),
    now()
  );

insert into public.admin_profiles(user_id, display_name, role, is_active)
values ('97000000-0000-4000-8000-000000000001', 'Follow-up Admin', 'ADMIN', true);

insert into public.parties(id, party_type, display_name, phone)
values (
  '97000000-0000-4000-8000-000000000003',
  'INDIVIDUAL',
  'Follow-up Customer',
  '+919700000003'
);

insert into public.leads(id, party_id, source_type, inquiry_type, status)
values (
  '97000000-0000-4000-8000-000000000004',
  '97000000-0000-4000-8000-000000000003',
  'MANUAL',
  'GENERAL_CONTACT',
  'NEW'
);

insert into public.properties(
  id, property_code, land_category, primary_transaction_type, district_id,
  display_area_value, display_area_unit_id
) values (
  '97000000-0000-4000-8000-000000000005',
  'UE-LS-970005',
  'NA',
  'BUY',
  '00000000-0000-4000-8000-000000000003',
  1000,
  '10000000-0000-4000-8000-000000000004'
);

insert into public.site_visits(
  id, lead_id, property_id, status, requested_start_at, requested_end_at,
  created_by, updated_by
) values (
  '97000000-0000-4000-8000-000000000006',
  '97000000-0000-4000-8000-000000000004',
  '97000000-0000-4000-8000-000000000005',
  'REQUESTED',
  now() + interval '2 days',
  now() + interval '2 days 1 hour',
  '97000000-0000-4000-8000-000000000001',
  '97000000-0000-4000-8000-000000000001'
);

insert into public.lead_follow_ups(
  id, lead_id, site_visit_id, follow_up_type, due_at, completed_at,
  completed_by, created_by, outcome
) values
  (
    '97000000-0000-4000-8000-000000000007',
    '97000000-0000-4000-8000-000000000004',
    '97000000-0000-4000-8000-000000000006',
    'CALL',
    now() - interval '2 days',
    now() - interval '1 day',
    '97000000-0000-4000-8000-000000000001',
    '97000000-0000-4000-8000-000000000001',
    'Completed conversation'
  ),
  (
    '97000000-0000-4000-8000-000000000008',
    '97000000-0000-4000-8000-000000000004',
    null,
    'WHATSAPP',
    now() + interval '1 day',
    null,
    null,
    '97000000-0000-4000-8000-000000000001',
    null
  );

insert into public.site_visit_events(
  site_visit_id, lead_id, property_id, event_type, follow_up_id, actor_admin_id
) values (
  '97000000-0000-4000-8000-000000000006',
  '97000000-0000-4000-8000-000000000004',
  '97000000-0000-4000-8000-000000000005',
  'FOLLOW_UP_LINKED',
  '97000000-0000-4000-8000-000000000007',
  '97000000-0000-4000-8000-000000000001'
);

set local role service_role;
set local request.jwt.claims = '{"role":"service_role"}';

select throws_ok(
  $$select public.delete_completed_lead_follow_up(
    '97000000-0000-4000-8000-000000000002',
    '97000000-0000-4000-8000-000000000007'
  )$$,
  '42501',
  null,
  'a non-admin actor cannot delete a follow-up'
);
select throws_ok(
  $$select public.delete_completed_lead_follow_up(
    '97000000-0000-4000-8000-000000000001',
    '97000000-0000-4000-8000-000000000008'
  )$$,
  'COMPLETED_FOLLOW_UP_NOT_FOUND',
  'an open follow-up cannot be deleted by this operation'
);
select is(
  public.delete_completed_lead_follow_up(
    '97000000-0000-4000-8000-000000000001',
    '97000000-0000-4000-8000-000000000007'
  ),
  '97000000-0000-4000-8000-000000000004'::uuid,
  'deletion returns the unchanged parent lead id'
);
select is(
  (
    select count(*)::integer
    from public.lead_follow_ups
    where id = '97000000-0000-4000-8000-000000000007'
  ),
  0,
  'the selected completed follow-up is deleted'
);
select is(
  (
    select count(*)::integer
    from public.lead_follow_ups
    where id = '97000000-0000-4000-8000-000000000008'
  ),
  1,
  'other follow-ups remain'
);
select is(
  (
    select count(*)::integer
    from public.leads
    where id = '97000000-0000-4000-8000-000000000004'
  ),
  1,
  'the lead remains'
);
select ok(
  (
    select follow_up_id is null
    from public.site_visit_events
    where site_visit_id = '97000000-0000-4000-8000-000000000006'
      and event_type = 'FOLLOW_UP_LINKED'
  ),
  'linked site-visit history remains without a dangling follow-up reference'
);
select is(
  (
    select count(*)::integer
    from public.audit_logs
    where entity_id = '97000000-0000-4000-8000-000000000007'
      and entity_type = 'lead_follow_up'
      and action = 'DELETE'
  ),
  1,
  'completed follow-up deletion is audited'
);

select * from finish();
rollback;
