import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PropertyMediaManager } from "@/components/admin/property-media-manager";
import type { AdminMediaAssetDto } from "@/features/media/domain/contracts";

const stateful = vi.fn(async () => ({ ok: true, message: "done" }));
const simple = vi.fn(async () => undefined);
const baseProps = {
  propertyId: "20000000-0000-4000-8000-000000000001",
  media: [],
  documents: [],
  uploadImageAction: stateful,
  uploadBrochureAction: stateful,
  uploadPrivateDocumentAction: stateful,
  addExternalMediaAction: stateful,
  updateMetadataAction: simple,
  reorderAction: simple,
  setCoverAction: simple,
  approveAction: simple,
  archiveMediaAction: simple,
  restoreMediaAction: simple,
  archiveDocumentAction: simple,
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
  altText: "Synthetic field",
  caption: null,
  visibility: "PUBLIC",
  processingStatus: "APPROVED",
  isCover: false,
  sortOrder: 10,
  approvedAt: "2026-09-03T00:00:00.000Z",
  archivedAt: null,
  previewUrl: "https://example.invalid/synthetic.webp",
};

describe("PropertyMediaManager", () => {
  it("renders upload boundaries and honest empty/recovery states", () => {
    render(<PropertyMediaManager {...baseProps} />);
    expect(screen.getByRole("heading", { name: "Upload gallery image" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Upload public brochure candidate" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Upload private evidence" })).toBeVisible();
    expect(screen.getByText(/No media yet/)).toBeVisible();
    expect(screen.getByText(/No private documents stored/)).toBeVisible();
    expect(screen.getByText(/Property publication remains unavailable until M9/)).toBeVisible();
  });

  it("shows controlled approval, cover, ordering, metadata and archive actions", () => {
    render(
      <PropertyMediaManager
        {...baseProps}
        media={[
          image,
          {
            ...image,
            id: "30000000-0000-4000-8000-000000000002",
            sortOrder: 20,
            visibility: "ADMIN_ONLY",
            processingStatus: "READY",
            approvedAt: null,
          },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Set cover" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Approve / promote" })).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Save metadata" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Archive" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Move down" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Move up" })).toBeVisible();
  });
});
