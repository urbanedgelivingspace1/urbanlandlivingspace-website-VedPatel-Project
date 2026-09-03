#!/usr/bin/env bash
set -euo pipefail

container_name="supabase_db_urbanedge-land-space-local"
fixture_prefix="M2 concurrency fixture"

process_ids=()
for number in $(seq 1 24); do
  docker exec "${container_name}" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q -c \
    "insert into public.properties (land_category, primary_transaction_type, district_id, display_area_value, display_area_unit_id, listing_title)
     values ('AGRICULTURAL', 'BUY', '00000000-0000-4000-8000-000000000003', ${number}, '10000000-0000-4000-8000-000000000006', '${fixture_prefix} ${number}');" &
  process_ids+=("$!")
done

for process_id in "${process_ids[@]}"; do
  wait "${process_id}"
done

result="$(docker exec "${container_name}" psql -U postgres -d postgres -Atc \
  "select count(*) = 24 and count(distinct property_code) = 24 and bool_and(property_code ~ '^UE-LS-[0-9]{6}$')
   from public.properties where listing_title like '${fixture_prefix}%';")"

docker exec "${container_name}" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q -c \
  "delete from public.properties where listing_title like '${fixture_prefix}%';"

if [[ "${result}" != "t" ]]; then
  echo "Concurrent property-code allocation failed."
  exit 1
fi

echo "Concurrent property-code allocation passed for 24 parallel inserts."
