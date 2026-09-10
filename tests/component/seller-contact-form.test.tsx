import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SellerContactForm } from "@/components/public/seller-contact-form";

vi.mock("@/app/(public)/intake-actions", () => ({
  submitSellerLeadAction: vi.fn(),
}));

afterEach(cleanup);

describe("SellerContactForm", () => {
  it("renders a single, short seller contact form with security controls", () => {
    render(
      <SellerContactForm
        idempotencyKey="seller-intake-key"
        districts={[{ value: "district-1", label: "Ahmedabad" }]}
        turnstileSiteKey="turnstile-site-key"
        action={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Full Name")).toBeRequired();
    expect(screen.getByLabelText("Mobile Number")).toBeRequired();
    expect(screen.getByLabelText("Email Address")).not.toBeRequired();
    expect(screen.getByLabelText("Intent")).toHaveValue("BUY");
    expect(screen.getByLabelText("Land type (optional)")).not.toBeRequired();
    expect(screen.getByLabelText("Location (optional)")).not.toBeRequired();
    expect(screen.getByLabelText("Message (optional)")).not.toBeRequired();
    expect(screen.getByRole("button", { name: "Contact Me" })).toBeEnabled();

    const form = screen.getByRole("button", { name: "Contact Me" }).closest("form");
    expect(form).not.toBeNull();
    expect(form?.querySelector('input[name="idempotencyKey"]')).toHaveValue("seller-intake-key");
    expect(form?.querySelector('input[name="website"]')).toBeInTheDocument();
    expect(form?.querySelector(".cf-turnstile")).toHaveAttribute("data-action", "seller_lead");
    expect(form?.querySelector('[name="surveyNumber"]')).not.toBeInTheDocument();
    expect(form?.querySelector('input[type="file"]')).not.toBeInTheDocument();
  });
});
