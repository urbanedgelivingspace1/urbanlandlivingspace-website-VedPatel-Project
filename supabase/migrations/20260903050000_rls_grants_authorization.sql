create function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
  );
$$;

revoke all on function public.is_active_admin() from public, anon;
grant execute on function public.is_active_admin() to authenticated, service_role;

create function public.write_audit_log(
  requested_action public.audit_action,
  requested_entity_type varchar,
  requested_entity_id uuid default null,
  requested_changed_fields text[] default null,
  requested_before_state jsonb default null,
  requested_after_state jsonb default null,
  requested_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  audit_id uuid;
  actor_id uuid := auth.uid();
  jwt_role text := coalesce(auth.jwt() ->> 'role', '');
begin
  if not public.is_active_admin() and jwt_role <> 'service_role' then
    raise insufficient_privilege using message = 'Active admin or service role required';
  end if;

  insert into public.audit_logs (
    actor_admin_id, action, entity_type, entity_id, changed_fields,
    before_state, after_state, reason
  ) values (
    case when public.is_active_admin() then actor_id else null end,
    requested_action, requested_entity_type, requested_entity_id,
    requested_changed_fields, requested_before_state, requested_after_state,
    requested_reason
  ) returning id into audit_id;

  return audit_id;
end;
$$;

revoke all on function public.write_audit_log(
  public.audit_action, varchar, uuid, text[], jsonb, jsonb, text
) from public, anon;
grant execute on function public.write_audit_log(
  public.audit_action, varchar, uuid, text[], jsonb, jsonb, text
) to authenticated, service_role;

do $$
declare application_table text;
begin
  foreach application_table in array array[
    'admin_profiles','source_references','countries','states','districts','subdistricts','places','localities',
    'geography_aliases','area_units','area_conversion_rules','planning_authorities','development_plan_zones',
    'tp_schemes','tp_plots','gidc_estates','properties','property_offers','property_parcels','parcel_identifiers',
    'property_locations','property_planning_context','property_agricultural','property_na','property_industrial',
    'property_attribute_definitions','property_attribute_options','property_attribute_values','parties','property_parties',
    'property_source_links','media_assets','owner_submissions','private_documents','verification_check_definitions',
    'property_verifications','verification_evidence','owner_submission_documents','leads','lead_requirements',
    'lead_properties','lead_activities','site_visits','guide_categories','guides','seo_pages','app_settings',
    'analytics_events','audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security', application_table);
    execute format(
      'create policy active_admin_select on public.%I for select to authenticated using ((select public.is_active_admin()))',
      application_table
    );
  end loop;
end;
$$;

-- The browser-authenticated role is read-only. All business writes use server-owned,
-- re-authorized services and the privileged client; generic client state mutation is impossible.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'urbanedge_public_projection') then
    create role urbanedge_public_projection nologin noinherit nobypassrls;
  end if;
end;
$$;

do $$
begin
  execute format('grant urbanedge_public_projection to %I', current_user);
end;
$$;

grant usage on schema public to urbanedge_public_projection;
grant create on schema public to urbanedge_public_projection;
grant select on public.properties, public.districts, public.subdistricts, public.places,
  public.localities, public.area_units, public.property_locations, public.property_offers,
  public.media_assets, public.property_verifications, public.verification_check_definitions,
  public.app_settings, public.guide_categories, public.guides, public.seo_pages
to urbanedge_public_projection;

create policy projection_published_properties on public.properties
  for select to urbanedge_public_projection
  using (publication_status = 'PUBLISHED' and archived_at is null and deleted_at is null);
create policy projection_service_districts on public.districts
  for select to urbanedge_public_projection using (is_active and is_service_area);
create policy projection_active_subdistricts on public.subdistricts
  for select to urbanedge_public_projection using (is_active);
create policy projection_active_places on public.places
  for select to urbanedge_public_projection using (is_active);
create policy projection_active_localities on public.localities
  for select to urbanedge_public_projection using (is_active);
create policy projection_public_area_units on public.area_units
  for select to urbanedge_public_projection using (is_public_v1);
create policy projection_property_locations on public.property_locations
  for select to urbanedge_public_projection
  using (exists (
    select 1 from public.properties property
    where property.id = property_locations.property_id
      and property.publication_status = 'PUBLISHED'
      and property.archived_at is null
      and property.deleted_at is null
  ));
