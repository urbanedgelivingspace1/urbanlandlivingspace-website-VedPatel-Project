-- M17: close inherited Supabase grants and force the application authorization boundary.

-- Supabase's project defaults grant newly-created public-schema objects to browser roles.
-- Migrations must opt public surfaces in explicitly instead of inheriting those defaults.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public;
-- Every current application table is RLS-protected. FORCE removes the table-owner
-- exception as an additional guard; the service_role continues through BYPASSRLS.
do $$
declare
  application_table record;
begin
  for application_table in
    select c.relname
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
  loop
    execute format(
      'alter table public.%I enable row level security',
      application_table.relname
    );
    execute format(
      'alter table public.%I force row level security',
      application_table.relname
    );
  end loop;
end;
$$;

-- Reset every public projection ACL. Some views inherited ALL from Supabase's
-- default privileges before their owner was changed to the projection role.
-- The migration role is intentionally not a permanent member of that locked,
-- non-login owner role, so assume it only for the owner-issued ACL rewrite.
do $$
declare
  grantor_role text;
begin
  select r.rolname into grantor_role
  from pg_auth_members m
  join pg_roles r on r.oid = m.member
  where m.roleid = 'urbanedge_public_projection'::regrole
    and m.admin_option = true
    and (r.rolname = current_user or pg_has_role(current_user, r.oid, 'MEMBER'))
  order by (r.rolname = current_user) desc
  limit 1;

  if grantor_role is null then
    grantor_role := current_user;
  end if;

  execute format(
    'grant urbanedge_public_projection to %I with inherit false, set true granted by %I',
    current_user, grantor_role
  );
end;
$$;
set role urbanedge_public_projection;
do $$
declare
  public_view record;
begin
  for public_view in
    select c.relname
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'v' and c.relname like 'public_%'
  loop
    execute format(
      'revoke all on table public.%I from public, anon, authenticated',
      public_view.relname
    );
  end loop;
end;
$$;

grant select on
  public.public_app_settings,
  public.public_area_units,
  public.public_geography_options,
  public.public_guide_categories,
  public.public_guides,
  public.public_property_details,
  public.public_property_indexability,
  public.public_property_listings,
  public.public_property_media,
  public.public_property_parcel_identifiers,
  public.public_property_search_filter_options,
  public.public_property_verification_summaries,
  public.public_seo_pages,
  public.public_seo_redirects
to anon, authenticated;

-- public_property_search stays behind its bounded RPC; it is intentionally not
-- granted directly because the function owns pagination and query limits.
revoke all on table public.public_property_search from public, anon, authenticated;
reset role;
do $$
declare
  grantor_role text;
begin
  select g.rolname into grantor_role
  from pg_auth_members m
  join pg_roles r on r.oid = m.roleid
  join pg_roles u on u.oid = m.member
  join pg_roles g on g.oid = m.grantor
  where r.rolname = 'urbanedge_public_projection'
    and u.rolname = current_user
    and m.set_option = true
  limit 1;

  if grantor_role is not null then
    execute format(
      'revoke urbanedge_public_projection from %I granted by %I',
      current_user, grantor_role
    );
  end if;
end;
$$;

-- Remove the default PUBLIC execute privilege from every function. Only the
-- bounded public search RPC and active-admin predicate are browser-callable.
do $$
declare
  routine record;
begin
  for routine in
    select p.oid::regprocedure as signature
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format(
      'revoke all on function %s from public, anon, authenticated',
      routine.signature
    );
    execute format('grant execute on function %s to service_role', routine.signature);
  end loop;
end;
$$;

grant execute on function public.is_active_admin() to authenticated;

-- The bounded search function is owned by the same locked projection role.
do $$
declare
  grantor_role text;
begin
  select r.rolname into grantor_role
  from pg_auth_members m
  join pg_roles r on r.oid = m.member
  where m.roleid = 'urbanedge_public_projection'::regrole
    and m.admin_option = true
    and (r.rolname = current_user or pg_has_role(current_user, r.oid, 'MEMBER'))
  order by (r.rolname = current_user) desc
  limit 1;

  if grantor_role is null then
    grantor_role := current_user;
  end if;

  execute format(
    'grant urbanedge_public_projection to %I with inherit false, set true granted by %I',
    current_user, grantor_role
  );
end;
$$;
set role urbanedge_public_projection;
revoke all on function public.search_public_properties(
  text, text, public.land_category, public.transaction_type, text, text, text, text,
  numeric, numeric, numeric, numeric, text, public.property_availability_status,
  text, text, text, text, text, text, text, integer, integer
) from public, anon, authenticated;
grant execute on function public.search_public_properties(
  text, text, public.land_category, public.transaction_type, text, text, text, text,
  numeric, numeric, numeric, numeric, text, public.property_availability_status,
  text, text, text, text, text, text, text, integer, integer
) to anon, authenticated, service_role;
reset role;
do $$
declare
  grantor_role text;
begin
  select g.rolname into grantor_role
  from pg_auth_members m
  join pg_roles r on r.oid = m.roleid
  join pg_roles u on u.oid = m.member
  join pg_roles g on g.oid = m.grantor
  where r.rolname = 'urbanedge_public_projection'
    and u.rolname = current_user
    and m.set_option = true
  limit 1;

  if grantor_role is not null then
    execute format(
      'revoke urbanedge_public_projection from %I granted by %I',
      current_user, grantor_role
    );
  end if;
end;
$$;

-- These M16 functions already schema-qualify their data access. Empty search_path
-- aligns them with every other SECURITY DEFINER routine and removes temp/public
-- name shadowing from their execution environment.
alter function public.record_seo_redirect(uuid,text,text,text,uuid)
  set search_path = '';
alter function public.migrate_published_guide_slug(uuid,uuid,text)
  set search_path = '';

-- Avoid transferring an ever-growing set of media/document rows to the app just
-- to enforce the storage budget. The aggregate is service-only and exposes no
-- object metadata.
create or replace function public.get_storage_usage_bytes()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce((select sum(file_size_bytes) from public.media_assets where storage_bucket is not null), 0)
    + coalesce((select sum(file_size_bytes) from public.private_documents), 0);
$$;

revoke all on function public.get_storage_usage_bytes() from public, anon, authenticated;
grant execute on function public.get_storage_usage_bytes() to service_role;
