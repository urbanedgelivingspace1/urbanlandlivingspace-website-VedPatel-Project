import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("Seeding reference data on:", url);

  // 1. Countries
  const country = {
    id: "00000000-0000-4000-8000-000000000001",
    iso_code: "IN",
    name: "India",
  };
  const { error: errCountry } = await supabase
    .from("countries")
    .upsert(country, { onConflict: "iso_code" });
  if (errCountry) console.warn("Countries error:", errCountry);
  else console.log("✓ Country seeded");

  // 2. States
  const state = {
    id: "00000000-0000-4000-8000-000000000002",
    country_id: country.id,
    code: "GJ",
    name: "Gujarat",
  };
  const { error: errState } = await supabase
    .from("states")
    .upsert(state, { onConflict: "country_id,code" });
  if (errState) console.warn("States error:", errState);
  else console.log("✓ State seeded");

  // 3. Districts
  const districts = [
    {
      id: "00000000-0000-4000-8000-000000000003",
      state_id: state.id,
      code: "AMD",
      name: "Ahmedabad",
      is_service_area: true,
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8000-000000000004",
      state_id: state.id,
      code: "GNR",
      name: "Gandhinagar",
      is_service_area: true,
      is_active: true,
    },
  ];
  const { error: errDistricts } = await supabase
    .from("districts")
    .upsert(districts, { onConflict: "state_id,name" });
  if (errDistricts) console.warn("Districts error:", errDistricts);
  else console.log("✓ Districts seeded");

  // 4. Subdistricts (Talukas)
  const subdistricts = [
    // Ahmedabad
    {
      id: "00000000-0000-4000-8001-000000000001",
      district_id: districts[0].id,
      code: "SANAND",
      name: "Sanand",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8001-000000000002",
      district_id: districts[0].id,
      code: "DASKROI",
      name: "Daskroi",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8001-000000000003",
      district_id: districts[0].id,
      code: "DHOLKA",
      name: "Dholka",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8001-000000000004",
      district_id: districts[0].id,
      code: "BAVLA",
      name: "Bavla",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8001-000000000005",
      district_id: districts[0].id,
      code: "VIRAMGAM",
      name: "Viramgam",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8001-000000000006",
      district_id: districts[0].id,
      code: "MANDAL",
      name: "Mandal",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8001-000000000007",
      district_id: districts[0].id,
      code: "DETROJ",
      name: "Detroj-Rampura",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8001-000000000008",
      district_id: districts[0].id,
      code: "DHANDHUKA",
      name: "Dhandhuka",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8001-000000000009",
      district_id: districts[0].id,
      code: "DHOLERA",
      name: "Dholera",
      is_active: true,
    },
    // Gandhinagar
    {
      id: "00000000-0000-4000-8001-000000000010",
      district_id: districts[1].id,
      code: "GANDHINAGAR",
      name: "Gandhinagar",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8001-000000000011",
      district_id: districts[1].id,
      code: "KALOL",
      name: "Kalol",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8001-000000000012",
      district_id: districts[1].id,
      code: "DEHGAM",
      name: "Dehgam",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8001-000000000013",
      district_id: districts[1].id,
      code: "MANSA",
      name: "Mansa",
      is_active: true,
    },
  ];
  const { error: errSubdistricts } = await supabase
    .from("subdistricts")
    .upsert(subdistricts, { onConflict: "id" });
  if (errSubdistricts) console.warn("Subdistricts error:", errSubdistricts);
  else console.log("✓ Subdistricts seeded");

  // 5. Places
  const places = [
    {
      id: "00000000-0000-4000-8002-000000000001",
      subdistrict_id: subdistricts[0].id,
      place_type: "TOWN",
      official_name: "Sanand Town",
      postal_name: "Sanand",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000002",
      subdistrict_id: subdistricts[0].id,
      place_type: "VILLAGE",
      official_name: "Changodar",
      postal_name: "Changodar",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000003",
      subdistrict_id: subdistricts[0].id,
      place_type: "VILLAGE",
      official_name: "Khoraj",
      postal_name: "Khoraj",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000004",
      subdistrict_id: subdistricts[0].id,
      place_type: "VILLAGE",
      official_name: "Shela",
      postal_name: "Shela",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000005",
      subdistrict_id: subdistricts[1].id,
      place_type: "TOWN",
      official_name: "Bopal",
      postal_name: "Bopal",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000006",
      subdistrict_id: subdistricts[1].id,
      place_type: "TOWN",
      official_name: "Thaltej",
      postal_name: "Thaltej",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000007",
      subdistrict_id: subdistricts[1].id,
      place_type: "VILLAGE",
      official_name: "Shilaj",
      postal_name: "Shilaj",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000008",
      subdistrict_id: subdistricts[1].id,
      place_type: "VILLAGE",
      official_name: "Ognaj",
      postal_name: "Ognaj",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000009",
      subdistrict_id: subdistricts[3].id,
      place_type: "TOWN",
      official_name: "Bavla Town",
      postal_name: "Bavla",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000010",
      subdistrict_id: subdistricts[8].id,
      place_type: "TOWN",
      official_name: "Dholera SIR",
      postal_name: "Dholera",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000011",
      subdistrict_id: subdistricts[9].id,
      place_type: "TOWN",
      official_name: "Kudasan",
      postal_name: "Kudasan",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000012",
      subdistrict_id: subdistricts[9].id,
      place_type: "VILLAGE",
      official_name: "Raysan",
      postal_name: "Raysan",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000013",
      subdistrict_id: subdistricts[9].id,
      place_type: "VILLAGE",
      official_name: "Sargasan",
      postal_name: "Sargasan",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000014",
      subdistrict_id: subdistricts[10].id,
      place_type: "TOWN",
      official_name: "Kalol Town",
      postal_name: "Kalol",
      is_active: true,
    },
    {
      id: "00000000-0000-4000-8002-000000000015",
      subdistrict_id: subdistricts[10].id,
      place_type: "VILLAGE",
      official_name: "Santej",
      postal_name: "Santej",
      is_active: true,
    },
  ];
  const { error: errPlaces } = await supabase.from("places").upsert(places, { onConflict: "id" });
  if (errPlaces) console.warn("Places error:", errPlaces);
  else console.log("✓ Places seeded");

  // 6. Area units
  const areaUnits = [
    {
      id: "10000000-0000-4000-8000-000000000001",
      code: "sq_m",
      display_name: "Square metre",
      symbol: "m²",
      is_public_v1: true,
      is_metric: true,
      is_local: false,
    },
    {
      id: "10000000-0000-4000-8000-000000000002",
      code: "sq_ft",
      display_name: "Square foot",
      symbol: "ft²",
      is_public_v1: true,
      is_metric: false,
      is_local: false,
    },
    {
      id: "10000000-0000-4000-8000-000000000003",
      code: "sq_yd",
      display_name: "Square yard",
      symbol: "yd²",
      is_public_v1: true,
      is_metric: false,
      is_local: false,
    },
    {
      id: "10000000-0000-4000-8000-000000000004",
      code: "var",
      display_name: "Var",
      symbol: "var",
      is_public_v1: true,
      is_metric: false,
      is_local: true,
    },
    {
      id: "10000000-0000-4000-8000-000000000005",
      code: "guntha",
      display_name: "Guntha",
      symbol: "guntha",
      is_public_v1: true,
      is_metric: false,
      is_local: true,
    },
    {
      id: "10000000-0000-4000-8000-000000000006",
      code: "acre",
      display_name: "Acre",
      symbol: "ac",
      is_public_v1: true,
      is_metric: false,
      is_local: false,
    },
    {
      id: "10000000-0000-4000-8000-000000000007",
      code: "hectare",
      display_name: "Hectare",
      symbol: "ha",
      is_public_v1: true,
      is_metric: true,
      is_local: false,
    },
    {
      id: "10000000-0000-4000-8000-000000000008",
      code: "bigha",
      display_name: "Bigha",
      symbol: "bigha",
      is_public_v1: true,
      is_metric: false,
      is_local: true,
    },
    {
      id: "10000000-0000-4000-8000-000000000009",
      code: "vigha",
      display_name: "Vigha",
      symbol: "vigha",
      is_public_v1: true,
      is_metric: false,
      is_local: true,
    },
  ];
  const { error: errUnits } = await supabase
    .from("area_units")
    .upsert(areaUnits, { onConflict: "code" });
  if (errUnits) console.warn("Area units error:", errUnits);
  else console.log("✓ Area units seeded");

  // 7. Area conversion rules
  const conversionRules = [
    {
      id: "20000000-0000-4000-8000-000000000001",
      from_unit_id: areaUnits[1].id,
      to_unit_id: areaUnits[0].id,
      factor: 0.09290304,
      conversion_method: "EXACT_STANDARD",
      is_authoritative: true,
    },
    {
      id: "20000000-0000-4000-8000-000000000002",
      from_unit_id: areaUnits[2].id,
      to_unit_id: areaUnits[0].id,
      factor: 0.83612736,
      conversion_method: "EXACT_STANDARD",
      is_authoritative: true,
    },
    {
      id: "20000000-0000-4000-8000-000000000003",
      from_unit_id: areaUnits[3].id,
      to_unit_id: areaUnits[0].id,
      factor: 0.83612736,
      conversion_method: "GUJARAT_STANDARD_VAR",
      is_authoritative: true,
    },
    {
      id: "20000000-0000-4000-8000-000000000004",
      from_unit_id: areaUnits[5].id,
      to_unit_id: areaUnits[0].id,
      factor: 4046.8564224,
      conversion_method: "EXACT_STANDARD",
      is_authoritative: true,
    },
    {
      id: "20000000-0000-4000-8000-000000000005",
      from_unit_id: areaUnits[6].id,
      to_unit_id: areaUnits[0].id,
      factor: 10000.0,
      conversion_method: "EXACT_STANDARD",
      is_authoritative: true,
    },
  ];
  const { error: errRules } = await supabase
    .from("area_conversion_rules")
    .upsert(conversionRules, { onConflict: "id" });
  if (errRules) console.warn("Conversion rules error:", errRules);
  else console.log("✓ Area conversion rules seeded");

  // 8. Parties (for Admin property drafts & CRM)
  const parties = [
    {
      id: "70000000-0000-4000-8000-000000000001",
      display_name: "UrbanEdge Land Advisory Desk",
      party_type: "COMPANY",
      is_active: true,
    },
    {
      id: "70000000-0000-4000-8000-000000000002",
      display_name: "UrbanEdge Partner Network",
      party_type: "COMPANY",
      is_active: true,
    },
  ];
  const { error: errParties } = await supabase
    .from("parties")
    .upsert(parties, { onConflict: "id" });
  if (errParties) console.warn("Parties error:", errParties);
  else console.log("✓ Parties seeded");

  console.log("Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
