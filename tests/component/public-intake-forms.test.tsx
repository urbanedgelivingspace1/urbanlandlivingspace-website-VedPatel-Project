import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BuyerRequirementForm,
  GeneralContactForm,
  PropertyInquiryForm,
  SiteVisitRequestForm,
} from "@/components/public/intake-forms";
import type { PublicIntakeFormState } from "@/features/intake/domain/contracts";

const idempotencyKey = "93000000-0000-4000-8000-000000000099";
const idle: PublicIntakeFormState = { status: "idle", message: "" };

afterEach(cleanup);

describe("M13 public intake forms", () => {
  it("submits a compact property inquiry and announces safe success", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async () => ({
      status: "success" as const,
      message: "Your inquiry has been received.",
      propertyReference: "UE-LS-000123",
    }));
    render(<PropertyInquiryForm action={action} idempotencyKey={idempotencyKey} />);
    await user.type(screen.getByLabelText("Name"), "Synthetic Visitor");
    await user.type(screen.getByLabelText("Mobile number"), "9876543210");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Send property inquiry" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Your inquiry has been received");
    expect(screen.getByRole("status")).toHaveTextContent("UE-LS-000123");
    expect(screen.queryByText(/lead/i)).not.toBeInTheDocument();
  });

  it("disables the submit control and announces pending work", async () => {
    const user = userEvent.setup();
    let finish!: (state: PublicIntakeFormState) => void;
    const action = vi.fn(
      () =>
        new Promise<PublicIntakeFormState>((resolve) => {
          finish = resolve;
        }),
    );
    render(<PropertyInquiryForm action={action} idempotencyKey={idempotencyKey} />);
    await user.type(screen.getByLabelText("Name"), "Pending Visitor");
    await user.type(screen.getByLabelText("Mobile number"), "9876543210");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Send property inquiry" }));
    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
    finish({ status: "success", message: "Received." });
    expect(await screen.findByRole("status")).toHaveTextContent("Received");
  });

  it("links validation errors to fields, focuses the first error, and preserves input", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async () => ({
      status: "error" as const,
      message: "Check the highlighted fields.",
      errors: { phone: ["Enter a valid mobile number."] },
      values: { name: "Preserved Visitor", phone: "123", consent: "on" },
    }));
    render(<PropertyInquiryForm action={action} idempotencyKey={idempotencyKey} />);
    await user.type(screen.getByLabelText("Name"), "Preserved Visitor");
    await user.type(screen.getByLabelText("Mobile number"), "123");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Send property inquiry" }));
    const phone = await screen.findByRole("textbox", { name: "Mobile number" });
    await waitFor(() => expect(phone).toHaveFocus());
    expect(phone).toHaveAttribute("aria-describedby", "phone-error");
    expect(screen.getByLabelText("Name")).toHaveValue("Preserved Visitor");
  });

  it("prefills the reusable buyer requirement taxonomy", () => {
    render(
      <BuyerRequirementForm
        action={vi.fn(async () => idle)}
        idempotencyKey={idempotencyKey}
        prefill={{
          sourceContext: "SEARCH_ZERO",
          transaction: "LEASE",
          category: "INDUSTRIAL",
          districtId: "district-1",
          minimumArea: 2,
          maximumArea: 5,
          areaUnitId: "unit-1",
        }}
        districts={[{ value: "district-1", label: "Ahmedabad" }]}
        subdistricts={[{ value: "taluka-1", label: "Ahmedabad — Sanand" }]}
        places={[{ value: "place-1", label: "Sanand — Synthetic village" }]}
        units={[{ value: "unit-1", label: "Acre (ac)" }]}
      />,
    );
    expect(screen.getByLabelText("Transaction")).toHaveValue("LEASE");
    expect(screen.getByLabelText("Land category")).toHaveValue("INDUSTRIAL");
    expect(screen.getByLabelText("District")).toHaveValue("district-1");
    expect(screen.getByLabelText("Minimum area")).toHaveValue(2);
    expect(screen.getByRole("group", { name: "Contact" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Requirement" })).toBeVisible();
  });

  it("makes the visit-request boundary explicit and keyboard-submittable", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async () => ({ status: "error" as const, message: "Synthetic stop." }));
    render(
      <SiteVisitRequestForm
        action={action}
        idempotencyKey={idempotencyKey}
        minimumDate="2099-01-01"
      />,
    );
    expect(screen.getByText(/not an automatic booking/i)).toBeVisible();
    expect(screen.getByLabelText("Preferred date")).toHaveAttribute("min", "2099-01-01");
    await user.type(screen.getByLabelText("Name"), "Keyboard Visitor");
    await user.type(screen.getByLabelText("Mobile number"), "9876543210");
    await user.type(screen.getByLabelText("Preferred date"), "2099-01-02");
    await user.click(screen.getByRole("checkbox"));
    screen.getByRole("button", { name: "Request site visit" }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent("Synthetic stop");
  });

  it("renders a short general contact flow and replaces it with confirmation", async () => {
    const user = userEvent.setup();
    render(
      <GeneralContactForm
        action={vi.fn(async () => ({ status: "success" as const, message: "Message received." }))}
        idempotencyKey={idempotencyKey}
      />,
    );
    await user.type(screen.getByLabelText("Name"), "Contact Visitor");
    await user.type(screen.getByLabelText("Mobile number"), "9876543210");
    await user.type(screen.getByLabelText("Message"), "Please explain your service.");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Message received");
    expect(screen.queryByRole("button", { name: "Send message" })).not.toBeInTheDocument();
  });

  it("renders the configured Turnstile widget without exposing a secret", () => {
    const { container } = render(
      <PropertyInquiryForm
        action={vi.fn(async () => idle)}
        idempotencyKey={idempotencyKey}
        turnstileSiteKey="public-site-key"
      />,
    );
    const widget = container.querySelector(".cf-turnstile");
    expect(widget).toHaveAttribute("data-sitekey", "public-site-key");
    expect(widget).toHaveAttribute("data-action", "property_inquiry");
    expect(container.innerHTML).not.toContain("TURNSTILE_SECRET_KEY");
  });
});
