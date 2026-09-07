// @vitest-environment node

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockCreateServerClient = vi.fn(() => ({
  auth: {
    getUser: mockGetUser,
  },
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => mockCreateServerClient(),
}));

vi.mock("@/config/public-environment-schema", () => ({
  getPublicEnvironment: () => ({
    NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "synthetic-anon-key",
  }),
}));

describe("admin proxy / middleware request handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  it("bypasses getUser on POST /admin/login without consuming body or edge delays", async () => {
    const { proxy } = await import("@/proxy");
    const request = new NextRequest("http://localhost:3000/admin/login", {
      method: "POST",
      headers: { "content-type": "multipart/form-data" },
    });

    const response = await proxy(request);
    expect(response).toBeDefined();
    expect(mockCreateServerClient).not.toHaveBeenCalled();
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("bypasses getUser when next-action header is present on any admin route", async () => {
    const { proxy } = await import("@/proxy");
    const request = new NextRequest("http://localhost:3000/admin/properties", {
      method: "POST",
      headers: {
        "next-action": "40cf2bd4602a80061b083ba296fe771c80636c3232",
      },
    });

    const response = await proxy(request);
    expect(response).toBeDefined();
    expect(mockCreateServerClient).not.toHaveBeenCalled();
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("refreshes user session and sets private no-store headers on normal GET admin requests", async () => {
    const { proxy } = await import("@/proxy");
    const request = new NextRequest("http://localhost:3000/admin/dashboard", {
      method: "GET",
    });

    const response = await proxy(request);
    expect(response).toBeDefined();
    expect(mockCreateServerClient).toHaveBeenCalled();
    expect(mockGetUser).toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("does not bypass non-action non-login POST requests", async () => {
    const { proxy } = await import("@/proxy");
    const request = new NextRequest("http://localhost:3000/admin/properties", {
      method: "POST",
    });

    const response = await proxy(request);
    expect(response).toBeDefined();
    expect(mockCreateServerClient).toHaveBeenCalled();
    expect(mockGetUser).toHaveBeenCalled();
  });
});
