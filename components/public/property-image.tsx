import Image from "next/image";

import { buildPublicMediaUrl } from "@/lib/media/public-media-url";

export function PropertyImage({
  objectPath,
  alt,
  sizes,
  preload = false,
  className = "object-cover",
}: Readonly<{
  objectPath: string | null;
  alt: string | null;
  sizes: string;
  preload?: boolean;
  className?: string;
}>) {
  const url = buildPublicMediaUrl(objectPath);
  if (!url) return <PropertyImageFallback />;
  return (
    <Image
      src={url}
      alt={alt || "Land property view"}
      fill
      sizes={sizes}
      preload={preload}
      className={className}
    />
  );
}

export function PropertyImageFallback() {
  return (
    <div className="property-image-fallback" role="img" aria-label="Property image not available">
      <span className="property-image-fallback-mark" aria-hidden="true" />
      <span>Image coming soon</span>
    </div>
  );
}
