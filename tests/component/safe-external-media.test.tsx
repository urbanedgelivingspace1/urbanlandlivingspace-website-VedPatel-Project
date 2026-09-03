import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SafeExternalMedia } from "@/components/media/safe-external-media";

describe("SafeExternalMedia", () => {
  it("derives an allowlisted privacy-enhanced embed URL from provider metadata", () => {
    render(<SafeExternalMedia provider="YOUTUBE" mediaId="AbCdEf12345" title="Drone view" />);
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
