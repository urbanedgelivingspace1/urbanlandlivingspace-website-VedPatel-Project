-- M16: controlled editorial publication, public-safe guide media and persistent redirects.

create table public.seo_redirects (
  id uuid primary key default gen_random_uuid(),
  source_path varchar(500) not null,
  destination_path varchar(500) not null,
  status_code smallint not null default 308,
  entity_type varchar(30) not null,
  entity_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.admin_profiles(user_id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_profiles(user_id) on delete restrict,
  check (source_path ~ '^/[a-z0-9][a-z0-9/-]*$'),
  check (destination_path ~ '^/[a-z0-9][a-z0-9/-]*$'),
  check (source_path !~ '//|[?#]' and destination_path !~ '//|[?#]'),
  check (source_path <> destination_path),
  check (status_code in (301, 308)),
  check (entity_type in ('PROPERTY', 'GUIDE', 'SEO_PAGE', 'ROUTE'))
);
create unique index seo_redirects_source_uidx on public.seo_redirects(lower(source_path));
create index seo_redirects_entity_idx on public.seo_redirects(entity_type, entity_id)
  where is_active;

alter table public.guides
  add column hero_storage_bucket varchar(100),
  add column hero_object_path text,
  add column hero_alt_text varchar(300),
  add column hero_width_px integer,
  add column hero_height_px integer,
  add constraint guides_slug_format_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  add constraint guides_canonical_check check (
    canonical_url is null or canonical_url = '/guides/' || slug
  ),
  add constraint guides_hero_complete_check check (
    (hero_storage_bucket is null and hero_object_path is null and hero_alt_text is null
      and hero_width_px is null and hero_height_px is null)
    or
    (hero_storage_bucket = 'guide-media-public'
      and hero_object_path ~ '^[a-zA-Z0-9][a-zA-Z0-9/_-]*\\.webp$'
      and length(trim(hero_alt_text)) between 5 and 300
      and hero_width_px > 0 and hero_height_px > 0)
  );

alter table public.seo_pages
  add constraint seo_pages_route_check check (
    slug in (
      'locations/ahmedabad',
      'locations/gandhinagar',
      'locations/ahmedabad/agricultural-land',
      'locations/ahmedabad/na-land',
      'locations/ahmedabad/industrial-land',
      'locations/gandhinagar/agricultural-land',
      'locations/gandhinagar/na-land',
      'locations/gandhinagar/industrial-land'
    )
  ),
  add constraint seo_pages_canonical_check check (
    canonical_url is null or canonical_url = '/' || slug
  );

drop policy projection_published_seo_pages on public.seo_pages;
create policy projection_public_seo_pages on public.seo_pages
  for select to urbanedge_public_projection
  using (
    status in ('PUBLISHED', 'NOINDEX')
    and published_at is not null
    and archived_at is null
  );

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
grant create on schema public to urbanedge_public_projection;
set role urbanedge_public_projection;
create or replace view public.public_seo_pages as
select
  id, page_type, slug, district_id, locality_id, land_category, transaction_type,
  title, intro_text, body_markdown, seo_title, seo_description, canonical_url, published_at,
  status
from public.seo_pages
where status in ('PUBLISHED', 'NOINDEX') and published_at is not null and archived_at is null;
alter view public.public_seo_pages set (security_invoker = false);
alter view public.public_seo_pages owner to urbanedge_public_projection;
grant select on public.public_seo_pages to anon, authenticated;
set role postgres;
revoke create on schema public from urbanedge_public_projection;
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

alter table public.seo_redirects enable row level security;
alter table public.seo_redirects force row level security;
revoke all on public.seo_redirects from public, anon, authenticated;
grant all on public.seo_redirects to service_role;
grant select on public.seo_redirects to authenticated;

create policy active_admin_select on public.seo_redirects
  for select to authenticated using (public.is_active_admin());

grant select on public.seo_redirects to urbanedge_public_projection;
create policy projection_active_seo_redirects on public.seo_redirects
  for select to urbanedge_public_projection using (is_active);

create view public.public_seo_redirects as
select source_path, destination_path, status_code
from public.seo_redirects
where is_active;
alter view public.public_seo_redirects set (security_invoker = false);
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
grant create on schema public to urbanedge_public_projection;
alter view public.public_seo_redirects owner to urbanedge_public_projection;
set role urbanedge_public_projection;
grant select on public.public_seo_redirects to anon, authenticated;

create or replace view public.public_guides as
select
  guide.id, guide.title, guide.slug, guide.excerpt, guide.body_markdown,
  guide.category_id, category.name as category_name, category.slug as category_slug,
  guide.published_at, guide.seo_title, guide.seo_description, guide.canonical_url,
  guide.updated_at, guide.hero_storage_bucket, guide.hero_object_path,
  guide.hero_alt_text, guide.hero_width_px, guide.hero_height_px
from public.guides guide
left join public.guide_categories category on category.id = guide.category_id and category.is_active
where guide.status = 'PUBLISHED' and guide.published_at is not null and guide.archived_at is null;
alter view public.public_guides set (security_invoker = false);
alter view public.public_guides owner to urbanedge_public_projection;
grant select on public.public_guides to anon, authenticated;
set role postgres;
revoke create on schema public from urbanedge_public_projection;
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

create or replace function public.record_seo_redirect(
  requested_actor_id uuid,
  requested_source_path text,
  requested_destination_path text,
  requested_entity_type text,
  requested_entity_id uuid default null
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare redirect_id uuid;
begin
  if not exists (
    select 1 from public.admin_profiles where user_id = requested_actor_id and is_active
  ) then
    raise insufficient_privilege using message = 'Active admin actor required';
  end if;
  if requested_source_path = requested_destination_path then
    raise exception 'Redirect source and destination must differ' using errcode = '22023';
  end if;

  update public.seo_redirects
  set destination_path = requested_destination_path,
      updated_at = now(), updated_by = requested_actor_id
  where is_active
    and destination_path = requested_source_path;

  insert into public.seo_redirects
    (source_path, destination_path, status_code, entity_type, entity_id, created_by, updated_by)
  values
    (requested_source_path, requested_destination_path, 308, requested_entity_type, requested_entity_id,
     requested_actor_id, requested_actor_id)
  on conflict (lower(source_path)) do update
    set destination_path = excluded.destination_path, status_code = 308, is_active = true,
        entity_type = excluded.entity_type, entity_id = excluded.entity_id,
        updated_at = now(), updated_by = excluded.updated_by
  returning id into redirect_id;

  insert into public.audit_logs
    (actor_admin_id, action, entity_type, entity_id, changed_fields, after_state, reason)
  values
    (requested_actor_id, 'UPDATE', 'seo_redirect', redirect_id,
     array['source_path','destination_path'],
     jsonb_build_object('source_path', requested_source_path, 'destination_path', requested_destination_path),
     'Permanent canonical redirect recorded');
  return redirect_id;
end;
$$;
revoke all on function public.record_seo_redirect(uuid,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.record_seo_redirect(uuid,text,text,text,uuid) to service_role;

create or replace function public.migrate_published_guide_slug(
  requested_actor_id uuid,
  requested_guide_id uuid,
  requested_new_slug text
) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  current_slug text;
  first_published_at timestamptz;
begin
  if not exists (
    select 1 from public.admin_profiles where user_id = requested_actor_id and is_active
  ) then
    raise insufficient_privilege using message = 'Active admin actor required';
  end if;
  if requested_new_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Invalid guide slug' using errcode = '22023';
  end if;

  select slug, published_at into current_slug, first_published_at
  from public.guides
  where id = requested_guide_id and archived_at is null
  for update;
  if current_slug is null then
    raise no_data_found using message = 'Guide not found';
  end if;
  if first_published_at is null then
    raise exception 'Only previously published guides require route migration' using errcode = '22023';
  end if;
  if current_slug = requested_new_slug then return; end if;

  update public.guides
  set slug = requested_new_slug,
      canonical_url = '/guides/' || requested_new_slug,
      updated_at = now(),
      updated_by = requested_actor_id
  where id = requested_guide_id;

  perform public.record_seo_redirect(
    requested_actor_id,
    '/guides/' || current_slug,
    '/guides/' || requested_new_slug,
    'GUIDE',
    requested_guide_id
  );

  insert into public.audit_logs
    (actor_admin_id, action, entity_type, entity_id, changed_fields, after_state, reason)
  values
    (requested_actor_id, 'UPDATE', 'guide', requested_guide_id,
     array['slug','canonical_url'],
     jsonb_build_object('slug', requested_new_slug, 'canonical_url', '/guides/' || requested_new_slug),
     'Published guide route migrated with permanent redirect');
end;
$$;
revoke all on function public.migrate_published_guide_slug(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.migrate_published_guide_slug(uuid,uuid,text) to service_role;

insert into public.guide_categories (id, name, slug, description, sort_order)
values
  ('16000000-0000-4000-8000-000000000001', 'Land Buying', 'land-buying', 'Practical preparation for land discovery and due diligence.', 10),
  ('16000000-0000-4000-8000-000000000002', 'Ahmedabad & Gandhinagar', 'ahmedabad-gandhinagar', 'Local land-search context for UrbanEdge''s V1 service area.', 20),
  ('16000000-0000-4000-8000-000000000003', 'Transactions', 'transactions', 'Plain-language guidance for buying, renting and leasing land.', 30)
on conflict (lower(slug)) do nothing;

insert into public.guides
  (id, title, slug, excerpt, body_markdown, category_id, status, reviewed_at, published_at,
   seo_title, seo_description, canonical_url)
values (
  '16000000-0000-4000-8000-000000000010',
  'A practical checklist before you enquire about land',
  'practical-checklist-before-enquiring-about-land',
  'A concise framework for comparing a land listing, preparing questions and planning professional checks.',
  '## Start with the intended use\n\nWrite down what the land needs to support before comparing listings: agricultural use, a permitted non-agricultural purpose, industrial operations, storage, access or a longer-term brief. A category label is a starting point, not proof that every intended activity is permitted.\n\n## Compare the public facts\n\nCheck the displayed area and unit, transaction type, public location, access context, price mode and current availability. Price on Request means a numeric public price has not been published; it does not mean the land is free or that an internal asking price should be inferred.\n\n## Prepare property-specific questions\n\nAsk which records support the statements shown, which details still need confirmation, and whether the location is exact, approximate or intentionally hidden. Keep the UrbanEdge Property ID with your enquiry so the team can discuss the correct listing.\n\n## Plan independent checks\n\nBefore committing, use appropriate legal, revenue, planning, measurement, tax and technical professionals for the actual property and transaction. Online information and a site visit help discovery, but neither replaces property-specific due diligence.\n\n## Use a site visit well\n\nObserve access, boundaries, surrounding use, utilities and physical conditions. Record questions instead of treating a visual impression as documentary confirmation. UrbanEdge can help coordinate a visit, but the visit remains a manually confirmed appointment.\n\n## Choose the next step\n\nExplore current published land, share a structured requirement when no listing fits, or contact UrbanEdge with a Property ID. The team can help clarify the public information and coordinate the next conversation without promising legal clearance, development approval or investment returns.',
  '16000000-0000-4000-8000-000000000001', 'PUBLISHED', now(), now(),
  'Land Enquiry Checklist | UrbanEdge Land Space',
  'Compare land purpose, area, location, access and public records before enquiring, visiting or beginning professional due diligence.',
  '/guides/practical-checklist-before-enquiring-about-land'
)
on conflict (lower(slug)) where archived_at is null do nothing;

insert into public.seo_pages
  (id, page_type, slug, district_id, land_category, title, intro_text, body_markdown, status,
   seo_title, seo_description, canonical_url, published_at)
values
  ('16000000-0000-4000-8000-000000000101', 'DISTRICT', 'locations/ahmedabad', null, null,
   'Land in Ahmedabad',
   'Explore curated Agricultural, NA and Industrial land across Ahmedabad district with public-safe location, area and transaction context.',
   '## A district-wide starting point\n\nAhmedabad district includes varied urban, peri-urban, agricultural and industrial settings. A useful search begins with intended use, suitable access, an understandable area unit and the public planning or category context available for each property. UrbanEdge presents only published inventory and keeps private owner information and restricted parcel detail outside public pages.\n\n## Compare land categories deliberately\n\nAgricultural, NA and Industrial labels describe different recorded contexts and should not be treated as interchangeable. A category page explains the public fields UrbanEdge can present, while the property page remains the source for that listing''s approved facts.\n\n## Search with realistic requirements\n\nUse the property search to refine category, transaction, area and broad location. When current inventory does not fit, share a buyer requirement rather than assuming that an unlisted or draft property is available.\n\n## Brokerage support\n\nUrbanEdge helps people discover published land, understand the public listing context, enquire with a stable Property ID and coordinate a manually confirmed site visit. Property-specific legal, revenue, planning, measurement and transaction decisions remain matters for appropriate professional review.',
   'NOINDEX', 'Land in Ahmedabad | Agricultural, NA & Industrial | UrbanEdge',
   'Explore curated Agricultural, NA and Industrial land in Ahmedabad with useful public context and human brokerage support.',
   '/locations/ahmedabad', now()),
  ('16000000-0000-4000-8000-000000000102', 'DISTRICT', 'locations/gandhinagar', null, null,
   'Land in Gandhinagar',
   'Explore curated Agricultural, NA and Industrial land across Gandhinagar district with public-safe location, area and transaction context.',
   '## A district-wide starting point\n\nGandhinagar district includes administrative, residential-edge, agricultural and industrial settings with different access and land-use questions. Begin with the intended use, transaction, area and the public category information available for the individual property. UrbanEdge shows only deliberately published inventory.\n\n## Category and location context\n\nAgricultural, NA and Industrial land require different questions. The category label alone does not guarantee buyer eligibility, a construction permission, an industrial approval or any future development outcome. Review the relevant public facts and seek property-specific professional advice.\n\n## Current inventory and requirements\n\nUse the search tools to compare available published land. Inventory changes as brokerage opportunities open and close; a useful district page can still help explain the search process without inventing listings or market statistics. Share a structured requirement if the visible selection is limited.\n\n## How UrbanEdge helps\n\nUrbanEdge supports discovery, clarification, enquiries and manually coordinated visits. Scoped review signals describe only the checks actually completed and never replace independent legal, revenue, planning, measurement or technical due diligence.',
   'NOINDEX', 'Land in Gandhinagar | Agricultural, NA & Industrial | UrbanEdge',
   'Explore curated Agricultural, NA and Industrial land in Gandhinagar with useful public context and human brokerage support.',
   '/locations/gandhinagar', now()),
  ('16000000-0000-4000-8000-000000000111', 'DISTRICT_CATEGORY', 'locations/ahmedabad/agricultural-land', null, 'AGRICULTURAL',
   'Agricultural Land in Ahmedabad', 'Compare published agricultural land in Ahmedabad using area, access, water and current-use context.',
   '## Search by practical fit\n\nAgricultural land searches should compare the recorded area and unit, public village or taluka context, road access, irrigation information and current use where those facts are approved for display. Buyer eligibility and permitted activity depend on the specific circumstances and should be checked professionally.\n\n## Current published selection\n\nThe inventory below comes only from UrbanEdge''s published-property boundary. If no matching property is available, share a requirement so the brokerage team can understand the location, scale and transaction you need.\n\n## Before proceeding\n\nUse online details for discovery, then plan property-specific legal, revenue, measurement and agricultural checks. No category page can guarantee title, eligibility, access rights or future conversion.',
   'NOINDEX', 'Agricultural Land in Ahmedabad | UrbanEdge Land Space',
   'Explore published agricultural land in Ahmedabad and compare area, access, water and public location context.',
   '/locations/ahmedabad/agricultural-land', now()),
  ('16000000-0000-4000-8000-000000000112', 'DISTRICT_CATEGORY', 'locations/ahmedabad/na-land', null, 'NA',
   'NA Land in Ahmedabad', 'Compare published NA land in Ahmedabad with carefully scoped status, purpose, access and planning context.',
   '## Understand the recorded context\n\nNA describes a recorded land-use context; it is not a blanket promise that every construction or development proposal is permitted. Compare the stated NA purpose, road access, planning references and utilities where supported by approved public information.\n\n## Current published selection\n\nOnly published UrbanEdge listings appear below. A sparse result does not create placeholder inventory and does not cause draft or owner-submitted land to become public. Share a requirement when the current selection does not fit.\n\n## Before proceeding\n\nConfirm the documents, applicable plan, permissions, measurements, access and proposed use for the specific land with appropriate professionals and authorities.',
   'NOINDEX', 'NA Land in Ahmedabad | UrbanEdge Land Space',
   'Explore published NA land in Ahmedabad with scoped purpose, planning, access and utility context.',
   '/locations/ahmedabad/na-land', now()),
  ('16000000-0000-4000-8000-000000000113', 'DISTRICT_CATEGORY', 'locations/ahmedabad/industrial-land', null, 'INDUSTRIAL',
   'Industrial Land in Ahmedabad', 'Compare published industrial land in Ahmedabad using authority, access, utility and operating context.',
   '## Match land to operations\n\nIndustrial land discovery should consider the recorded context, permitted use, truck access, road width, power, water, drainage and the distinction between authority-controlled estates and private industrial land. Public fields appear only when supported for the listing.\n\n## Current published selection\n\nThe listings below are the current published selection, not a claim about the whole market. When no property fits, share the operating requirement, preferred area and broad location with UrbanEdge.\n\n## Before proceeding\n\nConfirm tenure, transfer conditions, permitted use, infrastructure, environmental requirements, measurements and transaction documents for the specific property. UrbanEdge does not promise authority approval or operational suitability.',
   'NOINDEX', 'Industrial Land in Ahmedabad | UrbanEdge Land Space',
   'Explore published industrial land in Ahmedabad with public authority, access, utility and operating context.',
   '/locations/ahmedabad/industrial-land', now()),
  ('16000000-0000-4000-8000-000000000121', 'DISTRICT_CATEGORY', 'locations/gandhinagar/agricultural-land', null, 'AGRICULTURAL',
   'Agricultural Land in Gandhinagar', 'Compare published agricultural land in Gandhinagar using area, access, water and current-use context.',
   '## Search by practical fit\n\nCompare declared area and units, public village or taluka context, road access, irrigation and current agricultural use where approved for display. Agricultural eligibility and transaction requirements vary and need property-specific professional confirmation.\n\n## Current published selection\n\nOnly public published inventory is listed. UrbanEdge does not fill a thin result with private submissions, draft inventory or fabricated alternatives. Share a requirement for a more specific search.\n\n## Before proceeding\n\nPlan legal, revenue, measurement and use checks for the actual parcel. A public listing and site visit support discovery but do not guarantee title, eligibility or a future land-use change.',
   'NOINDEX', 'Agricultural Land in Gandhinagar | UrbanEdge Land Space',
   'Explore published agricultural land in Gandhinagar and compare area, access, water and public location context.',
   '/locations/gandhinagar/agricultural-land', now()),
  ('16000000-0000-4000-8000-000000000122', 'DISTRICT_CATEGORY', 'locations/gandhinagar/na-land', null, 'NA',
   'NA Land in Gandhinagar', 'Compare published NA land in Gandhinagar with carefully scoped status, purpose, access and planning context.',
   '## Understand the recorded context\n\nNA status should be read with its recorded purpose and the applicable planning, permission, access and utility context. It does not guarantee that any proposed construction or development can proceed.\n\n## Current published selection\n\nThe inventory below is limited to approved published listings. If none currently fits, share a structured buyer requirement rather than relying on a generic or private listing.\n\n## Before proceeding\n\nConfirm the relevant order, permitted purpose, plans, measurements, access and transaction documents for the specific property with appropriate professionals and authorities.',
   'NOINDEX', 'NA Land in Gandhinagar | UrbanEdge Land Space',
   'Explore published NA land in Gandhinagar with scoped purpose, planning, access and utility context.',
   '/locations/gandhinagar/na-land', now()),
  ('16000000-0000-4000-8000-000000000123', 'DISTRICT_CATEGORY', 'locations/gandhinagar/industrial-land', null, 'INDUSTRIAL',
   'Industrial Land in Gandhinagar', 'Compare published industrial land in Gandhinagar using authority, access, utility and operating context.',
   '## Match the operating brief\n\nIndustrial land should be compared through permitted use, tenure, authority or private context, truck access, roads, power, water and drainage. Each listing presents only the public facts approved for that property.\n\n## Current published selection\n\nOnly active published UrbanEdge inventory appears below. If the selection is empty or unsuitable, describe the operation, area, infrastructure and broad location required so the brokerage team can follow up.\n\n## Before proceeding\n\nConfirm transfer conditions, use, infrastructure, environmental requirements, measurements and transaction documentation for the actual property. No page promises authority approval or operating suitability.',
   'NOINDEX', 'Industrial Land in Gandhinagar | UrbanEdge Land Space',
   'Explore published industrial land in Gandhinagar with public authority, access, utility and operating context.',
   '/locations/gandhinagar/industrial-land', now())
on conflict (lower(slug)) where archived_at is null do nothing;
