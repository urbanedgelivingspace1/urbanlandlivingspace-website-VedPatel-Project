import { expect, test } from "@playwright/test";

test("public responses carry the M17 browser security policy", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const headers = response.headers();
  const csp = headers["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("form-action 'self'");
  expect(csp).toContain("object-src 'none'");
  // Playwright runs the Next development runtime, whose compiler requires
  // unsafe-eval. The production exclusion is asserted by the pure config test.
  expect(csp).toContain("script-src 'self'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("geolocation=()");
  expect(headers["strict-transport-security"]).toBeUndefined();
});

test("guessed private and admin resources reveal no protected content", async ({ request }) => {
  const unpublished = await request.get("/properties/m17-guessed-unpublished-property");
  expect(unpublished.status()).toBe(404);
  expect(await unpublished.text()).not.toContain("PRIVATE_");

  const privateDocument = await request.get(
    "/api/admin/private-documents/00000000-0000-4000-8000-000000000000/download",
    { maxRedirects: 0 },
  );
  expect([302, 303, 307, 308, 401, 403]).toContain(privateDocument.status());
  expect(privateDocument.headers()["location"] ?? "").not.toContain("storage/v1/object/sign");

  for (const path of [
    "/admin/leads/00000000-0000-4000-8000-000000000000",
    "/admin/submissions/00000000-0000-4000-8000-000000000000",
    "/admin/site-visits/00000000-0000-4000-8000-000000000000",
  ]) {
    const adminRecord = await request.get(path, { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(adminRecord.status());
    expect(adminRecord.headers()["location"]).toContain("/admin/login");
  }

  const maliciousRedirect = await request.get("/properties/%2F%2Fattacker.invalid", {
    maxRedirects: 0,
  });
  expect(maliciousRedirect.status()).toBe(404);
  expect(maliciousRedirect.headers()["location"] ?? "").not.toContain("attacker.invalid");
});

test("admin sessions use HttpOnly same-site cookies", async ({ page, context }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Synthetic E2E admin was not initialized.");

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in securely" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);

  const authCookies = (await context.cookies()).filter(({ name }) => name.startsWith("sb-"));
  expect(authCookies.length).toBeGreaterThan(0);
  for (const cookie of authCookies) {
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("Lax");
    expect(cookie.secure).toBe(false);
  }

  await page.getByRole("link", { name: "Security health" }).last().click();
  await expect(page.getByRole("heading", { name: "Security health" })).toBeVisible();
  await expect(page.getByText("Credentials, private object paths")).toBeVisible();
  expect(await page.locator("body").innerText()).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
});

test("owner intake rejects cross-site, wrong-content-type and oversized requests", async ({
  request,
}) => {
  const crossSite = await request.post("/sell-your-land/submit", {
    headers: { origin: "https://attacker.invalid", "sec-fetch-site": "cross-site" },
    multipart: { name: "Attacker" },
  });
  expect(crossSite.status()).toBe(400);
  expect(await crossSite.text()).not.toContain("SUPABASE_SERVICE_ROLE_KEY");

  const wrongType = await request.post("/sell-your-land/submit", {
    headers: { origin: "http://127.0.0.1:3000" },
    data: { name: "Attacker" },
  });
  expect(wrongType.status()).toBe(415);

  const oversized = await request.post("/sell-your-land/submit", {
    headers: { origin: "http://127.0.0.1:3000" },
    multipart: {
      documents: {
        name: "oversized.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.alloc(21 * 1024 * 1024 + 1),
      },
    },
  });
  expect(oversized.status()).toBe(413);
});

test("malicious public search input is bounded and never rendered as executable markup", async ({
  page,
}) => {
  await page.goto("/properties?q=%3Cscript%3Ewindow.__m17_attack%3D1%3C%2Fscript%3E");
  await expect(page.locator("script", { hasText: "window.__m17_attack" })).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, "__m17_attack"))).toBeUndefined();
  await expect(page.getByRole("heading", { name: /land/i }).first()).toBeVisible();
});