create policy projection_property_offers on public.property_offers
  for select to urbanedge_public_projection
  using (archived_at is null and exists (
    select 1 from public.properties property
    where property.id = property_offers.property_id
      and property.publication_status = 'PUBLISHED'
      and property.archived_at is null
      and property.deleted_at is null
  ));
create policy projection_public_media on public.media_assets
  for select to urbanedge_public_projection
  using (visibility = 'PUBLIC' and archived_at is null and exists (
    select 1 from public.properties property
    where property.id = media_assets.property_id
      and property.publication_status = 'PUBLISHED'
      and property.archived_at is null
      and property.deleted_at is null
  ));
create policy projection_public_verifications on public.property_verifications
  for select to urbanedge_public_projection
  using (
    public_visible
    and status in ('PASSED', 'PASSED_WITH_NOTE')
    and (recheck_at is null or recheck_at > now())
    and exists (
      select 1 from public.properties property
      where property.id = property_verifications.property_id
        and property.publication_status = 'PUBLISHED'
        and property.archived_at is null
        and property.deleted_at is null
    )
  );
create policy projection_verification_definitions on public.verification_check_definitions
  for select to urbanedge_public_projection using (is_active);
create policy projection_public_settings on public.app_settings
  for select to urbanedge_public_projection using (is_public and not is_secret_reference);
create policy projection_guide_categories on public.guide_categories
  for select to urbanedge_public_projection using (is_active);
create policy projection_published_guides on public.guides
  for select to urbanedge_public_projection
  using (status = 'PUBLISHED' and published_at is not null and archived_at is null);
create policy projection_published_seo_pages on public.seo_pages
  for select to urbanedge_public_projection
  using (status = 'PUBLISHED' and published_at is not null and archived_at is null);

create view public.public_guide_categories as
select id, name, slug, description, sort_order
from public.guide_categories
where is_active;

create view public.public_guides as
select
  guide.id, guide.title, guide.slug, guide.excerpt, guide.body_markdown,
  guide.category_id, category.name as category_name, category.slug as category_slug,
  guide.published_at, guide.seo_title, guide.seo_description, guide.canonical_url
from public.guides guide
left join public.guide_categories category on category.id = guide.category_id and category.is_active
where guide.status = 'PUBLISHED' and guide.published_at is not null and guide.archived_at is null;

create view public.public_seo_pages as
select
  id, page_type, slug, district_id, locality_id, land_category, transaction_type,
  title, intro_text, body_markdown, seo_title, seo_description, canonical_url, published_at
from public.seo_pages
where status = 'PUBLISHED' and published_at is not null and archived_at is null;

alter view public.public_property_listings set (security_invoker = false);
alter view public.public_property_details set (security_invoker = false);
alter view public.public_property_media set (security_invoker = false);
alter view public.public_property_verification_summaries set (security_invoker = false);
alter view public.public_geography_options set (security_invoker = false);
alter view public.public_area_units set (security_invoker = false);
alter view public.public_app_settings set (security_invoker = false);

alter view public.public_property_listings owner to urbanedge_public_projection;
alter view public.public_property_details owner to urbanedge_public_projection;
alter view public.public_property_media owner to urbanedge_public_projection;
alter view public.public_property_verification_summaries owner to urbanedge_public_projection;
alter view public.public_geography_options owner to urbanedge_public_projection;
alter view public.public_area_units owner to urbanedge_public_projection;
alter view public.public_app_settings owner to urbanedge_public_projection;
alter view public.public_guide_categories owner to urbanedge_public_projection;
alter view public.public_guides owner to urbanedge_public_projection;
alter view public.public_seo_pages owner to urbanedge_public_projection;

revoke create on schema public from urbanedge_public_projection;

grant select on public.public_property_listings, public.public_property_details,
  public.public_property_media, public.public_property_verification_summaries,
  public.public_geography_options, public.public_area_units, public.public_app_settings,
  public.public_guide_categories, public.public_guides, public.public_seo_pages
to anon, authenticated;

do $$
begin
  execute format('revoke urbanedge_public_projection from %I', current_user);
end;
$$;

revoke insert, update, delete, truncate, references, trigger
on public.audit_logs from anon, authenticated;

comment on role urbanedge_public_projection is
  'NOLOGIN/NOBYPASSRLS owner for whitelisted public views; constrained by projection-specific RLS policies.';
