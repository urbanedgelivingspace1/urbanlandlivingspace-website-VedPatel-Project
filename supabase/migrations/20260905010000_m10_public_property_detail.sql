-- M10: extend the frozen public detail contract with explicitly allow-listed land facts.
-- The browser still receives no base-table access; these projections are owned by the
-- constrained public projection role and remain publication-gated by RLS.

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

grant select on public.property_agricultural, public.property_na, public.property_industrial,
  public.property_planning_context, public.planning_authorities, public.development_plan_zones,
  public.tp_schemes, public.tp_plots, public.gidc_estates, public.property_parcels,
  public.parcel_identifiers
to urbanedge_public_projection;

create policy projection_published_agricultural on public.property_agricultural
  for select to urbanedge_public_projection using (exists (
    select 1 from public.properties property
    where property.id = property_agricultural.property_id
      and property.publication_status = 'PUBLISHED'
      and property.archived_at is null and property.deleted_at is null
  ));
create policy projection_published_na on public.property_na
  for select to urbanedge_public_projection using (exists (
    select 1 from public.properties property
    where property.id = property_na.property_id
      and property.publication_status = 'PUBLISHED'
      and property.archived_at is null and property.deleted_at is null
  ));
create policy projection_published_industrial on public.property_industrial
  for select to urbanedge_public_projection using (exists (
    select 1 from public.properties property
    where property.id = property_industrial.property_id
      and property.publication_status = 'PUBLISHED'
      and property.archived_at is null and property.deleted_at is null
  ));
create policy projection_published_planning_context on public.property_planning_context
  for select to urbanedge_public_projection using (archived_at is null and exists (
    select 1 from public.properties property
    where property.id = property_planning_context.property_id
      and property.publication_status = 'PUBLISHED'
      and property.archived_at is null and property.deleted_at is null
  ));
create policy projection_active_planning_authorities on public.planning_authorities
  for select to urbanedge_public_projection using (is_active);
create policy projection_active_development_zones on public.development_plan_zones
  for select to urbanedge_public_projection using (is_active);
create policy projection_tp_schemes on public.tp_schemes
  for select to urbanedge_public_projection using (true);
create policy projection_tp_plots on public.tp_plots
  for select to urbanedge_public_projection using (true);
create policy projection_active_gidc_estates on public.gidc_estates
  for select to urbanedge_public_projection using (is_active);
create policy projection_published_parcels on public.property_parcels
  for select to urbanedge_public_projection using (archived_at is null and exists (
    select 1 from public.properties property
    where property.id = property_parcels.property_id
      and property.publication_status = 'PUBLISHED'
      and property.archived_at is null and property.deleted_at is null
  ));
create policy projection_public_parcel_identifiers on public.parcel_identifiers
  for select to urbanedge_public_projection using (
    public_visibility = 'PUBLIC' and exists (
      select 1 from public.property_parcels parcel
      join public.properties property on property.id = parcel.property_id
      where parcel.id = parcel_identifiers.parcel_id and parcel.archived_at is null
        and property.publication_status = 'PUBLISHED'
        and property.archived_at is null and property.deleted_at is null
    )
  );

grant create on schema public to urbanedge_public_projection;
set role urbanedge_public_projection;

