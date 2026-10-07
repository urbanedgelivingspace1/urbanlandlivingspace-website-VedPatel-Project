import { describe, expect, it } from "vitest";

import { isMissingOptionalGoogleMapsSchema } from "@/lib/supabase/schema-compatibility";

describe("Google Maps schema rollout compatibility", () => {
  it.each([
    ["42703", "column properties.google_maps_embed_url does not exist"],
    ["42P01", 'relation "public_property_google_maps" does not exist'],
    ["PGRST204", "Could not find the 'google_maps_embed_url' column in the schema cache"],
    [
      "PGRST205",
      "Could not find the table 'public.public_property_google_maps' in the schema cache",
    ],
  ])("recognizes a missing optional map schema (%s)", (code, message) => {
    expect(isMissingOptionalGoogleMapsSchema({ code, message })).toBe(true);
  });

  it("does not hide unrelated database failures", () => {
    expect(
      isMissingOptionalGoogleMapsSchema({
        code: "42703",
        message: "column properties.title missing",
      }),
    ).toBe(false);
    expect(
      isMissingOptionalGoogleMapsSchema({
        code: "42501",
        message: "permission denied for public_property_google_maps",
      }),
    ).toBe(false);
  });
});
