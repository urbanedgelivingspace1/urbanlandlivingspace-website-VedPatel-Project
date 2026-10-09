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
  it("never projects coordinates into the public website model", () => {
    expect(projectPublicLocation(source)).toEqual({
      visibility: "APPROXIMATE",
      label: "Approved public address",
      point: null,
    });
  });

  it("returns no point for hidden locations even if malformed input carries public coordinates", () => {
    expect(projectPublicLocation({ ...source, visibility: "HIDDEN" }).point).toBeNull();
  });

  it("uses the approved public location title for a visible location", () => {
    expect(projectPublicLocation({ ...source, visibility: "EXACT" }).label).toBe(
      "Approved public address",
    );
  });
});