create or replace view public.public_property_details
with (security_invoker = false)
as
select
  listing.id, listing.property_code, listing.public_slug, listing.land_category,
  listing.primary_transaction_type, listing.listing_title, listing.short_description,
  listing.availability_status, listing.featured, listing.published_at,
  listing.district_id, listing.district_name, listing.subdistrict_id, listing.subdistrict_name,
  listing.place_id, listing.place_name, listing.locality_id, listing.locality_name,
  listing.landmark_text, listing.public_address, listing.display_area_value,
  listing.display_area_unit_code, listing.display_area_unit_name, listing.display_area_unit_symbol,
  listing.location_visibility, listing.public_latitude, listing.public_longitude,
  listing.public_accuracy_m, listing.offer_transaction_type, listing.price_mode,
  listing.currency_code, listing.price_amount, listing.price_min, listing.price_max,
  listing.price_per_unit, listing.price_unit_code, listing.is_negotiable,
  listing.cover_media_id, listing.cover_object_path, listing.cover_alt_text,
  listing.cover_width_px, listing.cover_height_px,
  property.description, property.seo_title, property.seo_description, property.canonical_path,
  agricultural.tenure_type as agricultural_tenure_type,
  agricultural.agricultural_use_status, agricultural.irrigation_status,
  agricultural.primary_irrigation_source, agricultural.borewell_count,
  agricultural.well_count, agricultural.canal_access_status,
  agricultural.electricity_status as agricultural_electricity_status,
  agricultural.fencing_status, agricultural.topography, agricultural.land_shape,
  agricultural.structure_present as agricultural_structure_present,
  agricultural.road_touch as agricultural_road_touch,
  agricultural.road_width_m as agricultural_road_width_m,
  agricultural.boundary_summary_public, agricultural.current_cultivation_status,
  na.na_status, na.na_purpose, na.na_order_reference, na.na_order_date,
  na.development_permission_status, na.layout_approval_status,
  na.road_width_m as na_road_width_m, na.frontage_m as na_frontage_m,
  na.corner_plot as na_corner_plot, na.water_status as na_water_status,
  na.electricity_status as na_electricity_status, na.drainage_status as na_drainage_status,
  industrial.industrial_subtype, industrial.industrial_authority_name,
  industrial.industrial_tenure, industrial.gidc_plot_number, industrial.gidc_shed_number,
  industrial.allotment_status, industrial.possession_status, industrial.transfer_status,
  industrial.permitted_industrial_use, industrial.existing_shed_present,
  industrial.shed_area_value, shed_unit.code as shed_area_unit_code,
  industrial.open_area_value, open_unit.code as open_area_unit_code,
  industrial.road_width_m as industrial_road_width_m,
  industrial.truck_loading_access, industrial.power_status, industrial.sanctioned_load_kw,
  industrial.transformer_status, industrial.water_status as industrial_water_status,
  industrial.drainage_status as industrial_drainage_status,
  industrial.cetp_status, industrial.etp_status, industrial.gas_status,
  industrial.connectivity_summary, estate.name as gidc_estate_name,
  planning.planning_notes_public, authority.name as planning_authority_name,
  zone.name as development_plan_zone_name, zone.use_classification,
  scheme.scheme_number as tp_scheme_number, plot.plot_type as tp_plot_type,
  plot.plot_number as tp_plot_number
from public.public_property_listings listing
join public.properties property on property.id = listing.id
left join public.property_agricultural agricultural on agricultural.property_id = listing.id
left join public.property_na na on na.property_id = listing.id
left join public.property_industrial industrial on industrial.property_id = listing.id
left join public.area_units shed_unit on shed_unit.id = industrial.shed_area_unit_id
left join public.area_units open_unit on open_unit.id = industrial.open_area_unit_id
left join public.gidc_estates estate on estate.id = industrial.gidc_estate_id and estate.is_active
left join public.property_planning_context planning
  on planning.property_id = listing.id and planning.archived_at is null
left join public.planning_authorities authority
  on authority.id = planning.planning_authority_id and authority.is_active
left join public.development_plan_zones zone
  on zone.id = planning.development_plan_zone_id and zone.is_active
left join public.tp_schemes scheme on scheme.id = planning.tp_scheme_id
left join public.tp_plots plot on plot.id = planning.primary_tp_plot_id;

create view public.public_property_parcel_identifiers
with (security_invoker = false)
as
select parcel.property_id, identifier.identifier_type, identifier.identifier_value,
  identifier.is_primary, parcel.sequence_no
from public.parcel_identifiers identifier
join public.property_parcels parcel on parcel.id = identifier.parcel_id
join public.properties property on property.id = parcel.property_id
where identifier.public_visibility = 'PUBLIC' and parcel.archived_at is null
  and property.publication_status = 'PUBLISHED'
  and property.archived_at is null and property.deleted_at is null;

comment on view public.public_property_details is
  'M10 explicit public detail projection: published land facts and planning context only; no owner PII, evidence, private coordinates, internal notes, source metadata or audit data.';
comment on view public.public_property_parcel_identifiers is
  'M10 public parcel identifiers explicitly approved with PUBLIC visibility for published properties only.';

grant select on public.public_property_details, public.public_property_parcel_identifiers
  to anon, authenticated, service_role;

reset role;
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
