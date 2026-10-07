"use client";

import Image from "next/image";
import { useState } from "react";

import type { PublicMediaDto } from "@/features/properties/domain/contracts";
import { buildPublicMediaUrl } from "@/lib/media/public-media-url";

import { PropertyImageFallback } from "./property-image";

export function PropertyGallery({
  media,
  title,
  coverId,
}: Readonly<{ media: readonly PublicMediaDto[]; title: string; coverId?: string | null }>) {
  const images = media
    .filter((item) => (!item.mediaType || item.mediaType === "IMAGE") && item.objectPath)
    .map((item) => ({ ...item, url: buildPublicMediaUrl(item.objectPath) }))
    .filter((item): item is typeof item & { url: string } => Boolean(item.url))
    .sort((left, right) => Number(right.id === coverId) - Number(left.id === coverId));
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="property-gallery property-gallery-empty">
        <PropertyImageFallback />
      </div>
    );
  }

  const current = images[Math.min(selected, images.length - 1)]!;
  const selectPrevious = () =>
    setSelected((currentIndex) => (currentIndex - 1 + images.length) % images.length);
  const selectNext = () => setSelected((currentIndex) => (currentIndex + 1) % images.length);

  return (
    <section className="property-gallery" aria-label="Property image gallery">
      <div className="property-gallery-main">
        <Image
          src={current.url}
          alt={current.altText || `${title} image ${selected + 1}`}
          fill
          sizes="(max-width: 1151px) calc(100vw - 2rem), 1280px"
          loading={selected === 0 ? "eager" : "lazy"}
          className="object-contain"
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              className="gallery-nav gallery-nav-previous"
              aria-label="Show previous property image"
              onClick={selectPrevious}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              className="gallery-nav gallery-nav-next"
              aria-label="Show next property image"
              onClick={selectNext}
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        ) : null}
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
              <Image
                src={image.url}
                alt=""
                fill
                sizes="96px"
                loading={index === 0 ? "eager" : "lazy"}
                className="object-contain"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
