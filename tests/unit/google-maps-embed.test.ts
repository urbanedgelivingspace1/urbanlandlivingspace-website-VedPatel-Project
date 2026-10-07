// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  isSafeGoogleMapsEmbedUrl,
  parseGoogleMapsEmbedInput,
} from "@/lib/validation/google-maps-embed";

describe("Google Maps embed validation", () => {
  it("accepts a direct official embed URL", () => {
    expect(parseGoogleMapsEmbedInput("https://www.google.com/maps/embed?pb=direct-map")).toEqual({
      ok: true,
      url: "https://www.google.com/maps/embed?pb=direct-map",
    });
  });

  it("extracts only src from copied iframe HTML", () => {
    expect(
      parseGoogleMapsEmbedInput(
        '<iframe src="https://www.google.com/maps/embed?pb=copied-map" width="600" height="450" style="border:0" allowfullscreen="" loading="lazy"></iframe>',
      ),
    ).toEqual({ ok: true, url: "https://www.google.com/maps/embed?pb=copied-map" });
  });

  it("rejects missing src, wrong providers, scripts, ports, credentials, and fragments", () => {
    for (const input of [
      "<iframe></iframe>",
      '<iframe src="https://evil.example.com"></iframe>',
      '<iframe src="https://www.google.com/maps/embed?pb=map"></iframe><script>alert(1)</script>',
      "https://www.google.com:444/maps/embed?pb=map",
      "https://user@www.google.com/maps/embed?pb=map",
      "https://www.google.com/maps/embed?pb=map#fragment",
    ]) {
      expect(parseGoogleMapsEmbedInput(input).ok).toBe(false);
    }
  });

  it("does not accept ordinary Google Maps links as embeddable sources", () => {
    expect(isSafeGoogleMapsEmbedUrl("https://www.google.com/maps/place/Gandhinagar")).toBe(false);
  });
});
