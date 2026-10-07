import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PropertyMediaManager } from "@/components/admin/property-media-manager";
import type {
  AdminMediaAssetDto,
  BatchPhotoUploadResult,
  MediaFormState,
} from "@/features/media/domain/contracts";

const batch = vi.fn<
  (state: BatchPhotoUploadResult, data: FormData) => Promise<BatchPhotoUploadResult>
>(async () => ({
  ok: true,
  uploaded: 2,
  results: [
    { fileName: "front.jpg", ok: true, message: "Added to the gallery." },
    { fileName: "road.jpg", ok: true, message: "Added to the gallery." },
  ],
  message: "2 photos added to the gallery.",
}));
const stateful = vi.fn<(state: MediaFormState, data: FormData) => Promise<MediaFormState>>(
  async () => ({ ok: true, message: "Brochure connected." }),
);
const simple = vi.fn(async () => undefined);
const baseProps = {
  propertyId: "20000000-0000-4000-8000-000000000001",
  media: [],
  activeMediaIds: [],
  uploadImagesAction: batch,
  saveBrochureAction: stateful,
  updateMetadataAction: simple,
  reorderAction: simple,
  setCoverAction: simple,
  archiveMediaAction: simple,
};

const image: AdminMediaAssetDto = {
  id: "30000000-0000-4000-8000-000000000001",
  propertyId: baseProps.propertyId,
  mediaType: "IMAGE",
  mediaSubtype: null,
  sourceType: "SUPABASE_UPLOAD",
  storageBucket: "property-media-public",
  objectPath: "properties/synthetic/media/image.webp",
  externalUrl: null,
  externalProvider: null,
  externalMediaId: null,
  mimeType: "image/webp",
  fileSizeBytes: 1234,
  width: 1600,
  height: 1067,
  altText: "Synthetic field - property photo 1",
  caption: null,
  visibility: "PUBLIC",
  processingStatus: "APPROVED",
  isCover: false,
  sortOrder: 10,
  approvedAt: "2026-09-03T00:00:00.000Z",
  archivedAt: null,
  previewUrl: "https://example.invalid/synthetic.webp",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PropertyMediaManager", () => {
  it("renders the simplified multiple-photo and Drive brochure workflow", () => {
    render(<PropertyMediaManager {...baseProps} />);
    const input = screen.getByLabelText("Choose property photos");
    expect(input).toHaveAttribute("multiple");
    expect(input).toHaveAttribute("accept", "image/jpeg,image/png,image/webp");
    expect(screen.getByText("Drag photos here")).toBeVisible();
    expect(screen.getByText(/No photos added yet/)).toBeVisible();
    expect(screen.getByRole("heading", { name: "Property Brochure" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Open Google Drive/ })).toHaveAttribute(
      "href",
      "https://drive.google.com/",
    );
    expect(
      screen.queryByText(/Private Documents|Add Documents|Document Category|Private evidence/),
    ).toBeNull();
    expect(screen.queryByText(/Drop documents here/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Upload files" })).not.toBeInTheDocument();
    expect(screen.queryByText(/External media|Approve \/ promote/)).toBeNull();
  });

  it("shows selected files and submits them in one batch", async () => {
    render(<PropertyMediaManager {...baseProps} />);
    const input = screen.getByLabelText("Choose property photos");
    const files = [
      new File(["front"], "front.jpg", { type: "image/jpeg" }),
      new File(["road"], "road.jpg", { type: "image/jpeg" }),
    ];
    fireEvent.change(input, { target: { files } });
    expect(screen.getByText("2 photos selected")).toBeVisible();
    expect(screen.getByText("front.jpg")).toBeVisible();
    expect(screen.getByText("road.jpg")).toBeVisible();
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(batch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/2 photos added/));
  });

  it("shows a visual gallery with simple cover, order, remove, and optional detail controls", () => {
    render(
      <PropertyMediaManager
        {...baseProps}
        media={[
          image,
          {
            ...image,
            id: "30000000-0000-4000-8000-000000000002",
            sortOrder: 20,
            isCover: true,
          },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Use Photo 1 as Cover" })).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Move Later" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Move Earlier" })).toBeVisible();
    expect(screen.getAllByText("Edit photo details")).toHaveLength(2);
    expect(screen.getByText("✓ Current Cover")).toBeVisible();
    expect(screen.getByText("Current cover photo")).toBeVisible();
    expect(screen.queryByText("APPROVED")).not.toBeInTheDocument();
    expect(screen.queryByText("PUBLIC")).not.toBeInTheDocument();
  });

  it("lets staff choose a staged photo as cover while processing finishes automatically", () => {
    render(
      <PropertyMediaManager
        {...baseProps}
        media={[{ ...image, processingStatus: "READY", visibility: "ADMIN_ONLY" }]}
      />,
    );
    expect(screen.getByText("Preparing this photo for the listing…")).toBeVisible();
    expect(screen.queryByRole("button", { name: /Approve|Add to Listing/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Use Photo 1 as Cover" })).toBeVisible();
    expect(screen.queryByText("READY")).not.toBeInTheDocument();
    expect(screen.queryByText("ADMIN_ONLY")).not.toBeInTheDocument();
  });

  it("shows connected Drive brochure controls", () => {
    render(
      <PropertyMediaManager
        {...baseProps}
        media={[
          {
            ...image,
            id: "30000000-0000-4000-8000-000000000003",
            mediaType: "BROCHURE",
            storageBucket: null,
            objectPath: null,
            mimeType: null,
            fileSizeBytes: null,
            width: null,
            height: null,
            altText: null,
            externalUrl: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_12345/view",
            externalProvider: "GOOGLE_DRIVE",
            externalMediaId: "1AbCdEfGhIjKlMnOpQrStUvWxYz_12345",
            isCover: false,
          },
        ]}
      />,
    );
    const brochure = screen.getByRole("heading", { name: "Property Brochure" }).closest("section");
    expect(brochure).not.toBeNull();
    expect(within(brochure!).getByText("✓ Brochure connected")).toBeVisible();
    expect(
      within(brochure!).getByRole("link", { name: "Test / Download Brochure" }),
    ).toHaveAttribute(
      "href",
      "https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQrStUvWxYz_12345",
    );
    expect(within(brochure!).getByRole("button", { name: "Replace Brochure" })).toBeVisible();
    expect(within(brochure!).getByRole("button", { name: "Remove Brochure" })).toBeVisible();
  });

  it("prevents advancing while a photo batch is pending", async () => {
    let finishUpload: ((value: Awaited<ReturnType<typeof batch>>) => void) | undefined;
    const pendingUpload = vi.fn(
      () =>
        new Promise<Awaited<ReturnType<typeof batch>>>((resolve) => {
          finishUpload = resolve;
        }),
    );
    render(<PropertyMediaManager {...baseProps} uploadImagesAction={pendingUpload} />);
    const input = screen.getByLabelText("Choose property photos");
    fireEvent.change(input, {
      target: { files: [new File(["front"], "front.jpg", { type: "image/jpeg" })] },
    });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Save & Next →" })).toBeDisabled(),
    );
    expect(screen.getByRole("status")).toHaveTextContent(/current upload or media change/i);

    finishUpload?.({ ok: true, uploaded: 1, results: [], message: "1 photo added." });
    await waitFor(() => expect(screen.getByRole("link", { name: "Save & Next →" })).toBeVisible());
  });
});
