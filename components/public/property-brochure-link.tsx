import type { PublicMediaDto } from "@/features/properties/domain/contracts";
import { buildPublicBrochureUrl } from "@/lib/media/public-media-url";

export function PropertyBrochureLink({ brochure }: Readonly<{ brochure: PublicMediaDto }>) {
  const url = buildPublicBrochureUrl(brochure);
  if (!url) return null;
  return (
    <a className="button button-outline mt-5" href={url} target="_blank" rel="noreferrer">
      <span aria-hidden="true">↓</span> Download Brochure
    </a>
  );
}
