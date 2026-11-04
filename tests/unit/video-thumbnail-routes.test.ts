// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { authorize, query } = vi.hoisted(() => ({
  authorize: vi.fn(),
  query: { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() },
}));
vi.mock("@/server/auth/authorization", () => ({ requireActiveAdmin: authorize }));
vi.mock("@/server/supabase/public", () => ({
  createPublicServerClient: () => ({
    from: (table: string) => {
      expect(table).toBe("public_property_media");
      return query;
    },
  }),
}));

import { POST } from "@/app/api/admin/video-thumbnails/route";
import { GET } from "@/app/api/public/video-thumbnails/[id]/route";

const id = "30000000-0000-4000-8000-000000000001";
const fileId = "ABCDEFGHIJ_123";
const externalUrl = `https://drive.google.com/file/d/${fileId}/view?resourcekey=0-access`;
const publicRequest = (file = fileId) =>
  GET(new Request(`https://example.test/api/public/video-thumbnails/${id}?file=${file}`), {
    params: Promise.resolve({ id }),
  });
const adminRequest = () =>
  POST(
    new Request("https://example.test/api/admin/video-thumbnails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: externalUrl }),
    }),
  );

const upstream = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NEXT_PUBLIC_PROPERTY_VIDEOS_ENABLED", "true");
  vi.stubGlobal("fetch", upstream);
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Drive video thumbnail routes", () => {
  it("serves approved Drive thumbnails even with admin video management disabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_PROPERTY_VIDEOS_ENABLED", "false");
    query.maybeSingle.mockResolvedValue({ data: { external_url: externalUrl }, error: null });
    const googleImage = `https://lh3.googleusercontent.com/d/${fileId}=w960`;
    upstream
      .mockResolvedValueOnce(Response.redirect(googleImage))
      .mockResolvedValueOnce(
        new Response("image bytes", { headers: { "Content-Type": "image/jpeg" } }),
      );

    const response = await publicRequest();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(await response.text()).toBe("image bytes");
    expect(query.eq).toHaveBeenCalledWith("id", id);
    expect(query.eq).toHaveBeenCalledWith("media_type", "VIDEO");
    expect(query.eq).toHaveBeenCalledWith("external_provider", "GOOGLE_DRIVE");
    expect(String(upstream.mock.calls[0]?.[0])).toBe(
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w960&resourcekey=0-access`,
    );
    expect(String(upstream.mock.calls[1]?.[0])).toBe(googleImage);
  });

  it("rejects hidden videos and file IDs other than the current approved source", async () => {
    query.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    expect((await publicRequest()).status).toBe(404);
    query.maybeSingle.mockResolvedValueOnce({ data: { external_url: externalUrl }, error: null });
    expect((await publicRequest("pending_file_123")).status).toBe(404);
    expect(upstream).not.toHaveBeenCalled();
  });

  it("requires an active admin to preview an unsaved link", async () => {
    authorize.mockRejectedValueOnce(new Error("Unauthorized"));
    expect((await adminRequest()).status).toBe(403);
    expect(upstream).not.toHaveBeenCalled();

    authorize.mockResolvedValueOnce({});
    upstream.mockResolvedValueOnce(
      new Response("image bytes", { headers: { "Content-Type": "image/jpeg" } }),
    );
    expect((await adminRequest()).status).toBe(200);
  });

  it("does not follow a sign-in redirect or serve an HTML page as a thumbnail", async () => {
    authorize.mockResolvedValue({});
    upstream.mockResolvedValueOnce(Response.redirect("https://accounts.google.com/signin"));
    expect((await adminRequest()).status).toBe(404);
    expect(upstream).toHaveBeenCalledTimes(1);
    upstream.mockResolvedValueOnce(
      new Response("<html>Permission required</html>", {
        headers: { "Content-Type": "text/html" },
      }),
    );
    expect((await adminRequest()).status).toBe(404);
  });
});
