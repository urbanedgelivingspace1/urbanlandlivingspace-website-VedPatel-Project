import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SafeExternalMedia } from "@/components/media/safe-external-media";

describe("SafeExternalMedia", () => {
  it("loads an allowlisted privacy-enhanced embed only after consent", async () => {
    const user = userEvent.setup();
    render(<SafeExternalMedia provider="YOUTUBE" mediaId="AbCdEf12345" title="Drone view" />);

    expect(screen.queryByTitle("Drone view")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Load Drone view" }));
    expect(screen.getByTitle("Drone view")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/AbCdEf12345",
    );
    expect(screen.getByTitle("Drone view")).toHaveAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-presentation",
    );
  });

  it("renders nothing for an invalid media ID", () => {
    const { container } = render(
      <SafeExternalMedia provider="YOUTUBE" mediaId={'bad"><script>'} title="Unsafe" />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
