"use client";

import { useId, useState } from "react";

import type { PublicMediaDto } from "@/features/properties/domain/contracts";
import { buildPublicBrochureUrl } from "@/lib/media/public-media-url";

export function PropertyBrochureLink({ brochure }: Readonly<{ brochure: PublicMediaDto }>) {
  const url = buildPublicBrochureUrl(brochure);
  const frameName = `brochure-download-${useId().replaceAll(":", "")}`;
  const [downloadRequested, setDownloadRequested] = useState(false);
  if (!url) return null;

  const isGoogleDrive = brochure.externalProvider === "GOOGLE_DRIVE";
  return (
    <>
      <a
        className="button button-primary property-brochure-link"
        href={url}
        target={isGoogleDrive ? frameName : undefined}
        referrerPolicy={isGoogleDrive ? "no-referrer" : undefined}
        download={isGoogleDrive ? undefined : "property-brochure.pdf"}
        onClick={() => setDownloadRequested(true)}
      >
        <span aria-hidden="true">↓</span> Download Brochure
      </a>
      {isGoogleDrive ? (
        <iframe
          className="brochure-download-frame"
          name={frameName}
          title="Brochure download"
          aria-hidden="true"
          tabIndex={-1}
          referrerPolicy="no-referrer"
          hidden
        />
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {downloadRequested
          ? "Brochure download requested. The property page will remain open."
          : ""}
      </span>
    </>
  );
}
