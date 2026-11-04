import Link from "next/link";
import { render, screen, within, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyVideos, PropertyVideoPlayer } from "@/components/media/property-videos";
import { PropertyVideoManager } from "@/components/admin/property-video-manager";

vi.mock("@/components/public/language-provider", () => ({ useLanguage: () => ({ locale: "en" }) }));
afterEach(cleanup);
const videos = [
  {
    id: "one",
    mediaType: "VIDEO",
    externalProvider: "YOUTUBE",
    externalMediaId: "AbCdEf12345",
    videoTitle: "Aerial view",
    objectPath: null,
    altText: null,
    width: null,
    height: null,
  },
  {
    id: "two",
    mediaType: "VIDEO",
    externalProvider: "GOOGLE_DRIVE",
    externalMediaId: "ABCDEFGHIJ_123",
    driveResourceKey: "0-access",
    videoTitle: "Site walk",
    objectPath: null,
    altText: null,
    width: null,
    height: null,
  },
];
describe("property video viewing", () => {
  it("does not render an empty video section", () => {
    const { container } = render(<PropertyVideos videos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
  it("contacts a provider only after play, replaces the previous player, and supports retry", async () => {
    const user = userEvent.setup();
    const { container } = render(<PropertyVideos videos={videos} />);
    expect(container.querySelector("iframe")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Load video: Aerial view" }));
    const original = screen.getByTitle("Aerial view");
    expect(original).toHaveAttribute("allowfullscreen");
    await user.click(screen.getByRole("button", { name: /Site walk/ }));
    expect(original).not.toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Load video: Site walk" }));
    expect(screen.getByTitle("Site walk")).toHaveAttribute(
      "src",
      expect.stringContaining("resourcekey=0-access"),
    );
    expect(container.querySelectorAll("iframe")).toHaveLength(1);
    const current = screen.getByTitle("Site walk");
    await user.click(screen.getByRole("button", { name: "Retry player" }));
    expect(current).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open in Google Drive" })).toHaveAttribute(
      "href",
      expect.stringContaining("resourcekey=0-access"),
    );
  });
  it("uses a branded fallback for broken posters and localizes controls", () => {
    render(
      <PropertyVideoPlayer
        provider="YOUTUBE"
        mediaId="AbCdEf12345"
        title="View"
        posterUrl="/missing.webp"
        locale="gu"
      />,
    );
    const play = screen.getByRole("button", { name: /વીડિયો લોડ કરો/ });
    fireEvent.error(play.querySelector("img")!);
    expect(within(play).getByText("UrbanEdge")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "YouTube પર ખોલો" })).toBeInTheDocument();
  });
  it("recovers the image preview when a failed poster is replaced", () => {
    const { rerender } = render(
      <PropertyVideoPlayer
        provider="YOUTUBE"
        mediaId="AbCdEf12345"
        title="View"
        posterUrl="/missing.webp"
      />,
    );
    fireEvent.error(screen.getByRole("button", { name: "Load video: View" }).querySelector("img")!);
    rerender(
      <PropertyVideoPlayer
        provider="YOUTUBE"
        mediaId="AbCdEf12345"
        title="View"
        posterUrl="/replacement.webp"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Load video: View" }).querySelector("img"),
    ).toHaveAttribute("src", "/replacement.webp");
  });
  it("fails closed for a runtime unknown provider", () => {
    const { container } = render(
      <PropertyVideoPlayer provider="OTHER" mediaId="AbCdEf12345" title="Invalid" />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
describe("admin video form", () => {
  it("preserves controlled input after a failed save and submits hidden", async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockResolvedValue({ ok: false, message: "Storage unavailable" });
    render(<PropertyVideoManager media={[]} published action={action} />);
    expect(screen.getByText(/Approving this video will add/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add Video" }));
    await user.type(
      screen.getByRole("textbox", { name: "Video URL" }),
      "https://youtu.be/AbCdEf12345",
    );
    await user.type(screen.getByRole("textbox", { name: "Video title" }), "Retained title");
    await user.click(screen.getByRole("button", { name: "Save hidden for review" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Storage unavailable");
    expect(screen.getByRole("textbox", { name: "Video title" })).toHaveValue("Retained title");
    expect(action.mock.calls[0]![1].get("operation")).toBe("create");
  });
  it("blocks navigation and refresh while a video form has unsaved changes", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Link href="/admin/properties">Leave media</Link>
        <PropertyVideoManager media={[]} published={false} action={vi.fn()} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Add Video" }));
    await user.type(screen.getByRole("textbox", { name: "Video title" }), "Unsaved title");
    expect(fireEvent.click(screen.getByRole("link", { name: "Leave media" }))).toBe(false);
    expect(screen.getByRole("alert")).toHaveTextContent("Save or cancel your video changes");
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    const safeUnload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(safeUnload);
    expect(safeUnload.defaultPrevented).toBe(false);
  });
});
