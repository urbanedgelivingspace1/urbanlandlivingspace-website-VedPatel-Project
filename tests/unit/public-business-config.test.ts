import { describe, expect, it } from "vitest";

import {
  normalizeExternalHttpsUrl,
  resolvePublicBusinessConfig,
} from "@/lib/config/public-business";

describe("M17 public business configuration", () => {
  it("allows only credential-free HTTPS destinations", () => {
    expect(normalizeExternalHttpsUrl("https://living.example/path")).toBe(
      "https://living.example/path",
    );
    expect(normalizeExternalHttpsUrl("http://living.example/path")).toBeNull();
    expect(normalizeExternalHttpsUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeExternalHttpsUrl("https://user:secret@living.example/path")).toBeNull();
  });

  it("drops malformed public email and sister-site settings", () => {
    expect(
      resolvePublicBusinessConfig({
        public_email: "not-an-email",
        living_space_url: "//attacker.invalid",
      }),
    ).toMatchObject({ email: null, livingSpaceUrl: null });
    expect(
      resolvePublicBusinessConfig({
        public_email: "INFO@EXAMPLE.COM",
        living_space_url: "https://living.example",
      }),
    ).toMatchObject({
      email: "info@example.com",
      livingSpaceUrl: "https://living.example/",
    });
  });
});
