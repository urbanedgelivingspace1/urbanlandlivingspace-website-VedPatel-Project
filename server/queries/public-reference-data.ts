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
    .select("*")
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
  const { data, error } = await client.from("public_area_units").select("*").order("display_name");
  if (error) throw error;
  return data;
}

export async function getPublicSettings(
  client: SupabaseClient<Database>,
): Promise<Readonly<Record<string, PublicAppSettingRow["value"]>>> {
  const { data, error } = await client.from("public_app_settings").select("*").order("key");
  if (error) throw error;
  return Object.fromEntries(data.map((setting) => [setting.key, setting.value]));
}
