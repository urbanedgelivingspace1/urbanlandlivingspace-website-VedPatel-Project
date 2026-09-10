import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Database,
  PublicAppSettingRow,
  PublicAreaUnitRow,
  PublicGeographyOptionRow,
} from "@/types/database";

const FALLBACK_PUBLIC_AREA_UNITS: readonly PublicAreaUnitRow[] = [
  {
    id: "10000000-0000-4000-8000-000000000002",
    code: "sq_ft",
    display_name: "Square foot",
    symbol: "ft²",
    is_metric: false,
    is_local: false,
  },
  {
    id: "10000000-0000-4000-8000-000000000001",
    code: "sq_m",
    display_name: "Square metre",
    symbol: "m²",
    is_metric: true,
    is_local: false,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    code: "sq_yd",
    display_name: "Square yard",
    symbol: "yd²",
    is_metric: false,
    is_local: false,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    code: "var",
    display_name: "Var",
    symbol: "var",
    is_metric: false,
    is_local: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    code: "guntha",
    display_name: "Guntha",
    symbol: "guntha",
    is_metric: false,
    is_local: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    code: "acre",
    display_name: "Acre",
    symbol: "ac",
    is_metric: false,
    is_local: false,
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    code: "hectare",
    display_name: "Hectare",
    symbol: "ha",
    is_metric: true,
    is_local: false,
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    code: "bigha",
    display_name: "Bigha",
    symbol: "bigha",
    is_metric: false,
    is_local: true,
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    code: "vigha",
    display_name: "Vigha",
    symbol: "vigha",
    is_metric: false,
    is_local: true,
  },
];

const FALLBACK_PUBLIC_GEOGRAPHY_OPTIONS: readonly PublicGeographyOptionRow[] = [
  {
    district_id: "00000000-0000-4000-8000-000000000003",
    district_name: "Ahmedabad",
    subdistrict_id: "00000000-0000-4000-8001-000000000001",
    subdistrict_name: "Sanand",
    place_id: "00000000-0000-4000-8002-000000000001",
    place_name: "Sanand Town",
    locality_id: null,
    locality_name: null,
    locality_slug: null,
    locality_is_indexable: false,
  },
  {
    district_id: "00000000-0000-4000-8000-000000000003",
    district_name: "Ahmedabad",
    subdistrict_id: "00000000-0000-4000-8001-000000000002",
    subdistrict_name: "Daskroi",
    place_id: "00000000-0000-4000-8002-000000000005",
    place_name: "Bopal",
    locality_id: null,
    locality_name: null,
    locality_slug: null,
    locality_is_indexable: false,
  },
  {
    district_id: "00000000-0000-4000-8000-000000000004",
    district_name: "Gandhinagar",
    subdistrict_id: "00000000-0000-4000-8001-000000000010",
    subdistrict_name: "Gandhinagar",
    place_id: "00000000-0000-4000-8002-000000000011",
    place_name: "Kudasan",
    locality_id: null,
    locality_name: null,
    locality_slug: null,
    locality_is_indexable: false,
  },
  {
    district_id: "00000000-0000-4000-8000-000000000004",
    district_name: "Gandhinagar",
    subdistrict_id: "00000000-0000-4000-8001-000000000011",
    subdistrict_name: "Kalol",
    place_id: "00000000-0000-4000-8002-000000000014",
    place_name: "Kalol Town",
    locality_id: null,
    locality_name: null,
    locality_slug: null,
    locality_is_indexable: false,
  },
];

export async function getPublicGeographyOptions(
  client: SupabaseClient<Database>,
): Promise<readonly PublicGeographyOptionRow[]> {
  try {
    const { data, error } = await client
      .from("public_geography_options")
      .select(
        "district_id,district_name,subdistrict_id,subdistrict_name,place_id,place_name,locality_id,locality_name,locality_slug,locality_is_indexable",
      )
      .order("district_name")
      .order("subdistrict_name")
      .order("place_name")
      .order("locality_name");
    if (error) return FALLBACK_PUBLIC_GEOGRAPHY_OPTIONS;
    return data && data.length > 0 ? data : FALLBACK_PUBLIC_GEOGRAPHY_OPTIONS;
  } catch {
    return FALLBACK_PUBLIC_GEOGRAPHY_OPTIONS;
  }
}

export async function getPublicAreaUnits(
  client: SupabaseClient<Database>,
): Promise<readonly PublicAreaUnitRow[]> {
  try {
    const { data, error } = await client
      .from("public_area_units")
      .select("id,code,display_name,symbol,is_metric,is_local")
      .order("display_name");
    if (error) return FALLBACK_PUBLIC_AREA_UNITS;
    return data && data.length > 0 ? data : FALLBACK_PUBLIC_AREA_UNITS;
  } catch {
    return FALLBACK_PUBLIC_AREA_UNITS;
  }
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
