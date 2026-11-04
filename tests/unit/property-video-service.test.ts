// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";

vi.mock("server-only", () => ({}));
const auth = vi.hoisted(() => vi.fn());
vi.mock("@/server/auth/authorization", () => ({ requireActiveAdmin: auth }));
import {
  managePropertyVideo,
  managePropertyVideoWithClient,
} from "@/server/services/property-media";
const propertyId = "20000000-0000-4000-8000-000000000001";
const actorId = "70000000-0000-4000-8000-000000000001";
const videoId = "30000000-0000-4000-8000-000000000001";
function form(operation = "create") {
  const data = new FormData();
  Object.entries({
    operation,
    url: "https://youtu.be/AbCdEf12345?t=90",
    title: "Property overview",
    description: "A public view",
    subtype: "STANDARD_VIDEO",
    id: videoId,
    revision: "0",
  }).forEach(([key, value]) => data.set(key, value));
  return data;
}
function fixture({ mediaExists = true, rpcError = false, posterRegistered = false } = {}) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { id: propertyId }, error: null }),
  };
  const mediaQuery = {
    ...query,
    maybeSingle: vi.fn().mockResolvedValue({
      data: mediaExists
        ? {
            id: videoId,
            external_provider: "YOUTUBE",
            external_media_id: "AbCdEf12345",
            external_url: "https://www.youtube.com/watch?v=AbCdEf12345",
            drive_resource_key: null,
          }
        : null,
      error: null,
    }),
  };
  const storage = {
    upload: vi.fn().mockResolvedValue({ error: null }),
    remove: vi.fn().mockResolvedValue({ error: null }),
  };
  const client = {
    from: vi.fn((table: string) =>
      table === "property_video_posters"
        ? {
            ...query,
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: posterRegistered ? { id: videoId } : null, error: null }),
          }
        : table === "properties"
          ? query
          : mediaQuery,
    ),
    rpc: vi.fn((name: string, ...payload: unknown[]) =>
      Promise.resolve(
        name === "get_storage_usage_bytes" && payload.length <= 1
          ? { data: 0, error: null }
          : rpcError
            ? { data: null, error: { message: "This video changed. Refresh before trying again" } }
            : { data: videoId, error: null },
      ),
    ),
    storage: { from: vi.fn(() => storage) },
  };
  return {
    client: client as unknown as SupabaseClient<Database>,
    raw: client,
    storage,
    mediaQuery,
  };
}
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_PROPERTY_VIDEOS_ENABLED", "true");
  for (const [key, value] of Object.entries({
    APP_ENV: "test",
    NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:55321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "synthetic-anon",
    SUPABASE_SERVICE_ROLE_KEY: "synthetic-service",
  }))
    vi.stubEnv(key, value);
  auth.mockReset();
});
afterEach(() => vi.unstubAllEnvs());
describe("property video service boundaries", () => {
  it("rejects unauthenticated mutations before creating a privileged client", async () => {
    auth.mockRejectedValue(new Error("Not authorized"));
    await expect(managePropertyVideo(propertyId, form())).rejects.toThrow("Not authorized");
  });
  it("enforces the feature switch before touching storage or database", async () => {
    vi.stubEnv("NEXT_PUBLIC_PROPERTY_VIDEOS_ENABLED", "false");
    const f = fixture();
    await expect(
      managePropertyVideoWithClient(f.client, actorId, propertyId, form()),
    ).rejects.toThrow(/disabled/);
    expect(f.raw.from).not.toHaveBeenCalled();
  });
  it("sends canonical server-validated metadata without video storage fields", async () => {
    const f = fixture();
    await managePropertyVideoWithClient(f.client, actorId, propertyId, form());
    const [name, args] = f.raw.rpc.mock.calls[0]!;
    expect(name).toBe("manage_property_video");
    expect(args).toMatchObject({
      requested_actor_id: actorId,
      requested_property_id: propertyId,
      requested_operation: "create",
      requested_payload: {
        provider: "YOUTUBE",
        canonicalUrl: "https://www.youtube.com/watch?v=AbCdEf12345",
        title: "Property overview",
      },
    });
    expect(f.storage.upload).not.toHaveBeenCalled();
  });
  it("rejects a cross-property target before processing a screenshot", async () => {
    const f = fixture({ mediaExists: false });
    await expect(
      managePropertyVideoWithClient(f.client, actorId, propertyId, form("replace")),
    ).rejects.toThrow(/not found on this property/);
    expect(f.raw.rpc).not.toHaveBeenCalled();
    expect(f.storage.upload).not.toHaveBeenCalled();
  });
  it("rejects overlong titles and unsafe URLs before registration", async () => {
    const f = fixture();
    const data = form();
    data.set("title", "x".repeat(121));
    await expect(
      managePropertyVideoWithClient(f.client, actorId, propertyId, data),
    ).rejects.toThrow();
    data.set("title", "Safe title");
    data.set("url", "https://youtube.com.evil.test/watch?v=AbCdEf12345");
    await expect(
      managePropertyVideoWithClient(f.client, actorId, propertyId, data),
    ).rejects.toThrow(/valid Google Drive or YouTube/);
    expect(f.raw.rpc).not.toHaveBeenCalled();
  });
  it("cleans up a normalized poster when the transactional save fails", async () => {
    const f = fixture({ rpcError: true });
    const data = form("replace");
    const bytes = await sharp({
      create: { width: 640, height: 360, channels: 3, background: "navy" },
    })
      .png()
      .toBuffer();
    data.set("poster", new File([new Uint8Array(bytes)], "poster.png", { type: "image/png" }));
    await expect(
      managePropertyVideoWithClient(f.client, actorId, propertyId, data),
    ).rejects.toThrow(/changed/);
    expect(f.storage.upload).toHaveBeenCalledOnce();
    const path = f.storage.upload.mock.calls[0]![0];
    expect(path).toMatch(new RegExp(`^properties/${propertyId}/video-posters/[a-f0-9-]+\\.webp$`));
    expect(f.storage.remove).toHaveBeenCalledWith([path]);
  });
  it("retains a committed poster if the RPC acknowledgement is lost", async () => {
    const f = fixture({ rpcError: true, posterRegistered: true });
    const data = form("replace");
    const bytes = await sharp({
      create: { width: 640, height: 360, channels: 3, background: "navy" },
    })
      .png()
      .toBuffer();
    data.set("poster", new File([new Uint8Array(bytes)], "poster.png", { type: "image/png" }));
    await expect(
      managePropertyVideoWithClient(f.client, actorId, propertyId, data),
    ).rejects.toThrow(/changed/);
    expect(f.storage.upload).toHaveBeenCalledOnce();
    expect(f.storage.remove).not.toHaveBeenCalled();
  });
});
