import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OfficeMap } from "@/components/public/office-map";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { OFFICIAL_OFFICE_MAP_EMBED_URL } from "@/lib/config/public-business";

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ refresh: vi.fn() }),
}));

const config = {
  phone: "+919408663544",
  whatsappNumber: "+919408663544",
  email: null,
  officeAddress: "Randesan, Gandhinagar",
  livingSpaceUrl: null,
};

afterEach(() => {
  pathname = "/";
  document.body.style.overflow = "";
});

describe("contact and navigation production fixes", () => {
  it("links priority land, guide, company and location pages from the global navigation", () => {
    const { unmount } = render(<SiteHeader config={config} />);
    for (const href of [
      "/properties",
      "/agricultural-land",
      "/na-land",
      "/industrial-land",
      "/locations/ahmedabad",
      "/locations/gandhinagar",
      "/guides",
      "/about",
      "/contact",
      "/sell-your-land",
    ])
      expect(document.querySelector(`a[href="${href}"]`)).toBeInTheDocument();

    unmount();
    render(<SiteFooter config={config} locale="en" />);
    for (const href of [
      "/properties",
      "/agricultural-land",
      "/na-land",
      "/industrial-land",
      "/locations/ahmedabad",
      "/locations/gandhinagar",
      "/guides",
      "/about",
      "/contact",
      "/sell-your-land",
    ])
      expect(document.querySelector(`a[href="${href}"]`)).toBeInTheDocument();
  });

  it("renders the approved interactive UrbanEdge Google Maps embed", () => {
    render(<OfficeMap address={config.officeAddress} locale="en" />);

    const map = screen.getByTitle("UrbanEdge Living Space office location on Google Maps");
    expect(map).toHaveAttribute("src", OFFICIAL_OFFICE_MAP_EMBED_URL);
    expect(map).toHaveAttribute("loading", "lazy");
    expect(map).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    expect(map).toHaveAttribute("allowfullscreen");
    expect(screen.queryByRole("link", { name: "Open in Google Maps" })).not.toBeInTheDocument();
  });

  it("closes the mobile drawer, restores scrolling, and closes the desktop Land Types menu", async () => {
    const view = render(<SiteHeader config={config} />);

    await userEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeVisible();
    expect(document.body.style.overflow).toBe("hidden");

    const mobileAgriculturalLink = screen
      .getAllByRole("link", { name: "Agricultural Land" })
      .find((link) => link.classList.contains("mobile-nav-link"));
    expect(mobileAgriculturalLink).toBeDefined();
    fireEvent.click(mobileAgriculturalLink!);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe("");
    });

    const landTypesSummary = screen.getByText("Land Types");
    const details = landTypesSummary.closest("details")!;
    details.setAttribute("open", "");
    const desktopAgriculturalLink = [...details.querySelectorAll("a")].find(
      (link) => link.textContent === "Agricultural Land",
    )!;
    fireEvent.click(desktopAgriculturalLink);
    expect(details).not.toHaveAttribute("open");

    await userEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    pathname = "/na-land";
    view.rerender(<SiteHeader config={config} />);
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument(),
    );
  });

  it("closes desktop browse menus when the user clicks elsewhere", () => {
    const { container } = render(<SiteHeader config={config} />);

    const [landTypesMenu, locationsMenu] = [
      ...container.querySelectorAll<HTMLDetailsElement>(".nav-menu"),
    ];
    expect(landTypesMenu).toBeDefined();
    expect(locationsMenu).toBeDefined();

    landTypesMenu!.setAttribute("open", "");
    fireEvent.pointerDown(document.body);
    expect(landTypesMenu).not.toHaveAttribute("open");

    landTypesMenu!.setAttribute("open", "");
    locationsMenu!.setAttribute("open", "");
    fireEvent.pointerDown(locationsMenu!.querySelector("summary")!);
    expect(landTypesMenu).not.toHaveAttribute("open");
    expect(locationsMenu).toHaveAttribute("open");

    fireEvent.pointerDown(document.body);
    expect(locationsMenu).not.toHaveAttribute("open");
  });

  it("uses a square, decorative vector WhatsApp brand glyph", () => {
    const { container } = render(<WhatsAppIcon size={32} />);
    const icon = container.querySelector("svg")!;
    expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
    expect(icon).toHaveAttribute("width", "32");
    expect(icon).toHaveAttribute("height", "32");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon.querySelector("path")?.getAttribute("d")?.length).toBeGreaterThan(900);
  });
});
