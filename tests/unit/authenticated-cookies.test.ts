// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  getAll: vi.fn(),
  set: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

let capturedClientConfig:
  | {
      cookies: {
        getAll: () => unknown;
        setAll: (
          values: Array<{ name: string; value: string; options?: Record<string, unknown> }>,
        ) => void;
      };
    }
  | undefined;

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn((_url, _key, options) => {
    capturedClientConfig = options;
    return {
      auth: {},
    };
  }),
}));

vi.mock("@/config/public-environment-schema", () => ({
  getPublicEnvironment: () => ({
    NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "synthetic-anon-key",
  }),
}));

describe("authenticated server client cookie security behavior", () => {
  const originalAppEnv = process.env.APP_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedClientConfig = undefined;
    mockCookieStore.getAll.mockReturnValue([]);
  });

  afterEach(() => {
    if (originalAppEnv !== undefined) {
      process.env.APP_ENV = originalAppEnv;
    } else {
      delete process.env.APP_ENV;
    }
  });

  it("sets Secure=true when APP_ENV is preview", async () => {
    process.env.APP_ENV = "preview";
    const { createAuthenticatedServerClient } = await import("@/server/supabase/authenticated");
    await createAuthenticatedServerClient();

    expect(capturedClientConfig).toBeDefined();

    capturedClientConfig?.cookies.setAll([
      {
        name: "sb-auth-token",
        value: "preview-token-value",
        options: { path: "/", maxAge: 3600 },
      },
    ]);

    expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "sb-auth-token",
      "preview-token-value",
      expect.objectContaining({
        path: "/",
        maxAge: 3600,
        httpOnly: true,
        sameSite: "lax",
        secure: true,
      }),
    );
  });

  it("sets Secure=true when APP_ENV is production", async () => {
    process.env.APP_ENV = "production";
    const { createAuthenticatedServerClient } = await import("@/server/supabase/authenticated");
    await createAuthenticatedServerClient();

    expect(capturedClientConfig).toBeDefined();

    capturedClientConfig?.cookies.setAll([
      {
        name: "sb-auth-token",
        value: "production-token-value",
        options: { path: "/" },
      },
    ]);

    expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "sb-auth-token",
      "production-token-value",
      expect.objectContaining({
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: true,
      }),
    );
  });

  it("sets Secure=false for local development", async () => {
    process.env.APP_ENV = "local";
    const { createAuthenticatedServerClient } = await import("@/server/supabase/authenticated");
    await createAuthenticatedServerClient();

    expect(capturedClientConfig).toBeDefined();

    capturedClientConfig?.cookies.setAll([
      {
        name: "sb-auth-token",
        value: "local-token-value",
        options: { path: "/" },
      },
    ]);

    expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "sb-auth-token",
      "local-token-value",
      expect.objectContaining({
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      }),
    );
  });

  it("sets Secure=false for test environment", async () => {
    process.env.APP_ENV = "test";
    const { createAuthenticatedServerClient } = await import("@/server/supabase/authenticated");
    await createAuthenticatedServerClient();

    expect(capturedClientConfig).toBeDefined();

    capturedClientConfig?.cookies.setAll([
      {
        name: "sb-auth-token",
        value: "test-token-value",
        options: { path: "/" },
      },
    ]);

    expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "sb-auth-token",
      "test-token-value",
      expect.objectContaining({
        secure: false,
      }),
    );
  });

  it("sets Secure=false when APP_ENV is undefined or unknown", async () => {
    delete process.env.APP_ENV;
    const { createAuthenticatedServerClient } = await import("@/server/supabase/authenticated");
    await createAuthenticatedServerClient();

    expect(capturedClientConfig).toBeDefined();

    capturedClientConfig?.cookies.setAll([
      {
        name: "sb-auth-token",
        value: "unknown-token-value",
        options: { path: "/" },
      },
    ]);

    expect(mockCookieStore.set).toHaveBeenCalledTimes(1);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "sb-auth-token",
      "unknown-token-value",
      expect.objectContaining({
        secure: false,
      }),
    );
  });

  it("delegates getAll to cookieStore.getAll", async () => {
    mockCookieStore.getAll.mockReturnValueOnce([{ name: "session", value: "active" }]);
    const { createAuthenticatedServerClient } = await import("@/server/supabase/authenticated");
    await createAuthenticatedServerClient();

    const result = capturedClientConfig?.cookies.getAll();
    expect(mockCookieStore.getAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ name: "session", value: "active" }]);
  });

  it("catches cookieStore.set errors gracefully without throwing", async () => {
    mockCookieStore.set.mockImplementationOnce(() => {
      throw new Error("Cookies can only be modified in a Server Action or Route Handler.");
    });

    const { createAuthenticatedServerClient } = await import("@/server/supabase/authenticated");
    await createAuthenticatedServerClient();

    expect(() => {
      capturedClientConfig?.cookies.setAll([
        {
          name: "sb-auth-token",
          value: "error-token-value",
          options: { path: "/" },
        },
      ]);
    }).not.toThrow();
  });
});
