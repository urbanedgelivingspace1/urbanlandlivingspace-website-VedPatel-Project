begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select plan(33);

select cmp_ok(
  (select count(*)::integer from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relkind='r'),
  '>', 0, 'the application-table inventory is non-empty'
);
select is(
  (select count(*)::integer from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relkind='r' and c.relrowsecurity),
  (select count(*)::integer from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relkind='r'),
  'every current application table has RLS enabled without a hard-coded count'
);
select is(
  (select count(*)::integer from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relkind='r' and c.relforcerowsecurity),
  (select count(*)::integer from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relkind='r'),
  'every current application table forces RLS'
);
select is(
  (select count(distinct tablename)::integer from pg_policies
   where schemaname='public' and policyname='active_admin_select'),
  (select count(*)::integer from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relkind='r'),
  'every application table has the active-admin read policy'
);

select is(
  (select count(*)::integer from information_schema.role_table_grants g
   join pg_class c on c.relname=g.table_name
   join pg_namespace n on n.oid=c.relnamespace and n.nspname=g.table_schema
   where g.table_schema='public' and c.relkind='r' and g.grantee='anon'),
  0, 'anonymous has no direct application-table grant'
);
select is(
  (select count(*)::integer from information_schema.role_table_grants g
   join pg_class c on c.relname=g.table_name
   join pg_namespace n on n.oid=c.relnamespace and n.nspname=g.table_schema
   where g.table_schema='public' and c.relkind='r' and g.grantee='authenticated'
     and g.privilege_type <> 'SELECT'),
  0, 'authenticated browsers have no application-table mutation grant'
);
select is(
  (select count(*)::integer from information_schema.role_table_grants g
   join pg_class c on c.relname=g.table_name
   join pg_namespace n on n.oid=c.relnamespace and n.nspname=g.table_schema
   where g.table_schema='public' and c.relkind='v'
     and c.relname like 'public_%'
     and g.grantee in ('anon','authenticated') and g.privilege_type <> 'SELECT'),
  0, 'public projections grant browser roles SELECT only'
);
select ok(
  not has_table_privilege('anon','public.public_property_search','select'),
  'anonymous cannot bypass bounded search through the backing view'
);
select ok(
  has_function_privilege('anon',
    'public.search_public_properties(text,text,public.land_category,public.transaction_type,text,text,text,text,numeric,numeric,numeric,numeric,text,public.property_availability_status,text,text,text,text,text,text,text,integer,integer)',
    'execute'),
  'anonymous may execute only the bounded public search function'
);
select ok(
  not has_function_privilege('anon','public.is_active_admin()','execute'),
  'anonymous cannot invoke the admin predicate'
);
select ok(
  has_function_privilege('authenticated','public.is_active_admin()','execute'),
  'authenticated sessions may evaluate the RLS admin predicate'
);
select ok(
  not has_function_privilege('authenticated',
    'public.write_audit_log(public.audit_action,character varying,uuid,text[],jsonb,jsonb,text)',
    'execute'),
  'active-admin browsers cannot forge audit entries through the writer RPC'
);
select ok(
  not has_function_privilege('anon','public.get_storage_usage_bytes()','execute'),
  'anonymous cannot inspect aggregate private storage usage'
);
select ok(
  has_function_privilege('service_role','public.get_storage_usage_bytes()','execute'),
  'the server role can enforce the aggregate storage budget'
);
select is(
  (select count(*)::integer
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public'
     and has_function_privilege('anon',p.oid,'execute')
     and p.proname <> 'search_public_properties'),
  0, 'anonymous cannot execute any sensitive or utility public-schema function'
);
select is(
  (select count(*)::integer
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public'
     and has_function_privilege('authenticated',p.oid,'execute')
     and p.proname not in ('search_public_properties','is_active_admin')),
  0, 'authenticated non-admin browsers cannot execute service mutation RPCs'
);
select is(
  (select count(*)::integer
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.prosecdef
     and not ('search_path=""'=any(coalesce(p.proconfig,array[]::text[])))),
  0, 'every SECURITY DEFINER function has an empty search_path'
);
select is(
  (select count(*)::integer
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.prosecdef
     and p.prosrc ~* '\\mexecute\\M'),
  0, 'SECURITY DEFINER functions contain no dynamic SQL'
);
select is(
  (select count(*)::integer
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.prosecdef
     and pg_get_userbyid(p.proowner) not in ('postgres','urbanedge_public_projection')),
  0, 'SECURITY DEFINER ownership is limited to trusted non-browser roles'
);

