import Link from "next/link";
import { render, screen, within, fireEvent, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyVideos, PropertyVideoPlayer } from "@/components/media/property-videos";
import { PropertyVideoManager } from "@/components/admin/property-video-manager";

vi.mock("@/components/public/language-provider", () => ({ useLanguage: () => ({ locale: "en" }) }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
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
  it("uses the selected video's thumbnail and loads the player only on interaction", async () => {
    const user = userEvent.setup();
    const { container } = render(<PropertyVideos videos={videos} />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://i.ytimg.com/vi/AbCdEf12345/hqdefault.jpg",
    );
    await user.click(screen.getByRole("button", { name: "Load video: Aerial view" }));
    const original = screen.getByTitle("Aerial view");
    expect(original).toHaveAttribute("allowfullscreen");
    await user.click(screen.getByRole("button", { name: /Site walk/ }));
    expect(original).not.toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/api/public/video-thumbnails/two?file=ABCDEFGHIJ_123",
    );
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
  it("uses only YouTube images for the public video thumbnail, then shows the placeholder", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.supabase.co");
    render(
      <PropertyVideos
        videos={[{ ...videos[0]!, videoPosterPath: "properties/demo/legacy.webp" }]}
        coverPath="properties/demo/cover.webp"
      />,
    );
    const play = screen.getByRole("button", { name: "Load video: Aerial view" });
    for (const size of ["hqdefault", "mqdefault", "default"]) {
      const img = play.querySelector("img")!;
      expect(img).toHaveAttribute("src", `https://i.ytimg.com/vi/AbCdEf12345/${size}.jpg`);
      fireEvent.error(img);
    }
    expect(play.querySelector("img")).toBeNull();
    expect(within(play).getByText("UrbanEdge")).toBeInTheDocument();
  });
  it("keeps legacy poster and cover fallbacks in the admin player", () => {
    render(
      <PropertyVideoPlayer
        provider="YOUTUBE"
        mediaId="AbCdEf12345"
        title="View"
        posterUrl="/missing.webp"
        coverUrl="/cover.webp"
        locale="gu"
      />,
    );
    const play = screen.getByRole("button", { name: /વીડિયો લોડ કરો/ });
    for (let attempt = 0; attempt < 3; attempt++) fireEvent.error(play.querySelector("img")!);
    expect(play.querySelector("img")).toHaveAttribute("src", "/missing.webp");
    fireEvent.error(play.querySelector("img")!);
    expect(play.querySelector("img")).toHaveAttribute("src", "/cover.webp");
    fireEvent.error(play.querySelector("img")!);
    expect(within(play).getByText("UrbanEdge")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "YouTube પર ખોલો" })).toBeInTheDocument();
  });
  it("recovers the image preview when a failed poster is replaced", () => {
    const { rerender } = render(
      <PropertyVideoPlayer
        provider="VIMEO"
        mediaId="123456"
        title="View"
        posterUrl="/missing.webp"
      />,
    );
    fireEvent.error(screen.getByRole("button", { name: "Load video: View" }).querySelector("img")!);
    rerender(
      <PropertyVideoPlayer
        provider="VIMEO"
        mediaId="123456"
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
  it("uses the admin Drive endpoint and discards the thumbnail when the source changes", async () => {
    const revoke = vi.fn();
    vi.stubGlobal(
      "URL",
      class extends URL {
        static override createObjectURL = () => "blob:drive-preview";
        static override revokeObjectURL = revoke;
      },
    );
    const fetchThumbnail = vi
      .fn()
      .mockResolvedValue(new Response("preview", { headers: { "Content-Type": "image/jpeg" } }));
    vi.stubGlobal("fetch", fetchThumbnail);
    render(
      <PropertyVideoManager media={[]} published={false} showAddFormWhenEmpty action={vi.fn()} />,
    );
    const url = screen.getByRole("textbox", { name: "Video URL" });
    const driveUrl = "https://drive.google.com/file/d/ABCDEFGHIJ_123/view?resourcekey=0-access";
    fireEvent.change(url, { target: { value: driveUrl } });
    const preview = () => screen.getByRole("button", { name: /Load video:/ }).querySelector("img");
    await waitFor(() => expect(preview()).toHaveAttribute("src", "blob:drive-preview"));
    expect(fetchThumbnail).toHaveBeenCalledWith(
      "/api/admin/video-thumbnails",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ url: driveUrl }) }),
    );

    fireEvent.change(url, { target: { value: "https://youtu.be/AbCdEf12345" } });
    expect(preview()).toHaveAttribute("src", "https://i.ytimg.com/vi/AbCdEf12345/hqdefault.jpg");
    expect(revoke).toHaveBeenCalledWith("blob:drive-preview");
  });

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
    await user.type(screen.getByRole("textbox", { name: "Description (optional)" }), "Site walk");
    await user.click(screen.getByRole("button", { name: "Save hidden for review" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Storage unavailable");
    expect(screen.getByRole("textbox", { name: "Video title" })).toHaveValue("Retained title");
    expect(action.mock.calls[0]![1].get("operation")).toBe("create");
    expect(action.mock.calls[0]![1].get("description")).toBe("Site walk");
    expect([...action.mock.calls[0]![1].keys()]).toEqual([
      "operation",
      "url",
      "title",
      "description",
    ]);
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
