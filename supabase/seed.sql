insert into public.countries (id, iso_code, name)
values ('00000000-0000-4000-8000-000000000001', 'IN', 'India')
on conflict (iso_code) do update set name = excluded.name, is_active = true;

insert into public.states (id, country_id, code, name)
values ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'GJ', 'Gujarat')
on conflict (country_id, code) do update set name = excluded.name, is_active = true;

insert into public.districts (id, state_id, code, name, is_service_area)
values
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 'AMD', 'Ahmedabad', true),
  ('00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000002', 'GNR', 'Gandhinagar', true)
on conflict (state_id, name) do update set code = excluded.code, is_service_area = true, is_active = true;

insert into public.area_units (id, code, display_name, symbol, is_public_v1, is_metric, is_local)
values
  ('10000000-0000-4000-8000-000000000001', 'sq_m', 'Square metre', 'm²', true, true, false),
  ('10000000-0000-4000-8000-000000000002', 'sq_ft', 'Square foot', 'ft²', true, false, false),
  ('10000000-0000-4000-8000-000000000003', 'sq_yd', 'Square yard', 'yd²', true, false, false),
  ('10000000-0000-4000-8000-000000000004', 'var', 'Var', 'var', true, false, true),
  ('10000000-0000-4000-8000-000000000005', 'guntha', 'Guntha', 'guntha', true, false, true),
  ('10000000-0000-4000-8000-000000000006', 'acre', 'Acre', 'ac', true, false, false),
  ('10000000-0000-4000-8000-000000000007', 'hectare', 'Hectare', 'ha', true, true, false),
  ('10000000-0000-4000-8000-000000000008', 'bigha', 'Bigha', 'bigha', true, false, true),
  ('10000000-0000-4000-8000-000000000009', 'vigha', 'Vigha', 'vigha', true, false, true)
on conflict (code) do update set display_name = excluded.display_name, symbol = excluded.symbol,
  is_public_v1 = excluded.is_public_v1, is_metric = excluded.is_metric, is_local = excluded.is_local;

insert into public.area_conversion_rules
  (from_unit_id, to_unit_id, factor, conversion_method, is_authoritative)
values
  ('10000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 0.092903040000, 'EXACT_STANDARD', true),
  ('10000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 0.836127360000, 'EXACT_STANDARD', true),
  ('10000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 0.836127360000, 'GUJARAT_STANDARD_VAR', true),
  ('10000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', 4046.856422400000, 'EXACT_STANDARD', true),
  ('10000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000001', 10000.000000000000, 'EXACT_STANDARD', true)
on conflict do nothing;
