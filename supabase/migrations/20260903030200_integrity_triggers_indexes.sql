create function public.validate_property_attribute_value() returns trigger language plpgsql set search_path = '' as $$
declare expected public.attribute_value_type;
declare populated integer;
begin
  select value_type into expected from public.property_attribute_definitions where id = new.attribute_definition_id and archived_at is null;
  if expected is null then raise exception 'Active attribute definition is required'; end if;
  populated := num_nonnulls(new.text_value, new.long_text_value, new.integer_value, new.decimal_value,
    new.boolean_value, new.date_value, new.timestamp_value, new.option_id);
  if populated <> 1 then raise exception 'Exactly one typed attribute value is required'; end if;
  if (expected = 'TEXT' and new.text_value is null)
    or (expected = 'LONG_TEXT' and new.long_text_value is null)
    or (expected = 'INTEGER' and new.integer_value is null)
    or (expected = 'DECIMAL' and new.decimal_value is null)
    or (expected = 'BOOLEAN' and new.boolean_value is null)
    or (expected = 'DATE' and new.date_value is null)
    or (expected = 'TIMESTAMP' and new.timestamp_value is null)
    or (expected in ('SINGLE_OPTION','MULTI_OPTION') and new.option_id is null)
  then raise exception 'Typed value does not match attribute definition'; end if;
  if new.option_id is not null and not exists (
    select 1 from public.property_attribute_options
    where id = new.option_id and attribute_definition_id = new.attribute_definition_id and is_active
  ) then raise exception 'Option does not belong to active attribute definition'; end if;
  return new;
end;
$$;
create trigger property_attribute_values_validate before insert or update on public.property_attribute_values
  for each row execute function public.validate_property_attribute_value();
create unique index property_attribute_values_single_uidx on public.property_attribute_values(property_id, attribute_definition_id)
  where option_id is null;
create unique index property_attribute_values_option_uidx on public.property_attribute_values(property_id, attribute_definition_id, option_id)
  where option_id is not null;

create function public.validate_app_setting_value() returns trigger language plpgsql set search_path = '' as $$
begin
  if num_nonnulls(new.text_value, new.integer_value, new.decimal_value, new.boolean_value, new.url_value, new.json_value) <> 1 then
    raise exception 'Exactly one setting value is required';
  end if;
  if (new.value_type = 'TEXT' and new.text_value is null)
    or (new.value_type = 'INTEGER' and new.integer_value is null)
    or (new.value_type = 'DECIMAL' and new.decimal_value is null)
    or (new.value_type = 'BOOLEAN' and new.boolean_value is null)
    or (new.value_type = 'URL' and new.url_value is null)
    or (new.value_type = 'JSON' and new.json_value is null)
  then raise exception 'Setting value does not match value_type'; end if;
  return new;
end;
$$;
create trigger app_settings_validate before insert or update on public.app_settings
  for each row execute function public.validate_app_setting_value();

create function public.validate_property_category_extension() returns trigger language plpgsql set search_path = '' as $$
declare expected public.land_category := tg_argv[0]::public.land_category;
declare actual public.land_category;
begin
  select land_category into actual from public.properties where id = new.property_id;
  if actual is distinct from expected then raise exception 'Category extension % does not match property category %', expected, actual; end if;
  return new;
end;
$$;
create trigger property_agricultural_category before insert or update on public.property_agricultural
  for each row execute function public.validate_property_category_extension('AGRICULTURAL');
create trigger property_na_category before insert or update on public.property_na
  for each row execute function public.validate_property_category_extension('NA');
create trigger property_industrial_category before insert or update on public.property_industrial
  for each row execute function public.validate_property_category_extension('INDUSTRIAL');

create function public.prevent_property_category_change() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.land_category is distinct from old.land_category and (
    exists (select 1 from public.property_agricultural where property_id = old.id)
    or exists (select 1 from public.property_na where property_id = old.id)
    or exists (select 1 from public.property_industrial where property_id = old.id)
  ) then raise exception 'Remove the existing category extension before changing land_category'; end if;
  return new;
end;
$$;
create trigger properties_category_change_guard before update of land_category on public.properties
  for each row execute function public.prevent_property_category_change();

create function public.prevent_audit_mutation() returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'audit_logs are append-only';
end;
$$;
create trigger audit_logs_append_only before update or delete on public.audit_logs
  for each row execute function public.prevent_audit_mutation();

create trigger owner_submissions_reference_immutable before update on public.owner_submissions
  for each row execute function public.prevent_column_change('submission_reference');
