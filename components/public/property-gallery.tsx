"use client";

import Image from "next/image";
import { useState } from "react";

import type { PublicMediaDto } from "@/features/properties/domain/contracts";
import { buildPublicMediaUrl } from "@/lib/media/public-media-url";

import { PropertyImageFallback } from "./property-image";

export function PropertyGallery({
  media,
  title,
}: Readonly<{ media: readonly PublicMediaDto[]; title: string }>) {
  const images = media
    .filter((item) => item.mediaType === "IMAGE" && item.objectPath)
    .map((item) => ({ ...item, url: buildPublicMediaUrl(item.objectPath) }))
    .filter((item): item is typeof item & { url: string } => Boolean(item.url));
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="property-gallery property-gallery-empty">
        <PropertyImageFallback />
      </div>
    );
  }

  const current = images[Math.min(selected, images.length - 1)]!;
  return (
    <section className="property-gallery" aria-label="Property image gallery">
      <div className="property-gallery-main">
        <Image
          src={current.url}
          alt={current.altText || `${title} image ${selected + 1}`}
          fill
          sizes="(max-width: 1023px) 100vw, 820px"
          preload={selected === 0}
          className="object-cover"
        />
        <span className="gallery-count" aria-live="polite">
          {selected + 1} / {images.length}
        </span>
      </div>
      {images.length > 1 ? (
        <div className="property-gallery-thumbs" role="group" aria-label="Choose gallery image">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={index === selected ? "is-active" : ""}
              aria-label={`Show property image ${index + 1}`}
              aria-pressed={index === selected}
              onClick={() => setSelected(index)}
            >
              <Image src={image.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
