import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Database,
  PublicAppSettingRow,
  PublicAreaUnitRow,
  PublicGeographyOptionRow,
} from "@/types/database";

export async function getPublicGeographyOptions(
  client: SupabaseClient<Database>,
): Promise<readonly PublicGeographyOptionRow[]> {
  const { data, error } = await client
    .from("public_geography_options")
    .select(
      "district_id,district_name,subdistrict_id,subdistrict_name,place_id,place_name,locality_id,locality_name,locality_slug,locality_is_indexable",
    )
    .order("district_name")
    .order("subdistrict_name")
    .order("place_name")
    .order("locality_name");
  if (error) throw error;
  return data;
}

export async function getPublicAreaUnits(
  client: SupabaseClient<Database>,
): Promise<readonly PublicAreaUnitRow[]> {
  const { data, error } = await client
    .from("public_area_units")
    .select("id,code,display_name,symbol,is_metric,is_local")
    .order("display_name");
  if (error) throw error;
  return data;
}

export async function getPublicSettings(
  client: SupabaseClient<Database>,
): Promise<Readonly<Record<string, PublicAppSettingRow["value"]>>> {
  const { data, error } = await client
    .from("public_app_settings")
    .select("key,label,value_type,value")
    .order("key");
  if (error) throw error;
  return Object.fromEntries(data.map((setting) => [setting.key, setting.value]));
}