create trigger leads_reference_immutable before update on public.leads
  for each row execute function public.prevent_column_change('lead_reference');
create trigger site_visits_reference_immutable before update on public.site_visits
  for each row execute function public.prevent_column_change('visit_reference');

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'admin_profiles','source_references','countries','states','districts','subdistricts','places','localities',
    'area_units','planning_authorities','development_plan_zones','tp_schemes','tp_plots','gidc_estates','properties',
    'property_offers','property_parcels','parcel_identifiers','property_locations','property_planning_context',
    'property_agricultural','property_na','property_industrial','property_attribute_definitions','property_attribute_values',
    'parties','property_parties','property_source_links','media_assets','owner_submissions','private_documents',
    'verification_check_definitions','property_verifications','leads','lead_requirements','site_visits','guide_categories',
    'guides','seo_pages','app_settings'
  ] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at', table_name);
  end loop;
end $$;

create unique index area_conversion_active_authoritative_uidx
  on public.area_conversion_rules(from_unit_id, to_unit_id, jurisdiction_id, place_id) nulls not distinct
  where is_authoritative and effective_to is null;
create index districts_service_area_idx on public.districts(is_service_area, is_active);
create index subdistricts_district_active_idx on public.subdistricts(district_id, is_active);
create index places_subdistrict_active_idx on public.places(subdistrict_id, is_active);
create index localities_place_active_idx on public.localities(place_id, is_active);
create index properties_publication_availability_idx on public.properties(publication_status, availability_status) where deleted_at is null;
create index properties_geography_idx on public.properties(district_id, subdistrict_id, place_id, locality_id);
create index properties_category_transaction_idx on public.properties(land_category, primary_transaction_type);
create index properties_featured_idx on public.properties(featured, published_at desc) where publication_status = 'PUBLISHED';
create index property_offers_transaction_idx on public.property_offers(transaction_type, archived_at);
create index property_offers_exact_price_idx on public.property_offers(price_amount) where price_mode = 'EXACT_TOTAL' and archived_at is null;
create index property_parcels_property_idx on public.property_parcels(property_id, archived_at);
create index parcel_identifiers_lookup_idx on public.parcel_identifiers(identifier_type, normalized_value);
create index property_planning_context_property_idx on public.property_planning_context(property_id, archived_at);
create index media_assets_property_visibility_idx on public.media_assets(property_id, visibility, archived_at);
create index media_assets_property_order_idx on public.media_assets(property_id, sort_order) where archived_at is null;
create index private_documents_property_idx on public.private_documents(property_id, archived_at);
create index private_documents_submission_idx on public.private_documents(owner_submission_id, archived_at);
create index property_verifications_property_check_idx on public.property_verifications(property_id, check_definition_id);
create index property_verifications_recheck_idx on public.property_verifications(recheck_at) where recheck_at is not null;
create index verification_evidence_verification_idx on public.verification_evidence(property_verification_id);
create index owner_submissions_status_idx on public.owner_submissions(status, created_at desc) where archived_at is null;
create index owner_submissions_next_action_idx on public.owner_submissions(next_action_at) where next_action_at is not null and archived_at is null;
create index leads_status_idx on public.leads(status, created_at desc) where archived_at is null;
create index leads_follow_up_idx on public.leads(next_follow_up_at) where next_follow_up_at is not null and archived_at is null;
create index lead_activities_timeline_idx on public.lead_activities(lead_id, activity_at desc);
create index lead_activities_property_idx on public.lead_activities(property_id, activity_at desc) where property_id is not null;
create index site_visits_status_date_idx on public.site_visits(status, confirmed_start_at) where archived_at is null;
create index site_visits_lead_idx on public.site_visits(lead_id, created_at desc);
create index site_visits_property_idx on public.site_visits(property_id, created_at desc);
create index guides_publication_idx on public.guides(status, published_at desc) where archived_at is null;
create index seo_pages_publication_idx on public.seo_pages(status, published_at desc) where archived_at is null;
create index analytics_events_occurred_idx on public.analytics_events(occurred_at desc);
create index analytics_events_property_idx on public.analytics_events(property_id, occurred_at desc) where property_id is not null;
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, occurred_at desc);

revoke all on all sequences in schema public from anon, authenticated;
revoke execute on function public.next_property_code() from anon, authenticated;
revoke execute on function public.next_owner_submission_reference() from anon, authenticated;
revoke execute on function public.next_lead_reference() from anon, authenticated;
revoke execute on function public.next_site_visit_reference() from anon, authenticated;
