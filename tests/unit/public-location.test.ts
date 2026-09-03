// @vitest-environment node

import { describe, expect, it } from "vitest";

import { projectPublicLocation, type PublicLocationSource } from "@/lib/privacy/public-location";

const source: PublicLocationSource = {
  visibility: "APPROXIMATE",
  publicLatitude: 23.02,
  publicLongitude: 72.57,
  publicAccuracyMetres: 2_000,
  districtName: "Ahmedabad",
  subdistrictName: "Daskroi",
  placeName: "Ahmedabad",
  localityName: "Example locality",
  publicAddress: "Approved public address",
};

describe("projectPublicLocation", () => {
  it("returns only the approved public point for approximate locations", () => {
    expect(projectPublicLocation(source)).toEqual({
      visibility: "APPROXIMATE",
      label: "Example locality, Ahmedabad, Daskroi, Ahmedabad",
      point: { latitude: 23.02, longitude: 72.57, accuracyMetres: 2_000 },
    });
  });

  it("returns no point for hidden locations even if malformed input carries public coordinates", () => {
    expect(projectPublicLocation({ ...source, visibility: "HIDDEN" }).point).toBeNull();
  });

  it("may use an approved public address for exact visibility", () => {
    expect(projectPublicLocation({ ...source, visibility: "EXACT" }).label).toBe(
      "Approved public address",
    );
  });
});