select ok(not (select rolcanlogin from pg_roles where rolname='urbanedge_public_projection'),
  'public projection owner cannot log in');
select ok(not (select rolbypassrls from pg_roles where rolname='urbanedge_public_projection'),
  'public projection owner cannot bypass RLS');
select is(
  (select count(*)::integer from information_schema.role_table_grants
   where table_schema='public' and grantee='urbanedge_public_projection'
     and privilege_type <> 'SELECT'),
  0, 'projection owner has no base-table mutation grant'
);
select is(
  (select count(*)::integer from information_schema.columns
   where table_schema='public' and table_name like 'public_%'
     and column_name in (
       'phone','email','legal_name','notes_internal','private_latitude','private_longitude',
       'private_accuracy_m','location_notes','private_object_path','private_storage_bucket','scan_status',
       'assigned_to','reviewed_by','created_by','updated_by','actor_admin_id'
     )),
  0, 'public projection contracts contain no forbidden private column names'
);
select is(
  (select count(*)::integer from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relkind='v' and c.relname like 'public_%'
     and pg_get_userbyid(c.relowner) <> 'urbanedge_public_projection'),
  0, 'all public projections are owned by the constrained projection role'
);

select is((select count(*)::integer from storage.buckets),5,'exactly five architecture buckets exist');
select is((select count(*)::integer from storage.buckets where public),2,
  'only the two approved media buckets are public');
select is((select count(*)::integer from storage.buckets where not public),3,
  'all document and staging buckets are private');
select is(
  (select count(*)::integer from pg_policies where schemaname='storage' and tablename='objects'
   and cmd in ('INSERT','UPDATE','DELETE') and roles && array['anon','authenticated']::name[]),
  0, 'browser roles have no direct storage mutation policy'
);
select ok((select not public from storage.buckets where id='property-media-private'),
  'property staging media is private');
select ok((select not public from storage.buckets where id='verification-documents-private'),
  'verification documents are private');
select ok((select not public from storage.buckets where id='owner-submissions-private'),
  'owner submission documents are private');

select ok(
  not exists (
    select 1
    from pg_default_acl d
    join pg_roles owner_role on owner_role.oid=d.defaclrole
    join pg_namespace n on n.oid=d.defaclnamespace
    cross join lateral aclexplode(d.defaclacl) acl
    left join pg_roles grantee_role on grantee_role.oid=acl.grantee
    where owner_role.rolname='postgres' and n.nspname='public' and d.defaclobjtype='f'
      and acl.privilege_type='EXECUTE'
      and (acl.grantee=0 or grantee_role.rolname in ('anon','authenticated'))
  ),
  'future migration-role functions do not inherit PUBLIC browser execution'
);
select ok(
  not exists (
    select 1
    from pg_default_acl d
    join pg_roles owner_role on owner_role.oid=d.defaclrole
    join pg_namespace n on n.oid=d.defaclnamespace
    cross join lateral aclexplode(d.defaclacl) acl
    left join pg_roles grantee_role on grantee_role.oid=acl.grantee
    where owner_role.rolname='postgres' and n.nspname='public' and d.defaclobjtype='r'
      and (acl.grantee=0 or grantee_role.rolname in ('anon','authenticated'))
  ),
  'future migration-role views do not inherit anonymous table privileges'
);

select * from finish();
rollback;
